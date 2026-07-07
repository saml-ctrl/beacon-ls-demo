import { LightningElement, api } from 'lwc';

/**
 * Related list section for record pages: lightning-card with the object icon,
 * item count in the title, an optional header action button, and a
 * lightning-datatable body.
 *
 * Events:
 *  - headeraction — the header button was clicked
 *  - rowaction    — re-dispatched lightning-datatable row action
 */
export default class RelatedList extends LightningElement {
    @api title = '';
    @api iconName = '';
    @api keyField = 'id';
    @api actionLabel = '';
    @api emptyMessage = 'No records to display.';

    _columns = [];
    _rows = [];

    @api
    get columns() {
        return this._columns;
    }
    set columns(value) {
        this._columns = Array.isArray(value) ? value : [];
    }

    @api
    get rows() {
        return this._rows;
    }
    set rows(value) {
        this._rows = Array.isArray(value) ? value : [];
    }

    get heading() {
        return `${this.title} (${this._rows.length})`;
    }

    get hasRows() {
        return this._rows.length > 0;
    }

    handleHeaderAction() {
        this.dispatchEvent(new CustomEvent('headeraction'));
    }

    handleRowAction(event) {
        this.dispatchEvent(
            new CustomEvent('rowaction', {
                detail: { action: event.detail.action, row: event.detail.row },
            })
        );
    }
}
