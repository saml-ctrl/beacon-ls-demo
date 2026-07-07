import { LightningElement } from 'lwc';
import { getDiscoveryMode, setDiscoveryMode, subscribeStore } from 'data/store';

export default class GlobalHeader extends LightningElement {
    discoveryOn = getDiscoveryMode();

    connectedCallback() {
        this._unsubscribeStore = subscribeStore(() => {
            this.discoveryOn = getDiscoveryMode();
        });
    }

    disconnectedCallback() {
        this._unsubscribeStore?.();
    }

    handleDiscoveryToggle(event) {
        setDiscoveryMode(event.target.checked);
    }

    handleAgentforceClick() {
        this.dispatchEvent(new CustomEvent('panelselect', {
            detail: { name: 'agentforce_panel' },
            bubbles: true,
            composed: true
        }));
    }

    handleTrailheadClick() {
        this.dispatchEvent(new CustomEvent('panelselect', {
            detail: { name: 'trailhead_panel' },
            bubbles: true,
            composed: true
        }));
    }

    handleSettingsClick() {
        this.dispatchEvent(new CustomEvent('panelselect', {
            detail: { name: 'settings_panel' },
            bubbles: true,
            composed: true
        }));
    }

    handleNotificationClick() {
        this.dispatchEvent(new CustomEvent('panelselect', {
            detail: { name: 'notification_panel' },
            bubbles: true,
            composed: true
        }));
    }
}