import { useState } from 'react';
import { categories, categoryInfo, formatTime } from '@/components/live/activity';
import LiveActivityDialog from '@/components/live/LiveActivityDialog';

export default function PulseActivity({ title, events, query, demo = false, onDemoChange }) {
  const [filter, setFilter] = useState('all');
  const demoFilters = demo ? [...new Set(events.map(event => event.category))] : [];
  const [selected, setSelected] = useState(null);
  const shown = events.filter(event => filter === 'all' || event.category === filter).slice(0, 12);
  return <section className="mt-4 border-t pt-3" aria-label={title}>
    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
      <h3 className="impact-kicker">{title}</h3>
      <div className="flex flex-wrap items-center gap-2">
        {onDemoChange && <button type="button" className={`impact-control ${demo ? 'impact-selected' : ''}`} onClick={() => onDemoChange(!demo)}>{demo ? 'Back to live activity' : 'Load Demo Data'}</button>}
        {!demo && <select aria-label="Filter Pulse activity" value={filter} onChange={e => setFilter(e.target.value)} className="impact-control">
          <option value="all">All updates</option>
          {Object.entries(categories).map(([value, [label]]) => <option key={value} value={value}>{label}</option>)}
        </select>}
      </div>
    </div>
    {demo && <div role="group" aria-label="Filter demo activity" className="mb-2 flex flex-wrap gap-1.5">
      {['all', ...demoFilters].map(key => <button type="button" key={key} aria-pressed={filter === key} onClick={() => setFilter(key)} className={`impact-control impact-small ${filter === key ? 'impact-selected' : ''}`}>{key === 'all' ? 'All demo updates' : categories[key][0]}</button>)}
    </div>}
    {query?.isPending ? <p role="status" className="impact-muted text-sm">Loading activity…</p> : query?.isError ? <p role="alert" className="impact-muted text-sm">Activity could not be loaded. <button type="button" className="underline" onClick={() => query.refetch()}>Retry</button></p> : !shown.length ? <p className="impact-muted text-sm">No updates for this filter yet.</p> : <div className={demo ? 'impact-pulse flex gap-2 overflow-x-auto py-1' : 'impact-grid py-1'}>
      {shown.map(event => {
        const [label, Icon] = categoryInfo(event);
        return <button type="button" key={event.id} onClick={() => setSelected(event)} className={`impact-control min-w-0 text-left ${demo ? 'impact-event' : ''}`}>
          {event.is_demo && event.image_url && <img className="mb-2 h-20 w-full object-cover" src={event.image_url} alt="" loading="lazy" />}
          <span className="impact-kicker flex items-center gap-1.5"><Icon size={14} aria-hidden="true" />{event.is_demo ? `Demo · ${label}` : label}</span>
          <strong className="block break-words text-sm">{event.headline}</strong>
          <span className="impact-muted block text-xs">{[event.metric, formatTime(event.created_date)].filter(Boolean).join(' · ')}</span>
        </button>;
      })}
    </div>}
    {selected && <LiveActivityDialog dialog={selected} eventTitle="Pulse update" sampleImage={selected.is_demo ? selected.image_url : undefined} close={() => setSelected(null)} />}
  </section>;
}