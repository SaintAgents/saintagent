import { useId, useState } from 'react';
import { calculateImpactIndex, impactPillars, impactPresets } from '@/components/globalimpact/pulse/impactIndex';

export default function ImpactIndexCalculator() {
  const id = useId();
  const [preset, setPreset] = useState(impactPresets[0]);
  const [scores, setScores] = useState(preset.scores);
  const [confidence, setConfidence] = useState(preset.confidence);
  const { score, tier } = calculateImpactIndex(scores);
  function load(sample) {
    setPreset(sample);
    setScores(sample.scores);
    setConfidence(sample.confidence);
  }
  return <section aria-labelledby={`${id}-title`} className="impact-surface mt-4 space-y-4 p-3 sm:p-4">
    <header className="space-y-1">
      <div className="flex flex-wrap items-center gap-2"><h2 id={`${id}-title`} className="text-xl font-bold">Global Impact Index</h2><span className="impact-chip">Prototype · Fictional data</span></div>
      <p className="impact-muted text-sm">Adjust the seven pillars to explore a weighted impact score. Results are illustrative, not verified rankings, and aren’t saved.</p>
    </header>
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Fictional assessment presets">
      {impactPresets.map(sample => <button key={sample.id} type="button" aria-pressed={preset.id === sample.id} className={`impact-control ${preset.id === sample.id ? 'impact-selected' : ''}`} onClick={() => load(sample)}>{sample.name}</button>)}
      <button type="button" className="impact-control" onClick={() => load(preset)}>Reset assessment</button>
    </div>
    <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <fieldset className="grid min-w-0 gap-x-5 gap-y-3 sm:grid-cols-2">
        <legend className="impact-kicker mb-3">Seven-pillar impact signature</legend>
        {impactPillars.map(([label, weight], index) => <label key={label} className="block min-w-0 text-sm">
          <span className="flex items-baseline justify-between gap-2"><span>{label} <span className="impact-muted text-xs">({weight}% weight)</span></span><span aria-hidden="true" className="shrink-0 font-semibold tabular-nums">{scores[index]}</span></span>
          <input type="range" min="0" max="100" step="1" value={scores[index]} aria-label={`${label} (${weight}% weight)`} className="block h-7 w-full accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring" onChange={e => { const value = Number(e.target.value); setScores(previous => previous.map((current, i) => i === index ? value : current)); }} />
        </label>)}
      </fieldset>
      <div className="impact-detail space-y-3 p-3">
        <p className="impact-kicker">Illustrative weighted score</p>
        <output className="block" aria-live="polite"><strong className="block text-3xl tabular-nums">{score === null ? '—' : `${score.toFixed(2)} / 100`}</strong><span className="impact-chip">{tier}</span></output>
        <label className="block border-t pt-3 text-sm"><span>Evidence confidence</span> <span aria-hidden="true" className="font-semibold tabular-nums">{confidence}%</span><input type="range" min="0" max="100" step="1" value={confidence} aria-label="Evidence confidence" aria-valuetext={`${confidence}%`} aria-describedby={`${id}-confidence`} className="block h-7 w-full accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring" onChange={e => setConfidence(Number(e.target.value))} /></label>
        <p id={`${id}-confidence`} className="impact-muted text-xs">Confidence is illustrative and displayed separately. Changing it doesn’t change the score or tier.</p>
      </div>
    </div>
  </section>;
}