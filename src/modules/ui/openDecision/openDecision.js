import { LightningElement, api } from 'lwc';
import { getDiscoveryMode, subscribeStore } from 'data/store';

/**
 * Amber "Open Decision" chip for Discovery Mode. Expands on click to show the
 * undecided design question. Hidden entirely when Discovery Mode is OFF.
 * Hand-rolled chip (no Lightning Base Component covers an expandable pill).
 */
export default class OpenDecision extends LightningElement {
    /** Short label, e.g. "Research Study object model" */
    @api title = '';
    /** Expanded body text describing the open question. */
    @api body = '';

    expanded = false;
    visible = getDiscoveryMode();

    connectedCallback() {
        this._unsubscribe = subscribeStore(() => {
            this.visible = getDiscoveryMode();
        });
    }

    disconnectedCallback() {
        this._unsubscribe?.();
    }

    get expandedString() {
        return this.expanded ? 'true' : 'false';
    }

    get chevronIcon() {
        return this.expanded ? 'utility:chevronup' : 'utility:chevrondown';
    }

    handleToggle() {
        this.expanded = !this.expanded;
    }
}
