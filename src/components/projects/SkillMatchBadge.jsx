import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getMatchScoreColor } from './skillMatch';
import { Target } from 'lucide-react';

/**
 * Small badge showing skill match score with tooltip detail.
 */
export default function SkillMatchBadge({ score, matchedTags = [], unmatchedTags = [], compact = false }) {
  if (score === 0 && matchedTags.length === 0) return null;

  const colorClass = getMatchScoreColor(score);

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-semibold ${colorClass}`}>
            <Target className="w-2.5 h-2.5" />
            {compact ? `${score}%` : `${score}% match`}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[220px]">
          <div className="text-xs space-y-1">
            <div className="font-semibold">Skill Match: {score}%</div>
            {matchedTags.length > 0 && (
              <div className="text-emerald-600">✓ {matchedTags.join(', ')}</div>
            )}
            {unmatchedTags.length > 0 && (
              <div className="text-slate-400">✗ {unmatchedTags.join(', ')}</div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}