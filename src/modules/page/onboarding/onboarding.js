import { LightningElement, track } from 'lwc';
import { subscribe, getCurrentRoute, navigate } from '../../../router';
import {
    getOpportunity,
    getOnboarding,
    getAllTasks,
    sendOnboardingForm,
    setProjectRole,
    completeKickoff,
    assignExhibit,
    setCostInfo,
    subscribeStore,
    showToast,
} from 'data/store';

const RECIPIENT_OPTIONS = [
    { label: 'Dr. Naomi Kessler — VP, Clinical Development', value: 'Dr. Naomi Kessler' },
    { label: 'Dr. Elena Vasquez — Principal Investigator (Lakeshore)', value: 'Dr. Elena Vasquez' },
    { label: 'Neurocessa Clinical Ops (ops@neurocessa.example)', value: 'Neurocessa Clinical Ops' },
];

const EXHIBIT_OPTIONS = [
    { label: 'Exhibit A', value: 'Exhibit A' },
    { label: 'Exhibit B', value: 'Exhibit B' },
    { label: 'Exhibit C', value: 'Exhibit C' },
];

export default class Onboarding extends LightningElement {
    recipientOptions = RECIPIENT_OPTIONS;
    exhibitOptions = EXHIBIT_OPTIONS;

    @track opp = null;
    @track ob = null;
    @track fallbackTask = null;
    recipient = '';
    exhibitLetter = '';
    projectName = '';

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
        const ob = getOnboarding();
        this.ob = {
            ...ob,
            roles: { ...ob.roles },
            exhibit: { ...ob.exhibit },
            costInfo: { ...ob.costInfo },
        };
        this.fallbackTask = ob.fallbackTaskId
            ? getAllTasks().find((t) => t.id === ob.fallbackTaskId) || null
            : null;
        if (!this.exhibitLetter) this.exhibitLetter = ob.exhibit.letter || 'Exhibit A';
        if (!this.projectName) this.projectName = ob.exhibit.projectName || '';
    }

    get hasOpp() {
        return !!this.opp;
    }

    get isClosedWon() {
        return this.opp?.stage === 'Closed Won';
    }

    get locked() {
        return this.hasOpp && !this.isClosedWon;
    }

    get headerFields() {
        return [
            { label: 'Opportunity', value: this.opp?.name || '' },
            { label: 'Kickoff', value: this.ob?.kickoffComplete ? 'Complete' : 'In progress' },
        ];
    }

    /* ---- (a) Client Onboarding Form ---- */

    get formFallback() {
        return this.ob?.formStatus === 'No recipient defined — task created';
    }

    get formSent() {
        return this.ob?.formStatus === 'Sent';
    }

    get formStatusLabel() {
        return `Status: ${this.ob?.formStatus || 'Not Sent'}`;
    }

    handleRecipientChange(event) {
        this.recipient = event.detail.value;
    }

    handleSendForm() {
        const result = sendOnboardingForm(this.recipient);
        if (!result.ok) {
            showToast({ title: 'Onboarding form', message: result.error, variant: 'error' });
        }
    }

    /* ---- (b) Key Project Roles ---- */

    handleRoleChange(event) {
        setProjectRole(event.target.dataset.role, event.target.value);
    }

    handleCompleteKickoff() {
        const result = completeKickoff();
        if (!result.ok) {
            showToast({ title: 'Kickoff incomplete', message: result.error, variant: 'error' });
        }
    }

    /* ---- (c) Exhibit assignment ---- */

    handleExhibitChange(event) {
        this.exhibitLetter = event.detail.value;
    }

    handleProjectNameChange(event) {
        this.projectName = event.target.value;
    }

    handleAssignExhibit() {
        assignExhibit({
            letter: this.exhibitLetter,
            sow: this.ob.exhibit.sow,
            projectName: this.projectName,
        });
    }

    /* ---- (d) Cost Info ---- */

    handleSaveCostInfo() {
        const fields = {};
        this.template.querySelectorAll('[data-cost]').forEach((input) => {
            fields[input.dataset.cost] = input.value;
        });
        setCostInfo(fields);
        showToast({ title: 'Cost Info saved', message: 'Cost Info fields saved to the Opportunity / Project.', variant: 'success' });
    }

    /* ---- nav ---- */

    handleGoToOpp() {
        if (this.opp) navigate(`/opportunities/${this.opp.id}`);
    }

    handleGoToHandoff() {
        if (this.opp) navigate(`/opportunities/${this.opp.id}/handoff`);
    }

    handleBackToList() {
        navigate('/opportunities');
    }
}
