import { useState } from 'react';
import { X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PulseActions from '@/components/globalimpact/pulse/PulseActions';
import PulseGeography from '@/components/globalimpact/pulse/PulseGeography';
import PulseIndicators from '@/components/globalimpact/pulse/PulseIndicators';
import PulseTrend from '@/components/globalimpact/pulse/PulseTrend';
import { pulseLevels, pulseScope } from '@/components/globalimpact/pulse/pulseGeography';

const tabs = ['Overview','Indicators','Trends','Geography','Developments','Insights','Opportunities','Sources'];
export default function PulseExplorer({ domain, demo, scope, setScope, preview, onClose, headingRef }) {
  const [tab,setTab] = useState('Overview');
  const sample = demo && domain.id === 'economy', location = pulseScope(scope);
  const activeLevel = tab === 'Opportunities' ? 4 : scope.local ? 3 : scope.country ? 2 : scope.region ? 1 : 0;
  function navigateLevel(level) {
    if (level === 0) {setScope({region:'',country:'',local:''}); setTab('Overview');}
    else if (level === 4) setTab('Opportunities');
    else {
      if (level === 1) setScope({...scope,country:'',local:''});
      if (level === 2) setScope({...scope,local:''});
      setTab('Geography');
    }
  }
  return <section id="world-pulse-explorer" aria-labelledby="pulse-module-title" className="impact-surface mt-3 min-w-0 space-y-3 p-3 sm:p-4">
    <header className="flex flex-wrap items-start justify-between gap-2"><div><p className="impact-kicker">Intelligence Explorer · {location}</p><h3 id="pulse-module-title" tabIndex={-1} ref={headingRef} className="scroll-mt-32 text-xl font-bold">{domain.title}</h3><p className="impact-muted text-xs">{sample ? 'Demo data · Fictional examples only' : 'Live source coverage is not connected'}</p></div><button type="button" className="impact-control inline-flex items-center gap-1.5" onClick={onClose}><X size={14} /> Close module</button></header>
    <nav aria-label="Intelligence levels" className="flex flex-wrap gap-1.5">{pulseLevels.map((label,i) => <button type="button" key={label} className={`impact-control impact-small ${activeLevel === i ? 'impact-selected' : ''}`} aria-current={activeLevel === i ? 'step' : undefined} onClick={() => navigateLevel(i)}>{i+1}. {label}</button>)}</nav>
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList aria-label="Module views" className="h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0">{tabs.map(label => <TabsTrigger key={label} value={label} className={`impact-control ${tab === label ? 'impact-selected' : ''}`}>{label}</TabsTrigger>)}</TabsList>
      <TabsContent value="Overview"><PulseIndicators {...{domain,sample,scope,location}} /><div className="mt-3 flex flex-wrap gap-2"><button type="button" className="impact-control" onClick={() => setTab('Geography')}>Country Explorer</button><button type="button" className="impact-control" onClick={() => setTab('Developments')}>Emerging Signals</button>{!preview && <PulseActions {...{domain,demo,scope,location,preview}} />}</div></TabsContent>
      <TabsContent value="Indicators"><PulseIndicators {...{domain,sample,scope,location}} granular /></TabsContent>
      <TabsContent value="Trends"><PulseTrend sample={sample && !scope.region} location={location} /></TabsContent>
      <TabsContent value="Geography"><PulseGeography {...{scope,setScope,sample}} /></TabsContent>
      <TabsContent value="Developments"><p className="impact-muted text-sm">No verified developments are connected for {location}. The SaintAgent activity feed below is separate from external reporting.</p></TabsContent>
      <TabsContent value="Insights"><PulseActions {...{domain,demo,scope,location,preview}} section="insights" /></TabsContent>
      <TabsContent value="Opportunities"><PulseActions {...{domain,demo,scope,location,preview}} section="opportunities" /></TabsContent>
      <TabsContent value="Sources"><p className="impact-muted text-sm">{sample ? 'The demo numbers come from fictional World Pulse examples, not from the providers below.' : 'No data has been retrieved for this module.'} These are candidate providers, not citations for displayed readings.</p><ul className="mt-2 flex list-none flex-wrap gap-2 p-0">{domain.sources.map(([name,url]) => <li key={name}><a className="impact-control inline-block" href={url} target="_blank" rel="noopener noreferrer">{name} ↗</a></li>)}</ul></TabsContent>
    </Tabs>
  </section>;
}