import { LightningElement, track } from 'lwc';
import { subscribe, getCurrentRoute, navigate } from '../../../router';
import {
    IDS,
    STAGES,
    CHANGE_ORDER_STAGES,
    TEAM_ROLES,
    getOpportunity,
    getOpportunities,
    getProductsForOpp,
    getProductTotal,
    getTeamForOpp,
    getSitesForOpp,
    getContactRolesForOpp,
    getContractsForOpp,
    getActivitiesFor,
    getTasksFor,
    subscribeStore,
    setOpportunityStage,
    markStageComplete,
    markAwardLetter,
    setCboReviewed,
    updateProduct,
    removeProduct,
    addTeamMember,
    removeTeamMember,
    showToast,
} from 'data/store';
import ProductModal from 'ui/productModal';
import ChangeOrderModal from 'ui/changeOrderModal';

const PRODUCT_COLUMNS = [
    { label: 'Product', fieldName: 'product', wrapText: true },
    { label: 'Quantity', fieldName: 'quantity', type: 'number', editable: true, initialWidth: 110 },
    { label: 'Amount', fieldName: 'amount', type: 'currency', editable: true, initialWidth: 150, typeAttributes: { maximumFractionDigits: 0 } },
    { label: 'Note', fieldName: 'note', wrapText: true },
    {
        type: 'action',
        typeAttributes: {
            rowActions: [
                { label: 'Edit', name: 'edit' },
                { label: 'Delete', name: 'delete' },
            ],
        },
    },
];

const SITE_COLUMNS = [
    {
        label: 'Clinical Site',
        fieldName: 'siteName',
        type: 'button',
        wrapText: true,
        typeAttributes: { label: { fieldName: 'siteName' }, variant: 'base', name: 'view' },
    },
    { label: 'Engagement Status', fieldName: 'status', initialWidth: 160 },
    { label: 'PI', fieldName: 'pi' },
    { label: 'City', fieldName: 'city', initialWidth: 120 },
    { label: 'State', fieldName: 'state', initialWidth: 80 },
];

const CONTACT_ROLE_COLUMNS = [
    {
        label: 'Contact',
        fieldName: 'contactName',
        type: 'button',
        typeAttributes: { label: { fieldName: 'contactName' }, variant: 'base', name: 'view' },
    },
    { label: 'Role', fieldName: 'role' },
];

const CONTRACT_COLUMNS = [
    {
        label: 'Contract',
        fieldName: 'name',
        type: 'button',
        wrapText: true,
        typeAttributes: { label: { fieldName: 'name' }, variant: 'base', name: 'view' },
    },
    { label: 'Type', fieldName: 'type', initialWidth: 130 },
    { label: 'Status', fieldName: 'status', initialWidth: 110 },
    { label: 'Exhibit', fieldName: 'exhibit', initialWidth: 100 },
];

export default class OpportunityDetail extends LightningElement {
    productColumns = PRODUCT_COLUMNS;
    siteColumns = SITE_COLUMNS;
    contactRoleColumns = CONTACT_ROLE_COLUMNS;
    contractColumns = CONTRACT_COLUMNS;

