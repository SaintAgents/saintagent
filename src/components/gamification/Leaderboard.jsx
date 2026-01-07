import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Trophy, Medal, Award, Crown, TrendingUp, Users, Calendar, Coins } from 'lucide-react';
import { motion } from 'framer-motion';
import RankedAvatar from '@/components/reputation/RankedAvatar';

const PERIOD_LABELS = {
  daily: 'Today',
  weekly: 'This Week',
  monthly: 'This Month',
  all_time: 'All Time'
};

const CATEGORY_CONFIG = {
  overall: { label: 'Overall', icon: Trophy, color: 'text-amber-500' },
  meetings: { label: 'Meetings', icon: Calendar, color: 'text-violet-500' },
  missions: { label: 'Missions', icon: TrendingUp, color: 'text-emerald-500' },
  ggg: { label: 'GGG Earned', icon: Coins, color: 'text-amber-500' },
  social: { label: 'Social', icon: Users, color: 'text-blue-500' }
};

const RANK_STYLES = {
  1: { icon: Crown, bg: 'bg-gradient-to-r from-amber-100 to-yellow-100', border: 'border-amber-300', text: 'text-amber-700' },
  2: { icon: Medal, bg: 'bg-gradient-to-r from-slate-100 to-gray-100', border: 'border-slate-300', text: 'text-slate-700' },
  3: { icon: Award, bg: 'bg-gradient-to-r from-orange-100 to-amber-100', border: 'border-orange-300', text: 'text-orange-700' }
};

export default function Leaderboard({ category = 'overall', compact = false }) {
  const [period, setPeriod] = useState('weekly');

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  // For demo, we'll generate leaderboard from UserProfiles
  const { data: profiles = [] } = useQuery({
    queryKey: ['leaderboardProfiles'],
    queryFn: () => base44.entities.UserProfile.list('-engagement_points', 20)
  });

  // Sort and rank profiles
  const leaderboardData = profiles
    .filter(p => p.engagement_points > 0 || p.meetings_completed > 0)
    .sort((a, b) => (b.engagement_points || 0) - (a.engagement_points || 0))
    .slice(0, compact ? 5 : 10)
    .map((p, idx) => ({
      ...p,
      rank: idx + 1,
      points: p.engagement_points || 0
    }));

  const currentUserRank = leaderboardData.findIndex(p => p.user_id === currentUser?.email) + 1;

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-slate-900 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            Leaderboard
          </h4>
          <Badge variant="outline" className="text-xs">{PERIOD_LABELS[period]}</Badge>
        </div>
        {leaderboardData.slice(0, 5).map((entry, idx) => (
          <LeaderboardRow key={entry.id} entry={entry} rank={idx + 1} isCurrentUser={entry.user_id === currentUser?.email} compact />
        ))}
        {currentUserRank > 5 && leaderboardData.find(p => p.user_id === currentUser?.email) && (
          <div className="pt-2 border-t border-dashed border-slate-200">
            <LeaderboardRow 
              entry={leaderboardData.find(p => p.user_id === currentUser?.email)} 
              rank={currentUserRank} 
              isCurrentUser 
              compact 
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          Leaderboard
        </h3>
        <Tabs value={period} onValueChange={setPeriod}>
          <TabsList className="h-8">
            <TabsTrigger value="daily" className="text-xs h-6">Today</TabsTrigger>
            <TabsTrigger value="weekly" className="text-xs h-6">Week</TabsTrigger>
            <TabsTrigger value="monthly" className="text-xs h-6">Month</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Top 3 Podium */}
      <div className="flex justify-center items-end gap-4 mb-6 pt-4">
        {[1, 0, 2].map((idx) => {
          const entry = leaderboardData[idx];
          if (!entry) return <div key={`empty-${idx}`} />;
          const rank = idx === 1 ? 1 : idx === 0 ? 2 : 3;
          const height = rank === 1 ? 'h-24' : rank === 2 ? 'h-20' : 'h-16';
          const style = RANK_STYLES[rank];
          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col items-center"
            >
              <div className="relative mb-2">
                <RankedAvatar
                  src={entry.avatar_url}
                  name={entry.display_name}
                  size={rank === 1 ? 56 : 48}
                  userId={entry.user_id}
                  rpRankCode={entry.rp_rank_code}
                />
                <div className={cn(
                  "absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                  style.bg, style.border, style.text, "border-2"
                )}>
                  {rank}
                </div>
              </div>
              <p className="text-sm font-medium text-slate-900 text-center truncate max-w-[80px]">
                {entry.display_name?.split(' ')[0] || 'User'}
              </p>
              <p className="text-xs text-amber-600 font-semibold">{entry.points.toLocaleString()} pts</p>
              <div className={cn("w-16 rounded-t-lg mt-2", height, style.bg, "border", style.border)} />
            </motion.div>
          );
        })}
      </div>

      {/* Rest of leaderboard */}
      <div className="space-y-2">
        {leaderboardData.slice(3).map((entry, idx) => (
          <LeaderboardRow 
            key={entry.id} 
            entry={entry} 
            rank={idx + 4} 
            isCurrentUser={entry.user_id === currentUser?.email} 
          />
        ))}
      </div>

      {/* Current user position if not in top 10 */}
      {currentUserRank > 10 && (
        <div className="mt-4 pt-4 border-t border-dashed border-slate-200">
          <p className="text-xs text-slate-500 mb-2">Your Position</p>
          <LeaderboardRow 
            entry={profiles.find(p => p.user_id === currentUser?.email)} 
            rank={currentUserRank} 
            isCurrentUser 
          />
        </div>
      )}
    </div>
  );
}

function LeaderboardRow({ entry, rank, isCurrentUser, compact }) {
  if (!entry) return <div key={`empty-row-${rank}`} className="hidden" />;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "flex items-center gap-3 p-2 rounded-lg transition-colors",
        isCurrentUser ? "bg-violet-50 border border-violet-200" : "hover:bg-slate-50"
      )}
    >
      <div className={cn(
        "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
        rank <= 3 ? RANK_STYLES[rank]?.bg : "bg-slate-100",
        rank <= 3 ? RANK_STYLES[rank]?.text : "text-slate-600"
      )}>
        {rank}
      </div>
      <RankedAvatar
        src={entry.avatar_url}
        name={entry.display_name}
        size={compact ? 28 : 36}
        userId={entry.user_id}
      />
      <div className="flex-1 min-w-0">
        <p className={cn(
          "font-medium truncate",
          compact ? "text-sm" : "text-base",
          isCurrentUser ? "text-violet-900" : "text-slate-900"
        )}>
          {entry.display_name || 'User'}
          {isCurrentUser && <span className="text-xs text-violet-500 ml-1">(You)</span>}
        </p>
      </div>
      <div className="text-right">
        <p className={cn(
          "font-bold",
          compact ? "text-sm" : "text-base",
          "text-amber-600"
        )}>
          {(entry.points || entry.engagement_points || 0).toLocaleString()}
        </p>
        {!compact && <p className="text-xs text-slate-400">points</p>}
      </div>
    </motion.div>
  );
}