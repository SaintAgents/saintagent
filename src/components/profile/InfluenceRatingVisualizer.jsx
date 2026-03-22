import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, TrendingUp, Shield, Star, MessageSquare, Coins, Users, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import InfluenceRadarChart from './InfluenceRadarChart';
import InfluenceTrendChart from './InfluenceTrendChart';

const INFLUENCE_TIERS = [
  { min: 0, label: 'Newcomer', color: 'slate', icon: '🌱' },
  { min: 15, label: 'Contributor', color: 'blue', icon: '⚡' },
  { min: 35, label: 'Influencer', color: 'violet', icon: '🔮' },
  { min: 55, label: 'Authority', color: 'amber', icon: '👑' },
  { min: 75, label: 'Luminary', color: 'emerald', icon: '🌟' },
  { min: 90, label: 'Ascended', color: 'rose', icon: '🔥' },
];

function getTier(score) {
  return [...INFLUENCE_TIERS].reverse().find(t => score >= t.min) || INFLUENCE_TIERS[0];
}

const TIER_BG = {
  slate: 'from-slate-100 to-slate-200 border-slate-300',
  blue: 'from-blue-50 to-blue-100 border-blue-300',
  violet: 'from-violet-50 to-purple-100 border-violet-300',
  amber: 'from-amber-50 to-yellow-100 border-amber-300',
  emerald: 'from-emerald-50 to-teal-100 border-emerald-300',
  rose: 'from-rose-50 to-pink-100 border-rose-300',
};

const TIER_TEXT = {
  slate: 'text-slate-700',
  blue: 'text-blue-700',
  violet: 'text-violet-700',
  amber: 'text-amber-700',
  emerald: 'text-emerald-700',
  rose: 'text-rose-700',
};

