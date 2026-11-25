import { useEffect, useState } from 'react';
import { openSurfaceHero, routeHeroKey, toggleSurfaceHeroes, useSurfaceHeroes } from '@/components/hero/surfaceHeroSettings';
import SurfaceHeroEditor from '@/components/hero/SurfaceHeroEditor';
import '@/components/hero/surfaceHero.css';

export function HeroQuickToggle({ className }) {
  const state = useSurfaceHeroes(), [error, setError] = useState(false);
  return <div className={className}><button type="button" aria-pressed={!state.hidden} onClick={() => { try { toggleSurfaceHeroes(); setError(false); } catch { setError(true); } }}>{state.hidden ? 'Show backgrounds' : 'Hide backgrounds'}</button>{error && <p role="alert">Could not save background visibility.</p>}</div>;
}

export default function SurfaceHeroControls({ page, theme }) {
  const [request, setRequest] = useState(null);
  useEffect(() => {
    const open = event => setRequest(current => current || event.detail);
    window.addEventListener('openSurfaceHero', open);
    return () => window.removeEventListener('openSurfaceHero', open);
  }, []);
  const pageKey = routeHeroKey(page);
  const targets = [[pageKey, request?.surface === pageKey ? request.label : `${page.replace(/([a-z0-9])([A-Z])/g, '$1 $2')} · This page`], ['all', 'All pages'], ['dock', 'Dock Deck'], ['sidebar', 'Side navigation']];
  return request && <SurfaceHeroEditor request={request} targets={targets} theme={theme} close={() => setRequest(null)} />;
}

export function openPageHero(page, options) {
  openSurfaceHero(routeHeroKey(page), `${page.replace(/([a-z0-9])([A-Z])/g, '$1 $2')} · This page`, options);
}