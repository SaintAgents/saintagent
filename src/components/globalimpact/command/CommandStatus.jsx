import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

const steps = ['Goal', 'Evidence review', 'Private plan', 'Mission draft'];
export default function CommandStatus({ result, plan, missionDraft, demoStage }) {
  const demo = demoStage !== null;
  const stage = demoStage ?? (missionDraft ? 3 : plan ? 2 : result ? 1 : 0);
  const demoStatus = { 1: 'Explore the citation map, then review the sample plan.', 2: 'Sample plan approved. Now try creating a sample Mission draft.', 3: 'Demo complete. No plan or Mission draft was saved.' };
  return <section className="mc-panel mc-pipeline" aria-labelledby="mc-pipeline-title">
    <div className="mc-panel-title"><h2 id="mc-pipeline-title">Cross-System Orchestration</h2><span>{demo ? 'Demo run' : 'Current run'}</span></div>
    <div className="mc-body space-y-3">
      <ol className="mc-pipeline-steps" aria-label="Mission draft stages">{steps.map((label,i) => <li key={label} data-stage={i < stage ? 'done' : i === stage ? 'current' : 'waiting'} aria-current={i === stage ? 'step' : undefined}><span>{i < stage ? <Check size={13} aria-label="Done" /> : i+1}</span>{label}</li>)}</ol>
      <p className="text-sm mc-muted" role="status">{demo ? demoStatus[stage] : missionDraft ? 'Private Mission draft created. Nothing was published.' : plan ? 'Private action plan saved. A Mission draft requires separate approval.' : result ? 'Review the evidence and proposed actions before saving.' : 'Start with an outcome; nothing is saved or assigned by this pipeline until you approve it.'}</p>
      {!demo && plan && <Link className="text-sm" to={`/Planner?guidePlan=${encodeURIComponent(plan.id)}#guide-action-plans`}>Open saved plan in Planner</Link>}
    </div>
  </section>;
}