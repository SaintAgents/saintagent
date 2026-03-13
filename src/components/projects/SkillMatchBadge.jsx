import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { getMatchScoreStyle } from './SkillMatchUtils';
import { Star } from 'lucide-react';

/**
 * Renders a small match score badge with a tooltip showing matched/missing skills.
 * Only renders if the task has skill_tags.
 */
export default function SkillMatchBadge({ score, matchedSkills = [], missingSkills = [] }) {
  const style = getMatchScoreStyle(score);
  if (!style) return null;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={`text-[9px] px-1.5 py-0 gap-0.5 cursor-help ${style.color}`}>
            <Star className="w-2.5 h-2.5" />
            {score}%
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[220px] text-xs">
          <div className="space-y-1">
            <p className="font-medium">Skill Match: {style.label} ({score}%)</p>
            {matchedSkills.length > 0 && (
              <div>
                <span className="text-emerald-600">Matched:</span>{' '}
                {matchedSkills.map(s => `${s.tag} (${s.proficiency}/5)`).join(', ')}
              </div>
            )}
            {missingSkills.length > 0 && (
              <div>
                <span className="text-red-500">Missing:</span>{' '}
                {missingSkills.join(', ')}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}