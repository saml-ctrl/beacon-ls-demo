import { LightningElement, api } from 'lwc';
// Self-contained ESM bundle: keeps mermaid's dependency tree (d3, dagre, …)
// out of the LWC compile pipeline, which its modern syntax breaks.
import mermaid from 'mermaid/dist/mermaid.esm.min.mjs';

let initialized = false;
let counter = 0;

export default class MermaidDiagram extends LightningElement {
    @api code = '';

    _rendered = null;

    renderedCallback() {
        if (this._rendered !== this.code) {
            this._rendered = this.code;
            this.draw();
        }
    }

    async draw() {
        const container = this.template.querySelector('.c-mermaid');
        if (!container || !this.code) return;
        if (!initialized) {
            mermaid.initialize({
                startOnLoad: false,
                theme: 'neutral',
                securityLevel: 'strict',
                fontFamily: 'inherit',
            });
            initialized = true;
        }
        try {
            const { svg } = await mermaid.render(`c-mmd-${++counter}`, this.code);
            container.innerHTML = svg;
        } catch (e) {
            container.textContent = 'Diagram could not be rendered.';
        }
    }
}
