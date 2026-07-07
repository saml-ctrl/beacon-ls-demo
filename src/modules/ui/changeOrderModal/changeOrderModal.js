import LightningModal from 'lightning/modal';
import { IDS, createChangeOrder } from 'data/store';
import { navigate } from '../../../router';

/**
 * "Log Schedule Extension Notification" — creates the Change Order
 * opportunity (Change Order record type) linked to the parent opportunity
 * and Exhibit A, pre-populated with time-based line items only.
 */
export default class ChangeOrderModal extends LightningModal {
    handleCancel() {
        this.close();
    }

    handleConfirm() {
        const result = createChangeOrder();
        if (result.ok) {
            navigate(`/opportunities/${IDS.changeOrder}`);
            this.close('created');
        }
    }
}
