import React, { useState } from 'react';
import { cn } from "@/lib/utils";

export default function HelpHint({ content, side = 'right', align = 'start', className = '', size = 16 }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Trigger Button */}
      <button
        type="button"
        aria-label="Help"
        className={cn(
          "inline-flex items-center justify-center leading-none rounded-full border-2 transition-all duration-200",
          "border-emerald-500/60 text-emerald-600 bg-slate-900/80",
          "hover:border-emerald-400 hover:text-emerald-400 hover:shadow-[0_0_8px_rgba(16,185,129,0.4)]",
          "dark:border-[#00ff88]/60 dark:text-[#00ff88] dark:bg-[#050505]/90",
          "dark:hover:border-[#00ff88] dark:hover:shadow-[0_0_12px_rgba(0,255,136,0.5)]",
          className
        )}
        style={{ width: size, height: size, fontSize: Math.round(size * 0.6) }}
      >
        ?
      </button>

      {/* Crown-Style Popout Panel */}
      {isOpen && (
        <div
          className={cn(
            "absolute z-[100] min-w-[280px] max-w-[400px]",
            "transition-all duration-300 ease-out",
            "animate-in fade-in-0 slide-in-from-left-2",
            // Positioning based on side prop
            side === 'right' && "left-full ml-3 top-0",
            side === 'left' && "right-full mr-3 top-0",
            side === 'top' && "bottom-full mb-3 left-1/2 -translate-x-1/2",
            side === 'bottom' && "top-full mt-3 left-1/2 -translate-x-1/2"
          )}
        >
          {/* Crown Border (top neon accent) */}
          <div className="h-[2px] rounded-t-xl bg-gradient-to-r from-emerald-400 via-[#00ff88] to-teal-400 dark:from-[#00ff88] dark:via-emerald-400 dark:to-[#00ff88]" />
          
          {/* Panel Content */}
          <div
            className={cn(
              "rounded-b-xl rounded-tr-xl overflow-hidden",
              // Glassmorphism with obsidian-emerald gradient
              "bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-emerald-950/90",
              "dark:from-[#050505]/95 dark:via-[#0a0a0a]/95 dark:to-emerald-950/80",
              "backdrop-blur-xl",
              "border border-t-0 border-emerald-500/30 dark:border-[#00ff88]/25",
              "shadow-[0_8px_32px_rgba(0,0,0,0.4),_0_0_20px_rgba(16,185,129,0.15)]",
              "dark:shadow-[0_8px_32px_rgba(0,0,0,0.6),_0_0_30px_rgba(0,255,136,0.1)]"
            )}
          >
            <div className="p-4 text-sm leading-relaxed text-slate-200 dark:text-slate-100">
              {typeof content === 'string' ? (
                <p className="whitespace-normal break-words">{content}</p>
              ) : (
                content
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}