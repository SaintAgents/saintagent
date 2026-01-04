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
      const { data } = await base44.functions.invoke('computeReputationScores', { target_user_id: userId });
      if (data?.influence?.score != null) setInfluence(data.influence.score);
      if (data?.expertise?.score != null) setExpertise(data.expertise.score);
      setIB(data?.influence?.breakdown || null);
      setEB(data?.expertise?.breakdown || null);
      qc.invalidateQueries({ queryKey: ['userProfile'] });
      onUpdated?.(data);
    } catch (err) {
      setError('Failed to load');
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
          <div className="flex items-center justify-center py-6 text-slate-400 text-sm">Loading...</div>
        ) : error ? (
          <div className="flex items-center justify-center py-6 text-red-500 text-sm">{error}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-center gap-6">
              <ProgressRing value={influence} max={100} size={88} strokeWidth={8} color="violet" label={`${influence}`} sublabel="/100" />
              <div>
                <div className="flex items-center gap-2 font-semibold text-slate-900"><TrendingUp className="w-5 h-5 text-violet-600" /> Influence</div>
                {ib && (
                  <div className="mt-1 text-sm grid grid-cols-2 gap-x-4 gap-y-0.5 text-slate-600">
                    <div>Engagement</div><div className="text-slate-900 font-medium">{ib.engagement}</div>
                    <div>Content</div><div className="text-slate-900 font-medium">{ib.content}</div>
                    <div>Mentorship</div><div className="text-slate-900 font-medium">{ib.mentorship}</div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-6">
              <ProgressRing value={expertise} max={100} size={88} strokeWidth={8} color="emerald" label={`${expertise}`} sublabel="/100" />
              <div>
                <div className="flex items-center gap-2 font-semibold text-slate-900"><BadgeCheck className="w-5 h-5 text-emerald-600" /> Expertise</div>
                {eb && (
                  <div className="mt-1 text-sm grid grid-cols-2 gap-x-4 gap-y-0.5 text-slate-600">
                    <div>Skills</div><div className="text-slate-900 font-medium">{eb.skills}</div>
                    <div>Projects</div><div className="text-slate-900 font-medium">{eb.projects}</div>
                    <div>Peer Reviews</div><div className="text-slate-900 font-medium">{eb.peer}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}