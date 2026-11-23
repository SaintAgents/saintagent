import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, ChevronRight, Droplet, FolderClosed, Plus, Settings2, UserRound, Users, Video, VideoOff } from 'lucide-react';

const logo = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/8c39339ab_logo.png';

export default function DockHeader({ prefs, deck, commit, close, openModal, compactLauncher }) {
  const VideoIcon = prefs.video ? Video : VideoOff;
  const saveIntensity = e => {
    const opacity = Number(e.currentTarget.value);
    if (opacity !== prefs.opacity) commit({opacity});
  };
  return <header className="dock-header">
    <div className="dock-header-group dock-header-primary">
      <button type="button" className="dock-icon-button" aria-label="Collapse Dock Deck" title="Collapse Dock Deck" onClick={close}><ChevronRight size={16} /></button>
      <img className="dock-emblem" src={logo} alt="SaintAgent" />
      <button type="button" className="dock-icon-button" aria-label="Add Widget" title="Add Widget" onClick={() => openModal('library')}><Plus size={16} /></button>
      <h2 className="dock-current-deck" title={deck.name}>{(!deck.icon || deck.icon === '▦') ? <FolderClosed size={15} className="dock-folder-icon" aria-hidden="true" /> : <span className="dock-folder-mark" aria-hidden="true">{deck.icon}</span>}<span className="truncate">{deck.name}</span></h2>
    </div>
    <nav className="dock-header-group dock-header-tools" aria-label="Dock destinations and settings">
      <Link className="dock-icon-button" to="/Schedule" aria-label="Calendar" title="Calendar"><CalendarDays size={15} /></Link>
      <Link className="dock-icon-button" to="/Profiles" aria-label="Member Area" title="Member Area"><Users size={15} /></Link>
      <Link className="dock-icon-button" to="/Profile" aria-label="Profile" title="Profile"><UserRound size={15} /></Link>
      <button type="button" className="dock-icon-button" aria-label="Background video" title="Background video" aria-pressed={prefs.video} onClick={() => commit({video:!prefs.video})}><VideoIcon size={15} /></button>
      <label className="dock-video-level" title="Background video intensity"><Droplet size={14} aria-hidden="true" /><input type="range" aria-label="Background video intensity" min="0" max="100" defaultValue={prefs.opacity} disabled={!prefs.video} onInput={e => e.currentTarget.closest('.dock-panel').style.setProperty('--dock-video-opacity', e.currentTarget.value / 100)} onBlur={saveIntensity} onPointerUp={saveIntensity} onKeyUp={saveIntensity} /></label>
      <details className="dock-settings">
        <summary className="dock-icon-button" aria-label="Dock settings" title="Dock settings"><Settings2 size={15} /></summary>
        <div className="dock-settings-menu">
          <label><input type="checkbox" checked={prefs.beside} onChange={e => commit({beside:e.target.checked})} /> Show page beside deck</label>
          {!compactLauncher && <label><input type="checkbox" checked={prefs.label} onChange={e => commit({label:e.target.checked})} /> Launcher label</label>}
        </div>
      </details>
    </nav>
  </header>;
}