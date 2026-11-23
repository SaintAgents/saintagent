export const links = { Profile:'/Profile', Members:'/Profiles', Calendar:'/Schedule', Messages:'/Messages', Quests:'/Quests', Tours:'/CommandDeck#daily-tours', News:'/News', Community:'/CommunityFeed', Projects:'/Projects', Watchlist:'/Watchlist', 'Saved Items':'/SavedItems', Invites:'/AffiliateCenter' };
export const defaultShortcuts = ['Profile', 'Tours', 'Messages', 'Quests', 'Calendar'];
export const widgetLibrary = {
  'AI Assistant':'Ask a question and continue your recent chat in this widget.', 'Global Search':'Find pages or open Advanced Search for platform records.',
  'Quick Access':'Use the shortcuts shared with the right-side panel.', Recent:'Reopen or clear the last 15 page visits in this tab.', Tours:'Browse and replay your SaintAgent tours.',
  'Quick Notes':'Type or dictate a private note and save it to your Dock preferences.', 'Music Player':'Play an audio file from your device without uploading it.',
  Stopwatch:'Time a session, pause it, and record up to 10 laps.', 'World Clock':'Add and save live clocks for multiple time zones.', 'Moon Phase':'See the approximate lunar phase and countdowns to the next full and new moons.',
  'Contact Card':'Open your digital contact card and sharing QR.', LinkTree:'Open, edit, or share your public LinkTree and its QR code.', Invites:'Copy your ambassador signup link or open the program.',
  'Quick Links':'Open commonly used SaintAgent pages.', 'Community Feed':'Read and compose community posts.', News:'Open the four newest published headlines on the News page.',
  Notifications:'Filter alerts, mark them read, or open their destinations.', 'Who Is Online':'Open the live member list.',
  'InSite Browser':'Launch the existing SaintAgent browser.', Inspiration:'Cycle through short reflection prompts in a frameless card.',
  Watchlist:'See up to 30 watched records and open your full Watchlist.',
  'Quick Call':'Find members and CRM contacts, pin favorites, and place calls.',
  Macro:'Record, name, and replay your page navigation.',
  Members:'Search the member directory and open profiles.',
  'Conference Rooms':'Create or join a private audio room and copy member invite links.',
  Inbox:'Read, search, compose, and manage received and sent messages.',
  Messages:'Read and reply to conversations without leaving the Dock.',
  'Pinned Item':'Keep a shortcut to a SaintAgent page or record.'
};
export const widgetLabel = type => type === 'Contact Card' ? 'Digital Contact Card' : type === 'Recent' ? 'History' : type;
export const icons = ['▦','★','◈','☀','✦','◉','◇','◆'];
export const safePath = value => typeof value === 'string' && /^\/(?!\/)[^\\\x00-\x20\x7f]*$/.test(value);
export const widget = (type, settings = {}) => ({ id:crypto.randomUUID(), type, settings, deck:'main', place:'deck' });
export const initial = () => ({ active:'main', decks:[{id:'main',name:'My Dock',icon:icons[0]}], cards:[widget('Quick Access'),widget('Quick Notes')], width:1120, label:true, beside:false, folders:true, video:false, opacity:100, shortcuts:defaultShortcuts });