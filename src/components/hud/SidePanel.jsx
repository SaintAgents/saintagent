import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Calendar,
  Zap,
  Coins,
  TrendingUp,
  HelpCircle,
  Clock,
  ArrowRight
} from "lucide-react";
import ProgressRing from './ProgressRing';
import { format, parseISO, isToday, isTomorrow } from "date-fns";

export default function SidePanel({ 
  matches = [], 
  meetings = [], 
  profile,
  isOpen,
  onToggle,
  onMatchAction,
  onMeetingAction
}) {
  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = parseISO(dateStr);
    if (isToday(date)) return `Today ${format(date, 'h:mm a')}`;
    if (isTomorrow(date)) return `Tomorrow ${format(date, 'h:mm a')}`;
    return format(date, "MMM d, h:mm a");
  };

  const rankProgress = profile?.rank_points || 0;
  const nextRankAt = 1000; // Example

  return (
    <div className={cn(
      "fixed right-0 top-0 h-screen bg-white border-l border-slate-200 shadow-xl z-40 transition-all duration-300 flex flex-col",
      isOpen ? "w-80" : "w-0 overflow-hidden"
    )}>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -left-10 top-1/2 -translate-y-1/2 w-10 h-20 bg-white border border-r-0 border-slate-200 rounded-l-xl flex items-center justify-center shadow-md hover:bg-slate-50 transition-colors"
      >
        {isOpen ? (
          <ChevronRight className="w-5 h-5 text-slate-600" />
        ) : (
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        )}
      </button>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* GGG & Rank Meters */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-medium text-violet-600 uppercase tracking-wider">GGG Balance</p>
                <p className="text-2xl font-bold text-violet-900 flex items-center gap-1.5">
                  <Coins className="w-5 h-5 text-amber-500" />
                  {profile?.ggg_balance?.toLocaleString() || 0}
                </p>
              </div>
              <ProgressRing 
                value={rankProgress} 
                max={nextRankAt} 
                size={64}
                strokeWidth={5}
                label={profile?.rank_code?.charAt(0).toUpperCase()}
                sublabel="Rank"
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">To next rank</span>
              <span className="font-medium text-violet-700">{nextRankAt - rankProgress} pts</span>
            </div>
          </div>

          {/* Today's Schedule */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                Today's Schedule
              </h3>
              <span className="text-xs text-slate-500">{meetings.length} meetings</span>
            </div>
            <div className="space-y-2">
              {meetings.length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center">No meetings today</p>
              ) : (
                meetings.slice(0, 4).map((meeting, i) => (
                  <button
                    key={i}
                    onClick={() => onMeetingAction?.('view', meeting)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                  >
                    <div className="p-2 rounded-lg bg-blue-100">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{meeting.title}</p>
                      <p className="text-xs text-slate-500">{formatTime(meeting.scheduled_time)}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Active Match Stack */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-500" />
                Top Matches
              </h3>
              <span className="text-xs text-slate-500">{matches.length} active</span>
            </div>
            <div className="space-y-2">
              {matches.length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center">No matches yet</p>
              ) : (
                matches.slice(0, 5).map((match, i) => (
                  <button
                    key={i}
                    onClick={() => onMatchAction?.('view', match)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-violet-50 hover:border-violet-200 border border-transparent transition-colors text-left"
                  >
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
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="h-10 rounded-xl text-xs">
                Boost Profile
              </Button>
              <Button variant="outline" size="sm" className="h-10 rounded-xl text-xs">
                Find Mentors
              </Button>
              <Button variant="outline" size="sm" className="h-10 rounded-xl text-xs">
                Browse Events
              </Button>
              <Button variant="outline" size="sm" className="h-10 rounded-xl text-xs">
                View Missions
              </Button>
            </div>
          </div>

          {/* Context Help */}
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
        </div>
      </ScrollArea>
    </div>
  );
}