import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import GuideEngine from '@/components/guide/GuideEngine';
import GuideKnowledgeGraph from '@/components/guide/GuideKnowledgeGraph';
import GuideOrchestrator from '@/components/guide/GuideOrchestrator';
import GuidePossibilitySimulator from '@/components/guide/GuidePossibilitySimulator';
import CollaborationRadar from '@/components/globalimpact/CollaborationRadar';
import '@/components/globalimpact/globalImpact.css';

const Intelligence = lazy(() => import('@/pages/Intelligence'));

const functions = [
  ['mission','SAINT Mission Intelligence','Ground a goal in SaintAgent evidence and prepare a mission plan.'],
  ['graph','Living Knowledge Graph','Explore recorded connections and see why each contact matches.'],
  ['research','SAINT Deep Research Studio','Search sources, run a cited investigation and branch from prior findings.'],
  ['actions','Intelligent Action Orchestrator','Turn goals or meeting notes into editable, private follow-up drafts.'],
  ['simulator','Possibility Simulator','Compare assumptions, deadline buffers and capacity risks.'],
  ['blueprint','Living Purpose & Capability Profile','Edit the private Blueprint you can choose to use in a Weaver run.'],
  ['radar','Global Collaboration Radar','Explore needs, initiatives, capabilities and outcomes by region or topic.'],
];

export default function GuidePrimaryFunctions() {
  const { user } = useAuth();
  const [params] = useSearchParams(), { hash } = useLocation();
  const requested = params.get('guideTool') || ({'#guide-blueprint':'blueprint','#guide-simulator':'simulator'}[hash]);
  const active = functions.some(([id]) => id === requested) ? requested : 'mission';
  const [visited,setVisited] = useState(() => new Set([active]));
  useEffect(() => {setVisited(previous => previous.has(active) ? previous : new Set([...previous,active]));}, [active]);
  useEffect(() => {
    if (hash !== '#guide-workspace') return;
    const frame = requestAnimationFrame(() => document.getElementById('guide-workspace')?.focus());
    return () => cancelAnimationFrame(frame);
  }, [active,hash]);
  const [,,description] = functions.find(([id]) => id === active);
  const content = {mission:<GuideEngine />, graph:<GuideKnowledgeGraph email={user?.email} />, research:user && <Suspense fallback={<p role="status">Loading research…</p>}><Intelligence inGuide guideActive={active === 'research'} /></Suspense>, actions:user && <GuideOrchestrator owner={user.id} />, simulator:<GuidePossibilitySimulator expanded />, blueprint:<GuideEngine blueprintOnly />, radar:<div id="global-impact" className="rounded-xl"><CollaborationRadar inGuide /></div>};
  return <section className="space-y-4" aria-labelledby="guide-functions-title">
    <h2 id="guide-functions-title" className="font-heading text-2xl font-bold">Primary functions</h2>
    <nav aria-label="My Guide workspaces" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {functions.map(([id,title],index) => <Link key={id} to={`?guideTool=${id}#guide-workspace`} aria-current={active === id ? 'page' : undefined} className={`rounded-lg border px-3 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring ${active === id ? 'border-primary bg-primary/10 text-foreground' : 'border-border bg-card text-card-foreground hover:bg-muted'}`}>{index+1}. {title}</Link>)}
    </nav>
    <section id="guide-workspace" tabIndex={-1} className="scroll-mt-32 space-y-4 rounded-xl border bg-card p-4 sm:p-6" aria-labelledby="guide-workspace-title">
      <div><h3 id="guide-workspace-title" className="font-heading text-xl font-bold">{functions.find(([id]) => id === active)[1]}</h3><p className="text-sm text-muted-foreground">{description}</p></div>
      {functions.map(([id]) => (active === id || visited.has(id)) && <div key={id} hidden={active !== id}>{content[id]}</div>)}
    </section>
  </section>;
}