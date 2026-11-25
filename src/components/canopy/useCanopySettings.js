import { useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { defaults, widgets } from '@/components/canopy/canopyCatalog';

const saves = new Map();
const layoutOf = ({ cards, minimized, sizes, scale, height, split }) => ({ cards, minimized, sizes, scale, height, split });
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
  const latest = useRef(settings);
  function commit(patch) {
    const next = { ...latest.current, ...patch, revision: Date.now() };
    latest.current = next;
    setSettings(next);
    try { localStorage.setItem(`sa-canopy:${user.id}`, JSON.stringify(next)); } catch { /* account copy still saves */ }
    setError(false);
    const queue = saves.get(user.id) || Promise.resolve();
    const save = queue.catch(() => {}).then(() => base44.auth.updateMe({ canopy_preferences: next }));
    saves.set(user.id, save);
    save.catch(() => setError(true)).finally(() => { if (saves.get(user.id) === save) saves.delete(user.id); });
  }
  const original = settings.showOriginal === true;
  const saved = settings.savedView;
  const viewSaved = !!saved && JSON.stringify(layoutOf(saved)) === JSON.stringify(layoutOf(settings));
  function saveView() {
    if (!latest.current.showOriginal) commit({ savedView: layoutOf(latest.current) });
  }
  function toggleOriginal() {
    const current = latest.current;
    if (!current.showOriginal) commit({ showOriginal: true });
    else commit({ ...(current.savedView || {}), showOriginal: false });
  }
  return { settings: original ? { ...settings, ...layoutOf(defaults) } : settings, commit, error, original, saved, viewSaved, saveView, toggleOriginal };
}