import React from 'react';
import { Link } from 'react-router-dom';
import { PanelRightClose, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DockHeader({ prefs, deck, commit, close, openModal }) {
  return <header className="dock-header">
    <div className="flex flex-wrap items-center gap-2">
      <h2 className="mr-auto break-words text-lg font-semibold"><span aria-hidden="true">{deck.icon}</span> {deck.name}</h2>
      <Button size="sm" onClick={() => openModal('library')}><Plus /> Add Widget</Button>
      <Button size="icon" variant="outline" aria-label="Collapse Dock Deck" title="Collapse Dock Deck" onClick={close}><PanelRightClose /></Button>
    </div>
    <nav className="flex flex-wrap gap-3 text-sm" aria-label="Dock destinations">
      <Link to="/Schedule">Calendar</Link><Link to="/Profiles">Member Area</Link><Link to="/Profile">Profile</Link>
      <button type="button" onClick={() => openModal('drawer')}>Drawer</button>
    </nav>
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
      <label><input type="checkbox" checked={prefs.beside} onChange={e => commit({beside:e.target.checked})} /> Show page beside deck</label>
      <label><input type="checkbox" checked={prefs.label} onChange={e => commit({label:e.target.checked})} /> Launcher label</label>
      <label><input type="checkbox" checked={prefs.video} onChange={e => commit({video:e.target.checked})} /> Background video</label>
      <label className="inline-flex items-center gap-2">Background opacity <input type="range" min="0" max="100" defaultValue={prefs.opacity} onInput={e => e.currentTarget.closest('.dock-panel').style.setProperty('--dock-opacity', e.currentTarget.value / 100)} onBlur={e => { if (Number(e.target.value) !== prefs.opacity) commit({opacity:Number(e.target.value)}); }} onPointerUp={e => { if (Number(e.target.value) !== prefs.opacity) commit({opacity:Number(e.target.value)}); }} onKeyUp={e => { if (Number(e.target.value) !== prefs.opacity) commit({opacity:Number(e.target.value)}); }} /></label>
    </div>
  </header>;
}