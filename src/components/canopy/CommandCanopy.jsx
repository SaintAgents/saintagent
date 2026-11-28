import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CanopyHeading from '@/components/canopy/CanopyHeading';
import { peek } from '@/components/canopy/canopyCatalog';
import useCanopySettings from '@/components/canopy/useCanopySettings';
import useCanopyDeployment from '@/components/canopy/useCanopyDeployment';
import CanopyResize from '@/components/canopy/CanopyResize';
import CanopyWorkspace from '@/components/canopy/CanopyWorkspace';
import CanopyOverlays from '@/components/canopy/CanopyOverlays';
import { openDeepDive } from '@/components/deepdive/deepDive';
import { canopySunrise, canopyNight } from '@/components/hero/canopyArtwork';
import { useSurfaceHeroes } from '@/components/hero/surfaceHeroSettings';
import '@/components/canopy/canopy.css';

import ActivityTicker from '@/components/live/ActivityTicker';

export default function CommandCanopy({ user, profile, sidebarCollapsed, sidebarWidth, topbarCollapsed, notifications, onSearch, onCreate, onToolbarControlChange }) {
  const { settings, commit, error, original, saved, viewSaved, saveView, toggleOriginal } = useCanopySettings(user);
  const location = useLocation(), navigate = useNavigate();
  const [overlay, setOverlay] = useState(null);
  const [focus, setFocus] = useState('');
  const hud = useCanopyDeployment(user.id, location.pathname, settings, sidebarCollapsed, sidebarWidth, topbarCollapsed);
  const { mode, setMode, desktop, enabled, root, style, recent } = hud;
  const focusFromToolbar = useRef(false);
  useEffect(() => {
    const expanded = mode !== 'closed';
    onToolbarControlChange?.({
      expanded,
      toggle: () => {
        focusFromToolbar.current = !expanded;
        setFocus('');
        setMode(expanded ? 'closed' : 'full');
      },
    });
    if (enabled && expanded && focusFromToolbar.current) {
      focusFromToolbar.current = false;
      root.current?.querySelector('#canopy-workspace .canopy-command-form input, #canopy-workspace .canopy-heading button')?.focus();
    }
  }, [desktop, enabled, mode, onToolbarControlChange, root, setMode]);
  function open(to, value) {
    if (to.startsWith('/')) { setFocus(''); setMode(desktop ? 'split' : 'closed'); navigate(to); return; }
    if (to === 'actions' || to === 'notes' || to === 'notifications') { setFocus(to); if (mode === 'closed' || (to === 'actions' && mode === 'peek')) setMode(to === 'actions' ? 'full' : 'peek'); return; }
    if (to === 'knowledge' || to === 'online') { setFocus(to); if (mode === 'closed' || mode === 'peek') setMode('full'); return; }
    setMode('closed');
    if (to === 'search') onSearch(value);
    else if (to === 'create') onCreate();
    else if (to === 'deep-dive' || to === 'research-cards' || to === 'research-insights') {
      [...document.querySelectorAll('#app-topbar [aria-controls="canopy-workspace"]')].find(button => button.getClientRects().length)?.focus();
      openDeepDive(to === 'deep-dive' ? value : { view: to === 'research-cards' ? 'cards' : 'insights' });
    }
    else if (to === 'assistant') document.dispatchEvent(new CustomEvent('openRightSideTab', { detail:{tab:'concierge'} }));
    else if (to === 'my-assistant') document.dispatchEvent(new Event('openMyAssistant'));
    else if (to === 'dock') document.dispatchEvent(new Event('openDockDeck'));
    else if (to === 'project-detail') document.dispatchEvent(new CustomEvent('openProjectDetail',{detail:{project:value}}));
    else setOverlay(to);
  }
  const unread = notifications.filter(n => !n.is_read).length;
  const ids = mode === 'peek' ? peek : settings.cards;
  const { hidden: hideBackgrounds } = useSurfaceHeroes();
  return <div ref={root} className="sa-canopy" data-canopy-mode={mode} style={style} hidden={!enabled}>
    {mode !== 'closed' && <section id="canopy-workspace" aria-label="Command Canopy workspace" className="canopy-workspace"
      data-canopy-art={!hideBackgrounds ? '' : undefined}
      style={{ '--canopy-sunrise': `url("${canopySunrise[1]}")`, '--canopy-night': `url("${canopyNight[1]}")` }}>
      <CanopyHeading {...{ mode, desktop, unread, open, setMode }} changeView={next => { setFocus(''); setMode(next); }} />
      <ActivityTicker placement="canopy" />
      <CanopyWorkspace activePath={location.pathname} onToggleOriginal={() => { setFocus(''); if (mode === 'peek') setMode('full'); toggleOriginal(); }}
        {...{ mode, enabled, ids, settings, commit, user, profile, notifications, recent, open, error, focus, original, saved, viewSaved, saveView }} />
      {!original && mode !== 'peek' && <CanopyResize className={mode === 'split' ? 'canopy-split-resize' : 'canopy-full-resize'} label={mode === 'split' ? 'Resize split panel' : 'Resize full Canopy'} value={mode === 'split' ? hud.split : hud.height} min={mode === 'split' ? 220 : hud.minHeight} max={mode === 'split' ? 720 : hud.maxHeight} direction={mode === 'split' ? 'left' : 'down'} onChange={(value, done) => hud.resize(mode === 'split' ? 'split' : 'height', value, done, commit)} />}
    </section>}
    {overlay && <CanopyOverlays type={overlay} profile={profile} close={() => setOverlay(null)} />}
  </div>;
}