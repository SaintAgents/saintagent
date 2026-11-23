import React, { useEffect, useState } from 'react';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { Upload } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VaultUpload from '@/components/vault/VaultUpload';
import VaultDocumentCard from '@/components/vault/VaultDocumentCard';
import VaultDocumentDialog from '@/components/vault/VaultDocumentDialog';
import { folders, titlePattern, ownerFilter, canEditDocument } from '@/components/vault/vault';

export default function VaultLibrary({ user, project }) {
  const [view,setView] = useState('mine'), [folder,setFolder] = useState(''), [input,setInput] = useState(''), [search,setSearch] = useState(''), [dialog,setDialog] = useState(null);
  const qc = useQueryClient(), entity = base44.entities.HubDocument;
  useEffect(()=>{ const timer=setTimeout(()=>setSearch(input.trim()),250); return ()=>clearTimeout(timer); },[input]);
  const mine = ownerFilter(user);
  const scope = project ? {project_id:project.id} : view === 'mine' ? mine : {$nor:[mine]};
  const scopeKey = [user.id,project?.id || view];
  const counts = useQuery({queryKey:['vault',...scopeKey,'folders'],queryFn:()=>entity.aggregate({query:scope,groupBy:'folder'})});
  const query = {...scope,...(folder ? {folder:folder === 'Other' ? {$nin:folders.filter(name=>name !== 'Other')} : folder} : {}),...(search ? {title:titlePattern(search)} : {})};
  const documents = useInfiniteQuery({queryKey:['vault',...scopeKey,folder,search],initialPageParam:undefined,
    queryFn:({pageParam})=>entity.filter(query,{sort:'-created_date',limit:24,cursor:pageParam}),getNextPageParam:page=>page.next_cursor || undefined});
  const rows = counts.data?.rows || [], tally = Object.fromEntries(rows.map(row=>[folders.includes(row.folder) ? row.folder : 'Other', 0]));
  rows.forEach(row=>{ tally[folders.includes(row.folder) ? row.folder : 'Other'] += Number(row.count || 0); });
  const items = documents.data?.pages.flatMap(page=>page.items) || [];
  const changed = ()=>qc.invalidateQueries({queryKey:['vault']});
  const close = ()=>setDialog(null), saved = ()=>{changed();close();};
  const Heading = project ? 'h3' : 'h1';
  return <section className="space-y-4" data-readable-surface>
    <div className="flex flex-wrap items-center justify-between gap-3"><Heading className="font-heading text-xl font-bold md:text-2xl">{project ? `${project.title} · Document Vault` : 'Document Vault'}</Heading><Button onClick={()=>setDialog({mode:'upload'})}><Upload /> Upload</Button></div>
    {!project && <Tabs value={view} onValueChange={value=>{setView(value);setFolder('');}}><TabsList aria-label="Vault view"><TabsTrigger value="mine">My Vault</TabsTrigger><TabsTrigger value="federated">Federated Vault</TabsTrigger></TabsList></Tabs>}
    <div className="grid gap-4 @container md:grid-cols-[minmax(9rem,12rem)_minmax(0,1fr)]">
      <div className="flex flex-wrap content-start gap-1 md:flex-col" aria-label="Folders">{['',...folders].map(value=><Button key={value} size="sm" variant={value===folder?'secondary':'ghost'} aria-pressed={value===folder} onClick={()=>setFolder(value)} className="justify-between">{value || 'All Documents'} <span>{counts.isSuccess ? value ? tally[value] || 0 : rows.reduce((sum,row)=>sum+Number(row.count || 0),0) : '—'}</span></Button>)}</div>
      <div className="min-w-0 space-y-3"><Input aria-label="Search by document title" placeholder="Search by document title" value={input} onChange={e=>setInput(e.target.value)} maxLength={150} />
        {documents.isPending ? <p role="status">Loading documents…</p> : documents.isError && !items.length ? <Button variant="outline" onClick={()=>documents.refetch()}>Retry loading documents</Button> : !items.length ? <p>{search || folder ? 'No documents match your filters.' : 'No documents in this vault yet.'}</p> : <div className={`grid gap-3 ${project ? '' : 'xl:grid-cols-2'}`}>{items.map(doc=><VaultDocumentCard key={doc.id} {...{doc,user,changed}} open={setDialog} />)}</div>}
        {documents.hasNextPage && <Button variant="outline" disabled={documents.isFetchingNextPage} onClick={()=>documents.fetchNextPage()}>{documents.isFetchingNextPage?'Loading…':'Load more'}</Button>}
      </div>
    </div>
    {dialog?.mode==='upload' && <VaultUpload {...{user,project,close,saved}} />}
    {dialog?.doc && <VaultDocumentDialog {...dialog} {...{close,saved}} editable={canEditDocument(dialog.doc,user)} />}
  </section>;
}