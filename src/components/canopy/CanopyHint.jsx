import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function CanopyHint({ label, children }) {
  return <TooltipProvider delayDuration={120} disableHoverableContent>
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="bottom" className="z-[10010]">{label}</TooltipContent>
    </Tooltip>
  </TooltipProvider>;
}