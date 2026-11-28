import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { COLLAPSED_SIDEBAR_WIDTH } from '@/components/hud/SidebarResizeHandle';
import { defaults } from '@/components/canopy/canopyCatalog';

const sessions = new Map();
const stepDown = { split:'peek', full:'peek', peek:'closed', closed:'closed' };


export default function useCanopyDeployment(userId, pathname, settings, sidebarCollapsed, sidebarWidth, topbarCollapsed) {
  const session = sessions.get(userId) || { mode:'closed', recent:[] };
  sessions.set(userId, session);
  const [mode, setCurrent] = useState(session.mode);
  const [viewport, setViewport] = useState(() => window.innerWidth);
  const [dock, setDock] = useState({ left:0, right:0 });
  const [draft, setDraft] = useState({});
  const root = useRef(null);
  const desktop = viewport >= 768;
  const enabled = mode !== 'closed';
  const sidebar = sidebarCollapsed ? COLLAPSED_SIDEBAR_WIDTH : viewport >= 1024 ? sidebarWidth : 256;
  const available = viewport - Math.max(sidebar, dock.left) - dock.right;
  const split = draft.split ?? settings.split;
  const splitWidth = Math.max(0, Math.min(split, available - (available > 580 ? 320 : 220)));
  const [maxHeight, setMaxHeight] = useState(() => Math.max(1, window.innerHeight - 56));
  const minHeight = Math.min(280, maxHeight);
  const preferredHeight = draft.height ?? (settings.height === defaults.height ? undefined : settings.height);
  const height = Math.max(minHeight, Math.min(maxHeight, preferredHeight ?? maxHeight));
  useLayoutEffect(() => {
    if (mode !== 'full') return;
    const topbar = document.getElementById('app-topbar');
    const measure = () => {
      const top = topbar?.getBoundingClientRect().bottom ?? 56;
      const bottomInset = parseFloat(window.getComputedStyle(root.current).scrollPaddingBottom) || 0;
      setMaxHeight(Math.max(1, Math.floor(window.innerHeight - top - bottomInset)));
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (topbar) observer.observe(topbar);
    window.addEventListener('resize', measure);
    return () => { observer.disconnect(); window.removeEventListener('resize', measure); };
  }, [mode]);
  const setMode = useCallback(next => { session.mode = next; setCurrent(next); }, [session]);
  useLayoutEffect(() => {
    const parent = root.current?.parentElement;
    if (!parent || !desktop || !enabled || mode !== 'split') return;
    parent.style.setProperty('--canopy-split-extra', `${splitWidth}px`);
    parent.style.setProperty('--canopy-dock-right', `${dock.right}px`);
    parent.setAttribute('data-canopy-split', '');
    return () => { ['--canopy-split-extra','--canopy-dock-right'].forEach(key => parent.style.removeProperty(key)); parent.removeAttribute('data-canopy-split'); };
  }, [desktop, enabled, mode, splitWidth, dock.right]);
  useEffect(() => {
    const change = e => {
      if (e.detail.viewMode === 'simple') setMode('closed');
    };
    const resize = () => setViewport(window.innerWidth);
    const scan = () => { const d = {left:0,right:Number.parseFloat(document.documentElement.style.getPropertyValue('--dock-occupied')) || 0}; document.querySelectorAll('[data-canopy-dock]').forEach(el => { const side = el.dataset.canopyDock; d[side] = Math.max(d[side], Number.parseFloat(el.style.width) || 0); }); setDock(d); };
    scan(); document.addEventListener('dockDeckWidthChange', scan); document.addEventListener('sidePanelStateChange', scan); document.addEventListener('viewModeChange', change); window.addEventListener('resize', resize);
    return () => { document.removeEventListener('dockDeckWidthChange', scan); document.removeEventListener('sidePanelStateChange', scan); document.removeEventListener('viewModeChange', change); window.removeEventListener('resize', resize); };
  }, [pathname, setMode]);
  useEffect(() => { session.recent = [pathname, ...session.recent.filter(p => p !== pathname)].slice(0, 7); }, [pathname, session]);
  useEffect(() => {
    if (!desktop && mode === 'split') { setMode('full'); return; }
    if (mode === 'closed') return;
    let timer;
    const reset = () => { if (!settings.auto) return; clearTimeout(timer); timer = setTimeout(() => setMode(stepDown[mode]), 90000); };
    const key = e => { if (e.key === 'Escape' && !e.defaultPrevented && !document.querySelector('[role="dialog"]')) setMode(stepDown[mode]); };
    const activity = ['pointermove','pointerdown','keydown','scroll'];
    window.addEventListener('keydown', key); if (settings.auto) activity.forEach(name => window.addEventListener(name, reset, true)); reset();
    return () => { clearTimeout(timer); window.removeEventListener('keydown', key); activity.forEach(name => window.removeEventListener(name, reset, true)); };
  }, [desktop, mode, settings.auto, setMode]);
  return { desktop, enabled, root, mode, setMode, recent:session.recent, split, height, minHeight, maxHeight,
    style:{ '--canopy-left':`${mode === 'full' || mode === 'split' ? Math.max(sidebar,dock.left) : sidebar}px`, '--canopy-right':`${dock.right + (dock.right ? 28 : 32)}px`, '--canopy-top':topbarCollapsed ? '40px' : '56px', '--canopy-split':`${splitWidth}px`, '--canopy-full-top':`calc(${topbarCollapsed ? desktop ? 40 : 44 : 56}px + env(safe-area-inset-top, 0px))`, '--canopy-full-height':preferredHeight == null ? '100dvh' : `${Math.max(minHeight, preferredHeight)}px` },
    resize(key, value, done, commit) { if (done) { const next = key === 'height' && value >= maxHeight ? defaults.height : value; if (next !== settings[key]) commit({[key]:next}); setDraft(prev => ({...prev,[key]:undefined})); } else setDraft(prev => ({...prev,[key]:value})); },
  };
}