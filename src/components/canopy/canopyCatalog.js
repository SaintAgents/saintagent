export const tabs = [
  ['Home','/CommandDeck'], ['Deep Dive','/Insights'], ['Research','/ResourceHub'], ['Projects','/MyDashboard'], ['People','/Profiles'], ['Opportunities','/Marketplace'], ['Quests','/Quests'], ['Treasury','/GaiaGlobalTreasury'], ['Files','/Profile'], ['Calendar','/Schedule'], ['Notes','/Notes'], ['Actions','actions'],
];
export const actions = [
  ['Take Action','create'], ['Explore Opportunities','/Marketplace'], ['Deep Dive Research','/Insights'], ['Join Projects','/Projects'], ['Connect People','/FindCollaborators'], ['Organizations & Ventures','/BusinessEntities'], ['Build a Brighter Tomorrow','/Missions'],
];
export const shortcuts = [['Deep Dive','/Insights'], ['My Projects','/MyDashboard'], ['Research Cards','/Insights?canopy=research'], ['Quick Notes','notes'], ['Inbox','/Messages'], ['Notifications','notifications']];
export const presets = {
  'My Day':['Time','Today','Quick Notes','Recent','Actions'],
  Research:['Deep Dive','Research Cards','Files & Knowledge','Quick Notes'],
  'My Projects':['Active Projects','Today','Files & Knowledge','Recent'],
  'My Money':['Quests','Opportunities','Notifications','Active Projects'],
  Community:['Who’s Online','Member Profiles','Video Conference','Contacts','Notifications'],
  'My Tools':['Stopwatch','World Clock','Quick Links','Inbox','AI Assistant'],
  Watching:['Notifications'],
};
export const peek = ['Time','Today','Quick Notes','Notifications'];
export const links = {
  'Deep Dive':[['Explore insights','/Insights'],['Search the platform','search']],
  'Research Cards':[['Browse insight cards','/Insights'],['Browse resources','/ResourceHub']],
  Quests:[['Explore quests','/Quests'],['Browse courses','/LearningHub']],
  Opportunities:[['Browse marketplace','/Marketplace'],['Explore missions','/Missions']],
  Contacts:[['Open CRM contacts','/CRM']],
  'Video Conference':[['Open a video call from Messages','/Messages'],['Open meetings','/Meetings']],
  'Who’s Online':[['See online members','online']],
  'Member Profiles':[['Browse member profiles','/Profiles']],
  'Files & Knowledge':[['My files','/Profile'],['Browse resources','/ResourceHub']],
  'AI Assistant':[['Open SaintAgent concierge','assistant']],
  'Global Search':[['Search SaintAgent','search']],
  'Quick Access':shortcuts,
  Tours:[['Open platform tours','/CommandDeck#daily-tours']],
  'Moon Phase':[['Open celestial insights','/CelestialInsights']],
  'Contact Card':[['Open my contact card','card']],
  Invites:[['Open affiliate invites','/AffiliateCenter']],
  'Quick Links':[['My dashboard','/MyDashboard'],['Schedule','/Schedule'],['Help guide','/UserGuide']],
  'Community Feed':[['Open community feed','/CommunityFeed']],
  'Members Feed':[['Open member activity','/ActivityFeed']],
  Inbox:[['Open messages','/Messages']],
  'InSite Browser':[['Open SaintBrowser','browser']],
  Inspiration:[['Read community testimonials','/Testimonials']],
};
export const widgets = [...new Set([...Object.values(presets).flat(), ...Object.keys(links)])].sort();
export const defaults = { cards:presets['My Day'], minimized:{}, sizes:{}, form:'bar', auto:false, width:940, height:650, split:330, scale:100, zone:'UTC', scratch:'' };