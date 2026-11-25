import { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { escapeRegex } from '@/components/globalimpact/impactDiscovery';

const fields = [['name','Name'],['company','Organization'],['role','Role'],['domain','Domain'],['tags','Tag']];
const values = (row, field) => [row[field]].flat().filter(value => typeof value === 'string' && value.trim());
export default function GuideKnowledgeGraph({ email }) {
  const [input,setInput] = useState(''), [search,setSearch] = useState(''), [selected,setSelected] = useState(null);
  const query = useInfiniteQuery({queryKey:['guide-knowledge-graph',email,search], enabled:!!email && !!search, initialPageParam:undefined,
    queryFn:({pageParam}) => base44.entities.Contact.filter({owner_id:email,$or:fields.map(([field]) => ({[field]:{$regex:escapeRegex(search),$options:'i'}}))},{sort:'-updated_date',limit:12,cursor:pageParam}),
    getNextPageParam:page => page.has_more ? page.next_cursor : undefined});
  const rows = query.data?.pages.flatMap(page => page.items) || [];
  const focus = rows.find(row => row.id === selected) || rows[0];
  const matching = focus ? fields.flatMap(([field,label]) => values(focus, field).filter(value => value.toLowerCase().includes(search.toLowerCase())).map(value => `${label}: ${value}`)) : [];
  function find(value) {setInput(value); setSearch(value.trim()); setSelected(null);}
  return <div className="space-y-3">
    <p className="text-sm text-muted-foreground">Find contacts in your own network by role, organization or tag. Matches show recorded connections, not recommendations or permission to contact someone.</p>
    <form className="flex flex-wrap gap-2" onSubmit={e => {e.preventDefault(); find(input);}}><Input className="w-full sm:max-w-sm" aria-label="Search my contact network" placeholder="Try a skill tag, role, or organization" value={input} maxLength={100} onChange={e => setInput(e.target.value)} /><Button type="submit" disabled={!input.trim()}>Find connections</Button>{search && <Button variant="outline" type="button" onClick={() => find('')}>Clear</Button>}</form>
    {search && (query.isPending ? <p role="status">Finding connections…</p> : query.isError && !focus ? <p role="alert">Couldn’t load connections. <button type="button" className="underline" onClick={() => query.refetch()}>Retry</button></p> : !focus ? <p role="status">No contacts match “{search}”. Try a different term.</p> : <div className="grid gap-3 md:grid-cols-[1fr_2fr]">
      <ul className="space-y-1" aria-label="Matching contacts">{rows.map(row => <li key={row.id}><Button variant={focus.id === row.id ? 'secondary' : 'outline'} type="button" aria-pressed={focus.id === row.id} className="h-auto w-full justify-start whitespace-normal text-left" onClick={() => setSelected(row.id)}>{row.name}</Button></li>)}</ul>
      <div className="space-y-2 break-words rounded-md border p-3" aria-live="polite"><h4 className="font-semibold">{focus.name}</h4>
        <p className="text-sm"><strong>Why it matched:</strong> {matching.join(' · ') || 'Matched a field in this contact’s record.'}</p>
        <div className="flex flex-wrap gap-1.5" aria-label="Explore recorded connections">{fields.slice(1).flatMap(([field,label]) => values(focus,field).map((value,index) => <Button key={`${field}-${index}`} type="button" variant="outline" size="sm" className="h-auto whitespace-normal text-left" onClick={() => find(value.slice(0,100))}>{label}: {value}</Button>))}</div>
      </div>
    </div>)}
    {query.hasNextPage && <Button type="button" variant="outline" disabled={query.isFetching} onClick={() => query.fetchNextPage()}>{query.isFetchingNextPage ? 'Loading…' : query.isFetchNextPageError ? 'Retry loading more' : 'Load more contacts'}</Button>}
    <Link className="inline-block text-sm underline" to="/CRM?tab=network">Open full Contact Network graph</Link>
  </div>;
}