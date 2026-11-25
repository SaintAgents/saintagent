import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { SurfaceMedia } from '@/components/hero/SurfaceHeroLayer';
import SurfaceHeroLibrary from '@/components/hero/SurfaceHeroLibrary';
import CommandDeckHeroLibrary from '@/components/hero/CommandDeckHeroLibrary';
import SurfaceHeroOptions from '@/components/hero/SurfaceHeroOptions';
import SurfaceHeroQueue from '@/components/hero/SurfaceHeroQueue';
import { getSavedHeroes, heroDefaults, heroMedia, previewSurfaceHero, saveSurfaceHero } from '@/components/hero/surfaceHeroSettings';

const initial = surface => getSavedHeroes().surfaces?.[surface] || heroDefaults(surface);
export default function SurfaceHeroEditor({ request, targets, theme, close }) {
  const [surface, setSurface] = useState(request.surface), [draft, setDraft] = useState(() => initial(request.surface));
  const [dirty, setDirty] = useState(false), [release, setRelease] = useState(false), [confirm, setConfirm] = useState(false), [notice, setNotice] = useState('');
  const media = heroMedia(draft), field = draft.mode === 'image' ? 'images' : 'videos';
  useEffect(() => () => previewSurfaceHero(null), []);
  const change = (patch, show = false) => {
    const next = { ...draft, ...patch }; setDraft(next); setDirty(true); setNotice(''); setRelease(release || show);
    previewSurfaceHero({ surfaces: { [surface]: next }, ...((release || show) && { hidden: false }) });
  };
  function add(item, toggle = false, mode = draft.mode) {
    const targetField = mode === 'image' ? 'images' : 'videos';
    const queue = draft[targetField] || [];
    if (queue.some(entry => entry.url === item.url)) {
      if (toggle) change({ mode, [targetField]: queue.filter(entry => entry.url !== item.url) });
      else setNotice('This item is already in the carousel.');
      return false;
    }
    if (queue.length >= 4) { setNotice(`The ${mode} carousel is full. Remove an item before adding another.`); return false; }
    change({ mode, [targetField]: [...queue, item], enabled: true }, true); return true;
  }
  const tryClose = () => dirty ? setConfirm(true) : close();
  function save(clear = false) {
    try { saveSurfaceHero(surface, clear ? null : draft, !clear && release); close(); }
    catch { setConfirm(false); setNotice('Could not save your background. Check browser storage and try again.'); }
  }
  return <Dialog open onOpenChange={open => { if (!open) tryClose(); }}><DialogContent data-readable-surface overlayClassName="z-[10015] bg-black/25" onCloseAutoFocus={event => { if (request.trigger?.isConnected) { event.preventDefault(); request.trigger.focus(); } }} className="surface-hero-editor z-[10016] max-h-[88dvh] w-[calc(100%-1.5rem)] max-w-2xl overflow-y-auto p-4 sm:p-6">
    <div className="pr-8"><DialogTitle>Hero / Video Background</DialogTitle><DialogDescription>Choose a background for a page or workspace. Changes preview live and save in this browser.</DialogDescription></div>
    <label className="grid gap-1 text-sm">Surface<select className="rounded border bg-background p-2" value={surface} onChange={event => { const next = event.target.value; if (dirty && !window.confirm('Discard unsaved changes to this surface?')) return; previewSurfaceHero(null); setSurface(next); setDraft(initial(next)); setDirty(false); setRelease(false); setConfirm(false); setNotice(''); }}>{targets.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
    <div className="surface-hero-preview relative isolate aspect-[3/1] overflow-hidden rounded border bg-muted" aria-label="Background preview">{media.length ? <SurfaceMedia config={{ ...draft, muted: true }} className="absolute inset-0" theme={theme} /> : <p className="p-3 text-sm">No media selected</p>}</div>
    {surface === 'page:CommandDeck' && <CommandDeckHeroLibrary selected={draft.images || []} toggle={item => add(item, true, 'image')} />}
    <SurfaceHeroOptions config={draft} update={change} page={surface !== 'dock' && surface !== 'sidebar'} />
    <SurfaceHeroQueue key={`${surface}:${field}`} config={draft} update={change} notice={setNotice} add={add} />
    {draft.mode === 'video' && <SurfaceHeroLibrary selected={media} toggle={item => add(item, true)} />}
    {notice && <p role="status" className="text-sm">{notice}</p>}
    {confirm && <p role="alert" className="text-sm">Save or discard your changes before closing.</p>}
    <div className="flex flex-wrap justify-end gap-2 border-t pt-3">
      {media[0] && <Button variant="outline" onClick={async () => { try { await navigator.clipboard.writeText(media[0].url); setNotice('First media link copied.'); } catch { setNotice('Could not copy the link.'); } }}>Copy first media link</Button>}
      {getSavedHeroes().surfaces?.[surface] && <Button variant="outline" onClick={() => { if (window.confirm('Remove this saved background configuration?')) save(true); }}>Clear configuration</Button>}
      <Button variant="outline" onClick={confirm ? close : tryClose}>{confirm ? 'Discard and close' : 'Cancel'}</Button><Button disabled={!dirty} onClick={() => save()}>Save</Button>
    </div>
  </DialogContent></Dialog>;
}