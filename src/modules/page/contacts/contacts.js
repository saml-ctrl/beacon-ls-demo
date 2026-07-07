import { LightningElement, track } from 'lwc';
import { navigate } from '../../../router';
import { getContacts, subscribeStore } from 'data/store';

const COLUMNS = [
    {
        label: 'Name',
        fieldName: 'name',
        type: 'button',
        sortable: true,
        typeAttributes: { label: { fieldName: 'name' }, variant: 'base', name: 'view' },
    },
    { label: 'Title', fieldName: 'title' },
    { label: 'Account', fieldName: 'accountName', sortable: true },
    { label: 'Role', fieldName: 'role', initialWidth: 180 },
    { label: 'Email', fieldName: 'email', type: 'email' },
    { label: 'Phone', fieldName: 'phone', type: 'phone', initialWidth: 140 },
    { label: 'Enriched', fieldName: 'enriched', type: 'boolean', initialWidth: 100 },
    {
        type: 'action',
        typeAttributes: { rowActions: [{ label: 'View', name: 'view' }] },
    },
];

const LIST_VIEWS = [
    { value: 'all', label: 'All Contacts', filter: () => true },
    { value: 'kol', label: 'KOL Contacts', filter: (c) => c.role === 'KOL Contact' },
    { value: 'pi', label: 'Principal Investigators (PIs)', filter: (c) => c.role === 'Principal Investigator' },
    { value: 'enriched', label: 'Enriched via Clay', filter: (c) => !!c.enriched },
];

export default class Contacts extends LightningElement {
    columns = COLUMNS;
    listViews = LIST_VIEWS.map(({ value, label }) => ({ value, label }));
    @track rows = [];
    @track activeView = 'all';
    searchTerm = '';
    sortedBy = 'name';
    sortedDirection = 'asc';

    connectedCallback() {
        this._unsubscribe = subscribeStore(() => this.refresh());
        this.refresh();
    }

    disconnectedCallback() {
        this._unsubscribe?.();
    }

    refresh() {
        this.rows = getContacts().map((c) => ({ ...c }));
    }

    get activeViewDef() {
        return LIST_VIEWS.find((v) => v.value === this.activeView) || LIST_VIEWS[0];
    }

    get activeViewLabel() {
        return this.activeViewDef.label;
    }

    get filteredRows() {
        let rows = this.rows.filter(this.activeViewDef.filter);
        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            rows = rows.filter(
                (c) =>
                    c.name.toLowerCase().includes(term) ||
                    (c.accountName || '').toLowerCase().includes(term) ||
                    (c.title || '').toLowerCase().includes(term)
            );
        }
        return rows;
    }

    get metaText() {
        const n = this.filteredRows.length;
        return `${n} item${n === 1 ? '' : 's'} • Sorted by Name • Filtered by ${this.activeViewDef.label} • Updated a few seconds ago`;
    }

    handleViewChange(event) {
        this.activeView = event.detail.value;
    }

    handleSearch(event) {
        this.searchTerm = event.detail.value;
    }

    handleSort(event) {
        const { fieldName, sortDirection } = event.detail;
        this.sortedBy = fieldName;
        this.sortedDirection = sortDirection;
        const rows = [...this.rows];
        rows.sort((a, b) => {
            const av = (a[fieldName] ?? '').toString().toLowerCase();
            const bv = (b[fieldName] ?? '').toString().toLowerCase();
            if (av < bv) return sortDirection === 'asc' ? -1 : 1;
            if (av > bv) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
        this.rows = rows;
    }

    handleRowAction(event) {
        navigate(`/contacts/${event.detail.row.id}`);
    }
}
