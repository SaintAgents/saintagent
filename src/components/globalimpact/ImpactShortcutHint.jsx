import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export default function ImpactShortcutHint({ children, description }) {
  return <Tooltip>
    <TooltipTrigger asChild>{children}</TooltipTrigger>
    <TooltipContent side="bottom" sideOffset={8} collisionPadding={12} className="z-[10000] max-w-[min(16rem,calc(100vw-1.5rem))] border border-border bg-popover text-sm text-popover-foreground shadow-md">
      {description}
    </TooltipContent>
  </Tooltip>;
}