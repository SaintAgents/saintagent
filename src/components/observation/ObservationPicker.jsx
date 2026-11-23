import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Bookmark, Check, Plus, X } from 'lucide-react';
import { resolveDestination } from '@/components/observation/observationPages';
import { LIMIT } from '@/components/observation/useObservationWorkspace';
export default function ObservationPicker({ mode, close, pages, cards, data, change, toggle, staff }) {
  const [query,setQuery] = useState(''), [name,setName] = useState(''), [group,setGroup] = useState(''), [alias,setAlias] = useState('');
  const visible = pages.filter(p => `${p.label} ${data.custom[p.id] || ''} ${p.path} ${p.group}`.toLowerCase().includes(query.trim().toLowerCase()));
  const exact = resolveDestination(query,pages);
  const addGroup = e => { e.preventDefault(); const label=name.trim(); if (!label || data.groups.length >= 20 || data.groups.some(g => g.name.toLowerCase() === label.toLowerCase())) return; const id=crypto.randomUUID(); change(s => ({...s,groups:[...s.groups,{id,name:label,ids:[]}]})); setName(''); setGroup(id); };
  const bookmark = (groupId,id) => change(s => ({...s,groups:s.groups.map(g => g.id !== groupId ? g : {...g,ids:g.ids.includes(id) ? g.ids.filter(p => p !== id) : [...g.ids,id]})}));
  const row = (p, groupId) => {
    const selected=cards.includes(p.id), saved=data.groups.find(g => g.id === group)?.ids.includes(p.id);
    return <li key={p.id} className="ob-picker-row"><button type="button" aria-pressed={selected} disabled={!selected && cards.length >= LIMIT} onClick={() => toggle(p.id)}>{selected ? <Check size={15}/> : <Plus size={15}/>} {data.custom[p.id] || p.label}<small>{p.group}</small></button>
      {groupId ? <button type="button" aria-label={`Remove ${p.label} bookmark`} onClick={() => bookmark(groupId,p.id)}><X size={15}/></button> : group && <button type="button" aria-pressed={!!saved} aria-label={`Toggle ${p.label} bookmark`} onClick={() => bookmark(group,p.id)}><Bookmark size={15}/>{saved ? 'Saved' : 'Bookmark'}</button>}
    </li>;
  };
  const groupList = <form className="ob-picker-form" onSubmit={addGroup}><input aria-label="New group name" maxLength={50} value={name} onChange={e => setName(e.target.value)} placeholder="New bookmark group"/><button disabled={!name.trim() || data.groups.length >= 20 || data.groups.some(g => g.name.toLowerCase() === name.trim().toLowerCase())}>Create group</button></form>;
  return <Dialog open onOpenChange={close}><DialogContent data-readable-surface className="ob-picker max-h-[85dvh] overflow-auto max-w-2xl">
    <DialogHeader><DialogTitle>{mode === 'groups' ? 'My Groups' : staff ? 'Add Any Page' : 'Search Pages'}</DialogTitle><DialogDescription>Select a page to toggle it on the active deck. {cards.length}/{LIMIT} cards used.</DialogDescription></DialogHeader>
    {mode !== 'groups' ? <>
      <input aria-label="Search pages" placeholder="Search by name or enter a SaintAgent page path" value={query} onChange={e => setQuery(e.target.value)}/>
      {groupList}<label className="ob-picker-form">Bookmark to <select value={group} onChange={e => setGroup(e.target.value)}><option value="">Choose a group</option>{data.groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select></label>
      {exact && <form className="ob-picker-form" onSubmit={e => {e.preventDefault(); change(s => ({...s,custom:{...s.custom,[exact.id]:alias.trim()}})); if (!cards.includes(exact.id)) toggle(exact.id); setAlias('');}}><input aria-label="Custom page label" placeholder="Optional custom label" maxLength={64} value={alias} onChange={e => setAlias(e.target.value)}/><button disabled={!cards.includes(exact.id) && cards.length >= LIMIT}>Save page</button></form>}
      {visible.length ? <ul>{visible.map(p => row(p))}</ul> : <p>No accessible pages match your search.</p>}
    </> : <>{groupList}{data.groups.length === 0 && <p>Create a group, then bookmark pages from {staff ? 'Add Any Page' : 'Search Pages'}.</p>}
    {data.groups.map(g => <details key={g.id}><summary>{g.name}</summary><ul>{pages.filter(p => g.ids.includes(p.id)).map(p => row(p,g.id))}</ul>{!pages.some(p => g.ids.includes(p.id)) && <p>No accessible bookmarks in this group yet.</p>}</details>)}
    <details open><summary>All Pages</summary><ul>{pages.map(p => row(p))}</ul></details></>}
  </DialogContent></Dialog>;
}