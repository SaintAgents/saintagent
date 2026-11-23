import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { referenceKey } from '@/components/watch/workspaceReferences';

export default function DeepDivePlan({ report, owner }) {
  const [open,setOpen] = useState(false);
  const [note,setNote] = useState(() => report.next_steps.map((step,i) => `${i+1}. ${step}`).join('\n').slice(0,1000));
  const client = useQueryClient();
  const save = useMutation({mutationFn: () => base44.entities.WorkspaceReference.create({kind:'plan',status:'draft',title:report.objective.slice(0,200),note:note.trim(), references:[{item_type:'research',record_id:report.id,title:report.objective.slice(0,200), route:`/Intelligence?study=${encodeURIComponent(report.id)}`, source:'Deep Dive'}]}), onSuccess: () => client.invalidateQueries({queryKey:referenceKey(owner,'plan')})});
  if (save.isSuccess) return <Link className="underline" to={`/Planner#reference-${encodeURIComponent(save.data.id)}`}>Open saved Planner draft</Link>;
  if (!open) return <Button type="button" variant="outline" onClick={() => setOpen(true)}>Prepare a Planner draft</Button>;
  return <form className="space-y-2 border-t pt-3" onSubmit={e => {e.preventDefault(); if (note.trim() && !save.isPending) save.mutate();}}>
    <label className="block space-y-2 font-medium">Review the suggested next steps<Textarea rows={4} value={note} maxLength={1000} onChange={e => setNote(e.target.value)} disabled={save.isPending} /></label>
    <p className="text-muted-foreground">Only a personal draft will be saved. No project, mission, or invitation will be created.</p>
    <Button type="submit" disabled={save.isPending || !note.trim()}>{save.isPending ? 'Saving…' : 'Approve and save draft'}</Button>
    {save.isError && <p role="alert">Could not save the draft. Try again.</p>}
  </form>;
}