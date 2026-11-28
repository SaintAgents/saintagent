import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookmarkPlus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { bookmarkLimit, pageLabel } from '@/components/hud/useSidePanelBookmarks';

export default function SidePanelBookmarkSection({ section, sections, current, save, busy, onNavigate, pinLabel, collection }) {
  const { id, name, pages } = section;
  const [editing, setEditing] = useState(false);
  const alreadySaved = !!current && pages.some(path => path === current);
  const update = patch => save(sections.map(item => item.id === id ? { ...item, ...patch } : item));
  const move = (path, destination) => save(sections.map(item => {
    if (item.id === id) return { ...item, pages: pages.filter(entry => entry !== path) };
    if (item.id === destination && !item.pages.some(entry => entry === path)) return { ...item, pages: [...item.pages, path] };
    return item;
  }));
  return <div className="space-y-1 border-t py-2">
    <div className="flex flex-wrap items-center gap-1">
      <p className="min-w-0 grow basis-full break-words text-sm font-semibold">{name}</p>
      <Button size="sm" variant="ghost" className="h-7 px-1.5" disabled={busy || !current || alreadySaved || pages.length >= bookmarkLimit} title={alreadySaved ? 'Current page already bookmarked' : pinLabel} aria-label={`${pinLabel}: ${name}`} onClick={() => update({ pages: [...pages, current] })}><BookmarkPlus /><span className="text-xs">{pinLabel}</span></Button>
      <Button type="button" size="icon" variant="ghost" className="size-8 shrink-0" aria-label={`Manage ${name}`} title={`Manage ${name}`} aria-expanded={editing} onClick={() => setEditing(!editing)}><Pencil aria-hidden="true" /></Button>
      <Button type="button" size="icon" variant="ghost" className="size-8 shrink-0" aria-label={`Delete ${collection} ${name}`} title={`Delete ${collection} ${name}`} disabled={busy} onClick={() => {
        if (window.confirm(`Delete “${name}” and its bookmarks?`)) save(sections.filter(item => item.id !== id));
      }}><Trash2 aria-hidden="true" /></Button>
    </div>
    {editing && <form className="flex flex-wrap gap-1" onSubmit={event => {
      event.preventDefault();
      const nextName = event.currentTarget.elements.sectionName.value.trim();
      if (nextName && nextName !== name) update({ name: nextName });
    }}>
      <Input name="sectionName" aria-label={`Rename ${name}`} defaultValue={name} maxLength={45} required className="h-7 flex-1 basis-24 text-xs" />
      <Button type="submit" size="sm" className="h-7" disabled={busy}>Rename</Button>
    </form>}
    {pages.length ? <ul className="space-y-1">{pages.map(path => <li key={path} className="flex flex-wrap items-center gap-1">
      <Link className="min-w-0 flex-1 break-words px-1 py-1 text-xs underline-offset-2 hover:underline" to={path} aria-current={current === path ? 'page' : undefined} onClick={onNavigate}>{pageLabel(path)}</Link>
      {editing && <select aria-label={`Move ${pageLabel(path)}`} className="max-w-[6rem] rounded border bg-background p-1 text-xs" value="" disabled={busy || sections.length < 2} onChange={event => move(path, event.target.value)}><option value="" disabled>Move to…</option>{sections.filter(item => item.id !== id && (item.pages.length < bookmarkLimit || item.pages.some(entry => entry === path))).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select>}
      <Button type="button" size="icon" variant="ghost" className="size-8 shrink-0" aria-label={`Delete bookmark ${pageLabel(path)} from ${name}`} title="Delete bookmark" disabled={busy} onClick={() => update({ pages: pages.filter(entry => entry !== path) })}><Trash2 aria-hidden="true" /></Button>
    </li>)}</ul> : <p className="px-1 text-xs text-muted-foreground">No bookmarks yet.</p>}
  </div>;
}