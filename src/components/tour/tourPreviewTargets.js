export const isTourPreview = () => window.parent !== window && new URLSearchParams(window.location.search).get('tourPreview') === '1';
export const deckTarget = id => `[data-deck-tour="${id}"]`;
const deck = (label, anchor, setup) => ({ label, path: '/CommandDeck', anchor, setup });
const tab = (label, path, name) => ({ label, path, anchor: `main [role="tabpanel"][id$="-content-${name}"]`, setup: { tab: name } });
const settings = (label, name) => tab(label, '/Settings', name);
const special = {
  '0-0': [deck('Command Deck icon', '#app-topbar [data-tour-command-icon]'), deck('Activity Cards', deckTarget('shortcuts'))],
  '0-1': [deck('Search pages', '[data-sidebar] input[aria-label="Search pages"]')],
  '0-2': [settings('Privacy settings', 'privacy')],
  '0-3': [{ label: 'Edit Profile', path: '/Profile', anchor: '[data-tour-profile-editor]', setup: { click: '[data-tour-edit-profile]' } }],
  '0-4': [deck('Notification bell', '[data-tour-notifications]'), settings('Notification settings', 'notifications')],
  '0-5': [deck('Quick Create button', '[data-deck-tour="header"] [title="Quick Create"]'), deck('Choose Post', '[data-tour-quick-option="post"]', { click: '[data-deck-tour="header"] [title="Quick Create"]' }), deck('Create Post form', '[data-tour-quick-form="post"]', { click: '[data-deck-tour="header"] [title="Quick Create"]', then: '[data-tour-quick-option="post"]' })],
  '0-6': [deck('Help and chat tabs', deckTarget('help')), { label: 'Learn', path: '/Learn' }],
  '0-7': [deck('Collapse or expand', '[data-tour-card="dailyTours"] .collapsible-card-header'), deck('Hide card', '[data-tour-card="dailyTours"] [title="Hide card"]'), deck('Send to side panel', '[data-tour-card="dailyTours"] [title="Send to side panel"]'), { ...deck('Restore to deck', '[data-tour-stored-card="dailyTours"] [title="Restore to deck"]'), view: 'stored-tours' }, deck('Unstow All', '[data-tour-unstow-all]', { click: '[data-tour-controls-toggle][aria-expanded="false"]' })],
  '1-0': [{ label: 'News & Updates', path: '/News', anchor: 'main [role="tablist"]' }],
  '1-5': [{ label: 'SpiritTube', path: '/SpiritTube' }, { label: 'Broadcast', path: '/Broadcast' }],
  '4-3': [{ label: 'Projects in GGT Command', path: '/ProjectTrack', anchor: '[data-tour-tracking-projects]', setup: { click: '[data-tour-tracking-projects]' } }],
  '5-1': [{ label: 'Create Listing form', path: '/Marketplace', anchor: '[data-tour-listing-form]', setup: { click: '[data-tour-create-listing]' } }],
  '5-3': ['overview', 'offers', 'bookings'].map(name => tab(name[0].toUpperCase() + name.slice(1), '/Studio', name)),
  '6-0': [settings('Bank tab', 'bank')],
  '7-0': [deck('Canopy button', '#app-topbar [aria-label="Open Command Canopy"]'), deck('Canopy view controls', '#canopy-workspace .canopy-heading', { click: '#app-topbar [aria-label="Open Command Canopy"]' })],
  '7-1': [deck('Canopy command bar', '#canopy-workspace .canopy-command-bar', { click: '#app-topbar [aria-label="Open Command Canopy"]' })],
  '7-2': [deck('Canopy widget library', '#canopy-library', { click: '#app-topbar [aria-label="Open Command Canopy"]', then: '#canopy-workspace .canopy-tools button[aria-expanded="false"]' })],
  '7-3': [{ ...deck('Deep Dive microscope', '#app-topbar [aria-label="Open Deep Dive Intelligence"]'), view: 'deep-dive' }],
  '7-4': [deck('Sidebar page search', '[data-sidebar] input[aria-label="Search pages"]'), { label: 'Research Hub', path: '/Intelligence', anchor: '[data-intel-hero]' }, { label: 'My Research', path: '/Intelligence', anchor: '[aria-label="My Research"]', params: { demo: 'garden' } }, { label: 'Sample report', path: '/Intelligence', anchor: '[data-intel-panel] h2', params: { demo: 'garden' } }],
  '7-5': [{ label: 'Turn a finding into a plan', path: '/MyGuide', anchor: '[aria-label="The Weaver"]' }],
  '7-6': [{ label: 'Opportunities', path: '/GlobalImpactDashboard', anchor: '#impact-workspace', params: { workspace: 'opportunities', impactDemo: '1' } }, { label: 'World Pulse', path: '/GlobalImpactDashboard', anchor: '[aria-label="World Pulse"]', params: { impactDemo: '1' } }, { label: 'My Impact', path: '/GlobalImpactDashboard', anchor: '[data-impact-module="overview"]' }],
  '7-7': [{ ...deck('Dock Deck launcher', '.dock-launcher'), view: 'dock' }, { ...deck('Pop out Quick Notes', '#dock-deck [aria-label="Float Quick Notes"]', { click: '.dock-launcher' }), view: 'dock' }, { ...deck('Return to Dock Deck', '[aria-label="Return to Dock Deck"]', { click: '.dock-launcher', then: '#dock-deck [aria-label="Float Quick Notes"]' }), view: 'dock' }],
  '7-8': [{ label: 'Watchlist', path: '/Watchlist', anchor: 'main h1' }, { label: 'Saved Items', path: '/SavedItems', anchor: 'main [role="tablist"]' }, { ...deck('Dock Deck launcher', '.dock-launcher'), view: 'dock' }],
  '7-9': [{ label: 'LinkTree & Contact Card editor', path: '/LinkTreeEditor', anchor: 'main h1' }, { label: 'Digital Contact Card settings', path: '/LinkTreeEditor', anchor: '[data-tour-contact-card]' }],
};
const pageAnchors = {
  '/CommunityFeed': '[placeholder^="Search posts"]', '/Forum': '[placeholder^="Search discussions"]',
  '/Advice': '[placeholder^="Search questions"]', '/Events': '[placeholder^="Search events"]',
  '/Profiles': '[placeholder^="Search by name"]', '/Messages': '[placeholder^="Search messages"]',
  '/Glossary': '[placeholder^="Search terms"]', '/LearningHub': '[placeholder^="Search courses"]',
  '/Projects': '[placeholder^="Search projects"]', '/Marketplace': '[placeholder^="Search listings"]',
  '/FindCollaborators': 'main [role="tablist"]', '/Quests': 'main [role="tablist"]',
  '/Missions': 'main [role="tablist"]',
};
export function dailyPreviewTargets(day, step, title, path) {
  return special[`${day}-${step}`] ?? [{ label: title, path, anchor: pageAnchors[path] }];
}
export function overviewPreviewTarget(label, anchor) {
  return deck(label, anchor, anchor.startsWith('[data-tour-nav-group=') ? { group: anchor } : undefined);
}