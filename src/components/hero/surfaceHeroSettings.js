import { useSyncExternalStore } from 'react';

const key = 'saintagent:surface-hero-v1';
const read = () => { try { return JSON.parse(localStorage.getItem(key)) || {}; } catch { return {}; } };
let saved = read();
let preview = null;
let snapshot = saved;
const listeners = new Set();
const subscribe = listener => { listeners.add(listener); return () => listeners.delete(listener); };
function publish() {
  snapshot = preview ? { ...saved, ...preview, surfaces: { ...saved.surfaces, ...preview.surfaces } } : saved;
  listeners.forEach(listener => listener());
}
if (typeof window !== 'undefined') window.addEventListener('storage', event => { if (event.key === key || event.key === null) { saved = read(); publish(); } });
export const useSurfaceHeroes = () => useSyncExternalStore(subscribe, () => snapshot);
export const getSavedHeroes = () => saved;
export function previewSurfaceHero(value) { preview = value; publish(); }
export function saveSurfaceHero(surface, config, releaseVisibility) {
  const next = { ...saved, ...(releaseVisibility && { hidden: false }), surfaces: { ...saved.surfaces, [surface]: config } };
  localStorage.setItem(key, JSON.stringify(next)); saved = next; preview = null; publish();
}
export function toggleSurfaceHeroes() {
  const next = { ...saved, hidden: !saved.hidden };
  localStorage.setItem(key, JSON.stringify(next)); saved = next; publish();
}
export const openSurfaceHero = (surface, label) => window.dispatchEvent(new CustomEvent('openSurfaceHero', { detail: { surface, label, trigger: document.activeElement } }));
export const routeHeroKey = page => `page:${page}`;
export const heroDefaults = surface => ({ enabled: false, mode: 'video', videos: [], images: [], videoRotate: true, imageRotate: true, videoInterval: 15, imageInterval: 10, videoFade: 800, imageFade: 800, opacity: surface === 'dock' ? 0.45 : 0.24, speed: 1, blur: 0, muted: true, theme: 'all', fit: 'cover', position: 'center', attachment: 'fixed' });
export function heroUrl(value) {
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : ''; }
  catch { return ''; }
}
export const heroMedia = config => (config?.mode === 'image' ? config.images : config?.videos) || [];
export const heroThemeMatches = (config, theme) => config?.theme === 'light' ? ['light','custom'].includes(theme) : config?.theme === 'dark' ? ['dark','hacker'].includes(theme) : true;