import { LightningElement, track } from 'lwc';
import { subscribe, getCurrentRoute, navigate } from '../../../router';
import { getLead, getStudy, enrichLead, subscribeStore } from 'data/store';
import ConvertModal from 'ui/convertModal';

export default class LeadDetail extends LightningElement {
    @track lead = null;
    @track engagement = [];
    studyName = '';

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
        const lead = id ? getLead(id) : null;
        this.lead = lead ? { ...lead } : null;
        this.engagement = lead
            ? lead.mcae.map((e) => ({ ...e, time: new Date(e.date).toLocaleString() }))
            : [];
        this.studyName = lead && lead.studyId ? (getStudy(lead.studyId)?.name || '') : '';
    }

    get hasLead() {
        return !!this.lead;
    }

    get headerFields() {
        const l = this.lead;
        if (!l) return [];
        return [
            { label: 'Title', value: l.title },
            { label: 'Company', value: l.company },
            { label: 'Role', value: l.role },
            { label: 'Lead Owner', value: l.owner || '—' },
            { label: 'Status', value: l.status },
        ];
    }

    get enrichLabel() {
        return this.lead?.enriched ? 'Enriched with Clay ✓' : 'Enrich with Clay';
    }

    get enrichDisabled() {
        return !!this.lead?.enriched;
    }

    get convertDisabled() {
        return !!this.lead?.converted;
    }

    get enrichedAtFormatted() {
        return this.lead?.enrichedAt ? new Date(this.lead.enrichedAt).toLocaleString() : '';
    }

    get engagementScoreLabel() {
        return `Engagement score: ${this.lead?.engagementScore ?? 0}`;
    }

    /** Representative Lead fields for the Details tab. */
    get detailFields() {
        const l = this.lead;
        if (!l) return [];
        return [
            { label: 'Name', value: l.name },
            { label: 'Title', value: l.title },
            { label: 'Company', value: l.company },
            { label: 'Role', value: l.role },
            { label: 'Lead Status', value: l.status },
            { label: 'Lead Owner', value: l.owner || '—' },
            { label: 'Email', value: l.email, type: 'email' },
            { label: 'Phone', value: l.phone, type: 'tel' },
            { label: 'LinkedIn', value: l.linkedin },
            { label: 'Engagement Score', value: String(l.engagementScore ?? 0) },
            { label: 'Enriched (Clay)', value: l.enriched, type: 'checkbox' },
            { label: 'Research Study', value: this.studyName },
        ];
    }

    get hasEngagement() {
        return this.engagement.length > 0;
    }

    get convertedLinks() {
        const ids = this.lead?.convertedIds;
        if (!ids) return [];
        return [
            { id: 'acct', label: 'Account', path: `/accounts/${ids.accountId}` },
            { id: 'con', label: 'Contact', path: `/contacts/${ids.contactId}` },
            { id: 'opp', label: 'Opportunity', path: `/opportunities/${ids.opportunityId}` },
        ];
    }

    handleEnrich() {
        enrichLead(this.lead.id);
    }

    async handleConvert() {
        await ConvertModal.open({ size: 'medium', leadId: this.lead.id });
    }

    handleConvertedLink(event) {
        navigate(event.currentTarget.dataset.path);
    }

    handleStudyClick() {
        if (this.lead?.studyId) {
            navigate(`/research-studies/${this.lead.studyId}`);
        }
    }

    handleBackToList() {
        navigate('/leads');
    }
}
