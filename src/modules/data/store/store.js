/**
 * In-memory demo store for the Beacon Biosignals Life Sciences Sales wireframe.
 * Single source of truth for all records, relationships, and demo state.
 *
 * - seed()/reset() restore the exact seed state.
 * - Named mutations encode the journey's business rules (gates, side effects).
 * - Pub-sub via EventTarget: pages subscribe with subscribeStore() and re-read
 *   state on every 'storechange'. Toasts flow over the same bus ('toast').
 *
 * All data is fictitious. No real companies, people, or pricing.
 */

const bus = new EventTarget();

/** Fixed ids for the journey records so routes/steps can reference them. */
export const IDS = {
    study: 'rs-neurocessa',
    sponsorAccount: 'acct-neurocessa',
    kolLead: 'lead-kessler',
    piLead: 'lead-vasquez',
    kolContact: 'con-kessler',
    piContact: 'con-vasquez',
    opp: 'opp-neurocessa',
    contract: 'ct-neurocessa-sow',
    changeOrder: 'opp-neurocessa-co',
    coContract: 'ct-neurocessa-co',
};

/** People (all invented). */
export const PEOPLE = {
    bdRep: 'Jordan Reyes',            // BD / Key Account Manager, journey opportunity owner
    bdCoordinator: 'Priya Natarajan', // BD coordinator persona for triage
    clinOpsPm: 'Sam Okafor',          // ClinOps program manager
    medicalDirector: 'Dr. Ingrid Halvorsen',
    scientific: 'Dr. Wei Zhang',
    engineering: 'Felix Aranda',
};

export const BD_REPS = ['Jordan Reyes', 'Alexis Grant', 'Tom Iwu', 'Dana Whitfield'];

/**
 * Beacon LS BD handbook sales stages (Sales record type), each mapped to a
 * forecast category, with entry/exit criteria shown on Path click.
 */
export const STAGES = [
    {
        name: 'Triage',
        forecast: 'Pipeline',
        entry: 'Research Study ingested from Citeline / ClinicalTrials.gov and ICP-flagged by the rules-based Flow.',
        exit: 'BD Coordinator approves the study and assigns a BD rep (human step — never automated prioritization).',
    },
    {
        name: 'Awareness',
        forecast: 'Pipeline',
        entry: 'BD rep assigned; KOL / sponsor outreach initiated.',
        exit: 'KOL Contact or sponsor responds and agrees to a conversation.',
    },
    {
        name: 'Nurture',
        forecast: 'Pipeline',
        entry: 'Two-way dialogue underway; engagement history building in MCAE.',
        exit: 'Sponsor confirms an active EEG endpoint need and a working timeline.',
    },
    {
        name: 'Qualification',
        forecast: 'Best Case',
        entry: 'Need, budget authority, and timeline validated against the ICP.',
        exit: 'Sponsor requests a proposal / capabilities package; lead converted on demand.',
    },
    {
        name: 'Request',
        forecast: 'Best Case',
        entry: 'Formal proposal / RFI request received from the sponsor.',
        exit: 'Quote sheet completed in the SharePoint workspace and CBO review approved.',
    },
    {
        name: 'Consideration',
        forecast: 'Commit',
        entry: 'Proposal submitted; sponsor evaluating (CBO review approved — required).',
        exit: 'Award Letter received from the sponsor.',
    },
    {
        name: 'Contracting',
        forecast: 'Commit',
        entry: 'Award Letter received (required to enter this stage).',
        exit: 'MSA / SOW executed via Adobe Acrobat Sign.',
    },
    {
        name: 'Closed Won',
        forecast: 'Closed',
        entry: 'Executed contract on file (required).',
        exit: 'Onboarding kickoff and Sales-to-ClinOps handoff.',
    },
];

export const CLOSED_LOST_STAGE = { name: 'Closed Lost', forecast: 'Closed' };

/** Abbreviated Change Order path. Proposed default — confirm in discovery. */
export const CHANGE_ORDER_STAGES = [
    {
        name: 'Identified',
        forecast: 'Pipeline',
        entry: 'Schedule Extension Notification logged (>30 days beyond Estimated Schedule) or other SOW trigger.',
        exit: 'Scope of time-based fee extension agreed internally.',
    },
    {
        name: 'Scoped',
        forecast: 'Best Case',
        entry: 'Time-based line items drafted from the parent SOW / Exhibit.',
        exit: 'Sponsor confirms Change Order scope.',
    },
    {
        name: 'Contracting',
        forecast: 'Commit',
        entry: 'Change Order document out for signature.',
        exit: 'Change Order executed via Adobe Acrobat Sign.',
    },
    {
        name: 'Closed Won',
        forecast: 'Closed',
        entry: 'Executed Change Order on file (required).',
        exit: '—',
    },
];

export function stagesForRecordType(recordType) {
    return recordType === 'Change Order' ? CHANGE_ORDER_STAGES : STAGES;
}

export function forecastForStage(stageName, recordType) {
    if (stageName === 'Closed Lost') return 'Closed';
    const def = stagesForRecordType(recordType).find((s) => s.name === stageName);
    return def ? def.forecast : 'Pipeline';
}

/* ------------------------------------------------------------------ */
/* Seed data                                                           */
/* ------------------------------------------------------------------ */

const DAY = 24 * 60 * 60 * 1000;
function daysFromNow(n) {
    const d = new Date(Date.now() + n * DAY);
    return d.toISOString().slice(0, 10);
}
function stamp(offsetDays, hour = 10, minute = 12) {
    const d = new Date(Date.now() + offsetDays * DAY);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
}

const NEUROCESSA_SITES = [
    { id: 'site-01', name: 'Lakeshore Neuroscience Institute', city: 'Chicago', state: 'IL', pi: 'Dr. Elena Vasquez', engaged: true },
    { id: 'site-02', name: 'Meridian Behavioral Health Center', city: 'Atlanta', state: 'GA', pi: 'Dr. Rosa Idowu', engaged: true },
    { id: 'site-03', name: 'Cascade Clinical Research', city: 'Portland', state: 'OR', pi: 'Dr. Alan Frey', engaged: true },
    { id: 'site-04', name: 'Bluebonnet Psychiatry & Research', city: 'Austin', state: 'TX', pi: 'Dr. Camille Ortiz', engaged: true },
    { id: 'site-05', name: 'Harborlight Clinical Trials', city: 'Boston', state: 'MA', pi: 'Dr. Priya Raman', engaged: true },
    { id: 'site-06', name: 'Sonoran Neurobehavioral Institute', city: 'Phoenix', state: 'AZ', pi: 'Dr. Theo Marsh', engaged: true },
    { id: 'site-07', name: 'Great Plains Research Partners', city: 'Omaha', state: 'NE', pi: 'Dr. Lena Kowalski', engaged: false },
    { id: 'site-08', name: 'Alleghany Mind Health Research', city: 'Pittsburgh', state: 'PA', pi: 'Dr. Marcus Bell', engaged: false },
    { id: 'site-09', name: 'Pacific Crest Neuropsychiatry', city: 'San Diego', state: 'CA', pi: 'Dr. Sofia Ferreira', engaged: true },
    { id: 'site-10', name: 'Twin Pines Clinical Studies', city: 'Minneapolis', state: 'MN', pi: 'Dr. Owen Tran', engaged: false },
    { id: 'site-11', name: 'Riverstone Research Group', city: 'Nashville', state: 'TN', pi: 'Dr. Gabrielle Lyon-Smith', engaged: true },
    { id: 'site-12', name: 'Foxglove Behavioral Research', city: 'Durham', state: 'NC', pi: 'Dr. Henry Adjei', engaged: false },
    { id: 'site-13', name: 'Summit Line Neuroscience', city: 'Denver', state: 'CO', pi: 'Dr. Isabel Munro', engaged: true },
    { id: 'site-14', name: 'Gulf Coast Clinical Institute', city: 'Tampa', state: 'FL', pi: 'Dr. Viktor Halasz', engaged: false },
];

