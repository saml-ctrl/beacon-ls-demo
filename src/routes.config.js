/**
 * Single source of truth for app routes.
 * Consumed by router.js (matching, titles) and app (nav maps, nav items).
 *
 * Fields:
 *   path       - URL pattern (use :param for dynamic segments). Logical, no app prefix.
 *   component  - LWC component name (must be registered in app.js ROUTE_COMPONENTS)
 *   title      - Document title (string or (params) => string)
 *   navPage    - Id for nav active state and navigate({ page }) (omit to hide from nav)
 *   navLabel   - Label shown in nav bar and in the Console object switcher
 *   navPath    - Optional; for dynamic routes, path used in nav links (e.g. /users/42)
 *   navHighlight - Optional; nav page id to highlight when this route is active (for child routes that don't create a tab)
 */

export const routes = [
  {
    path: '/',
    component: 'page-demo-guide',
    title: 'Demo Guide | Life Sciences Sales',
    navPage: 'home',
    navLabel: 'Demo Guide',
  },
  {
    path: '/intake',
    component: 'page-intake',
    title: 'Trial Intake & Triage',
    navHighlight: 'research-studies',
  },
  {
    path: '/research-studies',
    component: 'page-research-studies',
    title: 'Research Studies',
    navPage: 'research-studies',
    navLabel: 'Research Studies',
  },
  {
    path: '/research-studies/:id',
    component: 'page-research-study-detail',
    title: 'Research Study',
    navHighlight: 'research-studies',
  },
  {
    path: '/leads',
    component: 'page-leads',
    title: 'Leads',
    navPage: 'leads',
    navLabel: 'Leads',
  },
  {
    path: '/leads/:id',
    component: 'page-lead-detail',
    title: 'Lead',
    navHighlight: 'leads',
  },
  {
    path: '/opportunities',
    component: 'page-opportunities',
    title: 'Opportunities',
    navPage: 'opportunities',
    navLabel: 'Opportunities',
  },
  {
    path: '/opportunities/:id',
    component: 'page-opportunity-detail',
    title: 'Opportunity',
    navHighlight: 'opportunities',
  },
  {
    path: '/opportunities/:id/onboarding',
    component: 'page-onboarding',
    title: 'Onboarding Kickoff',
    navHighlight: 'opportunities',
  },
  {
    path: '/opportunities/:id/handoff',
    component: 'page-handoff',
    title: 'Sales-to-ClinOps Handoff',
    navHighlight: 'opportunities',
  },
  {
    path: '/contracts/:id',
    component: 'page-contract-detail',
    title: 'Contract',
    navHighlight: 'opportunities',
  },
  {
    path: '/accounts',
    component: 'page-accounts',
    title: 'Accounts',
    navPage: 'accounts',
    navLabel: 'Accounts',
  },
  {
    path: '/accounts/:id',
    component: 'page-account-detail',
    title: 'Account',
    navHighlight: 'accounts',
  },
  {
    path: '/contacts',
    component: 'page-contacts',
    title: 'Contacts',
    navPage: 'contacts',
    navLabel: 'Contacts',
  },
  {
    path: '/contacts/:id',
    component: 'page-contact-detail',
    title: 'Contact',
    navHighlight: 'contacts',
  },
  {
    path: '/dashboards',
    component: 'page-dashboards',
    title: 'Dashboards',
    navPage: 'dashboards',
    navLabel: 'Dashboards',
  },
  {
    path: '/',
    component: 'page-builder',
    title: 'Builder',
    app: 'builder',
  },
];
