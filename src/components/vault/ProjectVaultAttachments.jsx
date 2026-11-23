import React, { useState } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { safeFileUrl } from '@/components/vault/vault';

export default function ProjectVaultAttachments({ projectId }) {
  const qc = useQueryClient();
  const [busy,setBusy] = useState(false), [error,setError] = useState('');
  const key = ['projectVaultFiles',projectId];
  const result = useInfiniteQuery({queryKey:key,initialPageParam:undefined,
    queryFn:async({pageParam})=>(await base44.functions.invoke('projectVaultFiles',{action:'list',projectId,cursor:pageParam})).data,
    getNextPageParam:page=>page.next_cursor || undefined});
  const files = result.data?.pages.flatMap(page=>page.items) || [];
  async function upload(event) {
    const file = event.target.files?.[0]; event.target.value='';
    if (!file || busy) return;
    setBusy(true); setError('');
    try {
      const {file_uri} = await base44.integrations.Core.UploadPrivateFile({file});
      await base44.functions.invoke('projectVaultFiles',{action:'attach',projectId,file:{uri:file_uri,name:file.name}});
      await qc.invalidateQueries({queryKey:key});
    } catch {setError('Could not add the attachment.');} finally {setBusy(false);}
  }
  async function view(file) {
    const tab = window.open('about:blank','_blank');
    if (tab) tab.opener = null;
    try {
      const {signed_url} = await base44.integrations.Core.CreateFileSignedUrl({file_uri:file.uri});
      const url = safeFileUrl(signed_url);
      if (!url) throw new Error('Missing attachment URL');
      if (tab) tab.location.replace(url); else window.location.assign(url);
    } catch { tab?.close(); setError('Could not open the attachment.'); }
  }
  return <div className="space-y-2">
    <h4 className="text-sm font-medium">Project attachments</h4>
    {result.isPending ? <p role="status">Loading attachments…</p> : result.isError && !files.length ? <Button variant="outline" onClick={()=>result.refetch()}>Retry loading attachments</Button> : !files.length ? <p>No project attachments yet.</p> :
      <ul className="space-y-1">{files.map(file=><li key={file.id}>{file.uri ? <Button variant="link" className="h-auto whitespace-normal p-1 text-left" onClick={()=>view(file)}>View {file.name}</Button> : safeFileUrl(file.url) ? <a className="break-words underline" href={file.url} target="_blank" rel="noreferrer">View {file.name}</a> : <span>{file.name}</span>}</li>)}</ul>}
    {result.hasNextPage && <Button variant="outline" size="sm" disabled={result.isFetchingNextPage} onClick={()=>result.fetchNextPage()}>Load more attachments</Button>}
    <label className="block text-sm">{busy ? 'Uploading attachment…' : 'Add project attachment'} <input type="file" className="block max-w-full" onChange={upload} disabled={busy} /></label>
    {error && <p role="alert">{error}</p>}
  </div>;
}