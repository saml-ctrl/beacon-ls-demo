import { LightningElement, track } from 'lwc';
import { navigate } from '../../../router';
import { getLeads, subscribeStore } from 'data/store';

const COLUMNS = [
    {
        label: 'Name',
        fieldName: 'name',
        type: 'button',
        sortable: true,
        typeAttributes: { label: { fieldName: 'name' }, variant: 'base', name: 'view' },
    },
    { label: 'Title', fieldName: 'title' },
    { label: 'Company', fieldName: 'company', sortable: true },
    { label: 'Role', fieldName: 'role', initialWidth: 170 },
    { label: 'Status', fieldName: 'status', sortable: true, initialWidth: 110 },
    { label: 'Owner', fieldName: 'owner', initialWidth: 130 },
    { label: 'Enriched', fieldName: 'enriched', type: 'boolean', initialWidth: 100 },
    { label: 'Engagement', fieldName: 'engagementScore', type: 'number', sortable: true, initialWidth: 120 },
    {
        type: 'action',
        typeAttributes: { rowActions: [{ label: 'View', name: 'view' }] },
    },
];

const LIST_VIEWS = [
    { value: 'all', label: 'All Leads', filter: () => true },
    { value: 'my', label: 'My Leads (Jordan Reyes)', filter: (l) => l.owner === 'Jordan Reyes' },
    { value: 'kol', label: 'KOL Contacts', filter: (l) => l.role === 'KOL Contact' },
    { value: 'pi', label: 'Principal Investigators (PIs)', filter: (l) => l.role === 'Principal Investigator' },
    { value: 'enriched', label: 'Enriched via Clay', filter: (l) => !!l.enriched },
    { value: 'converted', label: 'Converted Leads', filter: (l) => !!l.converted },
];

export default class Leads extends LightningElement {
    columns = COLUMNS;
    listViews = LIST_VIEWS.map(({ value, label }) => ({ value, label }));
    @track rows = [];
    @track activeView = 'all';
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
        this.rows = getLeads().map((l) => ({ ...l }));
    }

    get activeViewDef() {
        return LIST_VIEWS.find((v) => v.value === this.activeView) || LIST_VIEWS[0];
    }

    get activeViewLabel() {
        return this.activeViewDef.label;
    }

    get viewRows() {
        return this.rows.filter(this.activeViewDef.filter);
    }

    get metaText() {
        const n = this.viewRows.length;
        return `${n} item${n === 1 ? '' : 's'} • Sorted by Name • Filtered by ${this.activeViewDef.label} • Updated a few seconds ago`;
    }

    handleViewChange(event) {
        this.activeView = event.detail.value;
    }

    handleSort(event) {
        const { fieldName, sortDirection } = event.detail;
        this.sortedBy = fieldName;
        this.sortedDirection = sortDirection;
        const rows = [...this.rows];
        rows.sort((a, b) => {
            let av = a[fieldName] ?? '';
            let bv = b[fieldName] ?? '';
            if (typeof av === 'string') {
                av = av.toLowerCase();
                bv = String(bv).toLowerCase();
            }
            if (av < bv) return sortDirection === 'asc' ? -1 : 1;
            if (av > bv) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
        this.rows = rows;
    }

    handleRowAction(event) {
        navigate(`/leads/${event.detail.row.id}`);
    }
}
