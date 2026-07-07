import { LightningElement, track } from 'lwc';
import { navigate } from '../../../router';
import { getStudies, getTriageQueue, subscribeStore } from 'data/store';
import AssignRepModal from 'ui/assignRepModal';

const TRIAGE_COLUMNS = [
    {
        label: 'Study Name',
        fieldName: 'name',
        type: 'button',
        wrapText: true,
        typeAttributes: { label: { fieldName: 'name' }, variant: 'base', name: 'view' },
    },
    { label: 'Sponsor', fieldName: 'sponsor' },
    { label: 'Indication', fieldName: 'indication' },
    { label: 'Phase', fieldName: 'phase', initialWidth: 100 },
    { label: 'ICP Score', fieldName: 'icpScore', type: 'number', initialWidth: 100 },
    { label: 'ICP Fit', fieldName: 'icpFlag', type: 'boolean', initialWidth: 90 },
    { label: 'Citeline ID', fieldName: 'citelineId', initialWidth: 110 },
    { label: 'Registry ID', fieldName: 'registryId', initialWidth: 150 },
    {
        type: 'action',
        typeAttributes: {
            rowActions: [
                { label: 'Approve & Assign', name: 'assign' },
                { label: 'View', name: 'view' },
            ],
        },
    },
];

const ASSIGNED_COLUMNS = [
    {
        label: 'Study Name',
        fieldName: 'name',
        type: 'button',
        wrapText: true,
        typeAttributes: { label: { fieldName: 'name' }, variant: 'base', name: 'view' },
    },
    { label: 'Sponsor', fieldName: 'sponsor' },
    { label: 'Indication', fieldName: 'indication' },
    { label: 'Assigned To', fieldName: 'assignedTo' },
    {
        type: 'action',
        typeAttributes: { rowActions: [{ label: 'View', name: 'view' }] },
    },
];

export default class Intake extends LightningElement {
    triageColumns = TRIAGE_COLUMNS;
    assignedColumns = ASSIGNED_COLUMNS;
    @track queue = [];
    @track assigned = [];

    connectedCallback() {
        this._unsubscribe = subscribeStore(() => this.refresh());
        this.refresh();
    }

    disconnectedCallback() {
        this._unsubscribe?.();
    }

    refresh() {
        this.queue = getTriageQueue().map((s) => ({ ...s }));
        this.assigned = getStudies()
            .filter((s) => s.status === 'Assigned')
            .map((s) => ({ ...s }));
    }

    get metaText() {
        const n = this.queue.length;
        return `${n} item${n === 1 ? '' : 's'} • Qualified, unassigned • Updated a few seconds ago`;
    }

    get hasQueue() {
        return this.queue.length > 0;
    }

    async handleRowAction(event) {
        const { action, row } = event.detail;
        if (action.name === 'view') {
            navigate(`/research-studies/${row.id}`);
        } else if (action.name === 'assign') {
            await AssignRepModal.open({ size: 'small', study: row });
        }
    }

    handleAssignedRowAction(event) {
        navigate(`/research-studies/${event.detail.row.id}`);
    }

    handleGoToStudies() {
        navigate('/research-studies');
    }
}