function buildSeed() {
    const state = {
        demoStep: 0,
        discoveryMode: true,
        counters: { id: 1000 },

        researchStudies: [
            {
                id: IDS.study,
                name: 'NRX-214-202: Phase 2 Study of NRX-214 in Major Depressive Disorder',
                sponsor: 'Neurocessa Therapeutics',
                sponsorTier: 'Tier 3 — clinical-stage biotech',
                compound: 'NRX-214',
                indication: 'Major Depressive Disorder',
                phase: 'Phase 2',
                siteCount: 14,
                registryId: 'NCT07-DEMO-214',
                citelineId: 'CT-284913',
                icpScore: 91,
                icpFlag: true,
                status: 'Unassigned',
                assignedTo: '',
                opportunityId: '',
                ingestSource: 'Citeline + ClinicalTrials.gov via MuleSoft (daily batch)',
                ingestedAt: stamp(-1, 6, 30),
                siteIds: NEUROCESSA_SITES.map((s) => s.id),
                leadIds: [IDS.kolLead, IDS.piLead],
            },
            {
                id: 'rs-cortexal',
                name: 'CXB-201: Phase 2 Study in Early Alzheimer’s Disease',
                sponsor: 'Cortexal Bio',
                sponsorTier: 'Tier 2 — mid-cap biotech',
                compound: 'CXB-201',
                indication: 'Alzheimer’s Disease',
                phase: 'Phase 2',
                siteCount: 22,
                registryId: 'NCT07-DEMO-733',
                citelineId: 'CT-291177',
                icpScore: 82,
                icpFlag: true,
                status: 'Unassigned',
                assignedTo: '',
                opportunityId: '',
                ingestSource: 'Citeline + ClinicalTrials.gov via MuleSoft (daily batch)',
                ingestedAt: stamp(-1, 6, 30),
                siteIds: [],
                leadIds: ['lead-bg-1'],
            },
            {
                id: 'rs-neuravine',
                name: 'NVN-55: Phase 2 Study in Parkinson’s Disease Sleep Disturbance',
                sponsor: 'Neuravine Therapeutics',
                sponsorTier: 'Tier 3 — clinical-stage biotech',
                compound: 'NVN-55',
                indication: 'Parkinson’s Disease',
                phase: 'Phase 2',
                siteCount: 9,
                registryId: 'NCT07-DEMO-518',
                citelineId: 'CT-293401',
                icpScore: 74,
                icpFlag: true,
                status: 'Unassigned',
                assignedTo: '',
                opportunityId: '',
                ingestSource: 'Citeline + ClinicalTrials.gov via MuleSoft (daily batch)',
                ingestedAt: stamp(-2, 6, 30),
                siteIds: [],
                leadIds: [],
            },
            {
                id: 'rs-quiescor',
                name: 'QSC-9: Phase 1 Safety Study in Focal Epilepsy',
                sponsor: 'Quiescor Bio',
                sponsorTier: 'Tier 4 — early-stage biotech',
                compound: 'QSC-9',
                indication: 'Epilepsy',
                phase: 'Phase 1',
                siteCount: 4,
                registryId: 'NCT07-DEMO-092',
                citelineId: 'CT-295882',
                icpScore: 61,
                icpFlag: true,
                status: 'Unassigned',
                assignedTo: '',
                opportunityId: '',
                ingestSource: 'Citeline + ClinicalTrials.gov via MuleSoft (daily batch)',
                ingestedAt: stamp(-2, 6, 30),
                siteIds: [],
                leadIds: [],
            },
            {
                id: 'rs-tessellate',
                name: 'TSL-4: Phase 2 Study in Schizophrenia Negative Symptoms',
                sponsor: 'Tessellate Neuro',
                sponsorTier: 'Tier 4 — early-stage biotech',
                compound: 'TSL-4',
                indication: 'Schizophrenia',
                phase: 'Phase 2',
                siteCount: 6,
                registryId: 'NCT07-DEMO-347',
                citelineId: 'CT-296130',
                icpScore: 48,
                icpFlag: false,
                status: 'Unassigned',
                assignedTo: '',
                opportunityId: '',
                ingestSource: 'Citeline + ClinicalTrials.gov via MuleSoft (daily batch)',
                ingestedAt: stamp(-3, 6, 30),
                siteIds: [],
                leadIds: [],
            },
            {
                id: 'rs-somnaris',
                name: 'SOM-449: Phase 2 Study in Obstructive Sleep Apnea',
                sponsor: 'Somnaris Health',
                sponsorTier: 'Tier 2 — mid-cap biotech',
                compound: 'SOM-449',
                indication: 'Obstructive Sleep Apnea',
                phase: 'Phase 2',
                siteCount: 12,
                registryId: 'NCT07-DEMO-611',
                citelineId: 'CT-281554',
                icpScore: 86,
                icpFlag: true,
                status: 'Assigned',
                assignedTo: 'Jordan Reyes',
                opportunityId: 'opp-somnaris',
                ingestSource: 'Citeline + ClinicalTrials.gov via MuleSoft (daily batch)',
                ingestedAt: stamp(-34, 6, 30),
                siteIds: [],
                leadIds: [],
            },
        ],

        /** Sponsor orgs + clinical sites. Record types: Organization | Clinical Site. */
        accounts: [
            ...NEUROCESSA_SITES.map((s) => ({
                id: s.id,
                name: s.name,
                recordType: 'Clinical Site',
                city: s.city,
                state: s.state,
                phone: '',
                website: '',
                tier: '',
                description: `Clinical site for NRX-214-202 (${s.city}, ${s.state}). Auto-created from the ingestion payload.`,
                studyId: IDS.study,
            })),
            { id: 'acct-cortivance', name: 'Cortivance Therapeutics', recordType: 'Organization', city: 'Cambridge', state: 'MA', phone: '(617) 555-0110', website: 'cortivance.example', tier: 'Tier 2', description: 'Mid-cap biotech. Alzheimer’s portfolio.', studyId: '' },
            { id: 'acct-synaptiq', name: 'Synaptiq Biosciences', recordType: 'Organization', city: 'South San Francisco', state: 'CA', phone: '(650) 555-0139', website: 'synaptiq.example', tier: 'Tier 1', description: 'Late-stage CNS specialist. Parkinson’s Phase 3 program.', studyId: '' },
            { id: 'acct-somnaris', name: 'Somnaris Health', recordType: 'Organization', city: 'San Diego', state: 'CA', phone: '(858) 555-0177', website: 'somnaris.example', tier: 'Tier 2', description: 'Sleep-medicine focused biotech.', studyId: '' },
            { id: 'acct-epiloxa', name: 'Epiloxa Bio', recordType: 'Organization', city: 'Philadelphia', state: 'PA', phone: '(215) 555-0142', website: 'epiloxa.example', tier: 'Tier 3', description: 'Clinical-stage epilepsy company.', studyId: '' },
            { id: 'acct-mindral', name: 'Mindral Therapeutics', recordType: 'Organization', city: 'New York', state: 'NY', phone: '(212) 555-0163', website: 'mindral.example', tier: 'Tier 4', description: 'Early-stage schizophrenia program.', studyId: '' },
            { id: 'acct-corticent', name: 'Corticent Pharma', recordType: 'Organization', city: 'Chicago', state: 'IL', phone: '(312) 555-0128', website: 'corticent.example', tier: 'Tier 3', description: 'Alzheimer’s Phase 1 program.', studyId: '' },
            { id: 'acct-dormeva', name: 'Dormeva Sciences', recordType: 'Organization', city: 'Seattle', state: 'WA', phone: '(206) 555-0155', website: 'dormeva.example', tier: 'Tier 3', description: 'OSA therapeutics developer.', studyId: '' },
            { id: 'acct-axoneme', name: 'Axoneme Bio', recordType: 'Organization', city: 'Durham', state: 'NC', phone: '(919) 555-0121', website: 'axoneme.example', tier: 'Tier 2', description: 'Epilepsy device-adjacent therapeutics.', studyId: '' },
            { id: 'acct-nigrastim', name: 'Nigrastim Therapeutics', recordType: 'Organization', city: 'Boulder', state: 'CO', phone: '(303) 555-0187', website: 'nigrastim.example', tier: 'Tier 3', description: 'Parkinson’s biotech.', studyId: '' },
            { id: 'acct-veloria', name: 'Veloria Biotech', recordType: 'Organization', city: 'Waltham', state: 'MA', phone: '(781) 555-0114', website: 'veloria.example', tier: 'Tier 3', description: 'Chronic insomnia program.', studyId: '' },
            { id: 'acct-cephalor', name: 'Cephalor Bio', recordType: 'Organization', city: 'Houston', state: 'TX', phone: '(713) 555-0170', website: 'cephalor.example', tier: 'Tier 3', description: 'Schizophrenia clinical-stage program.', studyId: '' },
            { id: 'acct-lunaris', name: 'Lunaris Neuro', recordType: 'Organization', city: 'Salt Lake City', state: 'UT', phone: '(801) 555-0195', website: 'lunaris.example', tier: 'Tier 4', description: 'Narcolepsy program.', studyId: '' },
        ],

        /** PI / KOL records land as Leads tied to the Research Study on ingestion. */
        leads: [
            {
                id: IDS.kolLead,
                name: 'Dr. Naomi Kessler',
                title: 'VP, Clinical Development',
                company: 'Neurocessa Therapeutics',
                role: 'KOL Contact',
                studyId: IDS.study,
                siteAccountId: '',
                email: '',
                phone: '',
                linkedin: '',
                enriched: false,
                enrichedAt: '',
                enrichmentNote: '',
                status: 'New',
                owner: '',
                engagementScore: 78,
                converted: false,
                convertedIds: null,
                proposedCloseDate: '', // intentionally blank — validation demo at conversion
                mcae: [
                    { id: 'eng-1', type: 'Campaign', iconName: 'standard:campaign', subject: 'Campaign membership: 2026 Sleep & CNS Endpoints Webinar Series', detail: 'Added to campaign by MCAE automation rule.', date: stamp(-42, 9, 5) },
                    { id: 'eng-2', type: 'Email Open', iconName: 'standard:email', subject: 'Email open: “EEG endpoints in MDD trials — 3 case studies”', detail: 'Opened twice; clicked the Sleep Analytics Suite section.', date: stamp(-12, 8, 41) },
                    { id: 'eng-3', type: 'Form Fill', iconName: 'standard:form', subject: 'Form fill: Waveband platform overview (gated download)', detail: 'Downloaded the Waveband + Trial Insights Hub overview PDF.', date: stamp(-10, 14, 22) },
                    { id: 'eng-4', type: 'Webinar', iconName: 'standard:event', subject: 'Webinar attended: “Quantifying sleep architecture as a biomarker”', detail: 'Attended 47 of 60 minutes. Follow-up recommended.', date: stamp(-6, 12, 0) },
                    { id: 'eng-5', type: 'Email Open', iconName: 'standard:email', subject: 'Email open: “Biosignal Studio product tour”', detail: 'Opened on mobile; no click-through.', date: stamp(-4, 7, 58) },
                ],
            },
            {
                id: IDS.piLead,
                name: 'Dr. Elena Vasquez',
                title: 'Principal Investigator',
                company: 'Lakeshore Neuroscience Institute',
                role: 'Principal Investigator',
                studyId: IDS.study,
                siteAccountId: 'site-01',
                email: '',
                phone: '',
                linkedin: '',
                enriched: false,
                enrichedAt: '',
                enrichmentNote: '',
                status: 'New',
                owner: '',
                engagementScore: 52,
                converted: false,
                convertedIds: null,
                proposedCloseDate: '',
                mcae: [
                    { id: 'eng-6', type: 'Email Open', iconName: 'standard:email', subject: 'Email open: “Site startup with the Waveband — what PIs ask first”', detail: 'Opened once.', date: stamp(-8, 16, 10) },
                ],
            },
            {
                id: 'lead-bg-1',
                name: 'Dr. Farid Osei',
                title: 'Director, Clinical Sciences',
                company: 'Cortexal Bio',
                role: 'KOL Contact',
                studyId: 'rs-cortexal',
                siteAccountId: '',
                email: '',
                phone: '',
                linkedin: '',
                enriched: false,
                enrichedAt: '',
                enrichmentNote: '',
                status: 'New',
                owner: '',
                engagementScore: 34,
                converted: false,
                convertedIds: null,
                proposedCloseDate: '',
                mcae: [],
            },
            {
                id: 'lead-bg-2',
                name: 'Dr. Anke Sorensen',
                title: 'Head of Translational Medicine',
                company: 'Neuravine Therapeutics',
                role: 'KOL Contact',
                studyId: 'rs-neuravine',
                siteAccountId: '',
                email: 'a.sorensen@neuravine.example',
                phone: '(628) 555-0146',
                linkedin: 'linkedin.example/in/anke-sorensen',
                enriched: true,
                enrichedAt: stamp(-20, 11, 3),
                enrichmentNote: 'One-time Clay enrichment on assignment',
                status: 'Working',
                owner: 'Alexis Grant',
                engagementScore: 41,
                converted: false,
                convertedIds: null,
                proposedCloseDate: '',
                mcae: [
                    { id: 'eng-7', type: 'Email Open', iconName: 'standard:email', subject: 'Email open: “Scientific Services for CNS programs”', detail: 'Opened once.', date: stamp(-15, 9, 30) },
                ],
            },
        ],

        /** Contacts exist for background opps; journey KOL Contacts are created at conversion. */
        contacts: [
            { id: 'con-bg-1', name: 'Dr. Mei Watanabe', title: 'VP Clinical Operations', accountId: 'acct-synaptiq', accountName: 'Synaptiq Biosciences', email: 'm.watanabe@synaptiq.example', phone: '(650) 555-0104', linkedin: '', role: 'KOL Contact', enriched: true, studyId: '', mcae: [ { id: 'eng-bg-1', type: 'Email Open', iconName: 'standard:email', subject: 'Email open: “Quality Suite for Phase 3 EEG reads”', detail: 'Opened three times.', date: stamp(-9, 10, 15) } ] },
            { id: 'con-bg-2', name: 'Robert Ellery', title: 'Chief Business Officer', accountId: 'acct-axoneme', accountName: 'Axoneme Bio', email: 'r.ellery@axoneme.example', phone: '(919) 555-0186', linkedin: '', role: 'Executive Sponsor', enriched: true, studyId: '', mcae: [] },
            { id: 'con-bg-3', name: 'Dr. Hana Volkova', title: 'Senior Medical Director', accountId: 'acct-veloria', accountName: 'Veloria Biotech', email: 'h.volkova@veloria.example', phone: '(781) 555-0129', linkedin: '', role: 'KOL Contact', enriched: false, studyId: '', mcae: [] },
        ],

        opportunities: [
            // ---- Background pipeline (fictitious sponsors / indications) ----
            bgOpp('opp-cortivance', 'Cortivance — CTV-101 Ph2 Alzheimer’s — EEG Services', 'acct-cortivance', 'Cortivance Therapeutics', 'Consideration', 1240000, 'Alexis Grant', 62, { cboReviewed: true }),
            bgOpp('opp-synaptiq', 'Synaptiq — SYN-88 Ph3 Parkinson’s — EEG Services', 'acct-synaptiq', 'Synaptiq Biosciences', 'Contracting', 2100000, 'Tom Iwu', 45, { cboReviewed: true, awardLetterReceived: true, contractStatus: 'Sent' }),
            bgOpp('opp-somnaris', 'Somnaris — SOM-449 Ph2 OSA — EEG Services', 'acct-somnaris', 'Somnaris Health', 'Qualification', 640000, 'Jordan Reyes', 88),
            bgOpp('opp-epiloxa', 'Epiloxa — EPX-9 Ph2 Epilepsy — EEG Services', 'acct-epiloxa', 'Epiloxa Bio', 'Request', 890000, 'Dana Whitfield', 75),
            bgOpp('opp-mindral', 'Mindral — MND-7 Ph1 Schizophrenia — EEG Services', 'acct-mindral', 'Mindral Therapeutics', 'Nurture', 380000, 'Alexis Grant', 120),
            bgOpp('opp-corticent', 'Corticent — CP-33 Ph1 Alzheimer’s — EEG Services', 'acct-corticent', 'Corticent Pharma', 'Awareness', 300000, 'Tom Iwu', 140),
            bgOpp('opp-dormeva', 'Dormeva — DRV-2 Ph3 OSA — EEG Services', 'acct-dormeva', 'Dormeva Sciences', 'Triage', 150000, 'Priya Natarajan', 160),
            bgOpp('opp-axoneme', 'Axoneme — AXB-12 Ph2 Epilepsy — EEG Services', 'acct-axoneme', 'Axoneme Bio', 'Closed Won', 1020000, 'Jordan Reyes', -92, { cboReviewed: true, awardLetterReceived: true, contractStatus: 'Signed', closedDaysAgo: 92 }),
            bgOpp('opp-nigrastim', 'Nigrastim — NGS-5 Ph2 Parkinson’s — EEG Services', 'acct-nigrastim', 'Nigrastim Therapeutics', 'Closed Lost', 720000, 'Dana Whitfield', -47, { closedDaysAgo: 47, lossReason: 'Selected incumbent central reader' }),
            bgOpp('opp-veloria', 'Veloria — VLB-4 Ph2 Chronic Insomnia — EEG Services', 'acct-veloria', 'Veloria Biotech', 'Consideration', 560000, 'Alexis Grant', 55, { cboReviewed: true, contractStatus: 'Viewed' }),
            bgOpp('opp-cephalor', 'Cephalor — CPH-1 Ph2 Schizophrenia — EEG Services', 'acct-cephalor', 'Cephalor Bio', 'Qualification', 475000, 'Tom Iwu', 96),
            bgOpp('opp-lunaris', 'Lunaris — LNR-3 Ph2 Narcolepsy — EEG Services', 'acct-lunaris', 'Lunaris Neuro', 'Nurture', 410000, 'Jordan Reyes', 130),
        ],

        opportunityProducts: [],
        opportunityTeam: [
            { id: 'team-bg-1', oppId: 'opp-synaptiq', name: 'Tom Iwu', role: 'BD' },
            { id: 'team-bg-2', oppId: 'opp-synaptiq', name: 'Sam Okafor', role: 'ClinOps' },
        ],
        opportunityContactRoles: [
            { id: 'ocr-bg-1', oppId: 'opp-synaptiq', contactId: 'con-bg-1', contactName: 'Dr. Mei Watanabe', role: 'Decision Maker' },
            { id: 'ocr-bg-2', oppId: 'opp-veloria', contactId: 'con-bg-3', contactName: 'Dr. Hana Volkova', role: 'Champion' },
        ],
        opportunitySites: [],

        contracts: [
            { id: 'ct-synaptiq-msa', oppId: 'opp-synaptiq', name: 'Synaptiq MSA', type: 'MSA', status: 'Sent', exhibit: '', sentAt: stamp(-5, 15, 2), viewedAt: '', signedAt: '', files: [{ id: 'file-bg-1', name: 'Synaptiq_MSA_v3_FINAL.pdf', kind: 'PDF', addedAt: stamp(-5, 14, 50) }] },
            { id: 'ct-veloria-sow', oppId: 'opp-veloria', name: 'Veloria SOW #1', type: 'SOW', status: 'Viewed', exhibit: 'Exhibit A', sentAt: stamp(-8, 11, 20), viewedAt: stamp(-6, 9, 5), signedAt: '', files: [{ id: 'file-bg-2', name: 'Veloria_SOW1_v2_FINAL.pdf', kind: 'PDF', addedAt: stamp(-8, 11, 10) }] },
            { id: 'ct-axoneme-sow', oppId: 'opp-axoneme', name: 'Axoneme SOW #1', type: 'SOW', status: 'Signed', exhibit: 'Exhibit A', sentAt: stamp(-96, 10, 0), viewedAt: stamp(-95, 8, 30), signedAt: stamp(-92, 16, 44), files: [{ id: 'file-bg-3', name: 'Axoneme_SOW1_v5_FINAL.pdf', kind: 'PDF', addedAt: stamp(-96, 9, 45) }, { id: 'file-bg-4', name: 'Axoneme_SOW1_EXECUTED.pdf', kind: 'PDF', addedAt: stamp(-92, 16, 45) }] },
        ],

        auditTrail: [
            { id: 'audit-bg-1', contractId: 'ct-axoneme-sow', timestamp: stamp(-92, 16, 44), actor: 'Adobe Acrobat Sign (managed package)', event: 'Agreement signed', field: 'Status', oldValue: 'Viewed', newValue: 'Signed' },
        ],

        tasks: [
            { id: 'task-bg-1', subject: 'Follow up: Somnaris SOM-449 protocol synopsis review', relatedTo: 'Somnaris — SOM-449 Ph2 OSA — EEG Services', relatedId: 'opp-somnaris', relatedType: 'opportunity', assignedTo: 'Jordan Reyes', dueDate: daysFromNow(3), status: 'Open', priority: 'Normal', origin: 'Manual' },
        ],

        activities: [
            { id: 'act-bg-1', parentId: 'opp-somnaris', type: 'Call', iconName: 'standard:log_a_call', subject: 'Intro call with Somnaris clinical ops', detail: 'Discussed Waveband logistics for 12 sites.', date: stamp(-11, 13, 30) },
            { id: 'act-bg-2', parentId: 'opp-synaptiq', type: 'Email', iconName: 'standard:email', subject: 'Sent MSA for signature', detail: 'Adobe Acrobat Sign envelope sent to Synaptiq legal.', date: stamp(-5, 15, 2) },
        ],

        slackChannels: [],

        onboarding: {
            oppId: IDS.opp,
            formStatus: 'Not Sent',
            formRecipient: '',
            fallbackTaskId: '',
            roles: { billingContact: '', productOwner: '', executiveSponsor: '', endUsers: '' },
            kickoffComplete: false,
            exhibit: { letter: '', sow: '', projectName: '' },
            costInfo: { amount: '', totalHours: '', creditedHours: '', hourlyRate: '', weeks: '', upfrontPayment: '', netTerms: '', msaExecutedDate: '' },
        },

        asana: {
            created: false,
            projectName: '',
            asanaId: '',
            pmAssigned: '',
            pmSynced: false,
            status: 'Not Created',
            statusHistory: [],
            details: null,
        },

        changeOrder: {
            created: false,
            notificationLogged: false,
            extensionDays: 45,
            triggerDays: 30,
        },
    };

    return state;
}

