import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import EmojiPicker from "@/components/messages/EmojiPicker";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Calendar,
  Zap,
  Coins,
  TrendingUp,
  Users,
  HelpCircle,
  Clock,
  ArrowRight,
  Heart,
  MessageCircle,
  Share2,
  Send,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  List,
  Video,
  Mic,
  ExternalLink } from
  "lucide-react";
import ProgressRing from './ProgressRing';
import CollapsibleCard from '@/components/hud/CollapsibleCard';
import FloatingPanel from '@/components/hud/FloatingPanel';
import WalletPanel from '@/components/wallet/WalletPanel';
import MiniProfile from '@/components/profile/MiniProfile';
import { format, parseISO, isToday, isTomorrow } from "date-fns";
import { RP_LADDER } from '@/components/reputation/rpUtils';
import { createPageUrl } from '@/utils';

export default function SidePanel({
  matches = [],
  meetings = [],
  profile,
  isOpen,
  onToggle,
  onMatchAction,
  onMeetingAction
}) {
  const [commentText, setCommentText] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [newPostText, setNewPostText] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoError, setVideoError] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);
  const queryClient = useQueryClient();

  // Popout states for sections
  const [gggPopupOpen, setGggPopupOpen] = useState(false);
  const [gggAuditOpen, setGggAuditOpen] = useState(false);
  const [gggTxOpen, setGggTxOpen] = useState(false);
  const [walletPopupOpen, setWalletPopupOpen] = useState(false);
  const [schedulePopupOpen, setSchedulePopupOpen] = useState(false);
  const [matchesPopupOpen, setMatchesPopupOpen] = useState(false);
  const [helpPopupOpen, setHelpPopupOpen] = useState(false);
  const [feedPopupOpen, setFeedPopupOpen] = useState(false);
  const [onlinePopupOpen, setOnlinePopupOpen] = useState(false);
  const [usersPopupOpen, setUsersPopupOpen] = useState(false);
  const [recentJoinsPopupOpen, setRecentJoinsPopupOpen] = useState(false);

  // Docking & Dragging
  const [dockSide, setDockSide] = useState('right'); // 'left' | 'right'
  const [topOffset, setTopOffset] = useState(80); // px from top
  const dragRef = React.useRef({ startY: 0, startTop: 0 });

  const onDragMove = (e) => {
    const dy = e.clientY - dragRef.current.startY;
    const nextTop = Math.max(0, Math.min((window.innerHeight || 0) - 60, dragRef.current.startTop + dy));
    setTopOffset(nextTop);
  };
  const onDragEnd = (e) => {
    document.removeEventListener('mousemove', onDragMove);
    document.removeEventListener('mouseup', onDragEnd);
    if ((e.clientX || 0) < (window.innerWidth || 0) / 2) setDockSide('left');else setDockSide('right');
  };
  const onDragStart = (e) => {
    dragRef.current = { startY: e.clientY, startTop: topOffset };
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);
  };

  React.useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', onDragMove);
      document.removeEventListener('mouseup', onDragEnd);
    };
  }, []);

  // Fetch posts
  const { data: posts = [] } = useQuery({
    queryKey: ['posts'],
    queryFn: () => base44.entities.Post.list('-created_date', 10)
  });

  // Fetch likes
  const { data: allLikes = [] } = useQuery({
    queryKey: ['postLikes'],
    queryFn: () => base44.entities.PostLike.list()
  });

  // Fetch comments
  const { data: allComments = [] } = useQuery({
    queryKey: ['postComments'],
    queryFn: () => base44.entities.PostComment.list('-created_date')
  });

  // Audit trail data (GGG + Reputation)
  const { data: gggTx = [] } = useQuery({
    queryKey: ['gggTx', profile?.user_id],
    queryFn: () => base44.entities.GGGTransaction.filter({ user_id: profile.user_id }, '-created_date', 100),
    enabled: !!profile?.user_id
  });

  const { data: rpEvents = [] } = useQuery({
    queryKey: ['rpEvents', profile?.user_id],
    queryFn: () => base44.entities.ReputationEvent.filter({ user_id: profile.user_id }, '-created_date', 100),
    enabled: !!profile?.user_id
  });

  const { data: trustEvents = [] } = useQuery({
    queryKey: ['trustEvents', profile?.user_id],
    queryFn: () => base44.entities.TrustEvent.filter({ user_id: profile.user_id }, '-created_date', 100),
    enabled: !!profile?.user_id
  });

  const auditItems = React.useMemo(() => {
    const txs = (gggTx || []).map((it) => ({ ...it, _type: 'ggg' }));
    const rps = (rpEvents || []).map((it) => ({ ...it, _type: 'rp' }));
    const trs = (trustEvents || []).map((it) => ({ ...it, _type: 'trust' }));
    return [...txs, ...rps, ...trs].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  }, [gggTx, rpEvents, trustEvents]);

  const likeMutation = useMutation({
    mutationFn: async ({ postId, userId }) => {
      const existing = allLikes.find((l) => l.post_id === postId && l.user_id === userId);
      if (existing) {
        await base44.entities.PostLike.delete(existing.id);
        const post = posts.find((p) => p.id === postId);
        if (post) {
          await base44.entities.Post.update(postId, { likes_count: Math.max(0, (post.likes_count || 0) - 1) });
        }
      } else {
        await base44.entities.PostLike.create({ post_id: postId, user_id: userId });
        const post = posts.find((p) => p.id === postId);
        if (post) {
          await base44.entities.Post.update(postId, { likes_count: (post.likes_count || 0) + 1 });
          if (post.author_id && post.author_id !== profile?.user_id) {
            await base44.entities.Notification.create({
              user_id: post.author_id,
              type: 'system',
              title: 'New like on your post',
              message: `${profile?.display_name || 'Someone'} liked your post`,
              action_url: createPageUrl('CommandDeck')
            });
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['postLikes'] });
    }
  });

  const commentMutation = useMutation({
    mutationFn: async ({ postId, content }) => {
      await base44.entities.PostComment.create({
        post_id: postId,
        author_id: profile.user_id,
        author_name: profile.display_name,
        author_avatar: profile.avatar_url,
        content
      });
      const post = posts.find((p) => p.id === postId);
      if (post) {
        await base44.entities.Post.update(postId, { comments_count: (post.comments_count || 0) + 1 });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['postComments'] });
    }
  });

  const createPostMutation = useMutation({
    mutationFn: async (payload) => {
      await base44.entities.Post.create({
        author_id: profile.user_id,
        author_name: profile.display_name,
        author_avatar: profile.avatar_url,
        content: payload.content || '',
        video_url: payload.video_url,
        video_duration_seconds: payload.video_duration_seconds,
        audio_url: payload.audio_url
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setNewPostText('');
      if (videoPreview) {try {URL.revokeObjectURL(videoPreview);} catch {}
      }
      setVideoFile(null);
      setVideoPreview(null);
      setVideoDuration(0);
      setVideoError('');
      if (audioPreview) {try {URL.revokeObjectURL(audioPreview);} catch {}}
      setAudioFile(null);
      setAudioPreview(null);
    }
  });

  const handleLike = (postId) => {
    likeMutation.mutate({ postId, userId: profile?.user_id });
  };

  const handleComment = (postId) => {
    const text = commentText[postId];
    if (text?.trim()) {
      commentMutation.mutate({ postId, content: text.trim() });
      setCommentText({ ...commentText, [postId]: '' });
    }
  };

  const handleCreatePost = async () => {
    if (!newPostText.trim() && !videoFile && !audioFile) return;
    let video_url;
    let audio_url;
    if (videoFile) {
      const up = await base44.integrations.Core.UploadFile({ file: videoFile });
      video_url = up.file_url;
    }
    if (audioFile) {
      const up = await base44.integrations.Core.UploadFile({ file: audioFile });
      audio_url = up.file_url;
    }
    createPostMutation.mutate({
      content: newPostText.trim(),
      video_url,
      video_duration_seconds: videoFile ? Math.round(videoDuration || 0) : undefined,
      audio_url
    });
  };

  const onAudioChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) {setAudioFile(null);setAudioPreview(null);return;}
    const url = URL.createObjectURL(f);
    setAudioFile(f);
    setAudioPreview(url);
  };

  const isLikedByUser = (postId) => {
    return allLikes.some((l) => l.post_id === postId && l.user_id === profile?.user_id);
  };

  // Rank milestones from RP events
  const rankMilestones = React.useMemo(() => {
    const sorted = [...(rpEvents || [])].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    const milestones = [];
    const seen = new Set();
    for (const tier of RP_LADDER) {
      const hit = sorted.find((ev) => (ev.rp_after || 0) >= tier.min);
      if (hit && !seen.has(tier.code)) {
        milestones.push({ tier, event: hit });
        seen.add(tier.code);
      }
    }
    return milestones;
  }, [rpEvents]);

  const onVideoChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) {setVideoFile(null);setVideoPreview(null);setVideoDuration(0);setVideoError('');return;}
    const url = URL.createObjectURL(f);
    setVideoFile(f);
    setVideoPreview(url);
    setVideoError('');
    const v = document.createElement('video');
    v.preload = 'metadata';
    v.src = url;
    v.onloadedmetadata = () => {
      const dur = Number(v.duration || 0);
      setVideoDuration(dur);
      if (dur > 120) {
        setVideoError('Video must be 2 minutes max');
        setVideoFile(null);
        setVideoPreview(null);
        try {URL.revokeObjectURL(url);} catch {}
      }
    };
  };

  const computePostComments = (postId) => {
    return allComments.filter((c) => c.post_id === postId);
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = parseISO(dateStr);
    if (isToday(date)) return `Today ${format(date, 'h:mm a')}`;
    if (isTomorrow(date)) return `Tomorrow ${format(date, 'h:mm a')}`;
    return format(date, "MMM d, h:mm a");
  };

  const { data: walletRes } = useQuery({
    queryKey: ['wallet', profile?.user_id],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('walletEngine', {
        action: 'getWallet',
        payload: { user_id: profile.user_id }
      });
      return data;
    },
    enabled: !!profile?.user_id
  });
  const walletAvailable = walletRes?.wallet?.available_balance ?? profile?.ggg_balance ?? 0;
  const rankProgress = walletAvailable;
  const nextRankAt = 100;

  // Fetch total users and online users (realtime polling every 10s)
  const { data: allUserProfiles = [] } = useQuery({
    queryKey: ['allUserProfilesCount'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 500),
    refetchInterval: 10000
  });

  const totalUsers = allUserProfiles.length;
  const onlineUsers = allUserProfiles.filter(u => {
    if (!u.last_seen_at) return false;
    const lastSeen = new Date(u.last_seen_at);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return lastSeen > fiveMinutesAgo;
  }).length;

  // Region breakdown
  const regionCounts = React.useMemo(() => {
    const counts = { 'North America': 0, 'Europe': 0, 'Asia': 0, 'Other': 0 };
    allUserProfiles.forEach(u => {
      const region = u.region || '';
      if (region.includes('America') || region.includes('US') || region.includes('Canada')) counts['North America']++;
      else if (region.includes('Europe') || region.includes('UK') || region.includes('Germany') || region.includes('France')) counts['Europe']++;
      else if (region.includes('Asia') || region.includes('India') || region.includes('China') || region.includes('Japan')) counts['Asia']++;
      else counts['Other']++;
    });
    return counts;
  }, [allUserProfiles]);

  // Recently joined users (last 7 days)
  const recentJoins = React.useMemo(() => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return allUserProfiles
      .filter(u => new Date(u.created_date) > sevenDaysAgo)
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  }, [allUserProfiles]);

  // Seed demo data once for Mathues
  React.useEffect(() => {
    (async () => {
      try {
        const key = 'rankDemoSeeded_v1';
        if (!profile?.user_id) return;
        if (typeof window !== 'undefined' && localStorage.getItem(key)) return;
        const me = await base44.auth.me();
        if (!me || (me.email || '').toLowerCase() !== 'germaintrust@gmail.com') return;
        await base44.functions.invoke('seedRankDemo', { target_email: me.email });
        try { localStorage.setItem(key, '1'); } catch {}
        queryClient.invalidateQueries({ queryKey: ['rpEvents', profile.user_id] });
        queryClient.invalidateQueries({ queryKey: ['trustEvents', profile.user_id] });
      } catch (e) {
        console.warn('Seed demo failed', e);
      }
    })();
  }, [profile?.user_id]);

  return (
    <>
      {/* Hover handle when collapsed */}
      {!isOpen &&
      <div
        onMouseEnter={() => onToggle?.()}
        className={cn("fixed top-1/2 -translate-y-1/2 z-40 bg-violet-600/80 hover:bg-violet-700 cursor-pointer", dockSide === 'right' ? "rounded-l-lg" : "rounded-r-lg")}
        style={{ width: '10px', height: '140px', right: dockSide === 'right' ? 0 : 'auto', left: dockSide === 'left' ? 0 : 'auto' }}
        title="Open panel" />

      }
      <div
        className={cn(
          "fixed top-0 h-screen bg-white border-slate-200 shadow-xl z-50 transition-all duration-300 flex flex-col",
          dockSide === 'left' ? "border-r" : "border-l",
          isOpen ? "w-80" : "w-0 overflow-hidden"
        )}
        style={{ top: topOffset, height: `calc(100vh - ${topOffset}px)`, right: dockSide === 'right' ? 0 : 'auto', left: dockSide === 'left' ? 0 : 'auto' }}>

      {/* Drag Handle */}
      <div
          onMouseDown={onDragStart}
          className="h-5 cursor-move bg-slate-100 border-b border-slate-200 flex items-center justify-center text-[10px] text-slate-400"
          title="Drag to move. Drag toward an edge to dock.">

        Drag
      </div>

      {/* Toggle Button */}
      <button
          onClick={onToggle}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 w-10 h-20 bg-white border border-slate-200 flex items-center justify-center shadow-md hover:bg-slate-50 transition-colors",
            dockSide === 'right' ? "-left-10 rounded-l-xl border-r-0" : "-right-10 rounded-r-xl border-l-0"
          )}>

        {dockSide === 'right' ?
          isOpen ? <ChevronRight className="w-5 h-5 text-slate-600" /> : <ChevronLeft className="w-5 h-5 text-slate-600" /> :
          isOpen ? <ChevronLeft className="w-5 h-5 text-slate-600" /> : <ChevronRight className="w-5 h-5 text-slate-600" />
          }
      </button>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Control Panel */}
          <div data-ggg-controls className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="rounded-lg btn-ctrl" onClick={() => setGggAuditOpen(true)}>
                <Activity className="w-4 h-4 mr-1" />
                Audit
              </Button>
              <Button variant="outline" size="sm" className="rounded-lg btn-ctrl" onClick={() => setGggPopupOpen(true)}>
                <TrendingUp className="w-4 h-4 mr-1" />
                Rank
              </Button>
              <Button variant="outline" size="sm" className="rounded-lg btn-ctrl" onClick={() => setGggTxOpen(true)}>
                <List className="w-4 h-4 mr-1" />
                Transactions
              </Button>
              <Button variant="outline" size="sm" className="rounded-lg btn-ctrl" onClick={() => {window.location.href = createPageUrl('DailyOps');}}>
                <Calendar className="w-4 h-4 mr-1" />
                Daily Ops
              </Button>
            </div>
            <div className="text-xs text-slate-600">
              Next rank in <span className="font-semibold text-violet-700">{Math.max(0, nextRankAt - rankProgress)}</span> pts
            </div>
          </div>

          {/* GGG & Rank */}
          <CollapsibleCard title="GGG & Rank" icon={Coins} onPopout={() => setGggPopupOpen(true)}>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-medium text-violet-600 uppercase tracking-wider">GGG Balance</p>
                  <p className="text-2xl font-bold text-violet-900 flex items-center gap-1.5">
                    <Coins className="w-5 h-5 text-amber-500" />
                    {walletAvailable?.toLocaleString?.() || 0}
                  </p>
                </div>
                <ProgressRing
                    value={rankProgress}
                    max={nextRankAt}
                    size={64}
                    strokeWidth={5}
                    label={profile?.rank_code?.charAt(0).toUpperCase()}
                    sublabel="Rank" />

              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">To next rank</span>
                <span className="font-medium text-violet-700">{Math.max(0, nextRankAt - rankProgress)} pts</span>
              </div>
              <div className="flex justify-between mt-3">
                <Button variant="outline" size="sm" className="bg-fuchsia-300 px-3 text-xs font-medium rounded-lg inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input shadow-sm hover:bg-accent hover:text-accent-foreground h-8" onClick={() => setWalletPopupOpen(true)}>
                  Open Wallet
                </Button>
                <Button variant="outline" size="sm" className="rounded-lg" onClick={() => setGggAuditOpen(true)}>
                  View audit trail
                </Button>
              </div>
            </div>
          </CollapsibleCard>

          <CollapsibleCard title="Online Now" icon={Users} onPopout={() => setOnlinePopupOpen(true)}>
            <div className="p-4 rounded-xl bg-slate-50 border">
              <p className="text-xs text-slate-500 mb-1">Online Now</p>
              <p className="text-2xl font-bold text-emerald-600 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {onlineUsers}
              </p>
              <p className="text-xs text-slate-400 mt-1">Updates every 10s</p>
            </div>
          </CollapsibleCard>

          <CollapsibleCard title="Users & Regions" icon={Users} onPopout={() => setUsersPopupOpen(true)}>
            <div className="p-4 rounded-xl bg-white border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Total Users</p>
                  <p className="text-2xl font-bold text-slate-900">{totalUsers}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-right">
                    <p className="text-xs text-slate-500">North America</p>
                    <p className="text-sm font-semibold text-slate-900">{regionCounts['North America']}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Europe</p>
                    <p className="text-sm font-semibold text-slate-900">{regionCounts['Europe']}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Asia</p>
                    <p className="text-sm font-semibold text-slate-900">{regionCounts['Asia']}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Other</p>
                    <p className="text-sm font-semibold text-slate-900">{regionCounts['Other']}</p>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleCard>

          <CollapsibleCard title="Recently Joined" icon={Users} badge={recentJoins.length} badgeColor="emerald" onPopout={() => setRecentJoinsPopupOpen(true)}>
            <div className="space-y-2">
              {recentJoins.length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center">No new members this week</p>
              ) : (
                recentJoins.slice(0, 5).map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      const event = new CustomEvent('openProfile', { detail: { userId: user.user_id } });
                      document.dispatchEvent(event);
                    }}
                    className="w-full flex items-center gap-3 p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 transition-colors text-left"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback className="bg-emerald-100 text-emerald-600 text-xs">
                        {user.display_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{user.display_name}</p>
                      <p className="text-xs text-slate-500">{format(parseISO(user.created_date), 'MMM d')}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </CollapsibleCard>

           {/* Today's Schedule */}
          <CollapsibleCard title="Today's Schedule" icon={Calendar} badge={meetings.length} badgeColor="blue" onPopout={() => setSchedulePopupOpen(true)}>
            <div className="space-y-2">
              {meetings.length === 0 ?
                <p className="text-sm text-slate-400 py-4 text-center">No meetings today</p> :

                meetings.slice(0, 4).map((meeting, i) =>
                <button
                  key={i}
                  onClick={() => onMeetingAction?.('view', meeting)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-left">

                    <div className="p-2 rounded-lg bg-blue-100">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{meeting.title}</p>
                      <p className="text-xs text-slate-500">{formatTime(meeting.scheduled_time)}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </button>
                )
                }
            </div>
          </CollapsibleCard>

          {/* Top Matches */}
          <CollapsibleCard title="Top Matches" icon={Sparkles} badge={matches.length} badgeColor="violet" onPopout={() => setMatchesPopupOpen(true)}>
            <div className="space-y-2">
              {matches.length === 0 ?
                <p className="text-sm text-slate-400 py-4 text-center">No matches yet</p> :

                matches.slice(0, 5).map((match, i) => {
                  const handleClick = () => {
                    if (match.target_type === 'person') {
                      const event = new CustomEvent('openProfile', { detail: { userId: match.target_id } });
                      document.dispatchEvent(event);
                    } else if (match.target_type === 'offer') {
                      window.location.href = '/Marketplace';
                    } else if (match.target_type === 'mission') {
                      window.location.href = '/Missions';
                    } else if (match.target_type === 'event') {
                      window.location.href = '/Meetings';
                    } else {
                      onMatchAction?.('view', match);
                    }
                  };

                  return (
                    <button
                      key={i}
                      onClick={handleClick}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-violet-50 hover:border-violet-200 border border-transparent transition-colors text-left">

                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          if (match.target_type === 'person') {
                            const event = new CustomEvent('openProfile', { detail: { userId: match.target_id } });
                            document.dispatchEvent(event);
                          }
                        }}
                        data-user-id={match.target_type === 'person' ? match.target_id : null}>
                      </div>
                      <div className="flex-1 min-w-0">
                        {match.target_type === 'person' ? (
                          <MiniProfile userId={match.target_id} name={match.target_name} avatar={match.target_avatar} size={36} />
                        ) : (
                          <>
                            <p className="text-sm font-medium text-slate-900 truncate">{match.target_name}</p>
                            <p className="text-xs text-slate-500 truncate">{match.target_subtitle}</p>
                          </>
                        )}
                      </div>
                      <div className="text-sm font-bold text-violet-600">{match.match_score}%</div>
                    </button>);

                })
                }
            </div>
          </CollapsibleCard>


          {/* Help */}
          <CollapsibleCard title="Help" icon={HelpCircle} defaultOpen={false} onPopout={() => setHelpPopupOpen(true)}>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-slate-200">
                  <HelpCircle className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Need help?</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Learn how the Synchronicity Engine finds your perfect matches.
                  </p>
                  <Button variant="link" size="sm" className="h-6 px-0 text-xs text-violet-600">
                    View guide →
                  </Button>
                </div>
              </div>
            </div>
          </CollapsibleCard>

          {/* Community Feed */}
          <CollapsibleCard title="Community Feed" icon={MessageCircle} defaultOpen={true} onPopout={() => setFeedPopupOpen(true)}>
            {/* Create Post */}
            <div className="mb-4 p-4 rounded-xl bg-white border border-slate-200 space-y-3">
              <div className="flex items-start gap-3">
                <Avatar className="w-9 h-9 cursor-pointer" data-user-id={profile?.user_id}>
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-violet-100 text-violet-600 text-sm">
                    {profile?.display_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Textarea
                    value={newPostText}
                    onChange={(e) => setNewPostText(e.target.value)}
                    placeholder="What's on your mind?"
                    className="flex-1 resize-none text-sm"
                    rows={3} />

              </div>
              {/* Video & Audio upload */}
              <div className="flex items-center gap-3 flex-wrap">
                <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 cursor-pointer transition-colors text-xs text-slate-600">
                  <Video className="w-4 h-4" />
                  Video
                  <input type="file" accept="video/*" onChange={onVideoChange} className="hidden" />
                </label>
                <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 cursor-pointer transition-colors text-xs text-slate-600">
                  <Mic className="w-4 h-4" />
                  Audio
                  <input type="file" accept="audio/mp3,audio/mpeg,audio/*" onChange={onAudioChange} className="hidden" />
                </label>
                {videoError && <span className="text-xs text-rose-600">{videoError}</span>}
              </div>
              {videoPreview && !videoError &&
                <video src={videoPreview} controls className="w-full rounded-lg" />
                }
              {audioPreview &&
                <audio src={audioPreview} controls className="w-full" />
                }
              <div className="flex items-center justify-between">
                <EmojiPicker onSelect={(e) => setNewPostText((prev) => (prev || '') + e)} />
                <Button
                    onClick={handleCreatePost}
                    disabled={(!newPostText.trim() && !videoFile && !audioFile) || createPostMutation.isPending}
                    className="bg-violet-600 hover:bg-violet-700"
                    size="sm">

                  <Send className="w-3 h-3 mr-1" />
                  Post
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {posts.length === 0 ?
                <p className="text-sm text-slate-400 py-4 text-center">No posts yet</p> :

                posts.map((post) => {
                  const postComments = computePostComments(post.id);
                  const isLiked = isLikedByUser(post.id);
                  const showComments = expandedComments[post.id];

                  return (
                    <div key={post.id} className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                      {/* Post Header */}
                      <div className="flex items-center justify-between gap-3">
                        <MiniProfile userId={post.author_id} name={post.author_name} avatar={post.author_avatar} size={36} />
                        <p className="text-xs text-slate-500">
                          {format(parseISO(post.created_date), 'MMM d, h:mm a')}
                        </p>
                      </div>

                      {/* Post Content */}
                      <p className="text-sm text-slate-700 leading-relaxed">{post.content}</p>

                      {post.video_url ?
                      <video src={post.video_url} controls className="w-full rounded-lg" /> :
                      post.audio_url ?
                      <audio src={post.audio_url} controls className="w-full" /> :
                      post.image_urls && post.image_urls.length > 0 ?
                      <img src={post.image_urls[0]} alt="" className="w-full rounded-lg" /> :
                      null}

                      {/* Post Actions */}
                      <div className="flex items-center gap-4 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => handleLike(post.id)}
                          className={cn(
                            "flex items-center gap-1.5 text-xs transition-colors",
                            isLiked ? "text-rose-600" : "text-slate-500 hover:text-rose-600"
                          )}>

                          <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
                          <span className="font-medium">{post.likes_count || 0}</span>
                        </button>
                        <button
                          onClick={() => setExpandedComments({ ...expandedComments, [post.id]: !showComments })}
                          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-violet-600 transition-colors">

                          <MessageCircle className="w-4 h-4" />
                          <span className="font-medium">{post.comments_count || 0}</span>
                        </button>
                        <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors">
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Comments Section */}
                      {showComments &&
                      <div className="space-y-3 pt-2">
                          {/* Existing Comments */}
                          {postComments.map((comment) =>
                        <div key={comment.id} className="flex items-start gap-2">
                              <Avatar className="w-7 h-7 cursor-pointer hover:ring-2 hover:ring-violet-300 transition-all" data-user-id={comment.author_id}>
                                <AvatarImage src={comment.author_avatar} />
                                <AvatarFallback className="bg-slate-100 text-slate-600 text-xs">
                                  {comment.author_name?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 p-2 rounded-lg bg-slate-50">
                                <p className="text-xs font-medium text-slate-900">{comment.author_name}</p>
                                <p className="text-xs text-slate-700 mt-0.5">{comment.content}</p>
                              </div>
                            </div>
                        )}

                          {/* Comment Input */}
                          <div className="flex items-start gap-2">
                            <Avatar className="w-7 h-7 cursor-pointer" data-user-id={profile?.user_id}>
                              <AvatarImage src={profile?.avatar_url} />
                              <AvatarFallback className="bg-violet-100 text-violet-600 text-xs">
                                {profile?.display_name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 flex items-end gap-2">
                              <Textarea
                              value={commentText[post.id] || ''}
                              onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
                              placeholder="Write a comment..."
                              className="text-xs h-8 resize-none"
                              rows={1} />

                              <EmojiPicker onSelect={(e) => setCommentText({ ...commentText, [post.id]: (commentText[post.id] || '') + e })} />
                              <Button
                              size="sm"
                              onClick={() => handleComment(post.id)}
                              disabled={!commentText[post.id]?.trim()}
                              className="h-8 w-8 p-0">

                                <Send className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      }
                    </div>);

                })
                }
            </div>
          </CollapsibleCard>
        </div>
      {/* Popout Panels */}
      {gggPopupOpen &&
          <FloatingPanel title="GGG & Rank" onClose={() => setGggPopupOpen(false)}>
          <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-medium text-violet-600 uppercase tracking-wider">GGG Balance</p>
                <p className="text-2xl font-bold text-violet-900 flex items-center gap-1.5">
                  <Coins className="w-5 h-5 text-amber-500" />
                  {walletAvailable?.toLocaleString?.() || 0}
                </p>
              </div>
              <ProgressRing
                  value={rankProgress}
                  max={nextRankAt}
                  size={64}
                  strokeWidth={5}
                  label={profile?.rank_code?.charAt(0).toUpperCase()}
                  sublabel="Rank" />

            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">To next rank</span>
              <span className="font-medium text-violet-700">{Math.max(0, nextRankAt - rankProgress)} pts</span>
            </div>
            <div className="flex justify-between mt-3">
              <Button variant="outline" size="sm" className="rounded-lg" onClick={() => setWalletPopupOpen(true)}>
                Open Wallet
              </Button>
              <Button variant="outline" size="sm" className="rounded-lg" onClick={() => setGggAuditOpen(true)}>
                View audit trail
              </Button>
            </div>
          {/* Rank Progress Log */}
          <div className="mt-4">
            <div className="text-sm font-semibold text-slate-800 mb-2">Rank Progress Log</div>
            {rankMilestones.length === 0 ? (
              <p className="text-xs text-slate-500">No milestones yet</p>
            ) : (
              <div className="space-y-2">
                {rankMilestones.map(({ tier, event }) => (
                  <div key={tier.code} className="flex items-start gap-3 p-2 rounded-lg bg-white border border-slate-200">
                    <div className="w-2 h-2 rounded-full bg-violet-500 mt-2" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-slate-900 capitalize">Reached {tier.title}</div>
                        <div className="text-xs text-slate-500">{format(parseISO(event.created_date), 'MMM d, h:mm a')}</div>
                      </div>
                      <div className="text-xs text-slate-600">{event.reason_code?.replace(/_/g, ' ') || 'progress'}</div>
                      {event.description && <div className="text-[11px] text-slate-500 mt-0.5">{event.description}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          </div>
          </FloatingPanel>
          }

          {gggAuditOpen &&
          <FloatingPanel title="GGG Audit Trail" onClose={() => setGggAuditOpen(false)}>
          <div className="space-y-2">
            {auditItems.length === 0 ?
              <p className="text-sm text-slate-400 py-4 text-center">No audit entries yet</p> :

              auditItems.map((item) => {
                const isGGG = item._type === 'ggg';
                const isRP = item._type === 'rp';
                const isTrust = item._type === 'trust';
                const positive = (item.delta || 0) >= 0;
                return (
                  <div key={`${item._type}-${item.id}`} className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200">
                    <div className={`p-2 rounded-lg ${isGGG ? 'bg-amber-100' : isTrust ? (positive ? 'bg-blue-100' : 'bg-blue-50') : positive ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                      {isGGG ? (
                        <Coins className="w-4 h-4 text-amber-600" />
                      ) : isTrust ? (
                        <Activity className="w-4 h-4 text-blue-600" />
                      ) : positive ? (
                        <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-rose-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-900">
                          {isGGG ? item.reason_code || 'GGG transaction' : item.reason_code || 'Reputation update'}
                        </p>
                        <span className={`text-sm font-semibold ${isGGG ? positive ? 'text-amber-700' : 'text-slate-700' : positive ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {positive ? '+' : ''}{item.delta}{isGGG ? ' GGG' : isRP ? ' RP' : ' Trust'}{isRP && item.rp_after != null ? ` • ${item.rp_after} RP` : ''}{isTrust && item.score_after != null ? ` • ${item.score_after} Trust` : ''}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {isGGG ? (item.source_type || 'reward') : isTrust ? (item.source_type || 'system') : (item.source_type || 'system')}
                        {item.reason_code ? ` • ${item.reason_code}` : ''}
                      </p>
                      {item.description &&
                      <p className="text-xs text-slate-600 mt-1">{item.description}</p>
                      }
                      {isTrust && item.metrics && (
                        <p className="text-[11px] text-slate-500 mt-1">
                          Metrics: {Object.entries(item.metrics).map(([k, v]) => `${k}: ${v}`).join(', ')}
                        </p>
                      )}
                      <p className="text-[11px] text-slate-400 mt-1">
                        {format(parseISO(item.created_date), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>);

              })
              }
          </div>
        </FloatingPanel>
          }

        {gggTxOpen &&
          <FloatingPanel title="GGG Transactions" onClose={() => setGggTxOpen(false)}>
           <div className="space-y-2">
             {(gggTx || []).length === 0 ?
              <p className="text-sm text-slate-400 py-4 text-center">No transactions</p> :

              gggTx.map((tx) => {
                const positive = (tx.delta || 0) >= 0;
                return (
                  <div key={tx.id} className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200">
                     <div className="p-2 rounded-lg bg-amber-100">
                       <Coins className="w-4 h-4 text-amber-600" />
                     </div>
                     <div className="flex-1 min-w-0">
                       <div className="flex items-center justify-between">
                         <p className="text-sm font-medium text-slate-900">{tx.reason_code || 'Transaction'}</p>
                         <span className={`text-sm font-semibold ${positive ? 'text-amber-700' : 'text-slate-700'}`}>
                           {positive ? '+' : ''}{tx.delta} GGG
                         </span>
                       </div>
                       <p className="text-xs text-slate-500">
                         {tx.source_type || 'reward'}{tx.source_id ? ` • #${tx.source_id}` : ''}
                       </p>
                       {tx.description && <p className="text-xs text-slate-600 mt-1">{tx.description}</p>}
                       <p className="text-[11px] text-slate-400 mt-1">{format(parseISO(tx.created_date), 'MMM d, h:mm a')}</p>
                     </div>
                   </div>);

              })
              }
           </div>
         </FloatingPanel>
          }

         {walletPopupOpen &&
          <FloatingPanel title="My Wallet" onClose={() => setWalletPopupOpen(false)}>
             <WalletPanel />
           </FloatingPanel>
          }

         {schedulePopupOpen &&
          <FloatingPanel title="Today's Schedule" onClose={() => setSchedulePopupOpen(false)}>
          <div className="space-y-2">
            {meetings.length === 0 ?
              <p className="text-sm text-slate-400 py-4 text-center">No meetings today</p> :

              meetings.map((meeting, i) =>
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{meeting.title}</p>
                    <p className="text-xs text-slate-500">{formatTime(meeting.scheduled_time)}</p>
                  </div>
                </div>
              )
              }
          </div>
        </FloatingPanel>
          }

      {matchesPopupOpen &&
          <FloatingPanel title="Top Matches" onClose={() => setMatchesPopupOpen(false)}>
          <div className="space-y-2">
            {matches.length === 0 ?
              <p className="text-sm text-slate-400 py-4 text-center">No matches yet</p> :

              matches.map((match, i) =>
              <div key={i} className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                  <Avatar className="w-9 h-9">
                    <AvatarImage src={match.target_avatar} />
                    <AvatarFallback className="bg-violet-100 text-violet-600 text-sm">
                      {match.target_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{match.target_name}</p>
                    <p className="text-xs text-slate-500 truncate">{match.target_subtitle}</p>
                  </div>
                  <div className="text-sm font-bold text-violet-600">{match.match_score}%</div>
                </div>
              )
              }
          </div>
        </FloatingPanel>
          }

      {helpPopupOpen &&
          <FloatingPanel title="Help" onClose={() => setHelpPopupOpen(false)}>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-slate-200">
                <HelpCircle className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Need help?</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Learn how the Synchronicity Engine finds your perfect matches.
                </p>
                <Button variant="link" size="sm" className="h-6 px-0 text-xs text-violet-600">
                  View guide →
                </Button>
              </div>
            </div>
          </div>
        </FloatingPanel>
          }

      {onlinePopupOpen &&
          <FloatingPanel title="Online Now" onClose={() => setOnlinePopupOpen(false)}>
            <div className="p-4 rounded-xl bg-slate-50 border">
              <p className="text-xs text-slate-500 mb-1">Currently Online</p>
              <p className="text-3xl font-bold text-emerald-600 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                {onlineUsers}
              </p>
              <p className="text-sm text-slate-500 mt-2">out of {totalUsers} total users</p>
              <p className="text-xs text-slate-400 mt-1">Updates every 10 seconds</p>
            </div>
          </FloatingPanel>
          }

      {usersPopupOpen &&
          <FloatingPanel title="Users & Regions" onClose={() => setUsersPopupOpen(false)}>
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-slate-900">{totalUsers}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-slate-50">
                  <p className="text-xs text-slate-500">North America</p>
                  <p className="text-xl font-semibold text-slate-900">{regionCounts['North America']}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50">
                  <p className="text-xs text-slate-500">Europe</p>
                  <p className="text-xl font-semibold text-slate-900">{regionCounts['Europe']}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50">
                  <p className="text-xs text-slate-500">Asia</p>
                  <p className="text-xl font-semibold text-slate-900">{regionCounts['Asia']}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50">
                  <p className="text-xs text-slate-500">Other</p>
                  <p className="text-xl font-semibold text-slate-900">{regionCounts['Other']}</p>
                </div>
              </div>
            </div>
          </FloatingPanel>
          }

      {recentJoinsPopupOpen &&
          <FloatingPanel title="Recently Joined" onClose={() => setRecentJoinsPopupOpen(false)}>
            <div className="space-y-2">
              <p className="text-xs text-slate-500 mb-3">{recentJoins.length} new members in the last 7 days</p>
              {recentJoins.length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center">No new members this week</p>
              ) : (
                recentJoins.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      const event = new CustomEvent('openProfile', { detail: { userId: user.user_id } });
                      document.dispatchEvent(event);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 transition-colors text-left"
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback className="bg-emerald-100 text-emerald-600 text-sm">
                        {user.display_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{user.display_name}</p>
                      <p className="text-xs text-slate-500">Joined {format(parseISO(user.created_date), 'MMM d, yyyy')}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </FloatingPanel>
          }

      {feedPopupOpen &&
          <FloatingPanel title="Community Feed" onClose={() => setFeedPopupOpen(false)}>
          <div className="space-y-4">
            {/* Create Post */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
              <div className="flex items-start gap-3">
                <Avatar className="w-9 h-9">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-violet-100 text-violet-600 text-sm">
                    {profile?.display_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Textarea
                    value={newPostText}
                    onChange={(e) => setNewPostText(e.target.value)}
                    placeholder="What's on your mind?"
                    className="flex-1 resize-none text-sm"
                    rows={3} />

              </div>
              {/* Video & Audio upload */}
              <div className="flex items-center gap-3 flex-wrap">
                <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 cursor-pointer transition-colors text-xs text-slate-600">
                  <Video className="w-4 h-4" />
                  Video
                  <input type="file" accept="video/*" onChange={onVideoChange} className="hidden" />
                </label>
                <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 cursor-pointer transition-colors text-xs text-slate-600">
                  <Mic className="w-4 h-4" />
                  Audio
                  <input type="file" accept="audio/mp3,audio/mpeg,audio/*" onChange={onAudioChange} className="hidden" />
                </label>
                {videoError && <span className="text-xs text-rose-600">{videoError}</span>}
              </div>
              {videoPreview && !videoError &&
                <video src={videoPreview} controls className="w-full rounded-lg" />
              }
              {audioPreview &&
                <audio src={audioPreview} controls className="w-full" />
              }
              <div className="flex items-center justify-between">
                <EmojiPicker onSelect={(e) => setNewPostText((prev) => (prev || '') + e)} />
                <Button
                    onClick={handleCreatePost}
                    disabled={(!newPostText.trim() && !videoFile && !audioFile) || createPostMutation.isPending}
                    className="bg-violet-600 hover:bg-violet-700"
                    size="sm">

                  <Send className="w-3 h-3 mr-1" />
                  Post
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              {posts.length === 0 ?
                <p className="text-sm text-slate-400 py-4 text-center">No posts yet</p> :

                posts.map((post) => {
                  const postComments = computePostComments(post.id);
                  const isLiked = isLikedByUser(post.id);
                  const showComments = expandedComments[post.id];
                  return (
                    <div key={post.id} className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <MiniProfile userId={post.author_id} name={post.author_name} avatar={post.author_avatar} size={36} />
                        <p className="text-xs text-slate-500">{format(parseISO(post.created_date), 'MMM d, h:mm a')}</p>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">{post.content}</p>
                      {post.video_url ?
                      <video src={post.video_url} controls className="w-full rounded-lg" /> :
                      post.audio_url ?
                      <audio src={post.audio_url} controls className="w-full" /> :
                      post.image_urls && post.image_urls.length > 0 ?
                      <img src={post.image_urls[0]} alt="" className="w-full rounded-lg" /> :
                      null}
                      <div className="flex items-center gap-4 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => handleLike(post.id)}
                          className={cn("flex items-center gap-1.5 text-xs transition-colors", isLiked ? "text-rose-600" : "text-slate-500 hover:text-rose-600")}>

                          <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
                          <span className="font-medium">{post.likes_count || 0}</span>
                        </button>
                        <button
                          onClick={() => setExpandedComments({ ...expandedComments, [post.id]: !showComments })}
                          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-violet-600 transition-colors">

                          <MessageCircle className="w-4 h-4" />
                          <span className="font-medium">{post.comments_count || 0}</span>
                        </button>
                        <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors">
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                      {showComments &&
                      <div className="space-y-3 pt-2">
                          {postComments.map((comment) =>
                        <div key={comment.id} className="flex items-start gap-2">
                              <Avatar className="w-7 h-7">
                                <AvatarImage src={comment.author_avatar} />
                                <AvatarFallback className="bg-slate-100 text-slate-600 text-xs">
                                  {comment.author_name?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 p-2 rounded-lg bg-slate-50">
                                <p className="text-xs font-medium text-slate-900">{comment.author_name}</p>
                                <p className="text-xs text-slate-700 mt-0.5">{comment.content}</p>
                              </div>
                            </div>
                        )}
                          <div className="flex items-start gap-2">
                            <Avatar className="w-7 h-7">
                              <AvatarImage src={profile?.avatar_url} />
                              <AvatarFallback className="bg-violet-100 text-violet-600 text-xs">
                                {profile?.display_name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 flex items-end gap-2">
                             <Textarea
                              value={commentText[post.id] || ''}
                              onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
                              placeholder="Write a comment..."
                              className="text-xs h-8 resize-none"
                              rows={1} />

                             <EmojiPicker onSelect={(e) => setCommentText({ ...commentText, [post.id]: (commentText[post.id] || '') + e })} />
                             <Button size="sm" onClick={() => handleComment(post.id)} disabled={!commentText[post.id]?.trim()} className="h-8 w-8 p-0">
                               <Send className="w-3 h-3" />
                             </Button>
                            </div>
                          </div>
                        </div>
                      }
                    </div>);

                })
                }
            </div>
          </div>
        </FloatingPanel>
          }
      </ScrollArea>
    </div>
  </>);

}