import React, { useEffect, useState } from 'react';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Upload } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VaultUpload from '@/components/vault/VaultUpload';
import VaultDocumentCard from '@/components/vault/VaultDocumentCard';
import VaultDocumentDialog from '@/components/vault/VaultDocumentDialog';
import VaultGroupDialog from '@/components/vault/VaultGroupDialog';
import VaultGroupFiles from '@/components/vault/VaultGroupFiles';
import { folders, titlePattern, ownerFilter, canEditDocument } from '@/components/vault/vault';

export default function VaultLibrary({ user, project }) {
  const [view,setView] = useState('mine'), [folder,setFolder] = useState(''), [input,setInput] = useState(''), [search,setSearch] = useState(''), [dialog,setDialog] = useState(null);
  const qc = useQueryClient(), entity = base44.entities.HubDocument;
  const groupKey = ['vault-groups', user.id];
  const groups = useInfiniteQuery({ queryKey: groupKey, enabled: !project, initialPageParam: undefined,
    queryFn: ({pageParam}) => base44.entities.VaultGroup.list({ sort:'-created_date', limit:24, cursor:pageParam }), getNextPageParam: page => page.next_cursor || undefined });
  const groupList = [...new Map(groups.data?.pages.flatMap(page => page.items.map(group => [group.id, group])) || []).values()];
  const groupView = !project && view.startsWith('group:');
  const activeGroup = groupView && groupList.find(group => `group:${group.id}` === view);
  const switchView = (value) => { setView(value); setFolder(''); };
  function groupCreated(group) {
    qc.setQueryData(groupKey, old => old?.pages.length ? { ...old, pages: [{ ...old.pages[0], items: [group, ...old.pages[0].items] }, ...old.pages.slice(1)] } : { pages: [{ items: [group] }], pageParams: [undefined] });
    switchView(`group:${group.id}`); setDialog(null);
    qc.invalidateQueries({ queryKey: groupKey });
  }
  useEffect(()=>{ const timer=setTimeout(()=>setSearch(input.trim()),250); return ()=>clearTimeout(timer); },[input]);
  const mine = ownerFilter(user);
  const scope = project ? {project_id:project.id} : view === 'mine' ? mine : {$nor:[mine]};
  const scopeKey = [user.id,project?.id || view];
  const counts = useQuery({queryKey:['vault',...scopeKey,'folders'],enabled:!groupView,queryFn:()=>entity.aggregate({query:scope,groupBy:'folder'})});
  const query = {...scope,...(folder ? {folder:folder === 'Other' ? {$nin:folders.filter(name=>name !== 'Other')} : folder} : {}),...(search ? {title:titlePattern(search)} : {})};
  const documents = useInfiniteQuery({queryKey:['vault',...scopeKey,folder,search],enabled:!groupView,initialPageParam:undefined,
    queryFn:({pageParam})=>entity.filter(query,{sort:'-created_date',limit:24,cursor:pageParam}),getNextPageParam:page=>page.next_cursor || undefined});
  const rows = counts.data?.rows || [], tally = Object.fromEntries(rows.map(row=>[folders.includes(row.folder) ? row.folder : 'Other', 0]));
  rows.forEach(row=>{ tally[folders.includes(row.folder) ? row.folder : 'Other'] += Number(row.count || 0); });
  const items = documents.data?.pages.flatMap(page=>page.items) || [];
  const changed = ()=>qc.invalidateQueries({queryKey:['vault']});
  const close = ()=>setDialog(null), saved = ()=>{changed();close();};
  const Heading = project ? 'h3' : 'h1';
  return <section className="space-y-4" data-readable-surface>
    <div className="flex flex-wrap items-center justify-between gap-3"><Heading className="font-heading text-xl font-bold md:text-2xl">{project ? `${project.title} · Document Vault` : 'Document Vault'}</Heading><div className="flex flex-wrap gap-2">{!project && <Button variant="outline" onClick={()=>setDialog({mode:'group'})}><Plus /> Create group</Button>}{!groupView && <Button onClick={()=>setDialog({mode:'upload'})}><Upload /> Upload</Button>}</div></div>
    {!project && <div className="space-y-2"><Tabs value={view} onValueChange={switchView}><TabsList aria-label="Vault view" className="h-auto flex-wrap justify-start"><TabsTrigger value="mine">My Vault</TabsTrigger><TabsTrigger value="federated">Federated Vault</TabsTrigger>{groupList.map(group => <TabsTrigger key={group.id} value={`group:${group.id}`} className="max-w-48"><span className="truncate" title={group.name}>{group.name}</span></TabsTrigger>)}</TabsList></Tabs>
      {groups.isPending && <p className="text-sm" role="status">Loading groups…</p>}{groups.isError && <Button size="sm" variant="outline" onClick={()=>groups.refetch()}>Retry loading groups</Button>}{groups.hasNextPage && <Button size="sm" variant="ghost" disabled={groups.isFetchingNextPage} onClick={()=>groups.fetchNextPage()}>{groups.isFetchingNextPage ? 'Loading…' : 'More groups'}</Button>}
    </div>}
    {groupView ? activeGroup ? <VaultGroupFiles key={activeGroup.id} group={activeGroup} user={user} /> : <p role="status">{groups.isPending ? 'Loading group…' : 'This group isn’t available.'}</p> : <div className="grid gap-4 @container md:grid-cols-[minmax(9rem,12rem)_minmax(0,1fr)]">
      <div className="flex flex-wrap content-start gap-1 md:flex-col" aria-label="Folders">{['',...folders].map(value=><Button key={value} size="sm" variant={value===folder?'secondary':'ghost'} aria-pressed={value===folder} onClick={()=>setFolder(value)} className="justify-between">{value || 'All Documents'} <span>{counts.isSuccess ? value ? tally[value] || 0 : rows.reduce((sum,row)=>sum+Number(row.count || 0),0) : '—'}</span></Button>)}</div>
      <div className="min-w-0 space-y-3"><Input aria-label="Search by document title" placeholder="Search by document title" value={input} onChange={e=>setInput(e.target.value)} maxLength={150} />
        {documents.isPending ? <p role="status">Loading documents…</p> : documents.isError && !items.length ? <Button variant="outline" onClick={()=>documents.refetch()}>Retry loading documents</Button> : !items.length ? <p>{search || folder ? 'No documents match your filters.' : 'No documents in this vault yet.'}</p> : <div className={`grid gap-3 ${project ? '' : 'xl:grid-cols-2'}`}>{items.map(doc=><VaultDocumentCard key={doc.id} {...{doc,user,changed}} open={setDialog} />)}</div>}
        {documents.hasNextPage && <Button variant="outline" disabled={documents.isFetchingNextPage} onClick={()=>documents.fetchNextPage()}>{documents.isFetchingNextPage?'Loading…':'Load more'}</Button>}
      </div>
    </div>}
    {dialog?.mode==='group' && <VaultGroupDialog user={user} close={close} created={groupCreated} />}
    {dialog?.mode==='upload' && <VaultUpload {...{user,project,close,saved}} />}
    {dialog?.doc && <VaultDocumentDialog {...dialog} {...{close,saved}} editable={canEditDocument(dialog.doc,user)} />}
  </section>;
}