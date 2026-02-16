import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { isMobileDevice, DATA_LIMITS } from '@/components/services/dataService';
import { createPageUrl } from '@/utils';
import VideoMeetingModal from '@/components/VideoMeetingModal';
import BoostModal from '@/components/BoostModal';
import ProfileBoostModal from '@/components/boost/ProfileBoostModal';
import QuickBoostButton from '@/components/boost/QuickBoostButton';
import TuneEngineModal from '@/components/TuneEngineModal';
import OnlineUsersModal from '@/components/OnlineUsersModal';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Coins, TrendingUp, Users, Calendar, Target, DollarSign, CheckCircle, Sparkles, Plus, ArrowRight, Zap, ShoppingBag, Radio, Flame, BarChart3, List, Trophy, Eye, EyeOff, AlertCircle, RefreshCw, Play } from "lucide-react";
import FloatingPanel from '@/components/hud/FloatingPanel';
import InboxSignals from '@/components/sections/InboxSignals';
import CirclesRegions from '@/components/sections/CirclesRegions';
import SynchronicityEngine from '@/components/sections/SynchronicityEngine';
import MeetingsMomentum from '@/components/sections/MeetingsMomentum';
import MissionsQuests from '@/components/sections/MissionsQuests';
import MarketplaceEarnLearn from '@/components/sections/MarketplaceEarnLearn';
import InfluenceReach from '@/components/sections/InfluenceReach';
import ProjectMiniCard from '@/components/projects/ProjectMiniCard';
import ProjectDetailCard from '@/components/projects/ProjectDetailCard';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Folder, Search } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import MetricTile from '@/components/hud/MetricTile';
import CollapsibleCard from '@/components/hud/CollapsibleCard';
import MatchCard from '@/components/hud/MatchCard';
import MeetingCard from '@/components/hud/MeetingCard';
import MissionCard from '@/components/hud/MissionCard';
import ListingCard from '@/components/hud/ListingCard';
import ProgressRing from '@/components/hud/ProgressRing';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import SidePanel from '@/components/hud/SidePanel';
import BadgesBar from '@/components/badges/BadgesBar';
import BadgesGlossaryModal from '@/components/badges/BadgesGlossaryModal';
import QuickCreateModal from '@/components/hud/QuickCreateModal';
import ModeCard from '@/components/hud/ModeCard';
import AIMatchGenerator from '@/components/ai/AIMatchGenerator';
import AIDiscoverMatches from '@/components/ai/AIDiscoverMatches';
import ActivityBasedMatcher from '@/components/ai/ActivityBasedMatcher';
import LeaderPathway from '@/components/leader/LeaderPathway';
import QuickStartChecklist from '@/components/onboarding/QuickStartChecklist';
import HelpHint from '@/components/hud/HelpHint';
import { getRPRank, RP_LADDER } from '@/components/reputation/rpUtils';
import RankedAvatar from '@/components/reputation/RankedAvatar';
import CollaborationSuggestions from '@/components/notifications/CollaborationSuggestions';
import GamificationWidget from '@/components/gamification/GamificationWidget';
import GoldPriceTicker from '@/components/hud/GoldPriceTicker';
import MBTIPromptBanner from '@/components/profile/MBTIPromptBanner';
import CommandDeckTour, { CommandDeckLoadingScreen } from '@/components/tour/CommandDeckTour';
import CommunityFeedCard from '@/components/community/CommunityFeedCard';
import MysticalIDImage from '@/components/profile/MysticalIDImage';
import LeaderboardMiniCard from '@/components/hud/LeaderboardMiniCard';
import SynchronicityHelpHint from '@/components/hud/SynchronicityHelpHint';
import StGermainAffirmations from '@/components/hud/StGermainAffirmations';
import GGGBalanceCard from '@/components/hud/GGGBalanceCard.jsx';
import BookingRequestModal from '@/components/meetings/BookingRequestModal';
import RescheduleDialog from '@/components/meetings/RescheduleDialog';
import DeckViewModeSelector, { VIEW_MODE_CONFIG, getDefaultCustomCards } from '@/components/hud/DeckViewModeSelector';
import DestinyCardTooltip from '@/components/destiny/DestinyCardTooltip';
import NewsCard from '@/components/news/NewsCard';
import { Newspaper, Image, MessageCircle } from 'lucide-react';
import AIDashboardCustomizer from '@/components/ai/AIDashboardCustomizer';
import HeroImageSlideshow from '@/components/hud/HeroImageSlideshow';
import VideosDashboardCard from '@/components/videos/VideosDashboardCard';
import { TestimonialsCompact } from '@/components/testimonials/TestimonialsMarquee';
import SpiritTubeCard from '@/components/videos/SpiritTubeCard';
export default function CommandDeck({ theme, onThemeToggle }) {
  const queryClient = useQueryClient();
  
  const [sidePanelOpen, setSidePanelOpen] = useState(() => {
    // On mobile, side panel starts closed
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return false;
    }
    // Initialize from localStorage if available
    try {
      const saved = localStorage.getItem('sidePanelOpen');
      return saved !== 'false'; // Default to true if not set
    } catch {
      return true;
    }
  });

  // Listen for global toggle events from GlobalSidePanelNudge
  useEffect(() => {
    const handleToggle = (e) => {
      if (e.detail?.open) {
        setSidePanelOpen(true);
      }
    };
    document.addEventListener('toggleSidePanel', handleToggle);
    return () => document.removeEventListener('toggleSidePanel', handleToggle);
  }, []);

  // Persist sidePanelOpen state and notify GlobalSidePanelNudge
  useEffect(() => {
    try {
      localStorage.setItem('sidePanelOpen', String(sidePanelOpen));
    } catch {}
    // Dispatch event for GlobalSidePanelNudge to sync
    document.dispatchEvent(new CustomEvent('sidePanelStateChange', { detail: { isOpen: sidePanelOpen } }));
  }, [sidePanelOpen]);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [quickCreateType, setQuickCreateType] = useState(null);
  const [matchTab, setMatchTab] = useState('people');
  const [videoMeeting, setVideoMeeting] = useState(null);
  const [boostTarget, setBoostTarget] = useState(null);
  const [tuneEngineOpen, setTuneEngineOpen] = useState(false);
  const [onlineUsersOpen, setOnlineUsersOpen] = useState(false);
  const [inboxPopupOpen, setInboxPopupOpen] = useState(false);
  const [circlesPopupOpen, setCirclesPopupOpen] = useState(false);
  const [syncPopupOpen, setSyncPopupOpen] = useState(false);
  const [meetingsPopupOpen, setMeetingsPopupOpen] = useState(false);
  const [missionsPopupOpen, setMissionsPopupOpen] = useState(false);
  const [marketPopupOpen, setMarketPopupOpen] = useState(false);
  const [influencePopupOpen, setInfluencePopupOpen] = useState(false);
  const [leaderPopupOpen, setLeaderPopupOpen] = useState(false);
  const [quickActionsPopupOpen, setQuickActionsPopupOpen] = useState(false);
  const [quickStartPopupOpen, setQuickStartPopupOpen] = useState(false);
  const [leaderChannelPopupOpen, setLeaderChannelPopupOpen] = useState(false);
  const [projectsPopupOpen, setProjectsPopupOpen] = useState(false);
  const [dailyOpsPopupOpen, setDailyOpsPopupOpen] = useState(false);
  const [challengesPopupOpen, setChallengesPopupOpen] = useState(false);
  const [collaboratorsPopupOpen, setCollaboratorsPopupOpen] = useState(false);
  const [aiDiscoverPopupOpen, setAiDiscoverPopupOpen] = useState(false);
  const [badgeGlossaryOpen, setBadgeGlossaryOpen] = useState(false);
  const [bookingModal, setBookingModal] = useState({ open: false, targetUser: null, match: null, listing: null });
  
  // Deck view mode (simple/advanced/custom)
  const [deckViewMode, setDeckViewMode] = useState(() => {
    try {
      const saved = localStorage.getItem('deckViewMode');
      if (saved) return saved;
      // Default will be set after profile loads
      return null;
    } catch { return null; }
  });
  
  // Custom cards selection (for custom mode)
  const [customCards, setCustomCards] = useState(() => {
    try {
      const saved = localStorage.getItem('deckCustomCards');
      return saved ? JSON.parse(saved) : getDefaultCustomCards();
    } catch { return getDefaultCustomCards(); }
  });
  
  // Set default view mode based on rank when profile loads (only if not already set)
  // Note: profile query is defined below after currentUser query

  // Persist deck view mode and notify other components
  useEffect(() => {
    if (deckViewMode) {
      try { localStorage.setItem('deckViewMode', deckViewMode); } catch {}
      // Dispatch event for Sidebar and MobileMenu to sync
      document.dispatchEvent(new CustomEvent('viewModeChange', { detail: { viewMode: deckViewMode } }));
    }
  }, [deckViewMode]);
  
  // Get visible cards based on view mode
  const visibleCards = React.useMemo(() => {
    if (!deckViewMode || deckViewMode === 'simple') return new Set(VIEW_MODE_CONFIG.simple.cards);
    if (deckViewMode === 'advanced') return new Set(VIEW_MODE_CONFIG.advanced.cards);
    return new Set(customCards);
  }, [deckViewMode, customCards]);
  
  // Check if a card should be visible (combines view mode + hidden cards)
  const isCardVisible = (cardId) => {
    return visibleCards.has(cardId) && !hiddenCards.has(cardId);
  };
  const [projectSearch, setProjectSearch] = useState('');
  const [projectStatus, setProjectStatus] = useState('all');
  const [selectedProject, setSelectedProject] = useState(null);
  const [cardsForceOpen, setCardsForceOpen] = useState(null);
  
  // Tour and loading states
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [showTour, setShowTour] = useState(false);

  // Hide/Unhide functionality for cards
  const [hiddenCards, setHiddenCards] = useState(() => {
    try {
      const saved = localStorage.getItem('cmdHiddenCards');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {return new Set();}
  });

  // Stored cards in side panel (tossed from main deck)
  const [storedCards, setStoredCards] = useState(() => {
    try {
      const saved = localStorage.getItem('cmdStoredCards');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      // Validate and sanitize: only keep objects with valid id and title strings
      if (Array.isArray(parsed)) {
        return parsed.filter(card => 
          card && typeof card === 'object' && 
          typeof card.id === 'string' && 
          typeof card.title === 'string'
        ).map(card => ({ id: card.id, title: card.title })); // Strip any invalid properties like icon
      }
      // If corrupted, clear and return empty
      localStorage.removeItem('cmdStoredCards');
      return [];
    } catch {
      // If parse fails, clear corrupted data
      try { localStorage.removeItem('cmdStoredCards'); } catch {}
      return [];
    }
  });

  // Persist hidden cards
  useEffect(() => {
    try {
      localStorage.setItem('cmdHiddenCards', JSON.stringify([...hiddenCards]));
    } catch {}
  }, [hiddenCards]);

  // Persist stored cards (only id and title - never store icons)
  useEffect(() => {
    try {
      // Ensure we only save serializable data (id and title only)
      const cleanCards = storedCards.map(card => ({ id: card.id, title: card.title }));
      localStorage.setItem('cmdStoredCards', JSON.stringify(cleanCards));
    } catch {}
  }, [storedCards]);

  const toggleCardVisibility = (cardId) => {
    setHiddenCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const unhideAllCards = () => setHiddenCards(new Set());

  // Store all cards to side panel
  const storeAllCards = () => {
    const allCardIds = ['quickActions', 'quickStart', 'challenges', 'inbox', 'collaborators', 'circles', 'leaderPathway', 'aiDiscover', 'syncEngine', 'meetings', 'missions', 'projects', 'market', 'influence', 'leader', 'dailyops', 'communityFeed', 'leaderboard', 'affirmations', 'heroGallery', 'testimonials', 'videos', 'news', 'spiritTube'];
    // Create fresh array with all cards (icons will be resolved when rendering)
    const newStoredCards = allCardIds.map(id => ({ id, title: getCardTitle(id) }));
    console.log('Stowing all cards:', newStoredCards);
    setStoredCards(newStoredCards);
    setHiddenCards(new Set(allCardIds));
    // Open side panel
    setSidePanelOpen(true);
  };

  // Restore all cards from side panel
  const restoreAllCards = () => {
    setStoredCards([]);
    setHiddenCards(new Set());
  };

  // Helper to get card title by id
  const getCardTitle = (id) => {
    const titles = {
      quickActions: 'Quick Actions',
      quickStart: 'Quick Start Checklist',
      challenges: 'Challenges & Rewards',
      inbox: 'Inbox & Signals',
      collaborators: 'Potential Collaborators',
      circles: 'Circles & Regions',
      leaderPathway: 'Leader Pathway',
      aiDiscover: 'AI Discover',
      syncEngine: 'Synchronicity Engine',
      meetings: 'Meetings & Momentum',
      missions: 'Missions',
      projects: 'Projects',
      market: 'Marketplace: Earn & Learn',
      influence: 'Influence & Reach',
      leader: '144K Leader Channel',
      dailyops: 'Daily Ops',
      communityFeed: 'Community Feed',
      leaderboard: 'Leaderboard',
      affirmations: 'Affirmations',
      testimonials: 'Community Voices',
      news: 'News & Updates',
      heroGallery: 'Hero Gallery',
      videos: 'SaintTube Videos',
      spiritTube: 'SpiritTube'
    };
    return titles[id] || id;
  };

  // Card icon mapping for stored cards (icons can't be serialized to localStorage)
  const CARD_ICONS = {
    quickActions: Zap,
    quickStart: CheckCircle,
    challenges: Trophy,
    inbox: Radio,
    collaborators: Users,
    circles: Users,
    leaderPathway: Sparkles,
    aiDiscover: Sparkles,
    syncEngine: Sparkles,
    meetings: Calendar,
    missions: Target,
    projects: Folder,
    market: ShoppingBag,
    influence: TrendingUp,
    leader: Radio,
    dailyops: Calendar,
    communityFeed: Sparkles,
    leaderboard: Trophy,
    affirmations: Sparkles,
    testimonials: MessageCircle,
    news: Newspaper,
    heroGallery: Image,
    videos: Play,
    spiritTube: Play
  };

  // Toss card to side panel storage
  const handleTossToSidePanel = (cardId, title) => {
    // Don't add duplicates
    if (storedCards.some(c => c.id === cardId)) return;
    
    // Store cardId and title only (icons resolved by SidePanel)
    setStoredCards(prev => [...prev, { id: cardId, title }]);
    // Also hide it from main deck
    setHiddenCards(prev => new Set([...prev, cardId]));
    
    // Open side panel if closed
    if (!sidePanelOpen) {
      setSidePanelOpen(true);
    }
  };



  // Restore card from side panel to main deck
  const handleRestoreCard = (cardId) => {
    setStoredCards(prev => prev.filter(c => c.id !== cardId));
    // Unhide the card
    setHiddenCards(prev => {
      const newSet = new Set(prev);
      newSet.delete(cardId);
      return newSet;
    });
  };

  // Remove card from storage (without restoring)
  const handleRemoveStoredCard = (cardId) => {
    setStoredCards(prev => prev.filter(c => c.id !== cardId));
  };

  // Current user (safe for public use)
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch {
        return null;
      }
    }
  });

  // Fetch user profile (only when authenticated)
  const { data: profiles, isLoading: profileLoading } = useQuery({
    queryKey: ['userProfile', currentUser?.email],
    queryFn: async () => {
      const byEmail = await base44.entities.UserProfile.filter({ user_id: currentUser.email }, '-updated_date', 1);
      console.log('Fetched profile:', {
        ggg: byEmail?.[0]?.ggg_balance,
        rp: byEmail?.[0]?.rp_points, 
        rank: byEmail?.[0]?.rp_rank_code,
        trust: byEmail?.[0]?.trust_score,
        name: byEmail?.[0]?.display_name
      });
      return byEmail;
    },
    enabled: !!currentUser?.email,
    staleTime: 30000,
    refetchOnWindowFocus: false,
    refetchOnMount: true
  });
  const profile = profiles?.[0];

  // Set default view mode based on rank when profile loads (only if not already set)
  useEffect(() => {
    if (deckViewMode === null && profile) {
      const rankCode = profile?.rp_rank_code || 'seeker';
      // Default to advanced for all ranks above seeker
      const defaultMode = rankCode !== 'seeker' ? 'advanced' : 'simple';
      setDeckViewMode(defaultMode);
    }
  }, [profile, deckViewMode]);
  
  // Use SA# for all database queries if available, fallback to email
  const userIdentifier = profile?.sa_number || currentUser?.email;

  // GGG Balance - ALWAYS use profile as source, NEVER query wallet (causes rate limits)
  // Profile is the authoritative source and loads instantly with user data
  const walletAvailable = profile?.ggg_balance ?? 0;
  // Use rp_points for calculation, but also check rank_points as fallback
  const rpPoints = profile?.rp_points || profile?.rank_points || 0;
  const rpInfo = getRPRank(rpPoints);
  
  // Use stored rp_rank_code if available, otherwise calculate
  const effectiveRpRankCode = profile?.rp_rank_code || rpInfo.code;
  
  // Debug: Log profile data to verify it's loading
  useEffect(() => {
    console.log('CommandDeck profile state:', { 
      profileExists: !!profile,
      rp_points: profile?.rp_points, 
      ggg_balance: profile?.ggg_balance,
      trust_score: profile?.trust_score,
      follower_count: profile?.follower_count,
      display_name: profile?.display_name,
      avatar_url: profile?.avatar_url,
      reach_score: profile?.reach_score,
      total_earnings: profile?.total_earnings,
      meetings_completed: profile?.meetings_completed,
      rpInfo: rpInfo,
      walletAvailable: walletAvailable
    });
  }, [profile, rpInfo, walletAvailable]);

  // Rank definitions for hover tooltips
  const RANK_DEFS = {
    seeker: {
      short: "Exploring and learning",
      full: "A Seeker is in the stage of exploration and discovery. They are engaging with the platform, learning its structure, and demonstrating curiosity and intent without yet applying consistent practice.",
      core: "Awareness and entry"
    },
    initiate: {
      short: "Committed participant",
      full: "An Initiate has crossed the threshold from observation into commitment. They understand the fundamentals, follow established processes, and have begun intentional participation.",
      core: "Commitment and learning"
    },
    adept: {
      short: "Skilled and reliable",
      full: "An Adept demonstrates growing competence and reliability. They can apply knowledge with consistency and are trusted to operate independently within defined boundaries.",
      core: "Skill formation"
    },
    practitioner: {
      short: "Consistent application",
      full: "A Practitioner actively applies knowledge in real scenarios. Their actions are repeatable, grounded, and beneficial to others or the system as a whole.",
      core: "Application and consistency"
    },
    master: {
      short: "Proven authority",
      full: "A Master has achieved a high level of proficiency and understanding. They produce dependable outcomes, uphold standards, and are recognized for their expertise.",
      core: "Authority through mastery"
    },
    sage: {
      short: "Wise guide",
      full: "A Sage brings wisdom beyond execution. They understand context, consequences, and long-term impact, offering guidance that balances knowledge with discernment.",
      core: "Wisdom and perspective"
    },
    oracle: {
      short: "Insightful visionary",
      full: "An Oracle possesses deep insight and foresight. They recognize patterns before they fully emerge and provide clarity that helps others navigate complexity and uncertainty.",
      core: "Insight and vision"
    },
    ascended: {
      short: "Integrated leadership",
      full: "An Ascended individual operates from an elevated perspective. They integrate knowledge, wisdom, and responsibility, acting with alignment, restraint, and clarity.",
      core: "Transcendence and integration"
    },
    guardian: {
      short: "Trusted protector",
      full: "A Guardian is entrusted with stewardship and protection of the system and its people. They uphold integrity, safeguard values, and act in service of the whole rather than self.",
      core: "Protection and trust"
    }
  };

  // Onboarding progress
  const { data: onboardingRecords } = useQuery({
    queryKey: ['onboardingProgress', currentUser?.email],
    queryFn: () => base44.entities.OnboardingProgress.filter({ user_id: currentUser.email }),
    enabled: !!currentUser?.email,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false
  });
  const onboarding = onboardingRecords?.[0];
  const ONBOARDING_STEPS = 10;
  const setupPercent = onboarding ? Math.round(((onboarding.current_step || 0) + 1) / ONBOARDING_STEPS * 100) : 0;

  // Mobile-optimized limits
  const isMobile = useMemo(() => isMobileDevice(), []);
  const badgeLimit = isMobile ? DATA_LIMITS.badges.mobile : DATA_LIMITS.badges.desktop;
  const matchLimit = isMobile ? DATA_LIMITS.matches.mobile : DATA_LIMITS.matches.desktop;
  const meetingLimit = isMobile ? DATA_LIMITS.meetings.mobile : DATA_LIMITS.meetings.desktop;
  const missionLimit = isMobile ? DATA_LIMITS.missions.mobile : DATA_LIMITS.missions.desktop;
  const listingLimit = isMobile ? DATA_LIMITS.listings.mobile : DATA_LIMITS.listings.desktop;
  const notificationLimit = isMobile ? DATA_LIMITS.notifications.mobile : DATA_LIMITS.notifications.desktop;
  const challengeLimit = isMobile ? DATA_LIMITS.challenges.mobile : DATA_LIMITS.challenges.desktop;
  const projectLimit = isMobile ? DATA_LIMITS.projects.mobile : DATA_LIMITS.projects.desktop;

  // Fetch user badges by email (primary) with SA# fallback - mobile-optimized
  const badgeUserId = currentUser?.email;
  const { data: badges = [] } = useQuery({
    queryKey: ['userBadges', badgeUserId, badgeLimit],
    queryFn: async () => {
      // Try email first, then SA#
      let results = await base44.entities.Badge.filter({ user_id: badgeUserId, status: 'active' }, '-created_date', badgeLimit);
      // If no results and we have SA#, try with SA#
      if ((!results || results.length === 0) && profile?.sa_number) {
        results = await base44.entities.Badge.filter({ user_id: profile.sa_number, status: 'active' }, '-created_date', badgeLimit);
      }
      console.log('Badges fetched:', results?.length, 'for user:', badgeUserId);
      return results || [];
    },
    enabled: !!badgeUserId,
    staleTime: 300000, // 5 minutes for badges
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1
  });

  // Fetch matches - mobile-optimized
  const { data: matches = [] } = useQuery({
    queryKey: ['matches', matchLimit],
    queryFn: () => base44.entities.Match.filter({ status: 'active' }, '-match_score', matchLimit),
    staleTime: 300000, // Increased to 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1
  });

  // Fetch meetings - mobile-optimized
  const { data: meetings = [] } = useQuery({
    queryKey: ['meetings', meetingLimit],
    queryFn: () => base44.entities.Meeting.list('-scheduled_time', meetingLimit),
    staleTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1
  });

  // Fetch missions - mobile-optimized
  const { data: missions = [] } = useQuery({
    queryKey: ['missions', missionLimit],
    queryFn: () => base44.entities.Mission.filter({ status: 'active' }, '-created_date', missionLimit),
    staleTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1
  });

  // Fetch listings - mobile-optimized
  const { data: listings = [] } = useQuery({
    queryKey: ['listings', listingLimit],
    queryFn: () => base44.entities.Listing.filter({ status: 'active' }, '-created_date', listingLimit),
    staleTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1
  });

  // Fetch projects - mobile-optimized
  const { data: projects = [] } = useQuery({
    queryKey: ['projects', projectLimit],
    queryFn: () => base44.entities.Project.list('-created_date', projectLimit),
    staleTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1
  });

  // Fetch notifications - mobile-optimized
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', notificationLimit],
    queryFn: () => base44.entities.Notification.filter({ is_read: false }, '-created_date', notificationLimit),
    staleTime: 180000, // 3 minutes for notifications
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1
  });

  // Fetch challenges - mobile-optimized
  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges', userIdentifier, challengeLimit],
    queryFn: () => base44.entities.Challenge.filter({ user_id: userIdentifier, status: 'active' }, '-created_date', challengeLimit),
    enabled: !!userIdentifier,
    staleTime: 300000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1
  });

  // Daily Ops data (today)
  const todayStr = new Date().toISOString().slice(0, 10);
  const { data: dailyLogToday = [] } = useQuery({
    queryKey: ['dailyLog', userIdentifier, todayStr],
    queryFn: () => base44.entities.DailyLog.filter({ user_id: userIdentifier, date: todayStr }),
    enabled: !!userIdentifier,
    staleTime: 120000,
    refetchOnWindowFocus: false
  });
  const dailyLog = dailyLogToday?.[0];
  const dailyCompleted = dailyLog?.completed?.length || 0;
  const dailyInProgress = dailyLog?.in_progress?.length || 0;
  const dailyGGG = (dailyLog?.completed || []).reduce((s, c) => s + (Number(c.ggg_earned) || 0), 0);

  // Drag-and-drop ordering (Column C) - load from localStorage if available
  const [colCOrder, setColCOrder] = useState(() => {
    try {
      const saved = localStorage.getItem('cmdColCOrder');
      if (saved) return JSON.parse(saved);
    } catch {}
    return ['market', 'influence', 'leader', 'dailyops'];
  });
  const onDragEnd = (result) => {
    if (!result.destination) return;
    if (result.source.droppableId === 'colC' && result.destination.droppableId === 'colC') {
      const items = Array.from(colCOrder);
      const [removed] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, removed);
      setColCOrder(items);
    }
  };

  const filteredMatches = matches.filter((m) =>
  matchTab === 'people' ? m.target_type === 'person' :
  matchTab === 'offers' ? m.target_type === 'offer' :
  matchTab === 'missions' ? m.target_type === 'mission' :
  matchTab === 'events' ? m.target_type === 'event' :
  matchTab === 'teachers' ? m.target_type === 'teacher' : true
  );

  const pendingMeetings = meetings.filter((m) => m.status === 'pending');
  const scheduledMeetings = meetings.filter((m) => m.status === 'scheduled');
  const completedMeetingsThisWeek = meetings.filter((m) => m.status === 'completed').length;

  // Project filters
  const filteredProjects = (projects || []).filter((p) => {
    const statusOk = projectStatus === 'all' || p.status === projectStatus;
    const q = projectSearch.toLowerCase();
    const textOk = !q || (p.title || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q);
    return statusOk && textOk;
  });
  const totalProjects = (projects || []).length;
  const approvedCount = (projects || []).filter((p) => p.status === 'approved').length;
  const pendingCount = (projects || []).filter((p) => p.status === 'pending_review').length;
  const submittedCount = (projects || []).filter((p) => ['draft', 'pending_review'].includes(p.status)).length;

  // Seed demo projects once on first visit (local flag)
  useEffect(() => {
    const k = 'demoProjectsSeeded_v1';
    if (typeof window !== 'undefined' && !localStorage.getItem(k)) {
      base44.functions.invoke('seedProjects', {}).
      then(() => queryClient.invalidateQueries({ queryKey: ['projects'] })).
      finally(() => {try {localStorage.setItem(k, '1');} catch {}});
    }
  }, [queryClient]);

  // SA#: Assign incrementally for new signups only
  useEffect(() => {
    (async () => {
      if (!currentUser?.email || !profile?.id) return;
      if (!profile.sa_number) {
        try {
          await base44.functions.invoke('assignSaNumber', {});
          queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        } catch (e) {
          console.error('SA assignment failed', e);
        }
      }
    })();
  }, [currentUser?.email, profile?.id, profile?.sa_number]);

  const updateMatchMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Match.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['matches'] })
  });

  const updateMeetingMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Meeting.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['meetings'] })
  });

  const createMutation = useMutation({
    mutationFn: ({ entity, data }) => {
      if (entity === 'Listing') return base44.entities.Listing.create(data);
      if (entity === 'Meeting') return base44.entities.Meeting.create(data);
      if (entity === 'Mission') return base44.entities.Mission.create(data);
      return Promise.reject('Unknown entity');
    },
    onSuccess: (_, variables) => {
      if (variables.entity === 'Listing') queryClient.invalidateQueries({ queryKey: ['listings'] });
      if (variables.entity === 'Meeting') queryClient.invalidateQueries({ queryKey: ['meetings'] });
      if (variables.entity === 'Mission') queryClient.invalidateQueries({ queryKey: ['missions'] });
    }
  });

  const handleMatchAction = async (action, match) => {
    if (action === 'save') {
      updateMatchMutation.mutate({ id: match.id, data: { status: 'saved' } });
    } else if (action === 'decline') {
      updateMatchMutation.mutate({ id: match.id, data: { status: 'declined' } });
    } else if (action === 'message') {
      // Open floating chat with the matched user
      document.dispatchEvent(new CustomEvent('openFloatingChat', {
        detail: {
          recipientId: match.target_id,
          recipientName: match.target_name,
          recipientAvatar: match.target_avatar
        }
      }));
    } else if (action === 'book') {
      // Open booking modal with target user info
      setBookingModal({
        open: true,
        targetUser: {
          id: match.target_id,
          email: match.target_id,
          name: match.target_name,
          avatar: match.target_avatar
        },
        match: match,
        listing: null
      });
    }
  };

  const [rescheduleModal, setRescheduleModal] = useState({ open: false, meeting: null });

  const handleMeetingAction = async (action, meeting) => {
    if (action === 'accept') {
      updateMeetingMutation.mutate({ id: meeting.id, data: { status: 'scheduled' } });
    } else if (action === 'decline') {
      updateMeetingMutation.mutate({ id: meeting.id, data: { status: 'declined' } });
    } else if (action === 'reschedule') {
      setRescheduleModal({ open: true, meeting });
    } else if (action === 'confirm') {
      updateMeetingMutation.mutate({ id: meeting.id, data: { status: 'completed', guest_confirmed: true, ggg_earned: 0.03 } });
      await base44.entities.GGGTransaction.create({
        user_id: userIdentifier,
        source_type: 'meeting',
        source_id: meeting.id,
        delta: 0.03,
        reason_code: 'meeting_completed',
        description: `Meeting completed with ${meeting.host_name}`,
        balance_after: (profile.ggg_balance || 0) + 0.03
      });
      // Gamification: points + badge for first meeting
      try {
        await base44.entities.UserProfile.update(profile.id, {
          engagement_points: (profile.engagement_points || 0) + 25
        });
        const hasBadge = await base44.entities.Badge.filter({ user_id: userIdentifier, code: 'first_meeting' });
        if (!(hasBadge && hasBadge.length)) {
          await base44.entities.Badge.create({ user_id: userIdentifier, code: 'first_meeting', status: 'active' });
        }
      } catch (e) {
        console.error('Gamification meeting award failed', e);
      }
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    } else if (action === 'view') {
      window.location.href = createPageUrl('Meetings');
    } else if (action === 'join') {
      setVideoMeeting(meeting);
    }
  };

  const handleMissionAction = async (action, mission) => {
    if (action === 'join') {
      const newParticipants = [...(mission.participant_ids || []), userIdentifier];
      await base44.entities.Mission.update(mission.id, {
        participant_ids: newParticipants,
        participant_count: newParticipants.length
      });
      queryClient.invalidateQueries({ queryKey: ['missions'] });
    } else if (action === 'view') {
      window.location.href = createPageUrl('Missions');
    }
  };

  const handleListingAction = async (action, listing) => {
    if (action === 'book') {
      // Open booking modal with listing owner info
      setBookingModal({
        open: true,
        targetUser: {
          id: listing.owner_id,
          email: listing.owner_id,
          name: listing.owner_name,
          avatar: listing.owner_avatar
        },
        match: null,
        listing: listing
      });
    }
  };

  const handleCreate = async (type, data) => {
    try {
      if (type === 'post') {
        await base44.entities.Post.create({
          author_id: userIdentifier,
          author_name: profile.display_name,
          author_avatar: profile.avatar_url,
          content: data.content,
          image_urls: data.image_urls || []
        });
      } else if (type === 'offer') {
        await createMutation.mutateAsync({
          entity: 'Listing',
          data: {
            owner_id: userIdentifier,
            owner_name: profile.display_name,
            owner_avatar: profile.avatar_url,
            listing_type: 'offer',
            category: data.category,
            title: data.title,
            price_amount: parseFloat(data.price) || 0,
            is_free: !data.price || parseFloat(data.price) === 0,
            duration_minutes: parseInt(data.duration) || 60,
            delivery_mode: 'online',
            status: 'active'
          }
        });
        window.location.href = createPageUrl('Marketplace');
      } else if (type === 'meeting') {
        await createMutation.mutateAsync({
          entity: 'Meeting',
          data: {
            title: data.title,
            host_id: userIdentifier,
            guest_id: data.recipient,
            host_name: profile.display_name,
            guest_name: data.recipient,
            host_avatar: profile.avatar_url,
            meeting_type: data.type || 'casual',
            status: 'pending'
          }
        });
        window.location.href = createPageUrl('Meetings');
      } else if (type === 'mission') {
        await createMutation.mutateAsync({
          entity: 'Mission',
          data: {
            title: data.title,
            objective: data.objective || data.description,
            creator_id: userIdentifier,
            creator_name: profile.display_name,
            mission_type: 'personal',
            status: 'active'
          }
        });
        window.location.href = createPageUrl('Missions');
      }
    } catch (error) {
      console.error('Create error:', error);
    }
  };

  // Check if user just completed onboarding - ONLY show tour once ever
  useEffect(() => {
    const tourComplete = localStorage.getItem('commandDeckTourComplete') === 'true';
    const justCompletedOnboarding = localStorage.getItem('onboardingJustCompleted') === '1';
    
    // Only show tour if user JUST completed onboarding AND tour hasn't been shown before
    if (justCompletedOnboarding && !tourComplete) {
      setShowLoadingScreen(true);
      try { localStorage.removeItem('onboardingJustCompleted'); } catch {}
      try { localStorage.setItem('commandDeckTourComplete', 'true'); } catch {}
    }
    // Never show tour for returning users - tour is ONLY for fresh onboarding completion
  }, []);

  const handleLoadComplete = () => {
    setShowLoadingScreen(false);
    setShowTour(true);
  };

  const handleTourComplete = () => {
    setShowTour(false);
  };

  // Show loading state while essential data is being fetched
  const isLoading = !currentUser;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading screen with Command Deck preview
  if (showLoadingScreen) {
    return <CommandDeckLoadingScreen onLoadComplete={handleLoadComplete} />;
  }

  return (
  <div className="min-h-screen cmd-deck-bg pb-32 md:pb-20 w-full max-w-full overflow-x-hidden m-0 p-0">
    <div className={cn(
      "transition-all duration-300 pb-8 w-full",
      sidePanelOpen ? "md:pr-80" : "md:pr-0",
      "max-w-full",
      "px-0 md:px-0"
    )}>
      {/* Page Header */}
      <div className="px-0 md:px-6 pt-6 pb-4 w-full" style={{ marginTop: '48px' }}>
          <div className="relative flex items-start justify-between mb-6 p-4 rounded-2xl overflow-hidden bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50" style={{ marginTop: '-44px' }}>
            <div className="absolute inset-0 rounded-2xl pointer-events-none z-0" />
            <div className="relative z-10 flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white dark:drop-shadow-[0_0_10px_rgba(0,255,136,0.5)]">Command Deck</h1>
                <p className="text-teal-500 dark:text-[#00ff88] mt-1">Your mission control center</p>
              </div>
            </div>
            <div className="flex items-center gap-3 relative z-10">
              <button
                className="p-2 hover:bg-violet-100 dark:hover:bg-violet-900/30 rounded-lg transition-colors"
                onClick={() => setQuickCreateOpen(true)}
                title="Quick Create"
              >
                <Zap className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              </button>
              <Popover>
              <PopoverTrigger asChild>
                <button
                  className="p-2 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-lg transition-colors relative"
                  title="Read Me - Quick Start Guide"
                >
                  <AlertCircle className="w-6 h-6 text-amber-500" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-bold text-amber-600 whitespace-nowrap">READ ME</span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-4" align="end" side="bottom" sideOffset={5} collisionPadding={16}>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  Quick Start Guide
                </h4>
                  <ol className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400 text-xs font-bold flex items-center justify-center">1</span>
                      <span className="text-slate-700 dark:text-slate-300">Complete your profile with avatar & bio</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400 text-xs font-bold flex items-center justify-center">2</span>
                      <span className="text-slate-700 dark:text-slate-300">Join a Circle or create your own</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400 text-xs font-bold flex items-center justify-center">3</span>
                      <span className="text-slate-700 dark:text-slate-300">Book your first meeting with a match</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400 text-xs font-bold flex items-center justify-center">4</span>
                      <span className="text-slate-700 dark:text-slate-300">Create an offer or join a mission</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center justify-center">5</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">📖 READ ME: Earn GGG! - Refer friends, Advanced view for more to Explore and receive rewards, submit projects for funding.</span>
                    </li>
                  </ol>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Profile Identifiers */}
          <div className="relative mb-6 p-2 md:p-6 rounded-2xl overflow-hidden bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 mx-0" data-avatar-card>

            <div className="absolute inset-0 rounded-2xl pointer-events-none" data-avatar-bg style={{ display: 'none' }} />
            <div className="absolute inset-0 rounded-2xl pointer-events-none" data-avatar-overlay />
            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6">
              {/* Left column: Avatar only */}
              <div className="relative shrink-0" data-user-id={profile?.user_id || currentUser?.email}>
                {/* Debug: profile avatar = {profile?.avatar_url} */}
                <RankedAvatar
                  src={profile?.avatar_url || null}
                  name={profile?.display_name || currentUser?.full_name || 'User'}
                  size={120}
                  leaderTier={profile?.leader_tier}
                  rpRankCode={profile?.rp_rank_code}
                  rpPoints={profile?.rp_points || 0}
                  trustScore={profile?.trust_score}
                  userId={profile?.user_id || currentUser?.email}
                  saNumber={profile?.sa_number}
                  affiliatePaidCount={profile?.activated_referral_count}
                  status={profile?.status || 'online'}
                  galleryImages={profile?.gallery_images || []} />
                  </div>

                  <div className="flex-1 min-w-0 w-full">
                {/* Header: Name, Title, Trust Score */}
                <div className="flex flex-col md:flex-row items-center md:items-start justify-between mb-4 gap-4">
                  <div className="text-center md:text-left">
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                      {profile?.display_name || currentUser?.full_name || 'User'}
                    </h2>
                    <div className="flex items-center gap-1">
                      <p className="text-purple-500 text-sm capitalize">
                        {profile?.rp_rank_code ? profile.rp_rank_code.charAt(0).toUpperCase() + profile.rp_rank_code.slice(1) : rpInfo.title} • @{profile?.handle} {profile?.sa_number ? ` - SA#${profile.sa_number}` : ''}
                      </p>
                      <HelpHint
                        content={
                        <div>
                            <div className="text-gray-800 mb-1 font-semibold">Rank progression</div>
                            <div className="text-slate-700">Current: {rpInfo.title} ({rpPoints} RP)</div>
                            {rpInfo.nextMin ?
                          <div className="text-slate-600">Next: {rpInfo.nextTitle} at {rpInfo.nextMin} RP • {Math.max(0, rpInfo.nextMin - rpPoints)} RP to go</div> :

                          <div>You're at the highest rank.</div>
                          }
                            <div className="mt-2">
                              <div className="text-xs font-semibold text-slate-900 mb-1">Ranks key</div>
                              <div className="overflow-hidden rounded-lg border border-slate-300 bg-white">
                                <table className="w-full text-xs">
                                  <thead className="bg-slate-100">
                                    <tr>
                                      <th className="text-left px-3 py-2 font-semibold text-slate-900">Rank</th>
                                      <th className="text-left px-3 py-2 font-semibold text-slate-900">Min RP</th>
                                      <th className="text-left px-3 py-2 font-semibold text-slate-900">Short</th>
                                      <th className="text-left px-3 py-2 font-semibold text-slate-900">Core Meaning</th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white">
                                    {RP_LADDER.map((t) =>
                                  <tr key={t.code} className="border-t border-slate-200 hover:bg-slate-50">
                                        <td className="px-3 py-2 text-slate-900 capitalize">
                                          <HoverCard>
                                            <HoverCardTrigger asChild>
                                              <span className="cursor-help font-medium text-slate-900">{t.title}</span>
                                            </HoverCardTrigger>
                                            <HoverCardContent className="w-80 bg-white border-slate-300">
                                              <div className="text-sm font-semibold text-slate-900 capitalize">{t.title} • {t.min}+</div>
                                              {RANK_DEFS[t.code]?.full &&
                                          <div className="mt-2 text-xs text-slate-700">
                                                  <div className="font-semibold text-slate-900">Definition:</div>
                                                  <div className="text-slate-700">{RANK_DEFS[t.code].full}</div>
                                                </div>
                                          }
                                            </HoverCardContent>
                                          </HoverCard>
                                        </td>
                                        <td className="px-3 py-2 text-slate-900">{t.min}+</td>
                                        <td className="px-3 py-2 text-slate-700">{RANK_DEFS[t.code]?.short || '-'}</td>
                                        <td className="px-3 py-2 text-slate-700">{RANK_DEFS[t.code]?.core || '-'}</td>
                                      </tr>
                                  )}
                                  </tbody>
                                </table>
                              </div>
                              <div className="mt-1 text-[11px] text-slate-600">Hover rank name for full definition</div>
                            </div>
                            {rpInfo.nextMin &&
                          <div className="mt-2">
                                <div className="text-zinc-800 mb-1 text-xs font-semibold">Ramp up goals</div>
                                <ul className="list-disc ml-4 text-xs text-slate-600 space-y-0.5">
                                  <li className="text-zinc-500">Complete quality meetings and request testimonials</li>
                                  <li className="text-zinc-500">Finish missions and contribute to projects</li>
                                  <li>Maintain positive interactions to raise trust</li>
                                </ul>
                              </div>
                          }
                          </div>
                        } />

                    </div>
                  </div>
                  
                  {/* Trust Score Gauge - top right corner */}
                  <div className="flex flex-col items-center shrink-0 mt-0 md:mt-[-25px] md:mr-[-3px]" data-no-filter="true" style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>
                    <div className="relative" data-no-filter="true" style={{ width: '120px', height: '120px', background: 'transparent', border: 'none', boxShadow: 'none' }}>
                      {/* Gauge dial - 170px base */}
                      <img
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/36e5f08f7_gemini-25-flash-image_a_brass_serving_tray_that_is_actually_a_control_panel_with_interesting_meters_an-3_inPixio.png"
                        alt="Trust Gauge"
                        className="absolute inset-0 w-full h-full object-contain drop-shadow-lg gauge-image"
                        style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}
                        data-no-filter="true" />
                      {/* Trust score number centered in gauge */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ background: 'transparent' }}>
                        <span className="text-2xl md:text-3xl font-bold text-emerald-400 dark:text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.6)]">{profile?.trust_score || 0}</span>
                      </div>
                      {/* Cyan trust ring - shows actual percentage (not full) */}
                      <svg 
                        className="absolute inset-0 w-full h-full pointer-events-none" 
                        viewBox="0 0 100 100"
                        style={{ background: 'transparent' }}
                      >
                        {/* Background circle */}
                        <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="3" fill="none" className="text-slate-300/50 dark:text-slate-600/50" />
                        {/* Progress circle - starts from top (12 o'clock) */}
                        <circle 
                          cx="50" cy="50" r="35" 
                          stroke="url(#trustGradientCmd)" 
                          strokeWidth="3" 
                          fill="none" 
                          strokeDasharray={`${2 * Math.PI * 35}`} 
                          strokeDashoffset={`${2 * Math.PI * 35 * (1 - (profile?.trust_score || 0) / 100)}`}
                          style={{ 
                            transform: 'rotate(-90deg)', 
                            transformOrigin: '50% 50%' 
                          }}
                          className="transition-all duration-700" 
                          strokeLinecap="round" 
                        />
                        <defs>
                          <linearGradient id="trustGradientCmd" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="50%" stopColor="#14b8a6" />
                            <stop offset="100%" stopColor="#06b6d4" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                    {/* Trust Score label */}
                    <div className="flex items-center gap-1.5 mt-[13px] md:mt-[1px]">
                      <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 flex items-center gap-0.5">
                        Trust
                        <HelpHint
                          content={
                          <div>
                            <div className="text-slate-400 mb-1 font-semibold">What is Trust Score?</div>
                            <div className="text-zinc-500">0-100 indicator influenced by testimonials, completed meetings, positive interactions, and policy adherence.</div>
                          </div>
                          } />
                      </p>
                    </div>
                  </div>
                </div>

                {/* View Mode + Theme Radio Buttons */}
                <div className="mb-4 flex flex-wrap items-center gap-4">
                  {/* Deck View Mode Selector */}
                  <DeckViewModeSelector 
                    viewMode={deckViewMode} 
                    onViewModeChange={setDeckViewMode}
                  />
                  
                  <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 hidden md:block" />
                  
                  {/* Theme Radio Buttons */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Theme:</span>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="themeSelect"
                        value="light"
                        checked={theme === 'light'}
                        onChange={() => onThemeToggle?.('light')}
                        className="w-3.5 h-3.5 text-violet-600 focus:ring-violet-500"
                      />
                      <span className="text-xs text-slate-700 dark:text-slate-300">Light</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="themeSelect"
                        value="dark"
                        checked={theme === 'dark'}
                        onChange={() => onThemeToggle?.('dark')}
                        className="w-3.5 h-3.5 text-violet-600 focus:ring-violet-500"
                      />
                      <span className="text-xs text-slate-700 dark:text-slate-300">Dark</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="themeSelect"
                        value="hacker"
                        checked={theme === 'hacker'}
                        onChange={() => onThemeToggle?.('hacker')}
                        className="w-3.5 h-3.5 text-violet-600 focus:ring-violet-500"
                      />
                      <span className="text-xs text-slate-700 dark:text-slate-300">Hacker</span>
                    </label>
                  </div>
                </div>

                {/* Stats Bar */}
                <div className="relative bg-violet-50 dark:bg-slate-800/80 mb-4 p-3 rounded-xl" data-stats-bar>
                  {/* Loading bar at top of stats */}
                  {profileLoading && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-violet-200 dark:bg-violet-900 rounded-t-xl overflow-hidden">
                      <div className="h-full bg-violet-500 dark:bg-violet-400 animate-pulse" style={{ width: '100%' }} />
                    </div>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {/* Refresh Button */}
                    <button
                      onClick={() => {
                        queryClient.invalidateQueries({ queryKey: ['userProfile'] });
                      }}
                      disabled={profileLoading}
                      className="flex flex-col items-center justify-center p-2 rounded-lg bg-white/80 dark:bg-slate-700/80 border border-violet-200 dark:border-violet-600 hover:bg-violet-100 dark:hover:bg-violet-800/80 transition-all group disabled:opacity-50"
                      title="Refresh profile data"
                    >
                      <RefreshCw className={cn("w-5 h-5 text-violet-600 dark:text-violet-400 mb-1", profileLoading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500")} />
                      <p className="text-slate-600 dark:text-slate-300 text-xs">{profileLoading ? 'Loading...' : 'Refresh'}</p>
                    </button>
                    <div className="text-center">
                      <p className="text-lg font-bold text-violet-700 dark:text-amber-400">
                        {profileLoading ? <span className="inline-block w-12 h-5 bg-violet-200 dark:bg-violet-700 rounded animate-pulse" /> : (walletAvailable != null ? walletAvailable.toLocaleString() : profile?.ggg_balance?.toLocaleString?.() || "0")}
                      </p>
                      <p className="text-slate-600 dark:text-slate-300 text-xs inline-flex items-center gap-1 justify-center">GGG <HelpHint content="Your GGG balance" /></p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-slate-900 dark:text-violet-400">
                        {profileLoading ? <span className="inline-block w-12 h-5 bg-slate-200 dark:bg-slate-600 rounded animate-pulse" /> : (profile?.rp_points?.toLocaleString() || profile?.rank_points?.toLocaleString() || 0)}
                      </p>
                      <p className="text-slate-600 dark:text-slate-300 text-xs inline-flex items-center gap-1 justify-center">Rank Points <HelpHint content="Total rank points" /></p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-slate-900 dark:text-blue-400 mt-0.5">
                        {profileLoading ? <span className="inline-block w-8 h-5 bg-slate-200 dark:bg-slate-600 rounded animate-pulse" /> : (profile?.follower_count || 0)}
                      </p>
                      <p className="text-slate-600 dark:text-slate-300 text-xs inline-flex items-center gap-1 justify-center">Followers</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-slate-900 dark:text-emerald-400 mt-0.5">
                        {profileLoading ? <span className="inline-block w-8 h-5 bg-slate-200 dark:bg-slate-600 rounded animate-pulse" /> : (profile?.meetings_completed || 0)}
                      </p>
                      <p className="text-slate-600 dark:text-slate-300 text-xs inline-flex items-center gap-1 justify-center">Meetings</p>
                    </div>
                  </div>
                </div>

                {/* Setup Progress (if onboarding not complete) */}
                {onboarding && onboarding.status !== 'complete' &&
                <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <p className="text-sm font-medium text-amber-800">Profile setup in progress</p>
                      <span className="text-xs font-semibold text-amber-700">{setupPercent}%</span>
                    </div>
                    <Progress value={setupPercent} className="h-2" />
                    <div className="mt-2 text-right">
                      <Button variant="outline" size="sm" className="rounded-lg" onClick={() => {window.location.href = createPageUrl('Onboarding');}}>
                        Resume Setup
                      </Button>
                    </div>
                  </div>
                }

                {/* Badges & Sigils */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-purple-600 dark:text-purple-400 text-xs font-medium">Badges & Sigils</p>
                    <button className="text-xs text-violet-600 hover:underline" onClick={() => setBadgeGlossaryOpen(true)}>
                      View Glossary
                    </button>
                  </div>
                  
                  {/* Featured Badges - 3x Size */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {/* Eternal Flame Feature Badge - 3x Size */}
                    <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 border-2 border-amber-300 shadow-lg shadow-amber-200/50">
                      <img
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/49ae4822c_Screenshot2026-01-07044514-Picsart-BackgroundRemover.png"
                        alt="Eternal Flame"
                        className="w-36 h-36 object-contain drop-shadow-xl"
                        data-no-filter="true" />
                      <div className="text-center mt-3">
                        <p className="font-bold text-amber-900 text-base">Eternal Flame</p>
                        <p className="text-sm text-amber-700">Living Agent</p>
                      </div>
                    </div>
                    
                    {/* Social Butterfly Badge - 3x Size */}
                    <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-violet-50 via-purple-50 to-violet-100 border-2 border-violet-300 shadow-lg shadow-violet-200/50">
                      <img
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/01ebdeddb_Screenshot2026-01-07044414-Picsart-BackgroundRemover.png"
                        alt="Social Butterfly"
                        className="w-36 h-36 object-contain drop-shadow-xl"
                        data-no-filter="true"
                        title="Earned by: 50+ connections, 100+ messages sent, active in Global Chat"
                      />
                      <div className="text-center mt-3">
                        <p className="font-bold text-violet-900 text-base">Social Butterfly</p>
                        <p className="text-sm text-violet-700">Connector</p>
                      </div>
                    </div>
                  </div>
                  
                  <BadgesBar
                    badges={badges}
                    defaultIfEmpty={false}
                    showEmptySlots={true}
                    emptySlotCount={Math.max(0, 5 - badges.length)}
                    onMore={() => setBadgeGlossaryOpen(true)} />

                  {/* Sigils Section */}
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
                    <p className="text-fuchsia-500 dark:text-fuchsia-400 text-xs font-medium mb-3">✨ Sacred Sigils</p>
                    <div className="grid grid-cols-3 gap-3">
                      {/* Sigil 1 - Eye of Horus */}
                      <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-700">
                        <div className="w-12 h-12 mb-2">
                          <img 
                            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/eye_of_horus_sigil.png"
                            alt="Eye of Horus"
                            className="w-full h-full object-contain"
                            data-no-filter="true"
                          />
                        </div>
                        <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 text-center">Protection</p>
                      </div>

                      {/* Sigil 2 - Ankh */}
                      <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-700">
                        <div className="w-12 h-12 mb-2">
                          <img 
                            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/ankh_sigil.png"
                            alt="Ankh"
                            className="w-full h-full object-contain"
                            data-no-filter="true"
                          />
                        </div>
                        <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 text-center">Eternal Life</p>
                      </div>

                      {/* Sigil 3 - Flower of Life */}
                      <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-700">
                        <div className="w-12 h-12 mb-2">
                          <img 
                            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/flower_of_life_sigil.png"
                            alt="Flower of Life"
                            className="w-full h-full object-contain"
                            data-no-filter="true"
                          />
                        </div>
                        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 text-center">Unity</p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Mystical Profile */}
                <div>
                  <p className="text-fuchsia-500 mb-3 text-xs">✨ Mystical Identity</p>
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Mystical ID Badge Image */}
                    <div className="shrink-0">
                      <MysticalIDImage profile={profile} size="medium" />
                    </div>
                    
                    {/* Mystical fields grid - 4 columns to align properly */}
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                      {profile?.mystical_identifier &&
                      <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                            <Sparkles className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-cyan-400 text-xs">Mystical ID</p>
                            <p className="text-sm font-semibold text-slate-900">{profile.mystical_identifier}</p>
                          </div>
                        </div>
                      }
                      {profile?.astrological_sign &&
                      <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">✨</div>
                          <div>
                            <p className="text-cyan-400 text-xs">Sun Sign</p>
                            <p className="text-sm font-semibold text-slate-900">{profile.astrological_sign}</p>
                          </div>
                        </div>
                      }
                      {profile?.rising_sign &&
                      <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center shrink-0">🌅</div>
                          <div>
                            <p className="text-cyan-400 text-xs">Rising</p>
                            <p className="text-sm font-semibold text-slate-900">{profile.rising_sign}</p>
                          </div>
                        </div>
                      }
                      {profile?.moon_sign &&
                      <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">🌙</div>
                          <div>
                            <p className="text-teal-400 text-xs">Moon</p>
                            <p className="text-sm font-semibold text-slate-900">{profile.moon_sign}</p>
                          </div>
                        </div>
                      }
                      {profile?.numerology_life_path &&
                      <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold text-amber-600">{profile.numerology_life_path}</span>
                          </div>
                          <div>
                            <p className="text-teal-400 text-xs">Life Path</p>
                            <p className="text-sm font-semibold text-slate-900">Path {profile.numerology_life_path}</p>
                          </div>
                        </div>
                      }
                      {profile?.numerology_personality &&
                      <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold text-orange-600">{profile.numerology_personality}</span>
                          </div>
                          <div>
                            <p className="text-cyan-400 text-xs">Personality</p>
                            <p className="text-sm font-semibold text-slate-900">#{profile.numerology_personality}</p>
                          </div>
                        </div>
                      }
                      {profile?.birth_card &&
                      <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">🃏</div>
                          <div>
                            <p className="text-cyan-400 text-xs">Birth Card</p>
                            <p className="text-sm font-semibold text-slate-900">
                              <DestinyCardTooltip card={profile.birth_card} />
                            </p>
                          </div>
                        </div>
                      }
                      {profile?.sun_card &&
                      <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center shrink-0">☀️</div>
                          <div>
                            <p className="text-cyan-400 text-xs">Sun Card</p>
                            <p className="text-sm font-semibold text-slate-900">
                              <DestinyCardTooltip card={profile.sun_card} />
                            </p>
                          </div>
                        </div>
                      }
                      {profile?.human_design_type &&
                      <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">⚡</div>
                          <div>
                            <p className="text-cyan-400 text-xs">Human Design</p>
                            <p className="text-sm font-semibold text-slate-900 capitalize">{profile.human_design_type.replace(/_/g, ' ')}</p>
                          </div>
                        </div>
                      }
                      {profile?.enneagram_type &&
                      <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold text-rose-600">{profile.enneagram_type}</span>
                          </div>
                          <div>
                            <p className="text-cyan-400 text-xs">Enneagram</p>
                            <p className="text-sm font-semibold text-slate-900">Type {profile.enneagram_type}</p>
                          </div>
                        </div>
                      }
                      {profile?.mbti_type &&
                      <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-violet-600">MB</span>
                          </div>
                          <div>
                            <p className="text-cyan-400 text-xs">MBTI</p>
                            <p className="text-sm font-semibold text-slate-900">{profile.mbti_type}</p>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MBTI Assessment Prompt */}
          {profile && !profile.mbti_type && (
            <div className="mb-6">
              <MBTIPromptBanner profile={profile} />
            </div>
          )}

          {/* Platform Stats Mini Dashboard */}
          <div className="mb-4 p-4 rounded-2xl bg-transparent border-0 shadow-none">
            <div className="text-teal-600 text-3xl font-semibold uppercase tracking-wide">Dashboard</div>
          </div>

          {/* Hero Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 mb-6">
            {/* Gold Price Ticker - GGG = 1 gram gold */}
            <GoldPriceTicker />
            <GGGBalanceCard walletAvailable={walletAvailable} />

            <div className="relative overflow-hidden rounded-2xl border border-violet-200 backdrop-blur-sm p-4 hover:scale-[1.02] transition-all">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/def3a92a7_image_2025-12-27_111942719.png)' }}>
                <div className="absolute inset-0 bg-gradient-to-br from-violet-900/60 via-violet-800/40 to-transparent" />
              </div>
              <div className="relative flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-white/90" />
                    <p className="text-xs font-medium uppercase tracking-wider text-white/80">Rank</p>
                  </div>
                  <p className="text-xl font-bold tracking-tight text-white capitalize inline-flex items-center gap-1">
                    {rpInfo.title}
                    <HelpHint
                      content={
                      <div>
                          <div className="font-semibold mb-1">Rank progression</div>
                          <div>Current: {rpInfo.title} ({rpPoints} RP)</div>
                          {rpInfo.nextMin ?
                        <div>Next: {rpInfo.nextTitle} at {rpInfo.nextMin} RP • {Math.max(0, rpInfo.nextMin - rpPoints)} RP to go</div> :

                        <div>You're at the highest rank.</div>
                        }
                        </div>
                      } />

                  </p>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-blue-300/50 backdrop-blur-sm p-4 hover:scale-[1.02] transition-all shadow-lg">
              <div className="absolute inset-0 bg-cover bg-center opacity-[0.875]" style={{ backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/834e5195f_image_2025-12-27_132011008.png)' }} />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 via-blue-800/50 to-blue-900/60" />
              <div className="relative flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-blue-300" />
                    <p className="text-xs font-medium uppercase tracking-wider text-blue-200">Reach</p>
                  </div>
                  <p className="text-2xl font-bold tracking-tight text-white drop-shadow-lg">{profile?.reach_score || 0}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-emerald-300" />
                    <span className="text-xs font-medium text-emerald-200">+8%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-emerald-300/50 backdrop-blur-sm p-4 hover:scale-[1.02] transition-all shadow-lg">
              <div className="absolute inset-0 bg-cover bg-center opacity-[0.875]" style={{ backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/2d901fa27_Leonardo_Lightning_XL_Global_Digital_Commodity_Exchange_0.jpg)' }} />
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 via-violet-900/50 to-purple-800/60" />
              <div className="relative flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-emerald-300" />
                    <p className="text-xs font-medium uppercase tracking-wider text-emerald-200">Earned</p>
                  </div>
                  <p className="text-2xl font-bold tracking-tight text-white drop-shadow-lg">${profile?.total_earnings?.toLocaleString() || 0}</p>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-cyan-300/50 backdrop-blur-sm p-4 hover:scale-[1.02] transition-all shadow-lg">
              <div className="absolute inset-0 bg-cover bg-center opacity-[0.875]" style={{ backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/8cc962c0c_ChatGPTImageDec27202501_25_18PM.png)' }} />
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/60 via-blue-900/50 to-cyan-800/60" />
              <div className="relative flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-cyan-300" />
                    <p className="text-xs font-medium uppercase tracking-wider text-cyan-200">Meetings</p>
                  </div>
                  <p className="text-2xl font-bold tracking-tight text-white drop-shadow-lg">{completedMeetingsThisWeek}</p>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-purple-300/50 backdrop-blur-sm p-4 hover:scale-[1.02] transition-all shadow-lg">
              <div className="absolute inset-0 bg-cover bg-center opacity-[0.875]" style={{ backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/a2f4b87c3_ChatGPTImageDec27202501_27_46PM.png)' }} />
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 via-violet-900/50 to-purple-800/60" />
              <div className="relative flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-purple-300" />
                    <p className="text-xs font-medium uppercase tracking-wider text-purple-200">Missions</p>
                  </div>
                  <p className="text-2xl font-bold tracking-tight text-white drop-shadow-lg">{missions.filter((m) => m.participant_ids?.includes(profile?.user_id)).length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Cards Header */}
        <div className="mb-4 p-4 rounded-2xl bg-transparent border-0 shadow-none">
          <div className="text-teal-600 text-3xl font-semibold uppercase tracking-wide">ACTIVITY CARDS</div>
        </div>

        {/* Mode Cards Grid */}
        <div className="px-0 md:px-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1 md:gap-4">
            <ModeCard mode="earn" title="Earn" icon={DollarSign} stats={`$${profile?.total_earnings || 0}`} onClick={() => window.location.href = createPageUrl('Marketplace')} />
            <ModeCard mode="learn" title="Learn" icon={TrendingUp} stats={`${meetings.filter((m) => m.meeting_type === 'mentorship').length} sessions`} onClick={() => window.location.href = createPageUrl('Marketplace')} />
            <ModeCard mode="build" title="Build" icon={Target} stats={`${missions.filter((m) => m.participant_ids?.includes(profile?.user_id)).length} active`} onClick={() => window.location.href = createPageUrl('Missions')} />
            <ModeCard mode="teach" title="Teach" icon={Users} stats={`${listings.filter((l) => l.listing_type === 'offer').length} offers`} onClick={() => window.location.href = createPageUrl('Studio')} />
            <ModeCard mode="lead" title="Lead" icon={Sparkles} stats={profile?.leader_tier !== 'none' ? 'Active' : 'Apply'} onClick={() => window.location.href = createPageUrl('LeaderChannel')} />
            <ModeCard mode="connect" title="Connect" icon={Users} stats={`${profile?.follower_count || 0} followers`} onClick={() => window.location.href = createPageUrl('Circles')} />
          </div>
        </div>

        {/* Control Area */}
        <div className="px-0 md:px-6 mb-6">
          <div className="relative p-2 md:p-4 rounded-2xl">
            <div className="absolute inset-0 rounded-2xl bg-[rgba(255,255,255,0.4)] dark:bg-[rgba(255,255,255,0.22)] backdrop-blur-sm pointer-events-none" />
            <div className="relative z-10">
              <div className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">Controls Deck</div>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => {try {localStorage.setItem('cmdColCOrder', JSON.stringify(colCOrder));} catch {}alert('Layout saved!');}} className="group relative z-20 flex items-center gap-3 p-3 rounded-xl bg-white/80 dark:bg-white/15 border border-slate-200 dark:border-slate-700 hover:bg-white hover:dark:bg-white/25 hover:border-violet-300 shadow-sm hover:shadow-md transition-transform duration-200 ease-out hover:-translate-y-0.5">
                  <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/c38b3c63f_save_light_iconcopy.png" alt="Save" className="w-12 h-12 object-contain drop-shadow" />
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Save</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Save current layout</div>
                  </div>
                </button>
                <button type="button" onClick={() => {setColCOrder(['market', 'influence', 'leader', 'dailyops']);setCardsForceOpen(null);setHiddenCards(new Set());setStoredCards([]);try {localStorage.removeItem('cmdColCOrder');localStorage.removeItem('cmdHiddenCards');localStorage.removeItem('cmdStoredCards');} catch {}}} className="group relative z-20 flex items-center gap-3 p-3 rounded-xl bg-white/80 dark:bg-white/15 border border-slate-200 dark:border-slate-700 hover:bg-white hover:dark:bg-white/25 hover:border-violet-300 shadow-sm hover:shadow-md transition-transform duration-200 ease-out hover:-translate-y-0.5">
                  <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/356f3698e_reset-Picsart-BackgroundRemover.png" alt="Reset" className="w-12 h-12 object-contain drop-shadow" />
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Reset</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Restore defaults</div>
                  </div>
                </button>
                <button type="button" onClick={() => setCardsForceOpen(false)} className="group relative z-20 flex items-center gap-3 p-3 rounded-xl bg-white/80 dark:bg-white/15 border border-slate-200 dark:border-slate-700 hover:bg-white hover:dark:bg-white/25 hover:border-violet-300 shadow-sm hover:shadow-md transition-transform duration-200 ease-out hover:-translate-y-0.5">
                  <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/5c98c6a72_downcopy.png" alt="Collapse" className="w-12 h-12 object-contain drop-shadow" />
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Collapse</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Condense view</div>
                  </div>
                </button>
                <button type="button" onClick={() => setCardsForceOpen(true)} className="group relative z-20 flex items-center gap-3 p-3 rounded-xl bg-white/80 dark:bg-white/15 border border-slate-200 dark:border-slate-700 hover:bg-white hover:dark:bg-white/25 hover:border-violet-300 shadow-sm hover:shadow-md transition-transform duration-200 ease-out hover:-translate-y-0.5">
                  <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/5c57e4485_upcopy.png" alt="Expand" className="w-12 h-12 object-contain drop-shadow" />
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Expand</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Fuller view</div>
                  </div>
                </button>
                <button type="button" onClick={storeAllCards} className="group relative z-20 flex items-center gap-3 p-3 rounded-xl bg-violet-50 dark:bg-violet-900/30 border border-violet-300 dark:border-violet-700 hover:bg-violet-100 hover:dark:bg-violet-800/40 hover:border-violet-400 shadow-sm hover:shadow-md transition-transform duration-200 ease-out hover:-translate-y-0.5">
                  <div className="w-12 h-12 rounded-lg bg-violet-100 dark:bg-violet-800 flex items-center justify-center">
                    <EyeOff className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-violet-800 dark:text-violet-200">Stow All</div>
                    <div className="text-xs text-violet-600 dark:text-violet-400">Send all to panel</div>
                  </div>
                </button>
                <button type="button" onClick={restoreAllCards} className="group relative z-20 flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 hover:dark:bg-emerald-800/40 hover:border-emerald-400 shadow-sm hover:shadow-md transition-transform duration-200 ease-out hover:-translate-y-0.5">
                  <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center">
                    <EyeOff className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">Unstow All</div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400">Restore all cards</div>
                  </div>
                </button>
              </div>
              
              {/* AI Dashboard Customizer */}
              <div className="mt-4">
                <AIDashboardCustomizer 
                  profile={profile}
                  currentCards={[...visibleCards]}
                  onApplySuggestions={(suggestions) => {
                    const highPriority = new Set(suggestions.high_priority || []);
                    const lowPriority = new Set(suggestions.low_priority || []);
                    setHiddenCards(lowPriority);
                    setCustomCards([...highPriority, ...(suggestions.medium_priority || [])]);
                    setDeckViewMode('custom');
                  }}
                />
              </div>
              
              {/* Theme Toggle Buttons */}
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Theme</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onThemeToggle?.('light')}
                    className={cn(
                      "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
                      theme === 'light' 
                        ? "bg-violet-600 text-white shadow-md" 
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-violet-300"
                    )}
                  >
                    <div className={cn("w-3 h-3 rounded-full border-2", theme === 'light' ? "bg-white border-white" : "bg-amber-100 border-amber-300")} />
                    Light
                  </button>
                  <button
                    onClick={() => onThemeToggle?.('dark')}
                    className={cn(
                      "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
                      theme === 'dark' 
                        ? "bg-violet-600 text-white shadow-md" 
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-violet-300"
                    )}
                  >
                    <div className={cn("w-3 h-3 rounded-full border-2", theme === 'dark' ? "bg-teal-400 border-teal-400" : "bg-slate-700 border-slate-600")} />
                    Dark
                  </button>
                  <button
                    onClick={() => onThemeToggle?.('hacker')}
                    className={cn(
                      "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
                      theme === 'hacker' 
                        ? "bg-green-600 text-white shadow-md shadow-green-500/30" 
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-green-400"
                    )}
                  >
                    <div className={cn("w-3 h-3 rounded-full border-2", theme === 'hacker' ? "bg-green-400 border-green-400" : "bg-green-500 border-green-600")} />
                    Hacker
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid - Collapsible Cards */}
        <div className="px-0 md:px-6 relative min-h-[1200px] w-full max-w-full overflow-x-hidden">
          <div className="block space-y-6">
            {isCardVisible('news') && <CollapsibleCard title="News & Updates" cardId="news" icon={Newspaper} badge="New" badgeColor="violet" backgroundImage="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/news_hero.jpg" defaultOpen={true} forceOpen={cardsForceOpen} isHidden={hiddenCards.has('news')} onToggleHide={() => toggleCardVisibility('news')} onTossToSidePanel={handleTossToSidePanel} onPopout={() => window.location.href = createPageUrl('News')}>
              <NewsCard />
            </CollapsibleCard>}

            {isCardVisible('heroGallery') && <CollapsibleCard title="Hero Gallery" cardId="heroGallery" icon={Image} badge="Live" badgeColor="emerald" defaultOpen={true} forceOpen={cardsForceOpen} isHidden={hiddenCards.has('heroGallery')} onToggleHide={() => toggleCardVisibility('heroGallery')} onTossToSidePanel={handleTossToSidePanel} onPopout={() => {}}>
              <HeroImageSlideshow className="w-full" />
            </CollapsibleCard>}

            {isCardVisible('quickActions') && <CollapsibleCard title="Quick Actions" cardId="quickActions" icon={Zap} badge={pendingMeetings.length > 0 ? `${pendingMeetings.length} pending` : undefined} badgeColor="amber" backgroundImage="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80" onPopout={() => setQuickActionsPopupOpen(true)} forceOpen={cardsForceOpen} isHidden={hiddenCards.has('quickActions')} onToggleHide={() => toggleCardVisibility('quickActions')} onTossToSidePanel={handleTossToSidePanel}>
              <div className="relative z-10 text-zinc-950">
                <div className="flex flex-wrap items-center gap-3">
                  <Button className="bg-violet-600 hover:bg-violet-700 rounded-xl gap-2" onClick={() => setQuickCreateOpen(true)}>
                    <Plus className="w-4 h-4" />
                    Quick Create
                  </Button>
                  <Button variant="outline" className="rounded-xl gap-2" onClick={() => setTuneEngineOpen(true)}>
                    <Sparkles className="w-4 h-4" />
                    Tune Engine
                  </Button>
                  <Button variant="outline" className="rounded-xl gap-2" onClick={() => setOnlineUsersOpen(true)}>
                    <Users className="w-4 h-4" />
                    Online Users
                  </Button>
                </div>
              </div>
            </CollapsibleCard>}

            {isCardVisible('quickStart') && <CollapsibleCard 
              title={
                <span className="flex items-center gap-2">
                  Quick Start Checklist
                  <span className="relative flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white animate-pulse" title="New users: Complete your quick start!">
                    <AlertCircle className="w-3.5 h-3.5" />
                  </span>
                </span>
              } 
              cardId="quickStart" 
              icon={CheckCircle} 
              defaultOpen={false} 
              backgroundImage="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80" 
              onPopout={() => setQuickStartPopupOpen(true)} 
              forceOpen={cardsForceOpen} 
              isHidden={hiddenCards.has('quickStart')} 
              onToggleHide={() => toggleCardVisibility('quickStart')} 
              onTossToSidePanel={handleTossToSidePanel}
            >
              <QuickStartChecklist />
            </CollapsibleCard>}

            {isCardVisible('challenges') && <CollapsibleCard 
              title="Challenges & Rewards" 
              cardId="challenges" 
              icon={Trophy} 
              badge={challenges.filter((c) => c.current_count >= c.target_count && c.status === 'active').length || undefined} 
              badgeColor="emerald" 
              defaultOpen={true} 
              backgroundImage="https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?w=800&q=80" 
              onPopout={() => setChallengesPopupOpen(true)} 
              forceOpen={cardsForceOpen} 
              isHidden={hiddenCards.has('challenges')} 
              onToggleHide={() => toggleCardVisibility('challenges')} 
              onTossToSidePanel={handleTossToSidePanel}
            >
              <GamificationWidget profile={profile} />
            </CollapsibleCard>}

            {isCardVisible('inbox') && <CollapsibleCard title="Inbox & Signals" cardId="inbox" icon={Radio} badge={notifications.length} badgeColor="rose" backgroundImage="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80" onPopout={() => setInboxPopupOpen(true)} forceOpen={cardsForceOpen} isHidden={hiddenCards.has('inbox')} onToggleHide={() => toggleCardVisibility('inbox')} onTossToSidePanel={handleTossToSidePanel}>
              <InboxSignals notifications={notifications} />
            </CollapsibleCard>}

            {isCardVisible('collaborators') && <CollapsibleCard title="Potential Collaborators" cardId="collaborators" icon={Users} badge="AI" badgeColor="emerald" backgroundImage="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80" defaultOpen={true} onPopout={() => setCollaboratorsPopupOpen(true)} forceOpen={cardsForceOpen} isHidden={hiddenCards.has('collaborators')} onToggleHide={() => toggleCardVisibility('collaborators')} onTossToSidePanel={handleTossToSidePanel}>
              <CollaborationSuggestions profile={profile} compact={false} />
            </CollapsibleCard>}

            {isCardVisible('communityFeed') && <CollapsibleCard title="Community Feed" cardId="communityFeed" icon={Sparkles} backgroundImage="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/ae589aa03_universal_upscale_0_56f51cb9-0490-420c-a398-fabdc48611df_0.jpg" defaultOpen={true} forceOpen={cardsForceOpen} isHidden={hiddenCards.has('communityFeed')} onToggleHide={() => toggleCardVisibility('communityFeed')} onTossToSidePanel={handleTossToSidePanel} onPopout={() => {}}>
              <CommunityFeedCard maxHeight="400px" />
            </CollapsibleCard>}

            {isCardVisible('circles') && <CollapsibleCard title="Circles & Regions" cardId="circles" icon={Users} defaultOpen={false} backgroundImage="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80" onPopout={() => setCirclesPopupOpen(true)} forceOpen={cardsForceOpen} isHidden={hiddenCards.has('circles')} onToggleHide={() => toggleCardVisibility('circles')} onTossToSidePanel={handleTossToSidePanel}>
              <CirclesRegions />
            </CollapsibleCard>}

            {isCardVisible('leaderboard') && <CollapsibleCard title="Leaderboard" cardId="leaderboard" icon={Trophy} backgroundImage="https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80" defaultOpen={true} forceOpen={cardsForceOpen} isHidden={hiddenCards.has('leaderboard')} onToggleHide={() => toggleCardVisibility('leaderboard')} onTossToSidePanel={handleTossToSidePanel} onPopout={() => {}}>
              <LeaderboardMiniCard />
            </CollapsibleCard>}

            {isCardVisible('affirmations') && <CollapsibleCard title="St. Germain Affirmations" cardId="affirmations" icon={Sparkles} backgroundImage="https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80" defaultOpen={true} forceOpen={cardsForceOpen} isHidden={hiddenCards.has('affirmations')} onToggleHide={() => toggleCardVisibility('affirmations')} onTossToSidePanel={handleTossToSidePanel} onPopout={() => {}}>
              <StGermainAffirmations />
            </CollapsibleCard>}

            {isCardVisible('testimonials') && <CollapsibleCard title="Community Voices" cardId="testimonials" icon={MessageCircle} badge="Live" badgeColor="emerald" backgroundImage="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80" defaultOpen={true} forceOpen={cardsForceOpen} isHidden={hiddenCards.has('testimonials')} onToggleHide={() => toggleCardVisibility('testimonials')} onTossToSidePanel={handleTossToSidePanel} onPopout={() => window.location.href = createPageUrl('Profiles')}>
              <TestimonialsCompact limit={5} />
            </CollapsibleCard>}

            {isCardVisible('videos') && <CollapsibleCard title="SaintTube Videos" cardId="videos" icon={Play} badge="20 min max" badgeColor="red" backgroundImage="https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&q=80" defaultOpen={true} forceOpen={cardsForceOpen} isHidden={hiddenCards.has('videos')} onToggleHide={() => toggleCardVisibility('videos')} onTossToSidePanel={handleTossToSidePanel} onPopout={() => window.location.href = createPageUrl('Videos')}>
              <VideosDashboardCard profile={profile} currentUser={currentUser} />
            </CollapsibleCard>}

            {isCardVisible('spiritTube') && <CollapsibleCard title="SpiritTube" cardId="spiritTube" icon={Play} badge="Spiritual" badgeColor="violet" backgroundImage="https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&q=80" defaultOpen={true} forceOpen={cardsForceOpen} isHidden={hiddenCards.has('spiritTube')} onToggleHide={() => toggleCardVisibility('spiritTube')} onTossToSidePanel={handleTossToSidePanel} onPopout={() => window.location.href = createPageUrl('SpiritTube')}>
              <SpiritTubeCard />
            </CollapsibleCard>}

            {isCardVisible('leaderPathway') && <CollapsibleCard title="Leader Pathway" cardId="leaderPathway" icon={Sparkles} defaultOpen={true} onPopout={() => setLeaderPopupOpen(true)} forceOpen={cardsForceOpen} className="leader-pathway-card" isHidden={hiddenCards.has('leaderPathway')} onToggleHide={() => toggleCardVisibility('leaderPathway')} onTossToSidePanel={handleTossToSidePanel}>
              <LeaderPathway profile={profile} />
            </CollapsibleCard>}
          </div>

          <div className="block space-y-6 mt-6">
            {isCardVisible('aiDiscover') && <CollapsibleCard title={<span className="flex items-center gap-1">AI Discover <SynchronicityHelpHint /></span>} cardId="aiDiscover" icon={Sparkles} badge="New" badgeColor="violet" backgroundImage="https://images.unsplash.com/photo-1516450137517-162bfbeb8dba?w=800&q=80" defaultOpen={true} onPopout={() => setAiDiscoverPopupOpen(true)} forceOpen={cardsForceOpen} isHidden={hiddenCards.has('aiDiscover')} onToggleHide={() => toggleCardVisibility('aiDiscover')} onTossToSidePanel={handleTossToSidePanel}>
              <div className="space-y-4">
                <AIDiscoverMatches profile={profile} />
                <ActivityBasedMatcher profile={profile} compact={true} />
              </div>
            </CollapsibleCard>}

            {isCardVisible('syncEngine') && <CollapsibleCard title={<span className="flex items-center gap-1">Synchronicity Engine <SynchronicityHelpHint /></span>} cardId="syncEngine" icon={Sparkles} badge={matches.length} badgeColor="violet" backgroundImage="https://images.unsplash.com/photo-1516450137517-162bfbeb8dba?w=800&q=80" onPopout={() => setSyncPopupOpen(true)} forceOpen={cardsForceOpen} isHidden={hiddenCards.has('syncEngine')} onToggleHide={() => toggleCardVisibility('syncEngine')} onTossToSidePanel={handleTossToSidePanel}>
              <div className="mb-4">
                <AIMatchGenerator profile={profile} />
              </div>
              <Tabs value={matchTab} onValueChange={setMatchTab} className="w-full">
                <TabsList className="w-full grid grid-cols-5 mb-4">
                  <TabsTrigger value="people" className="text-xs">People</TabsTrigger>
                  <TabsTrigger value="offers" className="text-xs">Offers</TabsTrigger>
                  <TabsTrigger value="missions" className="text-xs">Missions</TabsTrigger>
                  <TabsTrigger value="events" className="text-xs">Events</TabsTrigger>
                  <TabsTrigger value="teachers" className="text-xs">Teachers</TabsTrigger>
                </TabsList>
                <div className="space-y-3">
                  {filteredMatches.length === 0 ?
                  <div className="text-center py-8">
                      <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm text-slate-500">No matches yet</p>
                      <p className="text-xs text-slate-400 mt-1">Complete your profile to find matches</p>
                    </div> :

                  filteredMatches.slice(0, 3).map((match) =>
                  <MatchCard key={match.id} match={match} onAction={handleMatchAction} />
                  )
                  }
                  {filteredMatches.length > 3 &&
                  <Button variant="ghost" className="w-full text-violet-600" onClick={() => window.location.href = createPageUrl('Matches')}>
                      View all {filteredMatches.length} matches
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  }
                </div>
              </Tabs>
            </CollapsibleCard>}

            {isCardVisible('meetings') && <CollapsibleCard title="Meetings & Momentum" cardId="meetings" icon={Calendar} badge={pendingMeetings.length > 0 ? `${pendingMeetings.length} pending` : undefined} badgeColor="amber" backgroundImage="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80" onPopout={() => setMeetingsPopupOpen(true)} forceOpen={cardsForceOpen} isHidden={hiddenCards.has('meetings')} onToggleHide={() => toggleCardVisibility('meetings')} onTossToSidePanel={handleTossToSidePanel}>
              <div className="space-y-3">
                {scheduledMeetings.length === 0 && pendingMeetings.length === 0 ?
                <div className="text-center py-6">
                    <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">No upcoming meetings</p>
                    <Button variant="outline" className="mt-3 rounded-xl" onClick={() => {setQuickCreateType('meeting');setQuickCreateOpen(true);}}>
                      Schedule a meeting
                    </Button>
                  </div> :

                [...pendingMeetings, ...scheduledMeetings].slice(0, 3).map((meeting) =>
                <MeetingCard key={meeting.id} meeting={meeting} onAction={handleMeetingAction} />
                )
                }
              </div>
            </CollapsibleCard>}

            {isCardVisible('missions') && <CollapsibleCard title="Missions" cardId="missions" icon={Target} badge={missions.length} badgeColor="amber" backgroundImage="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&q=80" onPopout={() => setMissionsPopupOpen(true)} forceOpen={cardsForceOpen} isHidden={hiddenCards.has('missions')} onToggleHide={() => toggleCardVisibility('missions')} onTossToSidePanel={handleTossToSidePanel}>
              <div className="space-y-3">
                {missions.length === 0 ?
                <div className="text-center py-6">
                    <Target className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">No active missions</p>
                    <Button variant="outline" className="mt-3 rounded-xl" onClick={() => window.location.href = createPageUrl('Missions')}>
                      Browse missions
                    </Button>
                  </div> :

                missions.slice(0, 2).map((mission) =>
                <MissionCard key={mission.id} mission={mission} onAction={handleMissionAction} variant="compact" />
                )
                }
              </div>
            </CollapsibleCard>}

            {isCardVisible('projects') && <CollapsibleCard title="Projects" cardId="projects" icon={Folder} defaultOpen={true} backgroundImage="https://images.unsplash.com/photo-1532619187608-e5375cab36aa?w=800&q=80" onPopout={() => setProjectsPopupOpen(true)} forceOpen={cardsForceOpen} isHidden={hiddenCards.has('projects')} onToggleHide={() => toggleCardVisibility('projects')} onTossToSidePanel={handleTossToSidePanel}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div className="p-3 rounded-xl bg-slate-50 border"><div className="text-xs text-slate-500">Total</div><div className="text-xl font-bold">{totalProjects}</div></div>
                <div className="p-3 rounded-xl bg-violet-50 border"><div className="text-xs text-violet-700">Submitted</div><div className="text-xl font-bold text-violet-700">{submittedCount}</div></div>
                <div className="p-3 rounded-xl bg-emerald-50 border"><div className="text-xs text-emerald-700">Approved</div><div className="text-xl font-bold text-emerald-700">{approvedCount}</div></div>
                <div className="p-3 rounded-xl bg-amber-50 border"><div className="text-xs text-amber-700">Pending</div><div className="text-xl font-bold text-amber-700">{pendingCount}</div></div>
              </div>
              <div className="mb-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2 relative">
                  <Input placeholder="Search projects..." value={projectSearch} onChange={(e) => setProjectSearch(e.target.value)} className="pl-3" />
                </div>
                <Select value={projectStatus} onValueChange={setProjectStatus}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending_review">Pending Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="flagged">Flagged</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredProjects.length === 0 ?
                <div className="col-span-full text-center py-8 text-slate-500">No projects found</div> :

                filteredProjects.slice(0, 4).map((p) =>
                <ProjectMiniCard key={p.id} project={p} onClick={() => setSelectedProject(p)} />
                )
                }
              </div>
              {filteredProjects.length > 4 &&
              <Button variant="ghost" className="w-full mt-3 text-violet-600" onClick={() => window.location.href = createPageUrl('Projects')}>View more</Button>
              }
            </CollapsibleCard>}
          </div>

          {/* Column C: Draggable */}
          <div className="block mt-6">
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="colC">
                {(provided) =>
                <div className="space-y-6" ref={provided.innerRef} {...provided.droppableProps}>
                    {colCOrder.filter(id => isCardVisible(id)).map((id, index) =>
                  <Draggable draggableId={id} index={index} key={id}>
                        {(dragProvided) =>
                    <div ref={dragProvided.innerRef} {...dragProvided.draggableProps} {...dragProvided.dragHandleProps}>
                            {id === 'market' &&
                      <CollapsibleCard title="Marketplace: Earn & Learn" cardId="market" icon={ShoppingBag} backgroundImage="https://images.unsplash.com/photo-1639322537228-f710d846310a?w=800&q=80" onPopout={() => setMarketPopupOpen(true)} forceOpen={cardsForceOpen} isHidden={hiddenCards.has('market')} onToggleHide={() => toggleCardVisibility('market')} onTossToSidePanel={handleTossToSidePanel}>
                                <Tabs defaultValue="offers" className="w-full">
                                  <TabsList className="w-full grid grid-cols-3 mb-4">
                                    <TabsTrigger value="offers" className="text-xs">My Offers</TabsTrigger>
                                    <TabsTrigger value="requests" className="text-xs">Requests</TabsTrigger>
                                    <TabsTrigger value="browse" className="text-xs">Browse</TabsTrigger>
                                  </TabsList>
                                  <TabsContent value="offers" className="space-y-3">
                                    {listings.filter((l) => l.listing_type === 'offer').length === 0 ?
                            <div className="text-center py-6">
                                        <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                        <p className="text-sm text-slate-500">No offers yet</p>
                                        <Button className="mt-3 rounded-xl bg-violet-600 hover:bg-violet-700" onClick={() => {setQuickCreateType('offer');setQuickCreateOpen(true);}}>Create your first offer</Button>
                                      </div> :

                            listings.filter((l) => l.listing_type === 'offer').slice(0, 2).map((listing) =>
                            <ListingCard key={listing.id} listing={listing} isOwner={true} onAction={handleListingAction} />
                            )
                            }
                                  </TabsContent>
                                  <TabsContent value="requests" className="space-y-3">
                                    <div className="text-center py-6"><p className="text-sm text-slate-500">No pending requests</p></div>
                                  </TabsContent>
                                  <TabsContent value="browse" className="space-y-3">
                                    {listings.slice(0, 2).map((listing) =>
                            <ListingCard key={listing.id} listing={listing} onAction={handleListingAction} />
                            )}
                                  </TabsContent>
                                </Tabs>
                              </CollapsibleCard>
                      }
                            {id === 'influence' &&
                      <CollapsibleCard title="Influence & Reach" cardId="influence" icon={TrendingUp} backgroundImage="https://images.unsplash.com/photo-1620421680010-0766ff230392?w=800&q=80" onPopout={() => setInfluencePopupOpen(true)} forceOpen={cardsForceOpen} isHidden={hiddenCards.has('influence')} onToggleHide={() => toggleCardVisibility('influence')} onTossToSidePanel={handleTossToSidePanel}>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-3 gap-3">
                                    <div className="text-center p-3 rounded-xl bg-slate-50">
                                      <p className="text-2xl font-bold text-slate-900">{profile?.follower_count || 0}</p>
                                      <p className="text-xs text-slate-500">Followers</p>
                                    </div>
                                    <div className="text-center p-3 rounded-xl bg-slate-50">
                                      <p className="text-2xl font-bold text-slate-900">{profile?.following_count || 0}</p>
                                      <p className="text-xs text-slate-500">Following</p>
                                    </div>
                                    <div className="text-center p-3 rounded-xl bg-violet-50">
                                      <p className="text-2xl font-bold text-violet-700">{profile?.reach_score || 0}</p>
                                      <p className="text-xs text-violet-600">Reach</p>
                                    </div>
                                  </div>
                                  <div className="p-4 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100">
                                    <div className="flex items-center gap-3 mb-3">
                                      <Flame className="w-5 h-5 text-amber-500" />
                                      <span className="text-emerald-700 dark:text-emerald-400 font-medium">Boost Your Reach</span>
                                    </div>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">Spend GGG to amplify your profile and attract more matches.</p>
                                    <QuickBoostButton className="w-full" />
                                  </div>
                                </div>
                              </CollapsibleCard>
                      }
                            {id === 'leader' &&
                      <CollapsibleCard title="144K Leader Channel" cardId="leader" icon={Radio} defaultOpen={false} backgroundImage="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80" onPopout={() => setLeaderChannelPopupOpen(true)} forceOpen={cardsForceOpen} isHidden={hiddenCards.has('leader')} onToggleHide={() => toggleCardVisibility('leader')} onTossToSidePanel={handleTossToSidePanel}>
                                <div className="text-center py-6">
                                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mx-auto mb-4">
                                    <Radio className="w-8 h-8 text-amber-600" />
                                  </div>
                                  <h4 className="font-semibold text-slate-900 mb-2">Become a Verified Leader</h4>
                                  <p className="text-sm text-slate-500 mb-4">Join the 144,000 Super-Conscious Leaders with special broadcast privileges.</p>
                                  <Button variant="outline" className="rounded-xl" onClick={() => {window.location.href = createPageUrl('LeaderChannel');}}>
                                    {profile?.leader_tier && profile.leader_tier !== 'none' ? 'Open Leader Dashboard' : 'Apply for Verification'}
                                  </Button>
                                </div>
                              </CollapsibleCard>
                      }
                            {id === 'dailyops' &&
                      <CollapsibleCard title="Daily Ops" cardId="dailyops" icon={Calendar} defaultOpen={true} backgroundImage="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80" onPopout={() => setDailyOpsPopupOpen(true)} forceOpen={cardsForceOpen} isHidden={hiddenCards.has('dailyops')} onToggleHide={() => toggleCardVisibility('dailyops')} onTossToSidePanel={handleTossToSidePanel}>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="text-xs text-slate-500">Today's GGG</div>
                                    <div className="text-2xl font-bold text-slate-900">{dailyGGG.toFixed(2)} GGG</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-xs text-slate-500">Done • In Progress</div>
                                    <div className="text-2xl font-bold text-slate-900">{dailyCompleted} • {dailyInProgress}</div>
                                  </div>
                                </div>
                                <div className="mt-3 text-right">
                                  <Button className="rounded-xl bg-violet-600 hover:bg-violet-700" onClick={() => {window.location.href = createPageUrl('DailyOps');}}>Open DO</Button>
                                </div>
                              </CollapsibleCard>
                      }
                          </div>
                    }
                      </Draggable>
                  )}
                    {provided.placeholder}
                  </div>
                }
              </Droppable>
            </DragDropContext>
          </div>
        </div>

        {/* Side Panel */}
        <SidePanel
          matches={matches.slice(0, 5)}
          meetings={scheduledMeetings}
          profile={profile}
          isOpen={sidePanelOpen}
          onToggle={() => setSidePanelOpen(!sidePanelOpen)}
          onMatchAction={handleMatchAction}
          onMeetingAction={handleMeetingAction}
          storedCards={storedCards}
          onRestoreCard={handleRestoreCard}
          onRemoveStoredCard={handleRemoveStoredCard} />


        {/* Popout Panels */}
        {inboxPopupOpen && <FloatingPanel title="Inbox & Signals" cardId="inbox" onTossToSidePanel={handleTossToSidePanel} onClose={() => setInboxPopupOpen(false)}><InboxSignals notifications={notifications} /></FloatingPanel>}
        {circlesPopupOpen && <FloatingPanel title="Circles & Regions" cardId="circles" onTossToSidePanel={handleTossToSidePanel} onClose={() => setCirclesPopupOpen(false)}><CirclesRegions /></FloatingPanel>}
        {syncPopupOpen && <FloatingPanel title="Synchronicity Engine" cardId="syncEngine" onTossToSidePanel={handleTossToSidePanel} onClose={() => setSyncPopupOpen(false)}><SynchronicityEngine profile={profile} matchTab={matchTab} setMatchTab={setMatchTab} filteredMatches={filteredMatches} matches={matches} onMatchAction={handleMatchAction} /></FloatingPanel>}
        {meetingsPopupOpen && <FloatingPanel title="Meetings & Momentum" cardId="meetings" onTossToSidePanel={handleTossToSidePanel} onClose={() => setMeetingsPopupOpen(false)}><MeetingsMomentum pendingMeetings={pendingMeetings} scheduledMeetings={scheduledMeetings} onAction={handleMeetingAction} /></FloatingPanel>}
        {missionsPopupOpen && <FloatingPanel title="Missions" cardId="missions" onTossToSidePanel={handleTossToSidePanel} onClose={() => setMissionsPopupOpen(false)}><MissionsQuests missions={missions} profile={profile} onAction={handleMissionAction} /></FloatingPanel>}
        {selectedProject && <FloatingPanel title={selectedProject.title || 'Project Details'} cardId="projects" onTossToSidePanel={handleTossToSidePanel} onClose={() => setSelectedProject(null)}><ProjectDetailCard project={selectedProject} /></FloatingPanel>}
        {marketPopupOpen && <FloatingPanel title="Marketplace: Earn & Learn" cardId="market" onTossToSidePanel={handleTossToSidePanel} onClose={() => setMarketPopupOpen(false)}><MarketplaceEarnLearn listings={listings} onAction={handleListingAction} /></FloatingPanel>}
        {influencePopupOpen && <FloatingPanel title="Influence & Reach" cardId="influence" onTossToSidePanel={handleTossToSidePanel} onClose={() => setInfluencePopupOpen(false)}><InfluenceReach profile={profile} onBoost={() => setBoostTarget({ type: 'profile', id: profile?.user_id })} /></FloatingPanel>}
        {leaderPopupOpen && <FloatingPanel title="Leader Pathway" cardId="leaderPathway" onTossToSidePanel={handleTossToSidePanel} onClose={() => setLeaderPopupOpen(false)}><LeaderPathway profile={profile} /></FloatingPanel>}
        {projectsPopupOpen && <FloatingPanel title="Projects" cardId="projects" onTossToSidePanel={handleTossToSidePanel} onClose={() => setProjectsPopupOpen(false)}><div className="grid grid-cols-1 md:grid-cols-2 gap-3">{filteredProjects.slice(0, 8).map((p) => <ProjectMiniCard key={p.id} project={p} onClick={() => setSelectedProject(p)} />)}</div><div className="mt-3 text-right"><Button variant="outline" className="rounded-xl" onClick={() => {window.location.href = createPageUrl('Projects');}}>Open Projects</Button></div></FloatingPanel>}
        {dailyOpsPopupOpen && <FloatingPanel title="Daily Ops" cardId="dailyops" onTossToSidePanel={handleTossToSidePanel} onClose={() => setDailyOpsPopupOpen(false)}><div className="flex items-center justify-between"><div><div className="text-xs text-slate-500">Today's GGG</div><div className="text-2xl font-bold text-slate-900">{dailyGGG.toFixed(2)} GGG</div></div><div className="text-right"><div className="text-xs text-slate-500">Done • In Progress</div><div className="text-2xl font-bold text-slate-900">{dailyCompleted} • {dailyInProgress}</div></div></div><div className="mt-3 text-right"><Button className="rounded-xl bg-violet-600 hover:bg-violet-700" onClick={() => {window.location.href = createPageUrl('DailyOps');}}>Open DO</Button></div></FloatingPanel>}
        {quickActionsPopupOpen && <FloatingPanel title="Quick Actions" cardId="quickActions" onTossToSidePanel={handleTossToSidePanel} onClose={() => setQuickActionsPopupOpen(false)}><div className="grid grid-cols-2 gap-3"><Button className="h-20 flex-col gap-2 bg-violet-600 hover:bg-violet-700 rounded-xl" onClick={() => {setQuickCreateType('meeting');setQuickCreateOpen(true);}}><Calendar className="w-5 h-5" /><span className="text-xs">Book Meeting</span></Button><Button variant="outline" className="bg-violet-100 text-stone-950 rounded-xl h-20 flex-col gap-2" onClick={() => {setQuickCreateType('post');setQuickCreateOpen(true);}}><Plus className="w-5 h-5" /><span className="text-xs">Post Update</span></Button><Button variant="outline" className="bg-violet-100 text-stone-950 rounded-xl h-20 flex-col gap-2" onClick={() => {setQuickCreateType('mission');setQuickCreateOpen(true);}}><Target className="w-5 h-5" /><span className="text-xs">Launch Mission</span></Button><Button variant="outline" className="bg-violet-100 text-neutral-950 rounded-xl h-20 flex-col gap-2" onClick={() => {setQuickCreateType('offer');setQuickCreateOpen(true);}}><ShoppingBag className="w-5 h-5" /><span className="text-xs">Create Offer</span></Button></div></FloatingPanel>}
        {quickStartPopupOpen && <FloatingPanel title="Quick Start Checklist" cardId="quickStart" onTossToSidePanel={handleTossToSidePanel} onClose={() => setQuickStartPopupOpen(false)}><QuickStartChecklist /></FloatingPanel>}
        {leaderChannelPopupOpen && <FloatingPanel title="144K Leader Channel" cardId="leader" onTossToSidePanel={handleTossToSidePanel} onClose={() => setLeaderChannelPopupOpen(false)}><div className="text-center py-6"><div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mx-auto mb-4"><Radio className="w-8 h-8 text-amber-600" /></div><h4 className="font-semibold text-slate-900 mb-2">Become a Verified Leader</h4><p className="text-sm text-slate-500 mb-4">Join the 144,000 Super-Conscious Leaders with special broadcast privileges.</p><Button variant="outline" className="rounded-xl" onClick={() => {window.location.href = createPageUrl('LeaderChannel');}}>{profile?.leader_tier && profile.leader_tier !== 'none' ? 'Open Leader Dashboard' : 'Apply for Verification'}</Button></div></FloatingPanel>}
        {challengesPopupOpen && <FloatingPanel title="Challenges & Rewards" cardId="challenges" onTossToSidePanel={handleTossToSidePanel} onClose={() => setChallengesPopupOpen(false)}><GamificationWidget profile={profile} /></FloatingPanel>}
        {collaboratorsPopupOpen && <FloatingPanel title="Potential Collaborators" cardId="collaborators" onTossToSidePanel={handleTossToSidePanel} onClose={() => setCollaboratorsPopupOpen(false)}><CollaborationSuggestions profile={profile} compact={false} /></FloatingPanel>}
        {aiDiscoverPopupOpen && <FloatingPanel title="AI Discover" cardId="aiDiscover" onTossToSidePanel={handleTossToSidePanel} onClose={() => setAiDiscoverPopupOpen(false)}><AIDiscoverMatches profile={profile} /></FloatingPanel>}

        {/* Modals */}
        <BadgesGlossaryModal open={badgeGlossaryOpen} onOpenChange={setBadgeGlossaryOpen} />
        <QuickCreateModal open={quickCreateOpen} initialType={quickCreateType} onClose={() => {setQuickCreateOpen(false);setQuickCreateType(null);}} onCreate={handleCreate} />
        {videoMeeting && <VideoMeetingModal meeting={videoMeeting} open={!!videoMeeting} onClose={() => setVideoMeeting(null)} />}
        {boostTarget && <BoostModal open={!!boostTarget} onClose={() => setBoostTarget(null)} targetType={boostTarget.type} targetId={boostTarget.id} />}
        <BookingRequestModal 
          open={bookingModal.open} 
          onClose={() => setBookingModal({ open: false, targetUser: null, match: null, listing: null })}
          preSelectedUser={bookingModal.targetUser ? {
            user_id: bookingModal.targetUser.email || bookingModal.targetUser.id,
            display_name: bookingModal.targetUser.name,
            avatar_url: bookingModal.targetUser.avatar,
            handle: bookingModal.targetUser.name?.toLowerCase().replace(/\s+/g, '') || 'user'
          } : null}
        />
        <TuneEngineModal open={tuneEngineOpen} onClose={() => setTuneEngineOpen(false)} />
        <OnlineUsersModal open={onlineUsersOpen} onClose={() => setOnlineUsersOpen(false)} />
        <RescheduleDialog 
          open={rescheduleModal.open} 
          onOpenChange={(open) => setRescheduleModal({ open, meeting: open ? rescheduleModal.meeting : null })}
          meeting={rescheduleModal.meeting}
          onReschedule={async (newTime) => {
            if (rescheduleModal.meeting) {
              await updateMeetingMutation.mutateAsync({ 
                id: rescheduleModal.meeting.id, 
                data: { scheduled_time: newTime } 
              });
              setRescheduleModal({ open: false, meeting: null });
            }
          }}
        />
        
        {/* Command Deck Tour */}
        <CommandDeckTour autoStart={showTour} onComplete={handleTourComplete} />
      </div>
    </div>);

}