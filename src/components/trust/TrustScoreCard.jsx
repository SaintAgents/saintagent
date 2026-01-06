import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProgressRing from '@/components/hud/ProgressRing';
import { Shield, Search, RefreshCw } from 'lucide-react';
import TrustHistoryModal from './TrustHistoryModal';

export default function TrustScoreCard({ userId, onUpdated }) {
  const [refreshing, setRefreshing] = React.useState(false);
  const [breakdown, setBreakdown] = React.useState(null);
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const qc = useQueryClient();

  // Fetch profile to get trust_score directly - this always works
  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['trustProfile', userId],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: userId }),
    enabled: !!userId,
    staleTime: 30000,
  });
  const profile = profiles?.[0];
  const score = profile?.trust_score || 0;

  const recompute = async () => {
    setRefreshing(true);
    try {
      const { data } = await base44.functions.invoke('computeTrustScore', { target_user_id: userId });
      if (data?.breakdown) {
        setBreakdown(data.breakdown);
      }
      qc.invalidateQueries({ queryKey: ['trustProfile', userId] });
      qc.invalidateQueries({ queryKey: ['userProfile'] });
      onUpdated?.(data?.score);
    } catch (err) {
      console.error('Trust score refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-600" />
          Trust Score
        </CardTitle>
        <Button size="sm" variant="outline" onClick={recompute} disabled={refreshing || isLoading} className="rounded-lg gap-1">
          <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Updating…' : 'Refresh'}
        </Button>
      </CardHeader>
      <CardContent className="pt-2">
        {isLoading ? (
          <div className="flex items-center gap-6">
            <div className="w-[88px] h-[88px] rounded-full bg-slate-100 animate-pulse" />
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {[...Array(5)].map((_, i) => (
                <React.Fragment key={i}>
                  <div className="h-4 w-20 bg-slate-100 rounded animate-pulse" />
                  <div className="h-4 w-8 bg-slate-200 rounded animate-pulse" />
                </React.Fragment>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-6">
              <ProgressRing value={score} max={100} size={88} strokeWidth={8} color="emerald" label={`${score}`} sublabel="/100" />
              {breakdown ? (
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                  <div className="text-slate-500">Testimonials</div><div className="font-medium text-slate-900">{Math.round(breakdown.testimonials)}</div>
                  <div className="text-slate-500">Collaborations</div><div className="font-medium text-slate-900">{Math.round(breakdown.collaborations)}</div>
                  <div className="text-slate-500">Interactions</div><div className="font-medium text-slate-900">{Math.round(breakdown.interactions)}</div>
                  <div className="text-slate-500">Presence</div><div className="font-medium text-slate-900">{Math.round(breakdown.presence)}</div>
                  <div className="text-slate-500">RP</div><div className="font-medium text-slate-900">{Math.round(breakdown.rp)}</div>
                </div>
              ) : (
                <div className="text-sm text-slate-500">
                  <p className="font-medium text-slate-700">Score: {score}/100</p>
                  <p className="text-xs mt-1">Click Refresh for detailed breakdown</p>
                </div>
              )}
            </div>
            
            {/* Deep Dive Button */}
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 text-emerald-700 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300"
              onClick={() => setHistoryOpen(true)}
            >
              <Search className="w-4 h-4" />
              Deep Dive - Full Transparency Report
            </Button>
          </div>
        )}
      </CardContent>
      
      {/* Trust History Modal */}
      <TrustHistoryModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        userId={userId}
        currentScore={score}
        breakdown={breakdown}
      />
    </Card>
  );
}