import React from 'react';
import { Button } from '@/components/ui/button';

export default function DockFolders({ prefs, commit, openModal, drag, drop }) {
  return <section className="dock-folders">
    <div className="flex flex-wrap items-center gap-1">
      <Button size="sm" variant="ghost" aria-expanded={prefs.folders} onClick={() => commit({folders:!prefs.folders})}>Deck folders {prefs.folders ? '▾' : '▸'}</Button>
      <Button size="sm" variant="ghost" disabled={prefs.decks.length >= 20} onClick={() => openModal('new')}>New deck</Button>
      <Button size="sm" variant="ghost" onClick={() => openModal('rename')}>Rename</Button>
      <Button size="sm" variant="ghost" disabled={prefs.decks.length <= 1} onClick={() => openModal('delete')}>Delete deck</Button>
    </div>
    {(prefs.folders || drag) && <div className="flex flex-wrap gap-2 pt-2">{prefs.decks.map(deck => {
      const cards = prefs.cards.filter(c => c.deck === deck.id && c.place === 'deck');
      return <button type="button" key={deck.id} className="dock-chip" aria-pressed={prefs.active === deck.id} onClick={() => commit({active:deck.id})} onDragOver={e => { if (drag) e.preventDefault(); }} onDrop={e => { if (drag) drop(e, deck.id); }}>
        <strong><span aria-hidden="true">{deck.icon}</span> {deck.name}</strong> · {cards.length}
        {!drag && cards.length > 0 && <small className="block max-w-44 truncate">{cards.slice(0,3).map(c => c.settings.title || c.type).join(', ')}</small>}
      </button>;
    })}</div>}
  </section>;
}