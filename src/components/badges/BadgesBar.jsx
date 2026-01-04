import React, { useState } from 'react';
import { BADGE_INDEX } from './badgesData';
import BadgeIcon from './BadgeIcon';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function BadgesBar({ badges = [], defaultIfEmpty = true, max = 8, onMore, className = '' }) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  
  const derived = React.useMemo(() => {
    const codes = badges
      .map(b => (b.badge_code || b.code || '').toLowerCase())
      .filter(Boolean);
    const items = codes
      .map(code => BADGE_INDEX[code])
      .filter(Boolean);
    if (items.length === 0 && defaultIfEmpty) {
      items.push({ ...BADGE_INDEX['eternal_flame'], section: 'identity' });
    }
    return items;
  }, [badges, defaultIfEmpty]);

  const visible = derived.slice(0, max);
  const hiddenItems = derived.slice(max);
  const remaining = hiddenItems.length;

  const handleMoreClick = (e) => {
    e.stopPropagation();
    if (onMore) {
      onMore();
    } else {
      setPopoverOpen(true);
    }
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {visible.map((item) => (
        <div
          key={item.code}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-white border border-slate-200 shadow-sm"
          title={item.definition}
        >
          <BadgeIcon iconKey={item.iconKey} section={item.section} size={14} />
          <span className="capitalize">{item.label}</span>
          {item.subtitle && (
            <span className="text-[10px] text-slate-500">• {item.subtitle}</span>
          )}
        </div>
      ))}
      {remaining > 0 && (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <button
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200"
              onClick={handleMoreClick}
            >
              +{remaining} more
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3" align="start" onClick={(e) => e.stopPropagation()}>
            <div className="text-xs font-medium text-slate-500 mb-2">All Badges ({derived.length})</div>
            <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
              {derived.map((item) => (
                <div
                  key={item.code}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-white border border-slate-200 shadow-sm"
                  title={item.definition}
                >
                  <BadgeIcon iconKey={item.iconKey} section={item.section} size={14} />
                  <span className="capitalize">{item.label}</span>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}