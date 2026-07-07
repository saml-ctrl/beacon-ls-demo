import { LightningElement, track } from 'lwc';
import { navigate } from '../../../router';
import { journeySteps, getDemoStep, setDemoStep, subscribeStore, reset, showToast } from 'data/store';

/**
 * Docked presenter bar (styled after the SLDS docked utility bar blueprint —
 * hand-rolled because no Lightning Base Component exists for the utility bar).
 * Ordered journey steps 0–11 as numbered chips, Back / Next navigation, and
 * Reset Demo. Rendered on every page by shell-app.
 */
export default class PresenterBar extends LightningElement {
    @track steps = [];
    stepIndex = 0;

    connectedCallback() {
        this._unsubscribe = subscribeStore(() => this.refresh());
        this.refresh();
    }

    disconnectedCallback() {
        this._unsubscribe?.();
    }

    refresh() {
        this.stepIndex = getDemoStep();
        this.steps = journeySteps().map((s) => ({
            ...s,
            title: `${s.n}. ${s.label}`,
            chipClass:
                s.n === this.stepIndex
                    ? 'c-presenter-bar__chip c-presenter-bar__chip_current'
                    : 'c-presenter-bar__chip',
        }));
    }

    get currentLabel() {
        const step = this.steps[this.stepIndex];
        return step ? `Step ${step.n}: ${step.label}` : '';
    }

    get backDisabled() {
        return this.stepIndex <= 0;
    }

    get nextDisabled() {
        return this.stepIndex >= this.steps.length - 1;
    }

    goTo(n) {
        setDemoStep(n);
        const step = journeySteps()[n];
        if (step) {
            navigate(step.path);
        }
    }

    handleChip(event) {
        this.goTo(Number(event.currentTarget.dataset.step));
    }

    handleBack() {
        this.goTo(this.stepIndex - 1);
    }

    handleNext() {
        this.goTo(this.stepIndex + 1);
    }

    handleReset() {
        reset();
        navigate('/');
        showToast({ title: 'Demo reset', message: 'All records restored to the seed state.', variant: 'info' });
    }
}
