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

  // Listen for sidePanelOpen changes via custom event from CommandDeck
  useEffect(() => {
    const handlePanelChange = (e) => {
      if (e.detail?.isOpen !== undefined) {
        setIsOpen(e.detail.isOpen);
      }
    };
    
    // Check localStorage on mount for initial state and dock side
    try {
      const savedSide = localStorage.getItem('sidePanelDockSide');
      if (savedSide === 'left' || savedSide === 'right') {
        setDockSide(savedSide);
      }
      // Also check initial open state from localStorage
      const savedOpen = localStorage.getItem('sidePanelOpen');
      if (savedOpen !== null) {
        setIsOpen(savedOpen !== 'false');
      }
    } catch {}
    
    document.addEventListener('sidePanelStateChange', handlePanelChange);
    
    return () => {
      document.removeEventListener('sidePanelStateChange', handlePanelChange);
    };
  }, []);

  const handleClick = () => {
    // Dispatch custom event for CommandDeck to open the SidePanel
    document.dispatchEvent(new CustomEvent('toggleSidePanel', { detail: { open: true } }));
    // Also update local state immediately so the nudge hides
    setIsOpen(true);
  };

  // Show the nudge when panel is closed
  if (isOpen) return null;

  return (
    <div
      onClick={handleClick}
      className={cn(
        "fixed top-1/2 -translate-y-1/2 z-[9998] cursor-pointer transition-all duration-300",
        "hover:scale-105 group",
        dockSide === 'right' ? "right-0" : "left-0"
      )}
      title="Open Side Panel"
      data-side-panel-handle
    >
      {/* Main handle - theme aware */}
      <div
        className={cn(
          "shadow-lg flex flex-col items-center justify-center gap-1.5 transition-all",
          // Light theme
          "bg-gradient-to-b from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600",
          // Dark/Hacker theme overrides applied via CSS
          dockSide === 'right' ? "rounded-l-xl" : "rounded-r-xl"
        )}
        style={{ 
          width: '28px', 
          height: '140px',
        }}
      >
        {/* Decorative dots */}
        <div className="w-1.5 h-1.5 rounded-full bg-white/40 group-hover:bg-white/60 transition-colors dot-glow" />
        <div className="w-1.5 h-1.5 rounded-full bg-white/40 group-hover:bg-white/60 transition-colors dot-glow" />
        <PanelRightOpen className={cn(
          "w-4 h-4 text-white/70 group-hover:text-white transition-colors my-1 icon-glow",
          dockSide === 'left' && "rotate-180"
        )} />
        <div className="w-1.5 h-1.5 rounded-full bg-white/40 group-hover:bg-white/60 transition-colors dot-glow" />
        <div className="w-1.5 h-1.5 rounded-full bg-white/40 group-hover:bg-white/60 transition-colors dot-glow" />
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