import React from 'react';
import { BADGE_INDEX } from './badgesData';
import BadgeIcon from './BadgeIcon';

export default function BadgesBar({ badges = [], defaultIfEmpty = true, max = 8, onMore, className = '' }) {
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
  const remaining = Math.max(0, derived.length - visible.length);

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
        <button
          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200"
          onClick={onMore}
        >
          +{remaining} more
        </button>
      )}
    </div>
  );
}