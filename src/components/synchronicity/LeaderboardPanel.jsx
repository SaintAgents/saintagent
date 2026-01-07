import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Target, Coins, Crown, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';

const TABS = [
  { id: 'agents', label: 'Top Agents', sortField: '-rp_points' },
  { id: 'missions', label: 'Missions', sortField: '-meetings_completed' },
  { id: 'ggg', label: 'GGG Earned', sortField: '-ggg_balance' },
];

function LeaderboardRow({ user, rank, metric, metricLabel }) {
  const isTop3 = rank <= 3;
  const rankColors = {
    1: 'from-amber-400 to-yellow-300',
    2: 'from-slate-300 to-slate-200',
    3: 'from-orange-400 to-orange-300',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.05 }}
      className={`flex items-center gap-3 p-2 rounded-lg transition-all cursor-pointer hover:bg-amber-500/10 ${
        isTop3 ? 'bg-amber-900/20' : ''
      }`}
      data-user-id={user.user_id}
    >
      {/* Rank */}
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
        isTop3 
          ? `bg-gradient-to-br ${rankColors[rank]} text-black shadow-lg` 
          : 'bg-amber-900/30 text-amber-400/70'
      }`}>
        {rank}
      </div>

      {/* Avatar */}
      <div className="relative">
        <Avatar className="w-8 h-8 border border-amber-700/50">
          <AvatarImage src={user.avatar_url} />
          <AvatarFallback className="bg-amber-900/50 text-amber-200 text-xs">
            {user.display_name?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        {rank === 1 && (
          <Crown className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 text-amber-400" />
        )}
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-amber-100 truncate">{user.display_name}</p>
      </div>

      {/* Metric */}
      <div className="text-right">
        <p className="text-sm font-bold text-amber-300">{metric?.toLocaleString() || 0}</p>
        <p className="text-[10px] text-amber-400/50 uppercase">{metricLabel}</p>
      </div>
    </motion.div>
  );
}

export default function LeaderboardPanel() {
  const [activeTab, setActiveTab] = useState('agents');

  const { data: topAgents = [] } = useQuery({
    queryKey: ['leaderboard', 'agents'],
    queryFn: () => base44.entities.UserProfile.list('-rp_points', 5)
  });

  const { data: topMissions = [] } = useQuery({
    queryKey: ['leaderboard', 'missions'],
    queryFn: () => base44.entities.UserProfile.list('-meetings_completed', 5)
  });

  const { data: topGGG = [] } = useQuery({
    queryKey: ['leaderboard', 'ggg'],
    queryFn: () => base44.entities.UserProfile.list('-ggg_balance', 5)
  });

  const getLeaderboardData = () => {
    switch (activeTab) {
      case 'missions': return { data: topMissions, metric: 'meetings_completed', label: 'missions' };
      case 'ggg': return { data: topGGG, metric: 'ggg_balance', label: 'GGG' };
      default: return { data: topAgents, metric: 'rp_points', label: 'RP' };
    }
  };

  const { data, metric, label } = getLeaderboardData();

  return (
    <Card className="bg-gradient-to-b from-[#1a2f1a] to-[#0d1a0d] border-amber-900/50 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2 text-amber-100">
            <div className="p-1.5 rounded-lg bg-amber-500/20">
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
            Leaderboards
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Decorative divider */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-700/50 to-transparent" />
          <span className="text-amber-600 text-xs">◆</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-700/50 to-transparent" />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3 bg-black/30 border border-amber-900/30 rounded-lg p-1 h-auto">
            {TABS.map(tab => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="text-xs py-1.5 data-[state=active]:bg-amber-600/30 data-[state=active]:text-amber-200 text-amber-400/60 rounded"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-3">
            <ScrollArea className="h-48">
              <div className="space-y-1">
                {data.map((user, index) => (
                  <LeaderboardRow
                    key={user.id}
                    user={user}
                    rank={index + 1}
                    metric={user[metric]}
                    metricLabel={label}
                  />
                ))}
                {data.length === 0 && (
                  <div className="text-center py-8 text-amber-400/50 text-sm">
                    No data yet
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}