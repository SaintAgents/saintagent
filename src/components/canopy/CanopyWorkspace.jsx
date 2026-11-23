import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, Minus, Plus, X } from 'lucide-react';
import { actions, presets, tabs, widgets } from '@/components/canopy/canopyCatalog';
import CanopyWidget from '@/components/canopy/CanopyWidget';
import CanopyResize from '@/components/canopy/CanopyResize';

export default function CanopyWorkspace(props) {
  const { mode, ids, settings, commit, user, profile, open, error, focus } = props;
  const [query, setQuery] = useState(''), [library, setLibrary] = useState(false), [sizes, setSizes] = useState({});
  const [scale, setScale] = useState(null);
  const editable = mode !== 'peek';
  const allowed = id => id !== 'Contact Card' || !!profile;
  const special = focus === 'notes' ? 'Quick Notes' : focus === 'notifications' ? 'Notifications' : null;
  const visible = ids.filter(allowed);
  const tile = id => <CanopyWidget key={id} id={id} {...props} />;
  function reorder({ source, destination }) {
    if (!destination || source.index === destination.index) return;
    const cards = [...settings.cards];
    const from = cards.indexOf(visible[source.index]);
    const to = cards.indexOf(visible[destination.index]);
    cards.splice(to, 0, ...cards.splice(from, 1)); commit({cards});
  }
  return <div className="canopy-scroll">
    {editable && <><nav aria-label="Canopy destinations" className="canopy-tabs">{tabs.filter(([label]) => label !== 'Treasury' || user.role === 'admin').map(([label, target]) => <button key={label} onClick={() => open(target)}>{label}</button>)}</nav>
      <div className="canopy-tabs canopy-tools"><button aria-expanded={library} onClick={() => setLibrary(!library)}>Customize</button><label>Preset <select value="" onChange={e => e.target.value && commit({cards:presets[e.target.value].filter(allowed)})}><option value="">Choose group</option>{Object.keys(presets).map(name => <option key={name}>{name}</option>)}</select></label></div>
      {library && <div className="canopy-library"><div className="canopy-tabs"><label>Handle <select value={settings.form} onChange={e => commit({form:e.target.value})}><option value="bar">Full bar</option><option value="chevron">Chevron</option></select></label><label><input type="checkbox" checked={settings.auto} onChange={e => commit({auto:e.target.checked})} /> Auto-fold</label><label>Scale {scale ?? settings.scale}% <input type="range" min="60" max="150" value={scale ?? settings.scale} onChange={e => setScale(+e.target.value)} onPointerUp={() => { if (scale !== null) commit({scale}); setScale(null); }} onKeyUp={() => { if (scale !== null) commit({scale}); setScale(null); }} /></label></div>
      <input aria-label="Search widgets" placeholder="Find a widget to add" value={query} onChange={e => setQuery(e.target.value)} /><div className="canopy-tabs">{widgets.filter(id => allowed(id) && !settings.cards.includes(id) && id.toLowerCase().includes(query.toLowerCase())).map(id => <button key={id} onClick={() => commit({cards:[...settings.cards,id]})}>+ {id}</button>)}</div></div>}
    </>}
    {error && <p role="status" className="canopy-status">Saved on this device; account sync failed. <button onClick={() => commit({})}>Retry sync</button></p>}
    {focus === 'actions' && <div className="canopy-action-grid">{actions.map(([label,target]) => <button key={label} onClick={() => open(target)}>{label}</button>)}</div>}
    {special && <div className="canopy-focus" key={special}><h3>{special}</h3>{tile(special)}</div>}
    {!editable ? <div className="canopy-grid">{ids.filter(id => id !== special).map(id => <article className="canopy-card" key={id}><header>{id}</header>{tile(id)}</article>)}</div> :
    <DragDropContext onDragEnd={reorder}><Droppable droppableId="canopy-widgets">{drop => <div ref={drop.innerRef} {...drop.droppableProps} className="canopy-grid" style={{'--widget-scale':(scale ?? settings.scale)/100}}>
      {visible.length === 0 && <p>No widgets yet. Add one from Customize.</p>}
      {visible.map((id,index) => <Draggable key={id} draggableId={id} index={index}>{drag => <article ref={drag.innerRef} {...drag.draggableProps} className="canopy-card" style={{...drag.draggableProps.style, '--card-height':`${sizes[id] ?? settings.sizes[id] ?? 156}px`}}>
        <header><span {...drag.dragHandleProps} aria-label={`Reorder ${id}`}><GripVertical size={14} /></span><strong>{id}</strong><button aria-label={`${settings.minimized[id] ? 'Expand' : 'Minimize'} ${id}`} onClick={() => commit({minimized:{...settings.minimized,[id]:!settings.minimized[id]}})}>{settings.minimized[id] ? <Plus size={14} /> : <Minus size={14} />}</button><button aria-label={`Remove ${id}`} onClick={() => commit({cards:settings.cards.filter(card => card !== id)})}><X size={14} /></button></header>
        {!settings.minimized[id] && <><div className="canopy-card-body">{id !== special && tile(id)}</div><CanopyResize className="canopy-card-resize" label={`Resize ${id}`} direction="down" min={100} max={400} value={sizes[id] ?? settings.sizes[id] ?? 156} onChange={(value,done) => { if (done && value !== (settings.sizes[id] ?? 156)) commit({sizes:{...settings.sizes,[id]:value}}); setSizes(prev => ({...prev,[id]:done ? undefined : value})); }} /></>}
      </article>}</Draggable>)}{drop.placeholder}
    </div>}</Droppable></DragDropContext>}
  </div>;
}