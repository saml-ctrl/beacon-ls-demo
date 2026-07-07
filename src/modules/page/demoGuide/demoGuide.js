import { LightningElement, track } from 'lwc';
import { navigate } from '../../../router';
import { journeySteps, setDemoStep, subscribeStore } from 'data/store';

const DESCRIPTIONS = {
    0: 'You are here — the storyline, the presenter bar, and the Discovery Mode toggle.',
    1: 'Citeline-ingested studies (ICP-flagged by Flow) triaged and assigned by a human BD Coordinator.',
    2: 'The Research Study record: 14 Clinical Sites and PI / KOL Leads auto-created from the ingestion payload.',
    3: 'The KOL Lead: one-time Clay enrichment on assignment, full MCAE engagement history before the first call.',
    4: 'One-click custom conversion: duplicate check, a blocking Close Date validation, and the full record graph.',
    5: 'The Opportunity: Sales Path with entry/exit criteria, Products, Team, Opportunity Sites, Slack channel.',
    6: 'Proposal & Quoting checkpoint: SharePoint quote sheet workspace and the CBO review gate.',
    7: 'Contracting: Adobe Acrobat Sign flow with the Shield Field Audit Trail. Award Letter gates the stage.',
    8: 'Closed Won kicks off onboarding: form, Key Project Roles, Exhibit A, Cost Info.',
    9: 'Sales-to-ClinOps handoff: Asana project push, PM assignment, project-status sync, renewal alert.',
    10: 'Schedule Extension Notification spawns a Change Order with its own abbreviated Path.',
    11: 'Leadership dashboards — every number computed live from the demo store.',
};

const HIGHLIGHTS = [
    'Sales Path with Beacon handbook stages, entry/exit criteria, and three hard gates (CBO review, Award Letter, executed contract)',
    'On-demand lead conversion with a visible duplicate check and a blocking Close Date validation',
    'Adobe Acrobat Sign contracting with a Shield Field Audit Trail viewer',
    'Closed Won onboarding sequence and the Asana Sales-to-ClinOps handoff',
    'Change Order scenario driven by a Schedule Extension Notification',
    'Live leadership dashboards computed from the in-memory store',
];

export default class DemoGuide extends LightningElement {
    @track nodes = [];

    connectedCallback() {
        this._unsubscribe = subscribeStore(() => this.refresh());
        this.refresh();
    }

    disconnectedCallback() {
        this._unsubscribe?.();
    }

    refresh() {
        this.nodes = journeySteps().map((step) => ({
            ...step,
            description: DESCRIPTIONS[step.n] || '',
        }));
    }

    get highlights() {
        return HIGHLIGHTS.map((text, i) => ({ id: `h${i}`, text }));
    }

    handleNodeClick(event) {
        const n = Number(event.currentTarget.dataset.step);
        setDemoStep(n);
        const step = journeySteps()[n];
        if (step) {
            navigate(step.path);
        }
    }
}
