import { useState } from 'react';
import { RankBadge } from '@/components/reputation/rankBadges';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function ProfileRankBadge({ rank, points, size, className = '' }) {
  const [open, setOpen] = useState(false);
  return <TooltipProvider delayDuration={150}>
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger asChild>
        <button type="button" aria-label={`${rank.title}, rank level ${rank.level}`} className={`inline-flex cursor-help focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring ${className}`}
          onPointerDown={event => { if (event.pointerType === 'touch') event.preventDefault(); }}
          onClick={event => { event.preventDefault(); setOpen(value => !value); }}>
          <RankBadge code={rank.code} size={size} className="drop-shadow-lg" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" className="z-[10005] max-w-56">
        <p className="font-semibold">{rank.title} · Level {rank.level}</p>
        <p>This badge shows the member’s reputation rank. They have {points.toLocaleString()} reputation points (RP).</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>;
}