import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, AlertTriangle, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ReviewerPerformanceCard({ reviewer, profiles = [] }) {
  const profile = profiles.find(p => p.user_id === reviewer.id);
  const assignments = reviewer.assignments || [];
  const active = assignments.filter(a => !['submitted', 'returned'].includes(a.status));
  const submitted = assignments.filter(a => a.status === 'submitted');
  const overdue = active.filter(a => a.due_date && new Date(a.due_date) < new Date());

  // Performance metrics
  const withScores = submitted.filter(a => a.reviewer_weighted_score > 0);
  const avgScore = withScores.length > 0
    ? withScores.reduce((s, a) => s + a.reviewer_weighted_score, 0) / withScores.length
    : 0;
  const avgDeviation = withScores.length > 0
    ? withScores.reduce((s, a) => s + (a.score_deviation || 0), 0) / withScores.length
    : 0;

  // Avg turnaround
  const completedWithTime = submitted.filter(a => a.started_at && a.completed_at);
  const avgHours = completedWithTime.length > 0
    ? completedWithTime.reduce((s, a) => s + (new Date(a.completed_at) - new Date(a.started_at)) / 3600000, 0) / completedWithTime.length
    : 0;

  return (
    <Card className="hover:border-violet-300 transition-colors">
      <CardContent className="pt-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-violet-100 text-violet-600 text-sm">
              {(profile?.display_name || reviewer.name || 'R').charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-slate-900 truncate">{profile?.display_name || reviewer.name}</p>
            <p className="text-xs text-slate-500 truncate">{reviewer.id}</p>
          </div>
        </div>

        {/* Workload */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded bg-blue-50">
            <div className="text-lg font-bold text-blue-700">{active.length}</div>
            <div className="text-[10px] text-slate-500">Active</div>
          </div>
          <div className="p-2 rounded bg-emerald-50">
            <div className="text-lg font-bold text-emerald-700">{submitted.length}</div>
            <div className="text-[10px] text-slate-500">Done</div>
          </div>
          <div className={cn("p-2 rounded", overdue.length > 0 ? "bg-rose-50" : "bg-slate-50")}>
            <div className={cn("text-lg font-bold", overdue.length > 0 ? "text-rose-700" : "text-slate-400")}>{overdue.length}</div>
            <div className="text-[10px] text-slate-500">Overdue</div>
          </div>
        </div>

        {/* Metrics */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1"><BarChart3 className="w-3 h-3" />Avg Score</span>
            <span className="font-medium">{avgScore > 0 ? avgScore.toFixed(0) : '—'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Avg AI Deviation</span>
            <span className={cn("font-medium", avgDeviation > 10 ? "text-amber-600" : "text-emerald-600")}>
              ±{avgDeviation > 0 ? avgDeviation.toFixed(1) : '—'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" />Avg Turnaround</span>
            <span className="font-medium">{avgHours > 0 ? `${avgHours.toFixed(0)}h` : '—'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}