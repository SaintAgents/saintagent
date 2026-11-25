import React, { useState } from 'react';
import { categoryInfo, formatTime } from '@/components/live/activity';
import { useActivity } from '@/components/live/useActivity';
import LiveActivityDialog from '@/components/live/LiveActivityDialog';
import { demoPulse } from '@/components/globalimpact/impactDemo';
import PulseModules from '@/components/globalimpact/pulse/PulseModules';

export default function WorldPulse({ icon: PulseIcon, demo, preview = false, standalone = false }) {
  const Heading = standalone ? 'h1' : 'h2';
  const activity = useActivity();
  const [filter, setFilter] = useState('all');
  const [sample, setSample] = useState(null);
  const events = (demo ? demoPulse : activity?.history || []).filter(event => filter === 'all' || event.category === filter).slice(0, 12);
  const options = [['all','All updates'],['impact','Impact'],['projects','Projects'],['opportunities','Opportunities'],['signals','Signals'],['new_members','New members']];
  return <section id="world-pulse" className="impact-surface scroll-mt-32 p-3 sm:p-4" aria-label="World Pulse">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2"><PulseIcon size={19} aria-hidden="true" /><Heading className={standalone ? 'text-2xl font-bold sm:text-3xl' : 'text-lg font-bold'}>World Pulse</Heading><span className="impact-chip">{demo ? 'Demo activity' : 'SaintAgent activity'}</span></div>
    </div>
    <PulseModules demo={demo} preview={preview} />
    <div className="mt-4 border-t pt-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 className="impact-kicker">{demo ? 'Sample activity feed' : 'SaintAgent activity feed'}</h3>
        <select aria-label="Filter World Pulse activity" value={filter} onChange={e => setFilter(e.target.value)} className="impact-control">{options.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select>
      </div>
      <div className="impact-pulse flex gap-2 overflow-x-auto py-1">
      {!demo && activity?.events?.isPending ? <p role="status" className="impact-muted text-sm">Loading activity…</p> : !demo && activity?.events?.isError ? <p role="alert" className="impact-muted text-sm">Activity could not be loaded.</p> : !events.length ? <p className="impact-muted text-sm">No updates for this filter yet.</p> : events.map(event => {
        const [label, Icon] = categoryInfo(event);
        return <button type="button" key={event.id} onClick={() => demo ? setSample(event) : activity.setDialog(event)} className="impact-control impact-event text-left">
          {demo && <img className="mb-2 h-20 w-full object-cover" src={event.image_url} alt="" loading="lazy" />}
          <span className="impact-kicker flex items-center gap-1.5"><Icon size={14} /> {event.is_demo ? `Demo · ${label}` : label}</span>
          <strong className="block truncate text-xs" title={event.headline}>{event.headline}</strong><span className="impact-muted block text-[11px]">{formatTime(event.created_date)}</span>
        </button>;
      })}
      </div>
    </div>
    {sample && <LiveActivityDialog dialog={sample} sampleImage={sample.image_url} close={() => setSample(null)} />}
  </section>;
}