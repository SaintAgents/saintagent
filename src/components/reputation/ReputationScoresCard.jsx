import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProgressRing from '@/components/hud/ProgressRing';
import { TrendingUp, BadgeCheck, RefreshCw } from 'lucide-react';

export default function ReputationScoresCard({ userId, onUpdated }) {
  const [refreshing, setRefreshing] = React.useState(false);
  const [ib, setIB] = React.useState(null);
  const [eb, setEB] = React.useState(null);
  const qc = useQueryClient();

  // Fetch profile to get scores directly - this always works
  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['repProfile', userId],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: userId }),
    enabled: !!userId,
    staleTime: 30000,
  });
  const profile = profiles?.[0];
  const influence = profile?.influence_score || 0;
  const expertise = profile?.expertise_score || 0;

  const recompute = async () => {
    setRefreshing(true);
    try {
      const { data } = await base44.functions.invoke('computeReputationScores', { target_user_id: userId });
      if (data?.influence?.breakdown) setIB(data.influence.breakdown);
      if (data?.expertise?.breakdown) setEB(data.expertise.breakdown);
      qc.invalidateQueries({ queryKey: ['repProfile', userId] });
      qc.invalidateQueries({ queryKey: ['userProfile'] });
      onUpdated?.(data);
    } catch (err) {
      console.error('Reputation refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex items-center justify-between pb-2">
        <CardTitle>Reputation Metrics</CardTitle>
        <Button size="sm" variant="outline" onClick={recompute} disabled={refreshing || isLoading} className="rounded-lg gap-1">
          <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Updating…' : 'Refresh'}
        </Button>
      </CardHeader>
      <CardContent className="pt-2">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-center gap-6">
              <div className="w-[88px] h-[88px] rounded-full bg-slate-100 animate-pulse" />
              <div className="space-y-2">
                <div className="h-5 w-24 bg-slate-200 rounded animate-pulse" />
                <div className="h-3 w-32 bg-slate-100 rounded animate-pulse" />
                <div className="h-3 w-28 bg-slate-100 rounded animate-pulse" />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="w-[88px] h-[88px] rounded-full bg-slate-100 animate-pulse" />
              <div className="space-y-2">
                <div className="h-5 w-24 bg-slate-200 rounded animate-pulse" />
                <div className="h-3 w-32 bg-slate-100 rounded animate-pulse" />
                <div className="h-3 w-28 bg-slate-100 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Influence Ring */}
            <div className="flex flex-col items-center">
              <ProgressRing value={influence} max={100} size={88} strokeWidth={8} color="violet" label={`${Math.round(influence)}`} sublabel="/100" />
              <div className="mt-3 flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                <TrendingUp className="w-4 h-4 text-violet-600" /> Influence
              </div>
              {ib ? (
                <div className="mt-2 text-xs space-y-1 text-center">
                  <div className="text-slate-500 dark:text-slate-400">Engagement <span className="text-slate-900 dark:text-white font-medium">{ib.engagement}</span></div>
                  <div className="text-slate-500 dark:text-slate-400">Content <span className="text-slate-900 dark:text-white font-medium">{ib.content}</span></div>
                  <div className="text-slate-500 dark:text-slate-400">Mentorship <span className="text-slate-900 dark:text-white font-medium">{ib.mentorship}</span></div>
                </div>
              ) : (
                <p className="mt-2 text-xs text-slate-400">Click Refresh for breakdown</p>
              )}
            </div>
            
            {/* Expertise Ring */}
            <div className="flex flex-col items-center">
              <ProgressRing value={expertise} max={100} size={88} strokeWidth={8} color="emerald" label={`${Math.round(expertise)}`} sublabel="/100" />
              <div className="mt-3 flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                <BadgeCheck className="w-4 h-4 text-emerald-600" /> Expertise
              </div>
              {eb ? (
                <div className="mt-2 text-xs space-y-1 text-center">
                  <div className="text-slate-500 dark:text-slate-400">Skills <span className="text-slate-900 dark:text-white font-medium">{eb.skills}</span></div>
                  <div className="text-slate-500 dark:text-slate-400">Projects <span className="text-slate-900 dark:text-white font-medium">{eb.projects}</span></div>
                  <div className="text-slate-500 dark:text-slate-400">Peer Reviews <span className="text-slate-900 dark:text-white font-medium">{eb.peer}</span></div>
                </div>
              ) : (
                <p className="mt-2 text-xs text-slate-400">Click Refresh for breakdown</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}