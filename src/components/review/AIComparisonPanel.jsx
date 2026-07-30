import React from 'react';
import { Badge } from '@/components/ui/badge';
import { REVIEW_SECTIONS } from './reviewScoringConfig';
import { AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Equal } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AIComparisonPanel({ sectionScores, aiScores, reviewerWeightedScore, aiTotalScore }) {
  if (!sectionScores || !aiScores) return null;

  const totalDev = Math.abs((reviewerWeightedScore || 0) - (aiTotalScore || 0));
  const bigDev = totalDev > 10;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">AI vs Reviewer Comparison</h3>
        <Badge className={cn(
          bigDev ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
        )}>
          Overall Deviation: {totalDev} pts
        </Badge>
      </div>

      {/* Overall scores */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-violet-50 border border-violet-200 text-center">
          <div className="text-xs text-slate-500 mb-1">AI Score</div>
          <div className="text-2xl font-bold text-violet-700">{aiTotalScore || '—'}</div>
        </div>
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-center">
          <div className="text-xs text-slate-500 mb-1">Reviewer Score</div>
          <div className="text-2xl font-bold text-blue-700">{reviewerWeightedScore || '—'}</div>
        </div>
      </div>

      {/* Per-section comparison */}
      <div className="space-y-2">
        {REVIEW_SECTIONS.map(section => {
          const rScore = sectionScores?.[section.id] || 0;
          const aScore = aiScores?.[section.id]?.score || 0;
          const dev = rScore > 0 && aScore > 0 ? rScore - aScore : null;
          const absDev = dev != null ? Math.abs(dev) : 0;

          return (
            <div key={section.id} className="flex items-center gap-3 text-sm p-2 rounded border bg-white">
              <span className="flex-1 min-w-0 truncate text-slate-700">{section.label}</span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-violet-600 font-medium w-6 text-right">{aScore || '—'}</span>
                <span className="text-slate-300">→</span>
                <span className="text-blue-600 font-medium w-6 text-right">{rScore || '—'}</span>
                {dev != null && (
                  <div className={cn("flex items-center gap-0.5 w-12",
                    absDev >= 3 ? "text-amber-600" : "text-slate-400"
                  )}>
                    {dev > 0 && <TrendingUp className="w-3 h-3" />}
                    {dev < 0 && <TrendingDown className="w-3 h-3" />}
                    {dev === 0 && <Equal className="w-3 h-3" />}
                    <span className="text-xs">{dev > 0 ? '+' : ''}{dev}</span>
                  </div>
                )}
                {absDev >= 3 && <AlertTriangle className="w-3 h-3 text-amber-500" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}