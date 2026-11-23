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
  '1-0': [{ label: 'News & Updates', path: '/News', anchor: 'main [role="tablist"]' }],
  '1-5': [{ label: 'SpiritTube', path: '/SpiritTube' }, { label: 'Broadcast', path: '/Broadcast' }],
  '4-3': [{ label: 'Projects in GGT Command', path: '/ProjectTrack', anchor: '[data-tour-tracking-projects]', setup: { click: '[data-tour-tracking-projects]' } }],
  '5-1': [{ label: 'Create Listing form', path: '/Marketplace', anchor: '[data-tour-listing-form]', setup: { click: '[data-tour-create-listing]' } }],
  '5-3': ['overview', 'offers', 'bookings'].map(name => tab(name[0].toUpperCase() + name.slice(1), '/Studio', name)),
  '6-0': [settings('Bank tab', 'bank')],
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