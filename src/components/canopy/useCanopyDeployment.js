import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

const sessions = new Map();
const stepDown = { split:'peek', full:'peek', peek:'closed', closed:'closed' };
const stepUp = { closed:'peek', peek:'full', full:'peek', split:'full' };
const isSimple = () => localStorage.getItem('deckViewMode') === 'simple';

export default function useCanopyDeployment(userId, pathname, settings, sidebarCollapsed, sidebarWidth, topbarCollapsed) {
  const session = sessions.get(userId) || { mode:'closed', recent:[] };
  sessions.set(userId, session);
  const [mode, setCurrent] = useState(session.mode);
  const [simple, setSimple] = useState(isSimple);
  const [viewport, setViewport] = useState(() => window.innerWidth);
  const [dock, setDock] = useState({ left:0, right:0 });
  const [draft, setDraft] = useState({});
  const root = useRef(null), gesture = useRef(null), suppressClick = useRef(false);
  const desktop = viewport >= 768;
  const showHandle = desktop && !simple;
  const enabled = desktop && (showHandle || mode !== 'closed');
  const sidebar = sidebarCollapsed ? 64 : viewport >= 1024 ? sidebarWidth : 256;
  const available = viewport - Math.max(sidebar, dock.left) - dock.right;
  const split = draft.split ?? settings.split;
  const splitWidth = Math.max(0, Math.min(split, available - (available > 580 ? 320 : 220)));
  const height = draft.height ?? settings.height, width = draft.width ?? settings.width;
  const setMode = useCallback(next => { session.mode = next; setCurrent(next); }, [session]);
  useLayoutEffect(() => {
    const parent = root.current?.parentElement;
    if (!parent || !enabled) return;
    parent.style.setProperty('--canopy-offset', '36px');
    parent.style.setProperty('--canopy-page-top', `${(topbarCollapsed ? 32 : 112) + 36}px`);
    if (mode === 'split') {
      parent.style.setProperty('--canopy-split-extra', `${splitWidth}px`);
      parent.style.setProperty('--canopy-dock-right', `${dock.right}px`);
      parent.setAttribute('data-canopy-split', '');
    }
    return () => { ['--canopy-offset','--canopy-page-top','--canopy-split-extra','--canopy-dock-right'].forEach(key => parent.style.removeProperty(key)); parent.removeAttribute('data-canopy-split'); };
  }, [enabled, mode, splitWidth, dock.right, topbarCollapsed]);
  useEffect(() => {
    const change = e => {
      const nextSimple = e.detail.viewMode === 'simple';
      setSimple(nextSimple);
      if (nextSimple) setMode('closed');
    };
    const resize = () => setViewport(window.innerWidth);
    const scan = () => { const d = {left:0,right:0}; document.querySelectorAll('[data-canopy-dock]').forEach(el => { const side = el.dataset.canopyDock; d[side] = Math.max(d[side], Number.parseFloat(el.style.width) || 0); }); setDock(d); };
    scan(); document.addEventListener('sidePanelStateChange', scan); document.addEventListener('viewModeChange', change); window.addEventListener('resize', resize);
    return () => { document.removeEventListener('sidePanelStateChange', scan); document.removeEventListener('viewModeChange', change); window.removeEventListener('resize', resize); };
  }, [pathname, setMode]);
  useEffect(() => { session.recent = [pathname, ...session.recent.filter(p => p !== pathname)].slice(0, 7); }, [pathname, session]);
  useEffect(() => {
    if (!desktop) { setMode('closed'); return; }
    if (mode === 'closed') return;
    let timer;
    const reset = () => { if (!settings.auto) return; clearTimeout(timer); timer = setTimeout(() => setMode(stepDown[mode]), 90000); };
    const key = e => { if (e.key === 'Escape' && !e.defaultPrevented && !document.querySelector('[role="dialog"]')) setMode(stepDown[mode]); };
    const activity = ['pointermove','pointerdown','keydown','scroll'];
    window.addEventListener('keydown', key); if (settings.auto) activity.forEach(name => window.addEventListener(name, reset, true)); reset();
    return () => { clearTimeout(timer); window.removeEventListener('keydown', key); activity.forEach(name => window.removeEventListener(name, reset, true)); };
  }, [desktop, mode, settings.auto, setMode]);
  return { desktop, showHandle, enabled, root, mode, setMode, recent:session.recent, width, split, height,
    style:{ '--canopy-left':`${mode === 'split' ? Math.max(sidebar,dock.left) : sidebar}px`, '--canopy-right':`${dock.right + (dock.right ? 28 : 32)}px`, '--canopy-width':`${width}px`, '--canopy-height':`${height}px`, '--canopy-split':`${splitWidth}px` },
    resize(key, value, done, commit) { if (done) { if (value !== settings[key]) commit({[key]:value}); setDraft(prev => ({...prev,[key]:undefined})); } else setDraft(prev => ({...prev,[key]:value})); },
    handle:{ onClick:() => { if (!suppressClick.current) setMode(stepUp[mode]); suppressClick.current = false; }, onPointerDown:e => { if (e.button !== 0) return; suppressClick.current = false; gesture.current = e.clientY; e.currentTarget.setPointerCapture(e.pointerId); }, onPointerCancel:() => { gesture.current = null; }, onPointerUp:e => { if (gesture.current === null) return; const dy=e.clientY-gesture.current; gesture.current=null; if (Math.abs(dy)>28) { suppressClick.current=true; setMode(dy<0 ? stepDown[mode] : mode==='full' ? mode : stepUp[mode]); } } },
  };
}