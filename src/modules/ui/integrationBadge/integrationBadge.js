import { LightningElement, api } from 'lwc';
import { getDiscoveryMode, subscribeStore } from 'data/store';

/**
 * Discovery Mode annotation for a simulated external touchpoint.
 * Shows the system/flow, direction, and the Phase 1 scope note.
 * Hidden entirely when Discovery Mode is OFF.
 */
export default class IntegrationBadge extends LightningElement {
    /** e.g. "Citeline + ClinicalTrials.gov → MuleSoft → Salesforce" */
    @api label = '';
    /** inbound | outbound | bidirectional | sync */
    @api direction = '';
    /** Phase 1 scope note, rendered under the label. */
    @api note = '';

    visible = getDiscoveryMode();

    connectedCallback() {
        this._unsubscribe = subscribeStore(() => {
            this.visible = getDiscoveryMode();
        });
    }

    disconnectedCallback() {
        this._unsubscribe?.();
    }

    get directionLabel() {
        return this.direction ? this.direction : 'integration';
    }
}
