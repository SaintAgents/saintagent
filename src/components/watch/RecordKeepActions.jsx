import { Microscope, Pin, PinOff } from 'lucide-react';
import { openDeepDive } from '@/components/deepdive/deepDive';
import { deepDiveTarget, targetRequest } from '@/components/deepdive/deepDiveTargets';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { useDockPins } from '@/components/dock/DockPinContext';
import { isTourPreview } from '@/components/tour/tourPreviewTargets';
import WatchButton from '@/components/watch/WatchButton';
import SaveToMenu from '@/components/watch/SaveToMenu';
import { itemPath } from '@/components/watch/watchItems';

export default function RecordKeepActions({ type, id, title, subtitle, route }) {
  const { user } = useAuth();
  const pins = useDockPins();
  if (!user?.id || !id || !title || isTourPreview() || window.parent !== window && new URLSearchParams(window.location.search).get('observationPreview') === '1') return null;
  const watch = { item_type: type, record_id: id, display_name: title, ...(route ? { route } : {}) };
  const pin = { item_type: type, record_id: id, title, subtitle, path: itemPath(watch) };
  const pinned = pins?.has(pin);
  return <div {...deepDiveTarget(type,id,title)} className="mt-2 flex flex-wrap gap-2">
    <WatchButton key={`${type}:${id}`} user={user} item={watch} />
    <Button type="button" size="sm" variant="outline" title="Open Deep Dive with this topic filled in; you choose when research starts" onClick={event => { const target = event.currentTarget.closest('[data-deep-dive-title]'); if (target) openDeepDive(targetRequest(target)); }}><Microscope /> Deep Dive</Button>
    <SaveToMenu key={`${type}:${id}:save`} owner={user.id} item={{...watch, subtitle}} />
    {pins && <Button type="button" size="sm" variant={pinned ? 'secondary' : 'outline'} aria-pressed={pinned} onClick={() => pins.set(pin, !pinned)}>{pinned ? <PinOff /> : <Pin />}{pinned ? 'Unpin from Dock Deck' : 'Pin to Dock Deck'}</Button>}
  </div>;
}