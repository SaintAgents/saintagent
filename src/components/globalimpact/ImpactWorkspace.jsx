import { lazy, Suspense, useSyncExternalStore } from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';
import ImpactOpportunities from '@/components/globalimpact/ImpactOpportunities';
import ImpactTimeline from '@/components/globalimpact/ImpactTimeline';

function subscribeTheme(onChange) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes:true, attributeFilter:['data-theme'] });
  return () => observer.disconnect();
}
const readDark = () => ['dark', 'hacker', 'custom'].includes(document.documentElement.dataset.theme);

const workspacePages = {
  overview: ['My Impact', lazy(() => import('@/pages/ImpactDashboard'))],
  projects: ['Projects', lazy(() => import('@/pages/Projects'))],
  missions: ['Missions', lazy(() => import('@/pages/Missions'))],
  challenges: ['Challenges', lazy(() => import('@/pages/Quests'))],
  collectives: ['Collectives', lazy(() => import('@/pages/Circles'))],
  gatherings: ['Gatherings', lazy(() => import('@/pages/Events'))],
  research: ['Research & Intelligence', lazy(() => import('@/pages/Intelligence'))],
  people: ['People', lazy(() => import('@/pages/Profiles'))],
  growth: ['Growth', lazy(() => import('@/pages/Learn'))],
};
const tabs = [['overview','Overview'], ['opportunities','Opportunities'], ...['projects','missions','challenges','collectives','gatherings','research'].map(id => [id, workspacePages[id][0]])];
export const isImpactTab = id => tabs.some(([key]) => id === key) || Object.hasOwn(workspacePages, id);

export default function ImpactWorkspace({ active, select, demo }) {
  const [title, Page] = workspacePages[active] || [];
  const dark = useSyncExternalStore(subscribeTheme, readDark, () => false);
  return <div className="impact-module-stack">
    <nav id="impact-module-tabs" aria-label="Platform modules" className="impact-modules scroll-mt-32 grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap">
      {tabs.map(([id,name]) => <button key={id} type="button" aria-controls="impact-workspace" aria-pressed={active === id} className={`impact-control ${active === id ? 'impact-selected' : ''}`} onClick={() => select(id)}>{name}</button>)}
    </nav>
    <section id="impact-workspace" aria-label={title || 'Opportunities'} className="min-w-0">
      {Page ? <div key={active} className="impact-surface impact-embedded-shell">
        <header className="impact-workspace-heading"><p className="impact-kicker">Global Impact / Workspace</p><h2 className="text-2xl font-bold">{title}</h2></header>
        <div className={`impact-embedded${dark ? ' dark' : ''}`} data-impact-module={active} tabIndex={active === 'overview' ? undefined : 0} role="region" aria-label={`${title} content`}>
          <ErrorBoundary><Suspense fallback={<p role="status" className="p-4">Loading {title}…</p>}><Page embedded {...(active === 'overview' && { afterStats: <ImpactTimeline key={demo ? 'demo' : 'live'} demo={demo} /> })} /></Suspense></ErrorBoundary>
        </div>
      </div> : <ImpactOpportunities key={demo ? 'demo' : 'live'} demo={demo} />}
    </section>
  </div>;
}