import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import FloatingPanel from '@/components/hud/FloatingPanel';
import { getRPRank } from '@/components/reputation/rpUtils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  LayoutDashboard,
  Users,
  Calendar,
  Target,
  ShoppingBag,
  Radio,
  CircleDot,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  MessageCircle,
  Wifi,
  Moon,
  Focus,
  Trophy,
  Crown,
  TrendingUp,
  ExternalLink,
  Sun,
  Folder,
  Lock,
  Info,
  User,
  Terminal,
  Share2,
  Maximize2,
  Move,
  PanelLeft,
  Zap,
  Star,
  Ban,
  Waves,
  Cloud,
  Shield,
  Eye
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const NAV_ITEMS = [
  { id: 'command', label: 'Command Deck', icon: LayoutDashboard, page: 'CommandDeck', hint: 'Your main dashboard and overview' },
  { id: 'forum', label: 'Community Forum', icon: MessageCircle, page: 'Forum', hint: 'Discuss, share, and connect with the community' },
  { id: 'initiations', label: 'Initiations', icon: Eye, page: 'Initiations', hint: 'Sacred pathways, 144K Activation & 7th Seal initiations' },
  { id: 'quests', label: 'Quests', icon: Target, page: 'Quests', hint: 'Quest system, badges, leaderboards & sacred connections' },
  { id: 'synchronicity', label: 'Synchronicity Engine', icon: Sparkles, page: 'SynchronicityEngine', hint: 'Share and discover meaningful coincidences' },
  { id: 'gamification', label: 'Gamification', icon: Trophy, page: 'Gamification', hint: 'Challenges, achievements, and leaderboards' },
  { id: 'matches', label: 'Matches', icon: Sparkles, page: 'Matches', hint: 'AI-powered connections based on your profile' },
  { id: 'meetings', label: 'Meetings', icon: Calendar, page: 'Meetings', hint: 'Schedule and manage your meetings' },
  { id: 'missions', label: 'Missions', icon: Target, page: 'Missions', hint: 'Join collaborative missions and quests' },
  { id: 'teams', label: 'Teams & Guilds', icon: Shield, page: 'Teams', hint: 'Form teams for collaborative missions' },
  { id: 'projects', label: 'Projects', icon: Folder, page: 'Projects', hint: 'Manage and discover projects' },
  { id: 'profiles', label: 'Profiles', icon: User, page: 'Profiles', hint: 'Discover members by rank and expertise' },
  { id: 'crm', label: 'Contact Network', icon: Users, page: 'CRM', hint: 'Federated CRM with trust-gated sharing' },
  { id: 'activity', label: 'Activity Feed', icon: TrendingUp, page: 'ActivityFeed', hint: 'See recent community activity' },
  { id: 'collaborators', label: 'Collaborators', icon: Users, page: 'FindCollaborators', hint: 'Find people to work with' },
  { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, page: 'Marketplace', hint: 'Browse and list services' },
  { id: 'messages', label: 'Messages', icon: MessageCircle, page: 'Messages', hint: 'Direct and group conversations' },
  { id: 'events', label: 'Events', icon: Calendar, page: 'Events', hint: 'Discover and create meetups' },
  { id: 'leader', label: 'Leader Channel', icon: Radio, page: 'LeaderChannel', hint: 'Exclusive channel for verified leaders' },
  { id: 'circles', label: 'Circles', icon: CircleDot, page: 'Circles', hint: 'Join interest and value-based communities' },
  { id: 'studio', label: 'Creator Studio', icon: Users, page: 'Studio', hint: 'Manage your offerings, content, and subscriptions' },
  { id: 'affiliate', label: 'Affiliate Center', icon: Share2, page: 'AffiliateCenter', hint: 'Share your referral link and track referrals' },
  { id: 'settings', label: 'Settings', icon: Settings, page: 'Settings', hint: 'Account and app preferences' },
];

const STATUS_OPTIONS = [
  { value: 'online', label: 'Online', icon: Wifi, color: 'bg-emerald-500' },
  { value: 'focus', label: 'Focus', icon: Focus, color: 'bg-amber-500' },
  { value: 'dnd', label: 'Do Not Disturb', icon: Moon, color: 'bg-rose-500' },
];

const DM_POLICY_OPTIONS = [
  { value: 'everyone', label: 'Everyone' },
  { value: 'followers', label: 'Followers' },
  { value: 'mutual', label: 'Mutual Only' },
  { value: 'none', label: 'Nobody' },
];

