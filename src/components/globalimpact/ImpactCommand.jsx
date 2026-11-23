import AnimatedBrandLogo from '@/components/hud/AnimatedBrandLogo';
import { openGuide } from '@/components/globalimpact/impactDiscovery';

const artwork = 'https://media.base44.com/images/public/694f3e0401b05e6e8a042002/';
const logo = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/8c39339ab_logo.png';
const shortcuts = [
  ['Discovery', 'opportunities', 'ffb35bb8cdec7d7b4c723663895bea1a', '209 100% 63%'],
  ['Research', 'research', 'ad5132ad4cd9bda39cbfee0406c69b0c', '35 100% 61%'],
  ['People', 'people', '3ed8d44b72648d5bf2d1af32d666523c', '270 100% 72%'],
  ['Projects', 'projects', '36847c626aeb25092e95695a1181e09a', '355 100% 67%'],
  ['Growth', 'growth', '51694b92302ca82066a2ae0d2970fe5b', '144 82% 55%'],
  ['Missions', 'missions', '781c6d0d734fcc95fe4d643c6eac2745', '192 100% 65%'],
];

export default function ImpactCommand({ active, select }) {
  return <header className="impact-command impact-surface">
    <button type="button" aria-label="SaintAgent dashboard overview" className="impact-brand" onClick={() => select('overview')}>
      <AnimatedBrandLogo className="impact-brand-logo" fallback={logo} />
    </button>
    <nav aria-label="SaintAgent command shortcuts" className="impact-shortcuts">
      {shortcuts.map(([name, id, image, tone]) => <button type="button" key={id} aria-controls="impact-workspace" aria-pressed={active === id} className="impact-shortcut" style={{ '--tile-tone':tone }} onClick={() => select(id)}>
        <img alt="" src={`${artwork}${image}_generated_image.png`} /><span>{name}</span>
      </button>)}
    </nav>
    <button type="button" className="impact-guide-tile" onClick={() => openGuide()}>
      <img src={`${artwork}6c80615230009d4020195b9535d88852_generated_image.png`} alt="" width={52} height={52} />
      <span>My Guide</span>
    </button>
  </header>;
}