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

/** Mermaid sources for the Architecture & Flow Diagrams card. */
const DIAGRAM_INTEGRATIONS = `flowchart LR
    subgraph SRC["External sources"]
        CIT[Citeline]
        CTG[ClinicalTrials.gov]
        CLAY[Clay]
    end
    MULE[MuleSoft]
    subgraph SF["Salesforce Life Sciences Cloud"]
        RS[Research Studies]
        LD[Leads]
        OPP[Opportunity]
        CT[Contract]
        DASH[Dashboards]
    end
    MCAE[Marketing Cloud Account Engagement]
    SP[SharePoint quote sheets]
    SIGN[Adobe Acrobat Sign]
    SLACK[Slack deal channel]
    ASANA[Asana delivery project]

    CIT --> MULE
    CTG --> MULE
    MULE -->|Study ingestion| RS
    RS -->|Auto-create sites and PI or KOL leads| LD
    CLAY -->|One-time enrichment on assignment| LD
    MCAE <-->|Engagement history| LD
    LD -->|Custom conversion| OPP
    OPP -->|Quote workspace| SP
    OPP -->|Deal room| SLACK
    OPP --> CT
    CT <-->|Send and signed callback| SIGN
    OPP -->|Closed Won handoff| ASANA
    ASANA -->|Project status sync| MULE
    OPP -->|Live rollups| DASH`;

const DIAGRAM_JOURNEY = `journey
    title Presenter journey by persona
    section Intake and triage
      Review ICP-flagged studies: 4: Priya
      Assign study to a BD rep: 5: Priya
    section Selling
      Review study and site roster: 4: Jordan
      Work the KOL lead: 4: Jordan
      Convert lead to opportunity: 5: Jordan
      Advance the Sales Path: 3: Jordan
      Quote via SharePoint: 3: Jordan
    section Contracting
      Upload the Award Letter: 4: Jordan
      Send via Adobe Acrobat Sign: 5: Jordan
      Close the opportunity won: 5: Jordan
    section Delivery handoff
      Complete onboarding items: 4: Sam
      Push the project to Asana: 5: Sam
      Handle the Change Order: 3: Sam`;

const DIAGRAM_WORKFLOW = `flowchart TD
    T[Triage] --> A[Awareness]
    A --> N[Nurture]
    N --> Q[Qualification]
    Q --> R[Request]
    R --> G1{CBO review complete?}
    G1 -- No --> R
    G1 -- Yes --> C[Consideration]
    C --> G2{Award Letter uploaded?}
    G2 -- No --> C
    G2 -- Yes --> K[Contracting]
    K --> G3{Contract signed?}
    G3 -- No --> K
    G3 -- Yes --> W[Closed Won]
    W --> SE[Onboarding kickoff, Slack post, Asana handoff]
    SE --> CO{Schedule Extension Notification?}
    CO -- Yes --> COO[Change Order opportunity with abbreviated Path]
    COO --> W2[Change Order Closed Won]
    CO -- No --> D[Delivery]`;

const DIAGRAM_CONTRACTING = `sequenceDiagram
    participant BD as BD Rep
    participant SF as Salesforce
    participant AS as Adobe Acrobat Sign
    participant SG as Sponsor signatory
    BD->>SF: Upload and tag the Award Letter
    Note over SF: Award Letter gates entry to Contracting
    BD->>SF: Create the SOW contract record
    BD->>AS: Send for signature
    AS->>SG: Signature request
    SG->>AS: Views and signs
    AS-->>SF: Signed callback, contract status Signed
    SF->>SF: Shield Field Audit Trail entry
    SF-->>BD: Exit criterion met, Closed Won available`;

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

    get integrationsDiagram() {
        return DIAGRAM_INTEGRATIONS;
    }

    get journeyDiagram() {
        return DIAGRAM_JOURNEY;
    }

    get workflowDiagram() {
        return DIAGRAM_WORKFLOW;
    }

    get contractingDiagram() {
        return DIAGRAM_CONTRACTING;
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
