import { directions, planFields, suggestedPlan } from '@/components/guide/guidePlan';
import { commandDemoDraft, commandDemoPlan } from '@/components/globalimpact/command/commandDemo';
import CommandStageEvidence from '@/components/globalimpact/command/CommandStageEvidence';

const descriptions = [
  'The goal tells Mission Intelligence what outcome to research and plan toward.',
  'Review what the sources support and what still needs to be checked before approving a plan.',
  'Review and edit the proposed actions, then approve a private plan to save it in Planner.',
  'A separate approval copies the plan into a private Mission draft in Planner. It does not publish a Mission or assign anyone work.',
];

export default function CommandStageDetails({ index, result, plan, missionDraft, demoStage, nextAction }) {
  const demo = demoStage !== null;
  const draft = demo ? commandDemoDraft : missionDraft || plan?.mission_draft;
  const visiblePlan = demo ? commandDemoPlan : plan || (result && suggestedPlan(result));
  let data;
  if (index === 0) data = <>
    {demo && <p className="font-semibold">{result.projectTitle}</p>}
    <p>{result?.objective || 'No goal has been submitted for this run yet.'}</p>
  </>;
  if (index === 1) data = <CommandStageEvidence result={result} />;
  if (index === 2) data = visiblePlan ? <>
    <p className="font-semibold">{visiblePlan.title}</p>
    {(demo || !plan) && <p className="text-xs text-muted-foreground">{demo && demoStage >= 2 ? 'Sample plan approved, not saved' : 'Proposed plan · Not saved yet'}</p>}
    {demo && <ol className="list-decimal space-y-1 pl-4">{result.steps.map(step => <li key={step}>{step}</li>)}</ol>}
    <dl className="space-y-2">{[['Direction', directions[visiblePlan.direction]], ...planFields.map(([key, label]) => [label, visiblePlan[key]])].filter(([,value]) => value).map(([label,value]) => <div key={label}><dt className="font-semibold">{label}</dt><dd className="whitespace-pre-wrap">{value}</dd></div>)}</dl>
  </> : <p>{result ? 'No private plan saved yet. Approve the proposed plan to save it.' : 'No plan proposed yet.'}</p>;
  if (index === 3) data = nextAction ? <>
    <p className="font-semibold">{directions[plan.direction]}</p><p>{plan.first_action}</p>
  </> : draft ? <>
    <p className="text-xs text-muted-foreground">{demo ? demoStage === 3 ? 'Sample draft complete · Nothing saved or published' : 'Sample draft preview · Not approved yet' : 'Private draft · Not published'}</p>
    <p className="font-semibold">{draft.title}</p><p>{draft.objective}</p>
    {draft.description && <p className="whitespace-pre-line">{draft.description}</p>}
    {draft.milestone && <p><strong>First milestone:</strong> {draft.milestone}</p>}
  </> : <p>{plan ? plan.milestone ? 'Ready for separate draft approval.' : 'Add a measurable milestone to the plan before starting a draft.' : 'No Mission draft yet. Approve a plan with a measurable milestone first.'}</p>;
  return <><p className="text-muted-foreground">{index === 3 && nextAction ? 'This plan continues in another workspace instead of creating a Mission draft.' : descriptions[index]}</p><div className="mt-3 space-y-2 break-words border-t pt-3"><p className="text-xs font-semibold uppercase tracking-wide">{demo ? 'Demo project data' : 'Current run data'}</p>{data}</div></>;
}