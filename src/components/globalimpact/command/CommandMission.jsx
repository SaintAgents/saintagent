import GuideEngine from '@/components/guide/GuideEngine';
import GuideResult from '@/components/guide/GuideResult';
import CommandDemoReview from '@/components/globalimpact/command/CommandDemoReview';

export default function CommandMission({ result, revision, owner, onResult, onSave, demoStage, onDemoStageChange }) {
  const demo = demoStage !== null;
  return <section className="mc-panel mc-mission" aria-labelledby="mc-mission-title">
    <div className="mc-panel-title"><h2 id="mc-mission-title">Mission Intelligence</h2><span>Goal &amp; plan</span></div>
    <div className="mc-body space-y-4">
      <div hidden={demo}><GuideEngine onResult={onResult} /></div>
      {demo && <div><h3 className="mc-kicker">Sample goal</h3><p className="mt-1 text-sm">{result.objective}</p></div>}
      <div className="space-y-2 border-t pt-3" aria-live="polite">
        <h3 className="mc-kicker">Proposed action plan</h3>
        {result ? <><p className="text-sm font-semibold">{result.recommendation}</p>{result.steps.length > 0 && <ol className="mc-steps space-y-1.5">{result.steps.map((step, i) => <li key={i}><span>{i + 1}</span>{step}</li>)}</ol>}<p className="text-xs mc-muted">{result.evidence.length ? 'Includes cited findings · Proposed actions require review' : 'Starting hypothesis · No cited findings returned'}</p></> : <p className="text-sm mc-muted">Describe an outcome and build a plan to see proposed next steps here.</p>}
      </div>
      {demo && <CommandDemoReview stage={demoStage} onStageChange={onDemoStageChange} />}
      {!demo && result && owner && <details key={revision} id="command-plan-review" className="mc-review scroll-mt-32"><summary>Review &amp; Create Draft</summary><div className="pt-3"><GuideResult result={result} userId={owner} onSave={onSave} deferMissionHandoff /></div></details>}
    </div>
  </section>;
}