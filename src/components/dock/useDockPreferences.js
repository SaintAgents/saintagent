import { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { initial } from '@/components/dock/dockCatalog';

export const dockStorageKey = id => `sa-dock:${id}`;
export function readDockLocal(id) {
  try { return JSON.parse(localStorage.getItem(dockStorageKey(id))); } catch { return null; }
}
function load(user) {
  const local = readDockLocal(user.id), remote = user.dock_preferences;
  const saved = local && (local.revision || 0) >= (remote?.revision || 0) ? local : remote;
  const prefs = { ...initial(), ...saved };
  return { ...prefs, cards: prefs.cards.filter(card => card.type !== 'Watched Countries') };
}
export default function useDockPreferences(user, preview = false) {
  const [prefs, setPrefs] = useState(() => preview ? initial() : load(user));
  const [error, setError] = useState(false);
  const latest = useRef(prefs), queue = useRef(Promise.resolve());
  useEffect(() => {
    const publish = () => document.dispatchEvent(new CustomEvent('dockShortcutsChange', { detail:prefs.shortcuts }));
    publish();
    document.addEventListener('requestDockShortcuts', publish);
    return () => document.removeEventListener('requestDockShortcuts', publish);
  }, [prefs.shortcuts]);
  function commit(change) {
    const prev = latest.current;
    const next = { ...prev, ...(typeof change === 'function' ? change(prev) : change), revision:Math.max(Date.now(), (prev.revision || 0) + 1) };
    latest.current = next;
    setPrefs(next);
    if (preview) return;
    try { localStorage.setItem(dockStorageKey(user.id), JSON.stringify(next)); } catch { /* account copy still saves */ }
    setError(false);
    queue.current = queue.current.catch(() => {}).then(() => base44.auth.updateMe({ dock_preferences:next }));
    queue.current.catch(() => { if (latest.current === next) setError(true); });
  }
  return { prefs, commit, error };
}