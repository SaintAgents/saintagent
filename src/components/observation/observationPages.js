const groups = {
  Discover: [['News','News & Updates'],['Insights'],['Videos','SaintTube'],['Testimonials'],['Glossary'],['CelestialInsights'],['LearningHub'],['ResourceHub'],['Learn'],['UserGuide']],
  Community: [['ActivityFeed'],['CommunityFeed'],['Circles'],['Events'],['Forum'],['Advice','Wisdom Exchange'],['Mentorship'],['Profiles'],['FindCollaborators'],['Teams','Teams & Guilds'],['LeaderChannel','Leader Channel','leader']],
  Work: [['Projects'],['ProjectTrack'],['Missions'],['MissionGrid'],['MissionTimeline'],['MissionGantt'],['Planner'],['ImpactDashboard'],['Meetings'],['Schedule','Global Schedule'],['MyDashboard'],['DailyOps'],['DailyPlanner'],['Notes'],['Milestones'],['BusinessPlanBuilder'],['BusinessEntities'],['Marketplace'],['Deals','Deal Tracking'],['CRM','Contact Network'],['ReviewerWorkflow','Review Queue']],
  Personal: [['CommandDeck'],['Profile'],['Messages'],['Matches'],['MatchSettings'],['Settings'],['Quests'],['Gamification'],['Leaderboards'],['SynchronicityEngine'],['AffiliateCenter'],['AffiliateDashboard'],['Initiations'],['DatingMatches']],
  Media: [['Broadcast'],['Studio','Creator Studio'],['ContentStudio'],['SpiritTube']],
  Administration: [['Admin','Administration','staff'],['ReviewManagerDashboard','Review Manager','admin'],['CacheAdmin','Cache Administration','admin'],['WhatsAppDashboard','WhatsApp Dashboard','admin']],
};
const labelOf = key => key.replace(/([a-z])([A-Z])/g, '$1 $2');
export const destinations = Object.entries(groups).flatMap(([group, pages]) => pages.map(([id, label, access]) => ({ id, label: label || labelOf(id), path: `/${id}`, group, access })));
export function canObserve(page, user, leader) {
  if (!page || !user) return false;
  if (page.access === 'admin') return user.role === 'admin';
  if (page.access === 'staff') return ['admin','coordinator'].includes(user.role);
  if (page.access === 'leader') return leader;
  return true;
}
export function resolveDestination(path, accessible) {
  const value = path.trim().replace(/^\/?/, '/').replace(/\/$/, '').toLowerCase();
  return accessible.find(page => page.path.toLowerCase() === value);
}