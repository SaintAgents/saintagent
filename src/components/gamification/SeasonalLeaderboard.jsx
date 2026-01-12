import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { 
  Trophy, Medal, Award, Crown, Coins, Target, Users, Sparkles,
  Clock, Calendar, Zap, Gift
} from 'lucide-react';
import { motion } from 'framer-motion';
import RankedAvatar from '@/components/reputation/RankedAvatar';

const CATEGORY_CONFIG = {
  titans: { 
    label: 'The Titans', 
    icon: Coins, 
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    description: 'GGG Earned This Season',
    metric: 'ggg_earned_season',
    reward: 'Exclusive Profile Aura',
    rewardIcon: Sparkles
  },
  pathfinders: { 
    label: 'The Pathfinders', 
    icon: Target, 
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    description: 'Missions Completed This Season',
    metric: 'missions_completed_season',
    reward: 'Early Access to New Quests',
    rewardIcon: Zap
  },
  connectors: { 
    label: 'The Connectors', 
    icon: Users, 
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description: 'New Connections This Season',
    metric: 'new_connections_season',
    reward: '2x Referral GGG Multiplier',
    rewardIcon: Gift
  },
  mystics: { 
    label: 'The Mystics', 
    icon: Sparkles, 
    color: 'text-violet-500',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    description: 'Mentorship Hours + Upvotes',
    metric: 'mentorship_hours_season',
    secondaryMetric: 'mentorship_upvotes_season',
    reward: 'Top Mentor Badge + 500 GGG',
    rewardIcon: Medal
  }
};

const RANK_STYLES = {
  1: { icon: Crown, bg: 'bg-gradient-to-r from-amber-100 to-yellow-100', border: 'border-amber-300', text: 'text-amber-700' },
  2: { icon: Medal, bg: 'bg-gradient-to-r from-slate-100 to-gray-100', border: 'border-slate-300', text: 'text-slate-700' },
  3: { icon: Award, bg: 'bg-gradient-to-r from-orange-100 to-amber-100', border: 'border-orange-300', text: 'text-orange-700' }
};

function SeasonCountdown({ endDate }) {
  const [timeLeft, setTimeLeft] = React.useState({ days: 0, hours: 0, minutes: 0 });

  React.useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const end = new Date(endDate);
      const diff = end - now;
      
      if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0 };
      }
      
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60)
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 60000);
    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <div className="flex items-center gap-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-violet-600">{timeLeft.days}</div>
        <div className="text-xs text-slate-500">Days</div>
      </div>
      <div className="text-xl text-slate-300">:</div>
      <div className="text-center">
        <div className="text-2xl font-bold text-violet-600">{timeLeft.hours}</div>
        <div className="text-xs text-slate-500">Hours</div>
      </div>
      <div className="text-xl text-slate-300">:</div>
      <div className="text-center">
        <div className="text-2xl font-bold text-violet-600">{timeLeft.minutes}</div>
        <div className="text-xs text-slate-500">Mins</div>
      </div>
    </div>
  );
}

