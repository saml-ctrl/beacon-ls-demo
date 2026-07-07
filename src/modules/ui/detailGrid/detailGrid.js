import { LightningElement, api } from 'lwc';

/**
 * Two-column read-only field grid for record Details sections, mirroring the
 * Lightning record page detail layout.
 *
 * fields: [{ label, value, type?: 'text'|'email'|'tel'|'textarea'|'checkbox',
 *            fullWidth?: boolean }]
 */
export default class DetailGrid extends LightningElement {
    _fields = [];

    @api
    get fields() {
        return this._fields;
    }
    set fields(value) {
        this._fields = Array.isArray(value) ? value : [];
    }

    get normalized() {
        return this._fields.map((f, i) => ({
            key: `field-${i}`,
            label: f.label,
            value: f.value != null ? String(f.value) : '',
            type: f.type === 'email' || f.type === 'tel' ? f.type : 'text',
            isTextarea: f.type === 'textarea',
            isCheckbox: f.type === 'checkbox',
            checked: !!f.value,
            colClass: f.fullWidth
                ? 'slds-col slds-size_1-of-1'
                : 'slds-col slds-size_1-of-1 slds-medium-size_1-of-2',
        }));
    }
}
