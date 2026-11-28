import { useState } from 'react';
import { CircleHelp } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function MyGroupsHint() {
  const [open, setOpen] = useState(false);
  return <h3 className="px-1 text-xs font-semibold">
    <TooltipProvider delayDuration={200}>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger asChild>
          <button type="button" data-icon-button className="inline-flex items-center gap-1.5 text-left focus-visible:ring-2 focus-visible:ring-ring"
            onClick={event => { event.preventDefault(); setOpen(value => !value); }}>
            My Groups <CircleHelp className="size-3.5" aria-hidden="true" />
          </button>
        </TooltipTrigger>
        <TooltipContent asChild side="top" align="start" className="z-[220] max-w-56 border">
          <section data-readable-surface>Quick access to the circles and missions you’ve joined or created.</section>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </h3>;
}