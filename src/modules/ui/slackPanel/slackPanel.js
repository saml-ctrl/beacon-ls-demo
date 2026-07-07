import { LightningElement, api, track } from 'lwc';
import { getSlackChannels, subscribeStore } from 'data/store';

/**
 * Slack record-channel panel for an Opportunity. Shows every channel tied to
 * the opportunity (#bz-…-kam record channel, post-SOW #ls-…-p1), members,
 * simulated messages, and the two notification rules.
 */
export default class SlackPanel extends LightningElement {
    _oppId = '';
    @track channels = [];

    @api
    get oppId() {
        return this._oppId;
    }
    set oppId(value) {
        this._oppId = value;
        this.refresh();
    }

    connectedCallback() {
        this._unsubscribe = subscribeStore(() => this.refresh());
        this.refresh();
    }

    disconnectedCallback() {
        this._unsubscribe?.();
    }

    refresh() {
        this.channels = getSlackChannels()
            .filter((channel) => channel.oppId === this._oppId)
            .map((channel) => ({
                ...channel,
                memberList: channel.members.map((name, i) => ({ id: `${channel.id}-m${i}`, name })),
                messageList: channel.messages.map((message) => ({
                    ...message,
                    time: new Date(message.ts).toLocaleString(),
                })),
                rulesLabel: channel.notificationRules.length
                    ? `Notification rules (${channel.notificationRules.length}): ${channel.notificationRules.join(', ')}`
                    : '',
            }));
    }

    get hasChannels() {
        return this.channels.length > 0;
    }
}