/** Helper to build a background opportunity with plausible stage history. */
function bgOpp(id, name, accountId, accountName, stage, amount, owner, closeInDays, extra = {}) {
    const { closedDaysAgo = 0, lossReason = '', contractStatus = 'None', cboReviewed = false, awardLetterReceived = false } = extra;
    const isClosed = stage === 'Closed Won' || stage === 'Closed Lost';
    const createdDaysAgo = isClosed ? closedDaysAgo + 130 : 30 + Math.abs(closeInDays % 90);
    const order = ['Triage', 'Awareness', 'Nurture', 'Qualification', 'Request', 'Consideration', 'Contracting', 'Closed Won'];
    const idx = stage === 'Closed Lost' ? 4 : order.indexOf(stage);
    const stageHistory = [];
    let cursor = -createdDaysAgo;
    for (let i = 0; i <= idx && i < order.length; i++) {
        stageHistory.push({ stage: i === idx && stage === 'Closed Lost' ? 'Closed Lost' : order[i], enteredAt: stamp(cursor, 9, 0) });
        cursor += Math.max(4, Math.round(createdDaysAgo / (idx + 1)));
    }
    return {
        id,
        name,
        recordType: 'Sales',
        accountId,
        accountName,
        studyId: '',
        stage,
        forecastCategory: forecastForStage(stage, 'Sales'),
        amount,
        closeDate: daysFromNow(closeInDays),
        owner,
        awardLetterReceived,
        cboReviewed,
        contractStatus,
        parentOpportunityId: '',
        exhibit: '',
        nextStep: '',
        lossReason,
        createdAt: stamp(-createdDaysAgo, 9, 0),
        closedAt: isClosed ? stamp(-closedDaysAgo, 17, 0) : '',
        stageHistory,
        description: '',
    };
}

