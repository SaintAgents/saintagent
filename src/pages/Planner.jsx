import React from 'react';
import { useSearchParams } from 'react-router-dom';
import ProjectPlanner from '@/components/collab/ProjectPlanner';
import { useAuth } from '@/lib/AuthContext';
import { isTourPreview } from '@/components/tour/tourPreviewTargets';
import WorkspaceReferenceList from '@/components/watch/WorkspaceReferenceList';

export default function Planner() {
  const { user } = useAuth();
  const [params,setParams] = useSearchParams();
  const draft = params.get('draft');
  React.useEffect(() => {
    if (!draft) return;
    const frame = requestAnimationFrame(() => document.getElementById('linked-drafts')?.scrollIntoView({block:'start'}));
    return () => cancelAnimationFrame(frame);
  }, [draft]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Collaborative Planner</h1>
        <ProjectPlanner />
        {user && !isTourPreview() && <section id="linked-drafts" className="mt-6 space-y-3 scroll-mt-32"><h2 className="text-xl font-semibold">Linked drafts</h2>{draft && <button type="button" className="text-sm underline" onClick={() => setParams({})}>All linked drafts</button>}<WorkspaceReferenceList owner={user.id} kind="plan" recordId={draft} /></section>}
      </div>
    </div>
  );
}