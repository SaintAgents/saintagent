import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Coins, TrendingUp, Users, Calendar, Target, DollarSign, CheckCircle, Sparkles, Plus, ArrowRight, Zap, ShoppingBag, Radio, Flame, BarChart3, List, Trophy, Eye, EyeOff } from "lucide-react";
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
import LeaderPathway from '@/components/leader/LeaderPathway';
import QuickStartChecklist from '@/components/onboarding/QuickStartChecklist';
import HelpHint from '@/components/hud/HelpHint';
import { getRPRank, RP_LADDER } from '@/components/reputation/rpUtils';
import RankedAvatar from '@/components/reputation/RankedAvatar';
import CollaborationSuggestions from '@/components/notifications/CollaborationSuggestions';
import GamificationWidget from '@/components/gamification/GamificationWidget';
import GoldPriceTicker from '@/components/hud/GoldPriceTicker';

export default function CommandDeck() {
  const [sidePanelOpen, setSidePanelOpen] = useState(() => {
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
  const [projectSearch, setProjectSearch] = useState('');
  const [projectStatus, setProjectStatus] = useState('all');
  const [selectedProject, setSelectedProject] = useState(null);
  const [cardsForceOpen, setCardsForceOpen] = useState(null);

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
      return saved ? JSON.parse(saved) : [];
    } catch {return [];}
  });

  // Persist hidden cards
  useEffect(() => {
    try {
      localStorage.setItem('cmdHiddenCards', JSON.stringify([...hiddenCards]));
    } catch {}
  }, [hiddenCards]);

  // Persist stored cards
  useEffect(() => {
    try {
      localStorage.setItem('cmdStoredCards', JSON.stringify(storedCards));
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
    const allCardIds = ['quickActions', 'quickStart', 'challenges', 'inbox', 'collaborators', 'circles', 'leaderPathway', 'aiDiscover', 'syncEngine', 'meetings', 'missions', 'projects', 'market', 'influence', 'leader', 'dailyops'];
    const newStoredCards = allCardIds
      .filter(id => !storedCards.some(c => c.id === id))
      .map(id => ({ id, title: getCardTitle(id) }));
    setStoredCards(prev => [...prev, ...newStoredCards]);
    setHiddenCards(new Set(allCardIds));
    if (!sidePanelOpen) setSidePanelOpen(true);
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
      dailyops: 'Daily Ops'
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
    dailyops: Calendar
  };

  // Toss card to side panel storage
  const handleTossToSidePanel = (cardId, title) => {
    // Don't add duplicates
    if (storedCards.some(c => c.id === cardId)) return;
    
    // Store cardId and title only (icons retrieved from mapping)
    setStoredCards(prev => [...prev, { id: cardId, title }]);
    // Also hide it from main deck
    setHiddenCards(prev => new Set([...prev, cardId]));
    
    // Open side panel if closed
    if (!sidePanelOpen) {
      setSidePanelOpen(true);
    }
  };

  // Get stored cards with icons resolved
  const storedCardsWithIcons = storedCards.map(card => ({
    ...card,
    icon: CARD_ICONS[card.id]
  }));

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
  const { data: profiles } = useQuery({
    queryKey: ['userProfile', currentUser?.email],
    queryFn: async () => {
      return base44.entities.UserProfile.filter({ user_id: currentUser.email }, '-updated_date', 1);
    },
    enabled: !!currentUser?.email,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });
  const profile = profiles?.[0];

  // Wallet (authoritative GGG balance)
  const { data: walletRes } = useQuery({
    queryKey: ['wallet', profile?.user_id],
    queryFn: async () => {
      try {
        const { data } = await base44.functions.invoke('walletEngine', {
          action: 'getWallet',
          payload: { user_id: profile.user_id }
        });
        return data;
      } catch (e) {
        // Silently fail and use profile balance as fallback
        return { wallet: { available_balance: profile?.ggg_balance || 0 } };
      }
    },
    enabled: !!profile?.user_id,
    refetchInterval: 60000, // Reduced frequency to avoid excessive API calls
    retry: 0, // Don't retry on failure
    staleTime: 30000
  });
  // If wallet returns null/undefined or 0 but profile has a balance, prefer profile
  const walletBalance = walletRes?.wallet?.available_balance;
  const walletAvailable = walletBalance != null && walletBalance > 0 ? walletBalance : profile?.ggg_balance ?? 0;
  const rpPoints = profile?.rp_points || 0;
  const rpInfo = getRPRank(rpPoints);

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
    enabled: !!currentUser?.email
  });
  const onboarding = onboardingRecords?.[0];
  const ONBOARDING_STEPS = 10;
  const setupPercent = onboarding ? Math.round(((onboarding.current_step || 0) + 1) / ONBOARDING_STEPS * 100) : 0;

  // Fetch user badges
  const { data: badges = [] } = useQuery({
    queryKey: ['userBadges', profile?.user_id],
    queryFn: () => base44.entities.Badge.filter({ user_id: profile.user_id, status: 'active' }),
    enabled: !!profile?.user_id
  });

  // Fetch matches
  const { data: matches = [] } = useQuery({
    queryKey: ['matches'],
    queryFn: () => base44.entities.Match.filter({ status: 'active' }, '-match_score', 20)
  });

  // Fetch meetings
  const { data: meetings = [] } = useQuery({
    queryKey: ['meetings'],
    queryFn: () => base44.entities.Meeting.list('-scheduled_time', 10)
  });

  // Fetch missions
  const { data: missions = [] } = useQuery({
    queryKey: ['missions'],
    queryFn: () => base44.entities.Mission.filter({ status: 'active' }, '-created_date', 10)
  });

  // Fetch listings
  const { data: listings = [] } = useQuery({
    queryKey: ['listings'],
    queryFn: () => base44.entities.Listing.filter({ status: 'active' }, '-created_date', 10)
  });

  // Fetch projects
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list('-created_date', 50)
  });

  // Fetch notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => base44.entities.Notification.filter({ is_read: false }, '-created_date', 20)
  });

  // Fetch challenges
  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges', profile?.user_id],
    queryFn: () => base44.entities.Challenge.filter({ user_id: profile.user_id, status: 'active' }, '-created_date', 10),
    enabled: !!profile?.user_id
  });

  // Daily Ops data (today)
  const todayStr = new Date().toISOString().slice(0, 10);
  const { data: dailyLogToday = [] } = useQuery({
    queryKey: ['dailyLog', profile?.user_id, todayStr],
    queryFn: () => base44.entities.DailyLog.filter({ user_id: profile.user_id, date: todayStr }),
    enabled: !!profile?.user_id
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

  const queryClient = useQueryClient();

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
      window.location.href = createPageUrl('Messages');
    } else if (action === 'book') {
      window.location.href = createPageUrl('Meetings');
    }
  };

  const handleMeetingAction = async (action, meeting) => {
    if (action === 'accept') {
      updateMeetingMutation.mutate({ id: meeting.id, data: { status: 'scheduled' } });
    } else if (action === 'decline') {
      updateMeetingMutation.mutate({ id: meeting.id, data: { status: 'declined' } });
    } else if (action === 'confirm') {
      updateMeetingMutation.mutate({ id: meeting.id, data: { status: 'completed', guest_confirmed: true, ggg_earned: 0.03 } });
      await base44.entities.GGGTransaction.create({
        user_id: profile.user_id,
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
        const hasBadge = await base44.entities.Badge.filter({ user_id: profile.user_id, code: 'first_meeting' });
        if (!(hasBadge && hasBadge.length)) {
          await base44.entities.Badge.create({ user_id: profile.user_id, code: 'first_meeting', status: 'active' });
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
      const newParticipants = [...(mission.participant_ids || []), profile.user_id];
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
      window.location.href = createPageUrl('Marketplace');
    }
  };

  const handleCreate = async (type, data) => {
    try {
      if (type === 'post') {
        await base44.entities.Post.create({
          author_id: profile.user_id,
          author_name: profile.display_name,
          author_avatar: profile.avatar_url,
          content: data.content,
          image_urls: data.image_urls || []
        });
      } else if (type === 'offer') {
        await createMutation.mutateAsync({
          entity: 'Listing',
          data: {
            owner_id: profile.user_id,
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
            host_id: profile.user_id,
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
            creator_id: profile.user_id,
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

  return (
    <div className="min-h-screen cmd-deck-bg pb-20">
      <div className={cn(
        "transition-all duration-300 pb-8",
        sidePanelOpen ? "pr-80" : "pr-0"
      )}>
        {/* Page Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="relative flex items-start justify-between mb-6 p-4 rounded-2xl overflow-hidden bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50">
            <div className="absolute inset-0 rounded-2xl pointer-events-none z-0" />
            <div className="relative z-10 flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white dark:drop-shadow-[0_0_10px_rgba(0,255,136,0.5)]">Command Deck</h1>
                <p className="text-teal-500 dark:text-[#00ff88] mt-1">Your mission control center</p>
              </div>
            </div>
            <div className="flex items-center gap-3 relative z-10">
              <Button
                variant="outline" className="bg-purple-200 text-fuchsia-950 px-4 py-2 text-sm font-medium rounded-xl focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 inline-flex items-center justify-center whitespace-nowrap transition-colors border border-input shadow-sm hover:bg-accent hover:text-accent-foreground h-9 gap-2"

                onClick={() => setSidePanelOpen(!sidePanelOpen)}>

                <BarChart3 className="w-4 h-4" />
                {sidePanelOpen ? 'Hide Panel' : 'Show Panel'}
              </Button>
              <Button
                className="bg-violet-600 hover:bg-violet-700 rounded-xl gap-2"
                onClick={() => setQuickCreateOpen(true)}>

                <Plus className="w-4 h-4" />
                Quick Create
              </Button>
            </div>
          </div>

          {/* Profile Identifiers */}
          <div className="relative mb-6 p-6 rounded-2xl overflow-hidden bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50" data-avatar-card>
            <div className="absolute inset-0 rounded-2xl pointer-events-none" data-avatar-bg style={{ display: 'none' }} />
            <div className="absolute inset-0 rounded-2xl pointer-events-none" data-avatar-overlay />
            <div className="relative z-10 flex items-start gap-6">
              {/* Left column: Avatar only */}
              <div className="relative shrink-0" data-user-id={profile?.user_id}>
                <RankedAvatar
                  src={profile?.avatar_url}
                  name={profile?.display_name}
                  size={140}
                  leaderTier={profile?.leader_tier}
                  rpRankCode={profile?.rp_rank_code}
                  rpPoints={rpPoints}
                  userId={profile?.user_id}
                  status={profile?.status || 'offline'} />
              </div>

              <div className="flex-1">
                {/* Header: Name, Title, Trust Score */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {profile?.display_name || currentUser?.full_name || 'User'}
                    </h2>
                    <div className="flex items-center gap-1">
                      <p className="text-purple-500 text-sm capitalize">
                        {rpInfo.title} • @{profile?.handle} {profile?.sa_number ? ` - SA#${profile.sa_number}` : ''}
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
                  <div className="flex flex-col items-center shrink-0 bg-transparent border-none" style={{ marginTop: '-25px', marginRight: '-3px', background: 'transparent' }}>
                    <div className="relative bg-transparent border-none" style={{ width: '170px', height: '170px', transform: 'translateY(-8px)', background: 'transparent', border: 'none', boxShadow: 'none' }}>
                      {/* Gauge dial - 170px base */}
                      <img
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/36e5f08f7_gemini-25-flash-image_a_brass_serving_tray_that_is_actually_a_control_panel_with_interesting_meters_an-3_inPixio.png"
                        alt="Trust Gauge"
                        className="absolute inset-0 w-full h-full object-contain drop-shadow-lg"
                        style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}
                        data-no-filter="true" />
                      {/* Trust score number centered in gauge */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ background: 'transparent' }}>
                        <span className="text-3xl font-bold text-emerald-400 dark:text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.6)]">{profile?.trust_score || 0}</span>
                      </div>
                      {/* Cyan trust ring */}
                      <svg 
                        className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none" 
                        viewBox="0 0 100 100"
                        style={{ background: 'transparent' }}
                      >
                        <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="3" fill="none" className="text-slate-300/50 dark:text-slate-600/50" />
                        <circle cx="50" cy="50" r="35" stroke="url(#trustGradientCmd)" strokeWidth="3" fill="none" strokeDasharray={`${2 * Math.PI * 35}`} strokeDashoffset={`${2 * Math.PI * 35 * (1 - (profile?.trust_score || 0) / 100)}`} className="transition-all duration-700" strokeLinecap="round" />
                        <defs>
                          <linearGradient id="trustGradientCmd" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="50%" stopColor="#14b8a6" />
                            <stop offset="100%" stopColor="#06b6d4" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                    {/* Trust Score label - moved up to nearly touch gauge */}
                    <div className="flex items-center gap-1.5" style={{ marginTop: '-12px' }}>
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

                {/* Stats Bar */}
                <div className="bg-violet-50 dark:bg-slate-800/80 mb-4 p-3 rounded-xl grid grid-cols-4 gap-3" data-stats-bar>
                  <div className="text-center">
                    <p className="text-lg font-bold text-violet-700 dark:text-amber-400">{walletAvailable != null ? walletAvailable.toLocaleString() : profile?.ggg_balance?.toLocaleString?.() || "0"}</p>
                    <p className="text-slate-600 dark:text-slate-300 text-xs inline-flex items-center gap-1 justify-center">GGG <HelpHint content="Your GGG balance" /></p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-900 dark:text-violet-400">{profile?.rp_points || rpPoints || 0}</p>
                    <p className="text-slate-600 dark:text-slate-300 text-xs inline-flex items-center gap-1 justify-center">Rank Points <HelpHint content="Total rank points" /></p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-900 dark:text-blue-400 mt-0.5">{profile?.follower_count || 0}</p>
                    <p className="text-slate-600 dark:text-slate-300 text-xs inline-flex items-center gap-1 justify-center">Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-900 dark:text-emerald-400 mt-0.5">{profile?.meetings_completed || 0}</p>
                    <p className="text-slate-600 dark:text-slate-300 text-xs inline-flex items-center gap-1 justify-center">Meetings</p>
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

                {/* Badges */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-teal-200 text-xs">Badges</p>
                    <button className="text-xs text-violet-600 hover:underline" onClick={() => setBadgeGlossaryOpen(true)}>
                      View Glossary
                    </button>
                  </div>
                  
                  {/* Eternal Flame Feature Badge */}
                  <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
                    <img
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/49ae4822c_Screenshot2026-01-07044514-Picsart-BackgroundRemover.png"
                      alt="Eternal Flame"
                      className="w-12 h-12 object-contain"
                      data-no-filter="true" />
                    <div>
                      <p className="font-semibold text-amber-900">Eternal Flame</p>
                      <p className="text-xs text-amber-700">Living Agent</p>
                    </div>
                  </div>
                  
                  <BadgesBar
                    badges={badges}
                    defaultIfEmpty={false}
                    onMore={() => setBadgeGlossaryOpen(true)} />

                </div>

                {/* Mystical Profile */}
                <div>
                  <p className="text-fuchsia-500 mb-3 text-xs">✨ Mystical Identity</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                          <p className="text-sm font-semibold text-slate-900">{profile.birth_card}</p>
                        </div>
                      </div>
                    }
                    {profile?.sun_card &&
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center shrink-0">☀️</div>
                        <div>
                          <p className="text-cyan-400 text-xs">Sun Card</p>
                          <p className="text-sm font-semibold text-slate-900">{profile.sun_card}</p>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Stats Mini Dashboard */}
          <div className="mb-4 p-4 rounded-2xl bg-transparent border-0 shadow-none">
            <div className="text-teal-600 text-3xl font-semibold uppercase tracking-wide">Dashboard</div>
          </div>

          {/* Hero Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 mb-6">
            {/* Gold Price Ticker - GGG = 1 gram gold */}
            <GoldPriceTicker />
            <div className="relative overflow-hidden rounded-2xl border border-amber-300/50 backdrop-blur-sm p-4 hover:scale-[1.02] transition-all shadow-lg">
              <div className="absolute inset-0 bg-cover bg-center opacity-[0.875]" style={{ backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/e8ff4336b_image_2025-12-27_131552732.png)' }} />
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 via-violet-900/50 to-purple-800/60" />
              <div className="relative flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Coins className="w-4 h-4 text-amber-300" />
                    <p className="text-xs font-medium uppercase tracking-wider text-amber-200">GGG</p>
                  </div>
                  <p className="text-2xl font-bold tracking-tight text-white drop-shadow-lg">{walletAvailable?.toLocaleString?.() || "0"}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-emerald-300" />
                    <span className="text-xs font-medium text-emerald-200">+124 today</span>
                  </div>
                </div>
              </div>
            </div>

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
        <div className="px-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <ModeCard mode="earn" title="Earn" icon={DollarSign} stats={`$${profile?.total_earnings || 0}`} onClick={() => window.location.href = createPageUrl('Marketplace')} />
            <ModeCard mode="learn" title="Learn" icon={TrendingUp} stats={`${meetings.filter((m) => m.meeting_type === 'mentorship').length} sessions`} onClick={() => window.location.href = createPageUrl('Marketplace')} />
            <ModeCard mode="build" title="Build" icon={Target} stats={`${missions.filter((m) => m.participant_ids?.includes(profile?.user_id)).length} active`} onClick={() => window.location.href = createPageUrl('Missions')} />
            <ModeCard mode="teach" title="Teach" icon={Users} stats={`${listings.filter((l) => l.listing_type === 'offer').length} offers`} onClick={() => window.location.href = createPageUrl('Studio')} />
            <ModeCard mode="lead" title="Lead" icon={Sparkles} stats={profile?.leader_tier !== 'none' ? 'Active' : 'Apply'} onClick={() => window.location.href = createPageUrl('LeaderChannel')} />
            <ModeCard mode="connect" title="Connect" icon={Users} stats={`${profile?.follower_count || 0} followers`} onClick={() => window.location.href = createPageUrl('Circles')} />
          </div>
        </div>

        {/* Control Area */}
        <div className="px-6 mb-6">
          <div className="relative p-4 rounded-2xl">
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
                <button type="button" onClick={() => {setColCOrder(['market', 'influence', 'leader', 'dailyops']);setCardsForceOpen(null);try {localStorage.removeItem('cmdColCOrder');} catch {}}} className="group relative z-20 flex items-center gap-3 p-3 rounded-xl bg-white/80 dark:bg-white/15 border border-slate-200 dark:border-slate-700 hover:bg-white hover:dark:bg-white/25 hover:border-violet-300 shadow-sm hover:shadow-md transition-transform duration-200 ease-out hover:-translate-y-0.5">
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
            </div>
          </div>
        </div>

        {/* Main Grid - Collapsible Cards */}
        <div className="px-6 relative min-h-[1200px]">
          <div className="block space-y-6">
            <CollapsibleCard title="Quick Actions" cardId="quickActions" icon={Zap} badge={pendingMeetings.length > 0 ? `${pendingMeetings.length} pending` : undefined} badgeColor="amber" backgroundImage="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80" onPopout={() => setQuickActionsPopupOpen(true)} forceOpen={cardsForceOpen} isHidden={hiddenCards.has('quickActions')} onToggleHide={() => toggleCardVisibility('quickActions')} onTossToSidePanel={handleTossToSidePanel}>
              <div className="relative z-10 text-zinc-950">
                <div className="flex items-center gap-3">
                  <Button variant="outline" className="bg-zinc-200 text-green-800 px-4 py-2 text-sm font-medium rounded-xl inline-flex items-center justify-center whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input shadow-sm hover:bg-accent hover:text-accent-foreground h-9 gap-2" onClick={() => setSidePanelOpen(!sidePanelOpen)}>
                    <BarChart3 className="w-4 h-4" />
                    {sidePanelOpen ? 'Hide Panel' : 'Show Panel'}
                  </Button>
                  <Button className="bg-violet-600 hover:bg-violet-700 rounded-xl gap-2" onClick={() => setQuickCreateOpen(true)}>
                    <Plus className="w-4 h-4" />
                    Quick Create
                  </Button>
                </div>
              </div>
            </CollapsibleCard>

            <CollapsibleCard title="Quick Start Checklist" cardId="quickStart" icon={CheckCircle} defaultOpen={false} backgroundImage="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80" onPopout={() => setQuickStartPopupOpen(true)} forceOpen={cardsForceOpen} isHidden={hiddenCards.has('quickStart')} onToggleHide={() => toggleCardVisibility('quickStart')} onTossToSidePanel={handleTossToSidePanel}>
              <QuickStartChecklist />
            </CollapsibleCard>

            <CollapsibleCard title="Challenges & Rewards" cardId="challenges" icon={Trophy} badge={challenges.filter((c) => c.current_count >= c.target_count && c.status === 'active').length || undefined} badgeColor="emerald" defaultOpen={true} backgroundImage="https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?w=800&q=80" onPopout={() => setChallengesPopupOpen(true)} forceOpen={cardsForceOpen} isHidden={hiddenCards.has('challenges')} onToggleHide={() => toggleCardVisibility('challenges')} onTossToSidePanel={handleTossToSidePanel}>
              <GamificationWidget profile={profile} />
            </CollapsibleCard>

            <CollapsibleCard title="Inbox & Signals" cardId="inbox" icon={Radio} badge={notifications.length} badgeColor="rose" backgroundImage="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80" onPopout={() => setInboxPopupOpen(true)} forceOpen={cardsForceOpen} isHidden={hiddenCards.has('inbox')} onToggleHide={() => toggleCardVisibility('inbox')} onTossToSidePanel={handleTossToSidePanel}>
              <InboxSignals notifications={notifications} />
            </CollapsibleCard>

            <CollapsibleCard title="Potential Collaborators" cardId="collaborators" icon={Users} badge="AI" badgeColor="emerald" backgroundImage="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80" defaultOpen={true} onPopout={() => setCollaboratorsPopupOpen(true)} forceOpen={cardsForceOpen} isHidden={hiddenCards.has('collaborators')} onToggleHide={() => toggleCardVisibility('collaborators')} onTossToSidePanel={handleTossToSidePanel}>
              <CollaborationSuggestions profile={profile} compact={false} />
            </CollapsibleCard>

            <CollapsibleCard title="Circles & Regions" cardId="circles" icon={Users} defaultOpen={false} backgroundImage="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80" onPopout={() => setCirclesPopupOpen(true)} forceOpen={cardsForceOpen} isHidden={hiddenCards.has('circles')} onToggleHide={() => toggleCardVisibility('circles')} onTossToSidePanel={handleTossToSidePanel}>
              <CirclesRegions />
            </CollapsibleCard>

            <CollapsibleCard title="Leader Pathway" cardId="leaderPathway" icon={Sparkles} defaultOpen={true} onPopout={() => setLeaderPopupOpen(true)} forceOpen={cardsForceOpen} className="leader-pathway-card" isHidden={hiddenCards.has('leaderPathway')} onToggleHide={() => toggleCardVisibility('leaderPathway')} onTossToSidePanel={handleTossToSidePanel}>
              <LeaderPathway profile={profile} />
            </CollapsibleCard>
          </div>

          <div className="block space-y-6 mt-6">
            <CollapsibleCard title="AI Discover" cardId="aiDiscover" icon={Sparkles} badge="New" badgeColor="violet" backgroundImage="https://images.unsplash.com/photo-1516450137517-162bfbeb8dba?w=800&q=80" defaultOpen={true} onPopout={() => setAiDiscoverPopupOpen(true)} forceOpen={cardsForceOpen} isHidden={hiddenCards.has('aiDiscover')} onToggleHide={() => toggleCardVisibility('aiDiscover')} onTossToSidePanel={handleTossToSidePanel}>
              <AIDiscoverMatches profile={profile} />
            </CollapsibleCard>

            <CollapsibleCard title="Synchronicity Engine" cardId="syncEngine" icon={Sparkles} badge={matches.length} badgeColor="violet" backgroundImage="https://images.unsplash.com/photo-1516450137517-162bfbeb8dba?w=800&q=80" onPopout={() => setSyncPopupOpen(true)} forceOpen={cardsForceOpen} isHidden={hiddenCards.has('syncEngine')} onToggleHide={() => toggleCardVisibility('syncEngine')} onTossToSidePanel={handleTossToSidePanel}>
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
            </CollapsibleCard>

            <CollapsibleCard title="Meetings & Momentum" cardId="meetings" icon={Calendar} badge={pendingMeetings.length > 0 ? `${pendingMeetings.length} pending` : undefined} badgeColor="amber" backgroundImage="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80" onPopout={() => setMeetingsPopupOpen(true)} forceOpen={cardsForceOpen} isHidden={hiddenCards.has('meetings')} onToggleHide={() => toggleCardVisibility('meetings')} onTossToSidePanel={handleTossToSidePanel}>
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
            </CollapsibleCard>

            <CollapsibleCard title="Missions" cardId="missions" icon={Target} badge={missions.length} badgeColor="amber" backgroundImage="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&q=80" onPopout={() => setMissionsPopupOpen(true)} forceOpen={cardsForceOpen} isHidden={hiddenCards.has('missions')} onToggleHide={() => toggleCardVisibility('missions')} onTossToSidePanel={handleTossToSidePanel}>
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
            </CollapsibleCard>

            <CollapsibleCard title="Projects" cardId="projects" icon={Folder} defaultOpen={true} backgroundImage="https://images.unsplash.com/photo-1532619187608-e5375cab36aa?w=800&q=80" onPopout={() => setProjectsPopupOpen(true)} forceOpen={cardsForceOpen} isHidden={hiddenCards.has('projects')} onToggleHide={() => toggleCardVisibility('projects')} onTossToSidePanel={handleTossToSidePanel}>
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
            </CollapsibleCard>
          </div>

          {/* Column C: Draggable */}
          <div className="block mt-6">
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="colC">
                {(provided) =>
                <div className="space-y-6" ref={provided.innerRef} {...provided.droppableProps}>
                    {colCOrder.map((id, index) =>
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
                                      <span className="text-yellow-400 font-medium">Boost Your Reach</span>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-3">Spend GGG to amplify your profile and attract more matches.</p>
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
          storedCards={storedCardsWithIcons}
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
        <TuneEngineModal open={tuneEngineOpen} onClose={() => setTuneEngineOpen(false)} />
        <OnlineUsersModal open={onlineUsersOpen} onClose={() => setOnlineUsersOpen(false)} />
      </div>
    </div>);

}