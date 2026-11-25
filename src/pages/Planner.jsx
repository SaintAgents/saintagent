import React from 'react';
import { useSearchParams } from 'react-router-dom';
import ProjectPlanner from '@/components/collab/ProjectPlanner';
import { useAuth } from '@/lib/AuthContext';
import { isTourPreview } from '@/components/tour/tourPreviewTargets';
import WorkspaceReferenceList from '@/components/watch/WorkspaceReferenceList';
import GuideSavedPlans from '@/components/guide/GuideSavedPlans';

export default function Planner() {
  const { user } = useAuth();
  const [params,setParams] = useSearchParams();
  const draft = params.get('draft');
  const guidePlan = params.get('guidePlan');
  React.useEffect(() => {
    if (!draft && !guidePlan) return;
    const frame = requestAnimationFrame(() => document.getElementById(guidePlan ? 'guide-action-plans' : 'linked-drafts')?.scrollIntoView({block:'start'}));
    return () => cancelAnimationFrame(frame);
  }, [draft,guidePlan]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Collaborative Planner</h1>
        <ProjectPlanner />
        {user && !isTourPreview() && <GuideSavedPlans owner={user.id} selected={guidePlan} select={id => setParams(previous => { const next = new URLSearchParams(previous); if (id) next.set('guidePlan',id); else next.delete('guidePlan'); return next; })} />}
        {user && !isTourPreview() && <section id="linked-drafts" className="mt-6 space-y-3 scroll-mt-32"><h2 className="text-xl font-semibold">Linked drafts</h2>{draft && <button type="button" className="text-sm underline" onClick={() => setParams({})}>All linked drafts</button>}<WorkspaceReferenceList owner={user.id} kind="plan" recordId={draft} /></section>}
      </div>
    </div>
  );
}