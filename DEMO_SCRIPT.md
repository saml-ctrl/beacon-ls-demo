# Beacon Biosignals — Life Sciences Sales Wireframe: Presenter Walkthrough

A clickable wireframe of the future-state Salesforce Life Sciences Cloud implementation,
built for the Wise Wolves design-discovery walkthrough. **It is not a real Salesforce org**
— everything runs locally on fictitious seed data.

## Setup (once)

```bash
git clone <this repo> && cd beacon-ls-demo
npm install        # also syncs SLDS skills and applies a Windows patch for the LWC toolchain
npm run dev        # http://localhost:3000
```

No further network access is needed after install. **Reset Demo** (bottom right of the
docked Journey bar) restores the exact seed state at any time; a hard refresh does the same.

## Demo controls

- **Journey bar** (docked bottom): numbered chips 0–11, Back / Next, Reset Demo. It is the
  spine of the walkthrough — every step below starts from a Next click or a chip.
- **Discovery Mode toggle** (global header, default ON): shows the blue integration badges
  and the amber **Open Decision** chips. Flip it OFF for a clean, client-facing run-through;
  flip it ON when you want to pause on scope and open questions.
- **Theme switcher** (floating, bottom right): flips **SLDS 1 (classic Lightning)** vs
  **SLDS 2 “Cosmos”**, plus light/dark. Use it once mid-demo — “this is the same app in
  tomorrow’s Cosmos design language” — it works on every page.
- **List views**: every object tab has multiple list views — click the **chevron next to
  the list title** to switch, just like Lightning. Examples worth showing: Opportunities →
  *Open Pipeline*, *Commit & Best Case*, *Closed Won*, *Change Orders*; Accounts →
  *Sponsor Organizations*, *Clinical Sites*, *NRX-214-202 Site Roster* (the 14 study
  sites); Leads → *KOL Contacts*, *Principal Investigators (PIs)*, *Enriched via Clay*.

---

## Step 0 — Demo Guide (Home)

**Click:** nothing yet — you land here.
**Say:** “This is the full Life Sciences Sales lifecycle we’re proposing, as one clickable
story: intake → conversion → pipeline → contracting → closed won → onboarding → handoff →
change order → leadership view.” Each numbered node jumps to its screen; the Journey bar
does the same thing in order.
**Show:** the **Architecture & Flow Diagrams** card — four tabs that tell the same story
as pictures, useful for the architects in the room:

- **Integration Data Flow** — every system in the future state and which direction data
  moves: Citeline / ClinicalTrials.gov through MuleSoft into Research Studies, Clay and
  MCAE into Leads, SharePoint quoting, Adobe Acrobat Sign on the Contract, Slack deal
  channels, and the Asana delivery handoff with project-status sync back through MuleSoft.
- **User Journey** — the presenter journey by persona: Priya (BD Coordinator) on triage,
  Jordan (BD rep) selling and contracting, Sam (ClinOps PM) on delivery handoff.
- **Core Sales Workflow** — the Sales Path stages with the three hard gates drawn as
  decision diamonds (CBO review, Award Letter, signed contract), the Closed Won side
  effects, and the Change Order loop.
- **Contracting Sequence** — the Adobe Acrobat Sign handshake step by step, including the
  signed-status callback and the Shield Field Audit Trail entry.

## Step 1 — Trial Intake & Triage

**Click:** Next → the triage list view.
**Say:** “Every week, qualified studies land here automatically — ingested from **Citeline**
with **ClinicalTrials.gov** enrichment through a **MuleSoft** daily batch, deduped on
Citeline trial ID. The **ICP flag and score** are set by a rules-based Flow. Assignment
stays a **human BD step** — never automated prioritization.”
**Pause on (Discovery ON):** the integration badge — *single API, up to two MuleSoft flows,
up to three Salesforce objects; customer responsible for licensing and API tokens.*
**Do:** row menu on the **NRX-214-202** (Neurocessa Therapeutics) row → **Approve & Assign**
→ pick **Jordan Reyes** → confirm. Watch the toasts: study assigned, and the one-time
**Clay** enrichment fires for the study’s PI/KOL Leads.

## Step 2 — Research Study record

**Click:** Next.
**Say:** “The Research Study is the core trial object — the **Details tab** shows the full
field layout (compound, indication, phase, registry and Citeline IDs, ICP score). On the
**Related tab**, the ingestion payload auto-created the related records: **14 Clinical
Sites** (note the Account record type column — Organization vs Clinical Site) and the
**PI / KOL records landing as Leads** tied to the study — Dr. Elena Vasquez, the PI at
Lakeshore Neuroscience Institute, and Dr. Naomi Kessler, the sponsor’s VP of Clinical
Development.”
**Show (account hierarchy):** the site roster’s **Site Network** column — most sites roll
up to a site-network **Organization** account (Lakeshore Health Network, Meridian Care
Alliance, Pacific Crest Research Partners) via **Parent Account**; a few are independent.
Click into any site: the **Account Hierarchy** card on its Details tab draws the network
roll-up as a tree, with every node clickable. On the network account itself, the Related
tab adds a **Child Accounts** list, and the Accounts tab has a dedicated **Site Networks**
list view. “This is standard Account hierarchy — no custom objects — so network-level
relationships, contacts, and reporting come for free.”
**Pause on:** amber chip **“Research Study object model”** — standard Life Sciences Cloud
object vs custom object is explicitly undecided; this is a discovery decision.

