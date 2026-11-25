import { ArrowLeft, Radio } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import WorldPulsePanel from '@/components/globalimpact/WorldPulse';
import { isTourPreview } from '@/components/tour/tourPreviewTargets';
import '@/components/globalimpact/globalImpact.css';

export default function WorldPulse() {
  const [params, setParams] = useSearchParams();
  const demo = params.get('impactDemo') === '1';
  const preview = isTourPreview();
  function toggleDemo() {
    const next = new URLSearchParams(params);
    if (demo) next.delete('impactDemo');
    else next.set('impactDemo', '1');
    setParams(next, { preventScrollReset: true });
  }
  return <div id="global-impact" className="min-h-dvh px-3 pb-24 pt-5 sm:px-6">
    <div className="mx-auto max-w-[100rem] space-y-4">
      {!preview && <div className="flex flex-wrap items-center justify-between gap-2">
        <Link className="impact-control inline-flex items-center gap-2" to={`/GlobalImpactDashboard${demo ? '?impactDemo=1' : ''}`}><ArrowLeft size={14} aria-hidden="true" /> Global Impact Dashboard</Link>
        <button type="button" className={`impact-control ${demo ? 'impact-selected' : ''}`} aria-pressed={demo} onClick={toggleDemo}>{demo ? 'Exit Demo' : 'Demo'}</button>
      </div>}
      <WorldPulsePanel key={demo ? 'demo' : 'live'} icon={Radio} demo={demo} preview={preview} standalone />
    </div>
  </div>;
}