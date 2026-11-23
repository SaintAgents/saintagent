import React, { lazy, Suspense, useState } from 'react';
import { Link } from 'react-router-dom';
import { Globe2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import ImpactFilters from '@/components/globalimpact/ImpactFilters';
import ImpactOpportunityCards from '@/components/globalimpact/ImpactOpportunityCards';
import ImpactOpportunityDetail from '@/components/globalimpact/ImpactOpportunityDetail';
import useImpactOpportunities from '@/components/globalimpact/useImpactOpportunities';
import { demoInterests, filterDemoOpportunities } from '@/components/globalimpact/impactDemo';

const ImpactOpportunityMap = lazy(() => import('@/components/globalimpact/ImpactOpportunityMap'));
const empty = { search:'', category:'', format:'', duration:'', region:'', skill:'' };

export default function ImpactOpportunities({ demo = false }) {
  const { user } = useAuth();
  const profile = useQuery({ queryKey:['myProfile',user?.email], queryFn:() => base44.entities.UserProfile.filter({ user_id:user.email }, '-updated_date', 1), enabled:!demo && !!user?.email });
  const [mode, setMode] = useState('all'), [view, setView] = useState('cards'), [expanded, setExpanded] = useState(false);
  const skills = useQuery({ queryKey:['impact-offered-skills',user?.email], queryFn:() => base44.entities.Skill.filter({ user_id:user.email, type:'offer' }, '-updated_date', 30), enabled:!demo && mode === 'forYou' && !!user?.email, staleTime:60000 });
  const tags = demo ? demoInterests : [...new Set([...(profile.data?.[0]?.interest_tags || []), ...(skills.data || []).map(skill => skill.skill_name)].filter(tag => typeof tag === 'string' && tag.trim()).map(tag => tag.trim()))].slice(0, 30);
  const [filters, setFilters] = useState(empty), [selection, select] = useState(null);
  const patch = fields => setFilters(previous => ({ ...previous, ...fields }));
  const opportunities = useImpactOpportunities(demo ? null : user, filters, mode, tags);
  const rows = demo ? filterDemoOpportunities(filters, mode) : opportunities.data?.pages.flatMap(page => page.items) || [];
  const selected = rows.find(row => row.id === selection) || rows[0];
  const choose = id => { select(id); if (document.getElementById('impact-results')?.getBoundingClientRect().width < 850) requestAnimationFrame(() => document.getElementById('impact-selected-detail')?.scrollIntoView({ block:'start' })); };
  return <section id="opportunities" className="impact-surface impact-opportunities scroll-mt-32 p-3 sm:p-4">
    <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-3"><Globe2 size={29} className="impact-globe shrink-0" /><div><h2 className="text-2xl font-bold leading-tight">Opportunities</h2><p className="impact-muted text-sm">Real ways to make a difference. Find your next step.</p></div></div>
      <Link className="impact-text-link text-xs" to="/Matches">Explore collaborator matches →</Link>
    </header>
    <ImpactFilters {...{mode,setMode,view,setView,expanded,setExpanded,filters,patch,demo}} />
    {demo && mode === 'forYou' && <p className="impact-muted mb-3 text-xs">Sample interests: gardening and teaching.</p>}
    {mode === 'forYou' && !tags.length ? <p role="status" className="impact-muted p-4 text-sm">{profile.isPending || skills.isPending ? 'Loading your interests and skills…' : profile.isError || skills.isError ? 'Your interests or skills could not be loaded.' : <>Add interest tags in <Link className="impact-text-link" to="/Settings">Settings</Link> or offered skills on your <Link className="impact-text-link" to="/Profile">profile</Link> to see matching opportunities here.</>}</p> :
    !demo && opportunities.isPending ? <p role="status" className="impact-muted p-4 text-sm">Loading opportunities…</p> : !demo && opportunities.isError && !rows.length ? <p role="alert" className="p-4 text-sm">Could not load opportunities. <button type="button" className="impact-text-link" onClick={() => opportunities.refetch()}>Try again</button></p> : !rows.length ? <p className="impact-muted p-4 text-sm">No opportunities match. <button type="button" className="impact-text-link" onClick={() => {setFilters(empty);setMode('all');}}>Show all opportunities</button></p> :
    <div id="impact-results" className="impact-results">
      <div className="min-w-0 space-y-3">{view === 'map' ? <Suspense fallback={<p role="status">Loading map…</p>}><ImpactOpportunityMap demo={demo} rows={rows} select={choose} selected={selected?.id} /></Suspense> : <ImpactOpportunityCards {...{rows,view,tags,demo}} select={choose} selected={selected?.id} />}
        {opportunities.isFetchNextPageError && <p role="alert" className="impact-muted text-xs">Could not load the next page.</p>}
        {opportunities.hasNextPage && <button type="button" className="impact-control" disabled={opportunities.isFetchingNextPage} onClick={() => opportunities.fetchNextPage()}>{opportunities.isFetchingNextPage ? 'Loading…' : 'Load more'}</button>}
      </div>
      {selected && <div id="impact-selected-detail" className="min-w-0 scroll-mt-32"><ImpactOpportunityDetail key={selected.id} row={selected} tags={tags} demo={demo} /></div>}
    </div>}
  </section>;
}