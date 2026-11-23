import { SIDEBAR_STOPS } from '@/components/tour/sidebarOverview';

const stop = (title, what, action, anchor) => ({ title, what, action, anchor });
const landmark = (id) => `[data-deck-tour="${id}"]`;
const card = (id) => `main[data-page="CommandDeck"] [data-tour-card="${id}"]`;
export const DECK_OVERVIEW = [
  { area: 'Top of the screen', stops: [
    stop('Top toolbar', 'The toolbar is available across SaintAgent. It brings you back to the Command Deck and gives you quick access to search, messages, notifications, and your account.', 'Use the Command Deck icon to return home, the bell to review alerts, or your avatar to open account options.', '#app-topbar'),
    stop('Navigation sidebar', 'The left sidebar is the directory of the app. Pages are grouped by what you want to do: Discover, Participate, Connect, Build & Manage, Treasury & Exchange, and Intelligence.', 'Type a known page name into Search pages, or expand a group when you’re not sure where to start. On mobile, tap the floating menu button to browse pages.', '[data-sidebar]'),
  ] },
  { area: 'Left sidebar', stops: SIDEBAR_STOPS },
  { area: 'Dashboard and shortcuts', stops: [
    stop('Command Deck header', 'This header identifies your home dashboard. The lightning bolt opens Quick Create, and Read Me opens a short starter guide.', 'Open Quick Create to see actions like Post, Mission, and Meeting. Close it without submitting if you’re only exploring.', landmark('header')),
    stop('Your profile at a glance', 'The profile card keeps your identity, rank, and profile information together at the top of the dashboard.', 'Compare your profile summary with what you want others to see. Make edits on your Profile and review visibility in Settings.', '[data-avatar-card]'),
    stop('Activity banner', 'The dashboard banner is a quick way to notice recent activity without leaving the Command Deck.', 'Scan what’s showing now, then open the relevant section if you want more context.', landmark('activity')),
    stop('Dashboard metrics', 'These tiles summarize gold price, GGG balance, rank, reach, earnings, meetings, and missions. They describe different things; rank, for example, isn’t a wallet balance.', 'Start with the number that matches your question. Use the wallet view for transactions, or Meetings to see your schedule rather than relying on a summary count.', landmark('metrics')),
    stop('Getting Started Tours', 'This card holds the Command Deck Overview and topic tours. You can collapse it, hide it, or send it to the side panel without losing progress.', 'Use the chevron to collapse or expand, the crossed-out eye to hide, or Send to side panel to store it. Use Restore to deck beside a stored card, or Controls Deck → Unstow All to bring every hidden or stored card back. Open The Basics to practice these controls.', card('dailyTours') + ' .collapsible-card-header'),
    stop('Activity Cards', 'Six shortcuts take you from an intention to a page: Earn opens Marketplace, Learn opens the guide, Build opens Missions, Teach opens Studio, Lead opens Leader Channel, and Connect opens Circles.', 'Choose a shortcut by what you want to do. For example, choose Build to find work to join, or Connect to find a group.', landmark('shortcuts')),
    stop('Controls Deck', 'These controls change how the cards below are presented. They are for organizing your deck, not for changing the underlying projects, missions, or messages.', 'Use the deck controls to change the view or manage cards. If a card was moved into the side panel, look for it there before assuming it’s gone.', landmark('controls')),
    stop('Command Deck card icons', 'A card header holds a mixture of labels, actions, and an expand or collapse control. Not every card has every action.', 'Try each icon below before using it on a live card. Notice the difference between hiding a card and moving it to the side panel.', 'main[data-page="CommandDeck"] [data-tour-card] .collapsible-card-header'),
  ] },
  { area: 'Activity and community cards', stops: [
    stop('News & Updates', 'This card previews platform news and announcements.', 'Scan a headline and open News & Updates for the full article and publication date.', card('news')),
    stop('Hero Gallery', 'The gallery shows the images used in SaintAgent’s hero banners.', 'Open the gallery to browse artwork in a larger view.', card('heroGallery')),
    stop('Quick Actions', 'This card groups shortcuts for common actions, including Quick Create, Tune Engine, and Online Users.', 'Choose Quick Create to start something, Tune Engine to adjust recommendations, or Online Users to see who is available.', card('quickActions')),
    stop('Quick Start Checklist', 'The checklist helps you track practical setup tasks. Unlike the tour, it’s meant to help you do the work, not just learn where it happens.', 'Open the checklist, pick one unfinished task, and return after doing it.', card('quickStart')),
    stop('Challenges & Rewards', 'This card summarizes challenge activity and progress toward eligible rewards.', 'Open a challenge to check its requirements and deadline before expecting a reward.', card('challenges')),
    stop('Inbox & Signals', 'This card surfaces recent notifications without making you leave the dashboard.', 'Look for items that need a response and open the related page if you need the full context.', card('inbox')),
    stop('Potential Collaborators', 'This card suggests people who may be a fit for collaboration. It doesn’t establish that a person is available or has agreed to help.', 'Check a suggested person’s skills and profile, then mention the specific work you’re inviting them to help with.', card('collaborators')),
    stop('Community Feed', 'The feed gives you a look at what members are sharing and discussing.', 'Open a post that interests you and read its recent replies before joining the discussion.', card('communityFeed')),
    stop('Circles & Regions', 'This card points you toward groups and regional activity.', 'Look for a group that matches your interests or location, and read its purpose before joining.', card('circles')),
    stop('Leaderboard', 'The leaderboard compares progress in its current ranking view. It is not a list of everyone’s skills or availability.', 'Check what’s being ranked before interpreting anyone’s position.', card('leaderboard')),
    stop('St. Germain Affirmations', 'This card provides reflective prompts, separate from task and reward tracking.', 'Open it when you want a short moment of reflection, then return to your next action.', card('affirmations')),
    stop('Community Voices', 'This card collects member testimonials and stories about their experience.', 'Browse it for community perspectives rather than as an official guide to platform features.', card('testimonials')),
  ] },
  { area: 'Media, discovery and work cards', stops: [
    stop('SaintTube Videos', 'This card previews videos shared on SaintAgent.', 'Choose a video to open the player or use the video area to browse more.', card('videos')),
    stop('SpiritTube', 'This is a separate video collection focused on spiritual content.', 'Open it to browse that collection rather than looking for it in the general video card.', card('spiritTube')),
    stop('Deep Disclosure Podcast', 'This card gives you access to Deep Disclosure episodes.', 'Choose an episode and use its player to listen.', card('deepDisclosure')),
    stop('Global Schedule', 'This card shows scheduled programming and gatherings.', 'Check the start time and your time zone before making plans to join.', card('globalSchedule')),
    stop('Leader Pathway', 'This card explains the pathway toward leadership participation and helps you see where you are in that process.', 'Read the current requirements before deciding whether to apply or take another step.', card('leaderPathway')),
    stop('AI Discover', 'AI Discover helps surface possible connections. The results are suggestions, not commitments.', 'Open a suggested profile and check the reason for the recommendation against what you need.', card('aiDiscover')),
    stop('Synchronicity Engine', 'The engine groups matches and signals across different kinds of connections.', 'Choose the relevant match category, inspect an individual result, and decide whether it makes sense to reach out.', card('syncEngine')),
    stop('Meetings & Momentum', 'This card brings meeting requests and scheduled conversations into one place.', 'Review pending requests first, then check the timing and joining details for confirmed meetings.', card('meetings')),
    stop('Missions', 'Missions are organized activities with an objective and, where provided, milestones and rewards.', 'Open a mission to check the objective, join policy, and commitment. Joining and earning a reward are separate steps.', card('missions')),
    stop('Projects', 'This card is a starting point for exploring larger pieces of work and their status.', 'Open a project to learn its goal, stage, and team before deciding whether to offer help.', card('projects')),
    stop('Marketplace: Earn & Learn', 'This card connects you with offers and requests for skills, services, and learning.', 'Check whether a listing is an offer or a request, then review its terms before booking or contacting anyone.', card('market')),
    stop('Influence & Reach', 'This card shows signals about how far your activity reaches others.', 'Use changes as clues about what people engage with, rather than assuming they measure the quality of your work.', card('influence')),
    stop('144K Leader Channel', 'The Leader Channel brings together leadership participation and related information.', 'Open it to review opportunities and any requirements that apply to your role.', card('leader')),
    stop('Daily Ops', 'Daily Ops is the working area for your schedule, tasks, and daily progress.', 'Check what’s due or blocked, then choose one actionable task to schedule.', card('dailyops')),
  ] },
  { area: 'Right side of the screen', stops: [
    stop('Right side panel', 'The side panel keeps shortcuts and selected dashboard information nearby. It can also hold cards you’ve moved off the main deck.', 'Open it using the edge handle when you want quick access or need to find a stored card.', '[data-side-panel-handle]'),
    stop('Help and chat', 'Help is for questions about how to use the current page. Chat is for conversations, not a substitute for the help guide.', 'Open My Assistant, select Saint Support, and ask about the exact action you’re trying to take, such as finding a stored card.', landmark('help')),
    stop('Appearance toolbar', 'This floating toolbar is separate from the top navigation bar. It changes the look of the app and includes shortcuts for help, alerts, and signing out.', 'Try the example icons below to learn what each control opens without changing your preferences.', landmark('appearance')),
  ] },
];
export const DECK_STOPS = DECK_OVERVIEW.flatMap(({ area, stops }) => stops.map(item => ({ ...item, area })));

const overviewStop = title => DECK_STOPS.find(item => item.title === title);
export const WELCOME_OVERVIEW = [
  { area: 'Find your way', stops: [
    stop('Start at the Command Deck', 'The Command Deck is your home base. The top toolbar takes you back here from across SaintAgent.', 'Look for the Command Deck icon in the toolbar whenever you want to get back to your dashboard.', '#app-topbar [data-tour-command-icon]'),
    overviewStop('Navigation sidebar'),
    overviewStop('Your profile at a glance'),
  ] },
  { area: 'Find something to do', stops: [
    overviewStop('Activity Cards'),
    overviewStop('Missions'),
    overviewStop('Projects'),
  ] },
  { area: 'Keep exploring', stops: [
    stop('Help and more tours', 'The Getting Started Tours card has the full overview and seven topic tours. They stay available after this welcome walkthrough.', 'Choose The Basics to practice, or open My Assistant and select Saint Support when you have a specific question.', card('dailyTours') + ' .collapsible-card-header'),
  ] },
];
export const WELCOME_STOPS = WELCOME_OVERVIEW.flatMap(({ area, stops }) => stops.map(item => ({ ...item, area })));