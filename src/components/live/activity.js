import { Activity, Bell, Briefcase, Coins, FlaskConical, Folder, Handshake, Heart, Radio, Sparkles, Star, Target, UserPlus } from 'lucide-react';

export const categories = {
  matches: ['Matches', Sparkles], funding: ['Funding', Coins], projects: ['Projects', Folder],
  research: ['Research', FlaskConical], collaborations: ['Collaborations', Handshake], needs: ['Needs', Heart],
  opportunities: ['Opportunities', Briefcase], watchlist: ['Watchlist', Star], impact: ['Impact', Target],
  personal: ['Personal activity', Activity], earnings: ['Earnings', Coins], signals: ['Signals', Radio], new_members: ['New members', UserPlus],
};
export const priorities = ['information', 'success', 'opportunity', 'ai_match', 'milestone', 'priority', 'major_event'];
export const configDefaults = { enabled: true, intensity: 'balanced', position: 'top-right', max_visible: 1, stagger_ms: 4200, duration_ms: 30000, demo_mode: false, show_earnings: true, welcome_enabled: true, quiet_minutes: 30 };
export const prefDefaults = { enabled: true, placement: 'bottom', speed: 'normal', suppress: false, demo: true, categories: [] };
export const categoryInfo = event => categories[event.category] || ['Welcome', Bell];
export const safePath = path => typeof path === 'string' && /^\/(?![/\\])/.test(path) && !/[\\\s]/.test(path) ? path : null;
export const actionable = event => !!(safePath(event.action_path) || event.category === 'signals' || (event.category === 'new_members' && event.profile_user_id));
export const formatTime = date => date && Number.isFinite(Date.parse(date)) ? new Intl.DateTimeFormat(undefined, { month:'short', day:'numeric', hour:'numeric', minute:'2-digit' }).format(new Date(date)) : '';
export const priorityIndex = event => Math.max(0, priorities.indexOf(event.priority));
export function eligible(event, config, prefs) {
  return !!event?.id && !!event.is_demo === !!config.demo_mode && (!event.is_demo || prefs.demo) &&
    (!config.categories?.length || config.categories.includes(event.category)) &&
    (!prefs.categories?.length || prefs.categories.includes(event.category)) &&
    (event.category !== 'earnings' || config.show_earnings);
}
export function toastEligible(event, config) {
  const threshold = Math.max(config.important_only ? 4 : 0, { essential: 4, quiet: 6 }[config.intensity] || 0);
  return priorityIndex(event) >= threshold;
}
export function localRead(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
export function localWrite(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* the interface still works without browser storage */ }
}