## Step 3 — KOL Lead, enrichment & marketing

**Click:** Next → Dr. Naomi Kessler’s Lead record.
**Say:** “When the BD rep was assigned, a **one-time Clay enrichment** fired — verified
email, phone, and LinkedIn are already populated, badged *Verified by Clay*. There’s also
an on-demand **Enrich with Clay** button for individual records — there is **no bulk
enrichment anywhere**. Below, the **Marketing Cloud Account Engagement** timeline shows the
full engagement history — campaign membership, email opens, a form fill, a webinar — so the
rep sees everything before picking up the phone.”
**Pause on:** both integration badges (Clay per-record/ad hoc; MCAE engagement data inbound).

## Step 4 — Custom Lead Conversion (the validation moment)

**Click:** **Convert** in the Lead header.
**Say:** “Conversion is **on-demand, one click — never triggered automatically by a
stage**. The modal first runs a visible **duplicate Account/Contact check**, then lists
exactly what one flow creates: Opportunity, Research Study link, Account, Clinical Sites,
KOL Contacts, Opportunity Contact Roles, and **Opportunity Sites with engaged /
non-engaged status per site**.”
**Do:** click **Convert** with Close Date empty → the validation blocks it (“Close Date: A
value is required…”). Fill any future date → **Convert** → the success screen shows the
linked-record diagram of everything created. Click **Go to Opportunity**.

## Step 5 — Opportunity record (the centerpiece)

**Say:** “This is the Sales record type with the **Beacon BD handbook Path**: Triage →
Awareness → Nurture → Qualification → Request → Consideration → Contracting → Closed Won.
Click any chevron — each stage shows **entry/exit criteria and its forecast category**
(Pipeline / Best Case / Commit / Closed).” The **Details tab** shows the record page field
layout — including the Award Letter and CBO Review flag fields that drive the gates. Flip
to the **Related tab** to tour: **Opportunity Products** ($986,000 — quantities and
amounts editable, total is a simple sum), **Opportunity Team** (six roles: BD, Program
Management, Medical Director, Scientific, Engineering, ClinOps — add/remove without admin
friction), **Opportunity Sites** (9 engaged / 5 non-engaged), Contact Roles, and
Contracts; the **Activity tab** holds tasks and the timeline.
**Do:** **Mark Stage as Complete** → Request. The **Slack record channel
`#bz-neurocessa-kam`** appears on the Related tab with the Opportunity Team as members and
exactly **two notification rules: Closed Won, Closed Lost**.

## Step 6 — Proposal / Quoting checkpoint

**Click:** Next (stays on the Opportunity — the Proposal & Quoting card sits on the
Details tab, under the field layout).
**Say:** “Scoping and quoting — Scientific, ClinOps, and Engineering input — happens
**outside Salesforce in the SharePoint quote sheet workspace**. Salesforce keeps an honest
warning: *Line items may be out of date vs. external quote*.”
**Do:** try **Mark Stage as Complete** first — it’s blocked: **CBO review/approval** is
required to advance from Request to Consideration. Tick the CBO checkbox, then advance.
Then try advancing again — blocked again: **Contracting requires an Award Letter**. Click
**Log Award Letter**, then **Mark Stage as Complete** → Contracting.

## Step 7 — Contracting & E-Signature

**Click:** Next → the SOW contract record (Type: SOW; also supports MSA / Change Order).
**Say:** “The standard **Adobe Acrobat Sign managed package** flow — three steps:
**Upload document** (redlining happened offline before upload), **Tag signature fields**,
**Send for signature**.”
**Do:** click through the three steps, then use the presenter control **Simulate Sponsor
Action** twice: Sent → Viewed → **Signed**. On Signed: the **executed PDF lands in the
Files tab**, the Opportunity’s contract status updates with a toast, and the **Field Audit
Trail tab** (Shield) shows timestamped, append-only entries. The contract’s field details
sit beside the signing panel.
**Pause on:** the two amber chips — **Part 11 e-signature/audit** (Phase 1 scope vs
informational only) and **document storage system of record** (SharePoint vs Salesforce
Files) — plus the badge: *Standard Adobe Acrobat Sign managed package only; customer
provides licensing.*

