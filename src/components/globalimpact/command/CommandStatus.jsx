import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import GuideMissionHandoff from '@/components/guide/GuideMissionHandoff';

const steps = ['Goal', 'Evidence review', 'Private plan', 'Mission draft'];
function openReview() {
  const review = document.getElementById('command-plan-review');
  if (!review) return;
  review.open = true;
  review.querySelector('summary')?.focus({ preventScroll:true });
  review.scrollIntoView({ block:'start' });
}
export default function CommandStatus({ result, plan, missionDraft, owner, onMissionDraft, demoStage, onDemoStageChange }) {
  const demo = demoStage !== null;
  const complete = demo ? demoStage === 3 : !!(missionDraft || plan?.mission_draft);
  const stage = demoStage ?? (complete ? 3 : plan ? 2 : result ? 1 : 0);
  const nextAction = !demo && plan && plan.direction !== 'prepare_mission' && !complete;
  const labels = nextAction ? [...steps.slice(0,3), 'Next action'] : steps;
  const currentStep = plan && !demo || demo && stage === 2 ? 3 : stage;
  const demoStatus = { 1: 'Review the sample evidence and approve the sample plan.', 2: 'Sample plan approved. Try the Mission draft handoff.', 3: 'Demo complete. No plan or Mission draft was saved.' };
  return <section className="mc-panel mc-pipeline" aria-labelledby="mc-pipeline-title">
    <div className="mc-panel-title"><h2 id="mc-pipeline-title" tabIndex={-1} className="scroll-mt-32">Cross-System Orchestration</h2><span>{demo ? 'Demo run' : 'Current run'}</span></div>
    <div className="mc-body space-y-3">
      <ol className="mc-pipeline-steps" aria-label="Mission draft stages">{labels.map((label,i) => {
        const done = complete || i < currentStep;
        const current = !done && i === currentStep;
        return <li key={label} data-stage={done ? 'done' : current ? 'current' : 'waiting'} aria-current={current ? 'step' : undefined}><span>{done ? <Check size={13} aria-label="Done" /> : i+1}</span>{label}</li>;
      })}</ol>
      <p className="text-sm mc-muted" role="status">{demo ? demoStatus[stage] : complete ? 'Private Mission draft saved in Planner. Nothing was published.' : nextAction ? 'Private plan saved. Continue in the workspace that matches the approved direction.' : plan ? 'Private plan saved. Review the Mission details before approving a draft.' : result ? 'Review the evidence and proposed actions before saving a private plan.' : 'Choose a goal to start a Mission Intelligence run.'}</p>
      {stage === 0 && <button className="mc-small-button" type="button" onClick={() => document.getElementById('guide-objective')?.focus()}>Enter mission goal</button>}
      {stage === 1 && <button className="mc-small-button" type="button" onClick={openReview}>Review {demo ? 'sample plan' : 'evidence and plan'}</button>}
      {demo && stage === 2 && <button className="mc-small-button" type="button" onClick={() => onDemoStageChange(3)}>Create sample Mission draft</button>}
      {!demo && plan && <>
        {!nextAction && <GuideMissionHandoff key={plan.id} plan={plan} owner={owner} onMissionDraft={onMissionDraft} />}
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {nextAction && (plan.direction === 'explore_existing' ? <Link to="/GlobalImpactDashboard?workspace=radar">Explore in Collaboration Radar</Link> : <Link to={`/Intelligence?objective=${encodeURIComponent(plan.objective)}`}>Investigate in Saint Intelligence</Link>)}
          <Link to={`/Planner?guidePlan=${encodeURIComponent(plan.id)}#guide-action-plans`}>{complete ? 'Open Mission draft in Planner' : 'Open saved plan in Planner'}</Link>
        </div>
      </>}
    </div>
  </section>;
}