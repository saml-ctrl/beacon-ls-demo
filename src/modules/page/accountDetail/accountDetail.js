import { LightningElement, track } from 'lwc';
import { subscribe, getCurrentRoute, navigate } from '../../../router';
import {
    getAccount,
    getContacts,
    getOpportunities,
    getStudy,
    getState,
    subscribeStore,
} from 'data/store';

const CONTACT_COLUMNS = [
    {
        label: 'Name',
        fieldName: 'name',
        type: 'button',
        typeAttributes: { label: { fieldName: 'name' }, variant: 'base', name: 'view' },
    },
    { label: 'Title', fieldName: 'title' },
    { label: 'Role', fieldName: 'role', initialWidth: 170 },
    { label: 'Email', fieldName: 'email', type: 'email' },
];

const OPP_COLUMNS = [
    {
        label: 'Opportunity',
        fieldName: 'name',
        type: 'button',
        wrapText: true,
        typeAttributes: { label: { fieldName: 'name' }, variant: 'base', name: 'view' },
    },
    { label: 'Stage', fieldName: 'stage', initialWidth: 130 },
    { label: 'Amount', fieldName: 'amount', type: 'currency', initialWidth: 130, typeAttributes: { maximumFractionDigits: 0 } },
    { label: 'Close Date', fieldName: 'closeDate', type: 'date-local', initialWidth: 120 },
];

const ENGAGEMENT_COLUMNS = [
    {
        label: 'Opportunity',
        fieldName: 'oppName',
        type: 'button',
        wrapText: true,
        typeAttributes: { label: { fieldName: 'oppName' }, variant: 'base', name: 'view' },
    },
    { label: 'Engagement Status', fieldName: 'status', initialWidth: 160 },
    { label: 'PI', fieldName: 'pi' },
];

export default class AccountDetail extends LightningElement {
    contactColumns = CONTACT_COLUMNS;
    oppColumns = OPP_COLUMNS;
    engagementColumns = ENGAGEMENT_COLUMNS;

    @track account = null;
    @track contacts = [];
    @track opportunities = [];
    @track engagements = [];
    @track study = null;

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
        const account = id ? getAccount(id) : null;
        this.account = account ? { ...account } : null;
        if (!account) return;
        this.contacts = getContacts()
            .filter((c) => c.accountId === account.id)
            .map((c) => ({ ...c }));
        this.opportunities = getOpportunities()
            .filter((o) => o.accountId === account.id)
            .map((o) => ({ ...o }));
        this.engagements = getState()
            .opportunitySites.filter((s) => s.siteAccountId === account.id)
            .map((s) => {
                const opp = getOpportunities().find((o) => o.id === s.oppId);
                return { ...s, oppName: opp ? opp.name : s.oppId };
            });
        this.study = account.studyId ? getStudy(account.studyId) : null;
    }

    get hasAccount() {
        return !!this.account;
    }

    get isClinicalSite() {
        return this.account?.recordType === 'Clinical Site';
    }

    get isOrganization() {
        return this.account?.recordType === 'Organization';
    }

    get headerIcon() {
        return this.isClinicalSite ? 'standard:location' : 'standard:account';
    }

    get headerFields() {
        const a = this.account;
        if (!a) return [];
        const fields = [
            { label: 'Record Type', value: a.recordType },
            { label: 'City', value: a.city },
            { label: 'State', value: a.state },
        ];
        if (a.phone) fields.push({ label: 'Phone', value: a.phone });
        if (a.website) fields.push({ label: 'Website', value: a.website });
        if (a.tier) fields.push({ label: 'Tier', value: a.tier });
        return fields;
    }

    /** Representative Account fields for the Details tab. */
    get detailFields() {
        const a = this.account;
        if (!a) return [];
        return [
            { label: 'Account Name', value: a.name, fullWidth: true },
            { label: 'Record Type', value: a.recordType },
            { label: 'Tier', value: a.tier || '—' },
            { label: 'Phone', value: a.phone || '—', type: 'tel' },
            { label: 'Website', value: a.website || '—' },
            { label: 'City', value: a.city },
            { label: 'State', value: a.state },
            { label: 'Description', value: a.description, type: 'textarea', fullWidth: true },
        ];
    }

    handleContactRowAction(event) {
        navigate(`/contacts/${event.detail.row.id}`);
    }

    handleOppRowAction(event) {
        navigate(`/opportunities/${event.detail.row.id}`);
    }

    handleEngagementRowAction(event) {
        navigate(`/opportunities/${event.detail.row.oppId}`);
    }

    handleStudyClick() {
        if (this.study) {
            navigate(`/research-studies/${this.study.id}`);
        }
    }

    handleBackToList() {
        navigate('/accounts');
    }
}
