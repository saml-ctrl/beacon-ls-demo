import { api } from 'lwc';
import LightningModal from 'lightning/modal';
import { BD_REPS, approveAndAssignStudy } from 'data/store';

/**
 * "Approve & Assign" modal for the Trial Intake & Triage dashboard.
 * Assignment is a human BD step — never automated prioritization.
 */
export default class AssignRepModal extends LightningModal {
    @api study;

    selectedRep = '';

    get repOptions() {
        return BD_REPS.map((rep) => ({ label: rep, value: rep }));
    }

    get confirmDisabled() {
        return !this.selectedRep;
    }

    get studyMeta() {
        if (!this.study) return '';
        return `Sponsor: ${this.study.sponsor} • ${this.study.phase} • ICP Score: ${this.study.icpScore}`;
    }

    handleRepChange(event) {
        this.selectedRep = event.detail.value;
    }

    handleCancel() {
        this.close();
    }

    handleAssign() {
        const result = approveAndAssignStudy(this.study.id, this.selectedRep);
        if (result.ok) {
            this.close('assigned');
        }
    }
}