let state = buildSeed();

/* ------------------------------------------------------------------ */
/* Pub-sub                                                             */
/* ------------------------------------------------------------------ */

function emit() {
    bus.dispatchEvent(new CustomEvent('storechange'));
}

/** Subscribe to store changes. Returns an unsubscribe function. */
export function subscribeStore(callback) {
    const handler = () => callback();
    bus.addEventListener('storechange', handler);
    return () => bus.removeEventListener('storechange', handler);
}

/** Fire a Lightning-style toast. variant: success | info | warning | error */
export function showToast({ title, message = '', variant = 'success' }) {
    bus.dispatchEvent(new CustomEvent('toast', { detail: { title, message, variant, id: nextId('toast') } }));
}

export function subscribeToasts(callback) {
    const handler = (e) => callback(e.detail);
    bus.addEventListener('toast', handler);
    return () => bus.removeEventListener('toast', handler);
}

function nextId(prefix) {
    state.counters.id += 1;
    return `${prefix}-${state.counters.id}`;
}

/* ------------------------------------------------------------------ */
/* Getters                                                             */
/* ------------------------------------------------------------------ */

export function getState() {
    return state;
}

export function getStudies() { return state.researchStudies; }
export function getStudy(id) { return state.researchStudies.find((s) => s.id === id) || null; }
export function getTriageQueue() { return state.researchStudies.filter((s) => s.status === 'Unassigned'); }
export function getAccounts() { return state.accounts; }
export function getAccount(id) { return state.accounts.find((a) => a.id === id) || null; }
export function getLeads() { return state.leads; }
export function getLead(id) { return state.leads.find((l) => l.id === id) || null; }
export function getContacts() { return state.contacts; }
export function getContact(id) { return state.contacts.find((c) => c.id === id) || null; }
export function getOpportunities() { return state.opportunities; }
export function getOpportunity(id) { return state.opportunities.find((o) => o.id === id) || null; }
export function getContracts() { return state.contracts; }
export function getContract(id) { return state.contracts.find((c) => c.id === id) || null; }
export function getContractsForOpp(oppId) { return state.contracts.filter((c) => c.oppId === oppId); }
export function getProductsForOpp(oppId) { return state.opportunityProducts.filter((p) => p.oppId === oppId); }
export function getTeamForOpp(oppId) { return state.opportunityTeam.filter((t) => t.oppId === oppId); }
export function getSitesForOpp(oppId) { return state.opportunitySites.filter((s) => s.oppId === oppId); }
export function getContactRolesForOpp(oppId) { return state.opportunityContactRoles.filter((r) => r.oppId === oppId); }
export function getActivitiesFor(parentId) {
    return state.activities.filter((a) => a.parentId === parentId).sort((a, b) => (a.date < b.date ? 1 : -1));
}
export function getTasksFor(relatedId) { return state.tasks.filter((t) => t.relatedId === relatedId); }
export function getAllTasks() { return state.tasks; }
export function getAuditTrailForContract(contractId) {
    return state.auditTrail.filter((a) => a.contractId === contractId).sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
}
export function getSlackChannelForOpp(oppId) { return state.slackChannels.find((c) => c.oppId === oppId) || null; }
export function getSlackChannels() { return state.slackChannels; }
export function getOnboarding() { return state.onboarding; }
export function getAsana() { return state.asana; }
export function getChangeOrderState() { return state.changeOrder; }
export function getDiscoveryMode() { return state.discoveryMode; }
export function getDemoStep() { return state.demoStep; }

/** Sum of line items; used to keep opp.amount in sync where products exist. */
export function getProductTotal(oppId) {
    return getProductsForOpp(oppId).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
}

/* ------------------------------------------------------------------ */
/* Journey (presenter bar)                                             */
/* ------------------------------------------------------------------ */

/**
 * Ordered journey steps 0–11. Paths are resolved against current state so
 * steps never point at records that don't exist yet (no dead ends).
 */
export function journeySteps() {
    const oppExists = !!getOpportunity(IDS.opp);
    const contractExists = !!getContract(IDS.contract);
    const coExists = !!getOpportunity(IDS.changeOrder);
    return [
        { n: 0, label: 'Demo Guide', path: '/' },
        { n: 1, label: 'Trial Intake & Triage', path: '/intake' },
        { n: 2, label: 'Research Study', path: `/research-studies/${IDS.study}` },
        { n: 3, label: 'KOL Lead & Enrichment', path: `/leads/${IDS.kolLead}` },
        { n: 4, label: 'Lead Conversion', path: `/leads/${IDS.kolLead}` },
        { n: 5, label: 'Opportunity & Path', path: oppExists ? `/opportunities/${IDS.opp}` : `/leads/${IDS.kolLead}` },
        { n: 6, label: 'Proposal / Quoting', path: oppExists ? `/opportunities/${IDS.opp}` : `/leads/${IDS.kolLead}` },
        { n: 7, label: 'Contracting & E-Signature', path: contractExists ? `/contracts/${IDS.contract}` : (oppExists ? `/opportunities/${IDS.opp}` : `/leads/${IDS.kolLead}`) },
        { n: 8, label: 'Onboarding Kickoff', path: oppExists ? `/opportunities/${IDS.opp}/onboarding` : `/leads/${IDS.kolLead}` },
        { n: 9, label: 'ClinOps Handoff (Asana)', path: oppExists ? `/opportunities/${IDS.opp}/handoff` : `/leads/${IDS.kolLead}` },
        { n: 10, label: 'Change Order', path: coExists ? `/opportunities/${IDS.changeOrder}` : (oppExists ? `/opportunities/${IDS.opp}` : `/leads/${IDS.kolLead}`) },
        { n: 11, label: 'Leadership Dashboard', path: '/dashboards' },
    ];
}

