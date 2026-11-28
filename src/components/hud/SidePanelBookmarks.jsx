import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { BookmarkPlus, Plus } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { isTourPreview } from '@/components/tour/tourPreviewTargets';
import SidePanelBookmarkSection from '@/components/hud/SidePanelBookmarkSection';
import useSidePanelBookmarks, { pageLabel, pagePath, sectionLimit } from '@/components/hud/useSidePanelBookmarks';
import RecordKeepActions from '@/components/watch/RecordKeepActions';

function BookmarkSections({ user, onNavigate, useSectionLabels }) {
  const collection = useSectionLabels ? 'section' : 'group';
  const addLabel = `New ${collection}`;
  const pinLabel = useSectionLabels ? 'Pin to Section' : 'Pin to Group';
  const { pathname, search, hash } = useLocation();
  const [adding, setAdding] = useState(false);
  const [pageActions, setPageActions] = useState(false);
  const [name, setName] = useState('');
  const { sections, save, busy, loading, saving, error, loadError, retry } = useSidePanelBookmarks(user);
  const current = pagePath(pathname, search, hash);
  const page = pagePath(pathname);
  const create = event => {
    event.preventDefault();
    if (busy || !name.trim() || sections.length >= sectionLimit) return;
    save([...sections, { id: crypto.randomUUID(), name: name.trim(), pages: [] }], {
      onSuccess: () => { setAdding(false); setName(''); },
    });
  };
  return <section data-readable-surface aria-label="Personal bookmark sections" className="mt-2 space-y-1 rounded-xl border p-2">
    <div className="flex items-center justify-between gap-1">
      <h3 className="text-xs font-semibold">{useSectionLabels ? 'Bookmark Sections' : 'My Bookmark Groups'}</h3>
      <Button size="sm" variant="outline" className="h-7 px-2" disabled={busy || sections.length >= sectionLimit} aria-expanded={adding} onClick={() => setAdding(!adding)}><Plus /> {addLabel}</Button>
    </div>
    <p className="py-1 text-xs text-muted-foreground">Use <strong>Bookmark this page</strong> or <strong>{pinLabel}</strong> to save the current link. <strong>{addLabel}</strong> creates an empty {collection}. Tap a bookmark to reopen the page, or use the trash icon to remove it.</p>
    {adding && <form className="flex gap-1 py-1" onSubmit={create}>
      <Input className="h-8 min-w-0 flex-1 text-xs" aria-label="Section name" placeholder="Section name" maxLength={45} required autoFocus value={name} onChange={event => setName(event.target.value)} />
      <Button type="submit" size="sm" disabled={busy || !name.trim()}>Create</Button>
    </form>}
    {error && <p role="alert" className="text-xs">Your bookmarks couldn’t be saved. Try again.</p>}
    {loading && <p role="status" className="text-xs">Loading bookmarks…</p>}
    {saving && <p role="status" className="text-xs">Saving bookmarks…</p>}
    {loadError && <p role="alert" className="text-xs">Couldn’t load bookmarks. <button type="button" className="underline" onClick={() => retry()}>Retry</button></p>}
    {!sections.length && !adding && !busy && current && <Button type="button" size="sm" variant="outline" onClick={() => save([{ id: crypto.randomUUID(), name: 'Bookmarks', pages: [current] }])}><BookmarkPlus aria-hidden="true" /> Bookmark this page</Button>}
    {sections.map(section => <SidePanelBookmarkSection key={section.id} {...{ section, sections, current, save, busy, onNavigate, pinLabel, collection }} />)}
    {page && <><Button type="button" size="sm" variant="ghost" aria-expanded={pageActions} onClick={() => setPageActions(value => !value)}>Other page actions</Button>{pageActions && <RecordKeepActions key={page} type="page" id={page.toLowerCase()} title={pageLabel(page)} route={page} />}</>}
  </section>;
}

export default function SidePanelBookmarks({ onNavigate, useSectionLabels = false }) {
  const { user } = useAuth();
  if (!user?.id || isTourPreview()) return null;
  return <BookmarkSections key={user.id} user={user} onNavigate={onNavigate} useSectionLabels={useSectionLabels} />;
}