import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Input } from '@/components/ui/input';
import ImpactOpportunityMap from '@/components/globalimpact/ImpactOpportunityMap';
import useCollaborationRadar, { demoRadar, radarLayers } from '@/components/globalimpact/collaborationRadar';

export default function CollaborationRadar({ demo, inGuide = false }) {
  const { user } = useAuth();
  const [layer, setLayer] = useState('needs');
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [selection, select] = useState(null);
  const query = useCollaborationRadar(user?.id, layer, search, demo);
  const showUpdates = !demo && layer === 'initiatives';
  const updates = useCollaborationRadar(user?.id, 'initiativeUpdates', search, !showUpdates);
  const sources = showUpdates ? [query, updates] : [query];
  const rows = demo ? demoRadar(layer, search) : sources.flatMap(source => source.data?.pages.flatMap(page => page.items) || []);
  const pending = !demo && sources.some(source => source.isPending);
  const failed = !demo && sources.some(source => source.isError);
  const loadingMore = sources.some(source => source.isFetchingNextPage);
  const retry = () => sources.filter(source => source.isError).forEach(source => source.isFetchNextPageError ? source.fetchNextPage() : source.refetch());
  const selected = rows.find(row => row.id === selection) || rows[0];
  return <section className="impact-surface space-y-4 p-4">
    <header><h2 className="text-2xl font-bold">Global Collaboration Radar</h2><p className="impact-muted text-sm">Explore requests, open missions, offered skills and reported outcomes across SaintAgent. Records without a mapped region still appear in the list.</p></header>
    {demo && <p role="status" className="impact-muted text-sm">Demo radar: these records are fictional.</p>}
    <div className="flex flex-wrap gap-2" role="group" aria-label="Radar layer">
      {radarLayers.map(([id,label]) => <button key={id} type="button" aria-pressed={layer === id} className={`impact-control ${layer === id ? 'impact-selected' : ''}`} onClick={() => { setLayer(id); select(null); }}>{label}</button>)}
    </div>
    <form className="flex flex-wrap gap-2" role="search" onSubmit={e => { e.preventDefault(); setSearch(input.trim()); select(null); }}>
      <Input aria-label="Search this radar layer" placeholder={layer === 'initiatives' ? 'Search by topic or region' : layer === 'outcomes' ? 'Search by topic or region' : 'Search by topic, region or skill'} value={input} maxLength={100} onChange={e => setInput(e.target.value)} className="w-full bg-background sm:max-w-sm" />
      <button className="impact-control" type="submit">Search</button>{search && <button type="button" className="impact-control" onClick={() => { setInput(''); setSearch(''); select(null); }}>Clear search</button>}
    </form>
    {failed && <p role="alert">Some radar records could not be loaded. <button type="button" className="impact-text-link" onClick={retry}>Try again</button></p>}
    {!selected && pending ? <p role="status">Loading radar records…</p> : !selected && failed ? null : !selected ? <p role="status">No {radarLayers.find(([id]) => id === layer)[1].toLowerCase()} found{search ? ` for “${search}”` : ''}.</p> : <div className="impact-results">
      <ImpactOpportunityMap rows={rows} select={select} selected={selected.id} demo={demo} recordLabel="records" />
      <section className="space-y-2 break-words border border-border p-3" aria-live="polite">
        <h3 className="font-semibold">{selected.title}</h3><p className="impact-muted text-sm">{selected.region || 'No region listed'}</p>
        {selected.description && <p className="whitespace-pre-wrap text-sm">{selected.description}</p>}
        {inGuide && search && <p className="text-sm"><strong>Why it matched:</strong> {[
          ['title',selected.title],['description',selected.description],['region',selected.region],['skill',selected.terms.join(', ')],
        ].filter(([,value]) => value?.toLowerCase().includes(search.toLowerCase())).map(([field]) => field).join(', ') || 'A field in the source record'} contains “{search}”. Check the source before acting.</p>}
        {selected.metric && <p className="text-sm">Reported measure: {selected.metric}</p>}
        {!!selected.terms.length && <p className="impact-muted text-sm">Skills: {[...new Set(selected.terms)].join(', ')}</p>}
        {selected.path && <Link className="impact-text-link inline-block" to={selected.path}>Open source record →</Link>}
      </section>
    </div>}
    {sources.some(source => source.hasNextPage) && <button type="button" className="impact-control" disabled={loadingMore} onClick={() => sources.filter(source => source.hasNextPage).forEach(source => source.fetchNextPage())}>{loadingMore ? 'Loading…' : 'Load more'}</button>}
  </section>;
}