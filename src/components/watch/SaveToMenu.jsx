import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BookmarkPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { referenceKey, saveReference, useWorkspaceReferences } from '@/components/watch/workspaceReferences';
import { watchKey } from '@/components/watch/watchItems';

const labels = {saved:'Saved Items', research:'My Research', watch:'Watchlist', plan:'Planner'};
const paths = {saved:'/SavedItems', research:'/SavedItems?tab=research', watch:'/Watchlist', plan:'/Planner#linked-drafts'};
export default function SaveToMenu({ owner, item }) {
  const [open,setOpen] = useState(false), [kind,setKind] = useState('saved'), [note,setNote] = useState(''), [title,setTitle] = useState(''), [researchId,setResearchId] = useState('');
  const client = useQueryClient();
  const research = useWorkspaceReferences(owner,'research',open && kind === 'research');
  const mutation = useMutation({ mutationFn: () => saveReference(owner,item,{kind,title,note,researchId}), onSuccess: async () => {
    await client.invalidateQueries({queryKey:kind === 'watch' ? watchKey(owner) : referenceKey(owner,kind)});
    toast.success(`Saved to ${labels[kind]}`); setOpen(false);
  }});
  const changeKind = value => { setKind(value); setResearchId(''); setTitle(''); setNote(''); mutation.reset(); };
  return <><Button type="button" variant="outline" size="sm" onClick={() => {changeKind('saved');setOpen(true);}}><BookmarkPlus />Save To…</Button>
    <Dialog open={open} onOpenChange={value => { if (!mutation.isPending) setOpen(value); }}><DialogContent data-readable-surface className="max-h-[85dvh] overflow-y-auto">
      <DialogHeader><DialogTitle>Save To…</DialogTitle><DialogDescription>Keep a reference to {item.display_name} without copying the original.</DialogDescription></DialogHeader>
      <form className="grid gap-3" onSubmit={e => {e.preventDefault();if (!mutation.isPending) mutation.mutate();}}>
        <label className="grid gap-1 text-sm">Destination<select className="rounded border bg-background p-2" value={kind} disabled={mutation.isPending} onChange={e => changeKind(e.target.value)}>{Object.entries(labels).map(([key,label]) => <option key={key} value={key}>{label}</option>)}</select></label>
        {kind === 'research' && <><label className="grid gap-1 text-sm">Research card<select className="rounded border bg-background p-2" value={researchId} disabled={mutation.isPending} onChange={e => setResearchId(e.target.value)}><option value="">Create a new card</option>{research.data?.pages.flatMap(page => page.items).map(card => <option key={card.id} value={card.id}>{card.title}</option>)}</select></label>
          {research.isPending ? <p role="status">Loading research cards…</p> : research.isError && <button type="button" className="underline" onClick={() => research.refetch()}>Retry loading cards</button>}
          {research.hasNextPage && <Button type="button" variant="outline" disabled={research.isFetching} onClick={() => research.fetchNextPage()}>Load more research cards</Button>}</>}
        {(kind === 'plan' || kind === 'research' && !researchId) && <label className="grid gap-1 text-sm">Title<Input value={title} maxLength={200} placeholder={item.display_name} onChange={e => setTitle(e.target.value)} disabled={mutation.isPending} /></label>}
        {(kind === 'saved' || kind === 'plan' || kind === 'research' && !researchId) && <label className="grid gap-1 text-sm">Optional note<Textarea value={note} maxLength={1000} onChange={e => setNote(e.target.value)} disabled={mutation.isPending} /></label>}
        {mutation.isError && <p role="alert">Could not save to {labels[kind]}. Check that the destination is available and try again.</p>}
        <div className="flex items-center justify-between gap-2"><Link className="text-sm underline" to={paths[kind]} onClick={() => setOpen(false)}>Open {labels[kind]}</Link><Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Saving…' : 'Save'}</Button></div>
      </form>
    </DialogContent></Dialog></>;
}