export const links = { Profile:'/Profile', Members:'/Profiles', Calendar:'/Schedule', Messages:'/Messages', Quests:'/Quests', Tours:'/CommandDeck#daily-tours', News:'/News', Community:'/CommunityFeed', Projects:'/Projects', Watchlist:'/Watchlist', Invites:'/AffiliateCenter' };
export const defaultShortcuts = ['Profile', 'Tours', 'Messages', 'Quests', 'Calendar'];
export const widgetLibrary = {
  'AI Assistant':'Ask a question in a lightweight, session-only chat.', 'Global Search':'Find pages or open Advanced Search for platform records.',
  'Quick Access':'Use the shortcuts shared with the right-side panel.', Recent:'Reopen recent pages from this session.', Tours:'Browse and replay your SaintAgent tours.',
  'Quick Notes':'Save a private scratchpad to your Dock preferences.', 'Music Player':'Play an audio file from your device without uploading it.',
  Stopwatch:'Time a session, pause it, and record laps.', 'World Clock':'See the local time in a selected city.', 'Moon Phase':'See the approximate lunar phase and illumination.',
  'Contact Card':'Open your digital contact card and sharing QR.', Invites:'Copy your ambassador signup link or open the program.',
  'Quick Links':'Open commonly used SaintAgent pages.', 'Community Feed':'Read and compose community posts.', News:'See the newest published headlines and open News.',
  Notifications:'Read your recent alerts and open their destinations.', 'Who Is Online':'Open the live member list.',
  'InSite Browser':'Launch the existing SaintAgent browser.', Inspiration:'Cycle through short reflection prompts in a frameless card.',
  Watchlist:'See up to 30 watched records and open your full Watchlist.',
  'Pinned Item':'Keep a shortcut to a SaintAgent page or record.'
};
export const icons = ['▦','★','◈','☀','✦','◉','◇','◆'];
export const safePath = value => typeof value === 'string' && /^\/(?![\\/])[^\\\r\n]*$/.test(value);
export const widget = (type, settings = {}) => ({ id:crypto.randomUUID(), type, settings, deck:'main', place:'deck' });
export const initial = () => ({ active:'main', decks:[{id:'main',name:'My Dock',icon:icons[0]}], cards:[widget('Quick Access'),widget('Quick Notes')], width:1120, label:true, beside:false, folders:true, video:false, opacity:100, shortcuts:defaultShortcuts });