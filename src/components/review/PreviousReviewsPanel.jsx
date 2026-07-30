import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, MessageSquare, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const REC_COLORS = {
  approve_fund: 'bg-emerald-100 text-emerald-700',
  incubate_derisk: 'bg-amber-100 text-amber-700',
  review_reevaluate: 'bg-blue-100 text-blue-700',
  decline: 'bg-rose-100 text-rose-700',
};

export default function PreviousReviewsPanel({ reviews = [], evaluations = [] }) {
  if (reviews.length === 0 && evaluations.length === 0) {
    return (
      <div className="text-center py-6 text-slate-400 text-sm">
        No previous reviews or evaluations found.
      </div>
    );
  }

  return (
    <ScrollArea className="max-h-96">
      <div className="space-y-3">
        {/* AI Evaluations */}
        {evaluations.map((ev, i) => (
          <div key={ev.id || i} className="p-3 rounded-lg border bg-violet-50 border-violet-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-violet-200 text-violet-800 text-[10px]">AI Evaluation</Badge>
                <span className="text-xs text-slate-500">
                  {ev.created_date && new Date(ev.created_date).toLocaleDateString()}
                </span>
              </div>
              <span className="text-lg font-bold text-violet-700">{ev.final_score || '—'}</span>
            </div>
            {ev.decision_tier && (
              <Badge className={cn("text-xs", REC_COLORS[ev.decision_tier])}>
                {ev.decision_tier?.replace(/_/g, ' ')}
              </Badge>
            )}
            {ev.phase2_gaps?.length > 0 && (
              <div className="mt-2 text-xs text-slate-600">
                <span className="font-medium">Gaps:</span> {ev.phase2_gaps.join('; ')}
              </div>
            )}
          </div>
        ))}

        {/* Human Reviews */}
        {reviews.map((rev, i) => (
          <div key={rev.id || i} className="p-3 rounded-lg border bg-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-[10px] bg-blue-100 text-blue-600">
                    {rev.reviewer_name?.charAt(0) || 'R'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-slate-700">{rev.reviewer_name || rev.reviewer_id}</span>
                {rev.is_resubmission && (
                  <Badge variant="outline" className="text-[10px]">Resubmission #{rev.resubmission_number}</Badge>
                )}
              </div>
              <span className="text-lg font-bold text-blue-700">{rev.reviewer_weighted_score || '—'}</span>
            </div>
            {rev.recommendation && (
              <Badge className={cn("text-xs mb-2", REC_COLORS[rev.recommendation])}>
                {rev.recommendation?.replace(/_/g, ' ')}
              </Badge>
            )}
            {rev.overall_comment && (
              <p className="text-xs text-slate-600 mt-1 line-clamp-3">{rev.overall_comment}</p>
            )}
            {rev.flags?.length > 0 && (
              <div className="flex items-center gap-1 mt-2">
                <AlertTriangle className="w-3 h-3 text-amber-500" />
                <span className="text-xs text-amber-700">{rev.flags.length} flag(s)</span>
              </div>
            )}
            <div className="text-xs text-slate-400 mt-1">
              {rev.completed_at ? new Date(rev.completed_at).toLocaleDateString() : (rev.created_date && new Date(rev.created_date).toLocaleDateString())}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}