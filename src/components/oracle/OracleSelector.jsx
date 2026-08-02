import React from 'react';
import { cn } from '@/lib/utils';

const READING_TYPES = [
  { id: 'horoscope', label: 'Astral Chart', icon: '♈', desc: 'Star-based guidance using your natal chart' },
  { id: 'tarot', label: 'Tarot Pull', icon: '🃏', desc: 'Archetypal card wisdom for your situation' },
  { id: 'iching', label: 'I Ching', icon: '☯', desc: 'Ancient Chinese divination hexagrams' },
  { id: 'runes', label: 'Rune Cast', icon: 'ᚱ', desc: 'Norse elder futhark rune reading' },
  { id: 'numerology', label: 'Numerology', icon: '🔢', desc: 'Number vibrations from your life path' },
  { id: 'oracle_cards', label: 'Oracle Cards', icon: '✨', desc: 'Intuitive card messages from Spirit' },
];

const FOCUS_AREAS = [
  { id: 'general', label: 'General', icon: '🌟' },
  { id: 'wealth', label: 'Wealth', icon: '💰' },
  { id: 'love', label: 'Love', icon: '💜' },
  { id: 'career', label: 'Career', icon: '🎯' },
  { id: 'health', label: 'Health', icon: '🌿' },
  { id: 'spiritual', label: 'Spiritual', icon: '🕊️' },
  { id: 'creativity', label: 'Creativity', icon: '🎨' },
  { id: 'shadow', label: 'Shadow Work', icon: '🌑' },
];

const TIMEFRAMES = [
  { id: 'daily', label: 'Today', icon: '☀️' },
  { id: 'weekly', label: 'This Week', icon: '📅' },
  { id: 'monthly', label: 'This Month', icon: '🌙' },
  { id: 'yearly', label: 'Year Ahead', icon: '🌌' },
];

function SelectionGrid({ title, items, selected, onSelect, compact }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-600 mb-2">{title}</h3>
      <div className={cn("grid gap-2", compact ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-3")}>
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={cn(
              "flex items-center gap-2 p-3 rounded-xl border text-left transition-all hover:shadow-md",
              compact && "p-2 justify-center text-center flex-col gap-1",
              selected === item.id
                ? "border-violet-400 bg-violet-50 ring-2 ring-violet-300 shadow-md"
                : "border-slate-200 bg-white hover:border-violet-200 hover:bg-violet-50/30"
            )}
          >
            <span className={cn("text-lg", compact && "text-xl")}>{item.icon}</span>
            <div className={compact ? "text-center" : ""}>
              <p className={cn("font-medium text-slate-900", compact ? "text-xs" : "text-sm")}>{item.label}</p>
              {!compact && item.desc && (
                <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">{item.desc}</p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function OracleSelector({ readingType, focus, timeframe, onReadingTypeChange, onFocusChange, onTimeframeChange }) {
  return (
    <div className="space-y-5">
      <SelectionGrid
        title="🔮 Choose Your Oracle"
        items={READING_TYPES}
        selected={readingType}
        onSelect={onReadingTypeChange}
      />
      <SelectionGrid
        title="🎯 Focus Area"
        items={FOCUS_AREAS}
        selected={focus}
        onSelect={onFocusChange}
        compact
      />
      <SelectionGrid
        title="⏳ Timeframe"
        items={TIMEFRAMES}
        selected={timeframe}
        onSelect={onTimeframeChange}
        compact
      />
    </div>
  );
}