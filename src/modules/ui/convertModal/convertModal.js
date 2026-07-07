import { api } from 'lwc';
import LightningModal from 'lightning/modal';
import { getLead, runDuplicateCheck, convertLead, showToast } from 'data/store';
import { navigate } from '../../../router';

/**
 * Custom one-click Lead Conversion modal (on-demand only — never triggered
 * automatically by a stage). Runs a visible duplicate Account/Contact check,
 * lists everything the single flow creates, validates Close Date (seeded
 * blank), and on success shows a linked-record diagram of what was created.
 */
export default class ConvertModal extends LightningModal {
    @api leadId;

    view = 'form';
    closeDate = '';
    errorMessage = '';
    duplicates = { accounts: [], contacts: [] };
    created = null;

    connectedCallback() {
        const lead = getLead(this.leadId);
        this.closeDate = lead?.proposedCloseDate || '';
        this.duplicates = runDuplicateCheck(this.leadId);
    }

    get isForm() {
        return this.view === 'form';
    }

    get isSuccess() {
        return this.view === 'success';
    }

    get duplicateCount() {
        return this.duplicates.accounts.length + this.duplicates.contacts.length;
    }

    get noDuplicates() {
        return this.duplicateCount === 0;
    }

    get duplicateMessage() {
        return this.noDuplicates
            ? 'No duplicate Accounts or Contacts found.'
            : `${this.duplicateCount} potential duplicate record(s) found — review before converting.`;
    }

    get duplicateIcon() {
        return this.noDuplicates ? 'utility:success' : 'utility:warning';
    }

    get willCreate() {
        return [
            { id: 'opp', icon: 'standard:opportunity', label: 'Opportunity (Sales record type)' },
            { id: 'study', icon: 'standard:study', label: 'Research Study link — NRX-214-202' },
            { id: 'acct', icon: 'standard:account', label: 'Account — Neurocessa Therapeutics' },
            { id: 'sites', icon: 'standard:location', label: 'Clinical Sites (14, ingested — linked)' },
            { id: 'kols', icon: 'standard:contact', label: 'KOL Contacts — Dr. Naomi Kessler, Dr. Elena Vasquez' },
            { id: 'roles', icon: 'standard:team_member', label: 'Opportunity Contact Roles' },
            { id: 'osites', icon: 'standard:study_related', label: 'Opportunity Sites (9 engaged / 5 non-engaged)' },
        ];
    }

    get createdChips() {
        if (!this.created) return [];
        const c = this.created;
        const nonEngaged = c.siteCount - c.engagedCount;
        return [
            { id: 'acct', icon: 'standard:account', label: 'Neurocessa Therapeutics', sub: 'Account (Organization)', path: `/accounts/${c.accountId}` },
            { id: 'con1', icon: 'standard:contact', label: 'Dr. Naomi Kessler', sub: 'KOL Contact', path: `/contacts/${c.contactIds[0]}` },
            { id: 'con2', icon: 'standard:contact', label: 'Dr. Elena Vasquez', sub: 'Principal Investigator', path: `/contacts/${c.contactIds[1]}` },
            { id: 'study', icon: 'standard:study', label: 'NRX-214-202', sub: 'Research Study link', path: `/research-studies/${c.studyId}` },
            { id: 'sites', icon: 'standard:study_related', label: `${c.siteCount} Opportunity Sites`, sub: `${c.engagedCount} engaged / ${nonEngaged} non-engaged`, path: `/opportunities/${c.opportunityId}` },
        ];
    }

    get opportunityPath() {
        return this.created ? `/opportunities/${this.created.opportunityId}` : '';
    }

    handleDateChange(event) {
        this.closeDate = event.target.value;
    }

    handleCancel() {
        this.close();
    }

    handleConvert() {
        const result = convertLead(this.leadId, { closeDate: this.closeDate });
        if (!result.ok) {
            this.errorMessage = result.error;
            showToast({ title: 'Conversion blocked', message: result.error, variant: 'error' });
            const input = this.template.querySelector('lightning-input');
            if (input) {
                input.reportValidity();
            }
            return;
        }
        this.errorMessage = '';
        this.created = result.created;
        this.view = 'success';
    }

    handleChipClick(event) {
        const path = event.currentTarget.dataset.path;
        if (path) {
            navigate(path);
            this.close('converted');
        }
    }

    handleGoToOpportunity() {
        navigate(this.opportunityPath);
        this.close('converted');
    }
}
