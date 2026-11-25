import { useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import GuideActionReview from '@/components/guide/GuideActionReview';
import { cleanAction, draftGuideActions } from '@/components/guide/guideActionDraft';

export default function GuideOrchestrator({ owner }) {
  const [notes,setNotes] = useState(''), [draft,setDraft] = useState(null), [status,setStatus] = useState('');
  const client = useQueryClient(), queryKey = ['guide-action-drafts', owner];
  const drafts = useInfiniteQuery({queryKey,enabled:!!owner,initialPageParam:undefined,queryFn:({pageParam}) => base44.entities.GuideActionDraft.filter({created_by_id:owner},{sort:'-updated_date',limit:12,cursor:pageParam}),getNextPageParam:page => page.has_more ? page.next_cursor : undefined});
  const generate = useMutation({mutationFn:draftGuideActions,onSuccess:setDraft});
  const save = useMutation({mutationFn:async () => {
    const data = {title:draft.title.trim(),actions:draft.actions.map(a => ({...cleanAction(a),commitment:a.commitment}))};
    return draft.id ? base44.entities.GuideActionDraft.update(draft.id,data) : base44.entities.GuideActionDraft.create(data);
  },onSuccess:record => {setDraft(record); setStatus('Private draft saved.'); client.invalidateQueries({queryKey});}});
  const busy = generate.isPending || save.isPending;
  return <div className="space-y-5">
    <p className="text-sm text-muted-foreground">Review tasks, owners, deadlines and dependencies before saving. AI uses your notes to generate suggestions. Nothing is sent, assigned or scheduled. Saved drafts are visible to you and app admins.</p>
    <form className="space-y-2" onSubmit={e => {e.preventDefault(); if (!busy && notes.trim().length >= 20) {save.reset(); setStatus(''); generate.mutate(notes.trim());}}}>
      <label className="block space-y-1 text-sm font-medium">Goal or meeting notes<Textarea rows={4} maxLength={5000} value={notes} onChange={e => setNotes(e.target.value)} disabled={busy} placeholder="Add next steps, decisions, dates, and who agreed to what. Leave out sensitive information." /></label>
      <Button type="submit" disabled={busy || notes.trim().length < 20}>{generate.isPending ? 'Drafting actions…' : draft ? 'Generate a new draft' : 'Draft actions'}</Button>
      {generate.isPending && <p role="status" className="text-sm">Identifying next steps and checking commitments against your notes…</p>}
      {generate.isError && <p role="alert" className="text-sm">Could not generate actions. Your notes and any existing draft are still here. Try again.</p>}
    </form>
    {draft && <GuideActionReview draft={draft} setDraft={next => {setDraft(next); setStatus(''); save.reset();}} busy={busy} save={() => save.mutate()} />}
    {status && <p role="status" className="text-sm">{status}</p>}
    {save.isError && <p role="alert" className="text-sm">Could not save your draft. Your edits are still here; try saving again.</p>}
    <section className="space-y-2 border-t pt-3" aria-label="Private action drafts">
      <h4 className="font-semibold">Private action drafts</h4>
      {drafts.isPending ? <p role="status" className="text-sm">Loading drafts…</p> : drafts.isError && !drafts.data ? <p role="alert" className="text-sm">Could not load drafts. <button type="button" className="underline" onClick={() => drafts.refetch()}>Retry</button></p> : <>
        {!drafts.data?.pages[0]?.items.length && <p className="text-sm text-muted-foreground">Your saved drafts will appear here.</p>}
        {drafts.data?.pages.flatMap(page => page.items).map(record => <button className="block break-words text-left text-sm underline" key={record.id} type="button" disabled={busy} onClick={() => {generate.reset(); save.reset(); setStatus(`Opened ${record.title}.`); setDraft(record);}}>{record.title}</button>)}
        {drafts.hasNextPage && <Button type="button" size="sm" variant="outline" disabled={drafts.isFetching} onClick={() => drafts.fetchNextPage()}>{drafts.isFetchingNextPage ? 'Loading…' : drafts.isFetchNextPageError ? 'Retry loading more' : 'Load more'}</Button>}
      </>}
    </section>
  </div>;
}