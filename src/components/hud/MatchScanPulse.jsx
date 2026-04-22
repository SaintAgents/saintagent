import React from 'react';
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Shows a pulsing glow indicator when auto-scan has found new matches.
 * Used on TopBar icons and Command Deck cards.
 * 
 * @param {number} count - Number of new matches found
 * @param {"dot"|"ring"|"badge"} variant - Visual style
 * @param {string} className - Additional classes
 */
export default function MatchScanPulse({ count = 0, variant = "dot", className }) {
  if (count <= 0) return null;

  if (variant === "badge") {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={cn(
              "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold",
              "bg-gradient-to-r from-violet-500 to-pink-500 text-white animate-pulse shadow-lg shadow-violet-500/30",
              className
            )}>
              <Sparkles className="w-2.5 h-2.5" />
              {count}
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">{count} new match{count > 1 ? 'es' : ''} found by auto-scan</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === "ring") {
    return (
      <div className={cn(
        "absolute -inset-1 rounded-full animate-ping opacity-40",
        "bg-gradient-to-r from-violet-400 to-pink-400",
        className
      )} />
    );
  }

  // Default: dot
  return (
    <span className={cn(
      "absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full",
      "bg-gradient-to-r from-violet-500 to-pink-500 animate-pulse",
      "shadow-lg shadow-violet-500/50",
      className
    )} />
  );
}