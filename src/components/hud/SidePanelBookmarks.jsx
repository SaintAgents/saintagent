import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { isTourPreview } from '@/components/tour/tourPreviewTargets';
import useSidePanelBookmarks, { pageLabel, pagePath } from '@/components/hud/useSidePanelBookmarks';
import RecordKeepActions from '@/components/watch/RecordKeepActions';

function BookmarkEntries({ user, onNavigate }) {
  const { pathname, search, hash } = useLocation();
  const [pageActions, setPageActions] = useState(false);
  const { entries, add, remove, full, busy, loading, saving, error, loadError, retry } = useSidePanelBookmarks(user);
  const current = pagePath(pathname, search, hash);
  const page = pagePath(pathname);
  const alreadySaved = entries.includes(current);
  return <section data-readable-surface aria-label="My Bookmarks" className="mt-2 space-y-1 rounded-xl border p-2">
    <Button type="button" size="sm" variant="outline" className="h-auto min-h-8 whitespace-normal text-left" disabled={busy || !current || alreadySaved || full} onClick={() => add(current)}><Plus aria-hidden="true" /> Add a new entry</Button>
    <p className="px-1 py-1 text-xs text-muted-foreground">{alreadySaved ? 'This page is already bookmarked.' : full ? 'Remove an entry to make room for a new one.' : 'Save a link to the page you’re on.'}</p>
    {error && <p role="alert" className="text-xs">Your bookmarks couldn’t be saved. Try again.</p>}
    {loading && <p role="status" className="text-xs">Loading bookmarks…</p>}
    {saving && <p role="status" className="text-xs">Saving bookmarks…</p>}
    {loadError && <p role="alert" className="text-xs">Couldn’t load bookmarks. <button type="button" className="underline" onClick={() => retry()}>Retry</button></p>}
    {!!entries.length && <ul className="space-y-1">{entries.map(path => <li key={path} className="flex items-center gap-1">
      <Link className="min-w-0 flex-1 break-words px-1 py-1 text-xs underline-offset-2 hover:underline" to={path} title={path} aria-current={current === path ? 'page' : undefined} onClick={onNavigate}>{pageLabel(path)}</Link>
      <Button type="button" size="icon" variant="ghost" className="size-8 shrink-0" aria-label={`Delete bookmark ${pageLabel(path)}`} title="Delete bookmark" disabled={busy} onClick={() => remove(path)}><Trash2 aria-hidden="true" /></Button>
    </li>)}</ul>}
    {!entries.length && !loading && !loadError && <p className="px-1 text-xs text-muted-foreground">No entries yet.</p>}
    {page && <><Button type="button" size="sm" variant="ghost" aria-expanded={pageActions} onClick={() => setPageActions(value => !value)}>Other page actions</Button>{pageActions && <RecordKeepActions key={page} type="page" id={page.toLowerCase()} title={pageLabel(page)} route={page} />}</>}
  </section>;
}

export default function SidePanelBookmarks({ onNavigate }) {
  const { user } = useAuth();
  if (!user?.id || isTourPreview()) return null;
  return <BookmarkEntries key={user.id} user={user} onNavigate={onNavigate} />;
}