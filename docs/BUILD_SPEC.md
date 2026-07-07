# Beacon Biosignals LS Sales Wireframe — Build Spec (for page implementers)

High-fidelity clickable wireframe of a future-state Salesforce Life Sciences Cloud
implementation for **Beacon Biosignals** (EEG-based clinical trial services), built inside
the SLDS 2 Starter Kit (LWC + Vite + lightning-base-components). It must read as a real
Lightning app. All data is fictitious.

Repo root: `beacon-ls-demo/`. Read `AGENTS.md` and
`.agent/skills/afv-library/applying-slds/SKILL.md` before writing UI.

## Non-negotiable conventions

- Prefer **Lightning Base Components** (`lightning-card`, `lightning-button`,
  `lightning-icon`, `lightning-badge`, `lightning-tabset`/`lightning-tab`,
  `lightning-input`, `lightning-combobox`, `lightning-datatable`,
  `lightning-progress-indicator`, `lightning-formatted-number`, …) over hand-rolled SLDS
  markup. If you hand-roll a blueprint, note it in your summary.
- Modals **extend `lightning/modal`** following `src/modules/ui/demoModal/`
  (open imperatively: `await MyModal.open({ size: 'medium', ... })`; `@api` fields receive
  the open() options; close with `this.close(result)`).
- All form inputs are `lightning-*` components. Never raw `<input>`/`<select>`/`<textarea>`.
- **No inline `style` attributes. No `!important`.** Custom CSS classes use `c-*` prefix and
  `var(--slds-g-*, fallback)` hooks only (verify hooks exist with
  `node .agent/skills/afv-library/applying-slds/scripts/search-hooks.cjs --prefix "<hook>"`).
- Spacing/layout via SLDS utility classes (`slds-grid`, `slds-col`, `slds-p-*`, `slds-m-*`,
  `slds-size_*`, `slds-wrap`, `slds-gutters`, `slds-text-*`).
- Every `lightning-icon` needs `alternative-text`.
- LWC templates: no complex expressions; compute in getters. `for:each` needs `key`.
- After writing each `.html`/`.css`, run
  `npx @salesforce-ux/slds-linter@latest lint <file>` (cwd = repo root) and fix findings.

## Page & routing patterns

- Route views live in `src/modules/page/<name>/` (tag `page-<name-kebab>`); reusable
  components in `src/modules/ui/<name>/`. Routes are already registered — **do not edit
  `src/routes.config.js`, `src/apps.config.js`, or `src/modules/shell/app/app.js`.**
  Replace the stub `<name>.js`/`<name>.html` in your assigned page folder(s); add a
  `<name>.css` if needed.
- Router import from a page module: `import { navigate, getCurrentRoute, subscribe } from '../../../router';`
- **List page skeleton** (see git history of `page/contacts` for the original example):
  `ui-page-header` `variant="object-home"` (icon, objectLabel, title = list view name,
  metaText = "N items • Sorted by X • Filtered by All"), decorative list-view controls
  (button-icons / button-menus), then `lightning-datatable` with sortable columns.
- **Record page skeleton**: `ui-page-header` `variant="record-home"` with `icon-name`,
  `object-label`, `title` (record name), `fields` (array of `{label, value}` highlight
  fields) and a `slot="actions"` containing `lightning-button-group`. Below, either
  `lightning-tabset` (Details / Related / Activity) or a 2/3–1/3 `slds-grid` of
  `lightning-card`s. Related lists use `ui-related-list`.
- **Reading the record id**: components are REUSED across navigations — do not rely on
  `connectedCallback` alone:

```js
import { subscribe, getCurrentRoute, navigate } from '../../../router';
import { subscribeStore /* , getters… */ } from 'data/store';

connectedCallback() {
    this._unsubRoute = subscribe(() => this.load());     // fires immediately + on nav
    this._unsubStore = subscribeStore(() => this.load()); // fires on every mutation
    this.load();
}
disconnectedCallback() { this._unsubRoute?.(); this._unsubStore?.(); }
load() {
    const id = getCurrentRoute()?.params?.id;
    // re-read all data from the store into tracked properties (assign NEW arrays/objects)
}
```

- Store getters return live references — **treat as read-only**; copy before sorting
  (`[...rows]`) and always re-assign fresh arrays so LWC re-renders.
- Money: format as `$1,234,567` (e.g. `'$' + Number(n).toLocaleString('en-US')`) or use
  `lightning-formatted-number format-style="currency"`. Dates in tables: `closeDate` is
  `YYYY-MM-DD`; timestamps are ISO strings (render with `new Date(x).toLocaleString()` in a
  getter or `lightning-formatted-date-time`).

## Data store — `data/store` (src/modules/data/store/store.js)

Singleton, pub-sub, seeded. Import what you need:

