import { LightningElement, api } from 'lwc';

/**
 * Lightning-style list view selector for object home pages. Drops into the
 * page header's "switcher" slot (the chevron next to the list view title).
 *
 * views: [{ value, label }]
 * Fires 'viewchange' with detail: { value } on selection.
 */
export default class ListViewSwitcher extends LightningElement {
    _views = [];
    @api activeView = '';

    @api
    get views() {
        return this._views;
    }
    set views(value) {
        this._views = Array.isArray(value) ? value : [];
    }

    get items() {
        return this._views.map((v) => ({
            ...v,
            checked: v.value === this.activeView,
        }));
    }

    handleSelect(event) {
        this.dispatchEvent(
            new CustomEvent('viewchange', { detail: { value: event.detail.value } })
        );
    }
}
