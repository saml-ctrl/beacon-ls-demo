import { LightningElement, api, track } from 'lwc';
import { getAuditTrailForContract, subscribeStore } from 'data/store';

/**
 * Shield Field Audit Trail viewer for a Contract — timestamped,
 * immutable-looking, append-only entries.
 */
export default class AuditTrail extends LightningElement {
    _contractId = '';
    @track entries = [];

    @api
    get contractId() {
        return this._contractId;
    }
    set contractId(value) {
        this._contractId = value;
        this.refresh();
    }

    connectedCallback() {
        this._unsubscribe = subscribeStore(() => this.refresh());
        this.refresh();
    }

    disconnectedCallback() {
        this._unsubscribe?.();
    }

    refresh() {
        this.entries = getAuditTrailForContract(this._contractId).map((entry) => ({
            ...entry,
            time: new Date(entry.timestamp).toLocaleString(),
            change: `${entry.field}: ${entry.oldValue} → ${entry.newValue}`,
        }));
    }

    get hasEntries() {
        return this.entries.length > 0;
    }
}
