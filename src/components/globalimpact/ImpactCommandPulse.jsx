import '@/components/globalimpact/impactCommandPulse.css';

const crest = 'M0 64 C48 64 67 24 115 24 S180 112 224 112 S286 44 335 44 S391 93 440 93 S504 20 548 20 S609 64 660 64';
const echo = 'M0 64 C49 64 68 94 115 94 S178 32 224 32 S289 85 335 85 S390 49 440 49 S502 106 548 106 S609 64 660 64';

export default function ImpactCommandPulse() {
  return <svg className="impact-command-pulse" aria-hidden="true" focusable="false" viewBox="0 0 1320 128" preserveAspectRatio="none" fill="none">
    {[0, 660].map(offset => <g key={offset} transform={`translate(${offset} 0)`}>
      <path className="impact-pulse-halo" d={crest} />
      <path className="impact-pulse-echo" d={echo} />
      <path className="impact-pulse-crest" d={crest} />
    </g>)}
  </svg>;
}