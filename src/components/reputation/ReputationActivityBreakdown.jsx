import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Target, Users, ShoppingBag, BookOpen, MessageSquare,
  Handshake, RefreshCw, Shield, TrendingUp, Star
} from 'lucide-react';

const ACTIVITY_CATEGORIES = [
  { key: 'missions', label: 'Missions', icon: Target, color: 'bg-violet-500', trackColor: 'bg-violet-100', textColor: 'text-violet-700', description: 'Completed & active missions' },
  { key: 'mentorship', label: 'Mentorship', icon: BookOpen, color: 'bg-blue-500', trackColor: 'bg-blue-100', textColor: 'text-blue-700', description: 'Sessions & reviews' },
  { key: 'marketplace', label: 'Marketplace', icon: ShoppingBag, color: 'bg-emerald-500', trackColor: 'bg-emerald-100', textColor: 'text-emerald-700', description: 'Sales & bookings' },
  { key: 'social', label: 'Social', icon: Users, color: 'bg-amber-500', trackColor: 'bg-amber-100', textColor: 'text-amber-700', description: 'Posts, comments & follows' },
  { key: 'testimonials', label: 'Testimonials', icon: Star, color: 'bg-rose-500', trackColor: 'bg-rose-100', textColor: 'text-rose-700', description: 'Peer endorsements' },
  { key: 'collaboration', label: 'Collaboration', icon: Handshake, color: 'bg-cyan-500', trackColor: 'bg-cyan-100', textColor: 'text-cyan-700', description: 'Meetings & projects' },
];

function ActivityBar({ category, value, maxValue }) {
  const Icon = category.icon;
  const percent = maxValue > 0 ? Math.round((value / maxValue) * 100) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg ${category.color} flex items-center justify-center`}>
            <Icon className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800">{category.label}</p>
            <p className="text-[11px] text-slate-400">{category.description}</p>
          </div>
        </div>
        <Badge variant="outline" className={`${category.textColor} text-xs font-semibold`}>
          {value} pts
        </Badge>
      </div>
      <div className="relative h-2.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 rounded-full ${category.color} transition-all duration-700 ease-out`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default function ReputationActivityBreakdown({ userId, profile }) {
  const [loading, setLoading] = useState(false);
  const [breakdown, setBreakdown] = useState(null);

  // Fetch activity counts for breakdown estimation
  const { data: repEvents = [] } = useQuery({
    queryKey: ['repEventsBreakdown', userId],
    queryFn: () => base44.entities.ReputationEvent.filter({ user_id: userId }, '-created_date', 200),
    enabled: !!userId,
    staleTime: 300000,
  });

  const { data: trustEvents = [] } = useQuery({
    queryKey: ['trustEventsBreakdown', userId],
    queryFn: () => base44.entities.TrustEvent.filter({ user_id: userId }, '-created_date', 200),
    enabled: !!userId,
    staleTime: 300000,
  });

  // Compute breakdown from actual events
  const computed = React.useMemo(() => {
    if (breakdown) return breakdown;

    const allEvents = [...repEvents, ...trustEvents];
    const buckets = { missions: 0, mentorship: 0, marketplace: 0, social: 0, testimonials: 0, collaboration: 0 };

    allEvents.forEach(e => {
      const src = (e.source_type || '').toLowerCase();
      const reason = (e.reason_code || '').toLowerCase();
      const delta = Math.abs(e.delta || 0);

      if (src === 'mission' || reason.includes('mission')) {
        buckets.missions += delta;
      } else if (src === 'testimonial' || reason.includes('testimonial') || reason.includes('endorsement')) {
        buckets.testimonials += delta;
      } else if (src === 'meeting' || src === 'booking' || reason.includes('meeting') || reason.includes('booking')) {
        buckets.collaboration += delta;
      } else if (reason.includes('mentor') || reason.includes('session')) {
        buckets.mentorship += delta;
      } else if (reason.includes('sale') || reason.includes('market') || reason.includes('listing') || reason.includes('purchase')) {
        buckets.marketplace += delta;
      } else if (src === 'post' || src === 'comment' || reason.includes('post') || reason.includes('follow') || reason.includes('social')) {
        buckets.social += delta;
      } else {
        // Distribute to social as a catch-all
        buckets.social += delta;
      }
    });

    // Round values
    Object.keys(buckets).forEach(k => { buckets[k] = Math.round(buckets[k]); });
    return buckets;
  }, [repEvents, trustEvents, breakdown]);

  const maxValue = Math.max(...Object.values(computed), 1);
  const totalPoints = Object.values(computed).reduce((s, v) => s + v, 0);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const [trustRes, repRes] = await Promise.all([
        base44.functions.invoke('computeTrustScore', { target_user_id: userId }),
        base44.functions.invoke('computeReputationScores', { target_user_id: userId }),
      ]);

      const tb = trustRes.data?.breakdown || {};
      const ib = repRes.data?.influence?.breakdown || {};
      const eb = repRes.data?.expertise?.breakdown || {};

      setBreakdown({
        missions: Math.round((eb.projects || 0) * 2 + (ib.engagement || 0)),
        mentorship: Math.round((ib.mentorship || 0) * 3),
        marketplace: Math.round((eb.skills || 0) * 1.5),
        social: Math.round((ib.content || 0) * 2 + (ib.engagement || 0)),
        testimonials: Math.round((tb.testimonials || 0) * 2),
        collaboration: Math.round((tb.collaborations || 0) * 2 + (tb.interactions || 0)),
      });
    } catch (err) {
      console.error('Refresh breakdown error:', err);
    } finally {
      setLoading(false);
    }
  };

  const trustScore = profile?.trust_score || 0;
  const influenceScore = profile?.influence_score || 0;
  const expertiseScore = profile?.expertise_score || 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-violet-600" />
            Reputation Activity Breakdown
          </CardTitle>
          <p className="text-xs text-slate-500 mt-1">How your activities contribute to trust & reputation</p>
        </div>
        <Button size="sm" variant="outline" onClick={handleRefresh} disabled={loading} className="gap-1.5">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Analyzing…' : 'Refresh'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Score summary row */}
        <div className="grid grid-cols-3 gap-3">
          <ScorePill label="Trust" value={trustScore} icon={Shield} color="emerald" />
          <ScorePill label="Influence" value={influenceScore} icon={TrendingUp} color="violet" />
          <ScorePill label="Expertise" value={expertiseScore} icon={Star} color="blue" />
        </div>

        {/* Activity bars */}
        <div className="space-y-4">
          {ACTIVITY_CATEGORIES.map(cat => (
            <ActivityBar key={cat.key} category={cat} value={computed[cat.key]} maxValue={maxValue} />
          ))}
        </div>

        {/* Total points */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <span className="text-sm text-slate-500">Total activity points</span>
          <span className="text-lg font-bold text-slate-900">{totalPoints.toLocaleString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function ScorePill({ label, value, icon: Icon, color }) {
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    violet: 'bg-violet-50 text-violet-700 border-violet-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${colors[color]}`}>
      <Icon className="w-4 h-4" />
      <div>
        <p className="text-[11px] font-medium opacity-70">{label}</p>
        <p className="text-base font-bold">{Math.round(value)}</p>
      </div>
    </div>
  );
}