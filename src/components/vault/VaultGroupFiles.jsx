import React, { useRef, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Download, Upload } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { safeFileUrl } from '@/components/vault/vault';

export default function VaultGroupFiles({ group, user }) {
  const [busy, setBusy] = useState(''), [error, setError] = useState(''), [link, setLink] = useState(null);
  const picker = useRef(null);
  const request = async (action, input) => (await base44.functions.invoke('vaultGroupFiles', { groupId: group.id, action, ...input })).data;
  const files = useInfiniteQuery({ queryKey: ['vault-group-files', user.id, group.id], initialPageParam: undefined,
    queryFn: ({ pageParam }) => request('list', { cursor: pageParam }), getNextPageParam: page => page.next_cursor || undefined });
  const items = files.data?.pages.flatMap(page => page.items) || [];
  async function upload(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || busy) return;
    if (!file.size || file.size > 10 * 1024 * 1024) return setError('Choose a non-empty file up to 10 MB.');
    setBusy('upload'); setError('');
    try { await request('upload', { file }); await files.refetch(); }
    catch { setError('Could not upload the file. Please try again.'); }
    finally { setBusy(''); }
  }
  async function open(doc) {
    const tab = window.open('about:blank', '_blank');
    if (tab) tab.opener = null;
    setBusy(doc.id); setError(''); setLink(null);
    try {
      const url = safeFileUrl((await request('open', { documentId: doc.id })).url);
      if (!url) throw new Error('Missing download URL');
      if (tab && !tab.closed) tab.location.replace(url); else setLink({ url, name: doc.name });
    } catch { tab?.close(); setError('Could not open the file. Please try again.'); }
    finally { setBusy(''); }
  }
  return <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="break-all text-lg font-semibold">{group.name}</h2>
      <input ref={picker} hidden type="file" onChange={upload} />
      <Button disabled={Boolean(busy)} onClick={() => picker.current?.click()}><Upload />{busy === 'upload' ? 'Uploading…' : 'Upload to group'}</Button>
    </div>
    <p className="text-sm text-muted-foreground">Private files for this group. Maximum 10 MB per file.</p>
    {error && <p role="alert">{error}</p>}{link && <a href={link.url} target="_blank" rel="noreferrer">Open {link.name}</a>}
    {files.isPending ? <p role="status">Loading group documents…</p> : files.isError && !items.length ? <Button onClick={() => files.refetch()}>Retry loading documents</Button> : !items.length ? <p>No documents in this group yet.</p> : <ul className="space-y-2">{items.map(doc => <li key={doc.id} className="flex items-center justify-between gap-3 rounded-lg border bg-card p-3"><span className="min-w-0 break-all">{doc.name}</span><Button variant="outline" size="sm" disabled={Boolean(busy)} onClick={() => open(doc)}><Download />{busy === doc.id ? 'Opening…' : 'Open'}</Button></li>)}</ul>}
    {files.hasNextPage && <Button variant="outline" disabled={files.isFetchingNextPage} onClick={() => files.fetchNextPage()}>{files.isFetchingNextPage ? 'Loading…' : 'Load more'}</Button>}
  </div>;
}