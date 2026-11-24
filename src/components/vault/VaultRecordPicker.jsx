import React, { useEffect, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { titlePattern } from '@/components/vault/vault';

const entities = { User:['UserProfile','display_name'], Project:['Project','title'], Mission:['Mission','title'], Circle:['Circle','name'], Need:['Listing','title'] };
export default function VaultRecordPicker({ type, onPick, isPicked }) {
  const [input, setInput] = useState(''), [search, setSearch] = useState('');
  useEffect(() => { const timer = setTimeout(() => setSearch(input.trim()), 250); return () => clearTimeout(timer); }, [input]);
  const [entity, field] = entities[type];
  const results = useInfiniteQuery({ queryKey:['vault-targets',type,search], initialPageParam:undefined,
    queryFn: async ({pageParam}) => {
      const match = titlePattern(search), options = { sort:field, limit:20, cursor:pageParam };
      let query = type === 'Need' ? { listing_type:'request' } : {};
      if (search && type !== 'User') query[field] = match;
      if (search && type === 'User') {
        const orgs = await base44.entities.BusinessEntity5D.filter({ name:match }, { limit:50 });
        const owners = orgs.items.map(row => row.owner_id).filter(Boolean);
        query = { $or:[{ display_name:match }, { user_id:match }, ...(owners.length ? [{ user_id:{ $in:owners } }] : [])] };
      }
      return base44.entities[entity].filter(query, options);
    }, getNextPageParam: page => page.next_cursor || undefined });
  const records = results.data?.pages.flatMap(page => page.items) || [];
  return <div className="space-y-2">
    <Input aria-label={`Search ${type === 'User' ? 'members' : type.toLowerCase() + 's'}`} value={input} onChange={e=>setInput(e.target.value)} placeholder={type === 'User' ? 'Search by name, email, or organization' : `Search ${type.toLowerCase()}s`} maxLength={100} />
    <div className="max-h-36 space-y-1 overflow-y-auto">
      {results.isPending ? <p>Loading…</p> : results.isError ? <Button type="button" variant="outline" onClick={()=>results.refetch()}>Retry search</Button> : !records.length ? <p>No matches.</p> : records.map(row => <Button key={row.id} type="button" disabled={isPicked?.(row.user_id)} variant="ghost" className="block h-auto min-h-8 w-full whitespace-normal text-left" onClick={()=>onPick({ id:row.id, name:row[field] || row.id, userId:row.user_id })}>{row[field] || row.id}{type === 'User' && row.handle ? ` (@${row.handle})` : ''}</Button>)}
      {results.hasNextPage && <Button type="button" variant="outline" onClick={()=>results.fetchNextPage()} disabled={results.isFetchingNextPage}>Load more</Button>}
    </div>
  </div>;
}