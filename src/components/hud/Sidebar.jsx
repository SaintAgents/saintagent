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
  Folder
} from "lucide-react";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const NAV_ITEMS = [
  { id: 'command', label: 'Command Deck', icon: LayoutDashboard, page: 'CommandDeck' },
  { id: 'matches', label: 'Matches', icon: Sparkles, page: 'Matches', badge: 5 },
  { id: 'meetings', label: 'Meetings', icon: Calendar, page: 'Meetings', badge: 2 },
  { id: 'missions', label: 'Missions', icon: Target, page: 'Missions' },
  { id: 'projects', label: 'Projects', icon: Folder, page: 'Projects' },
  { id: 'collaborators', label: 'Collaborators', icon: Users, page: 'FindCollaborators' },
  { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, page: 'Marketplace' },
  { id: 'messages', label: 'Messages', icon: MessageCircle, page: 'Messages', badge: 0 },
  { id: 'leader', label: 'Leader Channel', icon: Radio, page: 'LeaderChannel', locked: true },
  { id: 'circles', label: 'Circles & Regions', icon: CircleDot, page: 'Circles' },
  { id: 'studio', label: 'Creator Studio', icon: Users, page: 'Studio' },
  { id: 'settings', label: 'Settings', icon: Settings, page: 'Settings' },
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
  const [navOpen, setNavOpen] = useState(true);
  const [presenceOpen, setPresenceOpen] = useState(true);
  const isDark = theme === 'dark';

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

  const handleStatusChange = (value) => {
    setStatus(value);
    onStatusChange?.(value);
  };

  const handleDMChange = (value) => {
    setDMPolicy(value);
    onDMPolicyChange?.(value);
  };

  const statusOption = STATUS_OPTIONS.find(s => s.value === status);

  return (
    <div className={cn(
      "fixed left-0 top-0 h-screen bg-white border-r border-slate-200 z-50 flex flex-col transition-all duration-300",
      isCollapsed ? "w-20" : "w-64"
    )}>
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <div
          className={cn("flex items-center gap-3 cursor-pointer", isCollapsed && "justify-center w-full")}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          title="Go to top"
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
        <Button 
          variant="ghost" 
          size="icon"
          className={cn("shrink-0", isCollapsed && "hidden")}
          onClick={onToggle}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <div className={cn("px-3 py-2 flex items-center justify-between", isCollapsed && "justify-center")}> 
          {!isCollapsed && (
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Navigation</span>
          )}
          <button
            onClick={() => setNavOpen(!navOpen)}
            className={cn("p-1 rounded-md hover:bg-slate-50", isCollapsed && "w-full flex items-center justify-center")}
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
          <nav className="p-3 pt-0 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = currentPage === item.id;
              const badgeValue = item.id === 'messages' ? (unreadMessages?.length || 0) : (item.badge || 0);
              return (
                <Link
                  key={item.id}
                  to={createPageUrl(item.page)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative group",
                    isActive 
                      ? "bg-violet-100 text-violet-700" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                    item.locked && "opacity-50 pointer-events-none"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5 shrink-0",
                    isActive ? "text-violet-600" : "text-slate-400 group-hover:text-slate-600"
                  )} />
                  {!isCollapsed && (
                    <>
                      <span className="font-medium text-sm">{item.label}</span>
                      {badgeValue > 0 && (
                        <Badge className="ml-auto bg-violet-600 text-white text-xs">
                          {badgeValue}
                        </Badge>
                      )}
                      {item.locked && (
                        <Badge variant="outline" className="ml-auto text-xs">
                          Locked
                        </Badge>
                      )}
                    </>
                  )}
                  {isCollapsed && badgeValue > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-violet-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {badgeValue}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        )}
      </div>

      {/* Leaderboard */}
      {!isCollapsed && (
        <div className="border-t border-slate-100 p-3">
          <div className="mb-3 px-2">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setLeaderboardOpen(!leaderboardOpen)}
                className="flex items-center gap-2 hover:bg-slate-50 rounded-lg py-1 px-1 transition-colors"
                aria-label={leaderboardOpen ? 'Collapse leaders' : 'Expand leaders'}
                title={leaderboardOpen ? 'Collapse' : 'Expand'}
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
                  title={leaderboardOpen ? 'Collapse' : 'Expand'}
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
          <div className={cn("overflow-hidden transition-all duration-300", leaderboardOpen ? "max-h-56 opacity-100" : "max-h-0 opacity-0")}
          >
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {topLeaders.map((leader, index) => (
                  <button
                    key={leader.id}
                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 transition-colors text-left"
                    data-user-id={leader.user_id}
                  >
                    <div className="relative">
                      <Avatar className="w-8 h-8">
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
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-violet-500" />
                        <span className="text-[10px] text-slate-500">{leader.rank_points?.toLocaleString() || 0}</span>
                      </div>
                    </div>
                    {leader.leader_tier === 'verified144k' && (
                      <Crown className="w-3 h-3 text-amber-500 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
          {leadersPopupOpen && (
            <FloatingPanel title="Top Leaders" onClose={() => setLeadersPopupOpen(false)}>
              <div className="space-y-2">
                {topLeaders.map((leader, index) => (
                  <div
                    key={leader.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
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
            </FloatingPanel>
          )}
        </div>
      )}

      {/* Footer - Status Controls */}
      <div className={cn(
        "border-t border-slate-100 p-4 space-y-3",
        isCollapsed && "px-2"
      )}>
        {/* Presence Section */}
        <button
          onClick={() => setPresenceOpen(!presenceOpen)}
          className={cn("w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-50", isCollapsed && "justify-center")}
          aria-label={presenceOpen ? 'Collapse presence' : 'Expand presence'}
          title={presenceOpen ? 'Collapse' : 'Expand'}
        >
          {!isCollapsed && (
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Presence</span>
          )}
          {presenceOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {presenceOpen && (
          <>
            {!isCollapsed && profile && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">RP</span>
                  <span className="text-sm font-semibold text-slate-900">{profile.rp_points || 0}</span>
                </div>
                <span className="text-xs capitalize text-slate-700">{getRPRank(profile.rp_points || 0).title}</span>
              </div>
            )}

            {/* Status Light */}
            <div className={cn(
              "flex items-center gap-3",
              isCollapsed && "justify-center"
            )}>
              <div className={cn(
                "w-3 h-3 rounded-full animate-pulse",
                statusOption?.color
              )} />
              {!isCollapsed && (
                <Select value={status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="h-9 text-sm">
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
              )}
            </div>

            {/* DM Policy */}
            {!isCollapsed && (
              <div className="flex items-center gap-3">
                <MessageCircle className="w-4 h-4 text-slate-400" />
                <Select value={dmPolicy} onValueChange={handleDMChange}>
                  <SelectTrigger className="h-9 text-sm">
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
            )}
          </>
          )}

          {/* Theme Toggle */}
          {!isCollapsed && (
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              {isDark ? (
                <Moon className="w-4 h-4 text-slate-400" />
              ) : (
                <Sun className="w-4 h-4 text-slate-400" />
              )}
              <span className="text-sm text-slate-700">Dark mode</span>
            </div>
            <Switch checked={isDark} onCheckedChange={(v) => onThemeToggle?.(v ? 'dark' : 'light')} />
          </div>
          )}

          {/* Collapse Toggle (when collapsed) */}
        {isCollapsed && (
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
    </div>
  );
}