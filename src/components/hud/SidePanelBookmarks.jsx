import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { isTourPreview } from '@/components/tour/tourPreviewTargets';
import SidePanelBookmarkSection from '@/components/hud/SidePanelBookmarkSection';
import useSidePanelBookmarks, { pagePath, sectionLimit } from '@/components/hud/useSidePanelBookmarks';

function BookmarkSections({ user, onNavigate }) {
  const { pathname } = useLocation();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const { sections, save, busy, error } = useSidePanelBookmarks(user);
  const current = pagePath(pathname);
  const create = event => {
    event.preventDefault();
    if (busy || !name.trim() || sections.length >= sectionLimit) return;
    save([...sections, { id: crypto.randomUUID(), name: name.trim(), pages: [] }], {
      onSuccess: () => { setAdding(false); setName(''); },
    });
  };
  return <section data-readable-surface aria-label="Personal bookmark sections" className="mt-2 space-y-1 rounded-xl border p-2">
    <div className="flex items-center justify-between gap-1">
      <h3 className="text-xs font-semibold">My Bookmarks</h3>
      <Button size="sm" variant="outline" className="h-7 px-2" disabled={busy || sections.length >= sectionLimit} aria-expanded={adding} onClick={() => setAdding(!adding)}><Plus /> New section</Button>
    </div>
    {adding && <form className="flex gap-1 py-1" onSubmit={create}>
      <Input className="h-8 min-w-0 flex-1 text-xs" aria-label="Section name" placeholder="Section name" maxLength={45} required autoFocus value={name} onChange={event => setName(event.target.value)} />
      <Button type="submit" size="sm" disabled={busy || !name.trim()}>Create</Button>
    </form>}
    {error && <p role="alert" className="text-xs">Your bookmarks couldn’t be saved. Try again.</p>}
    {busy && <p role="status" className="text-xs">Saving bookmarks…</p>}
    {!sections.length && !adding && <p className="py-1 text-xs text-muted-foreground">Create a section to bookmark pages for quick access.</p>}
    {sections.map(section => <SidePanelBookmarkSection key={section.id} {...{ section, sections, current, save, busy, onNavigate }} />)}
  </section>;
}

export default function SidePanelBookmarks({ onNavigate }) {
  const { user } = useAuth();
  if (!user?.id || isTourPreview()) return null;
  return <BookmarkSections key={user.id} user={user} onNavigate={onNavigate} />;
}