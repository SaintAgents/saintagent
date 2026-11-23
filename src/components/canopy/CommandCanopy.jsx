import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Mail, PanelRight, X } from 'lucide-react';
import DockDeckIcon from '@/components/dock/DockDeckIcon';
import { peek } from '@/components/canopy/canopyCatalog';
import useCanopySettings from '@/components/canopy/useCanopySettings';
import useCanopyDeployment from '@/components/canopy/useCanopyDeployment';
import CanopyResize from '@/components/canopy/CanopyResize';
import CanopyWorkspace from '@/components/canopy/CanopyWorkspace';
import CanopyOverlays from '@/components/canopy/CanopyOverlays';
import { openDeepDive } from '@/components/deepdive/deepDive';
import '@/components/canopy/canopy.css';

import ActivityTicker from '@/components/live/ActivityTicker';

export default function CommandCanopy({ user, profile, sidebarCollapsed, sidebarWidth, topbarCollapsed, notifications, onSearch, onCreate, onToolbarControlChange }) {
  const { settings, commit, error } = useCanopySettings(user);
  const location = useLocation(), navigate = useNavigate();
  const [overlay, setOverlay] = useState(null);
  const [focus, setFocus] = useState('');
  const hud = useCanopyDeployment(user.id, location.pathname, settings, sidebarCollapsed, sidebarWidth, topbarCollapsed);
  const { mode, setMode, desktop, enabled, root, style, recent } = hud;
  const focusFromToolbar = useRef(false);
  useEffect(() => {
    const expanded = mode !== 'closed';
    onToolbarControlChange?.(desktop ? {
      expanded,
      toggle: () => {
        focusFromToolbar.current = !expanded;
        setFocus('');
        setMode(expanded ? 'closed' : 'full');
      },
    } : null);
    if (enabled && expanded && focusFromToolbar.current) {
      focusFromToolbar.current = false;
      root.current?.querySelector('#canopy-workspace .canopy-command-form input, #canopy-workspace .canopy-heading button')?.focus();
    }
  }, [desktop, enabled, mode, onToolbarControlChange, root, setMode]);
  function open(to, value) {
    if (to.startsWith('/')) { setFocus(''); setMode('split'); navigate(to); return; }
    if (to === 'actions' || to === 'notes' || to === 'notifications') { setFocus(to); if (mode === 'closed' || (to === 'actions' && mode === 'peek')) setMode(to === 'actions' ? 'full' : 'peek'); return; }
    if (to === 'knowledge') { setFocus(to); if (mode === 'closed' || mode === 'peek') setMode('full'); return; }
    setMode('closed');
    if (to === 'search') onSearch(value);
    else if (to === 'create') onCreate();
    else if (to === 'deep-dive' || to === 'research-cards' || to === 'research-insights') {
      document.querySelector('#app-topbar [aria-controls="canopy-workspace"]')?.focus();
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
  return <div ref={root} className="sa-canopy" data-canopy-mode={mode} style={style} hidden={!enabled}>
    {mode !== 'closed' && <section id="canopy-workspace" aria-label="Command Canopy workspace" className="canopy-workspace">
      <div className="canopy-heading"><strong>SaintAgent Command Canopy</strong><div><button onClick={() => open('/Messages')} aria-label="Inbox" title="Inbox"><Mail size={15} /></button><button onClick={() => open('notifications')} aria-label="Notifications" title="Notifications"><Bell size={15} />{unread > 0 && <b>{unread}</b>}</button><button onClick={() => { setFocus(''); setMode(mode === 'full' ? 'peek' : 'full'); }}>{mode === 'full' ? 'Peek' : 'Full view'}</button><button onClick={() => setMode(mode === 'split' ? 'full' : 'split')} aria-label={mode === 'split' ? 'Exit split view' : 'Open split view'} title={mode === 'split' ? 'Exit split view' : 'Open split view'}><PanelRight size={15} /></button><button onClick={() => open('dock')} aria-label="Open Dock Deck" title="Open Dock Deck"><DockDeckIcon /></button><button onClick={() => setMode('closed')} aria-label="Close Canopy" title="Close Canopy"><X size={15} /></button></div></div>
      <ActivityTicker placement="canopy" />
      <CanopyWorkspace activePath={location.pathname} {...{ mode, enabled, ids, settings, commit, user, profile, notifications, recent, open, error, focus }} />
      {mode !== 'peek' && <CanopyResize className={mode === 'split' ? 'canopy-split-resize' : 'canopy-full-resize'} label={mode === 'split' ? 'Resize split panel' : 'Resize full Canopy'} value={mode === 'split' ? hud.split : hud.height} min={mode === 'split' ? 220 : 280} max={mode === 'split' ? 720 : 940} direction={mode === 'split' ? 'left' : 'down'} onChange={(value, done) => hud.resize(mode === 'split' ? 'split' : 'height', value, done, commit)} />}
    </section>}
    {overlay && <CanopyOverlays type={overlay} profile={profile} close={() => setOverlay(null)} />}
  </div>;
}