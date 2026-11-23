import { useEffect, useState } from 'react';

const local = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
const zones = [...new Set(['UTC', local, ...(Intl.supportedValuesOf?.('timeZone') || ['America/Denver', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Australia/Sydney'])])];
const display = zone => zone.replaceAll('_', ' ').replaceAll('/', ' / ');

export default function WorldClocks({ settings, commit, visible = true }) {
  const [now, setNow] = useState(Date.now), [search, setSearch] = useState(''), [picked, setPicked] = useState('');
  const selected = (settings.zones || [local, settings.zone]).filter((zone, index, all) => zones.includes(zone) && all.indexOf(zone) === index);
  const available = zones.filter(zone => !selected.includes(zone) && display(zone).toLowerCase().includes(search.trim().toLowerCase()));
  useEffect(() => {
    if (!visible) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [visible]);
  return <div className="grid gap-2">
    {selected.length ? <ul className="space-y-2">{selected.map(zone => <li key={zone} className="flex flex-wrap items-center justify-between gap-2"><div><p>{display(zone)}{zone === local && ' · Local'}</p><strong className="tabular-nums">{new Intl.DateTimeFormat(undefined, { timeZone: zone, timeStyle: 'medium' }).format(now)}</strong></div><button type="button" aria-label={`Remove ${display(zone)} clock`} onClick={() => commit({ zones: selected.filter(value => value !== zone) })}>Remove</button></li>)}</ul> : <p>No clocks added.</p>}
    <label>Find a time zone<input type="search" className="block w-full rounded border bg-background px-2 py-1" value={search} placeholder="Search by city or region" onChange={e => { setSearch(e.target.value); setPicked(''); }} /></label>
    <form className="flex flex-wrap gap-2" onSubmit={e => { e.preventDefault(); if (!available.includes(picked)) return; commit({ zones: [...selected, picked] }); setPicked(''); setSearch(''); }}>
      <select aria-label="Time zone to add" className="min-w-0 max-w-full rounded border bg-background" value={picked} onChange={e => setPicked(e.target.value)}>
        <option value="">{available.length ? 'Choose a time zone' : 'No matching time zones'}</option>{available.map(zone => <option value={zone} key={zone}>{display(zone)}</option>)}
      </select><button disabled={!picked}>Add clock</button>
    </form>
  </div>;
}