import { base44 } from '@/api/base44Client';

export const directions = {
  explore_existing:'Pursue existing work', gather_information:'Gather more information', prepare_mission:'Prepare a new Mission',
};
export const planFields = [
  ['first_action','First action',500], ['collaboration','Collaborators and proposed roles',700],
  ['resources','Resources and funding gaps',700], ['milestone','Measurable first milestone',500],
  ['schedule','Timing and target dates',500], ['dependencies','Dependencies and open questions',500],
];
const clean = (value, max) => typeof value === 'string' ? value.trim().slice(0,max) : '';
export const planKey = owner => ['guide-action-plans',owner];
export function suggestedPlan(result) {
  const refs = result.sources.filter((_, i) => result.evidence.some(row => row.citations.includes(i + 1)));
  const selected = result.plan?.direction;
  const direction = Object.hasOwn(directions, selected) && (selected !== 'explore_existing' || refs.length) ? selected : 'gather_information';
  return { title:clean(result.objective,200), objective:result.objective, direction,
    ...Object.fromEntries(planFields.map(([key,,max]) => [key,clean(result.plan?.[key] || (key === 'first_action' ? result.steps[0] : ''),max)])),
    references:refs.map(({kind,id}) => ({kind,id})),
  };
}
export async function resolvePlanReferences(references = []) {
  if (!references.length) return [];
  const { data } = await base44.functions.invoke('saintIntelligence',{mode:'resolveReferences',references});
  if (!Array.isArray(data?.references)) throw new Error('Could not check sources');
  return data.references;
}