import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Users, Coins, TrendingUp, Crown, Medal, Award, ChevronDown, ChevronUp } from 'lucide-react';

const TIER_CONFIG = {
  5: { label: 'Diamond', color: 'bg-violet-100 text-violet-700 border-violet-300', icon: Crown },
  4: { label: 'Platinum', color: 'bg-blue-100 text-blue-700 border-blue-300', icon: Crown },
  3: { label: 'Gold', color: 'bg-amber-100 text-amber-700 border-amber-300', icon: Trophy },
  2: { label: 'Silver', color: 'bg-slate-100 text-slate-700 border-slate-300', icon: Medal },
  1: { label: 'Bronze', color: 'bg-orange-100 text-orange-700 border-orange-300', icon: Award },
};

const RANK_STYLES = [
  'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 ring-1 ring-amber-200/50',
  'bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200 ring-1 ring-slate-200/50',
  'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 ring-1 ring-orange-200/50',
];

const RANK_ICONS = ['🥇', '🥈', '🥉'];

function ReferrerRow({ affiliate, rank }) {
  const tier = TIER_CONFIG[affiliate.tier_level || 1];
  const TierIcon = tier.icon;
  const isTopThree = rank < 3;

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:shadow-sm ${isTopThree ? RANK_STYLES[rank] : 'bg-white border-slate-100 hover:border-slate-200'}`}>
      {/* Rank */}
      <div className="w-8 text-center shrink-0">
        {rank < 3 ? (
          <span className="text-xl">{RANK_ICONS[rank]}</span>
        ) : (
          <span className="text-sm font-bold text-slate-400">#{rank + 1}</span>
        )}
      </div>

      {/* Avatar */}
      <Avatar className="h-10 w-10 shrink-0" data-user-id={affiliate.user_id}>
        <AvatarImage src={affiliate.avatar_url} />
        <AvatarFallback className="text-xs bg-violet-100 text-violet-700">
          {(affiliate.display_name || affiliate.code)?.[0]?.toUpperCase() || '?'}
        </AvatarFallback>
      </Avatar>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-slate-900 truncate" data-user-id={affiliate.user_id}>
            {affiliate.display_name || `Agent ${affiliate.sa_number || affiliate.code}`}
          </span>
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${tier.color}`}>
            <TierIcon className="w-2.5 h-2.5 mr-0.5" />
            {tier.label}
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {affiliate.total_activated || 0} referred
          </span>
          {affiliate.sa_number && (
            <span className="text-violet-500 font-mono">SA#{affiliate.sa_number}</span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="text-right shrink-0">
        <div className="flex items-center gap-1 justify-end">
          <Coins className="w-3.5 h-3.5 text-amber-500" />
          <span className="font-bold text-sm text-slate-900">
            {(affiliate.total_ggg_earned || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })}
          </span>
        </div>
        <p className="text-[10px] text-slate-400">GGG earned</p>
      </div>
    </div>
  );
}

export default function TopReferrersLeaderboard({ limit = 10 }) {
  const [showAll, setShowAll] = useState(false);

  const { data: affiliates = [], isLoading } = useQuery({
    queryKey: ['topReferrers'],
    queryFn: async () => {
      const all = await base44.entities.AffiliateCode.filter(
        { status: 'active' },
        '-total_activated',
        50
      );
      // Filter to those with at least 1 referral and sort by activated count
      return all
        .filter(a => (a.total_activated || 0) > 0)
        .sort((a, b) => (b.total_activated || 0) - (a.total_activated || 0));
    },
    staleTime: 120000,
  });

  const displayed = showAll ? affiliates : affiliates.slice(0, limit);
  const totalReferred = affiliates.reduce((sum, a) => sum + (a.total_activated || 0), 0);
  const totalGGG = affiliates.reduce((sum, a) => sum + (a.total_ggg_earned || 0), 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Top Referrers
          </CardTitle>
          <Badge variant="outline" className="text-xs text-slate-500">
            {affiliates.length} affiliates
          </Badge>
        </div>
        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-violet-50 border border-violet-100">
            <Users className="w-4 h-4 text-violet-600" />
            <div>
              <p className="text-lg font-bold text-violet-900">{totalReferred.toLocaleString()}</p>
              <p className="text-[10px] text-violet-600">Total Referrals</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-100">
            <Coins className="w-4 h-4 text-amber-600" />
            <div>
              <p className="text-lg font-bold text-amber-900">{totalGGG.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              <p className="text-[10px] text-amber-600">GGG Earned</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-600" />
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No referrers yet</p>
            <p className="text-xs text-slate-400">Be the first to refer someone!</p>
          </div>
        ) : (
          <>
            {displayed.map((affiliate, idx) => (
              <ReferrerRow key={affiliate.id} affiliate={affiliate} rank={idx} />
            ))}
            {affiliates.length > limit && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-slate-500 hover:text-slate-700"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? (
                  <>Show Less <ChevronUp className="w-4 h-4 ml-1" /></>
                ) : (
                  <>Show All ({affiliates.length}) <ChevronDown className="w-4 h-4 ml-1" /></>
                )}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}