    @track opp = null;
    @track products = [];
    @track team = [];
    @track sites = [];
    @track contactRoles = [];
    @track contracts = [];
    @track activities = [];
    @track tasks = [];
    @track changeOrder = null;
    productDrafts = [];
    newMemberName = '';
    newMemberRole = '';

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
        if (!opp) return;
        this.products = getProductsForOpp(opp.id).map((p) => ({ ...p }));
        this.team = getTeamForOpp(opp.id).map((t) => ({ ...t }));
        this.sites = getSitesForOpp(opp.id).map((s) => ({ ...s }));
        this.contactRoles = getContactRolesForOpp(opp.id).map((r) => ({ ...r }));
        this.contracts = getContractsForOpp(opp.id).map((c) => ({ ...c }));
        this.activities = getActivitiesFor(opp.id).map((a) => ({
            ...a,
            time: new Date(a.date).toLocaleString(),
        }));
        this.tasks = getTasksFor(opp.id).map((t) => ({ ...t }));
        this.changeOrder =
            opp.recordType === 'Sales'
                ? getOpportunities().find((o) => o.parentOpportunityId === opp.id) || null
                : null;
    }

    /* ---------- layout switches ---------- */

    get hasOpp() {
        return !!this.opp;
    }

    get isSales() {
        return this.opp?.recordType === 'Sales';
    }

    get isChangeOrder() {
        return this.opp?.recordType === 'Change Order';
    }

    get isClosedWon() {
        return this.opp?.stage === 'Closed Won';
    }

    get isClosedLost() {
        return this.opp?.stage === 'Closed Lost';
    }

    get stages() {
        return this.isChangeOrder ? CHANGE_ORDER_STAGES : STAGES;
    }

    get objectLabel() {
        return this.isChangeOrder ? 'Opportunity — Change Order' : 'Opportunity';
    }

    /* ---------- header ---------- */

    get amountFormatted() {
        return '$' + Number(this.opp?.amount || 0).toLocaleString('en-US');
    }

    get headerFields() {
        const o = this.opp;
        if (!o) return [];
        if (this.isChangeOrder) {
            const parent = getOpportunity(o.parentOpportunityId);
            return [
                { label: 'Parent Opportunity', value: parent ? parent.name : '—' },
                { label: 'Exhibit', value: o.exhibit || '—' },
                { label: 'Account', value: o.accountName },
                { label: 'Amount', value: this.amountFormatted },
                { label: 'Close Date', value: o.closeDate },
                { label: 'Owner', value: o.owner },
            ];
        }
        return [
            { label: 'Account', value: o.accountName },
            { label: 'Close Date', value: o.closeDate },
            { label: 'Amount', value: this.amountFormatted },
            { label: 'Stage', value: o.stage },
            { label: 'Forecast Category', value: o.forecastCategory },
            { label: 'Owner', value: o.owner },
        ];
    }

    /** Representative Opportunity fields for the Details tab, per record type. */
    get detailFields() {
        const o = this.opp;
        if (!o) return [];
        if (this.isChangeOrder) {
            const parent = getOpportunity(o.parentOpportunityId);
            return [
                { label: 'Opportunity Name', value: o.name, fullWidth: true },
                { label: 'Record Type', value: o.recordType },
                { label: 'Parent Opportunity', value: parent ? parent.name : '—' },
                { label: 'Exhibit', value: o.exhibit || '—' },
                { label: 'Account', value: o.accountName },
                { label: 'Stage', value: o.stage },
                { label: 'Forecast Category', value: o.forecastCategory },
                { label: 'Amount', value: this.amountFormatted },
                { label: 'Close Date', value: o.closeDate },
                { label: 'Owner (BD / KAM)', value: o.owner },
                { label: 'Contract Status', value: o.contractStatus },
                { label: 'Description', value: o.description, type: 'textarea', fullWidth: true },
            ];
        }
        return [
            { label: 'Opportunity Name', value: o.name, fullWidth: true },
            { label: 'Record Type', value: o.recordType },
            { label: 'Account', value: o.accountName },
            { label: 'Stage', value: o.stage },
            { label: 'Forecast Category', value: o.forecastCategory },
            { label: 'Amount', value: this.amountFormatted },
            { label: 'Close Date', value: o.closeDate },
            { label: 'Owner (BD / KAM)', value: o.owner },
            { label: 'Next Step', value: o.nextStep || '—' },
            { label: 'Award Letter Received', value: o.awardLetterReceived, type: 'checkbox' },
            { label: 'CBO Review Approved', value: o.cboReviewed, type: 'checkbox' },
            { label: 'Contract Status', value: o.contractStatus },
            { label: 'Description', value: o.description, type: 'textarea', fullWidth: true },
        ];
    }

    get showAwardLetterButton() {
        return this.isSales && !this.opp.awardLetterReceived && !this.isClosedWon && !this.isClosedLost;
    }

    get awardLetterReceived() {
        return !!this.opp?.awardLetterReceived;
    }

    get markCompleteDisabled() {
        return this.isClosedWon || this.isClosedLost;
    }

    /* ---------- stage handling ---------- */

    handleMarkStageComplete() {
        const result = markStageComplete(this.opp.id);
        if (!result.ok) {
            showToast({ title: 'Cannot change stage', message: result.error, variant: 'error' });
        }
    }

    handleSetStage(event) {
        const result = setOpportunityStage(this.opp.id, event.detail.stage);
        if (!result.ok) {
            showToast({ title: 'Cannot change stage', message: result.error, variant: 'error' });
        }
    }

    handleAwardLetter() {
        markAwardLetter(this.opp.id);
    }

    handleCboChange(event) {
        setCboReviewed(this.opp.id, event.target.checked);
    }

    /* ---------- products ---------- */

    get productsHeading() {
        return `Opportunity Products (${this.products.length})`;
    }

    get productTotalLabel() {
        return 'Total: $' + Number(getProductTotal(this.opp?.id || '')).toLocaleString('en-US') + ' — simple sum of line items';
    }

    get hasProducts() {
        return this.products.length > 0;
    }

    async handleAddProduct() {
        await ProductModal.open({ size: 'small', mode: 'add', oppId: this.opp.id });
    }

    async handleProductRowAction(event) {
        const { action, row } = event.detail;
        if (action.name === 'delete') {
            removeProduct(row.id);
        } else if (action.name === 'edit') {
            await ProductModal.open({ size: 'small', mode: 'edit', oppId: this.opp.id, product: row });
        }
    }

    handleProductSave(event) {
        const drafts = event.detail.draftValues || [];
        drafts.forEach((draft) => {
            updateProduct(draft.id, {
                quantity: draft.quantity !== undefined ? draft.quantity : undefined,
                amount: draft.amount !== undefined ? draft.amount : undefined,
            });
        });
        this.productDrafts = [];
    }

    /* ---------- team ---------- */

    get teamHeading() {
        return `Opportunity Team (${this.team.length})`;
    }

    get roleOptions() {
        return TEAM_ROLES.map((r) => ({ label: r, value: r }));
    }

    get addMemberDisabled() {
        return !this.newMemberName || !this.newMemberRole;
    }

    handleMemberNameChange(event) {
        this.newMemberName = event.target.value;
    }

    handleMemberRoleChange(event) {
        this.newMemberRole = event.detail.value;
    }

    handleAddMember() {
        const result = addTeamMember(this.opp.id, { name: this.newMemberName, role: this.newMemberRole });
        if (result.ok) {
            this.newMemberName = '';
            this.newMemberRole = '';
        }
    }

    handleRemoveMember(event) {
        removeTeamMember(event.currentTarget.dataset.id);
    }

    /* ---------- related navigation ---------- */

    handleSiteRowAction(event) {
        navigate(`/accounts/${event.detail.row.siteAccountId}`);
    }

    handleContactRowAction(event) {
        navigate(`/contacts/${event.detail.row.contactId}`);
    }

    handleContractRowAction(event) {
        navigate(`/contracts/${event.detail.row.id}`);
    }

    /* ---------- closed won / change order ---------- */

    get hasTasks() {
        return this.tasks.length > 0;
    }

    get hasActivities() {
        return this.activities.length > 0;
    }

    handleGoToOnboarding() {
        navigate(`/opportunities/${this.opp.id}/onboarding`);
    }

    handleGoToHandoff() {
        navigate(`/opportunities/${this.opp.id}/handoff`);
    }

    async handleLogExtension() {
        await ChangeOrderModal.open({ size: 'medium' });
    }

    handleGoToChangeOrder() {
        if (this.changeOrder) {
            navigate(`/opportunities/${this.changeOrder.id}`);
        }
    }

    get parentOpp() {
        return this.isChangeOrder ? getOpportunity(this.opp.parentOpportunityId) : null;
    }

    handleGoToParent() {
        const parent = this.parentOpp;
        if (parent) {
            navigate(`/opportunities/${parent.id}`);
        }
    }

    get isJourneySalesOpp() {
        return this.opp?.id === IDS.opp;
    }

    handleBackToList() {
        navigate('/opportunities');
    }
}