## Step 8 — Closed Won → Onboarding Kickoff

**Do:** **Open Opportunity** → **Mark Stage as Complete** → Closed Won (only possible now
that a Signed contract exists — feel free to show it blocked before signing).
**Say:** “Closed Won triggers the onboarding sequence automatically.” Click Next (or the
**Onboarding Kickoff** button): (a) the **Client Onboarding Form** hit the fallback — *no
recipient defined: task created for manual assignment* — pick Dr. Kessler and send it;
(b) capture the **Key Project Roles** — Billing Contact, Product Owner, Executive Sponsor,
End Users — kickoff **cannot** be marked complete until all four are filled (try it);
(c) **Exhibit A** assignment tied to the SOW and Project Name; (d) **Cost Info** on the
Opportunity/Project — Amount, Total Hours, Credited Hours, Hourly Rate, Weeks, Upfront
Payment, Net Terms, MSA Executed Date — pre-populated, editable, savable.

## Step 9 — Sales-to-ClinOps Handoff (Asana)

**Click:** Next.
**Say:** “On Closed Won an **Asana project** was pushed out automatically, pre-populated
with the deal details ClinOps needs: **84 Wavebands** across 14 sites, the site list, the
protocol, sponsor contacts, proposed start date. Assign **Sam Okafor** as Program Manager —
assigned in Salesforce and synced to Asana. **Only project-level status syncs back**
(matched on Asana ID) — there is **no task-level bidirectional sync**.”
**Do:** click **Simulate PM status update** twice: Onboarding → Active → **Late Stage:
Renewal Window**. That transition auto-creates a Salesforce Task for the BD owner:
*“Project entering renewal window: identify next-phase opportunity.”* Note the post-SOW
Slack channel **`#ls-neurocessa-p1`**.
**Pause on:** the MuleSoft ↔ Asana badge (*up to 4 alert task types*) and the amber chip —
Asana project creation is manual initially, automation targeted for Phase 1b.

## Step 10 — Change Order

**Do:** from the renewal alert, **Open Opportunity** → **Log Schedule Extension
Notification**.
**Say:** “The project schedule is extending **45 days** beyond the Estimated Schedule —
past the **30-day** trigger — so per the SOW the parties execute a **Change Order** to
extend time-based fees.” Confirm: a **Change Order opportunity** is created — its own
record type and layout, its own abbreviated Path (**Identified → Scoped → Contracting →
Closed Won**), linked to the parent opportunity and **Exhibit A**, pre-populated with
**time-based line items only** ($66,000).
**Do:** advance the Path to Contracting, open the Change Order contract from the related
list, run the abbreviated flow (Upload → Tag → Send → Simulate ×2 → Signed), return, and
close it Won.
**Pause on:** the amber chip — *the Change Order stage set is a proposed default; confirm
in discovery.*

## Step 11 — Leadership Dashboard

**Click:** Next.
**Say:** “Everything you just did is live here — no refresh needed at any point in the
demo.” Walk the cards: **Open Pipeline by Stage**, **Pipeline by Forecast Category** (the
Neurocessa $986k and the $66k Change Order now sit in Closed), **Pipeline by Owner**,
**Stage Velocity** (average days in stage), the **Contract Status Board** (Sent / Viewed /
Signed counts — now 3 Signed), and **KOL Engagement & Enrichment** (percent of KOLs
enriched, engagement activities logged).

## Wrap-up moves

- Flip **Discovery Mode** OFF and ON once — “the same app, with and without the
  integration/scope annotations.”
- Flip the **theme switcher** to SLDS 1 and back to SLDS 2 “Cosmos”, and try dark mode —
  “the implementation inherits Salesforce’s new design language for free.”
- Click **Reset Demo** — the seed state returns instantly, ready for the next audience.

---

### Implementation notes (for the demo team)

- **Hand-rolled SLDS blueprints** (everything else is Lightning Base Components):
  the `slds-notify` toast (`ui-toast` — platform toast events don’t exist off-platform),
  the docked presenter bar (`ui-presenter-bar`, styled after the SLDS docked utility bar),
  the scoped-notification-style banners (quote warning, converted-lead, onboarding/handoff
  status), the amber Open Decision chip, the integration badge, the conversion
  linked-record diagram, the dashboard bars (inline SVG rects — no chart libraries), and
  the Sales Path guidance panel beneath `lightning-progress-indicator type="path"`.
- Product quantity/amount edits: use the row-menu **Edit** action (a small modal). The
  datatable’s inline cell edit is also enabled but the OSS build’s draft-commit is
  unreliable — the Edit action is the dependable path during a live demo.
- `scripts/patch-lwc-windows.mjs` (run automatically on `npm install`) fixes two Windows
  path bugs in the upstream LWC/Vite toolchain. Without it the app is stuck at “Loading…”
  on Windows machines.
