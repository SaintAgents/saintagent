import { useMutation, useInfiniteQuery } from '@tanstack/react-query';
import { ArrowUpRight, Microscope } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { safeUrl } from '@/components/wisdom/wisdomCards';
import { knowledgeFilter } from '@/components/canopy/knowledgeSources';

export default function KnowledgeResults({ source, user, search, compact, open }) {
  const limit = compact ? 3 : 12;
  const query = useInfiniteQuery({ queryKey:[...(source.key?.(user) || ['canopy-knowledge']), 'canopy-library', source.id, user.id, search, limit], initialPageParam:undefined, staleTime:15000,
    queryFn:({pageParam})=>base44.entities[source.entity].filter(knowledgeFilter(source,user,search),{sort:'-updated_date',limit,cursor:pageParam}),
    getNextPageParam:page=>page.next_cursor || undefined });
  const file = useMutation({ mutationFn:async ({uri,popup})=>{
    if (!popup) throw new Error('Pop-up blocked');
    try {
      const response = await base44.integrations.Core.CreateFileSignedUrl({file_uri:uri});
      const url = safeUrl(response.signed_url);
      if (!url) throw new Error('Missing file link');
      if (!popup.closed) popup.location.replace(url);
    } catch (error) { popup.close(); throw error; }
  }});
  const records = query.data?.pages.flatMap(page=>page.items) ?? [];
  const rows = records.map(r=>({id:r.id,...source.row(r)}));
  function openPrivate(uri) {
    const popup = window.open('about:blank','_blank');
    if (popup) popup.opener = null;
    file.mutate({uri,popup});
  }
  return <section aria-label={source.label} className="grid gap-1 border-t pt-2">
    <div className="flex items-center justify-between gap-2"><h3 className="font-semibold">{source.label}</h3>{source.route && <button type="button" onClick={()=>open(source.route)} aria-label={`Browse ${source.label}`}>Browse <ArrowUpRight size={12} /></button>}</div>
    {query.isPending ? <p role="status" className="text-xs">Loading…</p> : query.isError && !rows.length ? <div className="flex items-center gap-2"><p role="alert" className="text-xs">Could not load results.</p><button type="button" onClick={()=>query.refetch()}>Retry</button></div> : !rows.length ? <p className="text-xs">{search ? 'No matches.' : 'Nothing here yet.'}</p> : <ul className="grid gap-1.5">
      {rows.map(row=>{ const url = safeUrl(row.url); return <li key={row.id} className="min-w-0 rounded border p-1.5">
        <div className="flex items-start justify-between gap-1"><strong className="min-w-0 break-words">{row.title}</strong>
          {row.uri ? <button type="button" disabled={file.isPending} onClick={()=>openPrivate(row.uri)} aria-label={`Open ${row.title}`}>{file.isPending && file.variables?.uri === row.uri ? 'Opening…' : 'Open'}</button> : url ? <a className="shrink-0 underline" href={url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${row.title} in a new tab`}>Open <ArrowUpRight className="inline" size={12} /></a> : row.route ? <button type="button" onClick={()=>open(row.route)} aria-label={`Open ${row.title}`}>Open</button> : <small>Unavailable</small>}
        </div>
        {row.detail && <small className="block break-words">{row.detail}</small>}
        {row.description && <p className="line-clamp-2 break-words text-xs">{row.description}</p>}
        {row.studyId && <button type="button" className="mt-1" onClick={()=>open('deep-dive',{id:row.studyId})}><Microscope size={12} /> Open in Deep Dive</button>}
      </li>; })}
    </ul>}
    {file.isError && <p role="alert" className="text-xs">Could not open this file. Allow pop-ups and try again.</p>}
    {query.hasNextPage && <button type="button" className="justify-self-start" disabled={query.isFetchingNextPage} onClick={()=>query.fetchNextPage()}>{query.isFetchingNextPage ? 'Loading…' : query.isFetchNextPageError ? 'Retry loading more' : 'Load more'}</button>}
  </section>;
}