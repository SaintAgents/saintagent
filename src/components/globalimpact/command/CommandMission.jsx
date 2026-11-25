import GuideEngine from '@/components/guide/GuideEngine';
import GuideResult from '@/components/guide/GuideResult';

export default function CommandMission({ result, revision, owner, onResult, onSave, onMissionDraft }) {
  return <section className="mc-panel mc-mission" aria-labelledby="mc-mission-title">
    <div className="mc-panel-title"><h2 id="mc-mission-title">Mission Intelligence</h2><span>Goal &amp; plan</span></div>
    <div className="mc-body space-y-4">
      <GuideEngine onResult={onResult} />
      <div className="space-y-2 border-t pt-3" aria-live="polite">
        <h3 className="mc-kicker">Proposed action plan</h3>
        {result ? <><p className="text-sm font-semibold">{result.recommendation}</p>{result.steps.length > 0 && <ol className="mc-steps space-y-1.5">{result.steps.map((step, i) => <li key={i}><span>{i + 1}</span>{step}</li>)}</ol>}<p className="text-xs mc-muted">{result.evidence.length ? 'Includes cited findings · Proposed actions require review' : 'Starting hypothesis · No cited findings returned'}</p></> : <p className="text-sm mc-muted">Describe an outcome and build a plan to see proposed next steps here.</p>}
      </div>
      {result && owner && <details key={revision} className="mc-review"><summary>Review &amp; Create Draft</summary><div className="pt-3"><GuideResult result={result} userId={owner} onSave={onSave} onMissionDraft={onMissionDraft} /></div></details>}
    </div>
  </section>;
}