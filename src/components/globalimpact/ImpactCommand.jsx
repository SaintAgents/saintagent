import ImpactCommandPulse from '@/components/globalimpact/ImpactCommandPulse';
import { Link } from 'react-router-dom';
import { Compass, Search } from 'lucide-react';

const artwork = 'https://media.base44.com/images/public/694f3e0401b05e6e8a042002/';
const logo = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/8c39339ab_logo.png';
const shortcuts = [
  ['Master HUD', 'command', 'd80829ac69d2eef09e39e0d19343e854', '43 92% 68%', 'Master Command HUD'],
  ['Discovery', 'opportunities', 'ffb35bb8cdec7d7b4c723663895bea1a', '209 100% 63%'],
  ['Research', 'research', 'ad5132ad4cd9bda39cbfee0406c69b0c', '35 100% 61%'],
  ['People', 'people', '3ed8d44b72648d5bf2d1af32d666523c', '270 100% 72%'],
  ['Projects', 'projects', '36847c626aeb25092e95695a1181e09a', '355 100% 67%'],
  ['Growth', 'growth', '51694b92302ca82066a2ae0d2970fe5b', '144 82% 55%'],
  ['Missions', 'missions', '781c6d0d734fcc95fe4d643c6eac2745', '192 100% 65%'],
  ['Radar', 'radar', '35bb6e47b416cacdb4c17849bedb98fa', '173 90% 60%', 'Collaboration Radar'],
  ['Collectives', 'collectives', 'b42f024e61bfe678315c36d1fe6ccb9d', '151 82% 62%'],
  ['Gatherings', 'gatherings', '535aef5be25fb6e2774242e44de04325', '49 100% 67%'],
];

export default function ImpactCommand({ active, select }) {
  return <header className="impact-command impact-surface">
    <div className="impact-command-pulse-window" aria-hidden="true"><ImpactCommandPulse /></div>
    <button type="button" aria-label="SaintAgent dashboard overview" className="impact-brand" onClick={() => select('overview')}>
      <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
        <defs><filter id="impact-brand-light-key" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  1.4 2.2 0.9 0 -0.14" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter></defs>
      </svg>
      <img className="impact-brand-logo" src={logo} alt="" draggable={false} />
    </button>
    <nav aria-label="SaintAgent command shortcuts" className="impact-shortcuts">
      <Link to="/SharedSearch" aria-label="Shared Search" title="Shared Search" className="impact-shortcut text-center" style={{ '--tile-tone':'var(--impact-cyan)' }}>
        <Search className="m-auto size-6 text-card-foreground" aria-hidden="true" /><span>Search</span>
      </Link>
      <Link to="/IntelligenceDashboard" aria-label="Intel Hub: Intelligence Dashboard" title="Intelligence Dashboard" className="impact-shortcut text-center" style={{ '--tile-tone':'245 100% 76%' }}>
        <img alt="" src={`${artwork}dee14f8e015f59dc910ae9185e67c4bd_generated_image.png`} /><span>Intel Hub</span>
      </Link>
      {shortcuts.map(([name, id, image, tone, title]) => <button type="button" key={id} title={title} aria-controls="impact-workspace" aria-pressed={active === id} className="impact-shortcut" style={{ '--tile-tone':tone }} onClick={() => select(id)}>
        <img alt="" src={`${artwork}${image}_generated_image.png`} /><span>{name}</span>
      </button>)}
    </nav>
    <Link to="/MyGuide" className="impact-guide-tile">
      <img src={`${artwork}6c80615230009d4020195b9535d88852_generated_image.png`} alt="" width={52} height={52} />
      <Compass className="impact-guide-light-icon" aria-hidden="true" />
      <span>My Guide</span>
    </Link>
  </header>;
}