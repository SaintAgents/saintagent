import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, Compass, Flower2, Globe2, Layers3, Lightbulb, Radio, Sparkles, Users } from 'lucide-react';
import ImpactOpportunities from '@/components/globalimpact/ImpactOpportunities';
import WorldPulse from '@/components/globalimpact/WorldPulse';
import { openGuide } from '@/components/globalimpact/impactDiscovery';
import '@/components/globalimpact/globalImpact.css';

const destinations = [['Discovery','#opportunities',Globe2],['Research','/Intelligence',Lightbulb],['People','/Profiles',Users],['Projects','/Projects',Layers3],['Growth','/Learn',Flower2],['Missions','/Missions',Compass]];
const modules = [['Overview','/GlobalImpactDashboard'],['Opportunities','#opportunities'],['Projects','/Projects'],['Missions','/Missions'],['Challenges','/Quests'],['Collectives','/Circles'],['Gatherings','/Events'],['Research & Intelligence','/Intelligence']];

export default function GlobalImpactDashboard() {
  const [params, setParams] = useSearchParams();
  const demo = params.get('demo') === '1';
  function toggleDemo() {
    const next = new URLSearchParams(params);
    if (demo) next.delete('demo'); else next.set('demo', '1');
    setParams(next, { preventScrollReset:true });
  }
  return <section id="global-impact" className="min-h-dvh px-3 pb-24 pt-5 sm:px-6">
    <div className="mx-auto max-w-[100rem] space-y-4">
      <div className="impact-command impact-surface flex flex-wrap items-center justify-between gap-3 p-2 sm:px-3">
        <span className="impact-brand flex items-center gap-2 text-sm font-bold tracking-widest"><Compass size={24} /> SAINTAGENT</span>
        <div className="flex flex-wrap items-center gap-1.5" role="navigation" aria-label="SaintAgent command shortcuts">{destinations.map(([name,to,Icon]) => to.startsWith('#') ? <a key={name} className="impact-control impact-selected" href={to} aria-label={name} title={name}><Icon size={17} /></a> : <Link key={name} className="impact-control" to={to} aria-label={name} title={name}><Icon size={17} /></Link>)}</div>
        <button type="button" className="impact-control impact-guide inline-flex items-center gap-2" onClick={() => openGuide()}><Sparkles size={16} /> My Guide</button>
      </div>
      <div className="impact-intro flex flex-wrap items-end justify-between gap-3 px-1 py-3 sm:py-6">
        <div><p className="impact-kicker">SAINTAGENT / GLOBAL OPERATIONS</p><h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-5xl">Global Impact Dashboard</h1><p className="impact-muted mt-2 text-sm">Find opportunities, connect with people, and turn ideas into action.</p></div>
        <div className="flex flex-wrap gap-2"><button type="button" className="impact-control impact-guide inline-flex items-center gap-2" onClick={() => openGuide('Help me plan a mission. Ask about my intended outcome and help me identify an existing initiative or draft the first practical milestone.')}>Plan a mission <Sparkles size={14} /></button><Link className="impact-control inline-flex items-center gap-2" to={demo ? '/Intelligence?demo=garden' : '/Intelligence'}>Research Hub <ArrowUpRight size={14} /></Link><Link className="impact-control inline-flex items-center gap-2" to="/ImpactDashboard">My impact <ArrowUpRight size={14} /></Link></div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" aria-pressed={demo} className={`impact-control ${demo ? 'impact-selected' : ''}`} onClick={toggleDemo}>{demo ? 'Exit Demo' : 'Demo'}</button>
        {demo && <p className="impact-muted text-sm" role="status">Demo mode: opportunities and World Pulse updates are fictional.</p>}
      </div>
      <ImpactOpportunities key={demo ? 'demo' : 'live'} demo={demo} />
      <div role="navigation" aria-label="Platform modules" className="impact-modules grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap">{modules.map(([name,to]) => to.startsWith('#') ? <a key={name} className="impact-control impact-selected" href={to}>{name}</a> : <Link key={name} className="impact-control" to={to}>{name}</Link>)}</div>
      <WorldPulse key={demo ? 'demo' : 'live'} icon={Radio} demo={demo} />
    </div>
  </section>;
}