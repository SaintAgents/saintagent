import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowUpRight, Radio, Sparkles } from 'lucide-react';
import ImpactCommand from '@/components/globalimpact/ImpactCommand';
import ImpactWorkspace, { isImpactTab } from '@/components/globalimpact/ImpactWorkspace';
import WorldPulse from '@/components/globalimpact/WorldPulse';
import { openGuide } from '@/components/globalimpact/impactDiscovery';
import '@/components/globalimpact/globalImpact.css';

export default function GlobalImpactDashboard() {
  const [params, setParams] = useSearchParams();
  const requested = params.get('workspace');
  const active = isImpactTab(requested) ? requested : 'overview';
  const demo = params.get('demo') === '1' || params.get('impactDemo') === '1';
  function select(id) {
    if (id === active) return;
    const next = new URLSearchParams();
    if (id !== 'overview') next.set('workspace', id);
    if (demo) {
      next.set('impactDemo', '1');
      if (id === 'research') next.set('demo', 'garden');
    }
    setParams(next, { preventScrollReset:true });
  }
  function toggleDemo() {
    const next = new URLSearchParams(params);
    if (demo) { next.delete('demo'); next.delete('impactDemo'); }
    else {
      next.set('impactDemo', '1');
      if (active === 'research') next.set('demo', 'garden');
    }
    setParams(next, { preventScrollReset:true });
  }
  return <section id="global-impact" className="min-h-dvh px-3 pb-24 pt-5 sm:px-6">
    <div className="mx-auto max-w-[100rem] space-y-4">
      <ImpactCommand active={active} select={select} />
      <div className="impact-intro flex flex-wrap items-end justify-between gap-3 px-1 py-3 sm:py-6">
        <div><p className="impact-kicker">SAINTAGENT / GLOBAL OPERATIONS</p><h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-5xl">Global Impact Dashboard</h1><p className="impact-muted mt-2 text-sm">Find opportunities, connect with people, and turn ideas into action.</p></div>
        <div className="flex flex-wrap gap-2"><button type="button" className="impact-control impact-guide inline-flex items-center gap-2" onClick={() => openGuide('Help me plan a mission. Ask about my intended outcome and help me identify an existing initiative or draft the first practical milestone.')}>Plan a mission <Sparkles size={14} /></button><button type="button" className="impact-control inline-flex items-center gap-2" onClick={() => select('research')}>Research Hub <ArrowUpRight size={14} /></button><button type="button" className="impact-control inline-flex items-center gap-2" onClick={() => select('my-impact')}>My impact <ArrowUpRight size={14} /></button></div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" aria-pressed={demo} className={`impact-control ${demo ? 'impact-selected' : ''}`} onClick={toggleDemo}>{demo ? 'Exit Demo' : 'Demo'}</button>
        {demo && <p className="impact-muted text-sm" role="status">Demo mode: opportunities and World Pulse updates are fictional.</p>}
      </div>
      <ImpactWorkspace active={active} select={select} demo={demo} />
      <WorldPulse key={demo ? 'demo' : 'live'} icon={Radio} demo={demo} />
    </div>
  </section>;
}