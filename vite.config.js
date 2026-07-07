import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';
import lwc from 'vite-plugin-lwc';
import {
  resolveIconTemplatesPlugin,
  iconTemplateExcludeDirs,
  iconTemplateAliases,
} from './vite-plugins/icon-templates.js';

/** LBC ships templates that trip many LWC diagnostics; app code cannot fix those. */
const LBC_UNDER_NODE_MODULES = /node_modules[/\\]lightning-base-components[/\\]/;

function isLightningBaseComponentsLwcRollupWarning(warning) {
  const locFile = warning.loc?.file ?? '';
  const id = warning.id ?? '';
  const message = warning.message ?? '';
  return (
    LBC_UNDER_NODE_MODULES.test(String(locFile)) ||
    LBC_UNDER_NODE_MODULES.test(String(id)) ||
    LBC_UNDER_NODE_MODULES.test(String(message))
  );
}

/**
 * Windows fix: @lwc/rollup-plugin resolves missing implicit component
 * templates (e.g. lightning/datatable has datatable.js but no datatable.html)
 * to a virtual "@lwc/resources/empty_html.js" id built with path.sep. On
 * Windows the backslash id doesn't round-trip through Vite's id
 * normalization, so the raw ".html?import" request 404s and the whole module
 * graph fails ("stuck at Loading…"). This plugin intercepts implicit template
 * imports whose .html file doesn't exist and serves the same empty module the
 * LWC plugin would have served ("export default void 0"). On POSIX systems it
 * simply front-runs the identical built-in behavior.
 */
function implicitLwcTemplateFallbackPlugin() {
  const VIRTUAL_ID = '\0lwc-implicit-empty-template.js';
  let root = process.cwd();
  return {
    name: 'lwc-implicit-template-fallback',
    enforce: 'pre',
    configResolved(config) {
      root = config.root;
    },
    resolveId(source, importer) {
      if (!importer) return null;
      const cleanSource = source.split('?')[0];
      if (!cleanSource.endsWith('.html')) return null;
      const cleanImporter = importer.split('?')[0];
      // Implicit template import: ./name.html imported by .../name.js
      const sourceBase = path.basename(cleanSource, '.html');
      const importerBase = path.basename(cleanImporter, path.extname(cleanImporter));
      if (sourceBase !== importerBase) return null;
      const candidate = cleanSource.startsWith('/')
        ? path.join(root, cleanSource)
        : path.resolve(path.dirname(cleanImporter), cleanSource);
      if (fs.existsSync(candidate)) return null;
      return VIRTUAL_ID;
    },
    load(id) {
      if (id === VIRTUAL_ID) {
        return 'export default void 0;';
      }
      return null;
    },
  };
}

function suppressLbcLwcLoggerNoisePlugin() {
  return {
    name: 'suppress-lbc-lwc-logger-noise',
    configResolved(config) {
      const { logger } = config;
      const origWarn = logger.warn.bind(logger);
      logger.warn = (msg, options) => {
        if (LBC_UNDER_NODE_MODULES.test(String(msg))) return;
        origWarn(msg, options);
      };
      const origWarnOnce = logger.warnOnce.bind(logger);
      logger.warnOnce = (msg, options) => {
        if (LBC_UNDER_NODE_MODULES.test(String(msg))) return;
        origWarnOnce(msg, options);
      };
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [
    implicitLwcTemplateFallbackPlugin(),
    suppressLbcLwcLoggerNoisePlugin(),
    resolveIconTemplatesPlugin(),
    lwc({
      modules: [
        {
          dir: path.resolve('./src/modules'),
        },
        {
          name: '@salesforce/gate/bc.260.enableComboboxElementInternals',
          path: path.resolve('./src/build/shim/gateComboboxElementInternalsClosed.js'),
        },
        {
          npm: 'lightning-base-components',
        },
      ],
      disableSyntheticShadowSupport: false,
      enableDynamicComponents: true,
      exclude: [
        path.resolve('./index.html'),
        /loading\.css/,
        path.resolve('./src/build/generated'),
        // Global SLDS from node_modules (new URL in slds-loader.js) must not pass through LWC:
        // LWC rejects :root in this pipeline when synthetic shadow is enabled.
        /(salesforce-lightning-design-system\.min\.css|slds2\.cosmos\.css)(\?.*)?$/,
        // Global styles loaded via new URL() pattern must also bypass LWC plugin
        /\/styles\/global\.css(\?.*)?$/,
        // Mermaid (diagram rendering) is plain ESM, not LWC — its modern syntax
        // (static class blocks) breaks the LWC babel transform.
        /node_modules[/\\]mermaid[/\\]/,
        ...iconTemplateExcludeDirs,
      ],
    }),
  ],
  build: {
    rollupOptions: {
      onwarn(warning, defaultHandler) {
        if (isLightningBaseComponentsLwcRollupWarning(warning)) return;
        defaultHandler(warning);
      },
    },
  },
  appType: 'spa',
  server: {
    port: 3000,
    open: false,
  },
  optimizeDeps: {
    exclude: ['lightning/modal', 'lightning/toast', 'lightning/toastContainer', 'lightning/showToastEvent', 'lightning/primitiveOverlay', 'lightning/overlayUtils', 'lightning/modalBase', 'lightning/utilsPrivate'],
  },
  resolve: {
    alias: {
      '@salesforce-ux/design-system': path.resolve('./node_modules/@salesforce-ux/design-system'),
      '@salesforce-ux/design-system-2': path.resolve('./node_modules/@salesforce-ux/design-system-2'),
      ...iconTemplateAliases,
    },
  },
});
