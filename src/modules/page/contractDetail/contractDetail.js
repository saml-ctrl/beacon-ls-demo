import { LightningElement, track } from 'lwc';
import { subscribe, getCurrentRoute, navigate } from '../../../router';
import {
    getContract,
    getOpportunity,
    contractUpload,
    contractTag,
    contractSend,
    contractSimulateSponsor,
    subscribeStore,
    showToast,
} from 'data/store';

const FILE_COLUMNS = [
    { label: 'File Name', fieldName: 'name', wrapText: true },
    { label: 'Type', fieldName: 'kind', initialWidth: 90 },
    { label: 'Added', fieldName: 'added', initialWidth: 200 },
];

/** Adobe Acrobat Sign preparation steps shown in the progress indicator. */
const SIGN_STEPS = [
    { label: 'Upload document', value: 'upload' },
    { label: 'Tag signature fields', value: 'tag' },
    { label: 'Send for signature', value: 'send' },
];

export default class ContractDetail extends LightningElement {
    fileColumns = FILE_COLUMNS;
    signSteps = SIGN_STEPS;

    @track contract = null;
    @track files = [];
    opportunityName = '';

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
        const contract = id ? getContract(id) : null;
        this.contract = contract ? { ...contract } : null;
        this.files = contract
            ? contract.files.map((f) => ({ ...f, added: new Date(f.addedAt).toLocaleString() }))
            : [];
        this.opportunityName = contract ? (getOpportunity(contract.oppId)?.name || '') : '';
    }

    get hasContract() {
        return !!this.contract;
    }

    get headerFields() {
        const c = this.contract;
        if (!c) return [];
        return [
            { label: 'Opportunity', value: this.opportunityName },
            { label: 'Type', value: c.type },
            { label: 'Status', value: c.status },
            { label: 'Exhibit', value: c.exhibit || '—' },
        ];
    }

    /** Representative Contract fields for the Details section. */
    get detailFields() {
        const c = this.contract;
        if (!c) return [];
        return [
            { label: 'Contract Name', value: c.name, fullWidth: true },
            { label: 'Opportunity', value: this.opportunityName },
            { label: 'Type', value: c.type },
            { label: 'Status', value: c.status },
            { label: 'Exhibit', value: c.exhibit || '—' },
            { label: 'Sent At', value: this.sentAtFormatted || '—' },
            { label: 'Viewed At', value: this.viewedAtFormatted || '—' },
            { label: 'Signed At', value: this.signedAtFormatted || '—' },
        ];
    }

    /** Current preparation step for the base progress indicator. */
    get currentSignStep() {
        switch (this.contract?.status) {
            case 'Draft':
                return 'upload';
            case 'Uploaded':
                return 'tag';
            default:
                return 'send';
        }
    }

    get isDraft() {
        return this.contract?.status === 'Draft';
    }

    get isUploaded() {
        return this.contract?.status === 'Uploaded';
    }

    get isTagged() {
        return this.contract?.status === 'Tagged';
    }

    get isSent() {
        return this.contract?.status === 'Sent';
    }

    get isViewed() {
        return this.contract?.status === 'Viewed';
    }

    get isSigned() {
        return this.contract?.status === 'Signed';
    }

    get showSponsorAction() {
        return this.isSent || this.isViewed;
    }

    get sponsorActionLabel() {
        return this.isSent
            ? 'Simulate Sponsor Action — sponsor views'
            : 'Simulate Sponsor Action — sponsor signs';
    }

    get sentAtFormatted() {
        return this.contract?.sentAt ? new Date(this.contract.sentAt).toLocaleString() : '';
    }

    get viewedAtFormatted() {
        return this.contract?.viewedAt ? new Date(this.contract.viewedAt).toLocaleString() : '';
    }

    get signedAtFormatted() {
        return this.contract?.signedAt ? new Date(this.contract.signedAt).toLocaleString() : '';
    }

    handleUpload() {
        this.report(contractUpload(this.contract.id));
    }

    handleTag() {
        this.report(contractTag(this.contract.id));
    }

    handleSend() {
        this.report(contractSend(this.contract.id));
    }

    handleSponsorAction() {
        this.report(contractSimulateSponsor(this.contract.id));
    }

    report(result) {
        if (result && !result.ok) {
            showToast({ title: 'Adobe Acrobat Sign', message: result.error, variant: 'warning' });
        }
    }

    handleGoToOpportunity() {
        if (this.contract) {
            navigate(`/opportunities/${this.contract.oppId}`);
        }
    }

    handleGoToOpportunities() {
        navigate('/opportunities');
    }

    handleGoToLeads() {
        navigate('/leads');
    }
}
