import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProgressRing from '@/components/hud/ProgressRing';
import { Shield } from 'lucide-react';

export default function TrustScoreCard({ userId, onUpdated }) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [score, setScore] = React.useState(0);
  const [breakdown, setBreakdown] = React.useState(null);
  const qc = useQueryClient();

  const recompute = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await base44.functions.invoke('computeTrustScore', { target_user_id: userId });
      if (data?.score != null) {
        setScore(data.score);
        setBreakdown(data.breakdown || null);
        qc.invalidateQueries({ queryKey: ['userProfile'] });
        onUpdated?.(data.score);
      }
    } catch (err) {
      setError('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (userId) recompute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return (
    <Card>
      <CardHeader className="flex items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-600" />
          Trust Score
        </CardTitle>
        <Button size="sm" variant="outline" onClick={recompute} disabled={loading} className="rounded-lg">
          {loading ? 'Updating…' : 'Refresh'}
        </Button>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="flex items-center gap-6">
          <ProgressRing value={score} max={100} size={88} strokeWidth={8} color="emerald" label={`${score}`} sublabel="/100" />
          {breakdown && (
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
              <div className="text-slate-500">Testimonials</div><div className="font-medium text-slate-900">{Math.round(breakdown.testimonials)}</div>
              <div className="text-slate-500">Collaborations</div><div className="font-medium text-slate-900">{Math.round(breakdown.collaborations)}</div>
              <div className="text-slate-500">Interactions</div><div className="font-medium text-slate-900">{Math.round(breakdown.interactions)}</div>
              <div className="text-slate-500">Presence</div><div className="font-medium text-slate-900">{Math.round(breakdown.presence)}</div>
              <div className="text-slate-500">RP</div><div className="font-medium text-slate-900">{Math.round(breakdown.rp)}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}