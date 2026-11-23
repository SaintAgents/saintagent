import { BookOpen, ChevronLeft, ExternalLink, EyeOff, LayoutDashboard, Search, Settings, Shield, SunMoon, Trophy, User, Wifi } from 'lucide-react';
import { ALL_NAV_ITEMS, NAV_GROUPS } from '@/components/hud/Sidebar';

const summary = {
  discover: 'Find updates, guides, videos, testimonials, and reference material when you want to learn what’s happening.',
  participate: 'Find missions, quests, challenges, leaderboards and other structured ways to take part.',
  connect: 'Find members or groups, then move into conversations, mentorship, or meetings.',
  build: 'Find the tools for running projects, managing work, creating content, or offering services.',
  treasury: 'Find financial, asset, and digital rights information. Review the terms before making any transaction.',
  intelligence: 'Find suggestions and insights. Treat them as starting points and check the actual details yourself.',
};
const control = (label, visual, result) => ({ label, visual, result });
const sidebar = '[data-sidebar]';

export const SIDEBAR_STOPS = [
  { title: 'Sidebar navigation controls', what: 'The left sidebar can be expanded for names or collapsed for icons. The navigation section and the sidebar itself can be collapsed separately.', action: 'Try the example controls, then expand a group on your deck. You can use Search pages instead of opening several groups. On mobile, the sidebar is replaced by the menu.', anchor: sidebar },
  ...NAV_GROUPS.map(group => ({ title: group.label, what: summary[group.key], action: 'Open this group in the sidebar and choose a page based on what you want to do. Some entries depend on your account or permissions.', anchor: `[data-tour-nav-group="${group.key}"]` })),
  { title: 'Leaders, appearance, presence and account', what: 'Below navigation, the sidebar provides ranking, appearance and presence tools, along with access to your profile and settings.', action: 'Use Leaders to check rankings, Appearance to change how the app looks, and Presence to set how others see your availability or who can message you.', anchor: sidebar },
];

export const SIDEBAR_ICONS = {
  'Sidebar navigation controls': [
    control('SaintAgent logo', Shield, 'At full width, scrolls to the top. In the collapsed sidebar, expands it.'),
    control('Sidebar chevron', ChevronLeft, 'Switches between the narrow icon rail and the expanded sidebar.'),
    control('Quick Nav / Pop off panel', ExternalLink, 'Opens navigation in a floating panel. Use Dock panel to return it to the sidebar.'),
    control('Navigation section', BookOpen, 'Shows or hides the navigation list without collapsing the entire sidebar.'),
    control('Search pages', Search, 'Searches for a page by name; choose a result to open it. In the collapsed sidebar, the search icon expands the sidebar first.'),
    control('Command Deck', LayoutDashboard, 'Returns to the main dashboard without opening a navigation group.'),
  ],
  ...Object.fromEntries(NAV_GROUPS.map(group => [group.label, group.items.map(id => {
    const item = ALL_NAV_ITEMS[id];
    return control(item.label, item.Icon, `${item.hint}${item.adminOnly ? ' (available to admins)' : ''}.`);
  })])),
  'Leaders, appearance, presence and account': [
    control('Leaders', Trophy, 'Shows ranked members. Use the chevron to expand or collapse, the pop-out to open the ranking in a panel, and the eye control to hide it. Show leaderboard brings it back.'),
    control('Appearance', SunMoon, 'Opens theme and background-effect controls. If hidden, use Show Appearance to bring it back.'),
    control('Presence', Wifi, 'Set Online, Focus or Do Not Disturb and review which people may message you. You can pop this section out, collapse it, or hide it; Show Presence restores it.'),
    control('My Profile', User, 'Opens your own profile; rank and RP in the sidebar summarize your progression.'),
    control('Settings', Settings, 'Opens account and app preferences.'),
    control('Hide section', EyeOff, 'Removes a section from the sidebar without deleting its data. Use its Show button to restore it.'),
  ],
};