```js
import {
  IDS, PEOPLE, BD_REPS, STAGES, CLOSED_LOST_STAGE, CHANGE_ORDER_STAGES, TEAM_ROLES,
  stagesForRecordType, forecastForStage,
  subscribeStore, showToast, subscribeToasts, getState, reset,
  journeySteps, setDemoStep, getDemoStep, setDiscoveryMode, getDiscoveryMode,
  // getters
  getStudies, getStudy, getTriageQueue, getAccounts, getAccount, getLeads, getLead,
  getContacts, getContact, getOpportunities, getOpportunity, getContracts, getContract,
  getContractsForOpp, getProductsForOpp, getTeamForOpp, getSitesForOpp,
  getContactRolesForOpp, getActivitiesFor, getTasksFor, getAllTasks,
  getAuditTrailForContract, getSlackChannelForOpp, getSlackChannels,
  getOnboarding, getAsana, getChangeOrderState, getProductTotal,
  // mutations (all return {ok, error?} unless noted)
  approveAndAssignStudy, enrichLead, runDuplicateCheck, convertLead,
  setOpportunityStage, markStageComplete, markAwardLetter, setCboReviewed, setCloseDate,
  addProduct, updateProduct, removeProduct, addTeamMember, removeTeamMember,
  contractUpload, contractTag, contractSend, contractSimulateSponsor,
  sendOnboardingForm, setProjectRole, completeKickoff, assignExhibit, setCostInfo,
  assignProgramManager, advanceAsanaStatus, createChangeOrder,
} from 'data/store';
```

`IDS`: `{ study, sponsorAccount, kolLead, piLead, kolContact, piContact, opp, contract, changeOrder, coContract }`
(journey records: `rs-neurocessa`, `opp-neurocessa`, `ct-neurocessa-sow`, `opp-neurocessa-co`, …).

Key entity fields:

- **researchStudy**: id, name, sponsor, sponsorTier, compound, indication, phase, siteCount,
  registryId, citelineId, icpScore, icpFlag, status ('Unassigned'|'Assigned'), assignedTo,
  opportunityId, ingestSource, ingestedAt, siteIds[], leadIds[]
- **account**: id, name, recordType ('Organization'|'Clinical Site'), city, state, phone,
  website, tier, description, studyId
- **lead**: id, name, title, company, role ('KOL Contact'|'Principal Investigator'), studyId,
  siteAccountId, email/phone/linkedin ('' until enriched), enriched, enrichedAt,
  enrichmentNote, status ('New'|'Assigned'|'Working'|'Converted'), owner, engagementScore,
  converted, convertedIds ({accountId, contactId, opportunityId}|null),
  proposedCloseDate ('' — seeded blank on purpose), mcae[] ({id,type,iconName,subject,detail,date})
- **contact**: id, name, title, accountId, accountName, email, phone, linkedin, role,
  enriched, studyId, mcae[]
- **opportunity**: id, name, recordType ('Sales'|'Change Order'), accountId, accountName,
  studyId, stage, forecastCategory, amount, closeDate, owner, awardLetterReceived,
  cboReviewed, contractStatus ('None'|'Sent'|'Viewed'|'Signed'), parentOpportunityId,
  exhibit, nextStep, lossReason, createdAt, closedAt, stageHistory[] ({stage, enteredAt}),
  description
- **opportunityProduct**: id, oppId, product, quantity, amount, note (total = simple sum;
  `updateProduct(id, {quantity, amount})` keeps opp.amount in sync — NO pricing rules)
- **opportunityTeam**: id, oppId, name, role (one of TEAM_ROLES: BD, Program Management,
  Medical Director, Scientific, Engineering, ClinOps)
- **opportunitySite** (junction): id, oppId, siteAccountId, siteName,
  status ('Engaged'|'Non-Engaged'), pi, city, state
- **opportunityContactRole**: id, oppId, contactId, contactName, role
- **contract**: id, oppId, name, type ('MSA'|'SOW'|'Change Order'),
  status ('Draft'|'Uploaded'|'Tagged'|'Sent'|'Viewed'|'Signed'), exhibit, sentAt, viewedAt,
  signedAt, files[] ({id,name,kind,addedAt})
- **task**: id, subject, relatedTo, relatedId, relatedType, assignedTo, dueDate, status,
  priority, origin
- **activity**: id, parentId (any record id), type, iconName, subject, detail, date (ISO)
- **slackChannel**: id, oppId, name, purpose, members[], notificationRules[],
  messages[] ({id, author, ts, text})
- **onboarding** (journey opp): oppId, formStatus ('Not Sent'|'Sent'|'No recipient defined —
  task created'), formRecipient, fallbackTaskId, roles {billingContact, productOwner,
  executiveSponsor, endUsers}, kickoffComplete, exhibit {letter, sow, projectName},
  costInfo {amount, totalHours, creditedHours, hourlyRate, weeks, upfrontPayment, netTerms,
  msaExecutedDate}
