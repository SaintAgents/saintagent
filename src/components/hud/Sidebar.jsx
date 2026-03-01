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
import { getRPRank, RP_LADDER } from '@/components/reputation/rpUtils';
import SidebarLeaderboard from '@/components/hud/SidebarLeaderboard';
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
  Mic,
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
  Eye,
  EyeOff,
  Orbit,
  Smile,
  Newspaper,
  BookOpen,
  Coins,
  Ticket,
  Globe,
  Play,
  FileText,
  Key,
  Medal
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { getStoredViewMode, isNavItemVisible } from './DeckViewModeSelector';


// Web pages group - these will have special styling
const WEB_PAGES = ['authority144', 'topgggmission', 'gggcrypto', 'sovereignalliance', 'ggt'];

const NAV_ITEMS = [
  { id: 'command', label: 'Command Deck', Icon: LayoutDashboard, page: 'CommandDeck', hint: 'Your main dashboard and overview' },
  { id: 'betafeedback', label: 'Beta Feedback', Icon: Smile, page: 'BetaFeedback', hint: 'Submit feedback to help improve the platform' },
  { id: 'forum', label: 'Community Forum', Icon: MessageCircle, page: 'Forum', hint: 'Discuss, share, and connect with the community' },
  { id: 'advice', label: 'Wisdom Exchange', Icon: Sparkles, page: 'Advice', hint: 'Seek guidance, share wisdom, AI-powered insights' },
  { id: 'initiations', label: 'Initiations', Icon: Eye, page: 'Initiations', hint: 'Sacred pathways, 144K Activation & 7th Seal initiations' },
  { id: 'quests', label: 'Quests', Icon: Trophy, page: 'Quests', hint: 'Quest system, badges, leaderboards & sacred connections' },
  { id: 'synchronicity', label: 'Synchronicity Engine', Icon: Orbit, page: 'SynchronicityEngine', hint: 'Share and discover meaningful coincidences' },
  { id: 'gamification', label: 'Gamification', Icon: Trophy, page: 'Gamification', hint: 'Challenges, achievements, and leaderboards' },
  { id: 'leaderboards', label: 'Leaderboards', Icon: Medal, page: 'Leaderboards', hint: 'View rankings, top players, and your position' },
  { id: 'mentorship', label: 'Mentorship', Icon: Users, page: 'Mentorship', hint: 'Find mentors or become one' },
  { id: 'matches', label: 'Matches', Icon: Sparkles, page: 'Matches', hint: 'AI-powered connections based on your profile' },
  { id: 'meetings', label: 'Meetings', Icon: Calendar, page: 'Meetings', hint: 'Schedule and manage your meetings' },
  { id: 'missions', label: 'Missions', Icon: Zap, page: 'Missions', hint: 'Join collaborative missions and quests' },
  { id: 'teams', label: 'Teams & Guilds', Icon: Shield, page: 'Teams', hint: 'Form teams for collaborative missions' },
  { id: 'projects', label: 'Projects', Icon: Folder, page: 'Projects', hint: 'Manage and discover projects' },
  { id: 'profiles', label: 'Profiles', Icon: User, page: 'Profiles', hint: 'Discover members by rank and expertise' },
  { id: 'crm', label: 'Contact Network', Icon: Users, page: 'CRM', hint: 'Federated CRM with trust-gated sharing' },
  { id: 'deals', label: 'Deal Tracking', Icon: Target, page: 'Deals', hint: 'Manage sales pipeline and deals' },
  { id: 'drx', label: 'Digital Rights Exchange', Icon: Key, page: 'DigitalRightsExchange', hint: 'Programmable digital asset rights - license, rent, and monetize your content' },
  { id: 'activity', label: 'Activity Feed', Icon: TrendingUp, page: 'ActivityFeed', hint: 'See recent community activity' },
  { id: 'communityfeed', label: 'Community Feed', Icon: FileText, page: 'CommunityFeed', hint: 'Share and engage with community posts' },
  { id: 'collaborators', label: 'Collaborators', Icon: Users, page: 'FindCollaborators', hint: 'Find people to work with' },
  { id: 'marketplace', label: 'Marketplace', Icon: ShoppingBag, page: 'Marketplace', hint: 'Browse and list services' },
  { id: 'messages', label: 'Messages', Icon: MessageCircle, page: 'Messages', hint: 'Direct and group conversations' },
  { id: 'events', label: 'Events', Icon: CircleDot, page: 'Events', hint: 'Discover and create meetups' },
  { id: 'broadcast', label: 'Broadcast', Icon: Mic, page: 'Broadcast', hint: 'Live podcasts, town halls & community broadcasts' },
  { id: 'schedule', label: 'Global Schedule', Icon: Globe, page: 'Schedule', hint: 'View all meetings, events & broadcasts in one place' },
  { id: 'leader', label: 'Leader Channel', Icon: Radio, page: 'LeaderChannel', hint: 'Exclusive channel for verified leaders' },
  { id: 'circles', label: 'Circles', Icon: Users, page: 'Circles', hint: 'Join interest and value-based communities' },
  { id: 'studio', label: 'Creator Studio', Icon: Star, page: 'Studio', hint: 'Manage your offerings, content, and subscriptions' },
  { id: 'contentstudio', label: 'Content Studio', Icon: FileText, page: 'ContentStudio', hint: 'Create, collaborate, and publish content with AI assistance' },
  { id: 'affiliate', label: 'Affiliate Center', Icon: Share2, page: 'AffiliateCenter', hint: 'Share your referral link and track referrals' },
  { id: 'news', label: 'News & Updates', Icon: Newspaper, page: 'News', hint: 'Platform announcements, updates, and community news' },
  { id: 'gallery', label: 'Hero Gallery', Icon: Eye, page: 'CommandDeck', hint: 'View and explore the hero image gallery', action: 'openGallery' },
  { id: 'insights', label: 'Insights & Analysis', Icon: BookOpen, page: 'Insights', hint: 'Deep-dive analyses, strategic frameworks, and thought leadership' },
  { id: 'g3dex', label: 'G3DEX Trading', Icon: Coins, page: 'G3Dex', hint: 'Swap, trade Neo-NFTs, escrow commodities & gold-backed assets' },
  { id: 'lottery', label: 'GGG Lottery', Icon: Ticket, page: 'Lottery', hint: 'Monthly lottery with GGG jackpot - $1.11 per ticket' },
  { id: 'videos', label: 'SaintTube', Icon: Play, page: 'Videos', hint: 'Upload and watch videos (max 20 min)' },
  { id: 'testimonials', label: 'Testimonials', Icon: Star, page: 'Testimonials', hint: 'View and share community testimonials' },
  // Web Pages Group - grouped together with special styling
  { id: 'ggt', label: 'Gaia Global Treasury', Icon: Shield, page: 'GaiaGlobalTreasury', hint: 'Transparent regulatory framework for verified collateral & global asset reconciliation', isWebPage: true },
  { id: 'authority144', label: '144 Authority', Icon: Crown, page: 'Authority144', hint: 'Gaia Global Treasury - Divine Currency Control & 144,000 Sacred Mission', isWebPage: true },
  { id: 'topgggmission', label: 'Top GGG Mission', Icon: Globe, page: 'TopGGGMission', hint: 'The Ultranet Era - Sovereign Digital Infrastructure for Humanity\'s Golden Age', isWebPage: true },
  { id: 'gggcrypto', label: 'GGG Crypto', Icon: Coins, page: 'GGGCrypto', hint: 'Gaia Global Gold - Gold-backed cryptocurrency with staking and swap', isWebPage: true },
  { id: 'sovereignalliance', label: 'Sovereign Alliance', Icon: Shield, page: 'SovereignAlliance', hint: 'A to Z Guide to Freedom - Education & Action for Sovereignty', isWebPage: true },
  // Settings at the end
  { id: 'settings', label: 'Settings', Icon: Settings, page: 'Settings', hint: 'Account and app preferences' },
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

  const [navPopupOpen, setNavPopupOpen] = useState(false);
  const [presencePopupOpen, setPresencePopupOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(true);
  const [presenceOpen, setPresenceOpen] = useState(true);
  const [presenceHidden, setPresenceHidden] = useState(() => {
    try { return localStorage.getItem('presenceHidden') === 'true'; } catch { return false; }
  });
  const [themeOpen, setThemeOpen] = useState(false);
  const [bgEffectOpen, setBgEffectOpen] = useState(true);
  const [appearanceOpen, setAppearanceOpen] = useState(true);
  const [appearanceHidden, setAppearanceHidden] = useState(() => {
    try { return localStorage.getItem('appearanceHidden') === 'true'; } catch { return false; }
  });
  const [navPopupCollapsed, setNavPopupCollapsed] = useState(false);
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
  const [viewMode, setViewMode] = useState(getStoredViewMode);
  const isDark = theme === 'dark';

  // Listen for view mode changes from Command Deck
  React.useEffect(() => {
    const handleViewModeChange = (e) => {
      if (e.detail?.viewMode) {
        setViewMode(e.detail.viewMode);
      }
    };
    // Also check localStorage on storage events
    const handleStorage = () => {
      setViewMode(getStoredViewMode());
    };
    document.addEventListener('viewModeChange', handleViewModeChange);
    window.addEventListener('storage', handleStorage);
    return () => {
      document.removeEventListener('viewModeChange', handleViewModeChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

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
      <div className={cn("overflow-y-auto", navOpen ? "flex-1" : "flex-shrink-0")}>
        {/* Nav Header with Popout */}
        {(!isCollapsed || inPopup) && (
          <div className="px-3 pt-2 pb-1">
            <button
              onClick={() => {
                setNavPopupOpen(true);
                // Collapse the sidebar when Quick Nav is opened
                if (!isCollapsed && onToggle) onToggle();
              }}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
              title="Pop out navigation"
            >
              <span className="text-xs font-semibold text-slate-900 uppercase tracking-wide">Quick Nav</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        )}
        <div className={cn("px-3 py-2 flex items-center justify-between", isCollapsed && !inPopup && "justify-center px-1")}> 
          {(!isCollapsed || inPopup) && (
            <span className="text-xs font-semibold text-slate-900 uppercase tracking-wide">Navigation</span>
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
              {(() => {
                const filteredItems = NAV_ITEMS.filter(item => {
                  if (item.adminOnly && currentUser?.role !== 'admin') return false;
                  if (!isNavItemVisible(item.id, viewMode)) return false;
                  return true;
                });
                
                // Find where web pages start
                const webPageStartIndex = filteredItems.findIndex(item => item.isWebPage);
                const hasWebPages = webPageStartIndex !== -1;
                
                return filteredItems.map((item, index) => {
                  const isActive = currentPage === item.id;
                  const badgeValue = item.id === 'messages' ? (unreadMessages?.length || 0) : 0;
                  const isLeaderLocked = item.id === 'leader' && profile?.leader_tier !== 'verified144k';
                  const isLocked = item.locked || isLeaderLocked;
                  const showExpanded = !isCollapsed || inPopup;
                  const ItemIcon = item.Icon;
                  
                  // Check if this is the first web page item
                  const isFirstWebPage = hasWebPages && index === webPageStartIndex;
                  // Check if this is a web page item
                  const isWebPage = item.isWebPage;
                  // Check if this is the last web page (next item is settings or end)
                  const nextItem = filteredItems[index + 1];
                  const isLastWebPage = isWebPage && (!nextItem || !nextItem.isWebPage);
                  
                  const navLink = (
                    <Link
                      key={item.id}
                      to={isLocked ? '#' : createPageUrl(item.page)}
                      onClick={(e) => {
                        if (isLocked) { e.preventDefault(); return; }
                        if (item.action === 'openGallery') {
                          e.preventDefault();
                          document.dispatchEvent(new CustomEvent('openHeroGallery', { detail: { startIndex: 0 } }));
                        }
                      }}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative group",
                        isActive 
                          ? "bg-violet-100 text-violet-700" 
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                        isLocked && "opacity-60 cursor-not-allowed",
                        isCollapsed && !inPopup && "px-1.5 py-1.5 justify-center"
                      )}
                    >
                      {ItemIcon && <ItemIcon className={cn(
                        "w-5 h-5 shrink-0",
                        isActive ? "text-violet-600" : "text-slate-400 group-hover:text-slate-600"
                      )} />}
                      {showExpanded && (
                        <>
                          <span className="font-medium text-sm text-slate-900">{item.label}</span>
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
                  
                  // Wrap web pages in a special container
                  const wrappedNavLink = (() => {
                    if (((isCollapsed && !inPopup) || item.hint) && !isLocked) {
                      return (
                        <Tooltip key={item.id}>
                          <TooltipTrigger asChild>
                            {navLink}
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-xs backdrop-blur-md bg-white/80 border border-white/50 shadow-lg">
                            <p className="text-sm font-medium text-slate-900">{item.label}</p>
                            {item.hint && <p className="text-xs text-slate-600">{item.hint}</p>}
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
                          <TooltipContent side="right" className="max-w-xs backdrop-blur-md bg-white/80 border border-white/50 shadow-lg">
                            <div className="space-y-1">
                              <p className="font-medium text-sm text-slate-900">Leader Channel Locked</p>
                              <p className="text-xs text-slate-600">
                                Become a Verified 144k Leader to unlock.
                              </p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      );
                    }
                    
                    return navLink;
                  })();
                  
                  // Add web pages container styling
                  if (isFirstWebPage && showExpanded) {
                    return (
                      <React.Fragment key={item.id}>
                        <div className="pt-2 pb-1">
                          <span className="px-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Web Pages</span>
                        </div>
                        <div className="bg-slate-50/80 rounded-lg py-1 -mx-1 px-1 space-y-0.5">
                          {wrappedNavLink}
                        </div>
                      </React.Fragment>
                    );
                  }
                  
                  if (isWebPage && !isFirstWebPage && showExpanded) {
                    // Continue the web pages container
                    return (
                      <div key={item.id} className={cn(
                        "bg-slate-50/80 -mx-1 px-1",
                        isLastWebPage ? "rounded-b-lg pb-1" : ""
                      )}>
                        {wrappedNavLink}
                      </div>
                    );
                  }
                  
                  return wrappedNavLink;
                });
              })()}
            </TooltipProvider>
          </nav>
        )}
      </div>

      {/* Show presence toggle when hidden */}
      {presenceHidden && !isCollapsed && !inPopup && (
        <div className="border-t border-slate-100 px-3 py-2">
          <button
            onClick={() => {
              setPresenceHidden(false);
              try { localStorage.setItem('presenceHidden', 'false'); } catch {}
            }}
            className="w-full flex items-center justify-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors text-slate-500 hover:text-slate-700"
            title="Show presence section"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Show Presence</span>
          </button>
        </div>
      )}

      {/* Show appearance toggle when hidden */}
      {appearanceHidden && !isCollapsed && !inPopup && (
        <div className="border-t border-slate-100 px-3 py-2">
          <button
            onClick={() => {
              setAppearanceHidden(false);
              try { localStorage.setItem('appearanceHidden', 'false'); } catch {}
            }}
            className="w-full flex items-center justify-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors text-slate-500 hover:text-slate-700"
            title="Show appearance section"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Show Appearance</span>
          </button>
        </div>
      )}

      {/* Leaderboard - always rendered so "Show Leaders" button appears */}
      <SidebarLeaderboard
        isCollapsed={isCollapsed}
        inPopup={inPopup}
        profile={profile}
        currentUserEmail={currentUser?.email}
      />

      {/* Appearance Section - Dedicated section for theme & effects */}
      <div className={cn(
        "border-t border-slate-100",
        (isCollapsed && !inPopup) ? "px-2 pt-1 pb-16 mb-12" : "px-2 py-1 pb-16",
        appearanceHidden && !inPopup && "hidden"
      )}>
        {/* Collapsed: Show theme icon button that cycles through themes */}
        {(isCollapsed && !inPopup) ? (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    // Cycle through themes: light -> dark -> hacker -> light
                    const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'hacker' : 'light';
                    onThemeToggle(nextTheme);
                  }}
                  className="w-full flex items-center justify-center p-2 rounded-lg transition-colors hover:bg-slate-50 text-slate-500"
                >
                  {theme === 'light' ? <Sun className="w-5 h-5 text-amber-500" /> : 
                   theme === 'dark' ? <Moon className="w-5 h-5 text-indigo-500" /> : 
                   <Terminal className="w-5 h-5 text-green-500" />}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="text-sm font-medium">Toggle Theme</p>
                <p className="text-xs text-slate-500">Current: {theme} (click to cycle)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          /* Expanded: Full appearance controls */
          <div className="space-y-2">
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 px-1">
                <div className="p-1 rounded-lg bg-violet-100">
                  <Sun className="w-3 h-3 text-violet-600" />
                </div>
                <span className="text-[10px] font-semibold text-slate-900 uppercase tracking-wide">Appearance</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setAppearanceOpen(!appearanceOpen)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  title={appearanceOpen ? 'Collapse' : 'Expand'}
                >
                  {appearanceOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </button>
                <button
                  onClick={() => {
                    setAppearanceHidden(true);
                    try { localStorage.setItem('appearanceHidden', 'true'); } catch {}
                  }}
                  className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Hide appearance section"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>

            {appearanceOpen && (
              <>
                {/* Quick Theme Switcher - Always visible */}
                <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 rounded-lg">
                  <button
                    onClick={() => onThemeToggle('light')}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-[10px] font-medium transition-all",
                      theme === 'light' 
                        ? "bg-white shadow-sm text-amber-600 ring-1 ring-amber-200" 
                        : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                    )}
                  >
                    <Sun className={cn("w-3 h-3", theme === 'light' && "text-amber-500")} />
                    Light
                  </button>
                  <button
                    onClick={() => onThemeToggle('dark')}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-[10px] font-medium transition-all",
                      theme === 'dark' 
                        ? "bg-slate-800 shadow-sm text-blue-400 ring-1 ring-blue-500/30" 
                        : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                    )}
                  >
                    <Moon className={cn("w-3 h-3", theme === 'dark' && "text-indigo-400")} />
                    Dark
                  </button>
                  <button
                    onClick={() => onThemeToggle('hacker')}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-[10px] font-medium transition-all",
                      theme === 'hacker' 
                        ? "bg-black shadow-sm text-green-400 ring-1 ring-green-500/30" 
                        : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                    )}
                  >
                    <Terminal className="w-3 h-3" />
                    Hacker
                  </button>
                </div>

                {/* Background Effects - only for Dark/Hacker themes */}
                {(theme === 'dark' || theme === 'hacker') && (
              <Collapsible open={bgEffectOpen} onOpenChange={setBgEffectOpen}>
                <CollapsibleTrigger className="w-full flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                    <span className="text-xs font-medium text-slate-700">Background Effect</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 capitalize">{bgEffect === 'off' ? 'None' : bgEffect}</span>
                    {bgEffectOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2 space-y-2">
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { value: 'matrix', icon: Zap, label: 'Matrix', color: 'text-green-500' },
                      { value: 'starfield', icon: Star, label: 'Stars', color: 'text-teal-400' },
                      { value: 'nebula', icon: Cloud, label: 'Nebula', color: 'text-purple-500' },
                      { value: 'circuit', icon: Waves, label: 'Circuit', color: 'text-cyan-500' },
                      { value: 'fractal', icon: Sparkles, label: 'Fractal', color: 'text-pink-500' },
                      { value: 'off', icon: Ban, label: 'Off', color: 'text-slate-400' },
                    ].map((effect) => (
                      <button
                        key={effect.value}
                        onClick={() => setBgEffect(effect.value)}
                        className={cn(
                          "flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs transition-all",
                          bgEffect === effect.value
                            ? "bg-violet-100 text-violet-700 ring-1 ring-violet-200"
                            : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        <effect.icon className={cn("w-3 h-3", bgEffect === effect.value ? "text-violet-600" : effect.color)} />
                        {effect.label}
                      </button>
                    ))}
                  </div>

                  {/* Speed & Brightness sliders for animated effects */}
                  {bgEffect !== 'off' && (
                    <div className="mt-2 space-y-2.5 pt-2 border-t border-slate-100">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between px-1">
                          <Label className="text-[10px] text-slate-500">Speed</Label>
                          <span className="text-[10px] text-slate-400">{matrixSpeed.toFixed(1)}x</span>
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
                      <div className="space-y-1">
                        <div className="flex items-center justify-between px-1">
                          <Label className="text-[10px] text-slate-500">Brightness</Label>
                          <span className="text-[10px] text-slate-400">{Math.round(matrixBrightness * 100)}%</span>
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
                      <div className="space-y-1">
                        <div className="flex items-center justify-between px-1">
                          <Label className="text-[10px] text-slate-500">Variance</Label>
                          <span className="text-[10px] text-slate-400">{Math.round(matrixVariance * 100)}%</span>
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
          </div>
        )}
      </div>

      {/* Footer - Status Controls - hidden when collapsed or presence hidden */}
      <div className={cn(
        "border-t border-slate-100 p-2 space-y-1.5",
        (isCollapsed && !inPopup) && "hidden",
        presenceHidden && !inPopup && "hidden"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {(!isCollapsed || inPopup) && (
              <span className="text-xs font-semibold text-slate-900 uppercase tracking-wide">Presence</span>
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
              <button
                onClick={() => {
                  const newVal = !presenceHidden;
                  setPresenceHidden(newVal);
                  try { localStorage.setItem('presenceHidden', String(newVal)); } catch {}
                }}
                className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                title={presenceHidden ? 'Show presence section' : 'Hide presence section'}
              >
                {presenceHidden ? (
                  <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
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
              <span className="text-xs font-semibold text-violet-700">{profile.rank_points || profile.rp_points || 0} RP</span>
            </div>
            <span className="text-xs font-medium capitalize text-violet-600 bg-violet-100 px-2 py-0.5 rounded-full">{(profile.rank_code && RP_LADDER.find(r => r.code === profile.rank_code)?.title) || (profile.rp_rank_code && RP_LADDER.find(r => r.code === profile.rp_rank_code)?.title) || getRPRank(profile.rank_points || profile.rp_points || 0).title}</span>
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
                  <SelectTrigger className="h-9 text-sm text-slate-900 dark:text-white dark:border-[rgba(0,255,136,0.3)]">
                    <SelectValue placeholder="Online" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#0a0a0a] dark:border-[rgba(0,255,136,0.3)]">
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="text-slate-900 dark:text-white dark:hover:bg-[rgba(0,255,136,0.1)]">
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
                  <SelectTrigger className="h-9 text-sm text-slate-900 dark:text-white dark:border-[rgba(0,255,136,0.3)]">
                    <SelectValue placeholder="DMs: Everyone" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#0a0a0a] dark:border-[rgba(0,255,136,0.3)]">
                    {DM_POLICY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="text-slate-900 dark:text-white dark:hover:bg-[rgba(0,255,136,0.1)]">
                        DMs: {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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


      </div>
    );
  }

  return (
    <div className={cn(
      "fixed left-0 top-0 h-screen border-r z-50 flex flex-col transition-all duration-300",
      "bg-white border-slate-200",
      "dark:bg-[#050505] dark:border-[rgba(0,255,136,0.2)]",
      "[data-theme='hacker']_&:bg-black [data-theme='hacker']_&:border-[#00ff00]",
      isCollapsed ? "w-16" : "w-64",
      "hidden md:flex" // Hide sidebar on mobile
    )} data-sidebar>
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
          <div className={cn(
            "rounded-xl overflow-hidden bg-white shadow-lg shadow-violet-200 flex items-center justify-center select-none",
            isCollapsed ? "w-12 h-12" : "w-10 h-10"
          )}>
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/5650186ed_SA_shield.png"
              alt="SaintAgent Logo"
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
        <FloatingPanel 
          title={navPopupCollapsed ? "" : "Quick Navigation"} 
          onClose={() => setNavPopupOpen(false)}
          collapsedWidth={navPopupCollapsed ? 72 : 420}
          headerExtra={
            <button
              onClick={(e) => {
                e.stopPropagation();
                setNavPopupCollapsed(!navPopupCollapsed);
              }}
              className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
              title={navPopupCollapsed ? "Expand" : "Collapse to icons"}
            >
              {navPopupCollapsed ? <ChevronRight className="w-4 h-4 text-slate-600" /> : <ChevronLeft className="w-4 h-4 text-slate-600" />}
            </button>
          }
        >
          <div className={cn("space-y-1 p-2", navPopupCollapsed && "p-1")}>
            <TooltipProvider delayDuration={100}>
              {NAV_ITEMS.filter(item => {
                // Admin check
                if (item.adminOnly && currentUser?.role !== 'admin') return false;
                // View mode filtering (same as sidebar)
                if (!isNavItemVisible(item.id, viewMode)) return false;
                return true;
              }).map((item) => {
                const isLeaderLocked = item.id === 'leader' && profile?.leader_tier !== 'verified144k';
                const isLocked = item.locked || isLeaderLocked;
                const ItemIcon = item.Icon;
                const linkContent = (
                  <Link
                    key={item.id}
                    to={isLocked ? '#' : createPageUrl(item.page)}
                    onClick={(e) => {
                      if (isLocked) { e.preventDefault(); return; }
                      if (item.action === 'openGallery') {
                        e.preventDefault();
                        document.dispatchEvent(new CustomEvent('openHeroGallery', { detail: { startIndex: 0 } }));
                      }
                      // Don't close popup on navigation - keep it open until user closes it
                    }}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all",
                      currentPage === item.id 
                        ? "bg-violet-100 text-violet-700" 
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                      isLocked && "opacity-60 cursor-not-allowed",
                      navPopupCollapsed && "px-2 py-2 justify-center"
                    )}
                  >
                    {ItemIcon && <ItemIcon className="w-4 h-4 shrink-0" />}
                    {!navPopupCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                    {!navPopupCollapsed && isLocked && <Lock className="w-3 h-3 ml-auto text-slate-400" />}
                  </Link>
                );
                
                if (navPopupCollapsed) {
                  return (
                    <Tooltip key={item.id}>
                      <TooltipTrigger asChild>
                        {linkContent}
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p className="text-sm font-medium">{item.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                }
                return linkContent;
              })}
            </TooltipProvider>
          </div>
          
          {/* Theme Dots at Bottom */}
          <div className="border-t border-slate-100 p-3">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => onThemeToggle('light')}
                className={cn(
                  "w-6 h-6 rounded-full border-2 transition-all",
                  theme === 'light' 
                    ? "bg-white border-violet-500 ring-2 ring-violet-200" 
                    : "bg-white border-[#00ff88] hover:ring-4 hover:ring-[#00ff88]/40"
                )}
                style={{ 
                  boxShadow: theme !== 'light' 
                    ? '0 0 8px rgba(0, 255, 136, 0.5), 0 0 0 3px rgba(0, 255, 136, 0.25)' 
                    : undefined 
                }}
                title="Light theme"
              />
              <button
                onClick={() => onThemeToggle('dark')}
                className={cn(
                  "w-6 h-6 rounded-full border-2 transition-all",
                  theme === 'dark' 
                    ? "bg-slate-800 border-[#00ff88] ring-4 ring-[#00ff88]/50" 
                    : "bg-slate-800 border-[#00ff88] hover:ring-4 hover:ring-[#00ff88]/40"
                )}
                style={{ boxShadow: '0 0 8px rgba(0, 255, 136, 0.5), 0 0 0 3px rgba(0, 255, 136, 0.25)' }}
                title="Dark theme"
              />
              <button
                onClick={() => onThemeToggle('hacker')}
                className={cn(
                  "w-6 h-6 rounded-full border-2 transition-all",
                  theme === 'hacker' 
                    ? "bg-[#00ff00] border-[#00ff00] ring-4 ring-[#00ff00]/50" 
                    : "bg-[#00ff00] border-[#00ff00] hover:ring-4 hover:ring-[#00ff00]/40"
                )}
                style={{ boxShadow: '0 0 8px rgba(0, 255, 0, 0.6), 0 0 0 3px rgba(0, 255, 0, 0.3)' }}
                title="Hacker theme"
              />

            </div>
          </div>
        </FloatingPanel>
      )}

      {/* Presence popup - includes all bottom section content */}
      {presencePopupOpen && (
        <FloatingPanel title="Presence & Settings" onClose={() => setPresencePopupOpen(false)}>
          <div className="p-4 space-y-3">
            {/* RP & Rank */}
            {profile && (
              <div className="flex items-center justify-between px-1 py-1 bg-violet-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-violet-500" />
                  <span className="text-xs font-semibold text-violet-700">{profile.rank_points || profile.rp_points || 0} RP</span>
                </div>
                <span className="text-xs font-medium capitalize text-violet-600 bg-violet-100 px-2 py-0.5 rounded-full">{(profile.rank_code && RP_LADDER.find(r => r.code === profile.rank_code)?.title) || (profile.rp_rank_code && RP_LADDER.find(r => r.code === profile.rp_rank_code)?.title) || getRPRank(profile.rank_points || profile.rp_points || 0).title}</span>
              </div>
            )}

            {/* Status */}
            <div className="flex items-center gap-3">
              <div className={cn("w-3 h-3 rounded-full animate-pulse", statusOption?.color)} />
              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger className="h-9 text-sm text-slate-900 dark:text-white dark:border-[rgba(0,255,136,0.3)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#0a0a0a] dark:border-[rgba(0,255,136,0.3)]">
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-slate-900 dark:text-white dark:hover:bg-[rgba(0,255,136,0.1)]">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", opt.color)} />
                        {opt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* DM Policy */}
            <div className="flex items-center gap-3">
              <MessageCircle className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              <Select value={dmPolicy} onValueChange={handleDMChange}>
                <SelectTrigger className="h-9 text-sm text-slate-900 dark:text-white dark:border-[rgba(0,255,136,0.3)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#0a0a0a] dark:border-[rgba(0,255,136,0.3)]">
                  {DM_POLICY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-slate-900 dark:text-white dark:hover:bg-[rgba(0,255,136,0.1)]">
                      DMs: {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Theme Toggle - Collapsible */}
            <Collapsible open={themeOpen} onOpenChange={setThemeOpen}>
              <CollapsibleTrigger className="w-full flex items-center justify-between mt-2 py-1.5 px-1 rounded-lg hover:bg-slate-50">
                <span className="text-xs font-semibold text-slate-900 uppercase tracking-wide">Theme</span>
                {themeOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2 space-y-2">
                <RadioGroup value={theme} onValueChange={onThemeToggle} className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="light" id="popup-theme-light" className="h-3.5 w-3.5" />
                    <Label htmlFor="popup-theme-light" className="text-sm text-slate-900 cursor-pointer flex items-center gap-1.5 flex-1">
                      <Sun className="w-3.5 h-3.5 text-amber-500" /> Light
                      <span className="ml-auto text-xs text-slate-400">(Artist)</span>
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="dark" id="popup-theme-dark" className="h-3.5 w-3.5" />
                    <Label htmlFor="popup-theme-dark" className="text-sm text-slate-900 cursor-pointer flex items-center gap-1.5 flex-1">
                      <Moon className="w-3.5 h-3.5 text-indigo-500" /> Dark
                      <span className="ml-auto text-xs text-slate-400">(Less)</span>
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="hacker" id="popup-theme-hacker" className="h-3.5 w-3.5" />
                    <Label htmlFor="popup-theme-hacker" className="text-sm text-slate-900 cursor-pointer flex items-center gap-1.5 flex-1">
                      <Terminal className="w-3.5 h-3.5 text-green-500" /> Hacker
                      <span className="ml-auto text-xs text-slate-400">(None)</span>
                    </Label>
                  </div>

                </RadioGroup>
              </CollapsibleContent>
            </Collapsible>

            {/* Background Effects - only for Dark/Hacker themes */}
            {(theme === 'dark' || theme === 'hacker') && (
            <Collapsible open={bgEffectOpen} onOpenChange={setBgEffectOpen}>
              <CollapsibleTrigger className="w-full flex items-center justify-between mt-2 py-1.5 px-1 rounded-lg hover:bg-slate-50">
                <span className="text-xs font-semibold text-slate-900 uppercase tracking-wide">Background Effect</span>
                {bgEffectOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2 space-y-2">
                <RadioGroup value={bgEffect} onValueChange={setBgEffect} className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="matrix" id="popup-bg-matrix" className="h-3.5 w-3.5" />
                    <Label htmlFor="popup-bg-matrix" className="text-sm text-slate-900 cursor-pointer flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-green-500" /> Matrix Rain
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="starfield" id="popup-bg-starfield" className="h-3.5 w-3.5" />
                    <Label htmlFor="popup-bg-starfield" className="text-sm text-slate-900 cursor-pointer flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-teal-400" /> Star Field
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="nebula" id="popup-bg-nebula" className="h-3.5 w-3.5" />
                    <Label htmlFor="popup-bg-nebula" className="text-sm text-slate-900 cursor-pointer flex items-center gap-1.5">
                      <Cloud className="w-3.5 h-3.5 text-purple-500" /> Nebula
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="circuit" id="popup-bg-circuit" className="h-3.5 w-3.5" />
                    <Label htmlFor="popup-bg-circuit" className="text-sm text-slate-900 cursor-pointer flex items-center gap-1.5">
                      <Waves className="w-3.5 h-3.5 text-cyan-500" /> Circuit
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="fractal" id="popup-bg-fractal" className="h-3.5 w-3.5" />
                    <Label htmlFor="popup-bg-fractal" className="text-sm text-slate-900 cursor-pointer flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-pink-500" /> Fractal
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="off" id="popup-bg-off" className="h-3.5 w-3.5" />
                    <Label htmlFor="popup-bg-off" className="text-sm text-slate-900 cursor-pointer flex items-center gap-1.5">
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



      {/* Bottom Expand/Collapse Chevron */}
      <button
        onClick={onToggle}
        className={cn(
          "absolute bottom-0 left-0 right-0 h-10 flex items-center justify-center",
          "bg-gradient-to-t from-violet-100 to-white/90 dark:from-slate-800 dark:to-slate-900/90",
          "border-t border-slate-200 dark:border-slate-700",
          "hover:from-violet-200 dark:hover:from-slate-700 transition-colors",
          "z-10"
        )}
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="w-5 h-5 text-violet-600 dark:text-violet-400" />
        ) : (
          <ChevronLeft className="w-5 h-5 text-violet-600 dark:text-violet-400" />
        )}
      </button>
    </div>
  );
}