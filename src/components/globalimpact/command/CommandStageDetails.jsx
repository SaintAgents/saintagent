import { directions, planFields, suggestedPlan } from '@/components/guide/guidePlan';
import { commandDemoPlan } from '@/components/globalimpact/command/commandDemo';

const descriptions = [
  'The goal tells Mission Intelligence what outcome to research and plan toward.',
  'Review what the sources support and what still needs to be checked before approving a plan.',
  'Review and edit the proposed actions, then approve a private plan to save it in Planner.',
  'A separate approval copies the plan into a private Mission draft in Planner. It does not publish a Mission or assign anyone work.',
];

export default function CommandStageDetails({ index, result, plan, missionDraft, demoStage, nextAction }) {
  const demo = demoStage !== null;
  const draft = demo ? null : missionDraft || plan?.mission_draft;
  const visiblePlan = demo ? commandDemoPlan : plan || (result && suggestedPlan(result));
  const evidence = result?.evidence || [];
  const gaps = result?.questions || [];
  let data;
  if (index === 0) data = <p>{result?.objective || 'No goal has been submitted for this run yet.'}</p>;
  if (index === 1) data = !result ? <p>Build an action plan first to see the evidence.</p> : <>
    <p className="font-semibold">{evidence.length} cited {evidence.length === 1 ? 'finding' : 'findings'} · {gaps.length} open {gaps.length === 1 ? 'question' : 'questions'}</p>
    {!evidence.length && <p>No cited findings were returned. Treat the recommendation as a starting hypothesis.</p>}
    {!!evidence.length && <ul className="list-disc space-y-2 pl-4">{evidence.map(({finding, citations}, i) => <li key={i}>{finding}<small className="block text-muted-foreground">{citations.map(n => result.sources[n - 1]?.title).filter(Boolean).join(' · ')}</small></li>)}</ul>}
    {!!gaps.length && <ul className="list-disc space-y-1 pl-4">{gaps.map((gap, i) => <li key={i}>{gap}</li>)}</ul>}
  </>;
  if (index === 2) data = visiblePlan ? <>
    <p className="font-semibold">{demo ? demoStage >= 2 ? 'Sample plan approved, not saved' : 'Sample plan not yet approved' : plan ? visiblePlan.title : 'Proposed plan · Not saved yet'}</p>
    <dl className="space-y-2">{[['Direction', directions[visiblePlan.direction]], ...planFields.map(([key, label]) => [label, visiblePlan[key]])].filter(([,value]) => value).map(([label,value]) => <div key={label}><dt className="font-semibold">{label}</dt><dd className="whitespace-pre-wrap">{value}</dd></div>)}</dl>
  </> : <p>{result ? 'No private plan saved yet. Approve the proposed plan to save it.' : 'No plan proposed yet.'}</p>;
  if (index === 3) data = nextAction ? <>
    <p className="font-semibold">{directions[plan.direction]}</p><p>{plan.first_action}</p>
  </> : draft ? <>
    <p className="font-semibold">{draft.title}</p><p>{draft.objective}</p><p>First milestone: {draft.milestone}</p>
  </> : demo && demoStage === 3 ? <p>Sample draft complete. First milestone: {commandDemoPlan.milestone}. Nothing was saved or published.</p>
    : <p>{demo ? demoStage === 2 ? 'Ready to try the sample draft handoff.' : 'Approve the sample plan first.' : plan ? plan.milestone ? 'Ready for separate draft approval.' : 'Add a measurable milestone to the plan before starting a draft.' : 'No Mission draft yet. Approve a plan with a measurable milestone first.'}</p>;
  return <><p className="text-muted-foreground">{index === 3 && nextAction ? 'This plan continues in another workspace instead of creating a Mission draft.' : descriptions[index]}</p><div className="mt-3 space-y-2 break-words border-t pt-3">{data}</div></>;
}