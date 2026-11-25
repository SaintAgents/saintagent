import { ArrowLeft, Radio } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import WorldPulsePanel from '@/components/globalimpact/WorldPulse';
import TreasuryPulse from '@/components/globalimpact/pulse/TreasuryPulse';
import { isTourPreview } from '@/components/tour/tourPreviewTargets';
import '@/components/globalimpact/globalImpact.css';

export default function WorldPulse() {
  const [params, setParams] = useSearchParams();
  const demo = params.get('impactDemo') === '1';
  const preview = isTourPreview();
  const treasury = !preview && params.get('feed') === 'ggt';
  function selectSetting(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { preventScrollReset: true });
  }
  const settings = [
    ['Pulse source', 'feed', [['SaintAgent', '', !treasury], ['Gaia Global Treasury', 'ggt', treasury]]],
    ['Data mode', 'impactDemo', [['Live', '', !demo], ['Demo', '1', demo]]],
  ];
  return <div id="global-impact" className="min-h-dvh px-3 pb-24 pt-5 sm:px-6">
    <div className="mx-auto max-w-[100rem] space-y-4">
      {!preview && <div className="flex flex-wrap items-center justify-between gap-2">
        <Link className="impact-control inline-flex items-center gap-2" to={`/GlobalImpactDashboard${demo ? '?impactDemo=1' : ''}`}><ArrowLeft size={14} aria-hidden="true" /> Global Impact Dashboard</Link>
        <div className="flex flex-wrap gap-3">
          {settings.map(([label, key, options]) => <div key={key} role="group" aria-label={label} className="flex flex-wrap gap-1">
            {options.map(([name, value, pressed]) => <button key={name} type="button" className={`impact-control ${pressed ? 'impact-selected' : ''}`} aria-pressed={pressed} onClick={() => selectSetting(key, value)}>{name}</button>)}
          </div>)}
        </div>
      </div>}
      {demo && !preview && <p className="impact-muted text-sm" role="status">Demo mode · Fictional samples only. Nothing is saved or published.</p>}
      {treasury ? <TreasuryPulse key={String(demo)} demo={demo} /> : <WorldPulsePanel key={String(demo)} icon={Radio} demo={demo} preview={preview} standalone />}
    </div>
  </div>;
}