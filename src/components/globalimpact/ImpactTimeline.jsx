import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { categories, categoryInfo, formatTime } from '@/components/live/activity';
import LiveActivityDialog from '@/components/live/LiveActivityDialog';
import useImpactTimeline from '@/components/globalimpact/useImpactTimeline';
import '@/components/globalimpact/impactTimeline.css';

const initial = { category: '', search: '' };

export default function ImpactTimeline({ demo }) {
  const [filters, setFilters] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState(null);
  const rail = useRef(null);
  const { events, loading, error } = useImpactTimeline(demo, filters);
  const [edges, setEdges] = useState([false, false]);
  const measure = () => { const el = rail.current; if (el) setEdges([el.scrollLeft > 1, el.scrollLeft + el.clientWidth < el.scrollWidth - 1]); };
  useEffect(() => { if (rail.current) rail.current.scrollLeft = 0; }, [filters]);
  useEffect(() => { const el = rail.current; const observer = new ResizeObserver(measure); observer.observe(el); measure(); return () => observer.disconnect(); }, [events.length]);
  const move = direction => { const el = rail.current; el.scrollBy({ left: el.clientWidth * .8 * direction, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); };
  const filterCount = Number(Boolean(filters.category)) + Number(Boolean(filters.search));
  return <section className="impact-timeline impact-surface mb-4 min-w-0 p-3" aria-label="Impact timeline tracker">
    <header className="mb-2 flex items-center justify-between gap-2">
      <h3 className="text-sm font-bold">Impact Timeline {demo && <span className="impact-chip ml-1">Demo</span>}</h3>
      <button className="impact-control inline-flex items-center gap-1" aria-controls="impact-timeline-filters" aria-expanded={expanded} type="button" onClick={() => setExpanded(!expanded)}>Filters{filterCount ? ` (${filterCount})` : ''}<ChevronDown size={14} /></button>
    </header>
    <form id="impact-timeline-filters" hidden={!expanded} className="impact-timeline-filters mb-2" onSubmit={e => { e.preventDefault(); setFilters({ ...draft, search: draft.search.trim() }); setExpanded(false); }}>
      <label className="grid gap-1 text-xs">Category<select className="impact-control" value={draft.category} onChange={e => setDraft({ ...draft, category: e.target.value })}><option value="">All categories</option>{Object.entries(categories).map(([id, [label]]) => <option value={id} key={id}>{label}</option>)}</select></label>
      <label className="grid gap-1 text-xs">Headline<input className="impact-control" type="search" value={draft.search} maxLength={120} onChange={e => setDraft({ ...draft, search: e.target.value })} placeholder="Search headlines" /></label>
      <button type="submit" className="impact-control impact-primary">Apply</button><button type="button" className="impact-control" onClick={() => { setDraft(initial); setFilters(initial); }}>Reset</button>
    </form>
    <div className="flex items-center gap-1">
      <button type="button" className="impact-control impact-timeline-arrow" aria-label="Scroll toward newer events" disabled={!edges[0]} onClick={() => move(-1)}><ChevronLeft size={16} /></button>
      <div ref={rail} onScroll={measure} className="impact-timeline-scroll scrollbar-hide min-w-0 flex-1 overflow-x-auto">
        {loading || error || !events.length ? <p className="impact-muted px-2 py-4 text-xs" role={error ? 'alert' : 'status'}>{loading ? 'Loading activity…' : error ? 'Activity couldn’t be loaded.' : filterCount ? 'No events match these filters.' : 'No recent activity yet.'}</p> : <ol className="impact-timeline-track">
          {events.map(event => { const [label, Icon] = categoryInfo(event); return <li key={event.id}>
            <button type="button" className="impact-timeline-event" onClick={() => setSelected(event)}><span className="impact-timeline-headline"><Icon aria-hidden size={19} /><strong>{event.headline}</strong><span className="sr-only">{label}</span></span><span aria-hidden className="impact-timeline-node" /><time dateTime={event.created_date}>{formatTime(event.created_date)}</time></button>
          </li>; })}
        </ol>}
      </div>
      <button type="button" className="impact-control impact-timeline-arrow" aria-label="Scroll toward older events" disabled={!edges[1]} onClick={() => move(1)}><ChevronRight size={16} /></button>
    </div>
    {selected && <LiveActivityDialog dialog={selected} sampleImage={demo ? selected.image_url : undefined} close={() => setSelected(null)} />}
  </section>;
}