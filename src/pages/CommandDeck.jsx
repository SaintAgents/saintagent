import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import VideoMeetingModal from '@/components/VideoMeetingModal';
import BoostModal from '@/components/BoostModal';
import TuneEngineModal from '@/components/TuneEngineModal';
import OnlineUsersModal from '@/components/OnlineUsersModal';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Coins, 
  TrendingUp, 
  Users, 
  Calendar,
  Target,
  DollarSign,
  CheckCircle,
  Sparkles,
  Plus,
  ArrowRight,
  Zap,
  ShoppingBag,
  Radio,
  Flame,
  BarChart3
} from "lucide-react";
import FloatingPanel from '@/components/hud/FloatingPanel';
import InboxSignals from '@/components/sections/InboxSignals';
import CirclesRegions from '@/components/sections/CirclesRegions';
import SynchronicityEngine from '@/components/sections/SynchronicityEngine';
import MeetingsMomentum from '@/components/sections/MeetingsMomentum';
import MissionsQuests from '@/components/sections/MissionsQuests';
import MarketplaceEarnLearn from '@/components/sections/MarketplaceEarnLearn';
import InfluenceReach from '@/components/sections/InfluenceReach';

import MetricTile from '@/components/hud/MetricTile';
import CollapsibleCard from '@/components/hud/CollapsibleCard';
import MatchCard from '@/components/hud/MatchCard';
import MeetingCard from '@/components/hud/MeetingCard';
import MissionCard from '@/components/hud/MissionCard';
import ListingCard from '@/components/hud/ListingCard';
import ProgressRing from '@/components/hud/ProgressRing';
import SidePanel from '@/components/hud/SidePanel';
import QuickCreateModal from '@/components/hud/QuickCreateModal';
import ModeCard from '@/components/hud/ModeCard';
import AIMatchGenerator from '@/components/ai/AIMatchGenerator';
import LeaderPathway from '@/components/leader/LeaderPathway';