export function setDemoStep(n) {
    const max = journeySteps().length - 1;
    state.demoStep = Math.max(0, Math.min(max, n));
    emit();
}

export function setDiscoveryMode(on) {
    state.discoveryMode = !!on;
    emit();
}

/** Reset Demo: restore the seed exactly. */
export function reset() {
    state = buildSeed();
    emit();
}

/* ------------------------------------------------------------------ */
/* Mutations — intake / triage                                         */
/* ------------------------------------------------------------------ */

/** Approve a triaged Research Study and assign a BD rep (human BD step). */
export function approveAndAssignStudy(studyId, repName) {
    const study = getStudy(studyId);
    if (!study) return { ok: false, error: 'Study not found.' };
    study.status = 'Assigned';
    study.assignedTo = repName;
    // Assigning the study assigns its Leads and fires the one-time Clay enrichment.
    study.leadIds.forEach((leadId) => {
        const lead = getLead(leadId);
        if (lead && !lead.converted) {
            lead.status = 'Assigned';
            lead.owner = repName;
            autoEnrichLead(lead);
        }
    });
    state.activities.push({
        id: nextId('act'), parentId: studyId, type: 'Task', iconName: 'standard:task',
        subject: `Approved & assigned to ${repName}`,
        detail: `BD Coordinator (${PEOPLE.bdCoordinator}) approved the study out of triage and assigned ${repName}.`,
        date: new Date().toISOString(),
    });
    showToast({ title: 'Study assigned', message: `${study.sponsor} — assigned to ${repName}. Leads assigned and Clay enrichment fired.`, variant: 'success' });
    emit();
    return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Mutations — leads / enrichment / conversion                         */
/* ------------------------------------------------------------------ */

const CLAY_DATA = {
    [IDS.kolLead]: { email: 'n.kessler@neurocessa.example', phone: '(617) 555-0184', linkedin: 'linkedin.example/in/naomi-kessler-md' },
    [IDS.piLead]: { email: 'evasquez@lakeshoreneuro.example', phone: '(312) 555-0119', linkedin: 'linkedin.example/in/elena-vasquez-md' },
    'lead-bg-1': { email: 'f.osei@cortexal.example', phone: '(617) 555-0173', linkedin: 'linkedin.example/in/farid-osei' },
};

function applyClay(lead, note) {
    const data = CLAY_DATA[lead.id] || {
        email: `${lead.name.toLowerCase().replace(/[^a-z]+/g, '.')}@example.com`,
        phone: '(555) 555-0100',
        linkedin: `linkedin.example/in/${lead.name.toLowerCase().replace(/[^a-z]+/g, '-')}`,
    };
    lead.email = data.email;
    lead.phone = data.phone;
    lead.linkedin = data.linkedin;
    lead.enriched = true;
    lead.enrichedAt = new Date().toISOString();
    lead.enrichmentNote = note;
}

/** One-time automated enrichment when a lead is assigned to a BD rep. */
function autoEnrichLead(lead) {
    if (lead.enriched) return;
    applyClay(lead, 'One-time Clay enrichment on assignment (automated)');
    showToast({ title: 'Clay enrichment complete', message: `${lead.name}: verified email, phone, and LinkedIn populated.`, variant: 'info' });
}

/** On-demand "Enrich with Clay" button. Per-record only — no bulk enrichment. */
export function enrichLead(leadId) {
    const lead = getLead(leadId);
    if (!lead) return { ok: false, error: 'Lead not found.' };
    if (lead.enriched) {
        showToast({ title: 'Already enriched', message: `${lead.name} was enriched ${lead.enrichmentNote ? `(${lead.enrichmentNote.toLowerCase()})` : ''}.`, variant: 'info' });
        return { ok: true, already: true };
    }
    applyClay(lead, 'On-demand Clay enrichment (ad hoc)');
    showToast({ title: 'Clay enrichment complete', message: `${lead.name}: verified email, phone, and LinkedIn populated.`, variant: 'success' });
    emit();
    return { ok: true };
}

/** Duplicate check surfaced in the conversion modal before converting. */
export function runDuplicateCheck(leadId) {
    const lead = getLead(leadId);
    if (!lead) return { accounts: [], contacts: [] };
    const accounts = state.accounts.filter((a) => a.recordType === 'Organization' && a.name.toLowerCase() === lead.company.toLowerCase());
    const contacts = state.contacts.filter((c) => c.name.toLowerCase() === lead.name.toLowerCase());
    return { accounts, contacts };
}

/**
 * Custom one-click Lead Conversion (on-demand only; never stage-triggered).
 * Creates, in a single flow: Opportunity + Research Study link + Account +
 * Clinical Sites + KOL Contacts + Opportunity Contact Roles + Opportunity
 * Sites (engaged / non-engaged). Close Date is required — blank blocks
 * conversion with a validation error.
 */
export function convertLead(leadId, { closeDate } = {}) {
    const lead = getLead(leadId);
    if (!lead) return { ok: false, error: 'Lead not found.' };
    if (lead.converted) return { ok: false, error: 'Lead has already been converted.' };
    if (!closeDate) {
        return { ok: false, error: 'Review the errors on this page. Close Date: A value is required to create the Opportunity.' };
    }
    if (leadId !== IDS.kolLead && leadId !== IDS.piLead) {
        return { ok: false, error: 'For this wireframe, conversion is scripted for the Neurocessa journey leads.' };
    }

    const study = getStudy(IDS.study);

    // 1. Account (sponsor organization)
    if (!getAccount(IDS.sponsorAccount)) {
        state.accounts.push({
            id: IDS.sponsorAccount,
            name: 'Neurocessa Therapeutics',
            recordType: 'Organization',
            city: 'Cambridge', state: 'MA',
            phone: '(617) 555-0160',
            website: 'neurocessa.example',
            tier: 'Tier 3 — clinical-stage biotech',
            description: 'Clinical-stage biotech developing NRX-214 for Major Depressive Disorder.',
            studyId: IDS.study,
        });
    }

    // 2. KOL Contacts (both journey leads convert in the same flow)
    const kol = getLead(IDS.kolLead);
    const pi = getLead(IDS.piLead);
    if (!getContact(IDS.kolContact)) {
        state.contacts.push({
            id: IDS.kolContact, name: kol.name, title: kol.title,
            accountId: IDS.sponsorAccount, accountName: 'Neurocessa Therapeutics',
            email: kol.email, phone: kol.phone, linkedin: kol.linkedin,
            role: 'KOL Contact', enriched: kol.enriched, studyId: IDS.study, mcae: kol.mcae,
        });
    }
    if (!getContact(IDS.piContact)) {
        state.contacts.push({
            id: IDS.piContact, name: pi.name, title: pi.title,
            accountId: 'site-01', accountName: 'Lakeshore Neuroscience Institute',
            email: pi.email, phone: pi.phone, linkedin: pi.linkedin,
            role: 'Principal Investigator', enriched: pi.enriched, studyId: IDS.study, mcae: pi.mcae,
        });
    }

    // 3. Opportunity (Sales record type) with stage history through Qualification
    if (!getOpportunity(IDS.opp)) {
        state.opportunities.unshift({
            id: IDS.opp,
            name: 'Neurocessa — NRX-214 Ph2 MDD — EEG Services',
            recordType: 'Sales',
            accountId: IDS.sponsorAccount,
            accountName: 'Neurocessa Therapeutics',
            studyId: IDS.study,
            stage: 'Qualification',
            forecastCategory: forecastForStage('Qualification', 'Sales'),
            amount: 0,
            closeDate,
            owner: PEOPLE.bdRep,
            awardLetterReceived: false,
            cboReviewed: false,
            contractStatus: 'None',
            parentOpportunityId: '',
            exhibit: '',
            nextStep: 'Confirm proposal requirements with Dr. Kessler',
            lossReason: '',
            createdAt: new Date().toISOString(),
            closedAt: '',
            stageHistory: [
                { stage: 'Triage', enteredAt: stamp(-1, 9, 0) },
                { stage: 'Awareness', enteredAt: stamp(-1, 9, 30) },
                { stage: 'Nurture', enteredAt: stamp(-1, 10, 0) },
                { stage: 'Qualification', enteredAt: new Date().toISOString() },
            ],
            description: 'Full-service EEG program: Waveband devices, platform, and Scientific Services for the NRX-214-202 Phase 2 MDD trial (14 US sites).',
        });

        // Opportunity Products — flexible line items; total is a simple sum.
        const products = [
            { product: 'Device & Logistics Services', quantity: 84, amount: 126000, note: 'Waveband units + shipping/returns across 14 sites' },
            { product: 'Clinical Operations Support (site-month)', quantity: 168, amount: 336000, note: '14 sites × 12 months' },
            { product: 'Beacon Platform: Core Tier (Trial Insights Hub + Biosignal Studio + Quality Suite + Sleep Analytics Suite)', quantity: 1, amount: 240000, note: 'Study-term platform license' },
            { product: 'Scientific Services Base Package', quantity: 1, amount: 95000, note: 'Endpoint definition + analysis plan' },
            { product: 'Scientific PM (monthly retainer)', quantity: 12, amount: 144000, note: '12 months' },
            { product: 'Interim Analysis Report (add-on)', quantity: 1, amount: 45000, note: 'Optional interim read' },
        ];
        products.forEach((p) => state.opportunityProducts.push({ id: nextId('prod'), oppId: IDS.opp, ...p }));
        getOpportunity(IDS.opp).amount = getProductTotal(IDS.opp);

        // Opportunity Team (add/remove without admin friction on the record page)
        [
            { name: PEOPLE.bdRep, role: 'BD' },
            { name: PEOPLE.clinOpsPm, role: 'Program Management' },
            { name: PEOPLE.scientific, role: 'Scientific' },
        ].forEach((m) => state.opportunityTeam.push({ id: nextId('team'), oppId: IDS.opp, ...m }));

        // Opportunity Contact Roles
        state.opportunityContactRoles.push(
            { id: nextId('ocr'), oppId: IDS.opp, contactId: IDS.kolContact, contactName: kol.name, role: 'Decision Maker' },
            { id: nextId('ocr'), oppId: IDS.opp, contactId: IDS.piContact, contactName: pi.name, role: 'Principal Investigator' },
        );

        // Opportunity Sites (junction) — engaged / non-engaged per site
        NEUROCESSA_SITES.forEach((s) => {
            state.opportunitySites.push({
                id: nextId('osite'), oppId: IDS.opp, siteAccountId: s.id, siteName: s.name,
                status: s.engaged ? 'Engaged' : 'Non-Engaged', pi: s.pi, city: s.city, state: s.state,
            });
        });

        // Contract shell (Draft) so the Contracting screen has a record to walk.
        state.contracts.unshift({
            id: IDS.contract, oppId: IDS.opp, name: 'NRX-214 Phase 2 — EEG Services SOW #1',
            type: 'SOW', status: 'Draft', exhibit: 'Exhibit A',
            sentAt: '', viewedAt: '', signedAt: '', files: [],
        });

        // Research Study link
        if (study) { study.opportunityId = IDS.opp; }

        state.activities.push({
            id: nextId('act'), parentId: IDS.opp, type: 'Task', iconName: 'standard:lead',
            subject: 'Created via custom Lead Conversion',
            detail: 'One-click conversion created Account, KOL Contacts, Opportunity, Contact Roles, and 14 Opportunity Sites.',
            date: new Date().toISOString(),
        });
    }

    // Mark both journey leads converted
    [kol, pi].forEach((l) => {
        l.converted = true;
        l.status = 'Converted';
        l.convertedIds = {
            accountId: IDS.sponsorAccount,
            contactId: l.id === IDS.kolLead ? IDS.kolContact : IDS.piContact,
            opportunityId: IDS.opp,
        };
    });

    showToast({ title: 'Lead converted', message: 'Account, 2 KOL Contacts, Opportunity, Contact Roles, and 14 Opportunity Sites created in one flow.', variant: 'success' });
    emit();
    return {
        ok: true,
        created: {
            accountId: IDS.sponsorAccount,
            contactIds: [IDS.kolContact, IDS.piContact],
            opportunityId: IDS.opp,
            studyId: IDS.study,
            siteCount: NEUROCESSA_SITES.length,
            engagedCount: NEUROCESSA_SITES.filter((s) => s.engaged).length,
        },
    };
}

/* ------------------------------------------------------------------ */
/* Mutations — opportunity stage / gates / slack                       */
/* ------------------------------------------------------------------ */

/**
 * Move an opportunity to a stage, enforcing the handbook gates:
 *  - Consideration requires CBO review approved (quote checkpoint).
 *  - Contracting requires the Award Letter flag.
 *  - Closed Won requires an executed (Signed) contract.
 * Returns { ok, error? }.
 */
export function setOpportunityStage(oppId, stageName) {
    const opp = getOpportunity(oppId);
    if (!opp) return { ok: false, error: 'Opportunity not found.' };
    const stages = stagesForRecordType(opp.recordType);
    const valid = stages.some((s) => s.name === stageName) || stageName === 'Closed Lost';
    if (!valid) return { ok: false, error: `Unknown stage "${stageName}".` };
    if (opp.stage === stageName) return { ok: true, unchanged: true };

    const order = stages.map((s) => s.name);
    const targetIdx = order.indexOf(stageName);
    const currentIdx = order.indexOf(opp.stage);
    const advancing = stageName === 'Closed Lost' ? false : targetIdx > currentIdx;

    if (advancing && opp.recordType === 'Sales') {
        if (targetIdx >= order.indexOf('Consideration') && !opp.cboReviewed) {
            return { ok: false, error: 'Cannot advance past Request: CBO review / approval of the external quote sheet must be checked first (Proposal & Quoting checkpoint).' };
        }
        if (targetIdx >= order.indexOf('Contracting') && !opp.awardLetterReceived) {
            return { ok: false, error: 'Cannot enter Contracting: an Award Letter must be received first. Use “Log Award Letter” on this Opportunity.' };
        }
    }
    if (advancing && stageName === 'Closed Won') {
        const signed = getContractsForOpp(oppId).some((c) => c.status === 'Signed');
        if (!signed) {
            return { ok: false, error: 'Cannot mark Closed Won: an executed (Signed) contract is required on this Opportunity.' };
        }
    }

    const prev = opp.stage;
    opp.stage = stageName;
    opp.forecastCategory = forecastForStage(stageName, opp.recordType);
    opp.stageHistory.push({ stage: stageName, enteredAt: new Date().toISOString() });
    state.activities.push({
        id: nextId('act'), parentId: oppId, type: 'Task', iconName: 'standard:stage',
        subject: `Stage changed: ${prev} → ${stageName}`,
        detail: `Forecast category: ${opp.forecastCategory}.`,
        date: new Date().toISOString(),
    });

    // Slack: record channel auto-created when a Sales opp advances past Qualification.
    if (opp.recordType === 'Sales' && advancing && targetIdx > order.indexOf('Qualification')) {
        ensureKamSlackChannel(opp);
    }
    // Slack notification rules — exactly two events: Closed Won, Closed Lost.
    if (stageName === 'Closed Won' || stageName === 'Closed Lost') {
        const channel = getSlackChannelForOpp(opp.recordType === 'Change Order' ? opp.parentOpportunityId : oppId);
        if (channel) {
            channel.messages.push({
                id: nextId('msg'), author: 'Salesforce (notification rule)', ts: new Date().toISOString(),
                text: stageName === 'Closed Won'
                    ? `:tada: ${opp.name} is CLOSED WON — ${formatMoney(opp.amount)}. Onboarding kickoff starting.`
                    : `:red_circle: ${opp.name} is Closed Lost. ${opp.lossReason || ''}`,
            });
        }
        opp.closedAt = new Date().toISOString();
    }

    if (stageName === 'Closed Won' && oppId === IDS.opp) {
        runClosedWonSequence(opp);
    }
    if (stageName === 'Closed Won' && oppId === IDS.changeOrder) {
        showToast({ title: 'Change Order Closed Won', message: 'Time-based fee extension executed. Dashboards updated.', variant: 'success' });
    }

    showToast({ title: 'Stage updated', message: `${opp.name.split(' — ')[0]} moved to ${stageName}.`, variant: 'success' });
    emit();
    return { ok: true };
}

/** Mark Stage as Complete: advance to the next stage in the path. */
export function markStageComplete(oppId) {
    const opp = getOpportunity(oppId);
    if (!opp) return { ok: false, error: 'Opportunity not found.' };
    const order = stagesForRecordType(opp.recordType).map((s) => s.name);
    const idx = order.indexOf(opp.stage);
    if (idx < 0 || idx >= order.length - 1) return { ok: false, error: 'Already at the final stage.' };
    return setOpportunityStage(oppId, order[idx + 1]);
}

export function markAwardLetter(oppId) {
    const opp = getOpportunity(oppId);
    if (!opp) return { ok: false, error: 'Opportunity not found.' };
    opp.awardLetterReceived = true;
    state.activities.push({
        id: nextId('act'), parentId: oppId, type: 'Email', iconName: 'standard:contract',
        subject: 'Award Letter received',
        detail: 'Award Letter logged — Contracting stage entry criterion met.',
        date: new Date().toISOString(),
    });
    showToast({ title: 'Award Letter logged', message: 'Contracting stage is now unlocked for this Opportunity.', variant: 'success' });
    emit();
    return { ok: true };
}

export function setCboReviewed(oppId, checked) {
    const opp = getOpportunity(oppId);
    if (!opp) return { ok: false, error: 'Opportunity not found.' };
    opp.cboReviewed = !!checked;
    if (checked) {
        showToast({ title: 'CBO review approved', message: 'Quote checkpoint cleared — the Path can advance from Request to Consideration.', variant: 'success' });
    }
    emit();
    return { ok: true };
}

export function setCloseDate(oppId, closeDate) {
    const opp = getOpportunity(oppId);
    if (!opp) return { ok: false, error: 'Opportunity not found.' };
    opp.closeDate = closeDate;
    emit();
    return { ok: true };
}

function ensureKamSlackChannel(opp) {
    if (getSlackChannelForOpp(opp.id)) return;
    const team = getTeamForOpp(opp.id);
    const members = team.length ? team.map((t) => t.name) : [opp.owner];
    state.slackChannels.push({
        id: nextId('slack'),
        oppId: opp.id,
        name: opp.id === IDS.opp ? '#bz-neurocessa-kam' : `#bz-${opp.accountName.split(' ')[0].toLowerCase()}-kam`,
        purpose: 'Opportunity record channel (auto-created past Qualification)',
        members,
        notificationRules: ['Closed Won', 'Closed Lost'],
        messages: [
            { id: nextId('msg'), author: 'Salesforce (channel bot)', ts: new Date().toISOString(), text: `Record channel created for ${opp.name}. Opportunity Team added: ${members.join(', ')}.` },
            { id: nextId('msg'), author: opp.owner, ts: new Date().toISOString(), text: 'Proposal request is in — quote sheet started in the SharePoint workspace. Scientific + ClinOps + Engineering, please add your scoping inputs.' },
        ],
    });
    showToast({ title: 'Slack channel created', message: `${getSlackChannelForOpp(opp.id).name} auto-created with the Opportunity Team as members.`, variant: 'info' });
}

function formatMoney(n) {
    return '$' + Number(n || 0).toLocaleString('en-US');
}

/* ------------------------------------------------------------------ */
/* Mutations — products / team                                         */
/* ------------------------------------------------------------------ */

function syncOppAmount(oppId) {
    const opp = getOpportunity(oppId);
    if (opp && getProductsForOpp(oppId).length) {
        opp.amount = getProductTotal(oppId);
    }
}

export function addProduct(oppId, { product, quantity, amount, note = '' }) {
    state.opportunityProducts.push({ id: nextId('prod'), oppId, product, quantity: Number(quantity) || 0, amount: Number(amount) || 0, note });
    syncOppAmount(oppId);
    emit();
    return { ok: true };
}

export function updateProduct(productId, { quantity, amount }) {
    const p = state.opportunityProducts.find((x) => x.id === productId);
    if (!p) return { ok: false, error: 'Line item not found.' };
    if (quantity !== undefined) p.quantity = Number(quantity) || 0;
    if (amount !== undefined) p.amount = Number(amount) || 0;
    syncOppAmount(p.oppId);
    emit();
    return { ok: true };
}

export function removeProduct(productId) {
    const p = state.opportunityProducts.find((x) => x.id === productId);
    if (!p) return { ok: false, error: 'Line item not found.' };
    state.opportunityProducts = state.opportunityProducts.filter((x) => x.id !== productId);
    syncOppAmount(p.oppId);
    emit();
    return { ok: true };
}

export const TEAM_ROLES = ['BD', 'Program Management', 'Medical Director', 'Scientific', 'Engineering', 'ClinOps'];

export function addTeamMember(oppId, { name, role }) {
    if (!name || !role) return { ok: false, error: 'Name and role are required.' };
    state.opportunityTeam.push({ id: nextId('team'), oppId, name, role });
    const channel = getSlackChannelForOpp(oppId);
    if (channel && !channel.members.includes(name)) channel.members.push(name);
    emit();
    return { ok: true };
}

export function removeTeamMember(memberId) {
    state.opportunityTeam = state.opportunityTeam.filter((t) => t.id !== memberId);
    emit();
    return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Mutations — contracting & e-signature (Adobe Acrobat Sign)          */
/* ------------------------------------------------------------------ */

function pushAudit(contractId, event, field, oldValue, newValue, actor = 'Adobe Acrobat Sign (managed package)') {
    state.auditTrail.push({ id: nextId('audit'), contractId, timestamp: new Date().toISOString(), actor, event, field, oldValue, newValue });
}

/** Step 1 of the managed-package flow: Upload document (redlined offline). */
export function contractUpload(contractId) {
    const c = getContract(contractId);
    if (!c) return { ok: false, error: 'Contract not found.' };
    if (c.status !== 'Draft') return { ok: false, error: 'Document already uploaded.' };
    c.status = 'Uploaded';
    c.files.push({ id: nextId('file'), name: fileBase(c) + '_v4_FINAL.pdf', kind: 'PDF', addedAt: new Date().toISOString() });
    pushAudit(contractId, 'Document uploaded', 'Status', 'Draft', 'Uploaded', PEOPLE.bdRep);
    showToast({ title: 'Document uploaded', message: 'Final (offline-redlined) document attached to the agreement.', variant: 'success' });
    emit();
    return { ok: true };
}

/** Step 2: Tag signature fields. */
export function contractTag(contractId) {
    const c = getContract(contractId);
    if (!c) return { ok: false, error: 'Contract not found.' };
    if (c.status !== 'Uploaded') return { ok: false, error: c.status === 'Draft' ? 'Upload the document first.' : 'Signature fields already tagged.' };
    c.status = 'Tagged';
    pushAudit(contractId, 'Signature fields tagged', 'Status', 'Uploaded', 'Tagged', PEOPLE.bdRep);
    showToast({ title: 'Signature fields tagged', message: 'Signer blocks placed for sponsor and Beacon signatories.', variant: 'success' });
    emit();
    return { ok: true };
}

/** Step 3: Send for signature. */
export function contractSend(contractId) {
    const c = getContract(contractId);
    if (!c) return { ok: false, error: 'Contract not found.' };
    if (c.status !== 'Tagged') return { ok: false, error: c.status === 'Sent' || c.status === 'Viewed' || c.status === 'Signed' ? 'Agreement already sent.' : 'Upload and tag the document first.' };
    c.status = 'Sent';
    c.sentAt = new Date().toISOString();
    pushAudit(contractId, 'Agreement sent for signature', 'Status', 'Tagged', 'Sent');
    const opp = getOpportunity(c.oppId);
    if (opp) opp.contractStatus = 'Sent';
    showToast({ title: 'Sent for signature', message: 'Adobe Acrobat Sign envelope sent to the sponsor signatory.', variant: 'success' });
    emit();
    return { ok: true };
}

/**
 * Presenter control "Simulate Sponsor Action": advances Sent → Viewed → Signed
 * via the standard managed-package callback. On Signed: executed PDF lands in
 * Files, the Opportunity contract status updates, audit entries append.
 */
export function contractSimulateSponsor(contractId) {
    const c = getContract(contractId);
    if (!c) return { ok: false, error: 'Contract not found.' };
    const opp = getOpportunity(c.oppId);
    if (c.status === 'Sent') {
        c.status = 'Viewed';
        c.viewedAt = new Date().toISOString();
        pushAudit(contractId, 'Agreement viewed by signer (callback)', 'Status', 'Sent', 'Viewed');
        if (opp) opp.contractStatus = 'Viewed';
        showToast({ title: 'Sponsor viewed the agreement', message: 'Status updated via Adobe Acrobat Sign callback.', variant: 'info' });
        emit();
        return { ok: true, now: 'Viewed' };
    }
    if (c.status === 'Viewed') {
        c.status = 'Signed';
        c.signedAt = new Date().toISOString();
        c.files.push({ id: nextId('file'), name: fileBase(c) + '_EXECUTED.pdf', kind: 'PDF', addedAt: new Date().toISOString() });
        pushAudit(contractId, 'Agreement signed — executed PDF returned', 'Status', 'Viewed', 'Signed');
        if (opp) {
            opp.contractStatus = 'Signed';
            state.activities.push({
                id: nextId('act'), parentId: opp.id, type: 'Email', iconName: 'standard:contract',
                subject: `${c.name} executed`,
                detail: 'Executed PDF filed against the Contract. Closed Won gate satisfied.',
                date: new Date().toISOString(),
            });
        }
        showToast({ title: 'Contract signed', message: 'Executed PDF added to Files. Opportunity contract status: Signed.', variant: 'success' });
        emit();
        return { ok: true, now: 'Signed' };
    }
    return { ok: false, error: c.status === 'Signed' ? 'Agreement is already signed.' : 'Send the agreement first.' };
}

function fileBase(contract) {
    return contract.name.replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 32);
}

/* ------------------------------------------------------------------ */
/* Closed Won sequence — onboarding + handoff side effects             */
/* ------------------------------------------------------------------ */

function runClosedWonSequence(opp) {
    const ob = state.onboarding;

    // (a) Client Onboarding Form — no project lead identified yet, so the
    //     fallback fires: flag + Task created for manual assignment.
    if (ob.formStatus === 'Not Sent') {
        const taskId = nextId('task');
        ob.formStatus = 'No recipient defined — task created';
        ob.fallbackTaskId = taskId;
        state.tasks.push({
            id: taskId,
            subject: 'Client Onboarding Form: no recipient defined — assign a project lead and send manually',
            relatedTo: opp.name, relatedId: opp.id, relatedType: 'opportunity',
            assignedTo: opp.owner, dueDate: daysFromNow(2), status: 'Open', priority: 'High',
            origin: 'Automation (onboarding form fallback)',
        });
    }

    // (c/d) Pre-populate what the system knows; presenter completes the rest.
    ob.exhibit = { letter: 'Exhibit A', sow: 'NRX-214 Phase 2 — EEG Services SOW #1', projectName: 'Neurocessa NRX-214 Phase 2 (MDD)' };
    const sow = getContract(IDS.contract);
    ob.costInfo = {
        amount: formatMoney(opp.amount),
        totalHours: '3,200',
        creditedHours: '120',
        hourlyRate: '$185',
        weeks: '52',
        upfrontPayment: '$148,000',
        netTerms: 'Net 45',
        msaExecutedDate: sow && sow.signedAt ? sow.signedAt.slice(0, 10) : '',
    };

    // (Step 9) Asana project created on Closed Won (outbound push via MuleSoft).
    if (!state.asana.created) {
        state.asana = {
            created: true,
            projectName: 'Neurocessa NRX-214 Ph2 — Delivery',
            asanaId: 'ASN-88412',
            pmAssigned: '',
            pmSynced: false,
            status: 'Onboarding',
            statusHistory: [{ status: 'Onboarding', at: new Date().toISOString() }],
            details: {
                devicesNeeded: '84 Wavebands (14 sites × 6)',
                siteList: '14 US sites (9 engaged at close)',
                studyProtocol: 'NRX-214-202 · NCT07-DEMO-214',
                sponsorContacts: 'Dr. Naomi Kessler (VP Clinical Development); Dr. Elena Vasquez (PI, Lakeshore)',
                proposedStartDate: daysFromNow(30),
            },
        };
    }

    // Post-SOW Slack channel.
    if (!state.slackChannels.some((cnl) => cnl.name === '#ls-neurocessa-p1')) {
        state.slackChannels.push({
            id: nextId('slack'),
            oppId: IDS.opp,
            name: '#ls-neurocessa-p1',
            purpose: 'Post-SOW delivery channel (created on Closed Won)',
            members: [PEOPLE.bdRep, PEOPLE.clinOpsPm, PEOPLE.engineering, PEOPLE.scientific],
            notificationRules: [],
            messages: [
                { id: nextId('msg'), author: 'Salesforce (channel bot)', ts: new Date().toISOString(), text: 'Post-SOW channel created for Neurocessa NRX-214 Ph2 delivery.' },
            ],
        });
    }

    showToast({ title: 'Closed Won sequence started', message: 'Onboarding form fallback task created · Asana project pushed · #ls-neurocessa-p1 opened.', variant: 'info' });
}

/* ------------------------------------------------------------------ */
/* Mutations — onboarding kickoff                                      */
/* ------------------------------------------------------------------ */

export function sendOnboardingForm(recipient) {
    const ob = state.onboarding;
    if (!recipient) return { ok: false, error: 'Pick a recipient (project lead) first.' };
    ob.formStatus = 'Sent';
    ob.formRecipient = recipient;
    if (ob.fallbackTaskId) {
        const t = state.tasks.find((x) => x.id === ob.fallbackTaskId);
        if (t) t.status = 'Completed';
    }
    showToast({ title: 'Client Onboarding Form sent', message: `Form sent to ${recipient}.`, variant: 'success' });
    emit();
    return { ok: true };
}

export function setProjectRole(roleKey, value) {
    if (!(roleKey in state.onboarding.roles)) return { ok: false, error: 'Unknown role.' };
    state.onboarding.roles[roleKey] = value;
    emit();
    return { ok: true };
}

export function completeKickoff() {
    const r = state.onboarding.roles;
    const missing = Object.entries({ 'Billing Contact': r.billingContact, 'Product Owner': r.productOwner, 'Executive Sponsor': r.executiveSponsor, 'End Users': r.endUsers })
        .filter(([, v]) => !v).map(([k]) => k);
    if (missing.length) {
        return { ok: false, error: `Kickoff cannot be marked complete until all Key Project Roles are populated. Missing: ${missing.join(', ')}.` };
    }
    state.onboarding.kickoffComplete = true;
    showToast({ title: 'Onboarding kickoff complete', message: 'All Key Project Roles captured.', variant: 'success' });
    emit();
    return { ok: true };
}

export function assignExhibit({ letter, sow, projectName }) {
    state.onboarding.exhibit = { letter, sow, projectName };
    const opp = getOpportunity(IDS.opp);
    if (opp) opp.exhibit = letter;
    showToast({ title: 'Exhibit assigned', message: `${letter} tied to ${sow}.`, variant: 'success' });
    emit();
    return { ok: true };
}

export function setCostInfo(fields) {
    state.onboarding.costInfo = { ...state.onboarding.costInfo, ...fields };
    emit();
    return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Mutations — Asana handoff                                           */
/* ------------------------------------------------------------------ */

export function assignProgramManager(name) {
    if (!state.asana.created) return { ok: false, error: 'Asana project not created yet (requires Closed Won).' };
    state.asana.pmAssigned = name;
    state.asana.pmSynced = true;
    showToast({ title: 'Program Manager assigned', message: `${name} assigned in Salesforce and synced to Asana (matched on ${state.asana.asanaId}).`, variant: 'success' });
    emit();
    return { ok: true };
}

/** Presenter control: PM updates project status in Asana; status syncs inbound. */
export function advanceAsanaStatus() {
    const a = state.asana;
    if (!a.created) return { ok: false, error: 'Asana project not created yet (requires Closed Won).' };
    const flow = ['Onboarding', 'Active', 'Late Stage: Renewal Window'];
    const idx = flow.indexOf(a.status);
    if (idx < 0 || idx >= flow.length - 1) return { ok: false, error: 'Project is already at Late Stage: Renewal Window.' };
    a.status = flow[idx + 1];
    a.statusHistory.push({ status: a.status, at: new Date().toISOString() });

    if (a.status === 'Late Stage: Renewal Window') {
        state.tasks.push({
            id: nextId('task'),
            subject: 'Project entering renewal window: identify next-phase opportunity',
            relatedTo: getOpportunity(IDS.opp)?.name || 'Neurocessa opportunity',
            relatedId: IDS.opp, relatedType: 'opportunity',
            assignedTo: PEOPLE.bdRep, dueDate: daysFromNow(7), status: 'Open', priority: 'High',
            origin: 'Automation (Asana status sync — alert task)',
        });
        showToast({ title: 'Renewal window alert', message: `Salesforce Task auto-created for ${PEOPLE.bdRep}: identify next-phase opportunity.`, variant: 'warning' });
    } else {
        showToast({ title: 'Asana status synced', message: `Project status is now “${a.status}” (inbound, matched on Asana ID).`, variant: 'info' });
    }
    emit();
    return { ok: true, now: a.status };
}

/* ------------------------------------------------------------------ */
/* Mutations — Change Order                                            */
/* ------------------------------------------------------------------ */

/**
 * Log a Schedule Extension Notification (45 days beyond the Estimated
 * Schedule, past the 30-day trigger) and create the Change Order opportunity:
 * Change Order record type, its own abbreviated path, linked to the parent
 * opportunity and Exhibit A, pre-populated with time-based line items only.
 */
export function createChangeOrder() {
    if (getOpportunity(IDS.changeOrder)) return { ok: true, id: IDS.changeOrder, already: true };
    const parent = getOpportunity(IDS.opp);
    if (!parent) return { ok: false, error: 'Parent opportunity not found.' };

    state.changeOrder.created = true;
    state.changeOrder.notificationLogged = true;

    state.opportunities.unshift({
        id: IDS.changeOrder,
        name: 'Neurocessa — NRX-214 Ph2 — Change Order #1 (Schedule Extension)',
        recordType: 'Change Order',
        accountId: parent.accountId,
        accountName: parent.accountName,
        studyId: parent.studyId,
        stage: 'Identified',
        forecastCategory: forecastForStage('Identified', 'Change Order'),
        amount: 0,
        closeDate: daysFromNow(30),
        owner: parent.owner,
        awardLetterReceived: true,
        cboReviewed: true,
        contractStatus: 'None',
        parentOpportunityId: IDS.opp,
        exhibit: 'Exhibit A',
        nextStep: 'Confirm extension scope with sponsor',
        lossReason: '',
        createdAt: new Date().toISOString(),
        closedAt: '',
        stageHistory: [{ stage: 'Identified', enteredAt: new Date().toISOString() }],
        description: 'Schedule Extension Notification: project schedule extending 45 days beyond the Estimated Schedule (>30-day trigger). Per the SOW, the parties execute a Change Order to extend time-based fees.',
    });

    // Time-based line items only.
    state.opportunityProducts.push(
        { id: nextId('prod'), oppId: IDS.changeOrder, product: 'Clinical Operations Support extension (site-month)', quantity: 21, amount: 42000, note: '14 sites × 1.5 months' },
        { id: nextId('prod'), oppId: IDS.changeOrder, product: 'Scientific PM (monthly retainer) extension', quantity: 2, amount: 24000, note: '45-day extension, rounded to 2 retainer months' },
    );
    getOpportunity(IDS.changeOrder).amount = getProductTotal(IDS.changeOrder);

    // Abbreviated contract for the CO flow.
    state.contracts.unshift({
        id: IDS.coContract, oppId: IDS.changeOrder,
        name: 'NRX-214 Change Order #1 — Time-Based Fee Extension',
        type: 'Change Order', status: 'Draft', exhibit: 'Exhibit A',
        sentAt: '', viewedAt: '', signedAt: '', files: [],
    });

    state.activities.push({
        id: nextId('act'), parentId: IDS.changeOrder, type: 'Task', iconName: 'standard:record_update',
        subject: 'Created from Schedule Extension Notification',
        detail: '45-day extension beyond Estimated Schedule (30-day trigger) logged on the parent opportunity.',
        date: new Date().toISOString(),
    });

    showToast({ title: 'Change Order created', message: 'Change Order opportunity created with time-based line items, linked to the parent opportunity and Exhibit A.', variant: 'success' });
    emit();
    return { ok: true, id: IDS.changeOrder };
}
