import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, ChevronUp, Mail, PanelRight, X } from 'lucide-react';
import DockDeckIcon from '@/components/dock/DockDeckIcon';
import { shortcuts, peek } from '@/components/canopy/canopyCatalog';
import useCanopySettings from '@/components/canopy/useCanopySettings';
import useCanopyDeployment from '@/components/canopy/useCanopyDeployment';
import CanopyResize from '@/components/canopy/CanopyResize';
import CanopyWorkspace from '@/components/canopy/CanopyWorkspace';
import CanopyOverlays from '@/components/canopy/CanopyOverlays';
import '@/components/canopy/canopy.css';

export default function CommandCanopy({ user, profile, sidebarCollapsed, sidebarWidth, topbarCollapsed, notifications, onSearch, onCreate, onToolbarControlChange }) {
  const { settings, commit, error } = useCanopySettings(user);
  const location = useLocation(), navigate = useNavigate();
  const [overlay, setOverlay] = useState(null);
  const [focus, setFocus] = useState('');
  const hud = useCanopyDeployment(user.id, location.pathname, settings, sidebarCollapsed, sidebarWidth, topbarCollapsed);
  const { mode, setMode, desktop, showHandle, enabled, root, style, recent, handle } = hud;
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
    setMode('closed');
    if (to === 'search') onSearch(value);
    else if (to === 'create') onCreate();
    else if (to === 'assistant') document.dispatchEvent(new CustomEvent('openRightSideTab', { detail:{tab:'concierge'} }));
    else if (to === 'my-assistant') document.dispatchEvent(new Event('openMyAssistant'));
    else if (to === 'dock') document.dispatchEvent(new Event('openDockDeck'));
    else if (to === 'project-detail') document.dispatchEvent(new CustomEvent('openProjectDetail',{detail:{project:value}}));
    else setOverlay(to);
  }
  const unread = notifications.filter(n => !n.is_read).length;
  const ids = mode === 'peek' ? peek : settings.cards;
  return <div ref={root} className="sa-canopy" data-canopy-mode={mode} style={style} hidden={!enabled}>
    {showHandle && mode !== 'split' && <div className="canopy-handle" data-form={settings.form}>
      <button type="button" aria-label="Command Canopy" aria-expanded={mode !== 'closed'} aria-controls="canopy-workspace" className="canopy-notch" {...handle}>
        {mode === 'full' ? <ChevronUp size={17} /> : <ChevronDown size={17} />}{settings.form === 'bar' && 'Command Canopy'}
      </button>
      {settings.form === 'bar' && <><div className="canopy-handle-links">{shortcuts.map(([label, target]) => <button key={label} onClick={() => open(target)}>{target === 'notifications' && <Bell size={13} />}{label}{target === 'notifications' && unread > 0 && <b>{unread}</b>}</button>)}</div><CanopyResize className="canopy-handle-resize" label="Resize Canopy handle" value={hud.width} min={380} max={1600} direction="right" onChange={(value, done) => hud.resize('width', value, done, commit)} /></>}
    </div>}
    {mode !== 'closed' && <section id="canopy-workspace" aria-label="Command Canopy workspace" className="canopy-workspace">
      <div className="canopy-heading"><strong>SaintAgent Command Canopy</strong><div><button onClick={() => open('/Messages')} aria-label="Inbox" title="Inbox"><Mail size={15} /></button><button onClick={() => open('notifications')} aria-label="Notifications" title="Notifications"><Bell size={15} />{unread > 0 && <b>{unread}</b>}</button><button onClick={() => { setFocus(''); setMode(mode === 'full' ? 'peek' : 'full'); }}>{mode === 'full' ? 'Peek' : 'Full view'}</button><button onClick={() => setMode(mode === 'split' ? 'full' : 'split')} aria-label={mode === 'split' ? 'Exit split view' : 'Open split view'} title={mode === 'split' ? 'Exit split view' : 'Open split view'}><PanelRight size={15} /></button><button onClick={() => open('dock')} aria-label="Open Dock Deck" title="Open Dock Deck"><DockDeckIcon /></button><button onClick={() => setMode('closed')} aria-label="Close Canopy" title="Close Canopy"><X size={15} /></button></div></div>
      <CanopyWorkspace activePath={location.pathname} {...{ mode, ids, settings, commit, user, profile, notifications, recent, open, error, focus }} />
      {mode !== 'peek' && <CanopyResize className={mode === 'split' ? 'canopy-split-resize' : 'canopy-full-resize'} label={mode === 'split' ? 'Resize split panel' : 'Resize full Canopy'} value={mode === 'split' ? hud.split : hud.height} min={mode === 'split' ? 220 : 280} max={mode === 'split' ? 720 : 940} direction={mode === 'split' ? 'left' : 'down'} onChange={(value, done) => hud.resize(mode === 'split' ? 'split' : 'height', value, done, commit)} />}
    </section>}
    {overlay && <CanopyOverlays type={overlay} profile={profile} close={() => setOverlay(null)} />}
  </div>;
}