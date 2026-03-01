import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Trophy,
  Crown,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Search,
  X,
  Calendar,
  Flame,
  Clock,
  EyeOff,
  Eye
} from "lucide-react";
import FloatingPanel from '@/components/hud/FloatingPanel';

const TIME_FILTERS = [
  { id: 'all', label: 'All Time', icon: Trophy },
  { id: 'monthly', label: 'Monthly', icon: Calendar },
  { id: 'weekly', label: 'Weekly', icon: Clock },
];

export default function SidebarLeaderboard({ 
  isCollapsed, 
  inPopup = false, 
  profile,
  currentUserEmail 
}) {
  const [leaderboardOpen, setLeaderboardOpen] = useState(true);
  const [leaderboardFullyCollapsed, setLeaderboardFullyCollapsed] = useState(false);
  const [leadersPopupOpen, setLeadersPopupOpen] = useState(false);
  const [leaderboardHidden, setLeaderboardHidden] = useState(() => {
    try { return localStorage.getItem('sidebarLeaderboardHidden') === 'true'; } catch { return false; }
  });

  // Persist hidden state
  React.useEffect(() => {
    try { localStorage.setItem('sidebarLeaderboardHidden', String(leaderboardHidden)); } catch {}
  }, [leaderboardHidden]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [timeFilter, setTimeFilter] = useState('all');

  // Fetch all profiles for leaderboard (increased limit for better search)
  const { data: allProfiles = [] } = useQuery({
    queryKey: ['leaderboardProfiles'],
    queryFn: () => base44.entities.UserProfile.list('-rank_points', 50),
    refetchInterval: 30000
  });

  // Filter and sort based on time filter
  const filteredByTime = useMemo(() => {
    if (!allProfiles.length) return [];
    
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    let filtered = [...allProfiles];
    
    // For time-based filtering, we'd ideally have separate fields for weekly/monthly points
    // Since we don't, we'll simulate by using updated_date as a proxy for recent activity
    if (timeFilter === 'weekly') {
      // Sort by recent activity + points
      filtered = filtered
        .filter(p => p.updated_date && new Date(p.updated_date) >= weekAgo)
        .sort((a, b) => {
          const aActive = a.updated_date ? new Date(a.updated_date) >= weekAgo : false;
          const bActive = b.updated_date ? new Date(b.updated_date) >= weekAgo : false;
          if (aActive && !bActive) return -1;
          if (!aActive && bActive) return 1;
          return (Number(b?.rank_points) || 0) - (Number(a?.rank_points) || 0);
        });
    } else if (timeFilter === 'monthly') {
      filtered = filtered
        .filter(p => p.updated_date && new Date(p.updated_date) >= monthAgo)
        .sort((a, b) => {
          const aActive = a.updated_date ? new Date(a.updated_date) >= monthAgo : false;
          const bActive = b.updated_date ? new Date(b.updated_date) >= monthAgo : false;
          if (aActive && !bActive) return -1;
          if (!aActive && bActive) return 1;
          return (Number(b?.rank_points) || 0) - (Number(a?.rank_points) || 0);
        });
    }
    
    return filtered.slice(0, 10);
  }, [allProfiles, timeFilter]);

  // Ensure current user appears if their rank qualifies
  const resolvedLeaders = useMemo(() => {
    const arr = [...filteredByTime];
    if (profile?.user_id) {
      const exists = arr.some(l => l.user_id === profile.user_id);
      if (!exists) arr.push(profile);
    }
    return arr
      .sort((a, b) => (Number(b?.rank_points) || 0) - (Number(a?.rank_points) || 0))
      .slice(0, 10);
  }, [filteredByTime, profile?.user_id, profile?.rank_points]);

  // Search filter
  const searchedLeaders = useMemo(() => {
    if (!searchQuery.trim()) return resolvedLeaders;
    const q = searchQuery.toLowerCase();
    return allProfiles
      .filter(l => 
        l.display_name?.toLowerCase().includes(q) || 
        l.handle?.toLowerCase().includes(q)
      )
      .sort((a, b) => (Number(b?.rank_points) || 0) - (Number(a?.rank_points) || 0))
      .slice(0, 10);
  }, [resolvedLeaders, allProfiles, searchQuery]);

  // Find current user's position in full leaderboard
  const currentUserPosition = useMemo(() => {
    if (!currentUserEmail) return null;
    const sorted = [...allProfiles].sort((a, b) => 
      (Number(b?.rank_points) || 0) - (Number(a?.rank_points) || 0)
    );
    const idx = sorted.findIndex(l => l.user_id === currentUserEmail);
    return idx >= 0 ? idx + 1 : null;
  }, [allProfiles, currentUserEmail]);

  const displayLeaders = searchQuery ? searchedLeaders : resolvedLeaders;
  const showExpanded = !isCollapsed || inPopup;

  const renderLeaderRow = (leader, index, isCompact = false) => {
    const isCurrentUser = leader.user_id === currentUserEmail;
    const position = searchQuery ? null : index + 1;
    
    return (
      <button
        key={leader.id}
        className={cn(
          "w-full flex items-center gap-2 p-2 rounded-lg transition-colors text-left cursor-pointer",
          isCurrentUser 
            ? "bg-violet-100 hover:bg-violet-150 ring-2 ring-violet-300" 
            : "hover:bg-slate-50",
          isCompact && "p-1.5"
        )}
        onClick={(e) => {
          e.stopPropagation();
          document.dispatchEvent(new CustomEvent('openProfile', { detail: { userId: leader.user_id } }));
        }}
      >
        <div className="relative">
          <Avatar className={cn("cursor-pointer", isCompact ? "w-7 h-7" : "w-8 h-8")} data-user-id={leader.user_id}>
            <AvatarImage src={leader.avatar_url} />
            <AvatarFallback className="text-xs">{leader.display_name?.charAt(0)}</AvatarFallback>
          </Avatar>
          {position && position <= 3 && (
            <div className={cn(
              "absolute -top-1 -right-1 rounded-full flex items-center justify-center text-[10px] font-bold",
              isCompact ? "w-3 h-3" : "w-4 h-4",
              position === 1 && "bg-amber-400 text-white",
              position === 2 && "bg-slate-300 text-slate-700",
              position === 3 && "bg-orange-400 text-white"
            )}>
              {position}
            </div>
          )}
          {isCurrentUser && position && position > 3 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-violet-500 text-white flex items-center justify-center text-[8px] font-bold">
              {position}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <p className={cn(
              "font-medium truncate",
              isCompact ? "text-[11px]" : "text-xs",
              isCurrentUser ? "text-violet-700" : "text-slate-900"
            )}>
              {leader.display_name}
            </p>
            {isCurrentUser && (
              <span className="text-[9px] bg-violet-500 text-white px-1 rounded">YOU</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className={cn("text-violet-500", isCompact ? "w-2.5 h-2.5" : "w-3 h-3")} />
            <span className={cn("text-slate-500", isCompact ? "text-[9px]" : "text-[10px]")}>
              {leader.rank_points?.toLocaleString() || 0}
            </span>
          </div>
        </div>
        {leader.leader_tier === 'verified144k' && (
          <Crown className={cn("text-amber-500 shrink-0", isCompact ? "w-3 h-3" : "w-3.5 h-3.5")} />
        )}
      </button>
    );
  };

  // Collapsed avatars view
  const renderCollapsedView = () => (
    <div className={cn("flex flex-wrap gap-1 px-2 py-1", isCollapsed && !inPopup && "flex-col items-center gap-1.5 px-0")}>
      <TooltipProvider delayDuration={200}>
        {displayLeaders.slice(0, isCollapsed && !inPopup ? 4 : 10).map((leader, index) => {
          const isCurrentUser = leader.user_id === currentUserEmail;
          return (
            <Tooltip key={leader.id}>
              <TooltipTrigger asChild>
                <button
                  className={cn(
                    "relative",
                    isCurrentUser && "ring-2 ring-violet-400 rounded-full"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    document.dispatchEvent(new CustomEvent('openProfile', { detail: { userId: leader.user_id } }));
                  }}
                >
                  <Avatar className="w-7 h-7 cursor-pointer hover:ring-2 hover:ring-violet-300 transition-all" data-user-id={leader.user_id}>
                    <AvatarImage src={leader.avatar_url} />
                    <AvatarFallback className="text-[10px]">{leader.display_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {index < 3 && (
                    <div className={cn(
                      "absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full flex items-center justify-center text-[8px] font-bold",
                      index === 0 && "bg-amber-400 text-white",
                      index === 1 && "bg-slate-300 text-slate-700",
                      index === 2 && "bg-orange-400 text-white"
                    )}>
                      {index + 1}
                    </div>
                  )}
                  {isCurrentUser && index >= 3 && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-violet-500 flex items-center justify-center">
                      <Flame className="w-2 h-2 text-white" />
                    </div>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[180px]">
                <p className="text-xs font-medium">{leader.display_name} {isCurrentUser && '(You)'}</p>
                <p className="text-[10px] text-slate-500">{leader.rank_points?.toLocaleString() || 0} RP</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>
      {showExpanded && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setLeaderboardFullyCollapsed(true);
          }}
          className="w-full flex items-center justify-center py-1 mt-1 rounded hover:bg-slate-100 transition-colors"
          title="Collapse to title only"
        >
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </button>
      )}
    </div>
  );

  // Popup content with full features
  const renderPopupContent = () => (
    <div className="p-3 space-y-3">
      {/* Time Filter Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
        {TIME_FILTERS.map(filter => (
          <button
            key={filter.id}
            onClick={() => setTimeFilter(filter.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all",
              timeFilter === filter.id 
                ? "bg-white text-violet-700 shadow-sm" 
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <filter.icon className="w-3 h-3" />
            <span className="hidden sm:inline">{filter.label}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-8 pl-8 pr-8 text-xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-slate-200 rounded"
          >
            <X className="w-3 h-3 text-slate-400" />
          </button>
        )}
      </div>

      {/* Current User Position Banner */}
      {currentUserPosition && !searchQuery && (
        <div className="flex items-center justify-between px-3 py-2 bg-violet-50 rounded-lg border border-violet-200">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-violet-500 text-white flex items-center justify-center text-xs font-bold">
              #{currentUserPosition}
            </div>
            <span className="text-xs font-medium text-violet-700">Your Position</span>
          </div>
          <span className="text-xs text-violet-600">
            {profile?.rank_points?.toLocaleString() || 0} RP
          </span>
        </div>
      )}

      {/* Leaders List */}
      <ScrollArea className="h-64">
        <div className="space-y-1">
          {displayLeaders.map((leader, index) => renderLeaderRow(leader, index))}
          {displayLeaders.length === 0 && (
            <div className="text-center py-4 text-slate-500 text-xs">
              {searchQuery ? 'No users found' : 'No leaders yet'}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  // If hidden OR fully collapsed, show nothing when isCollapsed - don't even show the toggle
  if ((leaderboardHidden || leaderboardFullyCollapsed) && !inPopup && isCollapsed) {
    return null;
  }

  // If hidden, show minimal toggle - keep within sidebar bounds
  if (leaderboardHidden && !inPopup) {
    return (
      <div className="border-t border-slate-100 px-3 py-1 flex-shrink-0">
        <button
          onClick={() => setLeaderboardHidden(false)}
          className="w-full flex items-center justify-center gap-2 px-2 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700 border border-slate-200"
          title="Show leaderboard"
        >
          <Trophy className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-xs font-medium">Show Leaders</span>
        </button>
      </div>
    );
  }

  return (
    <>
      <div className={cn("border-t border-slate-100 p-2 pb-16", isCollapsed && !inPopup && "p-1 pb-14")}>
        {/* Header */}
        <div className={cn("mb-2 px-1", isCollapsed && !inPopup && "mb-1 px-0")}>
          <div className={cn("flex items-center justify-between gap-1 min-w-0", isCollapsed && !inPopup && "justify-center")}>
            <button
              onClick={() => setLeaderboardOpen(!leaderboardOpen)}
              className={cn("flex items-center gap-1.5 hover:bg-slate-50 rounded-lg py-1 px-1 transition-colors min-w-0 flex-shrink", isCollapsed && !inPopup && "p-1 justify-center")}
            >
              <Trophy className="w-4 h-4 text-amber-500 flex-shrink-0" />
              {showExpanded && <span className="text-[10px] font-semibold text-slate-900 uppercase tracking-wide truncate">Leaders</span>}
            </button>
            {showExpanded && (
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={() => setLeaderboardHidden(true)}
                  title="Hide leaderboard"
                >
                  <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                </Button>
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
                  onClick={() => {
                    if (leaderboardFullyCollapsed) {
                      setLeaderboardFullyCollapsed(false);
                      setLeaderboardOpen(false);
                    } else if (!leaderboardOpen) {
                      setLeaderboardOpen(true);
                    } else {
                      setLeaderboardOpen(false);
                    }
                  }}
                >
                  {leaderboardFullyCollapsed ? (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  ) : leaderboardOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Collapsed: show avatars only */}
        {(!leaderboardOpen || (isCollapsed && !inPopup)) && !leaderboardFullyCollapsed && renderCollapsedView()}

        {/* Expanded: show full list */}
        <div className={cn("overflow-hidden transition-all duration-300", leaderboardOpen && showExpanded ? "max-h-72 opacity-100" : "max-h-0 opacity-0")}>
          {/* Inline Time Filter */}
          <div className="flex gap-0.5 mb-2 px-1">
            {TIME_FILTERS.map(filter => (
              <button
                key={filter.id}
                onClick={() => setTimeFilter(filter.id)}
                className={cn(
                  "flex-1 py-1 px-1.5 rounded text-[10px] font-medium transition-all",
                  timeFilter === filter.id 
                    ? "bg-violet-100 text-violet-700" 
                    : "text-slate-500 hover:bg-slate-100"
                )}
              >
                {filter.id === 'all' ? '∞' : filter.id === 'monthly' ? '30d' : '7d'}
              </button>
            ))}
          </div>
          
          {/* Current User Position Mini */}
          {currentUserPosition && currentUserPosition > 10 && (
            <div className="flex items-center gap-2 px-2 py-1 mb-2 bg-violet-50 rounded text-[10px]">
              <span className="font-bold text-violet-700">#{currentUserPosition}</span>
              <span className="text-violet-600">Your rank</span>
            </div>
          )}
          
          <ScrollArea className="h-48">
            <TooltipProvider delayDuration={200}>
              <div className="space-y-1">
                {displayLeaders.map((leader, index) => renderLeaderRow(leader, index, true))}
              </div>
            </TooltipProvider>
          </ScrollArea>
        </div>
      </div>

      {/* Leaders Popup */}
      {leadersPopupOpen && (
        <FloatingPanel title="Leaderboard" onClose={() => setLeadersPopupOpen(false)}>
          {renderPopupContent()}
        </FloatingPanel>
      )}
    </>
  );
}