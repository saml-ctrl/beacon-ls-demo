import { api } from 'lwc';
import LightningModal from 'lightning/modal';
import { addProduct, updateProduct } from 'data/store';

const CATALOG = [
    'Device & Logistics Services',
    'Clinical Operations Support (site-month)',
    'Beacon Platform: Core Tier (Trial Insights Hub + Biosignal Studio + Quality Suite + Sleep Analytics Suite)',
    'Scientific Services Base Package',
    'Scientific PM (monthly retainer)',
    'Interim Analysis Report (add-on)',
];

/**
 * Add / edit an Opportunity Product line item. Flexible line items —
 * editable quantity and amount; the total is a simple sum (the store keeps
 * the Opportunity Amount in sync).
 */
export default class ProductModal extends LightningModal {
    /** 'add' | 'edit' */
    @api mode = 'add';
    @api oppId;
    /** Existing line item when mode === 'edit'. */
    @api product;

    name = '';
    quantity = 1;
    amount = 0;

    connectedCallback() {
        if (this.mode === 'edit' && this.product) {
            this.name = this.product.product;
            this.quantity = this.product.quantity;
            this.amount = this.product.amount;
        } else {
            this.name = CATALOG[0];
        }
    }

    get isAdd() {
        return this.mode === 'add';
    }

    get heading() {
        return this.isAdd ? 'Add Product' : 'Edit Product';
    }

    get catalogOptions() {
        return CATALOG.map((p) => ({ label: p, value: p }));
    }

    handleNameChange(event) {
        this.name = event.detail.value;
    }

    handleQuantityChange(event) {
        this.quantity = event.target.value;
    }

    handleAmountChange(event) {
        this.amount = event.target.value;
    }

    handleCancel() {
        this.close();
    }

    handleSave() {
        if (this.isAdd) {
            addProduct(this.oppId, { product: this.name, quantity: this.quantity, amount: this.amount });
        } else {
            updateProduct(this.product.id, { quantity: this.quantity, amount: this.amount });
        }
        this.close('saved');
    }
}
