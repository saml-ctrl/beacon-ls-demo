import { LightningElement, track } from 'lwc';
import { getOpportunities, getContracts, getLeads, getContacts, getAllTasks, subscribeStore } from 'data/store';

const OPEN_STAGE_ORDER = [
    'Triage',
    'Awareness',
    'Nurture',
    'Qualification',
    'Request',
    'Consideration',
    'Contracting',
    'Identified',
    'Scoped',
];

const FORECAST_ORDER = ['Pipeline', 'Best Case', 'Commit', 'Closed'];

function money(n) {
    return '$' + Number(n || 0).toLocaleString('en-US');
}

function toBars(entries) {
    const max = Math.max(1, ...entries.map((e) => e.value));
    return entries.map((e, i) => ({
        id: `bar-${i}-${e.label}`,
        label: e.label,
        valueLabel: e.valueLabel,
        pct: Math.round((e.value / max) * 100),
    }));
}

export default class Dashboards extends LightningElement {
    @track stageBars = [];
    @track forecastBars = [];
    @track ownerBars = [];
    @track velocityBars = [];
    @track contractTiles = [];
    @track closedLostNote = '';
    @track kol = { pct: 0, label: '', activities: 0, openTasks: 0 };

    connectedCallback() {
        this._unsubscribe = subscribeStore(() => this.refresh());
        this.refresh();
    }

    disconnectedCallback() {
        this._unsubscribe?.();
    }

    refresh() {
        const opps = getOpportunities();
        const open = opps.filter((o) => o.stage !== 'Closed Won' && o.stage !== 'Closed Lost');

        // 1. Open pipeline by stage
        const byStage = new Map();
        open.forEach((o) => byStage.set(o.stage, (byStage.get(o.stage) || 0) + o.amount));
        this.stageBars = toBars(
            OPEN_STAGE_ORDER.filter((s) => byStage.has(s) || OPEN_STAGE_ORDER.indexOf(s) < 7).map((s) => ({
                label: s,
                value: byStage.get(s) || 0,
                valueLabel: money(byStage.get(s) || 0),
            }))
        );

        // 2. Pipeline by forecast category (Closed = Closed Won only)
        const byForecast = new Map();
        opps.forEach((o) => {
            if (o.stage === 'Closed Lost') return;
            byForecast.set(o.forecastCategory, (byForecast.get(o.forecastCategory) || 0) + o.amount);
        });
        this.forecastBars = toBars(
            FORECAST_ORDER.map((f) => ({
                label: f,
                value: byForecast.get(f) || 0,
                valueLabel: money(byForecast.get(f) || 0),
            }))
        );
        const lost = opps.filter((o) => o.stage === 'Closed Lost');
        this.closedLostNote = lost.length
            ? `Closed Lost (excluded): ${lost.length} opportunity · ${money(lost.reduce((s, o) => s + o.amount, 0))}`
            : '';

        // 3. Open pipeline by owner
        const byOwner = new Map();
        open.forEach((o) => byOwner.set(o.owner, (byOwner.get(o.owner) || 0) + o.amount));
        this.ownerBars = toBars(
            [...byOwner.entries()]
                .sort((a, b) => b[1] - a[1])
                .map(([owner, value]) => ({ label: owner, value, valueLabel: money(value) }))
        );

        // 4. Stage velocity — average days in completed stages
        const stageDays = new Map();
        opps.forEach((o) => {
            const history = o.stageHistory || [];
            for (let i = 0; i < history.length - 1; i++) {
                const from = new Date(history[i].enteredAt).getTime();
                const to = new Date(history[i + 1].enteredAt).getTime();
                const days = Math.max(0, (to - from) / 86400000);
                const entry = stageDays.get(history[i].stage) || { total: 0, n: 0 };
                entry.total += days;
                entry.n += 1;
                stageDays.set(history[i].stage, entry);
            }
        });
        this.velocityBars = toBars(
            OPEN_STAGE_ORDER.filter((s) => stageDays.has(s)).map((s) => {
                const { total, n } = stageDays.get(s);
                const avg = Math.round(total / n);
                return { label: s, value: avg, valueLabel: `${avg}d` };
            })
        );

        // 5. Contract status board
        const contracts = getContracts();
        const count = (status) => contracts.filter((c) => c.status === status).length;
        this.contractTiles = [
            { id: 't-sent', label: 'Sent', value: count('Sent'), cssClass: 'c-dash-tile' },
            { id: 't-viewed', label: 'Viewed', value: count('Viewed'), cssClass: 'c-dash-tile' },
            { id: 't-signed', label: 'Signed', value: count('Signed'), cssClass: 'c-dash-tile c-dash-tile_signed' },
            { id: 't-draft', label: 'Draft / In prep', value: contracts.length - count('Sent') - count('Viewed') - count('Signed'), cssClass: 'c-dash-tile c-dash-tile_muted' },
        ];

        // 6. KOL engagement & enrichment
        const kols = [
            ...getLeads().filter((l) => l.role === 'KOL Contact'),
            ...getContacts().filter((c) => c.role === 'KOL Contact'),
        ];
        const enriched = kols.filter((k) => k.enriched).length;
        const pct = kols.length ? Math.round((enriched / kols.length) * 100) : 0;
        const activities =
            getLeads().reduce((s, l) => s + (l.mcae ? l.mcae.length : 0), 0) +
            getContacts().reduce((s, c) => s + (c.mcae ? c.mcae.length : 0), 0);
        const openTasks = getAllTasks().filter((t) => t.status === 'Open').length;
        this.kol = {
            pct,
            label: `${enriched} of ${kols.length} KOLs enriched`,
            activities,
            openTasks,
        };
    }

    get metaText() {
        return 'As of just now • Live from the demo store';
    }
}
