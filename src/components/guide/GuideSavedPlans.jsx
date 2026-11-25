import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import GuidePlanEditor from '@/components/guide/GuidePlanEditor';
import { planKey, resolvePlanReferences } from '@/components/guide/guidePlan';

export default function GuideSavedPlans({ owner, selected, select }) {
  const client = useQueryClient();
  const list = useInfiniteQuery({ queryKey:[...planKey(owner),'list'], initialPageParam:undefined, enabled:!selected,
    queryFn:({pageParam}) => base44.entities.GuideActionPlan.filter({created_by_id:owner},{limit:15,sort:'-updated_date',cursor:pageParam}),
    getNextPageParam:page => page.has_more ? page.next_cursor : undefined });
  const detail = useQuery({ queryKey:[...planKey(owner),'detail',selected], enabled:!!selected, staleTime:0, gcTime:0, refetchOnMount:'always', refetchOnWindowFocus:false,
    queryFn:async () => {
      const {items:[plan]} = await base44.entities.GuideActionPlan.filter({id:selected,created_by_id:owner},{limit:1});
      if (!plan) return null;
      const references = await resolvePlanReferences(plan.references);
      return {plan,references};
    } });
  const remove = useMutation({ mutationFn:id => base44.entities.GuideActionPlan.delete(id), onSuccess:async () => { select(null); await client.invalidateQueries({queryKey:planKey(owner)}); } });
  const rows = list.data?.pages.flatMap(page => page.items) || [];
  const {plan,references} = detail.data || {};
  return <section id="guide-action-plans" data-readable-surface className="mt-6 scroll-mt-32 space-y-3 rounded-xl border p-4">
    <h2 className="text-xl font-semibold">Private Guide plans</h2>
    {selected ? <>
      <Button type="button" variant="outline" onClick={() => select(null)}>All private plans</Button>
      {!detail.data && detail.isFetching ? <p role="status">Checking plan and source access…</p> : detail.isError ? <p role="alert">Could not open the plan. <button type="button" className="underline" onClick={() => detail.refetch()}>Retry</button></p> : !plan ? <p>This plan isn’t available.</p> : <>
        {references.length !== plan.references.length && <p role="status" className="text-sm">Some sources are no longer accessible and won’t appear in the plan.</p>}
        <GuidePlanEditor key={selected} initial={{...plan,references:references.map(({kind,id}) => ({kind,id}))}} owner={owner} links={references} />
        <Button type="button" variant="outline" disabled={remove.isPending} onClick={() => { if (window.confirm('Delete this private plan?')) remove.mutate(plan.id); }}>Delete plan</Button>
        {remove.isError && <p role="alert">Could not delete the plan.</p>}
      </>}
    </> : list.isPending ? <p role="status">Loading plans…</p> : list.isError && !rows.length ? <p role="alert">Could not load plans. <button type="button" className="underline" onClick={() => list.refetch()}>Retry</button></p> : !rows.length ? <p className="text-sm">Action plans approved in My Guide appear here.</p> : <>
      <ul className="space-y-2">{rows.map(row => <li key={row.id}><Button type="button" variant="outline" className="h-auto max-w-full whitespace-normal text-left" onClick={() => select(row.id)}>{row.title}</Button></li>)}</ul>
      {list.hasNextPage && <Button variant="outline" disabled={list.isFetching} onClick={() => list.fetchNextPage()}>{list.isFetching ? 'Loading…' : 'Load more'}</Button>}
    </>}
  </section>;
}