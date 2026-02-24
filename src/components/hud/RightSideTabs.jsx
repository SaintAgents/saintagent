import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { HelpCircle, Globe, X, Send, Loader2, Shield, Smile, Target, Coins, TrendingUp, Heart, Users, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import BetaFeedbackModal from '@/components/feedback/BetaFeedbackModal';
import TownHallCall from '@/components/video/TownHallCall';
import { format, parseISO } from 'date-fns';

const QUICK_QUESTIONS = [
  { icon: Target, label: 'How do I find matches?', question: 'How does the Synchronicity Engine work and how do I find good matches?' },
  { icon: Coins, label: 'What are GGG rewards?', question: 'What are GGG tokens and how do I earn them?' },
  { icon: TrendingUp, label: 'How do Rank Points work?', question: 'Explain the rank system and how I can level up from Seeker to Guardian.' },
  { icon: Heart, label: 'Dating features', question: 'How do I use the dating and compatibility features?' },
  { icon: Users, label: 'Finding collaborators', question: 'How can I find people to collaborate with on projects or missions?' },
];

// Page-specific context for AI Help - two paragraphs each for detailed explanations
const PAGE_CONTEXT = {
  CommandDeck: "Welcome to your **Command Deck** - your personalized mission control center! This is where you get a complete overview of your SaintAgent journey. Here you'll see your top matches, upcoming meetings, active missions, GGG balance, and reputation points all in one place. Think of it as your daily briefing for conscious connection.\n\nFrom here you can quickly navigate to any area of the platform, check notifications, and see who's online. The widgets are customizable - you can adjust your view mode and arrange what matters most to you. Your Command Deck updates in real-time so you never miss an opportunity to connect or collaborate.",
  
  Events: "Welcome to **Events** - your gateway to community gatherings! This is where you discover, create, and RSVP to workshops, meditations, ceremonies, meetups, and discussions. Events can be online (with video links), in-person, or hybrid. Filter by category, date, or whether they're free to find what resonates with you.\n\nAs a member, you can host your own events and invite the community. Events earn you GGG rewards for attending and hosting. Look for featured events highlighted by community leaders, and check the recurring events for regular gatherings like weekly meditations or monthly full moon ceremonies.",
  
  Matches: "Welcome to **Matches** - where the Synchronicity Engine works its magic! This page shows you AI-powered connection suggestions based on your values, skills, intentions, and spiritual practices. Each match has a compatibility score (0-100) calculated from Intent Alignment, Skill Complementarity, Proximity, Timing Readiness, and Spiritual Alignment.\n\nYou can filter matches by type (People, Offers, Missions, Events, Teachers, Dating) and adjust score thresholds. Click any match to view their full profile and send a connection request. The more complete your profile, the better your matches will be. Pro tip: Check back regularly as new members join and your compatibility scores evolve!",
  
  Meetings: "Welcome to **Meetings** - your hub for meaningful 1:1 and group connections! Here you can schedule video calls, phone calls, or in-person meetups with other members. View your upcoming meetings, pending requests, and past connections. Each completed meeting earns GGG rewards and builds your reputation.\n\nYou can send meeting requests directly from match profiles, or accept incoming requests from others. Set your availability preferences in Settings so people know when you're free. Group meetings are great for team collaborations or circle gatherings. Don't forget to leave testimonials after meaningful meetings - they help build trust in our community!",
  
  Missions: "Welcome to **Missions** - collaborative quests that make a difference! Missions are goal-oriented projects where members team up to accomplish something meaningful, from community service to creative collaborations. Each mission has GGG rewards, deadlines, and participation requirements.\n\nYou can join existing missions or create your own (verified leaders can create larger missions). Browse by category - humanitarian, creative, technical, spiritual, or community. Active participation earns GGG and RP, plus you build connections with fellow mission members. Check the mission board regularly for new opportunities, and complete your assigned tasks to help the team succeed!",
  
  Marketplace: "Welcome to the **Marketplace** - where skills meet needs! This is your community exchange for services, offerings, and requests. Browse listings from fellow members offering coaching, healing, creative services, technical help, and more. You can also post what you're seeking or what you're offering.\n\nListings can be free, paid in GGG tokens, or traditional currency. Each transaction builds trust and reputation. Use filters to find exactly what you need, and check seller ratings before engaging. The marketplace is a great way to both earn GGG by helping others and find support for your own journey. Featured listings from verified members appear at the top.",
  
  Circles: "Welcome to **Circles** - your interest-based communities! Circles are groups centered around shared values, practices, locations, or interests. Join circles that resonate with you to find like-minded souls, participate in discussions, and stay updated on circle-specific events and missions.\n\nEach circle has its own chat, member directory, and activities. You can join multiple circles and even create your own if you have a unique community to build. Circle participation earns RP and helps you find deeper connections beyond 1:1 matches. Look for regional circles to connect with members near you, or practice-based circles for your spiritual path.",
  
  Messages: "Welcome to **Messages** - your communication hub! This is where all your direct conversations and group chats live. Send text messages, share files, and coordinate with connections you've made across the platform. Conversations are private and secure.\n\nYou can start new conversations from any member's profile, or use the global chat to connect with the whole community. Group chats are great for mission teams, circle discussions, or planning events. Message notifications can be customized in Settings. Pro tip: Use the icebreaker prompts if you're not sure how to start a conversation!",
  
  Profile: "Welcome to your **Profile** - your digital presence in the community! This is where you craft how others see you. Add your bio, skills, intentions, desires, spiritual practices, and what you're hoping to find. Upload a great photo and consider adding portfolio items to showcase your work.\n\nA complete profile dramatically improves your match quality and helps others understand if you'd be a good connection. Don't forget the Dating tab if you're open to romantic connections, and the Mystical Profile for your astrological and spiritual details. You can control visibility settings for each section, so share what feels right for you.",
  
  Settings: "Welcome to **Settings** - your control panel for the SaintAgent experience! Here you can manage your account, notification preferences, privacy settings, and customize how the platform works for you. Set your availability, timezone, and communication preferences.\n\nImportant sections include notification settings (email, in-app, digest frequency), privacy controls (who can see your profile, message you), and theme customization. You can also manage connected integrations, update your password, and configure your dashboard layout. Review these settings periodically to ensure the platform serves you well.",
  
  CommunityFeed: "Welcome to the **Community Feed** - the heartbeat of our collective! This is where members share updates, insights, wins, questions, and inspiration. Post text, images, or links to spark conversations and connect with the broader community.\n\nEngage with posts through likes, comments, and shares to build visibility and earn GGG. The feed algorithm surfaces content from your connections and circles first, plus trending posts from across the community. Use hashtags to categorize your posts and make them discoverable. This is a great place to celebrate milestones, ask for support, or share wisdom!",
  
  ActivityFeed: "Welcome to the **Activity Feed** - your real-time pulse on platform happenings! This chronological stream shows recent activity across SaintAgent: new members joining, missions launching, events posted, testimonials given, and more. It's a great way to stay connected and discover opportunities.\n\nFilter by activity type to focus on what interests you most. See who's been active recently and what's trending in the community. The activity feed often surfaces serendipitous connections - you might spot a new member with shared interests or a mission that's perfect for your skills. Check in daily to stay in the flow!",
  
  Projects: "Welcome to **Projects** - your collaborative workspace! Projects are structured initiatives that need team coordination, task management, and milestone tracking. Unlike missions (which are quest-style), projects are for ongoing work that requires detailed planning and execution.\n\nCreate projects for your ventures, join team projects, or browse funded initiatives seeking contributors. Each project has a team, timeline, task board, and discussion space. Project participation demonstrates leadership and collaboration skills, earning you RP and potential GGG. This is where ideas become reality through collective effort!",
  
  Quests: "Welcome to **Quests** - your gamified journey of growth! Quests are achievement-based challenges that guide you through platform features while earning badges, GGG, and RP. Complete daily, weekly, and special event quests to level up your experience.\n\nThe quest system includes personal development challenges, community engagement goals, and seasonal events. Track your progress, compete on leaderboards, and unlock special badges that display on your profile. Quests make exploring SaintAgent fun and rewarding - start with the beginner quests if you're new, then work up to legendary challenges!",
  
  Forum: "Welcome to the **Community Forum** - where deep discussions happen! Unlike the quick posts of the Community Feed, the forum is for longer-form discussions, Q&A, tutorials, and topic-based conversations. Browse categories or search for specific topics.\n\nStart new threads to ask questions or share knowledge. Helpful replies earn you GGG and build your reputation as a community contributor. The forum is searchable, so your contributions become a lasting resource. Look for pinned posts with important community information, and check the 'unanswered' filter to help fellow members!",
  
  Advice: "Welcome to the **Wisdom Exchange** - where seekers find guidance! This unique space lets you ask questions across categories (relationships, business, spiritual, health, etc.) and receive insights from both community members and AI-powered wisdom. Anonymous posting is available for sensitive topics.\n\nAnswers can be upvoted, and accepted answers earn the responder GGG rewards. The AI insight panel provides additional perspectives drawing from various wisdom traditions. This is a supportive space for life's big questions - whether you're navigating a challenge or seeking direction. Share your own wisdom by answering others' questions!",
  
  News: "Welcome to **News & Updates** - your source for platform announcements! Stay informed about new features, community highlights, policy updates, and important announcements from the SaintAgent team. We also share inspiring member stories and community wins.\n\nPress releases and official communications appear here first. Enable news notifications in Settings to never miss important updates. You can react to and comment on news articles to engage with announcements. This is also where we announce special events, seasonal challenges, and platform milestones!",
  
  LeaderChannel: "Welcome to the **Leader Channel** - exclusive space for verified 144K Leaders! This channel provides advanced tools for community leadership: broadcast capabilities, mission creation, governance participation, and direct communication with the platform team.\n\nIf you're seeing this, congratulations on achieving Leader status! Use this space responsibly to guide and inspire the community. You can create broadcasts, lead missions, and access analytics about your impact. Not a leader yet? Apply through the Leader pathway - demonstrate consistent positive contribution and complete the leadership assessment to qualify.",
  
  Schedule: "Welcome to the **Global Schedule** - your unified calendar view! See all your meetings, events, broadcasts, and mission deadlines in one chronological view. Filter by type to focus on specific activities, or view everything to plan your time effectively.\n\nThe schedule syncs across the platform, so anything you RSVP to appears here automatically. You can also see community-wide events and broadcasts. Use the day, week, or month view depending on your planning needs. This is your go-to for \"what's happening when\" across all of SaintAgent!",
  
  Broadcast: "Welcome to **Broadcast** - live audio and video for the community! This is where podcasts, town halls, and live streams happen. Join ongoing broadcasts as a listener, or host your own if you're a verified leader. Broadcasts are a powerful way to share wisdom with many people at once.\n\nUpcoming broadcasts appear in the schedule, and recordings are available for replay. During live sessions, you can participate in chat, raise your hand to speak, and engage with other attendees. Broadcasts earn both hosts and attendees GGG and RP. Check for weekly community town halls and special guest sessions!",
  
  Gamification: "Welcome to **Gamification** - track your progress and achievements! This comprehensive dashboard shows your rank, badges earned, active challenges, streak status, and position on various leaderboards. It's your at-a-glance view of growth within the SaintAgent ecosystem.\n\nThe rank system (Seeker → Guardian) reflects your overall contribution and engagement. Badges commemorate specific achievements and display on your profile. Challenges provide time-limited goals with bonus rewards. Leaderboards let you see how you compare to others. Gamification makes the journey fun while encouraging consistent positive engagement!",
  
  Teams: "Welcome to **Teams & Guilds** - organize for collective impact! Teams are formal groups that collaborate on multiple projects and missions together. Unlike circles (interest-based), teams are action-oriented with shared goals, resources, and coordination tools.\n\nCreate a team for your initiative, join existing teams seeking members, or browse team profiles to find your tribe. Teams have dedicated chat, task boards, and can take on missions together. Strong team participation demonstrates collaboration skills and can lead to leadership opportunities. Look for teams aligned with your skills and values!",
  
  Leaderboards: "Welcome to **Leaderboards** - see who's making waves! Multiple leaderboards track different aspects of community contribution: overall RP, GGG earned, missions completed, testimonials received, and more. Filter by time period (weekly, monthly, all-time) to see different perspectives.\n\nLeaderboards celebrate active contributors and inspire healthy engagement. Your position updates in real-time as you participate. Top performers often become community role models and are considered for leadership opportunities. Don't focus on competing - focus on contributing - and the rankings will follow naturally!",
  
  DailyOps: "Welcome to **Daily Ops** - your daily check-in ritual! This page helps you maintain consistent engagement through daily tasks, habit tracking, and operational reminders. Complete your daily ops to maintain streaks and earn bonus GGG.\n\nDaily activities might include: reviewing matches, checking messages, completing a quest task, or logging a gratitude. The ops refresh daily at midnight in your timezone. Consistent daily engagement builds momentum and keeps you connected to the community. Pro tip: Set a daily reminder to check in and watch your streaks grow!",
  
  Notes: "Welcome to **Notes** - your private knowledge vault! This is your personal space for journaling, note-taking, and organizing thoughts. Notes are private by default but can be shared if you choose. Use tags and folders to organize your wisdom.\n\nCapture insights from meetings, document your spiritual journey, or draft content before sharing publicly. Notes support rich text formatting and can include links and images. This is a great place to reflect on your SaintAgent experience and track your personal growth over time.",
  
  DigitalRightsExchange: "Welcome to the **Digital Rights Exchange (DRX)** - your portal for programmable digital asset rights! The DRX is a revolutionary system for licensing, renting, and monetizing your digital content. Whether you're a creator with intellectual property or a consumer seeking licensed access, this is where digital rights become tradeable assets.\n\nAs a **creator**, you can upload assets (documents, audio, video, courses, research, prompt packs) and define exactly how others can use them - view only, download, edit, remix, or redistribute. Set pricing models (one-time, subscription, per-use, or revenue share) and grant time-limited or usage-limited access. Your assets remain yours while generating ongoing revenue.\n\nAs a **consumer**, browse available assets and acquire exactly the rights you need. Each rights grant is tracked with a unique token (like DRX-AX839-0921) and includes clear terms. Check 'My Access' to see all content you have rights to, and 'Incoming Requests' for pending access approvals. The DRX brings transparency and fairness to the creator economy!",
  
  CRM: "Welcome to **Contact Network** - your federated relationship management system! This is where you track and nurture your professional and personal connections. Import contacts, log interactions, set follow-up reminders, and build your network strategically.\n\nThe unique 'federation' feature lets you share contact insights with trusted colleagues while maintaining privacy controls. Score contacts based on engagement, set pipeline stages for opportunities, and use AI-assisted follow-up suggestions. This is especially powerful for leaders, coaches, and anyone building meaningful relationships at scale.",
  
  Deals: "Welcome to **Deal Tracking** - your sales and opportunity pipeline! If you're offering services or pursuing business opportunities, this is where you track them from lead to close. Manage stages, set values, log activities, and forecast your pipeline.\n\nIntegrated with your Contact Network, deals connect to the people involved. Set reminders for follow-ups, track win/loss reasons, and analyze your conversion rates. Whether you're a solopreneur or building a team, professional deal tracking helps you grow sustainably while serving your community.",
  
  Studio: "Welcome to **Creator Studio** - your content and offering headquarters! This is where you manage everything you put out into the community: services, digital products, subscription tiers, and content. Set up your creator profile and start monetizing your gifts.\n\nConfigure pricing (GGG or traditional currency), manage subscribers, track analytics, and schedule content releases. The Studio integrates with Marketplace for visibility and DRX for digital rights management. Whether you're a healer, teacher, artist, or guide - the Studio empowers you to share and sustain your work.",
  
  Mentorship: "Welcome to **Mentorship** - connecting wisdom seekers with guides! This specialized matching system pairs those seeking guidance with experienced mentors. Whether you want to find a mentor or become one, this is your starting point.\n\nAs a **mentee**, browse mentor profiles, filter by expertise area, and request sessions. As a **mentor**, set your availability, specialties, and whether you offer paid or volunteer guidance. Mentorship sessions can be scheduled through the regular Meetings system. Building mentor-mentee relationships is one of the most rewarding aspects of SaintAgent!",
};

const SYSTEM_CONTEXT = `You are Saint Support, the helpful AI assistant for the SaintAgent platform - a conscious community for spiritual seekers, lightworkers, and builders.

PERSONALITY:
- Warm, empathetic, and grounded
- Use encouraging language aligned with the platform's values of connection, growth, and service
- Be concise but thorough
- When appropriate, reference the user's journey toward becoming a "144K Leader"

NAVIGATION - HOW TO FIND ANY PAGE:
When users ask how to find or navigate to any page, ALWAYS tell them these two methods:
1. **Left sidebar**: Click on the page name in the navigation menu on the left side of the screen
2. **Search**: Use the search bar at the top of the page to search for any page by name

Available pages in sidebar: Command Deck, Activity Feed, Matches, Meetings, Missions, Projects, Circles, Events, Marketplace, Messages, Schedule, Leader Channel, Broadcast, Community Feed, Forum, Advice, News, Settings, Profile

PLATFORM KNOWLEDGE:

1. SYNCHRONICITY ENGINE (Matches page):
- AI-powered matching based on values, skills, intentions, and spiritual practices
- Match Score (0-100) combines: Intent Alignment, Skill Complementarity, Proximity, Timing Readiness, Trust Score, and Spiritual Alignment
- Users can filter by values, practices, and score range
- Match types: People, Offers, Missions, Events, Teachers, Dating

2. GGG TOKENS:
- Platform currency earned through engagement
- Earn GGG by: completing missions, attending meetings, creating content, referrals, testimonials
- Used for: boosting profiles, marketplace purchases, premium features

3. RANK SYSTEM (Reputation Points - RP):
- Seeker (0-99 RP) → Initiate (100-249) → Adept (250-499) → Practitioner (500-999) → Master (1000-1999) → Sage (2000-3999) → Oracle (4000-6999) → Ascended (7000-9999) → Guardian (10000+)
- RP earned through: meetings completed, missions accomplished, testimonials received, contributions

4. DATING & COMPATIBILITY:
- Opt-in feature in the Dating tab
- 5 compatibility domains: Identity & Values, Emotional Stability, Communication, Growth & Intent, Lifestyle
- Users set domain weights to prioritize what matters most
- Dealbreakers filter out incompatible matches
- Profile Boost increases visibility for 24 hours

5. 144K LEADER PROGRAM:
- Special status for verified community leaders
- Apply through Leader Channel
- Benefits: broadcast to followers, create missions, governance participation

6. KEY FEATURES:
- Circles: Interest-based communities
- Missions: Collaborative quests with GGG rewards
- Marketplace: Offer/request services
- Meetings: Schedule 1:1 connections
- Studio: Content creation tools

Always guide users to explore features and complete their profiles for better matches. Encourage community participation and conscious connection.`;

// Get current page from URL - check search params first (Base44 uses ?page= pattern)
const getCurrentPage = () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get('page');
    if (pageParam) return pageParam;
    
    // Fallback to path-based detection
    const path = window.location.pathname;
    const segments = path.split('/').filter(Boolean);
    const pageName = segments[segments.length - 1] || 'CommandDeck';
    if (pageName === '' || pageName === 'index.html') return 'CommandDeck';
    return pageName;
  } catch {
    return 'CommandDeck';
  }
};

