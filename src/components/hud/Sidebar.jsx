import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import FloatingPanel from '@/components/hud/FloatingPanel';
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
  Sparkles,
  MessageCircle,
  Wifi,
  Moon,
  Focus,
  Trophy,
  Crown,
  TrendingUp,
  ExternalLink
} from "lucide-react";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const NAV_ITEMS = [
  { id: 'command', label: 'Command Deck', icon: LayoutDashboard, page: 'CommandDeck' },
  { id: 'matches', label: 'Matches', icon: Sparkles, page: 'Matches', badge: 5 },
  { id: 'meetings', label: 'Meetings', icon: Calendar, page: 'Meetings', badge: 2 },
  { id: 'missions', label: 'Missions', icon: Target, page: 'Missions' },
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
  onDMPolicyChange
}) {
  const [status, setStatus] = useState(profile?.status || 'online');
  const [dmPolicy, setDMPolicy] = useState(profile?.dm_policy || 'everyone');
  const [leaderboardOpen, setLeaderboardOpen] = useState(true);
  const [leadersPopupOpen, setLeadersPopupOpen] = useState(false);

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
        <div className={cn("flex items-center gap-3", isCollapsed && "justify-center w-full")}>
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white shadow-lg shadow-violet-200 flex items-center justify-center">
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
          className={cn("shrink-0")}
          onClick={onToggle}
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
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

      {/* Leaderboard */}
      {!isCollapsed && (
        <div className="border-t border-slate-100 p-3">
          <div className="relative">
            <button
              onClick={() => setLeaderboardOpen(!leaderboardOpen)}
              className="w-full flex items-center justify-between px-2 mb-3 hover:bg-slate-50 rounded-lg py-1 transition-colors"
              title={leaderboardOpen ? 'Collapse' : 'Expand'}
            >
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Top Leaders</span>
              </div>
              {leaderboardOpen ? (
                <ChevronLeft className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-1 top-0.5 h-6 w-6"
              onClick={(e) => { e.stopPropagation(); setLeadersPopupOpen(true); }}
              title="Pop out"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Button>
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