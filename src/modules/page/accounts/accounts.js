import { LightningElement, track } from 'lwc';
import { navigate } from '../../../router';
import { IDS, getAccounts, getAccount, subscribeStore } from 'data/store';

const COLUMNS = [
    {
        label: 'Account Name',
        fieldName: 'name',
        type: 'button',
        sortable: true,
        wrapText: true,
        typeAttributes: { label: { fieldName: 'name' }, variant: 'base', name: 'view' },
    },
    { label: 'Record Type', fieldName: 'recordType', sortable: true, initialWidth: 140 },
    { label: 'Parent Account', fieldName: 'parentName', sortable: true, initialWidth: 200 },
    { label: 'City', fieldName: 'city', sortable: true, initialWidth: 140 },
    { label: 'State', fieldName: 'state', initialWidth: 80 },
    { label: 'Tier', fieldName: 'tier' },
    { label: 'Phone', fieldName: 'phone', type: 'phone', initialWidth: 150 },
    {
        type: 'action',
        typeAttributes: { rowActions: [{ label: 'View', name: 'view' }] },
    },
];

const LIST_VIEWS = [
    { value: 'all', label: 'All Accounts', filter: () => true },
    { value: 'orgs', label: 'Sponsor Organizations', filter: (a) => a.recordType === 'Organization' && a.organizationType !== 'Site Network' },
    { value: 'networks', label: 'Site Networks', filter: (a) => a.organizationType === 'Site Network' },
    { value: 'sites', label: 'Clinical Sites', filter: (a) => a.recordType === 'Clinical Site' },
    { value: 'roster', label: 'NRX-214-202 Site Roster', filter: (a) => a.recordType === 'Clinical Site' && a.studyId === IDS.study },
];

export default class Accounts extends LightningElement {
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
        this.rows = getAccounts().map((a) => ({
            ...a,
            parentName: a.parentAccountId ? (getAccount(a.parentAccountId)?.name || '') : '',
        }));
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
        return `${n} item${n === 1 ? '' : 's'} • Sorted by Account Name • Filtered by ${this.activeViewDef.label} • Updated a few seconds ago`;
    }

    handleViewChange(event) {
        this.activeView = event.detail.value;
    }

    sortRows(fieldName, direction) {
        const rows = [...this.rows];
        rows.sort((a, b) => {
            let av = (a[fieldName] ?? '').toString().toLowerCase();
            let bv = (b[fieldName] ?? '').toString().toLowerCase();
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
        navigate(`/accounts/${event.detail.row.id}`);
    }
}
