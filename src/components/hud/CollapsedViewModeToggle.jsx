import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { createPageUrl } from '@/utils';

const MODES = [
  { id: 'simple', label: 'S', full: 'Simple' },
  { id: 'advanced', label: 'A', full: 'Advanced' },
  { id: 'custom', label: 'C', full: 'Custom' },
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
    <div className="flex items-center gap-0.5 bg-slate-100/80 rounded-lg p-0.5 mr-2 shrink-0">
      {MODES.map(m => (
        <button
          key={m.id}
          onClick={() => handleChange(m.id)}
          className={cn(
            "px-1.5 py-0.5 rounded-md text-[10px] font-semibold transition-all leading-tight",
            viewMode === m.id
              ? "bg-violet-600 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-700 hover:bg-white/60"
          )}
          title={m.full}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}