export default function InfluenceRatingVisualizer({ userId, profile }) {
  // Fetch all data sources in parallel
  const { data: repEvents = [] } = useQuery({
    queryKey: ['influenceRepEvents', userId],
    queryFn: () => base44.entities.ReputationEvent.filter({ user_id: userId }, '-created_date', 200),
    enabled: !!userId,
    staleTime: 120000,
  });

  const { data: trustEvents = [] } = useQuery({
    queryKey: ['influenceTrustEvents', userId],
    queryFn: () => base44.entities.TrustEvent.filter({ user_id: userId }, '-created_date', 200),
    enabled: !!userId,
    staleTime: 120000,
  });

  const { data: gggTx = [] } = useQuery({
    queryKey: ['influenceGGG', userId],
    queryFn: () => base44.entities.GGGTransaction.filter({ user_id: userId }, '-created_date', 200),
    enabled: !!userId,
    staleTime: 120000,
  });

  const { data: testimonials = [] } = useQuery({
    queryKey: ['influenceTestimonials', userId],
    queryFn: () => base44.entities.Testimonial.filter({ to_user_id: userId }, '-created_date', 100),
    enabled: !!userId,
    staleTime: 120000,
  });

  // Compute dimension scores (each 0–100)
  const dimensions = useMemo(() => {
    // 1. Reputation: total RP gained, capped at 100
    const totalRP = repEvents.reduce((s, e) => s + Math.max(0, e.delta || 0), 0);
    const reputationScore = Math.min(100, (totalRP / 500) * 100);

    // 2. Trust: use latest trust score or aggregate
    const latestTrust = trustEvents.length > 0 ? (trustEvents[0].score_after || 0) : 0;
    const trustScore = Math.min(100, latestTrust);

    // 3. Economic: total GGG earned
    const totalEarned = gggTx.reduce((s, t) => s + Math.max(0, t.delta || 0), 0);
    const economicScore = Math.min(100, (totalEarned / 1000) * 100);

    // 4. Social Proof: testimonials count & avg rating
    const avgRating = testimonials.length > 0
      ? testimonials.reduce((s, t) => s + (t.rating || 3), 0) / testimonials.length
      : 0;
    const socialScore = Math.min(100, (testimonials.length * 10) + (avgRating * 8));

    // 5. Engagement: diversity of activity sources
    const uniqueSources = new Set([
      ...repEvents.map(e => e.source_type),
      ...gggTx.map(t => t.source_type),
    ]);
    const engagementScore = Math.min(100, uniqueSources.size * 12 + (repEvents.length + gggTx.length) * 0.3);

    // 6. Community: followers + following
    const followers = profile?.follower_count || 0;
    const following = profile?.following_count || 0;
    const communityScore = Math.min(100, (followers * 5) + (following * 2));

    return {
      reputation: Math.round(reputationScore),
      trust: Math.round(trustScore),
      economic: Math.round(economicScore),
      social: Math.round(socialScore),
      engagement: Math.round(engagementScore),
      community: Math.round(communityScore),
    };
  }, [repEvents, trustEvents, gggTx, testimonials, profile]);

  // Overall Influence Rating: weighted average
  const overallScore = useMemo(() => {
    const weights = { reputation: 0.25, trust: 0.20, economic: 0.15, social: 0.20, engagement: 0.10, community: 0.10 };
    return Math.round(
      Object.entries(weights).reduce((sum, [key, w]) => sum + (dimensions[key] || 0) * w, 0)
    );
  }, [dimensions]);

  const tier = getTier(overallScore);

  // Trend data (last 30 days of rep events grouped by week)
  const trendData = useMemo(() => {
    const now = Date.now();
    const weeks = [0, 1, 2, 3].map(i => {
      const end = now - i * 7 * 86400000;
      const start = end - 7 * 86400000;
      const weekRep = repEvents.filter(e => {
        const d = new Date(e.created_date).getTime();
        return d >= start && d < end;
      }).reduce((s, e) => s + Math.max(0, e.delta || 0), 0);
      const weekGGG = gggTx.filter(t => {
        const d = new Date(t.created_date).getTime();
        return d >= start && d < end;
      }).reduce((s, t) => s + Math.max(0, t.delta || 0), 0);
      return {
        label: `W-${3 - i}`,
        rp: Math.round(weekRep),
        ggg: Math.round(weekGGG * 10) / 10,
      };
    });
    return weeks.reverse();
  }, [repEvents, gggTx]);

  const dimensionMeta = [
    { key: 'reputation', label: 'Reputation', icon: Award, color: 'violet' },
    { key: 'trust', label: 'Trust', icon: Shield, color: 'emerald' },
    { key: 'economic', label: 'Economic', icon: Coins, color: 'amber' },
    { key: 'social', label: 'Social Proof', icon: Star, color: 'pink' },
    { key: 'engagement', label: 'Engagement', icon: Zap, color: 'blue' },
    { key: 'community', label: 'Community', icon: Users, color: 'cyan' },
  ];

  return (
    <Card className="overflow-hidden">
      <CardHeader className={cn("bg-gradient-to-r border-b", TIER_BG[tier.color])}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className={cn("w-5 h-5", TIER_TEXT[tier.color])} />
            <span className={TIER_TEXT[tier.color]}>Influence Rating</span>
          </CardTitle>
          <Badge className={cn("text-sm font-bold gap-1", TIER_TEXT[tier.color], `bg-white/60`)}>
            {tier.icon} {tier.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-5 space-y-5">
        {/* Score Ring + Tier */}
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24 shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke={tier.color === 'slate' ? '#94a3b8' : tier.color === 'blue' ? '#3b82f6' : tier.color === 'violet' ? '#8b5cf6' : tier.color === 'amber' ? '#f59e0b' : tier.color === 'emerald' ? '#10b981' : '#f43f5e'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(overallScore / 100) * 264} 264`}
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-slate-900">{overallScore}</span>
              <span className="text-[10px] text-slate-500">/100</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-600 mb-3">
              Aggregated from reputation events, trust history, transactions, and community feedback.
            </p>
            {/* Dimension bars */}
            <div className="space-y-1.5">
              {dimensionMeta.map(({ key, label, icon: Icon }) => (
                <div key={key} className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-[11px] text-slate-500 w-20 shrink-0">{label}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500",
                        key === 'reputation' && 'bg-violet-500',
                        key === 'trust' && 'bg-emerald-500',
                        key === 'economic' && 'bg-amber-500',
                        key === 'social' && 'bg-pink-500',
                        key === 'engagement' && 'bg-blue-500',
                        key === 'community' && 'bg-cyan-500',
                      )}
                      style={{ width: `${dimensions[key]}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-slate-700 w-7 text-right">{dimensions[key]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Radar Chart */}
        <InfluenceRadarChart dimensions={dimensions} />

        {/* Trend Chart */}
        <InfluenceTrendChart data={trendData} />

        {/* Activity Summary */}
        <div className="grid grid-cols-3 gap-3 pt-1">
          <div className="text-center p-2 rounded-lg bg-slate-50">
            <p className="text-lg font-bold text-slate-900">{repEvents.length}</p>
            <p className="text-[10px] text-slate-500">RP Events</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-slate-50">
            <p className="text-lg font-bold text-slate-900">{testimonials.length}</p>
            <p className="text-[10px] text-slate-500">Testimonials</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-slate-50">
            <p className="text-lg font-bold text-slate-900">{gggTx.length}</p>
            <p className="text-[10px] text-slate-500">Transactions</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}