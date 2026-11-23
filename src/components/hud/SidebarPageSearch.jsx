import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';

export default function SidebarPageSearch({ pages, collapsed, onExpand, children }) {
  const [query, setQuery] = useState('');
  const [focusOnExpand, setFocusOnExpand] = useState(false);
  const navigate = useNavigate();
  const term = query.trim().toLowerCase();
  const results = term ? pages.filter(({ label, page, aliases = [] }) =>
    [label, page, ...aliases].some(value => value.toLowerCase().includes(term))) : [];

  if (collapsed) return <>
    <button type="button" aria-label="Search pages" title="Search pages" className="flex w-full justify-center rounded-md p-2 text-slate-600 hover:bg-accent" onClick={() => { setQuery(''); setFocusOnExpand(true); onExpand(); }}>
      <Search className="size-4" />
    </button>
    {children}
  </>;

  return <>
    <form role="search" aria-label="Sidebar pages" className="relative mb-2" onSubmit={(event) => {
      event.preventDefault();
      if (!results.length) return;
      navigate(`/${results[0].page}`);
      setQuery('');
    }}>
      <Search aria-hidden="true" className="pointer-events-none absolute left-2.5 top-1/2 z-10 size-4 -translate-y-1/2 text-slate-500" />
      <Input aria-label="Search pages" placeholder="Search pages…" className="pl-8 pr-8" value={query} autoFocus={focusOnExpand}
        onFocus={() => setFocusOnExpand(false)} onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => { if (event.key === 'Escape') setQuery(''); }} />
      {query && <button type="button" aria-label="Clear page search" className="absolute right-1.5 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded text-slate-600 hover:bg-accent" onClick={(event) => {
        const input = event.currentTarget.form.elements[0];
        setQuery('');
        input.focus();
      }}><X className="size-4" /></button>}
    </form>
    {!term ? children : results.length ? <ul className="space-y-0.5">
      {results.map(({ id, page, label, Icon }) => <li key={id}>
        <Link to={`/${page}`} onClick={() => setQuery('')} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-800 hover:bg-accent">
          <Icon aria-hidden="true" className="size-4 shrink-0" />
          <span className="min-w-0 break-words">{label}</span>
        </Link>
      </li>)}
    </ul> : <p role="status" className="px-2.5 py-2 text-sm text-slate-600">No matching pages.</p>}
  </>;
}