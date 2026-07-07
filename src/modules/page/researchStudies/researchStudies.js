import { LightningElement, track } from 'lwc';
import { navigate } from '../../../router';
import { getStudies, subscribeStore } from 'data/store';

const COLUMNS = [
    {
        label: 'Study Name',
        fieldName: 'name',
        type: 'button',
        sortable: true,
        wrapText: true,
        typeAttributes: { label: { fieldName: 'name' }, variant: 'base', name: 'view' },
    },
    { label: 'Sponsor', fieldName: 'sponsor', sortable: true },
    { label: 'Indication', fieldName: 'indication', sortable: true },
    { label: 'Phase', fieldName: 'phase', sortable: true, initialWidth: 100 },
    { label: 'Sites', fieldName: 'siteCount', type: 'number', initialWidth: 80 },
    { label: 'ICP Score', fieldName: 'icpScore', type: 'number', sortable: true, initialWidth: 100 },
    { label: 'Status', fieldName: 'status', sortable: true, initialWidth: 110 },
    { label: 'Assigned To', fieldName: 'assignedTo' },
    {
        type: 'action',
        typeAttributes: {
            rowActions: [
                { label: 'View', name: 'view' },
                { label: 'View Opportunity', name: 'viewOpp' },
            ],
        },
    },
];

const LIST_VIEWS = [
    { value: 'all', label: 'All Research Studies', filter: () => true },
    { value: 'triage', label: 'Intake Triage — Unassigned', filter: (s) => s.status === 'Unassigned' },
    { value: 'my', label: 'My Studies (Jordan Reyes)', filter: (s) => s.assignedTo === 'Jordan Reyes' },
    { value: 'icp', label: 'ICP Fit — Qualified', filter: (s) => !!s.icpFlag },
    { value: 'linked', label: 'With Opportunities', filter: (s) => !!s.opportunityId },
];

export default class ResearchStudies extends LightningElement {
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
        this.rows = getStudies().map((s) => ({ ...s }));
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
        return `${n} item${n === 1 ? '' : 's'} • Sorted by Study Name • Filtered by ${this.activeViewDef.label} • Updated a few seconds ago`;
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
        const { action, row } = event.detail;
        if (action.name === 'viewOpp' && row.opportunityId) {
            navigate(`/opportunities/${row.opportunityId}`);
        } else {
            navigate(`/research-studies/${row.id}`);
        }
    }

    handleGoToIntake() {
        navigate('/intake');
    }
}