export default function CommandDeck() {
  const [sidePanelOpen, setSidePanelOpen] = useState(true);
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
      return base44.entities.UserProfile.filter({ user_id: currentUser.email });
    },
    enabled: !!currentUser?.email
  });
  const profile = profiles?.[0];

  // Onboarding progress
  const { data: onboardingRecords } = useQuery({
    queryKey: ['onboardingProgress', currentUser?.email],
    queryFn: () => base44.entities.OnboardingProgress.filter({ user_id: currentUser.email }),
    enabled: !!currentUser?.email
  });
  const onboarding = onboardingRecords?.[0];
  const ONBOARDING_STEPS = 10;
  const setupPercent = onboarding ? Math.round((((onboarding.current_step || 0) + 1) / ONBOARDING_STEPS) * 100) : 0;

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

  // Fetch notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => base44.entities.Notification.filter({ is_read: false }, '-created_date', 20)
  });

  const filteredMatches = matches.filter(m => 
    matchTab === 'people' ? m.target_type === 'person' :
    matchTab === 'offers' ? m.target_type === 'offer' :
    matchTab === 'missions' ? m.target_type === 'mission' :
    matchTab === 'events' ? m.target_type === 'event' :
    matchTab === 'teachers' ? m.target_type === 'teacher' : true
  );

  const pendingMeetings = meetings.filter(m => m.status === 'pending');
  const scheduledMeetings = meetings.filter(m => m.status === 'scheduled');
  const completedMeetingsThisWeek = meetings.filter(m => m.status === 'completed').length;

  const queryClient = useQueryClient();

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
        // Stay on command deck to see the post in the feed
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
      <div className={cn(
        "transition-all duration-300 pb-8",
        sidePanelOpen ? "pr-80" : "pr-0"
      )}>
        {/* Page Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Command Deck</h1>
              <p className="text-slate-500 mt-1">Your mission control center</p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                className="rounded-xl gap-2"
                onClick={() => setSidePanelOpen(!sidePanelOpen)}
              >
                <BarChart3 className="w-4 h-4" />
                {sidePanelOpen ? 'Hide Panel' : 'Show Panel'}
              </Button>
              <Button 
                className="bg-violet-600 hover:bg-violet-700 rounded-xl gap-2"
                onClick={() => setQuickCreateOpen(true)}
              >
                <Plus className="w-4 h-4" />
                Quick Create
              </Button>
            </div>
          </div>

          {/* Profile Identifiers */}
          <div className="mb-6 p-6 rounded-2xl bg-white border border-slate-200/60 shadow-sm">
            <div className="flex items-start gap-6">
              <div className="relative shrink-0">
                <div 
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 p-1 shadow-lg cursor-pointer hover:scale-105 transition-transform"
                  data-user-id={profile?.user_id}
                >
                  <div className="w-full h-full rounded-full bg-white p-1">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                        <span className="text-3xl font-bold text-violet-600">
                          {profile?.display_name?.charAt(0) || 'U'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {profile?.leader_tier === 'verified144k' && (
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center shadow-md">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                {/* Header: Name, Title, Trust Score */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      {profile?.display_name || 'User'}
                    </h2>
                    <p className="text-sm text-slate-500 capitalize">
                      {profile?.rank_code || 'Seeker'} • @{profile?.handle}
                    </p>
                  </div>
                  
                  {/* Trust Score Gauge */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Trust Score</p>
                      <p className="text-2xl font-bold text-violet-600">{profile?.trust_score || 0}</p>
                    </div>
                    <div className="relative w-16 h-16">
                      <svg className="w-16 h-16 transform -rotate-90">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                          className="text-slate-200"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 28}`}
                          strokeDashoffset={`${2 * Math.PI * 28 * (1 - (profile?.trust_score || 0) / 100)}`}
                          className="text-violet-600 transition-all duration-500"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-violet-600">
                          {profile?.trust_score || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-4 gap-3 mb-4 p-3 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50">
                  <div className="text-center">
                    <p className="text-lg font-bold text-violet-700">{profile?.ggg_balance?.toLocaleString() || "0"}</p>
                    <p className="text-xs text-slate-500">GGG</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-900">{profile?.rank_points || 0}</p>
                    <p className="text-xs text-slate-500">Rank Points</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-900">{profile?.follower_count || 0}</p>
                    <p className="text-xs text-slate-500">Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-900">{profile?.meetings_completed || 0}</p>
                    <p className="text-xs text-slate-500">Meetings</p>
                  </div>
                </div>

                {/* Setup Progress (if onboarding not complete) */}
                {onboarding && onboarding.status !== 'complete' && (
                  <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <p className="text-sm font-medium text-amber-800">Profile setup in progress</p>
                      <span className="text-xs font-semibold text-amber-700">{setupPercent}%</span>
                    </div>
                    <Progress value={setupPercent} className="h-2" />
                    <div className="mt-2 text-right">
                      <Button variant="outline" size="sm" className="rounded-lg" onClick={() => { window.location.href = createPageUrl('Onboarding'); }}>
                        Resume Setup
                      </Button>
                    </div>
                  </div>
                )}

                {/* Badges */}
                {badges.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-slate-500 mb-2">Badges Earned</p>
                    <div className="flex flex-wrap gap-2">
                      {badges.slice(0, 6).map((badge) => (
                        <div 
                          key={badge.id}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 border border-violet-200 flex items-center gap-1.5"
                        >
                          {badge.category === 'identity' && '🛡️'}
                          {badge.category === 'marketplace' && '💰'}
                          {badge.category === 'agent' && '🤖'}
                          {badge.category === 'security' && '🔒'}
                          {badge.category === 'mission' && '🎯'}
                          {badge.category === 'alignment' && '✨'}
                          <span className="capitalize">
                            {badge.badge_name || badge.badge_code.replace(/_/g, ' ')}
                          </span>
                        </div>
                      ))}
                      {badges.length > 6 && (
                        <div className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600">
                          +{badges.length - 6} more
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Mystical Profile */}
                <div>
                  <p className="text-xs text-slate-500 mb-3">✨ Mystical Identity</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {profile?.mystical_identifier && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Mystical ID</p>
                        <p className="text-sm font-semibold text-slate-900">{profile.mystical_identifier}</p>
                      </div>
                    </div>
                  )}
                  
                  {profile?.astrological_sign && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                        ✨
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Sun Sign</p>
                        <p className="text-sm font-semibold text-slate-900">{profile.astrological_sign}</p>
                      </div>
                    </div>
                  )}
                  
                  {profile?.rising_sign && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center shrink-0">
                        🌅
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Rising</p>
                        <p className="text-sm font-semibold text-slate-900">{profile.rising_sign}</p>
                      </div>
                    </div>
                  )}

                  {profile?.moon_sign && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                        🌙
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Moon</p>
                        <p className="text-sm font-semibold text-slate-900">{profile.moon_sign}</p>
                      </div>
                    </div>
                  )}
                  
                  {profile?.numerology_life_path && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-amber-600">{profile.numerology_life_path}</span>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Life Path</p>
                        <p className="text-sm font-semibold text-slate-900">Path {profile.numerology_life_path}</p>
                      </div>
                    </div>
                  )}

                  {profile?.numerology_personality && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-orange-600">{profile.numerology_personality}</span>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Personality</p>
                        <p className="text-sm font-semibold text-slate-900">#{profile.numerology_personality}</p>
                      </div>
                    </div>
                  )}
                  
                  {profile?.birth_card && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
                        🃏
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Birth Card</p>
                        <p className="text-sm font-semibold text-slate-900">{profile.birth_card}</p>
                      </div>
                    </div>
                  )}

                  {profile?.sun_card && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center shrink-0">
                        ☀️
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Sun Card</p>
                        <p className="text-sm font-semibold text-slate-900">{profile.sun_card}</p>
                      </div>
                    </div>
                  )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Stats Mini Dashboard */}
          <div className="mb-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Total Users</p>
                  <p className="text-2xl font-bold text-slate-900">1,247</p>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <button 
                  onClick={() => setOnlineUsersOpen(true)}
                  className="text-left hover:opacity-80 transition-opacity"
                >
                  <p className="text-xs text-slate-500 mb-1">Online Now</p>
                  <p className="text-2xl font-bold text-emerald-600 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    342
                  </p>
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-slate-500">North America</p>
                  <p className="text-sm font-semibold text-slate-900">487</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Europe</p>
                  <p className="text-sm font-semibold text-slate-900">312</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Asia</p>
                  <p className="text-sm font-semibold text-slate-900">289</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Other</p>
                  <p className="text-sm font-semibold text-slate-900">159</p>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="relative overflow-hidden rounded-2xl border border-amber-300/50 backdrop-blur-sm p-4 hover:scale-[1.02] transition-all shadow-lg">
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-[0.875]"
                style={{ backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/e8ff4336b_image_2025-12-27_131552732.png)' }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 via-violet-900/50 to-purple-800/60" />
              <div className="relative flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Coins className="w-4 h-4 text-amber-300" />
                    <p className="text-xs font-medium uppercase tracking-wider text-amber-200">GGG</p>
                  </div>
                  <p className="text-2xl font-bold tracking-tight text-white drop-shadow-lg">
                    {profile?.ggg_balance?.toLocaleString() || "0"}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-emerald-300" />
                    <span className="text-xs font-medium text-emerald-200">+124 today</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-violet-200 backdrop-blur-sm p-4 hover:scale-[1.02] transition-all">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/def3a92a7_image_2025-12-27_111942719.png)' }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-violet-900/60 via-violet-800/40 to-transparent" />
              </div>
              <div className="relative flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-white/90" />
                    <p className="text-xs font-medium uppercase tracking-wider text-white/80">Rank</p>
                  </div>
                  <p className="text-xl font-bold tracking-tight text-white capitalize">
                    {profile?.rank_code || "Seeker"}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-blue-300/50 backdrop-blur-sm p-4 hover:scale-[1.02] transition-all shadow-lg">
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-[0.875]"
                style={{ backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/834e5195f_image_2025-12-27_132011008.png)' }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 via-blue-800/50 to-blue-900/60" />
              <div className="relative flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-blue-300" />
                    <p className="text-xs font-medium uppercase tracking-wider text-blue-200">Reach</p>
                  </div>
                  <p className="text-2xl font-bold tracking-tight text-white drop-shadow-lg">
                    {profile?.reach_score || 0}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-emerald-300" />
                    <span className="text-xs font-medium text-emerald-200">+8%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-emerald-300/50 backdrop-blur-sm p-4 hover:scale-[1.02] transition-all shadow-lg">
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-[0.875]"
                style={{ backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/854748652_c9f98f91-174a-46a0-b12f-26bde09c8ea8.png)' }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 via-violet-900/50 to-purple-800/60" />
              <div className="relative flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-emerald-300" />
                    <p className="text-xs font-medium uppercase tracking-wider text-emerald-200">Earned</p>
                  </div>
                  <p className="text-2xl font-bold tracking-tight text-white drop-shadow-lg">
                    ${profile?.total_earnings?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-cyan-300/50 backdrop-blur-sm p-4 hover:scale-[1.02] transition-all shadow-lg">
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-[0.875]"
                style={{ backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/8cc962c0c_ChatGPTImageDec27202501_25_18PM.png)' }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/60 via-blue-900/50 to-cyan-800/60" />
              <div className="relative flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-cyan-300" />
                    <p className="text-xs font-medium uppercase tracking-wider text-cyan-200">Meetings</p>
                  </div>
                  <p className="text-2xl font-bold tracking-tight text-white drop-shadow-lg">
                    {completedMeetingsThisWeek}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-purple-300/50 backdrop-blur-sm p-4 hover:scale-[1.02] transition-all shadow-lg">
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-[0.875]"
                style={{ backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/a2f4b87c3_ChatGPTImageDec27202501_27_46PM.png)' }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 via-violet-900/50 to-purple-800/60" />
              <div className="relative flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-purple-300" />
                    <p className="text-xs font-medium uppercase tracking-wider text-purple-200">Missions</p>
                  </div>
                  <p className="text-2xl font-bold tracking-tight text-white drop-shadow-lg">
                    {missions.filter(m => m.participant_ids?.includes(profile?.user_id)).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mode Cards Grid */}
        <div className="px-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <ModeCard
              mode="earn"
              title="Earn"
              icon={DollarSign}
              stats={`$${profile?.total_earnings || 0}`}
              onClick={() => window.location.href = createPageUrl('Marketplace')}
            />
            <ModeCard
              mode="learn"
              title="Learn"
              icon={TrendingUp}
              stats={`${meetings.filter(m => m.meeting_type === 'mentorship').length} sessions`}
              onClick={() => window.location.href = createPageUrl('Marketplace')}
            />
            <ModeCard
              mode="build"
              title="Build"
              icon={Target}
              stats={`${missions.filter(m => m.participant_ids?.includes(profile?.user_id)).length} active`}
              onClick={() => window.location.href = createPageUrl('Missions')}
            />
            <ModeCard
              mode="teach"
              title="Teach"
              icon={Users}
              stats={`${listings.filter(l => l.listing_type === 'offer').length} offers`}
              onClick={() => window.location.href = createPageUrl('Studio')}
            />
            <ModeCard
              mode="lead"
              title="Lead"
              icon={Sparkles}
              stats={profile?.leader_tier !== 'none' ? 'Active' : 'Apply'}
              onClick={() => window.location.href = createPageUrl('LeaderChannel')}
            />
            <ModeCard
              mode="connect"
              title="Connect"
              icon={Users}
              stats={`${profile?.follower_count || 0} followers`}
              onClick={() => window.location.href = createPageUrl('Circles')}
            />
          </div>
        </div>

        {/* Main Grid */}
        <div className="px-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column A: Now + Daily Action */}
          <div className="space-y-6">
            {/* Command Summary */}
            <CollapsibleCard 
              title="Quick Actions" 
              icon={Zap}
              badge={pendingMeetings.length > 0 ? `${pendingMeetings.length} pending` : undefined}
              badgeColor="amber"
              backgroundImage="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80"
            >
              <div className="grid grid-cols-2 gap-3">
                <Button className="h-20 flex-col gap-2 bg-violet-600 hover:bg-violet-700 rounded-xl" onClick={() => { setQuickCreateType('meeting'); setQuickCreateOpen(true); }}>
                  <Calendar className="w-5 h-5" />
                  <span className="text-xs">Book Meeting</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2 rounded-xl" onClick={() => { setQuickCreateType('post'); setQuickCreateOpen(true); }}>
                  <Plus className="w-5 h-5" />
                  <span className="text-xs">Post Update</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2 rounded-xl" onClick={() => { setQuickCreateType('mission'); setQuickCreateOpen(true); }}>
                  <Target className="w-5 h-5" />
                  <span className="text-xs">Launch Mission</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2 rounded-xl" onClick={() => { setQuickCreateType('offer'); setQuickCreateOpen(true); }}>
                  <ShoppingBag className="w-5 h-5" />
                  <span className="text-xs">Create Offer</span>
                </Button>
              </div>
            </CollapsibleCard>

            {/* Inbox & Signals */}
            <CollapsibleCard 
                                title="Inbox & Signals" 
                                icon={Radio}
                                badge={notifications.length}
                                badgeColor="rose"
                                backgroundImage="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80"
                                onPopout={() => setInboxPopupOpen(true)}
                              >
                                <InboxSignals notifications={notifications} />
                              </CollapsibleCard>

            {/* Circles & Regions */}
            <CollapsibleCard 
                                title="Circles & Regions" 
                                icon={Users}
                                defaultOpen={false}
                                backgroundImage="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80"
                                onPopout={() => setCirclesPopupOpen(true)}
                              >
                                <CirclesRegions />
                              </CollapsibleCard>

            {/* Leader Pathway */}
            <CollapsibleCard 
              title="Leader Pathway" 
              icon={Sparkles}
              defaultOpen={true}
              onPopout={() => setLeaderPopupOpen(true)}
            >
              <LeaderPathway profile={profile} />
            </CollapsibleCard>
            </div>

          {/* Column B: Synchronicity + Meetings + Missions */}
          <div className="space-y-6">
            {/* Synchronicity Stack */}
            <CollapsibleCard 
                                title="Synchronicity Engine" 
                                icon={Sparkles}
                                badge={matches.length}
                                badgeColor="violet"
                                backgroundImage="https://images.unsplash.com/photo-1516450137517-162bfbeb8dba?w=800&q=80"
                                onPopout={() => setSyncPopupOpen(true)}
                              >
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
                  {filteredMatches.length === 0 ? (
                    <div className="text-center py-8">
                      <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm text-slate-500">No matches yet</p>
                      <p className="text-xs text-slate-400 mt-1">Complete your profile to find matches</p>
                    </div>
                  ) : (
                    filteredMatches.slice(0, 3).map((match) => (
                      <MatchCard 
                        key={match.id} 
                        match={match} 
                        onAction={handleMatchAction}
                      />
                    ))
                  )}
                  {filteredMatches.length > 3 && (
                    <Button variant="ghost" className="w-full text-violet-600">
                      View all {filteredMatches.length} matches
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </Tabs>
            </CollapsibleCard>

            {/* Meetings & Momentum */}
            <CollapsibleCard 
                                title="Meetings & Momentum" 
                                icon={Calendar}
                                badge={pendingMeetings.length > 0 ? `${pendingMeetings.length} pending` : undefined}
                                badgeColor="amber"
                                backgroundImage="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80"
                                onPopout={() => setMeetingsPopupOpen(true)}
                              >
              <div className="space-y-3">
                {scheduledMeetings.length === 0 && pendingMeetings.length === 0 ? (
                  <div className="text-center py-6">
                    <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">No upcoming meetings</p>
                    <Button variant="outline" className="mt-3 rounded-xl" onClick={() => { setQuickCreateType('meeting'); setQuickCreateOpen(true); }}>
                      Schedule a meeting
                    </Button>
                  </div>
                ) : (
                  [...pendingMeetings, ...scheduledMeetings].slice(0, 3).map((meeting) => (
                    <MeetingCard 
                      key={meeting.id} 
                      meeting={meeting} 
                      onAction={handleMeetingAction}
                    />
                  ))
                )}
              </div>
            </CollapsibleCard>

            {/* Missions & Quests */}
            <CollapsibleCard 
                                title="Missions & Quests" 
                                icon={Target}
                                badge={missions.length}
                                badgeColor="amber"
                                backgroundImage="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&q=80"
                                onPopout={() => setMissionsPopupOpen(true)}
                              >
              <div className="space-y-3">
                {missions.length === 0 ? (
                  <div className="text-center py-6">
                    <Target className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">No active missions</p>
                    <Button variant="outline" className="mt-3 rounded-xl">
                      Browse missions
                    </Button>
                  </div>
                ) : (
                  missions.slice(0, 2).map((mission) => (
                    <MissionCard 
                      key={mission.id} 
                      mission={mission} 
                      onAction={handleMissionAction}
                      variant="compact"
                    />
                  ))
                )}
              </div>
            </CollapsibleCard>
          </div>

          {/* Column C: Earnings + Influence + Creator */}
          <div className="space-y-6">
            {/* Marketplace Card */}
            <CollapsibleCard 
                                title="Marketplace: Earn & Learn" 
                                icon={ShoppingBag}
                                backgroundImage="https://images.unsplash.com/photo-1639322537228-f710d846310a?w=800&q=80"
                                onPopout={() => setMarketPopupOpen(true)}
                              >
              <Tabs defaultValue="offers" className="w-full">
                <TabsList className="w-full grid grid-cols-3 mb-4">
                  <TabsTrigger value="offers" className="text-xs">My Offers</TabsTrigger>
                  <TabsTrigger value="requests" className="text-xs">Requests</TabsTrigger>
                  <TabsTrigger value="browse" className="text-xs">Browse</TabsTrigger>
                </TabsList>
                <TabsContent value="offers" className="space-y-3">
                  {listings.filter(l => l.listing_type === 'offer').length === 0 ? (
                    <div className="text-center py-6">
                      <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm text-slate-500">No offers yet</p>
                      <Button className="mt-3 rounded-xl bg-violet-600 hover:bg-violet-700">
                        Create your first offer
                      </Button>
                    </div>
                  ) : (
                    listings.filter(l => l.listing_type === 'offer').slice(0, 2).map((listing) => (
                      <ListingCard 
                        key={listing.id} 
                        listing={listing} 
                        isOwner={true}
                        onAction={handleListingAction}
                      />
                    ))
                  )}
                </TabsContent>
                <TabsContent value="requests" className="space-y-3">
                  <div className="text-center py-6">
                    <p className="text-sm text-slate-500">No pending requests</p>
                  </div>
                </TabsContent>
                <TabsContent value="browse" className="space-y-3">
                  {listings.slice(0, 2).map((listing) => (
                    <ListingCard 
                      key={listing.id} 
                      listing={listing} 
                      onAction={handleListingAction}
                    />
                  ))}
                </TabsContent>
              </Tabs>
            </CollapsibleCard>

            {/* Influence & Broadcast */}
            <CollapsibleCard 
                                title="Influence & Reach" 
                                icon={TrendingUp}
                                backgroundImage="https://images.unsplash.com/photo-1620421680010-0766ff230392?w=800&q=80"
                                onPopout={() => setInfluencePopupOpen(true)}
                              >
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
                    <span className="font-medium text-slate-900">Boost Your Reach</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">
                    Spend GGG to amplify your content and attract more followers.
                  </p>
                  <Button 
                    className="w-full rounded-xl bg-violet-600 hover:bg-violet-700"
                    onClick={() => setBoostTarget({ type: 'profile', id: profile?.user_id })}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Boost Now
                  </Button>
                </div>
              </div>
            </CollapsibleCard>

            {/* Leader Channel Preview */}
            <CollapsibleCard 
              title="144K Leader Channel" 
              icon={Radio}
              defaultOpen={false}
              backgroundImage="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80"
            >
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mx-auto mb-4">
                  <Radio className="w-8 h-8 text-amber-600" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Become a Verified Leader</h4>
                <p className="text-sm text-slate-500 mb-4">
                  Join the 144,000 Super-Conscious Leaders with special broadcast privileges.
                </p>
                <Button variant="outline" className="rounded-xl">
                  Apply for Verification
                </Button>
              </div>
            </CollapsibleCard>
          </div>
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
      />

      {/* Popout Panels */}
      {inboxPopupOpen && (
        <FloatingPanel title="Inbox & Signals" onClose={() => setInboxPopupOpen(false)}>
          <InboxSignals notifications={notifications} />
        </FloatingPanel>
      )}
      {circlesPopupOpen && (
        <FloatingPanel title="Circles & Regions" onClose={() => setCirclesPopupOpen(false)}>
          <CirclesRegions />
        </FloatingPanel>
      )}
      {syncPopupOpen && (
        <FloatingPanel title="Synchronicity Engine" onClose={() => setSyncPopupOpen(false)}>
          <SynchronicityEngine 
            profile={profile}
            matchTab={matchTab}
            setMatchTab={setMatchTab}
            filteredMatches={filteredMatches}
            matches={matches}
            onMatchAction={handleMatchAction}
          />
        </FloatingPanel>
      )}
      {meetingsPopupOpen && (
        <FloatingPanel title="Meetings & Momentum" onClose={() => setMeetingsPopupOpen(false)}>
          <MeetingsMomentum 
            pendingMeetings={pendingMeetings}
            scheduledMeetings={scheduledMeetings}
            onAction={handleMeetingAction}
          />
        </FloatingPanel>
      )}
      {missionsPopupOpen && (
        <FloatingPanel title="Missions & Quests" onClose={() => setMissionsPopupOpen(false)}>
          <MissionsQuests 
            missions={missions}
            profile={profile}
            onAction={handleMissionAction}
          />
        </FloatingPanel>
      )}
      {marketPopupOpen && (
        <FloatingPanel title="Marketplace: Earn & Learn" onClose={() => setMarketPopupOpen(false)}>
          <MarketplaceEarnLearn 
            listings={listings}
            onAction={handleListingAction}
          />
        </FloatingPanel>
      )}
      {influencePopupOpen && (
        <FloatingPanel title="Influence & Reach" onClose={() => setInfluencePopupOpen(false)}>
          <InfluenceReach 
            profile={profile}
            onBoost={() => setBoostTarget({ type: 'profile', id: profile?.user_id })}
          />
        </FloatingPanel>
      )}
      {leaderPopupOpen && (
        <FloatingPanel title="Leader Pathway" onClose={() => setLeaderPopupOpen(false)}>
          <LeaderPathway profile={profile} />
        </FloatingPanel>
      )}

      {/* Quick Create Modal */}
      <QuickCreateModal 
        open={quickCreateOpen}
        initialType={quickCreateType}
        onClose={() => { setQuickCreateOpen(false); setQuickCreateType(null); }}
        onCreate={handleCreate}
      />

      {/* Video Meeting Modal */}
      {videoMeeting && (
        <VideoMeetingModal
          meeting={videoMeeting}
          open={!!videoMeeting}
          onClose={() => setVideoMeeting(null)}
        />
      )}

      {/* Boost Modal */}
      {boostTarget && (
        <BoostModal
          open={!!boostTarget}
          onClose={() => setBoostTarget(null)}
          targetType={boostTarget.type}
          targetId={boostTarget.id}
        />
      )}

      {/* Tune Engine Modal */}
      <TuneEngineModal
        open={tuneEngineOpen}
        onClose={() => setTuneEngineOpen(false)}
      />

      {/* Online Users Modal */}
      <OnlineUsersModal
        open={onlineUsersOpen}
        onClose={() => setOnlineUsersOpen(false)}
      />
      </div>
      );
      }