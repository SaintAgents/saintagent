import { useEffect, useState } from 'react';
const key = 'heroCyclePaused';
export default function useHeroCycleControls() {
  const [paused,setPaused] = useState(() => { try { return localStorage.getItem(key) === 'true'; } catch { return false; } });
  useEffect(() => {
    const sync=e => { if (e.key === key) setPaused(e.newValue === 'true'); };
    const local=e => setPaused(e.detail.paused);
    window.addEventListener('storage',sync); window.addEventListener('heroCyclePausedChanged',local);
    return () => { window.removeEventListener('storage',sync); window.removeEventListener('heroCyclePausedChanged',local); };
  },[]);
  const update=value => { setPaused(value); try { localStorage.setItem(key,String(value)); } catch {} window.dispatchEvent(new CustomEvent('heroCyclePausedChanged',{detail:{paused:value}})); };
  return [paused,update];
}