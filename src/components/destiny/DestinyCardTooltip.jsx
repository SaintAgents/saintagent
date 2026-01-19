import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getDestinyCardMeaning, getCardStyle } from './destinyCardsData';
import { cn } from '@/lib/utils';

export default function DestinyCardTooltip({ card, children, className }) {
  const meaning = getDestinyCardMeaning(card);
  const { isRed } = getCardStyle(card);
  
  if (!meaning) {
    return <span className={className}>{children || card}</span>;
  }

  const displayText = children || card;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn("cursor-help underline decoration-dotted decoration-slate-400 underline-offset-2", className)}>
            {displayText}
          </span>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="max-w-xs backdrop-blur-md bg-white/95 dark:bg-slate-800/95 border border-slate-200 dark:border-slate-600 shadow-xl p-3 z-[9999]"
        >
          <div className="space-y-1.5">
            <p className={cn(
              "font-semibold text-sm",
              isRed ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white"
            )}>
              {meaning.title}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {meaning.meaning}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}