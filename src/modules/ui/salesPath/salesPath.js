import { LightningElement, api, track } from 'lwc';

/**
 * Sales Path built on lightning-progress-indicator type="path" (available in
 * the OSS lightning-base-components package). Click-to-select is implemented
 * via the bubbling `stepfocus` event the path steps emit on click/focus.
 *
 * Events:
 *  - stageselect  detail: { stage }  — a stage chevron was clicked (selected)
 *  - setstage     detail: { stage }  — "Mark as Current Stage" clicked
 *
 * The "Mark Stage as Complete" action lives in the host page's header,
 * mirroring real Sales Path behavior.
 */
export default class SalesPath extends LightningElement {
    @api currentStage = '';
    /** Set when the opportunity is Closed Lost — path shows a lost banner. */
    @api closedLost = false;

    _stages = [];
    @track selectedName = '';

    @api
    get stages() {
        return this._stages;
    }
    set stages(value) {
        this._stages = Array.isArray(value) ? value : [];
    }

    get pathCurrentStep() {
        return this.closedLost ? '' : this.currentStage;
    }

    get selected() {
        const name = this.selectedName || this.currentStage;
        return this._stages.find((s) => s.name === name) || null;
    }

    get selectedForecastLabel() {
        return this.selected ? `Forecast Category: ${this.selected.forecast}` : '';
    }

    get selectedIsCurrent() {
        return (this.selectedName || this.currentStage) === this.currentStage;
    }

    get showMarkCurrent() {
        return !this.selectedIsCurrent && !this.closedLost;
    }

    get guidanceHeading() {
        return this.selected ? `Stage guidance: ${this.selected.name}` : '';
    }

    handleStepFocus(event) {
        const index = event.detail?.index;
        const stage = this._stages[index];
        if (stage) {
            this.selectedName = stage.name;
            this.dispatchEvent(new CustomEvent('stageselect', { detail: { stage: stage.name } }));
        }
    }

    handleMarkCurrent() {
        const target = this.selectedName;
        if (target) {
            this.dispatchEvent(new CustomEvent('setstage', { detail: { stage: target } }));
        }
    }
}
