import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import AIDashboardCustomizer from '@/components/ai/AIDashboardCustomizer';

export default function ControlsDeck({
  colCOrder,
  setCardsForceOpen,
  setHiddenCards,
  setStoredCards,
  setColCOrder,
  storeAllCards,
  restoreAllCards,
  theme,
  onThemeToggle,
  profile,
  visibleCards,
  setCustomCards,
  setDeckViewMode,
  setHiddenCardsFromSuggestions,
}) {
  const [isOpen, setIsOpen] = useState(() => {
    try { return localStorage.getItem('controlsDeckOpen') !== 'false'; } catch { return true; }
  });

  useEffect(() => {
    try { localStorage.setItem('controlsDeckOpen', String(isOpen)); } catch {}
  }, [isOpen]);

  return (
    <div className="px-0 md:px-6 mb-6">
      <div className="relative p-2 md:p-4 rounded-2xl">
        <div className="absolute inset-0 rounded-2xl bg-[rgba(255,255,255,0.4)] dark:bg-[rgba(255,255,255,0.22)] backdrop-blur-sm pointer-events-none" />
        <div className="relative z-10">
          {/* Header with toggle */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between mb-2 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Controls Deck</div>
            {isOpen ? (
              <ChevronUp className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            )}
          </button>

          {isOpen && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => {try {localStorage.setItem('cmdColCOrder', JSON.stringify(colCOrder));} catch {}alert('Layout saved!');}} className="group relative z-20 flex items-center gap-3 p-3 rounded-xl bg-white/80 dark:bg-white/15 border border-slate-200 dark:border-slate-700 hover:bg-white hover:dark:bg-white/25 hover:border-violet-300 shadow-sm hover:shadow-md transition-transform duration-200 ease-out hover:-translate-y-0.5">
                  <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/c38b3c63f_save_light_iconcopy.png" alt="Save" className="w-12 h-12 object-contain drop-shadow" />
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Save</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Save current layout</div>
                  </div>
                </button>
                <button type="button" onClick={() => {setColCOrder(['market', 'influence', 'leader', 'dailyops']);setCardsForceOpen(null);setHiddenCards(new Set());setStoredCards([]);try {localStorage.removeItem('cmdColCOrder');localStorage.removeItem('cmdHiddenCards');localStorage.removeItem('cmdStoredCards');} catch {}}} className="group relative z-20 flex items-center gap-3 p-3 rounded-xl bg-white/80 dark:bg-white/15 border border-slate-200 dark:border-slate-700 hover:bg-white hover:dark:bg-white/25 hover:border-violet-300 shadow-sm hover:shadow-md transition-transform duration-200 ease-out hover:-translate-y-0.5">
                  <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/356f3698e_reset-Picsart-BackgroundRemover.png" alt="Reset" className="w-12 h-12 object-contain drop-shadow" />
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Reset</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Restore defaults</div>
                  </div>
                </button>
                <button type="button" onClick={() => setCardsForceOpen(false)} className="group relative z-20 flex items-center gap-3 p-3 rounded-xl bg-white/80 dark:bg-white/15 border border-slate-200 dark:border-slate-700 hover:bg-white hover:dark:bg-white/25 hover:border-violet-300 shadow-sm hover:shadow-md transition-transform duration-200 ease-out hover:-translate-y-0.5">
                  <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/5c98c6a72_downcopy.png" alt="Collapse" className="w-12 h-12 object-contain drop-shadow" />
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Collapse</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Condense view</div>
                  </div>
                </button>
                <button type="button" onClick={() => setCardsForceOpen(true)} className="group relative z-20 flex items-center gap-3 p-3 rounded-xl bg-white/80 dark:bg-white/15 border border-slate-200 dark:border-slate-700 hover:bg-white hover:dark:bg-white/25 hover:border-violet-300 shadow-sm hover:shadow-md transition-transform duration-200 ease-out hover:-translate-y-0.5">
                  <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/5c57e4485_upcopy.png" alt="Expand" className="w-12 h-12 object-contain drop-shadow" />
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Expand</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Fuller view</div>
                  </div>
                </button>
                <button type="button" onClick={storeAllCards} className="group relative z-20 flex items-center gap-3 p-3 rounded-xl bg-violet-50 dark:bg-violet-900/30 border border-violet-300 dark:border-violet-700 hover:bg-violet-100 hover:dark:bg-violet-800/40 hover:border-violet-400 shadow-sm hover:shadow-md transition-transform duration-200 ease-out hover:-translate-y-0.5">
                  <div className="w-12 h-12 rounded-lg bg-violet-100 dark:bg-violet-800 flex items-center justify-center">
                    <EyeOff className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-violet-800 dark:text-violet-200">Stow All</div>
                    <div className="text-xs text-violet-600 dark:text-violet-400">Send all to panel</div>
                  </div>
                </button>
                <button type="button" onClick={restoreAllCards} className="group relative z-20 flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 hover:dark:bg-emerald-800/40 hover:border-emerald-400 shadow-sm hover:shadow-md transition-transform duration-200 ease-out hover:-translate-y-0.5">
                  <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center">
                    <EyeOff className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">Unstow All</div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400">Restore all cards</div>
                  </div>
                </button>
              </div>
              
              {/* AI Dashboard Customizer */}
              <div className="mt-4">
                <AIDashboardCustomizer 
                  profile={profile}
                  currentCards={[...visibleCards]}
                  onApplySuggestions={(suggestions) => {
                    const highPriority = new Set(suggestions.high_priority || []);
                    const lowPriority = new Set(suggestions.low_priority || []);
                    setHiddenCardsFromSuggestions(lowPriority);
                    setCustomCards([...highPriority, ...(suggestions.medium_priority || [])]);
                    setDeckViewMode('custom');
                  }}
                />
              </div>
              
              {/* Theme Toggle Buttons */}
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Theme</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onThemeToggle?.('light')}
                    className={cn(
                      "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
                      theme === 'light' 
                        ? "bg-violet-600 text-white shadow-md" 
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-violet-300"
                    )}
                  >
                    <div className={cn("w-3 h-3 rounded-full border-2", theme === 'light' ? "bg-white border-white" : "bg-amber-100 border-amber-300")} />
                    Light
                  </button>
                  <button
                    onClick={() => onThemeToggle?.('dark')}
                    className={cn(
                      "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
                      theme === 'dark' 
                        ? "bg-violet-600 text-white shadow-md" 
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-violet-300"
                    )}
                  >
                    <div className={cn("w-3 h-3 rounded-full border-2", theme === 'dark' ? "bg-teal-400 border-teal-400" : "bg-slate-700 border-slate-600")} />
                    Dark
                  </button>
                  <button
                    onClick={() => onThemeToggle?.('hacker')}
                    className={cn(
                      "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
                      theme === 'hacker' 
                        ? "bg-green-600 text-white shadow-md shadow-green-500/30" 
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-green-400"
                    )}
                  >
                    <div className={cn("w-3 h-3 rounded-full border-2", theme === 'hacker' ? "bg-green-400 border-green-400" : "bg-green-500 border-green-600")} />
                    Hacker
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}