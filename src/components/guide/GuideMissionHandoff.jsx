import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import CreateMissionModal from '@/components/CreateMissionModal';
import { planKey } from '@/components/guide/guidePlan';

export default function GuideMissionHandoff({ plan, owner, dirty, onMissionDraft }) {
  const client = useQueryClient();
  const [review,setReview] = useState(false), [open,setOpen] = useState(false);
  const approval = useMutation({ mutationFn:async () => (await base44.functions.invoke('approveGuideMissionDraft',{id:plan.id, revision:plan.updated_date, approve:true})).data.draft,
    onSuccess: draft => { setReview(false); client.invalidateQueries({queryKey:planKey(owner)}); onMissionDraft?.(draft); } });
  const draft = approval.data || plan.mission_draft;
  const [prefill,setPrefill] = useState(null);
  if (!draft && plan.direction !== 'prepare_mission') return null;
  return <section className="space-y-2 border-t pt-3" aria-label="Start Mission handoff">
    {draft ? <><p className="text-sm">Private Mission draft saved in Planner. Opening the Mission form does not publish it.</p><Button type="button" variant="outline" onClick={() => { setPrefill({title:draft.title,objective:draft.objective,description:draft.description,mission_type:'personal',milestones:[{id:crypto.randomUUID(),title:'First milestone',description:draft.milestone,order:1,completed:false,tasks:[]}]}); setOpen(true); }}>Open prefilled Mission form</Button></> : <>
      <Button type="button" disabled={dirty || !plan.milestone?.trim()} onClick={() => { approval.reset(); setReview(true); }}>Start Mission</Button>
      {(dirty || !plan.milestone?.trim()) && <p className="text-sm">Save your plan with a measurable milestone before starting a Mission draft.</p>}
    </>}
    <Dialog open={review} onOpenChange={value => { if (!approval.isPending) setReview(value); }}>
      <DialogContent data-readable-surface hideCloseButton={approval.isPending} className="max-h-[85dvh] overflow-y-auto">
        <DialogTitle>Approve a private Mission draft</DialogTitle><DialogDescription>Only the details below will be copied. This creates a private draft in Planner, not a published Mission. No one will be contacted, assigned work, or charged.</DialogDescription>
        <dl className="space-y-1 text-sm">{[['Title',plan.title],['Objective',plan.objective],['First action',plan.first_action],['First milestone',plan.milestone],['Timing',plan.schedule],['Dependencies',plan.dependencies],['Resources',plan.resources],['Proposed roles',plan.collaboration]].filter(([,value]) => value).map(([name,value]) => <div key={name}><dt className="font-semibold">{name}</dt><dd className="whitespace-pre-wrap break-words">{value}</dd></div>)}</dl>
        {approval.isError && <p role="alert" className="text-sm">{approval.error?.response?.data?.error || 'Draft approval couldn’t be confirmed. You can safely retry.'}</p>}
        <div className="flex flex-wrap gap-2"><Button type="button" variant="outline" disabled={approval.isPending} onClick={() => setReview(false)}>Cancel</Button><Button type="button" disabled={approval.isPending} onClick={() => approval.mutate()}>{approval.isPending ? 'Saving…' : 'Approve and save Mission draft'}</Button></div>
      </DialogContent>
    </Dialog>
    {open && <CreateMissionModal open onClose={() => setOpen(false)} prefillData={prefill} />}
  </section>;
}