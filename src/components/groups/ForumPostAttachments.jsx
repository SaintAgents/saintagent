import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Paperclip } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

async function request(action, postId, index) {
  const { data } = await base44.functions.invoke('circleForumAttachments', { action, postId, index });
  return data;
}

export default function ForumPostAttachments({ postId, userId }) {
  const list = useQuery({ queryKey: ['circle-forum-files', userId, postId], queryFn: () => request('list', postId), retry: false });
  const open = useMutation({ mutationFn: async (index) => {
    const { url } = await request('open', postId, index);
    if (!url) throw new Error('Missing attachment link');
    return url;
  }});
  if (list.isPending) return <p role="status" className="mt-3 text-sm text-muted-foreground">Checking for attachments…</p>;
  if (list.isError) return <Button variant="outline" size="sm" className="mt-3" onClick={() => list.refetch()}>Retry loading attachments</Button>;
  const files = list.data?.files || [];
  if (!files.length) return null;
  return <div className="mt-4 space-y-2">
    <h4 className="flex items-center gap-2 text-sm font-semibold"><Paperclip className="h-4 w-4" /> Attachments</h4>
    {files.map(({ name, kind }, index) => {
      const active = open.variables === index;
      const url = active && open.data;
      return <div key={index} className="space-y-2 rounded-md border p-2">
        <p className="break-all text-sm">{name}</p>
        {url && kind === 'video' && <video controls aria-label={name} src={url} className="max-h-72 w-full" />}
        {url && kind === 'audio' && <audio controls aria-label={name} src={url} className="w-full" />}
        {url ? <a href={url} target="_blank" rel="noopener noreferrer" className="inline-block text-sm underline">Open file</a> : <Button size="sm" variant="outline" disabled={open.isPending} onClick={() => open.mutate(index)}>{active && open.isPending ? 'Opening…' : kind === 'document' ? 'Get file' : 'Load player'}</Button>}
        {active && open.isError && <p role="alert" className="text-sm text-destructive">Couldn’t open this file. Please try again.</p>}
      </div>;
    })}
  </div>;
}