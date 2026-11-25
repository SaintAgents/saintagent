import { useState } from 'react';
import { useActivity } from '@/components/live/useActivity';
import { categoryInfo, formatTime } from '@/components/live/activity';
import LiveActivityDialog from '@/components/live/LiveActivityDialog';
import { demoPulse } from '@/components/globalimpact/impactDemo';

export default function CommandSignals({ demo, result }) {
  const activity = useActivity();
  const [sample, setSample] = useState(null);
  const events = (demo ? demoPulse : activity?.history || []).slice(0, 6);
  const count = result?.sources.length || 0;
  const cited = new Set(result?.evidence.flatMap(row => row.citations) || []).size;
  const rate = count ? Math.round(cited / count * 100) : 0;
  return <div className="mc-signals space-y-3">
    <section className="mc-panel" aria-labelledby="mc-signal-title"><div className="mc-panel-title"><h2 id="mc-signal-title">Proactive Intelligence &amp; Signals</h2><span>{demo ? 'Demo feed' : 'World Pulse'}</span></div>
      <div className="mc-body space-y-2">
        {result?.questions.length > 0 && <div className="mc-gaps"><h3 className="mc-kicker">Needs validation</h3><ul className="mt-1 list-disc space-y-1 pl-4 text-xs">{result.questions.map((q,i) => <li key={i}>{q}</li>)}</ul></div>}
        <div className="mc-feed space-y-1.5">
          {!demo && activity?.events?.isPending ? <p role="status">Loading signals…</p> : !demo && activity?.events?.isError ? <p role="alert">Signals are unavailable. <button type="button" className="underline" onClick={() => activity.events.refetch()}>Retry</button></p> : !events.length ? <p>No activity signals yet.</p> : events.map(event => {const [label, Icon] = categoryInfo(event); return <button className="mc-event" key={event.id} type="button" onClick={() => demo ? setSample(event) : activity.setDialog(event)}><span className="flex items-center gap-1.5 mc-gold"><Icon size={13} />{event.is_demo ? `Demo · ${label}` : label}</span><strong className="block">{event.headline}</strong><span className="mc-muted">{formatTime(event.created_date)}</span></button>;})}
        </div>
      </div>
    </section>
    <section className="mc-panel" aria-labelledby="mc-metrics-title"><div className="mc-panel-title"><h2 id="mc-metrics-title">Collective Intelligence</h2><span>Evidence metrics</span></div><div className="mc-body space-y-2">
      {result ? <><dl className="mc-metrics"><div><dt>Retrieved</dt><dd>{count}</dd></div><div><dt>Cited</dt><dd>{cited}</dd></div><div><dt>Findings</dt><dd>{result.evidence.length}</dd></div></dl><label className="block text-xs">Sources cited · {count ? `${rate}%` : 'N/A'}<progress className="block w-full" value={rate} max={100} aria-label="Share of retrieved sources cited" /></label><p className="mc-muted text-xs">Citation coverage is not a confidence score.</p></> : <p className="mc-muted text-sm">Evidence metrics appear after a mission plan run.</p>}
    </div></section>
    {sample && <LiveActivityDialog dialog={sample} sampleImage={sample.image_url} close={() => setSample(null)} />}
  </div>;
}