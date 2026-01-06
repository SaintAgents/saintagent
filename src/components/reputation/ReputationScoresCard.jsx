import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProgressRing from '@/components/hud/ProgressRing';
import { TrendingUp, BadgeCheck } from 'lucide-react';

export default function ReputationScoresCard({ userId, onUpdated }) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [influence, setInfluence] = React.useState(0);
  const [expertise, setExpertise] = React.useState(0);
  const [ib, setIB] = React.useState(null);
  const [eb, setEB] = React.useState(null);
  const qc = useQueryClient();

  const recompute = async () => {
    setLoading(true);
    setError(null);
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timed out')), 15000)
      );
      const fetchPromise = base44.functions.invoke('computeReputationScores', { target_user_id: userId });
      const { data } = await Promise.race([fetchPromise, timeoutPromise]);
      if (data?.influence?.score != null) setInfluence(data.influence.score);
      if (data?.expertise?.score != null) setExpertise(data.expertise.score);
      setIB(data?.influence?.breakdown || null);
      setEB(data?.expertise?.breakdown || null);
      qc.invalidateQueries({ queryKey: ['userProfile'] });
      onUpdated?.(data);
    } catch (err) {
      setError(err.message === 'Request timed out' ? 'Request timed out' : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { if (userId) recompute(); }, [userId]);

  return (
    <Card>
      <CardHeader className="flex items-center justify-between pb-2">
        <CardTitle>Reputation Metrics</CardTitle>
        <Button size="sm" variant="outline" onClick={recompute} disabled={loading} className="rounded-lg">
          {loading ? 'Updating…' : 'Refresh'}
        </Button>
      </CardHeader>
      <CardContent className="pt-2">
        {loading ? (
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
        ) : error ? (
          <div className="flex items-center justify-center py-6 text-red-500 text-sm">{error}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Influence Ring */}
            <div className="flex flex-col items-center">
              <ProgressRing value={influence} max={100} size={88} strokeWidth={8} color="violet" label={`${influence}`} sublabel="/100" />
              <div className="mt-3 flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                <TrendingUp className="w-4 h-4 text-violet-600" /> Influence
              </div>
              {ib && (
                <div className="mt-2 text-xs space-y-1 text-center">
                  <div className="text-slate-500 dark:text-slate-400">Engagement <span className="text-slate-900 dark:text-white font-medium">{ib.engagement}</span></div>
                  <div className="text-slate-500 dark:text-slate-400">Content <span className="text-slate-900 dark:text-white font-medium">{ib.content}</span></div>
                  <div className="text-slate-500 dark:text-slate-400">Mentorship <span className="text-slate-900 dark:text-white font-medium">{ib.mentorship}</span></div>
                </div>
              )}
            </div>
            
            {/* Expertise Ring */}
            <div className="flex flex-col items-center">
              <ProgressRing value={expertise} max={100} size={88} strokeWidth={8} color="emerald" label={`${expertise}`} sublabel="/100" />
              <div className="mt-3 flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                <BadgeCheck className="w-4 h-4 text-emerald-600" /> Expertise
              </div>
              {eb && (
                <div className="mt-2 text-xs space-y-1 text-center">
                  <div className="text-slate-500 dark:text-slate-400">Skills <span className="text-slate-900 dark:text-white font-medium">{eb.skills}</span></div>
                  <div className="text-slate-500 dark:text-slate-400">Projects <span className="text-slate-900 dark:text-white font-medium">{eb.projects}</span></div>
                  <div className="text-slate-500 dark:text-slate-400">Peer Reviews <span className="text-slate-900 dark:text-white font-medium">{eb.peer}</span></div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}