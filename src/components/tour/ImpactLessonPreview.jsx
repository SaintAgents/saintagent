import React from 'react';
import { Radio } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { Link } from 'react-router-dom';
import WorldPulse from '@/components/globalimpact/WorldPulse';
import ImpactWorkspace from '@/components/globalimpact/ImpactWorkspace';
import ErrorBoundary from '@/components/ErrorBoundary';
import '@/components/globalimpact/globalImpact.css';

const noAction = () => {};

export default function ImpactLessonPreview({ target }) {
  const { user } = useAuth();
  const pulse = target.anchor === '[aria-label="World Pulse"]';
  const active = target.params?.workspace || 'overview';
  const demo = pulse || active === 'opportunities';
  if (!demo && !user) return <p role="status" className="p-4 text-sm">Open <Link className="underline" to="/GlobalImpactDashboard" target="_blank" rel="noopener noreferrer">the live dashboard</Link> to see your personal impact.</p>;
  return <div className="min-h-0 flex-1 overflow-auto bg-background" tabIndex={0} aria-label={`${target.label} read-only preview`}>
    <ErrorBoundary>
      <section id="global-impact" className="space-y-3 p-3">
        <header className="impact-surface p-3"><p className="impact-kicker">Global Impact Dashboard</p><h3 className="text-lg font-bold">{target.label}</h3></header>
        <div inert="">
          {pulse ? <WorldPulse icon={Radio} demo preview /> : <ImpactWorkspace active={active} demo={demo} select={noAction} previewUser={user} />}
        </div>
      </section>
    </ErrorBoundary>
  </div>;
}