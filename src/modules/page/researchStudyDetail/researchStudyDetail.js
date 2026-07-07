import { LightningElement, track } from 'lwc';
import { subscribe, getCurrentRoute, navigate } from '../../../router';
import { getStudy, getAccount, getLead, getOpportunity, subscribeStore } from 'data/store';

const SITE_COLUMNS = [
    {
        label: 'Account Name',
        fieldName: 'name',
        type: 'button',
        typeAttributes: { label: { fieldName: 'name' }, variant: 'base', name: 'view' },
    },
    { label: 'Account Record Type', fieldName: 'recordType', initialWidth: 160 },
    { label: 'Site Network', fieldName: 'parentName', initialWidth: 200 },
    { label: 'City', fieldName: 'city', initialWidth: 130 },
    { label: 'State', fieldName: 'state', initialWidth: 80 },
];

const LEAD_COLUMNS = [
    {
        label: 'Name',
        fieldName: 'name',
        type: 'button',
        typeAttributes: { label: { fieldName: 'name' }, variant: 'base', name: 'view' },
    },
    { label: 'Role', fieldName: 'role', initialWidth: 170 },
    { label: 'Company', fieldName: 'company' },
    { label: 'Status', fieldName: 'status', initialWidth: 110 },
    { label: 'Owner', fieldName: 'owner', initialWidth: 130 },
];

export default class ResearchStudyDetail extends LightningElement {
    siteColumns = SITE_COLUMNS;
    leadColumns = LEAD_COLUMNS;
    @track study = null;
    @track sites = [];
    @track leads = [];
    @track opportunity = null;

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
        const study = id ? getStudy(id) : null;
        this.study = study ? { ...study } : null;
        this.sites = study
            ? study.siteIds
                  .map((sid) => getAccount(sid))
                  .filter(Boolean)
                  .map((a) => ({
                      ...a,
                      parentName: a.parentAccountId ? getAccount(a.parentAccountId)?.name || '' : '',
                  }))
            : [];
        this.leads = study ? study.leadIds.map((lid) => getLead(lid)).filter(Boolean).map((l) => ({ ...l })) : [];
        this.opportunity = study && study.opportunityId ? getOpportunity(study.opportunityId) : null;
    }

    get hasStudy() {
        return !!this.study;
    }

    get headerFields() {
        const s = this.study;
        if (!s) return [];
        return [
            { label: 'Sponsor', value: s.sponsor },
            { label: 'Phase', value: s.phase },
            { label: 'Indication', value: s.indication },
            { label: 'Registry ID', value: s.registryId },
            { label: 'ICP Score', value: String(s.icpScore) },
            { label: 'Status', value: s.status },
        ];
    }

    get isUnassigned() {
        return this.study?.status === 'Unassigned';
    }

    get ingestedAtFormatted() {
        return this.study?.ingestedAt ? new Date(this.study.ingestedAt).toLocaleString() : '';
    }

    /** Representative Research Study fields for the Details tab. */
    get detailFields() {
        const s = this.study;
        if (!s) return [];
        return [
            { label: 'Study Name', value: s.name, fullWidth: true },
            { label: 'Sponsor', value: s.sponsor },
            { label: 'Sponsor Tier', value: s.sponsorTier },
            { label: 'Compound', value: s.compound },
            { label: 'Indication', value: s.indication },
            { label: 'Phase', value: s.phase },
            { label: 'Clinical Sites', value: String(s.siteCount) },
            { label: 'Registry ID', value: s.registryId },
            { label: 'Citeline ID', value: s.citelineId },
            { label: 'ICP Score', value: String(s.icpScore) },
            { label: 'ICP Fit (rules-based Flow)', value: s.icpFlag, type: 'checkbox' },
            { label: 'Status', value: s.status },
            { label: 'Assigned To', value: s.assignedTo || '—' },
            { label: 'Ingested At', value: this.ingestedAtFormatted },
            { label: 'Ingest Source', value: s.ingestSource, fullWidth: true },
        ];
    }

    get opportunityMeta() {
        const o = this.opportunity;
        if (!o) return '';
        return `${o.stage} • $${Number(o.amount || 0).toLocaleString('en-US')} • Owner: ${o.owner}`;
    }

    handleSiteRowAction(event) {
        navigate(`/accounts/${event.detail.row.id}`);
    }

    handleLeadRowAction(event) {
        navigate(`/leads/${event.detail.row.id}`);
    }

    handleGoToIntake() {
        navigate('/intake');
    }

    handleGoToOpportunity() {
        if (this.opportunity) {
            navigate(`/opportunities/${this.opportunity.id}`);
        }
    }

    handleBackToList() {
        navigate('/research-studies');
    }
}
