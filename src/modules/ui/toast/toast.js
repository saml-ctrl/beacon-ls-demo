import { LightningElement, track } from 'lwc';
import { subscribeToasts } from 'data/store';

/**
 * Lightning-style toast container. Hand-rolled slds-notify toast blueprint:
 * platform toast events (lightning/platformShowToastEvent) are not available
 * off-platform, so this listens to the demo store's toast bus instead.
 */
const ICONS = {
    success: 'utility:success',
    info: 'utility:info',
    warning: 'utility:warning',
    error: 'utility:error',
};

const AUTO_DISMISS_MS = 5000;

export default class Toast extends LightningElement {
    @track toasts = [];

    connectedCallback() {
        this._unsubscribe = subscribeToasts((toast) => this.addToast(toast));
    }

    disconnectedCallback() {
        this._unsubscribe?.();
    }

    addToast(toast) {
        const variant = ICONS[toast.variant] ? toast.variant : 'info';
        this.toasts = [
            ...this.toasts,
            {
                ...toast,
                iconName: ICONS[variant],
                notifyClass: `slds-notify slds-notify_toast slds-theme_${variant}`,
            },
        ];
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(() => this.dismiss(toast.id), AUTO_DISMISS_MS);
    }

    dismiss(id) {
        this.toasts = this.toasts.filter((t) => t.id !== id);
    }

    handleClose(event) {
        this.dismiss(event.currentTarget.dataset.id);
    }
}
