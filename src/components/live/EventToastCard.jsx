import React, { useEffect, useRef, useState } from 'react';
import { Pin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { actionable, categoryInfo, formatTime, priorities, priorityIndex } from '@/components/live/activity';

const emphasis = ['border-l-muted-foreground', 'border-l-primary', 'border-l-chart-4', 'border-l-chart-2', 'border-l-chart-5', 'border-l-primary', 'border-l-destructive'];
export default function EventToastCard({ event, duration, dismiss, open, sample = false }) {
  const { id, headline, description, metric, country, match_score } = event;
  const [label, Icon] = categoryInfo(event);
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const remaining = useRef(duration);
  const callback = useRef(dismiss);
  callback.current = dismiss;
  useEffect(() => {
    if (hover || focus) return;
    const start = performance.now();
    const timer = setTimeout(() => callback.current(id), remaining.current);
    return () => { clearTimeout(timer); remaining.current -= performance.now() - start; };
  }, [hover, focus, id]);
  const pinPath = id === 'welcome' || event.category === 'sign_ins' || sample ? null : `/CommandDeck?liveEvent=${encodeURIComponent(id)}`;
  return <section data-readable-surface className={`pointer-events-auto w-[min(22rem,calc(100vw-2rem))] space-y-2 rounded-lg border border-l-4 p-3 shadow-lg ${emphasis[priorityIndex(event)]}`} aria-label="Live event" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onFocus={() => setFocus(true)} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setFocus(false); }}>
    <div className="flex items-center gap-2 text-xs"><Icon size={16} /><p className="flex-1 font-semibold">{event.is_demo && 'Demo · '}{label}{priorityIndex(event) > 0 && ` · ${priorities[priorityIndex(event)].replaceAll('_', ' ')}`}</p>
      {pinPath && <Button size="icon" variant="ghost" className="h-7 w-7" aria-label="Pin event to Dock Deck" onClick={() => document.dispatchEvent(new CustomEvent('pinDockItem', { detail: { path:pinPath, title:headline } }))}><Pin /></Button>}
      <Button size="icon" variant="ghost" className="h-7 w-7" aria-label="Dismiss event toast" onClick={() => dismiss(id)}><X /></Button>
    </div>
    <h3 className="text-sm font-semibold">{headline}</h3>
    {description && <p className="line-clamp-3 text-sm">{description}</p>}
    <p className="text-xs text-muted-foreground">{[formatTime(event.created_date), event.category === 'sign_ins' ? null : metric, country, match_score == null ? null : `${match_score}% match`].filter(Boolean).join(' · ')}</p>
    {actionable(event) && <Button size="sm" variant="outline" onClick={() => { open(event); dismiss(id); }}>Open {event.category === 'signals' ? 'signal' : 'event'}</Button>}
  </section>;
}