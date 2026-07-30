import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { AlertTriangle, HelpCircle, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SectionScorer({ section, score, comment, aiScore, onChange }) {
  const [showComment, setShowComment] = useState(!!comment);
  const currentScore = score || 0;
  const deviation = aiScore != null && currentScore > 0 ? Math.abs(currentScore - aiScore) : null;
  const needsJustification = currentScore > 0 && (currentScore <= 2 || currentScore >= 9);
  const bigDeviation = deviation != null && deviation >= 3;

  const getScoreColor = (s) => {
    if (s === 0) return 'text-slate-400';
    if (s <= 3) return 'text-rose-600';
    if (s <= 5) return 'text-amber-600';
    if (s <= 7) return 'text-blue-600';
    return 'text-emerald-600';
  };

  return (
    <div className="p-4 rounded-lg border bg-white space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-slate-900">{section.label}</span>
            <Badge variant="outline" className="text-[10px] shrink-0">{section.weight}%</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{section.guiding}</p>
        </div>
        <div className="text-right shrink-0">
          <span className={cn("text-2xl font-bold", getScoreColor(currentScore))}>
            {currentScore || '—'}
          </span>
          <span className="text-xs text-slate-400"> /10</span>
        </div>
      </div>

      {/* Score slider */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-400 w-4">1</span>
        <Slider
          value={[currentScore]}
          onValueChange={([v]) => onChange({ score: v, comment })}
          min={1}
          max={10}
          step={1}
          className="flex-1"
        />
        <span className="text-xs text-slate-400 w-4">10</span>
      </div>

      {/* AI comparison */}
      {aiScore != null && currentScore > 0 && (
        <div className={cn(
          "flex items-center gap-2 text-xs p-2 rounded",
          bigDeviation ? "bg-amber-50 border border-amber-200" : "bg-slate-50"
        )}>
          <span className="text-slate-500">AI Score: <strong>{aiScore}</strong></span>
          <span className="text-slate-400">|</span>
          <span className={bigDeviation ? "text-amber-700 font-medium" : "text-slate-500"}>
            Deviation: {deviation > 0 ? `±${deviation}` : '0'}
          </span>
          {bigDeviation && <AlertTriangle className="w-3 h-3 text-amber-500" />}
        </div>
      )}

      {/* Warnings */}
      {needsJustification && (
        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
          <AlertTriangle className="w-3 h-3 shrink-0" />
          <span>Extreme score — justification required in your comment below.</span>
        </div>
      )}

      {/* Comment toggle + area */}
      <button
        onClick={() => setShowComment(!showComment)}
        className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700"
      >
        <MessageSquare className="w-3 h-3" />
        {showComment ? 'Hide comment' : (comment ? 'Show comment' : 'Add comment')}
      </button>
      {showComment && (
        <Textarea
          placeholder={`Comment on ${section.label}...`}
          value={comment || ''}
          onChange={(e) => onChange({ score: currentScore, comment: e.target.value })}
          className="text-sm min-h-[60px]"
        />
      )}
    </div>
  );
}