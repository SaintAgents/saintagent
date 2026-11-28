import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { icons, links, widgetLabel, widgetLibrary } from '@/components/dock/dockCatalog';

export default function DockDialogs({ modal, close, prefs, deck, cards, actions, revealCard }) {
  const [duplicate, setDuplicate] = useState('');
  const [name, setName] = useState(modal === 'rename' ? deck.name : '');
  const [icon, setIcon] = useState(modal === 'rename' ? deck.icon : icons[0]);
  const [shortcuts, setShortcuts] = useState(prefs.shortcuts);
  const title = {library:'Add Widget', drawer:'Drawer', new:'New deck folder', rename:'Rename deck', delete:'Delete deck', shortcuts:'Edit Quick Access'}[modal];
  return <Dialog open onOpenChange={value => { if (!value) close(); }}><DialogContent data-readable-surface className="z-[10009] max-h-[85dvh] overflow-y-auto">
    <DialogTitle>{title}</DialogTitle><DialogDescription>{modal === 'drawer' ? `Archived widgets are kept here until you restore, move, or delete them. Restore returns a widget to ${deck.name}.` : modal === 'delete' ? 'Widgets from this deck move to the Drawer.' : 'Customize your Dock Deck.'}</DialogDescription>
    {modal === 'library' && <div className="grid gap-2">{Object.entries(widgetLibrary).map(([type, description]) => {
      const elsewhere = cards.some(c => c.type === type && c.deck !== deck.id && c.place !== 'drawer');
      return <div key={type} className="flex items-start justify-between gap-3 rounded-md border p-2 text-sm">
        <div><strong>{widgetLabel(type)}</strong><p>{description}</p>{elsewhere && <p>Already on another deck.</p>}</div>
        <Button size="sm" onClick={() => { if (elsewhere && duplicate !== type) { setDuplicate(type); return; } actions.add(type); close(); }}>{duplicate === type ? 'Add anyway' : 'Add'}</Button>
      </div>;
    })}</div>}
    {modal === 'drawer' && <div className="grid gap-2">{cards.filter(c => c.place === 'drawer').length === 0 && <p>The Drawer is empty.</p>}{cards.filter(c => c.place === 'drawer').map(c => <div className="flex flex-wrap items-center gap-2 border-b pb-2 text-sm" key={c.id}>
      <strong className="mr-auto">{c.settings.title || widgetLabel(c.type)}</strong><Button size="sm" onClick={() => { actions.restore(c.id); close(); revealCard(c.id); }}>Restore</Button>
      <select aria-label={`Move ${c.type} to deck`} value="" onChange={e => { if(e.target.value) actions.restore(c.id, e.target.value); }}><option value="">Move to…</option>{prefs.decks.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
      <Button size="sm" variant="outline" onClick={() => { if (window.confirm(`Permanently delete ${c.settings.title || c.type}?`)) actions.remove(c.id); }}>Delete</Button>
    </div>)}</div>}
    {(modal === 'new' || modal === 'rename') && <form className="grid gap-3" onSubmit={e => {e.preventDefault(); if (name.trim()) { actions.saveDeck(name.trim(),icon,modal); close(); }}}>
      <label className="grid gap-1">Deck name <input autoFocus required maxLength={40} className="rounded-md border bg-background p-2" value={name} onChange={e => setName(e.target.value)} /></label>
      <label>Icon <select value={icon} onChange={e => setIcon(e.target.value)}>{icons.map(i => <option key={i}>{i}</option>)}</select></label><Button type="submit">Save deck</Button>
    </form>}
    {modal === 'delete' && <Button variant="destructive" onClick={() => {actions.deleteDeck(); close();}}>Delete {deck.name}</Button>}
    {modal === 'shortcuts' && <form className="grid gap-2" onSubmit={e => {e.preventDefault(); actions.shortcuts(shortcuts); close();}}>{Object.keys(links).map(label => <label key={label}><input type="checkbox" checked={shortcuts.includes(label)} onChange={e => setShortcuts(e.target.checked ? [...shortcuts,label] : shortcuts.filter(x => x !== label))} /> {label}</label>)}<Button type="submit">Save shortcuts</Button></form>}
  </DialogContent></Dialog>;
}