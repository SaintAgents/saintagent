export const tabs = [
  ['Home','/CommandDeck'], ['Deep Dive','deep-dive'], ['Research','research-cards'], ['Projects','/MyDashboard'], ['People','/Profiles'], ['Opportunities','/Marketplace'], ['Quests','/Quests'], ['Treasury','/GaiaGlobalTreasury'], ['Files','knowledge'], ['Calendar','/Schedule'], ['Notes','/Notes'], ['Actions','actions'],
];
export const actions = [
  ['Take Action','create'], ['Explore Opportunities','/Marketplace'], ['Deep Dive Research','deep-dive'], ['Join Projects','/Projects'], ['Connect People','/FindCollaborators'], ['Organizations & Ventures','/BusinessEntities'], ['Build a Brighter Tomorrow','/Missions'],
];
export const shortcuts = [['Deep Dive','deep-dive'], ['My Projects','/MyDashboard'], ['Research Cards','research-cards'], ['Quick Notes','notes'], ['Inbox','/Messages'], ['Notifications','notifications']];
export const presets = {
  'My Day':['Time','Today','Quick Notes','Recent','Actions'],
  Research:['Deep Dive','Research Cards','Files & Knowledge','Quick Notes'],
  'My Projects':['Active Projects','Today','Files & Knowledge','Recent'],
  'My Money':['Quests','Opportunities','Notifications','Active Projects'],
  Community:['Who’s Online','Member Profiles','Video Conference','Contacts','Notifications'],
  'My Tools':['Stopwatch','World Clock','Quick Links','Inbox','AI Assistant'],
  Watching:['Notifications','News','Events','Members Feed'],
  Planning:['Daily Planner','Business Plans','Project Timeline','Impact Dashboard'],
};
export const peek = ['Time','Today','Quick Notes','Notifications'];
export const links = {
  'Deep Dive':[['Open Deep Dive Intelligence','deep-dive'],['Search the platform','search']],
  'Research Cards':[['Browse research cards','research-cards'],['Browse insight cards','research-insights'],['Start a Deep Dive','deep-dive'],['Browse resources','/ResourceHub']],
  Quests:[['Explore quests','/Quests'],['Browse courses','/LearningHub']],
  Opportunities:[['Browse marketplace','/Marketplace'],['Explore missions','/Missions']],
  Contacts:[['Open CRM contacts','/CRM']],
  'Video Conference':[['Open a video call from Messages','/Messages'],['Open meetings','/Meetings']],
  'Who’s Online':[['See online members','online']],
  'Member Profiles':[['Browse member profiles','/Profiles']],
  'Files & Knowledge':[['Search files & knowledge','knowledge']],
  'AI Assistant':[['Open My Assistant','my-assistant'],['Open SaintAgent concierge','assistant']],
  'Daily Planner':[['Plan my day','/DailyPlanner'],['Open Daily Ops','/DailyOps']],
  'Business Plans':[['Build a business plan','/BusinessPlanBuilder'],['Browse business entities','/BusinessEntities']],
  'Project Timeline':[['Open project tracking','/ProjectTrack'],['Open mission timeline','/MissionTimeline']],
  'Impact Dashboard':[['View my impact','/ImpactDashboard'],['View milestones','/Milestones']],
  'News':[['Read SaintAgent News','/News'],['Watch broadcasts','/Broadcast']],
  'Events':[['Browse events','/Events'],['Open my schedule','/Schedule']],
  'Learning':[['Open Learning Hub','/LearningHub'],['Browse the glossary','/Glossary']],
  'Deals':[['Open deal tracker','/Deals'],['Open CRM','/CRM']],
  'Groups':[['Browse community circles','/Circles'],['Open the forum','/Forum']],
  'Observation Deck':[['Open Observation Deck','/ObservationDeck']],
  'Dock Deck':[['Open Dock Deck','dock']],
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
export const descriptions = {
  'Files & Knowledge':'Search your files, vault documents, investigations, saved work, Wisdom Cards, and resources.',
  'Quick Notes':'Capture a thought in your private Canopy scratchpad.', 'Quick Links':'Jump to common SaintAgent pages.',
  'AI Assistant':'Ask a question in Canopy or open My Assistant for ongoing work.', Tours:'Play or replay a guided SaintAgent tour.',
  Stopwatch:'Start, pause, and reset a timer.', 'World Clock':'Check the current time in another city.', Time:'See your local time and session duration.',
  Today:'See meetings and events on your schedule today.', 'Active Projects':'Open projects you own, joined, or claimed.',
  Notifications:'Read your recent alerts and open related items.', 'Moon Phase':'See the current approximate lunar phase.',
  'Daily Planner':'Open your daily planner or Daily Ops.', 'Business Plans':'Open the plan builder or your business directory.',
  'Project Timeline':'Track progress across projects and missions.', 'Impact Dashboard':'See your contributions and milestones.',
  'Dock Deck':'Open your separate right-side workspace.', 'Observation Deck':'Open your monitoring workspace.',
};
export const defaults = { cards:['Quick Notes','Quick Links','AI Assistant','Tours','Stopwatch','World Clock','Time','Today','Notifications'], minimized:{}, sizes:{}, form:'bar', auto:false, width:940, height:650, split:330, scale:100, zone:'UTC', scratch:'' };