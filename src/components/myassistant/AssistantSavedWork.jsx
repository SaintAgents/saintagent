import React, { useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function AssistantSavedWork({ userId, onResume, initialKind }) {
  const [kind, setKind] = useState(initialKind);
  const [text, setText] = useState('');
  const [editing, setEditing] = useState(null);
  const client = useQueryClient();
  const key = ['my-assistant-items', userId];
  const entity = base44.entities.PersonalAssistantItem;
  const items = useInfiniteQuery({ queryKey: [...key, kind], initialPageParam: undefined, queryFn: ({ pageParam }) => entity.filter({ created_by_id: userId, kind }, { sort: '-updated_date', limit: 12, cursor: pageParam }), getNextPageParam: page => page.has_more ? page.next_cursor : undefined });
  const mutation = useMutation({
    mutationFn: ({ id, patch, remove }) => remove ? entity.delete(id) : id ? entity.update(id, patch) : entity.create({ ...patch, kind }),
    onSuccess: async () => { await Promise.all([client.invalidateQueries({ queryKey: key }), client.invalidateQueries({ queryKey: ['my-assistant-counts', userId] })]); },
  });
  const clear = () => { setEditing(null); setText(''); };
  return <div className="space-y-3 p-4 text-sm">
    <div className="flex gap-2">{['memory', 'objective'].map(value => <Button size="sm" type="button" key={value} aria-pressed={kind === value} disabled={mutation.isPending} onClick={() => { setKind(value); mutation.reset(); clear(); }}>{value === 'memory' ? 'Memories' : 'Objectives'}</Button>)}</div>
    <p>{kind === 'memory' ? 'Save only what you want the assistant to remember.' : 'Keep track of work you want to return to.'}</p>
    <form className="space-y-2" onSubmit={e => { e.preventDefault(); if (text.trim()) mutation.mutate({ id: editing, patch: { text: text.trim() } }, { onSuccess: clear }); }}>
      <Textarea aria-label={kind === 'memory' ? 'Memory' : 'Objective'} value={text} maxLength={2000} onChange={e => setText(e.target.value)} />
      <Button type="submit" size="sm" disabled={!text.trim() || mutation.isPending}>{editing ? 'Save changes' : kind === 'memory' ? 'Add memory' : 'Add objective'}</Button>
      {editing && <Button type="button" size="sm" variant="ghost" onClick={clear}>Cancel</Button>}
    </form>
    {mutation.isError && <p role="alert">Could not save this change.</p>}
    {items.isLoading && <p role="status">Loading saved work…</p>}
    {items.isError && <Button size="sm" onClick={() => items.refetch()}>Retry loading saved work</Button>}
    {items.isSuccess && !items.data.pages[0]?.items.length && <p>Nothing saved here yet.</p>}
    {items.data?.pages.flatMap(page => page.items).map(item => <div key={item.id} className="space-y-2 border-t pt-2">
      <p className="whitespace-pre-wrap break-words">{item.text}</p>
      <div className="flex flex-wrap gap-2">
        {kind === 'objective' && item.status !== 'complete' && <Button size="sm" onClick={() => onResume(item.text)}>Resume</Button>}
        {kind === 'objective' && <Button size="sm" disabled={mutation.isPending} onClick={() => mutation.mutate({ id: item.id, patch: { status: item.status === 'complete' ? 'active' : 'complete' } })}>{item.status === 'complete' ? 'Reopen' : 'Mark complete'}</Button>}
        <Button size="sm" disabled={mutation.isPending} onClick={() => { setEditing(item.id); setText(item.text); }}>Edit</Button>
        <Button size="sm" disabled={mutation.isPending} onClick={() => { if (window.confirm(`Remove this ${kind}?`)) mutation.mutate({ id: item.id, remove: true }, { onSuccess: () => { if (editing === item.id) clear(); } }); }}>Remove</Button>
      </div>
    </div>)}
    {items.hasNextPage && <Button size="sm" disabled={items.isFetchingNextPage} onClick={() => items.fetchNextPage()}>Load more</Button>}
  </div>;
}