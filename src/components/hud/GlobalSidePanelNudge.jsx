import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { PanelRightOpen, Sparkles } from "lucide-react";

/**
 * A globally visible nudge handle that appears on the right edge of the viewport
 * when the SidePanel is collapsed. This component manages its own state via localStorage
 * and dispatches a custom event to open the full SidePanel.
 */
export default function GlobalSidePanelNudge() {
  const [isOpen, setIsOpen] = useState(false);
  const [dockSide, setDockSide] = useState('right');

  // Sync with localStorage on mount and listen for changes
  useEffect(() => {
    const checkState = () => {
      try {
        const saved = localStorage.getItem('sidePanelOpen');
        setIsOpen(saved === 'true');
        const savedSide = localStorage.getItem('sidePanelDockSide');
        if (savedSide === 'left' || savedSide === 'right') {
          setDockSide(savedSide);
        }
      } catch {}
    };
    
    checkState();
    
    // Listen for storage changes (from other tabs or SidePanel updates)
    window.addEventListener('storage', checkState);
    
    // Also poll occasionally in case local component updates
    const interval = setInterval(checkState, 500);
    
    return () => {
      window.removeEventListener('storage', checkState);
      clearInterval(interval);
    };
  }, []);

  const handleClick = () => {
    // Toggle the panel state
    try {
      localStorage.setItem('sidePanelOpen', 'true');
    } catch {}
    // Dispatch custom event for any listeners (like CommandDeck's SidePanel)
    document.dispatchEvent(new CustomEvent('toggleSidePanel', { detail: { open: true } }));
    setIsOpen(true);
  };

  // Don't show if panel is already open
  if (isOpen) return null;

  return (
    <div
      onClick={handleClick}
      className={cn(
        "fixed top-1/2 -translate-y-1/2 z-[100] cursor-pointer transition-all duration-300",
        "hover:scale-105 group",
        dockSide === 'right' ? "right-0" : "left-0"
      )}
      title="Open Side Panel"
    >
      {/* Main handle */}
      <div
        className={cn(
          "bg-gradient-to-b from-violet-600 to-violet-700 shadow-lg flex flex-col items-center justify-center gap-1.5 transition-all",
          "hover:from-violet-500 hover:to-violet-600",
          dockSide === 'right' ? "rounded-l-xl" : "rounded-r-xl"
        )}
        style={{ 
          width: '28px', 
          height: '140px',
        }}
      >
        {/* Decorative dots */}
        <div className="w-1.5 h-1.5 rounded-full bg-white/40 group-hover:bg-white/60 transition-colors" />
        <div className="w-1.5 h-1.5 rounded-full bg-white/40 group-hover:bg-white/60 transition-colors" />
        <PanelRightOpen className={cn(
          "w-4 h-4 text-white/70 group-hover:text-white transition-colors my-1",
          dockSide === 'left' && "rotate-180"
        )} />
        <div className="w-1.5 h-1.5 rounded-full bg-white/40 group-hover:bg-white/60 transition-colors" />
        <div className="w-1.5 h-1.5 rounded-full bg-white/40 group-hover:bg-white/60 transition-colors" />
      </div>
      
      {/* Tooltip on hover */}
      <div 
        className={cn(
          "absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none",
          "bg-slate-900 text-white text-xs py-1.5 px-3 rounded-lg whitespace-nowrap shadow-lg",
          dockSide === 'right' ? "right-10" : "left-10"
        )}
      >
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-amber-400" />
          Open Panel
        </div>
      </div>
    </div>
  );
}