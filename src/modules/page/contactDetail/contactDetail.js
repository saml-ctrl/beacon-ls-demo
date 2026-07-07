import { LightningElement, track } from 'lwc';
import { subscribe, getCurrentRoute, navigate } from '../../../router';
import { getContact, getOpportunities, getState, subscribeStore } from 'data/store';

export default class ContactDetail extends LightningElement {
    @track contact = null;
    @track engagement = [];
    @track relatedOpps = [];

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
        const contact = id ? getContact(id) : null;
        this.contact = contact ? { ...contact } : null;
        this.engagement = contact
            ? (contact.mcae || []).map((e) => ({ ...e, time: new Date(e.date).toLocaleString() }))
            : [];
        this.relatedOpps = contact
            ? getState()
                  .opportunityContactRoles.filter((r) => r.contactId === contact.id)
                  .map((r) => {
                      const opp = getOpportunities().find((o) => o.id === r.oppId);
                      return { id: r.id, oppId: r.oppId, role: r.role, oppName: opp ? opp.name : r.oppId };
                  })
            : [];
    }

    get hasContact() {
        return !!this.contact;
    }

    get headerFields() {
        const c = this.contact;
        if (!c) return [];
        return [
            { label: 'Title', value: c.title },
            { label: 'Account', value: c.accountName },
            { label: 'Role', value: c.role },
            { label: 'Email', value: c.email },
            { label: 'Phone', value: c.phone },
        ];
    }

    get hasEngagement() {
        return this.engagement.length > 0;
    }

    /** Representative Contact fields for the Details tab. */
    get detailFields() {
        const c = this.contact;
        if (!c) return [];
        return [
            { label: 'Name', value: c.name },
            { label: 'Title', value: c.title },
            { label: 'Account', value: c.accountName },
            { label: 'Role', value: c.role },
            { label: 'Email', value: c.email, type: 'email' },
            { label: 'Phone', value: c.phone, type: 'tel' },
            { label: 'LinkedIn', value: c.linkedin || '—' },
            { label: 'Enriched (Clay)', value: c.enriched, type: 'checkbox' },
        ];
    }

    get hasRelatedOpps() {
        return this.relatedOpps.length > 0;
    }

    handleAccountClick() {
        if (this.contact?.accountId) {
            navigate(`/accounts/${this.contact.accountId}`);
        }
    }

    handleOppClick(event) {
        navigate(`/opportunities/${event.currentTarget.dataset.oppId}`);
    }

    handleBackToList() {
        navigate('/contacts');
    }
}
