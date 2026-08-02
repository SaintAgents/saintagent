import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, ChevronRight } from 'lucide-react';

const ORACLE_ICONS = {
  horoscope: '♈', tarot: '🃏', iching: '☯', runes: 'ᚱ', numerology: '🔢', oracle_cards: '✨',
};

const FOCUS_LABELS = {
  general: 'General', wealth: 'Wealth', love: 'Love', career: 'Career',
  health: 'Health', spiritual: 'Spiritual', creativity: 'Creativity', shadow: 'Shadow',
};

export default function OracleHistory({ readings, onSelect }) {
  if (!readings?.length) {
    return (
      <div className="text-center py-8 text-slate-400">
        <Clock className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p className="text-sm">No past readings yet</p>
        <p className="text-xs mt-1">Your readings will appear here</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-2 pr-2">
        {readings.map((r, i) => (
          <button
            key={r.id || i}
            onClick={() => onSelect?.(r)}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-white hover:bg-violet-50/30 hover:border-violet-200 transition-all text-left"
          >
            <span className="text-2xl">{ORACLE_ICONS[r.reading_type] || '✨'}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {FOCUS_LABELS[r.focus] || r.focus} — {r.timeframe}
              </p>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {r.reading?.slice(0, 80)}...
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {r.created_date && format(parseISO(r.created_date), 'MMM d, yyyy h:mm a')}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}