/**
 * Windows compatibility patch for @lwc/rollup-plugin (runs from postinstall).
 *
 * Two upstream bugs break the kit on Windows because Vite module ids always
 * use forward slashes while the plugin assumes platform separators:
 *
 * 1. Component namespace/name detection splits the file path on `path.sep`
 *    ("\\" on Windows), so every component compiles with name="" and
 *    `lwc:component lwc:is` dynamic mounting (the router outlet) renders
 *    nothing.
 * 2. The virtual fallback ids for missing implicit templates/stylesheets
 *    ("@lwc/resources/empty_html.js") are joined with `path.sep`, so the id
 *    doesn't round-trip through Vite on Windows and the module graph 404s
 *    ("stuck at Loading…").
 *
 * The patch is idempotent and a no-op once applied (or if upstream fixes it).
 * No network access required.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const target = path.resolve(here, '../node_modules/@lwc/rollup-plugin/dist/index.js');

if (!fs.existsSync(target)) {
    console.log('[patch-lwc-windows] @lwc/rollup-plugin not found; skipping.');
    process.exit(0);
}

let src = fs.readFileSync(target, 'utf8');
const before = src;

// 1. Namespace/name detection: split on either separator.
src = src.replace(
    "path.dirname(filename).split(path.sep).slice(-2)",
    "path.dirname(filename).split(/[\\\\/]/).slice(-2)"
);

// 2. Virtual empty-module ids: always use forward slashes.
src = src.replace(
    "const IMPLICIT_DEFAULT_HTML_PATH = ['@lwc', 'resources', 'empty_html.js'].join(path.sep);",
    "const IMPLICIT_DEFAULT_HTML_PATH = ['@lwc', 'resources', 'empty_html.js'].join('/');"
);
src = src.replace(
    "const IMPLICIT_DEFAULT_CSS_PATH = ['@lwc', 'resources', 'empty_css.css'].join(path.sep);",
    "const IMPLICIT_DEFAULT_CSS_PATH = ['@lwc', 'resources', 'empty_css.css'].join('/');"
);

if (src === before) {
    console.log('[patch-lwc-windows] Already patched (or patterns not found); nothing to do.');
} else {
    fs.writeFileSync(target, src);
    console.log('[patch-lwc-windows] Patched @lwc/rollup-plugin for Windows path handling.');
}
