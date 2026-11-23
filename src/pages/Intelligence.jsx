import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import IntelligenceForm from '@/components/intelligence/IntelligenceForm';
import IntelligenceResults from '@/components/intelligence/IntelligenceResults';
import IntelligenceReport from '@/components/intelligence/IntelligenceReport';
import IntelligenceLibrary from '@/components/intelligence/IntelligenceLibrary';
import '@/components/intelligence/intelligence.css';

export default function Intelligence() {
  const {user} = useAuth(), [params,setParams] = useSearchParams(), client = useQueryClient();
  const [objective,setObjective] = useState(() => (params.get('objective') || '').trim().slice(0, 400)), [source,setSource] = useState('all'), [matching,setMatching] = useState('keywords');
  const [seed,setSeed] = useState(null), [parent,setParent] = useState(null), [busy,setBusy] = useState(''), [error,setError] = useState(''), [search,setSearch] = useState(null);
  const inputRef = useRef(null), resultRef = useRef(null), running = useRef(false), id = params.get('study');
  const incomingObjective = params.get('objective');
  useEffect(() => {
    if (!incomingObjective) return;
    setObjective(incomingObjective.trim().slice(0, 400)); setSeed(null); setParent(null); setError('');
  }, [incomingObjective]);
  async function run(mode) {
    if (running.current) return;
    running.current = true; setBusy(mode); setError('');
    try {
      const {data} = await base44.functions.invoke('saintIntelligence',{objective:objective.trim(),source,matching,mode,...(mode === 'research' && {seed:seed ? {kind:seed.kind,id:seed.id} : null,parentId:parent?.id})});
      if (mode === 'search') {setSearch({objective:objective.trim(), matches:data.matches, relatedTerms:data.relatedTerms}); setParams({});}
      else {setSeed(null); setParent(null); setSearch(null); setParams({study:data.id}); client.invalidateQueries({queryKey:['intelligence-library',user.id]});}
      requestAnimationFrame(() => resultRef.current?.focus());
    } catch (e) {setError(e.response?.data?.error || 'Could not complete this request. Please try again.');}
    finally {running.current = false; setBusy('');}
  }
  function begin(ref, report) {
    setError(''); setSeed(ref); setParent(report); setMatching('keywords'); setSource('all'); setObjective(ref?.title || report.objective); inputRef.current?.focus();
  }
  return <section id="saint-intelligence" className="px-4 pb-24 pt-6 sm:px-7"><div className="mx-auto max-w-6xl space-y-6">
    <section data-intel-hero className="space-y-5 rounded-lg border p-4 sm:p-8"><div><p data-intel-kicker className="text-xs font-semibold uppercase tracking-widest">Research · Discovery · Development</p><h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-5xl">SAINT INTELLIGENCE</h1><p className="mt-2">Discover Everything. Connect the Knowledge. Develop the Possibilities.</p></div>
      <IntelligenceForm {...{objective,setObjective,source,setSource,matching,setMatching,seed,setSeed,parent,setParent,busy,run,inputRef}} />
      {error && <p role="alert" className="text-sm font-semibold">{error}</p>}
    </section>
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(15rem,20rem)]"><div ref={resultRef} tabIndex={-1} className="min-w-0 scroll-mt-36 space-y-4">
      {id ? <IntelligenceReport key={id} id={id} owner={user.id} busy={busy} onBranch={report => begin(null,report)} /> : <IntelligenceResults search={search} busy={busy} onExpand={ref => begin(ref,null)} />}
      {!id && !search && <section data-intel-panel className="space-y-2 rounded-lg border p-5"><h2 className="font-heading text-xl font-semibold">From discovery to investigation</h2><p>Explore published news and courses, discover missions, listings and organizations, or search your own projects. Deep Dive turns accessible excerpts into a cited brief you can reopen and expand.</p></section>}
    </div><IntelligenceLibrary owner={user.id} current={id} /></div>
  </div></section>;
}