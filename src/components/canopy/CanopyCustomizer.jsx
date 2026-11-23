import React, { useState } from 'react';
import { Check, GripVertical, Plus } from 'lucide-react';
import { descriptions, presets, widgets } from '@/components/canopy/canopyCatalog';

export default function CanopyCustomizer({ settings, commit, allowed, scale, setScale, move, dragHandle, dropTarget }) {
  const [query,setQuery] = useState(''), [group,setGroup] = useState(''), [size,setSize] = useState(false);
  const groupCards = (presets[group] || []).filter(allowed);
  const library = (group ? groupCards : widgets).filter(id => allowed(id) && `${id} ${descriptions[id] || ''}`.toLowerCase().includes(query.trim().toLowerCase()));
  const active = settings.cards.filter(allowed);
  const toggle = id => commit({cards:settings.cards.includes(id) ? settings.cards.filter(card => card !== id) : [...settings.cards,id]});
  return <div className="canopy-library" id="canopy-library">
    <div className="canopy-library-head"><h3>Canopy groups</h3><button onClick={() => setSize(!size)} aria-expanded={size}>Deck size & settings</button></div>
    {size && <div className="canopy-tabs canopy-size-controls"><label>Handle <select value={settings.form} onChange={e => commit({form:e.target.value})}><option value="bar">Full bar</option><option value="chevron">Chevron</option></select></label><label><input type="checkbox" checked={settings.auto} onChange={e => commit({auto:e.target.checked})} /> Auto-fold</label><label>Tile scale <input type="range" min="60" max="150" value={scale ?? settings.scale} onChange={e => setScale(+e.target.value)} onPointerUp={() => { if (scale !== null) commit({scale}); setScale(null); }} onKeyUp={() => { if (scale !== null) commit({scale}); setScale(null); }} /> {scale ?? settings.scale}%</label></div>}
    <div className="canopy-tabs canopy-pills" aria-label="Widget groups"><button aria-pressed={!group} onClick={() => setGroup('')}>All widgets</button>{Object.keys(presets).map(name => <button key={name} aria-pressed={group === name} onClick={() => setGroup(name)}>{name}</button>)}{group && <button disabled={groupCards.every(id => settings.cards.includes(id))} onClick={() => commit({cards:[...new Set([...settings.cards,...groupCards])]})}>Add group</button>}</div>
    <div className="canopy-active"><h3>In your Canopy · {active.length}</h3><div className="canopy-tabs canopy-pills" aria-label="Widget order">{active.map((id,index) => <button key={id} type="button" title={`Reorder ${id} with the arrow keys or by dragging`} {...dragHandle(id)} {...dropTarget(id)} onKeyDown={e => { const direction = {ArrowLeft:-1, ArrowRight:1}[e.key]; if (!direction) return; e.preventDefault(); if (active[index+direction]) move(id,active[index+direction]); }}><GripVertical size={12} />{id}</button>)}</div>{!active.length && <p>No active widgets yet.</p>}</div>
    <h3>Widget library · {library.length}</h3>
    <input className="canopy-widget-search" aria-label="Search widgets" placeholder="Find a widget…" value={query} onChange={e => setQuery(e.target.value)} />
    <div className="canopy-library-list">{library.length ? library.map(id => <button className="canopy-library-item" key={id} onClick={() => toggle(id)} aria-pressed={settings.cards.includes(id)}><span><strong>{id}</strong><small>{descriptions[id] || 'Open related SaintAgent tools.'}</small></span>{settings.cards.includes(id) ? <Check size={15} /> : <Plus size={15} />}</button>) : <p>No widgets match your search.</p>}</div>
    <button className="canopy-clear" disabled={!active.length} onClick={() => commit({cards:settings.cards.filter(id => !allowed(id))})}>Turn off all cards</button>
  </div>;
}