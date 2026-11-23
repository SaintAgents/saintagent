import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { defaults, widgets } from '@/components/canopy/canopyCatalog';

const saves = new Map();
function read(user) {
  let local;
  try { local = JSON.parse(localStorage.getItem(`sa-canopy:${user.id}`)); } catch { /* use account copy */ }
  const remote = user.canopy_preferences;
  const data = (local?.revision || 0) >= (remote?.revision || 0) && local ? local : remote;
  return { ...defaults, ...data, cards: Array.isArray(data?.cards) ? [...new Set(data.cards.filter(id => widgets.includes(id)))] : defaults.cards };
}
export default function useCanopySettings(user) {
  const [settings, setSettings] = useState(() => read(user));
  const [error, setError] = useState(false);
  function commit(patch) {
    const next = { ...read(user), ...patch, revision: Date.now() };
    setSettings(next);
    try { localStorage.setItem(`sa-canopy:${user.id}`, JSON.stringify(next)); } catch { /* account copy still saves */ }
    setError(false);
    const queue = saves.get(user.id) || Promise.resolve();
    const save = queue.catch(() => {}).then(() => base44.auth.updateMe({ canopy_preferences: next }));
    saves.set(user.id, save);
    save.catch(() => setError(true)).finally(() => { if (saves.get(user.id) === save) saves.delete(user.id); });
  }
  return { settings, commit, error };
}