function CategoryLeaderboard({ category, profiles, currentUserId }) {
  const config = CATEGORY_CONFIG[category];
  const Icon = config.icon;
  const RewardIcon = config.rewardIcon;

  // Sort profiles by category metric
  const sortedProfiles = [...profiles]
    .map(p => {
      let score = p[config.metric] || 0;
      if (config.secondaryMetric) {
        score += (p[config.secondaryMetric] || 0) * 10; // Weight upvotes higher
      }
      return { ...p, categoryScore: score };
    })
    .filter(p => p.categoryScore > 0)
    .sort((a, b) => b.categoryScore - a.categoryScore)
    .slice(0, 10);

  const top10PercentCount = Math.max(1, Math.ceil(profiles.length * 0.1));
  const currentUserRank = sortedProfiles.findIndex(p => p.user_id === currentUserId) + 1;
  const isInTop10Percent = currentUserRank > 0 && currentUserRank <= top10PercentCount;

  return (
    <div className="space-y-4">
      {/* Category Header */}
      <div className={cn("p-4 rounded-xl", config.bgColor, config.borderColor, "border")}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon className={cn("w-5 h-5", config.color)} />
            <h3 className="font-bold text-slate-900">{config.label}</h3>
          </div>
          <Badge variant="outline" className="gap-1">
            <RewardIcon className="w-3 h-3" />
            Top 10% Reward
          </Badge>
        </div>
        <p className="text-sm text-slate-600 mb-2">{config.description}</p>
        <div className="flex items-center gap-2 text-xs">
          <Gift className={cn("w-4 h-4", config.color)} />
          <span className="font-medium text-slate-700">{config.reward}</span>
        </div>
      </div>

      {/* Leaderboard */}
      {sortedProfiles.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <Icon className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p>No activity yet this season</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedProfiles.map((entry, idx) => {
            const rank = idx + 1;
            const isTop10Percent = rank <= top10PercentCount;
            const isCurrentUser = entry.user_id === currentUserId;
            
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-colors",
                  isCurrentUser ? "bg-violet-50 border border-violet-200" : 
                  isTop10Percent ? "bg-amber-50/50 border border-amber-100" : "hover:bg-slate-50"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                  rank <= 3 ? RANK_STYLES[rank]?.bg : isTop10Percent ? "bg-amber-100" : "bg-slate-100",
                  rank <= 3 ? RANK_STYLES[rank]?.text : isTop10Percent ? "text-amber-700" : "text-slate-600"
                )}>
                  {rank}
                </div>
                <RankedAvatar
                  src={entry.avatar_url}
                  name={entry.display_name}
                  size={36}
                  userId={entry.user_id}
                  rpRankCode={entry.rp_rank_code}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn(
                      "font-medium truncate",
                      isCurrentUser ? "text-violet-900" : "text-slate-900"
                    )}>
                      {entry.display_name || 'User'}
                    </p>
                    {isCurrentUser && <Badge variant="outline" className="text-xs">You</Badge>}
                    {isTop10Percent && !isCurrentUser && (
                      <Sparkles className="w-3 h-3 text-amber-500" />
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn("font-bold", config.color)}>
                    {entry.categoryScore.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-400">
                    {category === 'mystics' ? 'score' : config.metric.replace('_season', '').replace(/_/g, ' ')}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Current User Position if not in top 10 */}
      {currentUserRank > 10 && (
        <div className="pt-2 border-t border-dashed border-slate-200">
          <p className="text-xs text-slate-500 mb-2">Your Position</p>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-violet-50 border border-violet-200">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600">
              {currentUserRank}
            </div>
            <p className="flex-1 font-medium text-violet-900">You</p>
            <div className="text-right">
              <p className={cn("font-bold", config.color)}>
                {(profiles.find(p => p.user_id === currentUserId)?.[config.metric] || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top 10% Status */}
      {currentUserRank > 0 && (
        <div className={cn(
          "p-3 rounded-lg text-center",
          isInTop10Percent ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"
        )}>
          {isInTop10Percent ? (
            <p className="font-medium flex items-center justify-center gap-2">
              <Crown className="w-4 h-4" />
              You're in the Top 10%! Reward unlocked at season end.
            </p>
          ) : (
            <p className="text-sm">
              Reach rank {top10PercentCount} or higher to earn season rewards
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function SeasonalLeaderboard() {
  const [activeCategory, setActiveCategory] = useState('titans');

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: seasons = [] } = useQuery({
    queryKey: ['activeSeason'],
    queryFn: () => base44.entities.Season.filter({ status: 'active' }, '-created_date', 1)
  });
  const currentSeason = seasons[0];

  const { data: profiles = [] } = useQuery({
    queryKey: ['seasonalProfiles'],
    queryFn: () => base44.entities.UserProfile.list('-ggg_earned_season', 100)
  });

  const seasonProgress = currentSeason ? (() => {
    const start = new Date(currentSeason.start_date);
    const end = new Date(currentSeason.end_date);
    const now = new Date();
    const total = end - start;
    const elapsed = now - start;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  })() : 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-violet-600 to-purple-600 text-white pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <CardTitle className="text-xl flex items-center gap-2 text-white">
              <Trophy className="w-6 h-6 text-amber-300" />
              {currentSeason?.name || 'Season 1'}
            </CardTitle>
            {currentSeason?.theme && (
              <p className="text-violet-200 text-sm mt-1">{currentSeason.theme}</p>
            )}
          </div>
          {currentSeason && (
            <div className="text-right">
              <p className="text-xs text-violet-200 mb-1">Season Ends In</p>
              <SeasonCountdown endDate={currentSeason.end_date} />
            </div>
          )}
        </div>
        
        {/* Season Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-violet-200">
            <span>Season Progress</span>
            <span>{Math.round(seasonProgress)}%</span>
          </div>
          <Progress value={seasonProgress} className="h-2 bg-violet-500/30" />
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {/* Category Tabs */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="w-full grid grid-cols-4 mb-4">
            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
              const Icon = config.icon;
              return (
                <TabsTrigger key={key} value={key} className="gap-1 text-xs">
                  <Icon className="w-3 h-3" />
                  <span className="hidden sm:inline">{config.label.replace('The ', '')}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {Object.keys(CATEGORY_CONFIG).map(category => (
            <TabsContent key={category} value={category}>
              <CategoryLeaderboard 
                category={category} 
                profiles={profiles}
                currentUserId={currentUser?.email}
              />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}