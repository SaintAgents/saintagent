import { lazy, Suspense } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import ImpactOpportunities from '@/components/globalimpact/ImpactOpportunities';

const workspacePages = {
  projects: ['Projects', lazy(() => import('@/pages/Projects'))],
  missions: ['Missions', lazy(() => import('@/pages/Missions'))],
  challenges: ['Challenges', lazy(() => import('@/pages/Quests'))],
  collectives: ['Collectives', lazy(() => import('@/pages/Circles'))],
  gatherings: ['Gatherings', lazy(() => import('@/pages/Events'))],
  research: ['Research & Intelligence', lazy(() => import('@/pages/Intelligence'))],
  people: ['People', lazy(() => import('@/pages/Profiles'))],
  growth: ['Growth', lazy(() => import('@/pages/Learn'))],
  'my-impact': ['My impact', lazy(() => import('@/pages/ImpactDashboard'))],
};
const tabs = [['overview','Overview'], ['opportunities','Opportunities'], ...Object.entries(workspacePages).slice(0, 6).map(([id,[name]]) => [id,name])];
export const isImpactTab = id => tabs.some(([key]) => id === key) || Object.hasOwn(workspacePages, id);

export default function ImpactWorkspace({ active, select, demo }) {
  const [title, Page] = workspacePages[active] || [];
  return <div className="impact-module-stack">
    <section id="impact-workspace" aria-label={title || 'Opportunities'} key={active} className="min-w-0">
      {Page ? <div className="impact-surface impact-embedded-shell">
        <header className="impact-workspace-heading"><p className="impact-kicker">Global Impact / Workspace</p><h2 className="text-2xl font-bold">{title}</h2></header>
        <div className="impact-embedded dark" tabIndex={0} role="region" aria-label={`${title} content`}>
          <ErrorBoundary><Suspense fallback={<p role="status" className="p-4">Loading {title}…</p>}><Page embedded /></Suspense></ErrorBoundary>
        </div>
      </div> : <ImpactOpportunities key={demo ? 'demo' : 'live'} demo={demo} />}
    </section>
    <nav aria-label="Platform modules" className="impact-modules grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap">
      {tabs.map(([id,name]) => <button key={id} type="button" aria-controls="impact-workspace" aria-pressed={active === id} className={`impact-control ${active === id ? 'impact-selected' : ''}`} onClick={() => select(id)}>{name}</button>)}
    </nav>
  </div>;
}