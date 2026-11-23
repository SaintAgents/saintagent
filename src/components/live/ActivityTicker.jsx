import React, { useLayoutEffect, useRef } from 'react';
import { Radio, Settings2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useActivity } from '@/components/live/useActivity';
import { categoryInfo } from '@/components/live/activity';
import '@/components/live/activityTicker.css';

export function TickerSetupButton() {
  const activity = useActivity();
  return activity && <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" aria-label="Ticker setup" title="Ticker setup" onClick={() => activity.setDialog('setup')}><Radio /></Button>;
}
function DemoPill({ demo, toggleDemo, floating }) {
  return <button type="button" aria-label="Demo activity ticker" aria-pressed={demo} onClick={toggleDemo} className={`activity-demo-pill ${floating ? 'activity-demo-floating' : ''}`}>Demo <span>{demo ? 'On' : 'Off'}</span></button>;
}

export default function ActivityTicker({ placement }) {
  const activity = useActivity();
  const row = useRef(null);
  const bottom = placement === 'bottom';
  const showAlongside = placement === 'canopy' && activity?.prefs.showInCanopy;
  const shown = activity?.ticker && (activity.placement === placement || showAlongside);
  useLayoutEffect(() => {
    if (!shown || !bottom) return;
    const element = row.current;
    const style = document.documentElement.style;
    const update = () => style.setProperty('--activity-ticker-height', `${element.offsetHeight}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => { observer.disconnect(); style.removeProperty('--activity-ticker-height'); };
  }, [shown, bottom]);
  if (!activity) return null;
  if (!shown) return bottom && activity.prefs.enabled ? <DemoPill demo={activity.demo} toggleDemo={activity.toggleDemo} floating /> : null;
  const candidates = new Set((activity.events.data || []).slice(0, 40).map(event => event.id));
  const events = activity.tickerHistory.filter(event => activity.demo || candidates.has(event.id)).slice(0, 30);
  const factor = { slow: 6, normal: 4, fast: 2 }[activity.prefs.speed] || 4;
  return <section data-readable-surface className={`live-ticker-row ${bottom ? 'live-ticker-bottom' : ''}`} aria-label={activity.demo ? 'Demo Global Activity' : 'Live Global Activity'} ref={row}>
    <Radio className="mx-1 size-4 shrink-0" aria-hidden="true" />
    {!bottom && activity.demo && <span className="shrink-0 text-xs font-semibold">Demo</span>}
    <div className="live-ticker-window">{events.length ? <div key={activity.demo ? 'demo' : 'live'} className="live-ticker-marquee" style={{ '--ticker-loop': `${Math.max(4.5, events.length) * factor}s` }}>
      {[false, true].map(copy => <div className="live-ticker-segment" key={String(copy)} aria-hidden={copy || undefined}>{events.map(event => { const [label, Icon] = categoryInfo(event); return <button type="button" key={event.id} tabIndex={copy ? -1 : undefined} onClick={() => activity.open(event)} className="inline-flex items-center gap-1 px-2 text-xs" title={label}><Icon size={13} />{event.headline}</button>; })}</div>)}
    </div> : <p className="truncate text-xs">{activity.events.isPending ? 'Loading live activity…' : 'No live activity yet'}</p>}</div>
    <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => activity.setDialog('all')}>All</Button>
    <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" aria-label="Ticker setup" onClick={() => activity.setDialog('setup')}><Settings2 /></Button>
    <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" aria-label="Close activity ticker for this page" onClick={activity.closeTicker}><X /></Button>
    {bottom && <DemoPill demo={activity.demo} toggleDemo={activity.toggleDemo} />}
  </section>;
}