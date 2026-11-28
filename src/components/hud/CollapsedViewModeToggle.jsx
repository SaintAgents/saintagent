import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { createPageUrl } from '@/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const MODES = [
  { id: 'simple', label: 'S', full: 'Simple', hint: 'Shows the essentials.' },
  { id: 'advanced', label: 'A', full: 'Advanced', hint: 'Shows all Command Deck features.' },
  { id: 'custom', label: 'C', full: 'Custom', hint: 'Shows the cards you choose.' },
];

export default function CollapsedViewModeToggle() {
  const [viewMode, setViewMode] = useState(() => {
    try { return localStorage.getItem('deckViewMode') || 'advanced'; } catch { return 'advanced'; }
  });

  // Listen for external view mode changes
  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.viewMode) setViewMode(e.detail.viewMode);
    };
    document.addEventListener('viewModeChange', handler);
    return () => document.removeEventListener('viewModeChange', handler);
  }, []);

  const handleChange = (modeId) => {
    if (modeId === 'custom') {
      try {
        if (!localStorage.getItem('deckCustomCards')) {
          window.location.href = createPageUrl('Settings') + '?tab=deck';
          return;
        }
      } catch {}
    }
    setViewMode(modeId);
    try { localStorage.setItem('deckViewMode', modeId); } catch {}
    document.dispatchEvent(new CustomEvent('viewModeChange', { detail: { viewMode: modeId } }));
  };

  return (
    <TooltipProvider delayDuration={250}>
      <div data-collapsed-view-modes role="group" aria-label="Deck view mode" className="flex items-center gap-0.5 bg-slate-100/80 rounded-lg p-0.5 mr-2 shrink-0">
        {MODES.map(m => (
          <Tooltip key={m.id}>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={m.full}
                aria-pressed={viewMode === m.id}
                onClick={() => handleChange(m.id)}
                className={cn(
                  'px-1.5 py-0.5 rounded-md text-[10px] font-semibold transition-all leading-tight',
                  viewMode === m.id
                    ? 'bg-sidebar text-sidebar-foreground shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
                )}
              >
                {m.label}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="z-[12000] border border-sidebar-border bg-sidebar text-sidebar-foreground">
              <strong>{m.full}:</strong> {m.hint}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}