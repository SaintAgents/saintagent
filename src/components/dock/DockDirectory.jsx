import React from 'react';
import { Link } from 'react-router-dom';
import { openMember, useDockDirectory } from '@/components/dock/useDockDirectory';

export default function DockDirectory({user, visible, contacts = false, action}) {
  const {query, rows, setSearch} = useDockDirectory(user, visible, contacts);
  return <div className="grid gap-2">
    <form className="flex flex-wrap gap-1" onSubmit={e => { e.preventDefault(); setSearch(new FormData(e.currentTarget).get('q').trim()); }}>
      <input name="q" maxLength={80} aria-label={contacts ? 'Search CRM contacts' : 'Search members'} placeholder={contacts ? 'Search my contacts' : 'Search members'} className="min-w-0 flex-1" /><button type="submit">Search</button>
    </form>
    {query.isPending && <p role="status">Loading…</p>}
    {query.isError && <p role="alert">Could not load results. <button onClick={() => query.refetch()}>Retry</button></p>}
    {query.isSuccess && !rows.length && <p>No matching {contacts ? 'contacts' : 'members'}.</p>}
    <ul className="grid gap-2">{rows.map(row => {
      const name = contacts ? row.name : row.display_name || row.handle || 'Member';
      return <li key={row.id} className="flex items-center gap-2 border-b pb-2">
        {!contacts && row.avatar_url && <img src={row.avatar_url} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" loading="lazy" />}
        <div className="min-w-0 flex-1 break-words">{contacts ? <strong>{name}</strong> : <button type="button" onClick={() => openMember(row.user_id)}>{name}</button>}
          <p className="text-xs">{[row.title || row.role, row.organization || row.company, row.location || row.region, contacts ? '' : row.member_type === 'organization' ? 'Organization' : 'Member'].filter(Boolean).join(' · ')}</p></div>
        {action?.(row, name)}
      </li>;
    })}</ul>
    {query.hasNextPage && <button disabled={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>Load more</button>}
    {!contacts && !action && <Link to="/Profiles">Open member directory</Link>}
  </div>;
}