- **asana**: created, projectName, asanaId ('ASN-88412'), pmAssigned, pmSynced,
  status ('Not Created'|'Onboarding'|'Active'|'Late Stage: Renewal Window'), statusHistory[],
  details {devicesNeeded, siteList, studyProtocol, sponsorContacts, proposedStartDate}

Business gates already enforced by `setOpportunityStage` (surface its `{ok:false, error}`
as an error toast via `showToast({title:'Cannot change stage', message: res.error,
variant:'error'})`):
- entering **Consideration+** requires `cboReviewed` (CBO quote checkpoint)
- entering **Contracting** requires `awardLetterReceived` (Award Letter)
- entering **Closed Won** requires a **Signed** contract on the opp
- Closed Won on the journey opp fires the onboarding/Asana/Slack side effects automatically.
- Slack `#bz-neurocessa-kam` is auto-created when the opp advances past Qualification;
  `#ls-neurocessa-p1` appears on Closed Won.

`convertLead(leadId, {closeDate})` — blank closeDate returns
`{ok:false, error:'Review the errors on this page. Close Date: …'}`. Success returns
`{ok:true, created:{accountId, contactIds, opportunityId, studyId, siteCount, engagedCount}}`.
Mutations already emit success/info toasts; add toasts only for extra UI-level events.

## Shared UI components (already built — do not modify)

- `<ui-page-header variant="object-home|record-home|base" icon-name object-label title
   meta-text fields={[{label,value}]} onsearch>` with `slot="actions"`, `slot="switcher"`.
- `<ui-related-list title icon-name columns={cols} rows={rows} key-field="id"
   action-label="New" empty-message onheaderaction onrowaction>` — lightning-card +
  lightning-datatable (checkboxes hidden); title renders as "Title (N)". Also accepts a
  default `<slot>` for custom card content below the table.
- `<ui-sales-path stages={stageDefs} current-stage={opp.stage} closed-lost={bool}
   onstageselect onsetstage>` — Path via `lightning-progress-indicator type="path"`;
  clicking a chevron selects it and shows entry/exit criteria + forecast category in a
  guidance panel with a "Mark as Current Stage" button (event `setstage`,
  `detail.stage`). Host page owns the "Mark Stage as Complete" header button
  (call `markStageComplete(oppId)`).
  Pass `STAGES` (Sales) or `CHANGE_ORDER_STAGES` (Change Order) as `stages`.
- `<ui-integration-badge label direction note>` — Discovery Mode integration annotation
  (auto-hides when Discovery Mode is OFF). direction: `inbound`/`outbound`/`sync`/etc.
- `<ui-open-decision title body>` — amber expandable Open Decision chip (auto-hides
  when Discovery Mode is OFF).
- Toasts: call `showToast({title, message, variant})` — `ui-toast` (mounted in the shell)
  renders it. Never build your own toast markup.
- Presenter bar is global; don't render it in pages.

## Object icons

Demo Guide `standard:life_sciences` · Research Study `standard:study` ·
Clinical Site account `standard:location` · Organization account `standard:account` ·
Lead `standard:lead` · Contact `standard:contact` · Opportunity `standard:opportunity` ·
Opportunity Site `standard:study_related` · Products `standard:product_item` ·
Team `standard:team_member` · Contract `standard:contract` · Files `standard:file` ·
Slack `standard:slack` · Task `standard:task` · Dashboard `standard:dashboard` ·
Campaign/MCAE `standard:campaign` · Form `standard:form`.
(All verified present. Verify any OTHER icon exists:
`ls node_modules/@salesforce-ux/design-system/assets/icons/<category>/<name>.svg`.)

## Terminology (use verbatim)

Research Study, Clinical Sites, Opportunity Sites (engaged / non-engaged), KOL Contacts,
Principal Investigators (PIs), Business Development (BD) / Key Account Manager (KAM),
Opportunity Teams, Exhibit (Exhibit A/B/C tied to SOW and Project Name), Change Order,
ICP (Ideal Customer Profile), Award Letter, Waveband (the EEG headband), Trial Insights Hub,
Biosignal Studio, Quality Suite, Sleep Analytics Suite, Scientific Services,
Schedule Extension Notification.

Stages: Triage → Awareness → Nurture → Qualification → Request → Consideration →
Contracting → Closed Won / Closed Lost. Forecast categories: Pipeline / Best Case /
Commit / Closed.

## Explicitly omitted — never mention in UI or code comments

QuickBooks/invoicing/payment reporting, bulk Clay enrichment, in-Salesforce
redlining/document merge, Momentum conversation intelligence, Diagnostics (DX) business
unit, Academic pipeline, automated lead conversion, pricing rules/approvals/bundles/
discounts, task-level bidirectional Asana sync, Slack AI, login/auth, real company or
person names, real pricing.
