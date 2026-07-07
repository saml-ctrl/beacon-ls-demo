import { LightningElement, track } from 'lwc';
import { subscribe, getCurrentRoute, navigate } from '../../../router';
import {
    getOpportunity,
    getAsana,
    getTasksFor,
    getSlackChannels,
    assignProgramManager,
    advanceAsanaStatus,
    subscribeStore,
    showToast,
} from 'data/store';

const PM_OPTIONS = [
    { label: 'Sam Okafor — ClinOps Program Manager', value: 'Sam Okafor' },
    { label: 'Renee Caldwell — ClinOps Program Manager', value: 'Renee Caldwell' },
    { label: 'Diego Fuentes — ClinOps Program Manager', value: 'Diego Fuentes' },
];

const STATUS_FLOW = ['Onboarding', 'Active', 'Late Stage: Renewal Window'];

export default class Handoff extends LightningElement {
    pmOptions = PM_OPTIONS;

    @track opp = null;
    @track asana = null;
    @track renewalTask = null;
    @track postSowChannel = null;
    selectedPm = '';

    connectedCallback() {
        this._unsubRoute = subscribe(() => this.load());
        this._unsubStore = subscribeStore(() => this.load());
        this.load();
    }

    disconnectedCallback() {
        this._unsubRoute?.();
        this._unsubStore?.();
    }

    load() {
        const id = getCurrentRoute()?.params?.id;
        const opp = id ? getOpportunity(id) : null;
        this.opp = opp ? { ...opp } : null;
        const asana = getAsana();
        this.asana = {
            ...asana,
            history: (asana.statusHistory || []).map((h, i) => ({
                id: `h${i}`,
                status: h.status,
                time: new Date(h.at).toLocaleString(),
            })),
        };
        this.renewalTask = opp
            ? getTasksFor(opp.id).find((t) => t.subject.startsWith('Project entering renewal window')) || null
            : null;
        this.postSowChannel =
            getSlackChannels().find((c) => c.name === '#ls-neurocessa-p1') || null;
        if (this.postSowChannel) {
            this.postSowChannel = {
                ...this.postSowChannel,
                memberLabel: this.postSowChannel.members.join(', '),
                messageList: this.postSowChannel.messages.map((m) => ({
                    ...m,
                    time: new Date(m.ts).toLocaleString(),
                })),
            };
        }
    }

    get hasOpp() {
        return !!this.opp;
    }

    get notCreated() {
        return !this.asana?.created;
    }

    get headerFields() {
        return [
            { label: 'Opportunity', value: this.opp?.name || '' },
            { label: 'Asana ID', value: this.asana?.asanaId || '—' },
            { label: 'Project Status', value: this.asana?.status || 'Not Created' },
        ];
    }

    get statusChips() {
        const current = this.asana?.status;
        return STATUS_FLOW.map((status, i) => ({
            id: `s${i}`,
            label: status,
            cssClass:
                status === current
                    ? 'c-handoff-chip c-handoff-chip_current'
                    : 'c-handoff-chip',
        }));
    }

    get atFinalStatus() {
        return this.asana?.status === 'Late Stage: Renewal Window';
    }

    get pmAssigned() {
        return !!this.asana?.pmAssigned;
    }

    get pmSyncedLabel() {
        return `${this.asana.pmAssigned} — assigned in Salesforce and synced to Asana (matched on ${this.asana.asanaId}).`;
    }

    handlePmChange(event) {
        this.selectedPm = event.detail.value;
    }

    handleAssignPm() {
        const result = assignProgramManager(this.selectedPm);
        if (!result.ok) {
            showToast({ title: 'Asana', message: result.error, variant: 'error' });
        }
    }

    handleAdvanceStatus() {
        const result = advanceAsanaStatus();
        if (!result.ok) {
            showToast({ title: 'Asana', message: result.error, variant: 'info' });
        }
    }

    handleGoToOpp() {
        if (this.opp) navigate(`/opportunities/${this.opp.id}`);
    }

    handleBackToList() {
        navigate('/opportunities');
    }
}
