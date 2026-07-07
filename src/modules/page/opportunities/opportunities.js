import { LightningElement, track } from 'lwc';
import { navigate } from '../../../router';
import { getOpportunities, subscribeStore } from 'data/store';

const COLUMNS = [
    {
        label: 'Opportunity Name',
        fieldName: 'name',
        type: 'button',
        sortable: true,
        wrapText: true,
        typeAttributes: { label: { fieldName: 'name' }, variant: 'base', name: 'view' },
    },
    { label: 'Account', fieldName: 'accountName', sortable: true },
    { label: 'Stage', fieldName: 'stage', sortable: true, initialWidth: 130 },
    { label: 'Forecast Category', fieldName: 'forecastCategory', sortable: true, initialWidth: 150 },
    { label: 'Amount', fieldName: 'amount', type: 'currency', sortable: true, initialWidth: 130, typeAttributes: { maximumFractionDigits: 0 } },
    { label: 'Close Date', fieldName: 'closeDate', type: 'date-local', sortable: true, initialWidth: 120 },
    { label: 'Owner', fieldName: 'owner', sortable: true, initialWidth: 130 },
    { label: 'Record Type', fieldName: 'recordType', initialWidth: 130 },
    {
        type: 'action',
        typeAttributes: { rowActions: [{ label: 'View', name: 'view' }] },
    },
];

const isOpen = (o) => o.stage !== 'Closed Won' && o.stage !== 'Closed Lost';

const LIST_VIEWS = [
    { value: 'all', label: 'All Opportunities', filter: () => true },
    { value: 'open', label: 'Open Pipeline', filter: isOpen },
    { value: 'my', label: 'My Opportunities (Jordan Reyes)', filter: (o) => o.owner === 'Jordan Reyes' },
    { value: 'commit', label: 'Commit & Best Case', filter: (o) => isOpen(o) && (o.forecastCategory === 'Commit' || o.forecastCategory === 'Best Case') },
    { value: 'contracting', label: 'In Contracting', filter: (o) => o.stage === 'Contracting' },
    { value: 'won', label: 'Closed Won', filter: (o) => o.stage === 'Closed Won' },
    { value: 'co', label: 'Change Orders', filter: (o) => o.recordType === 'Change Order' },
];

export default class Opportunities extends LightningElement {
    columns = COLUMNS;
    listViews = LIST_VIEWS.map(({ value, label }) => ({ value, label }));
    @track rows = [];
    @track activeView = 'all';
    sortedBy = 'closeDate';
    sortedDirection = 'asc';

    connectedCallback() {
        this._unsubscribe = subscribeStore(() => this.refresh());
        this.refresh();
    }

    disconnectedCallback() {
        this._unsubscribe?.();
    }

    refresh() {
        this.rows = getOpportunities().map((o) => ({ ...o }));
        this.sortRows(this.sortedBy, this.sortedDirection);
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
        return `${n} item${n === 1 ? '' : 's'} • Sorted by Close Date • Filtered by ${this.activeViewDef.label} • Updated a few seconds ago`;
    }

    handleViewChange(event) {
        this.activeView = event.detail.value;
    }

    sortRows(fieldName, direction) {
        const rows = [...this.rows];
        rows.sort((a, b) => {
            let av = a[fieldName] ?? '';
            let bv = b[fieldName] ?? '';
            if (typeof av === 'string') {
                av = av.toLowerCase();
                bv = String(bv).toLowerCase();
            }
            if (av < bv) return direction === 'asc' ? -1 : 1;
            if (av > bv) return direction === 'asc' ? 1 : -1;
            return 0;
        });
        this.rows = rows;
    }

    handleSort(event) {
        const { fieldName, sortDirection } = event.detail;
        this.sortedBy = fieldName;
        this.sortedDirection = sortDirection;
        this.sortRows(fieldName, sortDirection);
    }

    handleRowAction(event) {
        navigate(`/opportunities/${event.detail.row.id}`);
    }
}