export default function Sidebar({ 
  isCollapsed, 
  onToggle, 
  currentPage,
  profile,
  onStatusChange,
  onDMPolicyChange,
  theme,
  onThemeToggle
}) {
  const [status, setStatus] = useState(profile?.status || 'online');
  const [dmPolicy, setDMPolicy] = useState(profile?.dm_policy || 'everyone');
  const [leaderboardOpen, setLeaderboardOpen] = useState(true);
  const [leadersPopupOpen, setLeadersPopupOpen] = useState(false);
  const [navPopupOpen, setNavPopupOpen] = useState(false);
  const [presencePopupOpen, setPresencePopupOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(true);
  const [presenceOpen, setPresenceOpen] = useState(true);
  const [themeOpen, setThemeOpen] = useState(false);
  const [bgEffectOpen, setBgEffectOpen] = useState(false);
  const [bgEffect, setBgEffect] = useState(() => {
    try { return localStorage.getItem('bgEffect') || 'matrix'; } catch { return 'matrix'; }
  });
  const [matrixSpeed, setMatrixSpeed] = useState(() => {
    try { return parseFloat(localStorage.getItem('matrixSpeed')) || 1; } catch { return 1; }
  });
  const [matrixBrightness, setMatrixBrightness] = useState(() => {
    try { return parseFloat(localStorage.getItem('matrixBrightness')) || 0.8; } catch { return 0.8; }
  });
  const [matrixVariance, setMatrixVariance] = useState(() => {
    try { return parseFloat(localStorage.getItem('matrixVariance')) || 0.5; } catch { return 0.5; }
  });
  const isDark = theme === 'dark';

  // Persist background effect and dispatch event for Layout
  React.useEffect(() => {
    try { localStorage.setItem('bgEffect', bgEffect); } catch {}
    document.dispatchEvent(new CustomEvent('bgEffectChange', { detail: { effect: bgEffect } }));
  }, [bgEffect]);

  // Persist and dispatch matrix settings
  React.useEffect(() => {
    try { localStorage.setItem('matrixSpeed', String(matrixSpeed)); } catch {}
    document.dispatchEvent(new CustomEvent('matrixSettingsChange', { detail: { speed: matrixSpeed, brightness: matrixBrightness } }));
  }, [matrixSpeed, matrixBrightness]);

  React.useEffect(() => {
    try { localStorage.setItem('matrixBrightness', String(matrixBrightness)); } catch {}
    document.dispatchEvent(new CustomEvent('matrixSettingsChange', { detail: { speed: matrixSpeed, brightness: matrixBrightness, variance: matrixVariance } }));
  }, [matrixBrightness]);

  React.useEffect(() => {
    try { localStorage.setItem('matrixVariance', String(matrixVariance)); } catch {}
    document.dispatchEvent(new CustomEvent('matrixSettingsChange', { detail: { speed: matrixSpeed, brightness: matrixBrightness, variance: matrixVariance } }));
  }, [matrixVariance]);

  // Pop-off state
  const [isPoppedOff, setIsPoppedOff] = useState(false);
  const [popPosition, setPopPosition] = useState({ x: 50, y: 50 });
  const [popSize, setPopSize] = useState({ width: 280, height: 600 });
  const popDragRef = React.useRef({ startX: 0, startY: 0, startPosX: 0, startPosY: 0 });
  const resizeRef = React.useRef({ startX: 0, startY: 0, startW: 0, startH: 0, edge: '' });

  // Load pop-off state from localStorage
  React.useEffect(() => {
    try {
      const savedPop = localStorage.getItem('sidebarPoppedOff');
      if (savedPop === 'true') setIsPoppedOff(true);
      const savedPos = localStorage.getItem('sidebarPopPosition');
      if (savedPos) setPopPosition(JSON.parse(savedPos));
      const savedSize = localStorage.getItem('sidebarPopSize');
      if (savedSize) setPopSize(JSON.parse(savedSize));
    } catch {}
  }, []);

  // Save pop-off state
  React.useEffect(() => {
    try {
      localStorage.setItem('sidebarPoppedOff', String(isPoppedOff));
      localStorage.setItem('sidebarPopPosition', JSON.stringify(popPosition));
      localStorage.setItem('sidebarPopSize', JSON.stringify(popSize));
    } catch {}
  }, [isPoppedOff, popPosition, popSize]);

  // Pop-off drag handlers
  const onPopDragMove = (e) => {
    const dx = e.clientX - popDragRef.current.startX;
    const dy = e.clientY - popDragRef.current.startY;
    setPopPosition({
      x: Math.max(0, Math.min(window.innerWidth - popSize.width, popDragRef.current.startPosX + dx)),
      y: Math.max(0, Math.min(window.innerHeight - 50, popDragRef.current.startPosY + dy))
    });
  };
  const onPopDragEnd = () => {
    document.removeEventListener('mousemove', onPopDragMove);
    document.removeEventListener('mouseup', onPopDragEnd);
  };
  const onPopDragStart = (e) => {
    e.preventDefault();
    popDragRef.current = { startX: e.clientX, startY: e.clientY, startPosX: popPosition.x, startPosY: popPosition.y };
    document.addEventListener('mousemove', onPopDragMove);
    document.addEventListener('mouseup', onPopDragEnd);
  };

  // Resize handlers
  const onResizeMove = (e) => {
    const dx = e.clientX - resizeRef.current.startX;
    const dy = e.clientY - resizeRef.current.startY;
    const edge = resizeRef.current.edge;
    let newW = resizeRef.current.startW;
    let newH = resizeRef.current.startH;
    let newX = popPosition.x;
    let newY = popPosition.y;

    if (edge.includes('e')) newW = Math.max(220, resizeRef.current.startW + dx);
    if (edge.includes('w')) {
      newW = Math.max(220, resizeRef.current.startW - dx);
      newX = resizeRef.current.startPosX + dx;
    }
    if (edge.includes('s')) newH = Math.max(300, resizeRef.current.startH + dy);
    if (edge.includes('n')) {
      newH = Math.max(300, resizeRef.current.startH - dy);
      newY = resizeRef.current.startPosY + dy;
    }

    setPopSize({ width: newW, height: newH });
    if (edge.includes('w') || edge.includes('n')) {
      setPopPosition({ x: newX, y: newY });
    }
  };
  const onResizeEnd = () => {
    document.removeEventListener('mousemove', onResizeMove);
    document.removeEventListener('mouseup', onResizeEnd);
  };
  const onResizeStart = (e, edge) => {
    e.preventDefault();
    e.stopPropagation();
    resizeRef.current = { 
      startX: e.clientX, 
      startY: e.clientY, 
      startW: popSize.width, 
      startH: popSize.height,
      startPosX: popPosition.x,
      startPosY: popPosition.y,
      edge 
    };
    document.addEventListener('mousemove', onResizeMove);
    document.addEventListener('mouseup', onResizeEnd);
  };

  React.useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', onPopDragMove);
      document.removeEventListener('mouseup', onPopDragEnd);
      document.removeEventListener('mousemove', onResizeMove);
      document.removeEventListener('mouseup', onResizeEnd);
    };
  }, []);

  // Ensure we have an email even if profile hasn't loaded yet
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });
  const messagesEmail = profile?.user_id || currentUser?.email;

  const { data: unreadMessages = [] } = useQuery({
    queryKey: ['unreadMessages', messagesEmail],
    queryFn: () => base44.entities.Message.filter({ to_user_id: messagesEmail, is_read: false }, '-created_date', 1000),
    enabled: !!messagesEmail,
    refetchInterval: 5000
  });

  const { data: topLeaders = [] } = useQuery({
    queryKey: ['topLeaders'],
    queryFn: () => base44.entities.UserProfile.list('-rank_points', 10),
    refetchInterval: 30000
  });

  // Ensure current user appears if their rank qualifies (or if not in initial 10 due to caching)
  const resolvedLeaders = React.useMemo(() => {
    const arr = Array.isArray(topLeaders) ? [...topLeaders] : [];
    if (profile?.user_id) {
      const exists = arr.some(l => l.user_id === profile.user_id);
      if (!exists) arr.push(profile);
    }
    return arr
      .sort((a, b) => (Number(b?.rank_points) || 0) - (Number(a?.rank_points) || 0))
      .slice(0, 10);
  }, [topLeaders, profile?.user_id, profile?.rank_points]);

  const handleStatusChange = (value) => {
    setStatus(value);
    onStatusChange?.(value);
  };

  const handleDMChange = (value) => {
    setDMPolicy(value);
    onDMPolicyChange?.(value);
  };

  const statusOption = STATUS_OPTIONS.find(s => s.value === status);

  // Render full sidebar content (reused in both docked and popped-off modes)
  const renderSidebarContent = (inPopup = false) => (
    <>
      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        {/* Nav Header with Popout */}
        {(!isCollapsed || inPopup) && (
          <div className="px-3 pt-2 pb-1">
            <button
              onClick={() => setNavPopupOpen(true)}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
              title="Pop out navigation"
            >
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Quick Nav</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        )}
        <div className={cn("px-3 py-2 flex items-center justify-between", isCollapsed && !inPopup && "justify-center px-1")}> 
          {(!isCollapsed || inPopup) && (
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Navigation</span>
          )}
          <button
            onClick={() => setNavOpen(!navOpen)}
            className={cn("p-1 rounded-md hover:bg-slate-50", isCollapsed && !inPopup && "w-full flex items-center justify-center")}
            aria-label={navOpen ? 'Collapse navigation' : 'Expand navigation'}
            title={navOpen ? 'Collapse' : 'Expand'}
          >
            {navOpen ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </button>
        </div>
        {navOpen && (
          <nav className={cn("p-3 pt-0 space-y-1", isCollapsed && !inPopup && "p-1 pt-0 space-y-0.5")}>
            <TooltipProvider delayDuration={200}>
              {NAV_ITEMS.map((item) => {
                const isActive = currentPage === item.id;
                const badgeValue = item.id === 'messages' ? (unreadMessages?.length || 0) : 0;
                const isLeaderLocked = item.id === 'leader' && profile?.leader_tier !== 'verified144k';
                const isLocked = item.locked || isLeaderLocked;
                const showExpanded = !isCollapsed || inPopup;
                
                const navLink = (
                  <Link
                    key={item.id}
                    to={isLocked ? '#' : createPageUrl(item.page)}
                    onClick={(e) => isLocked && e.preventDefault()}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative group",
                      isActive 
                        ? "bg-violet-100 text-violet-700" 
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                      isLocked && "opacity-60 cursor-not-allowed",
                      isCollapsed && !inPopup && "px-1.5 py-1.5 justify-center"
                    )}
                  >
                    <item.icon className={cn(
                      "w-5 h-5 shrink-0",
                      isActive ? "text-violet-600" : "text-slate-400 group-hover:text-slate-600"
                    )} />
                    {showExpanded && (
                      <>
                        <span className="font-medium text-sm">{item.label}</span>
                        {badgeValue > 0 && !isLocked && (
                          <Badge className="ml-auto bg-violet-600 text-white text-xs">
                            {badgeValue}
                          </Badge>
                        )}
                        {isLocked && (
                          <div className="ml-auto flex items-center gap-1">
                            <Lock className="w-3 h-3 text-slate-400" />
                            <Badge variant="outline" className="text-xs text-slate-500">
                              Locked
                            </Badge>
                          </div>
                        )}
                      </>
                    )}
                    {!showExpanded && badgeValue > 0 && !isLocked && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-violet-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {badgeValue}
                      </span>
                    )}
                    {!showExpanded && isLocked && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center">
                        <Lock className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </Link>
                );
                
                if (((isCollapsed && !inPopup) || item.hint) && !isLocked) {
                  return (
                    <Tooltip key={item.id}>
                      <TooltipTrigger asChild>
                        {navLink}
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <p className="text-sm font-medium">{item.label}</p>
                        {item.hint && <p className="text-xs text-slate-500">{item.hint}</p>}
                      </TooltipContent>
                    </Tooltip>
                  );
                }
                
                if (isLocked && item.id === 'leader') {
                  return (
                    <Tooltip key={item.id}>
                      <TooltipTrigger asChild>
                        {navLink}
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <div className="space-y-1">
                          <p className="font-medium text-sm">Leader Channel Locked</p>
                          <p className="text-xs text-slate-500">
                            Become a Verified 144k Leader to unlock.
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                }
                
                return navLink;
              })}
            </TooltipProvider>
          </nav>
        )}
      </div>

      {/* Leaderboard */}
      {(!isCollapsed || inPopup) && (
        <div className="border-t border-slate-100 p-3">
          <div className="mb-3 px-2">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setLeaderboardOpen(!leaderboardOpen)}
                className="flex items-center gap-2 hover:bg-slate-50 rounded-lg py-1 px-1 transition-colors"
              >
                <Trophy className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Top Leaders</span>
              </button>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={() => setLeadersPopupOpen(true)}
                  title="Pop out"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setLeaderboardOpen(!leaderboardOpen)}
                >
                  {leaderboardOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          <div className={cn("overflow-hidden transition-all duration-300", leaderboardOpen ? "max-h-56 opacity-100" : "max-h-0 opacity-0")}>
            <ScrollArea className="h-48">
              <TooltipProvider delayDuration={200}>
              <div className="space-y-2">
                {resolvedLeaders.map((leader, index) => (
                  <button
                    key={leader.id}
                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 transition-colors text-left cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      document.dispatchEvent(new CustomEvent('openProfile', { detail: { userId: leader.user_id } }));
                    }}
                  >
                    <div className="relative">
                      <Avatar className="w-8 h-8 cursor-pointer" data-user-id={leader.user_id}>
                        <AvatarImage src={leader.avatar_url} />
                        <AvatarFallback className="text-xs">{leader.display_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {index < 3 && (
                        <div className={cn(
                          "absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold",
                          index === 0 && "bg-amber-400 text-white",
                          index === 1 && "bg-slate-300 text-slate-700",
                          index === 2 && "bg-orange-400 text-white"
                        )}>
                          {index + 1}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-900 truncate">{leader.display_name}</p>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1 cursor-help">
                            <TrendingUp className="w-3 h-3 text-violet-500" />
                            <span className="text-[10px] text-slate-500">{leader.rank_points?.toLocaleString() || 0}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-[200px]">
                          <p className="text-xs font-medium">Rank Points (RP)</p>
                          <p className="text-xs text-slate-500">Earned through missions and contributions.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    {leader.leader_tier === 'verified144k' && (
                      <Crown className="w-3 h-3 text-amber-500 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
              </TooltipProvider>
            </ScrollArea>
          </div>
        </div>
      )}

      {/* Footer - Status Controls */}
      <div className={cn(
        "border-t border-slate-100 p-4 space-y-3",
        (isCollapsed && !inPopup) && "px-2"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {(!isCollapsed || inPopup) && (
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Presence</span>
            )}
          </div>
          {(!isCollapsed || inPopup) && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPresencePopupOpen(true)}
                className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                title="Pop out presence section"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => setPresenceOpen(!presenceOpen)}
                className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                title={presenceOpen ? 'Collapse' : 'Expand'}
              >
                {presenceOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* RP & Rank Header */}
        {(!isCollapsed || inPopup) && profile && (
          <div className="flex items-center justify-between px-1 py-1 bg-violet-50 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-violet-500" />
              <span className="text-xs font-semibold text-violet-700">{profile.rp_points || 0} RP</span>
            </div>
            <span className="text-xs font-medium capitalize text-violet-600 bg-violet-100 px-2 py-0.5 rounded-full">{getRPRank(profile.rp_points || 0).title}</span>
          </div>
        )}



        {presenceOpen && (
          <>
            <div className={cn(
              "flex items-center gap-3",
              (isCollapsed && !inPopup) && "justify-center"
            )}>
              <div className={cn(
                "w-3 h-3 rounded-full animate-pulse",
                statusOption?.color
              )} />
              {(!isCollapsed || inPopup) && (
                <Select value={status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="h-9 text-sm dark:text-white dark:border-[rgba(0,255,136,0.3)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-[#0a0a0a] dark:border-[rgba(0,255,136,0.3)]">
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="dark:text-white dark:hover:bg-[rgba(0,255,136,0.1)]">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", opt.color)} />
                          {opt.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {(!isCollapsed || inPopup) && (
              <div className="flex items-center gap-3">
                <MessageCircle className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                <Select value={dmPolicy} onValueChange={handleDMChange}>
                  <SelectTrigger className="h-9 text-sm dark:text-white dark:border-[rgba(0,255,136,0.3)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-[#0a0a0a] dark:border-[rgba(0,255,136,0.3)]">
                    {DM_POLICY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="dark:text-white dark:hover:bg-[rgba(0,255,136,0.1)]">
                        DMs: {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Theme Toggle - Collapsible */}
            {(!isCollapsed || inPopup) && (
            <Collapsible open={themeOpen} onOpenChange={setThemeOpen}>
              <CollapsibleTrigger className="w-full flex items-center justify-between mt-2 py-1.5 px-1 rounded-lg hover:bg-slate-50">
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Theme</span>
                {themeOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2 space-y-2">
                <RadioGroup value={theme} onValueChange={onThemeToggle} className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="light" id={inPopup ? "theme-light-pop" : "theme-light"} className="h-3.5 w-3.5" />
                    <Label htmlFor={inPopup ? "theme-light-pop" : "theme-light"} className="text-sm text-slate-700 cursor-pointer flex items-center gap-1.5 flex-1">
                      <Sun className="w-3.5 h-3.5 text-amber-500" /> Light
                      <span className="ml-auto text-xs text-slate-400">(Artist)</span>
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="dark" id={inPopup ? "theme-dark-pop" : "theme-dark"} className="h-3.5 w-3.5" />
                    <Label htmlFor={inPopup ? "theme-dark-pop" : "theme-dark"} className="text-sm text-slate-700 cursor-pointer flex items-center gap-1.5 flex-1">
                      <Moon className="w-3.5 h-3.5 text-indigo-500" /> Dark
                      <span className="ml-auto text-xs text-slate-400">(Less)</span>
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="hacker" id={inPopup ? "theme-hacker-pop" : "theme-hacker"} className="h-3.5 w-3.5" />
                    <Label htmlFor={inPopup ? "theme-hacker-pop" : "theme-hacker"} className="text-sm text-slate-700 cursor-pointer flex items-center gap-1.5 flex-1">
                      <Terminal className="w-3.5 h-3.5 text-green-500" /> Hacker
                      <span className="ml-auto text-xs text-slate-400">(None)</span>
                    </Label>
                  </div>
                </RadioGroup>
              </CollapsibleContent>
            </Collapsible>
            )}

            {/* Background Effects - only for Dark/Hacker themes */}
            {(!isCollapsed || inPopup) && (theme === 'dark' || theme === 'hacker') && (
            <Collapsible open={bgEffectOpen} onOpenChange={setBgEffectOpen}>
              <CollapsibleTrigger className="w-full flex items-center justify-between mt-2 py-1.5 px-1 rounded-lg hover:bg-slate-50">
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Background Effect</span>
                {bgEffectOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2 space-y-2">
                <RadioGroup value={bgEffect} onValueChange={setBgEffect} className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="matrix" id={inPopup ? "bg-matrix-pop" : "bg-matrix"} className="h-3.5 w-3.5" />
                    <Label htmlFor={inPopup ? "bg-matrix-pop" : "bg-matrix"} className="text-sm text-slate-700 cursor-pointer flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-green-500" /> Matrix Rain
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="starfield" id={inPopup ? "bg-starfield-pop" : "bg-starfield"} className="h-3.5 w-3.5" />
                    <Label htmlFor={inPopup ? "bg-starfield-pop" : "bg-starfield"} className="text-sm text-slate-700 cursor-pointer flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-teal-400" /> Star Field
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="nebula" id={inPopup ? "bg-nebula-pop" : "bg-nebula"} className="h-3.5 w-3.5" />
                    <Label htmlFor={inPopup ? "bg-nebula-pop" : "bg-nebula"} className="text-sm text-slate-700 cursor-pointer flex items-center gap-1.5">
                      <Cloud className="w-3.5 h-3.5 text-purple-500" /> Nebula
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="circuit" id={inPopup ? "bg-circuit-pop" : "bg-circuit"} className="h-3.5 w-3.5" />
                    <Label htmlFor={inPopup ? "bg-circuit-pop" : "bg-circuit"} className="text-sm text-slate-700 cursor-pointer flex items-center gap-1.5">
                      <Waves className="w-3.5 h-3.5 text-cyan-500" /> Circuit
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="off" id={inPopup ? "bg-off-pop" : "bg-off"} className="h-3.5 w-3.5" />
                    <Label htmlFor={inPopup ? "bg-off-pop" : "bg-off"} className="text-sm text-slate-700 cursor-pointer flex items-center gap-1.5">
                      <Ban className="w-3.5 h-3.5 text-slate-400" /> Off
                    </Label>
                  </div>
                </RadioGroup>

                {/* Speed & Brightness sliders for animated effects */}
                {bgEffect !== 'off' && (
                  <div className="mt-3 space-y-3 pt-3 border-t border-slate-100">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-slate-600">Speed</Label>
                        <span className="text-xs text-slate-500">{matrixSpeed.toFixed(1)}x</span>
                      </div>
                      <Slider
                        value={[matrixSpeed]}
                        onValueChange={([v]) => setMatrixSpeed(v)}
                        min={0.2}
                        max={3}
                        step={0.1}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-slate-600">Brightness</Label>
                        <span className="text-xs text-slate-500">{Math.round(matrixBrightness * 100)}%</span>
                      </div>
                      <Slider
                        value={[matrixBrightness]}
                        onValueChange={([v]) => setMatrixBrightness(v)}
                        min={0.1}
                        max={1}
                        step={0.05}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-slate-600">Variance</Label>
                        <span className="text-xs text-slate-500">{Math.round(matrixVariance * 100)}%</span>
                      </div>
                      <Slider
                        value={[matrixVariance]}
                        onValueChange={([v]) => setMatrixVariance(v)}
                        min={0}
                        max={1}
                        step={0.05}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
            )}
          </>
        )}

        <Link
          to={createPageUrl('Profile')}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all mt-2 bg-violet-50 hover:bg-violet-100 text-violet-700 md:hidden",
            (isCollapsed && !inPopup) && "justify-center px-2"
          )}
        >
          {profile?.avatar_url ? (
            <Avatar className="w-6 h-6">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="text-xs">{profile?.display_name?.charAt(0)}</AvatarFallback>
            </Avatar>
          ) : (
            <User className="w-5 h-5" />
          )}
          {(!isCollapsed || inPopup) && (
            <span className="font-medium text-sm">My Profile</span>
          )}
        </Link>

        {(isCollapsed && !inPopup) && (
          <Button 
            variant="ghost" 
            size="icon"
            className="w-full"
            onClick={onToggle}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </>
  );

  // Popped-off panel render
  if (isPoppedOff) {
    return (
      <div
        className="fixed bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col z-[60] overflow-hidden"
        style={{
          left: popPosition.x,
          top: popPosition.y,
          width: popSize.width,
          height: popSize.height,
        }}
      >
        {/* Header */}
        <div
          onMouseDown={onPopDragStart}
          className="h-10 bg-gradient-to-r from-violet-600 to-violet-700 flex items-center justify-between px-3 cursor-move shrink-0"
        >
          <div className="flex items-center gap-2 text-white">
            <Move className="w-4 h-4 opacity-70" />
            <span className="text-sm font-medium">Navigation</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsPoppedOff(false)}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
              title="Dock panel"
            >
              <PanelLeft className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          {renderSidebarContent(true)}
        </ScrollArea>

        {/* Resize handles */}
        <div onMouseDown={(e) => onResizeStart(e, 'e')} className="absolute right-0 top-10 bottom-0 w-2 cursor-e-resize hover:bg-violet-200/50" />
        <div onMouseDown={(e) => onResizeStart(e, 's')} className="absolute bottom-0 left-0 right-0 h-2 cursor-s-resize hover:bg-violet-200/50" />
        <div onMouseDown={(e) => onResizeStart(e, 'se')} className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize hover:bg-violet-200/50" />
        <div onMouseDown={(e) => onResizeStart(e, 'w')} className="absolute left-0 top-10 bottom-0 w-2 cursor-w-resize hover:bg-violet-200/50" />
        <div onMouseDown={(e) => onResizeStart(e, 'n')} className="absolute top-0 left-0 right-0 h-2 cursor-n-resize hover:bg-violet-200/50" />
        <div onMouseDown={(e) => onResizeStart(e, 'nw')} className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize hover:bg-violet-200/50" />
        <div onMouseDown={(e) => onResizeStart(e, 'ne')} className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize hover:bg-violet-200/50" />
        <div onMouseDown={(e) => onResizeStart(e, 'sw')} className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize hover:bg-violet-200/50" />

        {/* Leaders popup */}
        {leadersPopupOpen && (
          <FloatingPanel title="Top Leaders" onClose={() => setLeadersPopupOpen(false)}>
            <TooltipProvider delayDuration={200}>
            <div className="space-y-2">
              {resolvedLeaders.map((leader, index) => (
                <div key={leader.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="relative">
                    <Avatar className="w-9 h-9 cursor-pointer" data-user-id={leader.user_id}>
                      <AvatarImage src={leader.avatar_url} />
                      <AvatarFallback className="text-xs">{leader.display_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {index < 3 && (
                      <div className={cn(
                        "absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold",
                        index === 0 && "bg-amber-400 text-white",
                        index === 1 && "bg-slate-300 text-slate-700",
                        index === 2 && "bg-orange-400 text-white"
                      )}>
                        {index + 1}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{leader.display_name}</p>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-violet-500" />
                      <span className="text-[11px] text-slate-500">{leader.rank_points?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                  {leader.leader_tier === 'verified144k' && (
                    <Crown className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                </div>
              ))}
            </div>
            </TooltipProvider>
          </FloatingPanel>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      "fixed left-0 top-0 h-screen bg-white border-r border-slate-200 z-50 flex flex-col transition-all duration-300",
      isCollapsed ? "w-10" : "w-64"
    )}>
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <div
          className={cn("flex items-center gap-3 cursor-pointer", isCollapsed && "justify-center w-full")}
          onClick={() => {
            if (isCollapsed) {
              onToggle?.();
            } else {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          title={isCollapsed ? "Expand sidebar" : "Go to top"}
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white shadow-lg shadow-violet-200 flex items-center justify-center select-none">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/5650186ed_SA_shield.png"
              alt="Saint Agent Logo"
              className="w-full h-full object-contain"
            />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-xl text-slate-900">SaintAgent</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {!isCollapsed && (
            <Button 
              variant="ghost" 
              size="icon"
              className="shrink-0 h-8 w-8"
              onClick={() => setIsPoppedOff(true)}
              title="Pop off panel"
            >
              <Maximize2 className="w-4 h-4 text-slate-400" />
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon"
            className={cn("shrink-0", isCollapsed && "hidden")}
            onClick={onToggle}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {renderSidebarContent(false)}

      {/* Nav popup */}
      {navPopupOpen && (
        <FloatingPanel title="Quick Navigation" onClose={() => setNavPopupOpen(false)}>
          <div className="space-y-1 p-2">
            {NAV_ITEMS.slice(0, 12).map((item) => {
              const isLeaderLocked = item.id === 'leader' && profile?.leader_tier !== 'verified144k';
              const isLocked = item.locked || isLeaderLocked;
              return (
                <Link
                  key={item.id}
                  to={isLocked ? '#' : createPageUrl(item.page)}
                  onClick={(e) => {
                    if (isLocked) e.preventDefault();
                    else setNavPopupOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-all",
                    currentPage === item.id 
                      ? "bg-violet-100 text-violet-700" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                    isLocked && "opacity-60 cursor-not-allowed"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                  {isLocked && <Lock className="w-3 h-3 ml-auto text-slate-400" />}
                </Link>
              );
            })}
          </div>
        </FloatingPanel>
      )}

      {/* Presence popup - includes all bottom section content */}
      {presencePopupOpen && (
        <FloatingPanel title="Presence & Settings" onClose={() => setPresencePopupOpen(false)}>
          <div className="p-4 space-y-4">
            {/* RP & Rank */}
            {profile && (
              <div className="flex items-center justify-between p-3 bg-violet-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-violet-500" />
                  <span className="text-sm font-semibold text-violet-700">{profile.rp_points || 0} RP</span>
                </div>
                <span className="text-sm font-medium capitalize text-violet-600 bg-violet-100 px-3 py-1 rounded-full">{getRPRank(profile.rp_points || 0).title}</span>
              </div>
            )}

            {/* Status & DM */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</p>
              <div className="flex items-center gap-3">
                <div className={cn("w-3 h-3 rounded-full animate-pulse", statusOption?.color)} />
                <Select value={status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="flex-1 h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", opt.color)} />
                          {opt.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3">
                <MessageCircle className="w-4 h-4 text-slate-400" />
                <Select value={dmPolicy} onValueChange={handleDMChange}>
                  <SelectTrigger className="flex-1 h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DM_POLICY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        DMs: {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Theme */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Theme</p>
              <RadioGroup value={theme} onValueChange={onThemeToggle} className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="light" id="popup-theme-light" className="h-3.5 w-3.5" />
                  <Label htmlFor="popup-theme-light" className="text-sm text-slate-700 cursor-pointer flex items-center gap-1.5 flex-1">
                    <Sun className="w-3.5 h-3.5 text-amber-500" /> Light
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="dark" id="popup-theme-dark" className="h-3.5 w-3.5" />
                  <Label htmlFor="popup-theme-dark" className="text-sm text-slate-700 cursor-pointer flex items-center gap-1.5 flex-1">
                    <Moon className="w-3.5 h-3.5 text-indigo-500" /> Dark
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="hacker" id="popup-theme-hacker" className="h-3.5 w-3.5" />
                  <Label htmlFor="popup-theme-hacker" className="text-sm text-slate-700 cursor-pointer flex items-center gap-1.5 flex-1">
                    <Terminal className="w-3.5 h-3.5 text-green-500" /> Hacker
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Background Effects - only for Dark/Hacker */}
            {(theme === 'dark' || theme === 'hacker') && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Background Effect</p>
                <RadioGroup value={bgEffect} onValueChange={setBgEffect} className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="matrix" id="popup-bg-matrix" className="h-3.5 w-3.5" />
                    <Label htmlFor="popup-bg-matrix" className="text-sm text-slate-700 cursor-pointer flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-green-500" /> Matrix Rain
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="starfield" id="popup-bg-starfield" className="h-3.5 w-3.5" />
                    <Label htmlFor="popup-bg-starfield" className="text-sm text-slate-700 cursor-pointer flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-teal-400" /> Star Field
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="nebula" id="popup-bg-nebula" className="h-3.5 w-3.5" />
                    <Label htmlFor="popup-bg-nebula" className="text-sm text-slate-700 cursor-pointer flex items-center gap-1.5">
                      <Cloud className="w-3.5 h-3.5 text-purple-500" /> Nebula
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="circuit" id="popup-bg-circuit" className="h-3.5 w-3.5" />
                    <Label htmlFor="popup-bg-circuit" className="text-sm text-slate-700 cursor-pointer flex items-center gap-1.5">
                      <Waves className="w-3.5 h-3.5 text-cyan-500" /> Circuit
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="off" id="popup-bg-off" className="h-3.5 w-3.5" />
                    <Label htmlFor="popup-bg-off" className="text-sm text-slate-700 cursor-pointer flex items-center gap-1.5">
                      <Ban className="w-3.5 h-3.5 text-slate-400" /> Off
                    </Label>
                  </div>
                </RadioGroup>

                {/* Speed, Brightness, Variance sliders */}
                {bgEffect !== 'off' && (
                  <div className="mt-3 space-y-3 pt-3 border-t border-slate-100">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-slate-600">Speed</Label>
                        <span className="text-xs text-slate-500">{matrixSpeed.toFixed(1)}x</span>
                      </div>
                      <Slider
                        value={[matrixSpeed]}
                        onValueChange={([v]) => setMatrixSpeed(v)}
                        min={0.2}
                        max={3}
                        step={0.1}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-slate-600">Brightness</Label>
                        <span className="text-xs text-slate-500">{Math.round(matrixBrightness * 100)}%</span>
                      </div>
                      <Slider
                        value={[matrixBrightness]}
                        onValueChange={([v]) => setMatrixBrightness(v)}
                        min={0.1}
                        max={1}
                        step={0.05}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-slate-600">Variance</Label>
                        <span className="text-xs text-slate-500">{Math.round(matrixVariance * 100)}%</span>
                      </div>
                      <Slider
                        value={[matrixVariance]}
                        onValueChange={([v]) => setMatrixVariance(v)}
                        min={0}
                        max={1}
                        step={0.05}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile Link */}
            <Link
              to={createPageUrl('Profile')}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all mt-2 bg-violet-50 hover:bg-violet-100 text-violet-700"
              onClick={() => setPresencePopupOpen(false)}
            >
              {profile?.avatar_url ? (
                <Avatar className="w-6 h-6">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback className="text-xs">{profile?.display_name?.charAt(0)}</AvatarFallback>
                </Avatar>
              ) : (
                <User className="w-5 h-5" />
              )}
              <span className="font-medium text-sm">My Profile</span>
            </Link>
          </div>
        </FloatingPanel>
      )}

      {/* Leaders popup when docked */}
      {leadersPopupOpen && (
        <FloatingPanel title="Top Leaders" onClose={() => setLeadersPopupOpen(false)}>
          <TooltipProvider delayDuration={200}>
          <div className="space-y-2">
            {resolvedLeaders.map((leader, index) => (
              <div key={leader.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="relative">
                  <Avatar className="w-9 h-9 cursor-pointer" data-user-id={leader.user_id}>
                    <AvatarImage src={leader.avatar_url} />
                    <AvatarFallback className="text-xs">{leader.display_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {index < 3 && (
                    <div className={cn(
                      "absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold",
                      index === 0 && "bg-amber-400 text-white",
                      index === 1 && "bg-slate-300 text-slate-700",
                      index === 2 && "bg-orange-400 text-white"
                    )}>
                      {index + 1}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{leader.display_name}</p>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-violet-500" />
                    <span className="text-[11px] text-slate-500">{leader.rank_points?.toLocaleString() || 0}</span>
                  </div>
                </div>
                {leader.leader_tier === 'verified144k' && (
                  <Crown className="w-4 h-4 text-amber-500 shrink-0" />
                )}
              </div>
            ))}
          </div>
          </TooltipProvider>
        </FloatingPanel>
      )}
    </div>
  );
}