export default function RightSideTabs() {
  // Help panel state
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpHovered, setHelpHovered] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [helpMessages, setHelpMessages] = useState([]);
  const [helpInput, setHelpInput] = useState('');
  const [helpLoading, setHelpLoading] = useState(false);
  const helpScrollRef = useRef(null);
  const helpInputRef = useRef(null);

  // Chat panel state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatHovered, setChatHovered] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [townHallOpen, setTownHallOpen] = useState(false);
  const [townHallFullscreen, setTownHallFullscreen] = useState(false);
  const chatScrollRef = useRef(null);
  const queryClient = useQueryClient();

  // Hover timeout refs for smooth interactions
  const helpTimeoutRef = useRef(null);
  const chatTimeoutRef = useRef(null);

  // Help panel hover handlers
  const handleHelpMouseEnter = () => {
    clearTimeout(helpTimeoutRef.current);
    setHelpHovered(true);
  };
  const handleHelpMouseLeave = () => {
    helpTimeoutRef.current = setTimeout(() => {
      if (!helpOpen) setHelpHovered(false);
    }, 300);
  };

  // Chat panel hover handlers
  const handleChatMouseEnter = () => {
    clearTimeout(chatTimeoutRef.current);
    setChatHovered(true);
  };
  const handleChatMouseLeave = () => {
    chatTimeoutRef.current = setTimeout(() => {
      if (!chatOpen) setChatHovered(false);
    }, 300);
  };

  // Auto-scroll help messages
  useEffect(() => {
    if (helpScrollRef.current) {
      helpScrollRef.current.scrollTop = helpScrollRef.current.scrollHeight;
    }
  }, [helpMessages]);

  // Track current page and reset help when page changes
  const [trackedPage, setTrackedPage] = useState(() => getCurrentPage());
  
  // Check for page changes periodically (URL can change without remount)
  useEffect(() => {
    const checkPageChange = () => {
      const currentPage = getCurrentPage();
      if (currentPage !== trackedPage) {
        setTrackedPage(currentPage);
        // Reset help messages when page changes so it picks up new context
        setHelpMessages([]);
        // Close help panel on page change
        setHelpOpen(false);
        setHelpHovered(false);
      }
    };
    
    // Check immediately and on interval
    checkPageChange();
    const interval = setInterval(checkPageChange, 500);
    return () => clearInterval(interval);
  }, [trackedPage]);

  // Auto-open help on first visit to each page
  useEffect(() => {
    const currentPage = getCurrentPage();
    const visitedKey = `visited_page_${currentPage}`;
    try {
      const hasVisited = localStorage.getItem(visitedKey);
      if (!hasVisited && PAGE_CONTEXT[currentPage]) {
        // First visit to this page - auto open help
        setHelpOpen(true);
        setHelpHovered(true);
        localStorage.setItem(visitedKey, '1');
      }
    } catch {}
  }, [trackedPage]);

  // Focus input when help opens and set initial greeting with page context
  useEffect(() => {
    if ((helpOpen || helpHovered) && helpInputRef.current) {
      setTimeout(() => helpInputRef.current?.focus(), 100);
    }
    // Set initial greeting with page context when opened
    if ((helpOpen || helpHovered) && helpMessages.length === 0) {
      const currentPage = getCurrentPage();
      const pageContext = PAGE_CONTEXT[currentPage];
      let greeting = "Hi! I'm Saint Support, your guide to the SaintAgent platform. 🌟\n\n";
      if (pageContext) {
        greeting += `**About this page:** ${pageContext}\n\n`;
      } else {
        greeting += `**Current page:** ${currentPage}\n\n`;
      }
      greeting += "Feel free to explore the suggestions below, or ask me anything!";
      setHelpMessages([{ role: 'assistant', content: greeting }]);
    }
  }, [helpOpen, helpHovered]);

  // Help send message
  const sendHelpMessage = async (text) => {
    if (!text.trim() || helpLoading) return;
    const userMessage = { role: 'user', content: text };
    setHelpMessages(prev => [...prev, userMessage]);
    setHelpInput('');
    setHelpLoading(true);

    try {
      const conversationHistory = helpMessages.slice(-6).map(m => 
        `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
      ).join('\n');

      // Get current page context
      const currentPage = getCurrentPage();
      const pageContext = PAGE_CONTEXT[currentPage] || "";
      const contextNote = pageContext ? `\n\nCURRENT PAGE CONTEXT: ${pageContext}\nBe ready to help with questions specific to this page.` : "";

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${SYSTEM_CONTEXT}${contextNote}\n\nCONVERSATION HISTORY:\n${conversationHistory}\n\nUser: ${text}\n\nRespond helpfully and concisely. Use markdown formatting when helpful (bullet points, bold for emphasis). Keep responses under 200 words unless the topic requires more detail.`,
      });
      setHelpMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setHelpMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm having trouble connecting right now. Please try again in a moment, or check out the FAQ page for common questions." 
      }]);
    } finally {
      setHelpLoading(false);
    }
  };

  // Chat data fetching
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: userProfile } = useQuery({
    queryKey: ['userProfileForChat', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_id: user.email });
      return profiles?.[0];
    },
    enabled: !!user?.email
  });

  const { data: chatMessages = [] } = useQuery({
    queryKey: ['globalChatMessages'],
    queryFn: () => base44.entities.CircleMessage.filter({ circle_id: 'global' }, '-created_date', 50),
    enabled: chatOpen || chatHovered,
    refetchInterval: (chatOpen || chatHovered) ? 3000 : false
  });

  const { data: onlineUsers = [] } = useQuery({
    queryKey: ['onlineUsersGlobalChat'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list('-last_seen_at', 100);
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
      return profiles.filter(p => p.last_seen_at && new Date(p.last_seen_at) > fiveMinAgo);
    },
    enabled: chatOpen || chatHovered,
    refetchInterval: 10000
  });

  const sendChatMutation = useMutation({
    mutationFn: (data) => base44.entities.CircleMessage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['globalChatMessages'] });
      setChatMessage('');
    }
  });

  const handleChatSend = () => {
    if (!chatMessage.trim() || !user) return;
    sendChatMutation.mutate({
      circle_id: 'global',
      author_id: user.email,
      author_name: userProfile?.display_name || user.full_name,
      author_avatar: userProfile?.avatar_url,
      content: chatMessage.trim(),
      message_type: 'text'
    });
  };

  useEffect(() => {
    if (chatScrollRef.current && (chatOpen || chatHovered)) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, chatOpen, chatHovered]);

  const sortedChatMessages = [...chatMessages].sort((a, b) => 
    new Date(a.created_date) - new Date(b.created_date)
  );

  const showHelpPanel = helpOpen || helpHovered;
  const showChatPanel = chatOpen || chatHovered;

  // Listen for mobile tab bar events
  useEffect(() => {
    const handleOpenChat = () => {
      setChatOpen(true);
      setChatHovered(true);
    };
    const handleOpenHelp = () => {
      setHelpOpen(true);
      setHelpHovered(true);
    };
    const handleOpenRightSideTab = (e) => {
      if (e.detail?.tab === 'help') {
        setHelpOpen(true);
        setHelpHovered(true);
      } else if (e.detail?.tab === 'chat') {
        setChatOpen(true);
        setChatHovered(true);
      }
    };
    document.addEventListener('openGlobalChat', handleOpenChat);
    document.addEventListener('openGlobalHelp', handleOpenHelp);
    document.addEventListener('openRightSideTab', handleOpenRightSideTab);
    return () => {
      document.removeEventListener('openGlobalChat', handleOpenChat);
      document.removeEventListener('openGlobalHelp', handleOpenHelp);
      document.removeEventListener('openRightSideTab', handleOpenRightSideTab);
    };
  }, []);

  return (
    <>
      <BetaFeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
      
      {/* Help Tab */}
      <div 
        className={cn(
          "fixed right-0 z-[60] transition-all duration-300 ease-out",
          // On mobile, only show if panel is open (triggered from menu)
          showHelpPanel ? "block" : "hidden md:block"
        )}
        style={{ bottom: '102px' }}
        onMouseEnter={handleHelpMouseEnter}
        onMouseLeave={handleHelpMouseLeave}
      >
        {/* Tab Handle - hidden on mobile */}
        <div 
          className={cn(
            "absolute right-0 top-0 items-center justify-center w-10 h-10 cursor-pointer transition-all duration-300 hidden md:flex",
            "bg-gradient-to-l from-violet-600 to-purple-600 text-white shadow-lg",
            "rounded-l-lg border-l border-t border-b border-violet-500",
            showHelpPanel ? "translate-x-0 opacity-0" : "translate-x-0"
          )}
          onClick={() => setHelpOpen(true)}
        >
          <HelpCircle className="w-5 h-5" />
        </div>

        {/* Sliding Panel */}
        <div 
          className={cn(
            "fixed right-0 w-[380px] md:w-[380px] max-w-[calc(100vw-1rem)] bg-white dark:bg-[#050505] border border-slate-200 dark:border-[rgba(0,255,136,0.3)] shadow-2xl rounded-l-xl overflow-hidden transition-all duration-300 ease-out z-[60]",
            showHelpPanel ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
          )}
          style={{ maxHeight: 'calc(100vh - 200px)', bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px) + 16px)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-violet-500 to-purple-600">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Saint Support</h3>
                <p className="text-xs text-white/70">Here to help</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/20"
              onClick={() => { setHelpOpen(false); setHelpHovered(false); }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="h-[45vh] p-4" ref={helpScrollRef}>
            <div className="space-y-4">
              {helpMessages.map((msg, idx) => (
                <div key={idx} className={cn("flex gap-2", msg.role === 'user' ? "justify-end" : "justify-start")}>
                  {msg.role === 'assistant' && (
                    <Avatar className="w-7 h-7 shrink-0">
                      <AvatarFallback className="bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-300 text-xs">
                        <Shield className="w-3 h-3" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={cn(
                    "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                    msg.role === 'user' 
                      ? "bg-violet-600 text-white rounded-br-sm" 
                      : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm"
                  )}>
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                        {msg.content}
                      </ReactMarkdown>
                    ) : msg.content}
                  </div>
                </div>
              ))}
              {helpLoading && (
                <div className="flex gap-2 justify-start">
                  <Avatar className="w-7 h-7 shrink-0">
                    <AvatarFallback className="bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-300 text-xs">
                      <Shield className="w-3 h-3" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-sm px-4 py-3">
                    <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Questions */}
            {helpMessages.length <= 1 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Quick questions:</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendHelpMessage(q.question)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-colors"
                    >
                      <q.icon className="w-3 h-3" />
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-[#050505]/80">
            <button
              type="button"
              onClick={() => setFeedbackOpen(true)}
              className="w-full mb-2 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors"
            >
              <Smile className="w-3.5 h-3.5" />
              Submit Beta Feedback
            </button>
            <form onSubmit={(e) => { e.preventDefault(); sendHelpMessage(helpInput); }} className="flex gap-2">
              <Input
                ref={helpInputRef}
                value={helpInput}
                onChange={(e) => setHelpInput(e.target.value)}
                placeholder="Ask anything..."
                className="flex-1 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                disabled={helpLoading}
              />
              <Button type="submit" size="icon" className="rounded-xl bg-violet-600 hover:bg-violet-700 shrink-0" disabled={!helpInput.trim() || helpLoading}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Chat Tab */}
      <div 
        className={cn(
          "fixed right-0 z-[60] transition-all duration-300 ease-out",
          // On mobile, only show if panel is open (triggered from menu)
          showChatPanel ? "block" : "hidden md:block"
        )}
        style={{ bottom: '150px' }}
        onMouseEnter={handleChatMouseEnter}
        onMouseLeave={handleChatMouseLeave}
      >
        {/* Tab Handle - hidden on mobile */}
        <div 
          className={cn(
            "absolute right-0 top-0 items-center justify-center w-10 h-10 cursor-pointer transition-all duration-300 hidden md:flex",
            "bg-gradient-to-l from-blue-600 to-indigo-600 text-white shadow-lg",
            "rounded-l-lg border-l border-t border-b border-blue-500",
            showChatPanel ? "translate-x-0 opacity-0" : "translate-x-0"
          )}
          onClick={() => setChatOpen(true)}
        >
          <Globe className="w-5 h-5" />
          {onlineUsers.length > 0 && (
            <span className="absolute -top-1 -left-1 bg-emerald-500 text-white text-[10px] px-1.5 rounded-full h-4 min-w-4 flex items-center justify-center font-medium">
              {onlineUsers.length}
            </span>
          )}
        </div>

        {/* Sliding Panel */}
        <div 
          className={cn(
            "fixed right-0 w-[380px] md:w-[380px] max-w-[calc(100vw-1rem)] bg-white dark:bg-[#050505] border border-slate-200 dark:border-[rgba(0,255,136,0.3)] shadow-2xl rounded-l-xl overflow-hidden transition-all duration-300 ease-out flex flex-col z-[60]",
            showChatPanel ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
          )}
          style={{ height: 'calc(100vh - 260px)', maxHeight: '500px', bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px) + 16px)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-indigo-600">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-white" />
              <div>
                <h3 className="font-medium text-white text-sm">Global Chat</h3>
                <p className="text-xs text-white/70 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {onlineUsers.length} online
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => setTownHallOpen(true)} className="h-7 w-7 text-white hover:bg-white/20" title="Join Town Hall Video">
                <Video className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => { setChatOpen(false); setChatHovered(false); }} className="h-7 w-7 text-white hover:bg-white/20">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Online Users */}
          <div className="px-3 py-2 border-b bg-slate-50 dark:bg-slate-900 flex items-center gap-2 overflow-x-auto">
            <Users className="w-4 h-4 text-slate-400 shrink-0" />
            {onlineUsers.slice(0, 8).map(u => (
              <div key={u.id} className="relative shrink-0" data-user-id={u.user_id}>
                <Avatar className="w-6 h-6 cursor-pointer">
                  <AvatarImage src={u.avatar_url} />
                  <AvatarFallback className="text-xs">{u.display_name?.[0]}</AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-white" />
              </div>
            ))}
            {onlineUsers.length > 8 && <span className="text-xs text-slate-500">+{onlineUsers.length - 8}</span>}
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-3" ref={chatScrollRef}>
            <div className="space-y-3">
              {sortedChatMessages.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Globe className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No messages yet. Say hello!</p>
                </div>
              ) : (
                sortedChatMessages.map((msg, idx) => {
                  const isOwn = msg.author_id === user?.email;
                  const showAvatar = idx === 0 || sortedChatMessages[idx - 1]?.author_id !== msg.author_id;
                  return (
                    <div key={msg.id} className={cn("flex gap-2", isOwn ? "flex-row-reverse" : "")}>
                      {showAvatar ? (
                        <Avatar className="w-7 h-7 shrink-0 cursor-pointer" data-user-id={msg.author_id}>
                          <AvatarImage src={msg.author_avatar} />
                          <AvatarFallback className="text-xs">{msg.author_name?.[0]}</AvatarFallback>
                        </Avatar>
                      ) : <div className="w-7 shrink-0" />}
                      <div className={cn("max-w-[70%] flex flex-col", isOwn ? "items-end" : "items-start")}>
                        {showAvatar && !isOwn && (
                          <span className="text-xs text-slate-500 mb-0.5 cursor-pointer hover:text-blue-600" data-user-id={msg.author_id}>
                            {msg.author_name}
                          </span>
                        )}
                        <div className={cn(
                          "px-3 py-2 rounded-lg text-sm",
                          isOwn ? "bg-blue-600 text-white rounded-br-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 rounded-bl-sm"
                        )}>
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          {format(parseISO(msg.created_date), 'h:mm a')}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-3 border-t">
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => setTownHallOpen(true)} className="h-9 w-9 bg-emerald-50 border-emerald-200 hover:bg-emerald-100 shrink-0" title="Join Community Call">
                <Video className="w-4 h-4 text-emerald-600" />
              </Button>
              <Input
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleChatSend()}
                placeholder="Say something..."
                className="flex-1 h-9"
              />
              <Button onClick={handleChatSend} disabled={!chatMessage.trim() || sendChatMutation.isPending} size="icon" className="h-9 w-9 bg-blue-600 hover:bg-blue-700">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Town Hall Video Call */}
      {townHallOpen && (
        <div className={cn("fixed z-[70]", townHallFullscreen ? "inset-0" : "bottom-4 left-4 w-[800px] h-[600px]")}>
          <TownHallCall
            user={user}
            onClose={() => setTownHallOpen(false)}
            isFullscreen={townHallFullscreen}
            onToggleFullscreen={() => setTownHallFullscreen(!townHallFullscreen)}
          />
        </div>
      )}
    </>
  );
}