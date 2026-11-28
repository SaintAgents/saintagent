import React from 'react';
import { ChevronDown, Folder, FolderClosed, LayoutGrid, Pencil, Plus, Star, Trash2 } from 'lucide-react';

export default function DockFolders({ prefs, commit, openModal, showFolders }) {
  return <section className="dock-folders">
    <div className="dock-folder-bar">
      <button type="button" className="dock-folder-toggle" aria-expanded={prefs.folders || showFolders} onClick={() => commit({folders:!prefs.folders})}><LayoutGrid size={14} /> Deck folders <ChevronDown size={12} className={prefs.folders ? '' : '-rotate-90'} /></button>
      <span className="dock-caption">{prefs.decks.length} of 20</span>
      <div className="dock-folder-actions">
        <button type="button" className="dock-icon-button" aria-label="Rename deck" title="Rename deck" onClick={() => openModal('rename')}><Pencil size={13} /></button>
        <button type="button" className="dock-icon-button" aria-label="Delete deck" title="Delete deck" disabled={prefs.decks.length <= 1} onClick={() => openModal('delete')}><Trash2 size={13} /></button>
        <button type="button" className="dock-icon-button dock-add-folder" aria-label="New deck" title="New deck" disabled={prefs.decks.length >= 20} onClick={() => openModal('new')}><Plus size={14} /></button>
      </div>
    </div>
    {(prefs.folders || showFolders) && <div className="dock-folder-grid">{prefs.decks.map((deck, index) => {
      const cards = prefs.cards.filter(c => c.deck === deck.id && c.place === 'deck');
      const Glyph = deck.icon === '★' ? Star : FolderClosed;
      return <button type="button" key={deck.id} className="dock-chip" aria-pressed={prefs.active === deck.id} onClick={() => commit({active:deck.id})} data-dock-folder={deck.id}>
        <span className="dock-folder-heading">
          <strong className="dock-folder-name">{deck.icon && !['▦','★'].includes(deck.icon) ? <span className="dock-folder-mark" aria-hidden="true">{deck.icon}</span> : <Glyph size={19} className="dock-folder-icon" aria-hidden="true" />}<span className="truncate">{deck.name}</span></strong>
          <span className="dock-folder-number"><span className="sr-only">Folder </span>#{index + 1}</span>
        </span>
        <span className="dock-folder-count"><Folder size={12} /> {cards.length} {cards.length === 1 ? 'widget' : 'widgets'}</span>
        {prefs.folders && cards.length > 0 && <ul className="dock-folder-widgets">{cards.slice(0,3).map(c => <li key={c.id} className="truncate">· {c.settings.title || c.type}</li>)}</ul>}
      </button>;
    })}</div>}
  </section>;
}