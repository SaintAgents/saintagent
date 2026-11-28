import React, { useEffect, useRef, useState } from 'react';
import { Settings2 } from 'lucide-react';
import CanopyWidget from '@/components/canopy/CanopyWidget';
import CanopyCard from '@/components/canopy/CanopyCard';
import CanopyCommandBar from '@/components/canopy/CanopyCommandBar';
import CanopyCustomizer from '@/components/canopy/CanopyCustomizer';
import useCanopyCardReorder from '@/components/canopy/useCanopyCardReorder';

export default function CanopyWorkspace(props) {
  const { mode, ids, settings, commit, profile, error, focus, original, saved, viewSaved, saveView, onToggleOriginal } = props;
  const [library,setLibrary] = useState(false), [scale,setScale] = useState(null);
  const cardScale = original ? settings.scale : scale ?? settings.scale;
  const dragging = useRef(null);
  const editable = !original && mode !== 'peek';
  const allowed = id => id !== 'Contact Card' || !!profile;
  const special = { actions:'Actions', notes:'Quick Notes', notifications:'Notifications', knowledge:'Files & Knowledge', online:'Who’s Online' }[focus];
  const widgetFocus = useRef(null);
  useEffect(() => {
    if (focus !== 'knowledge' && focus !== 'online') return;
    widgetFocus.current?.scrollIntoView({block:'nearest'});
    widgetFocus.current?.querySelector(focus === 'online' ? 'button' : 'input[type="search"]')?.focus({preventScroll:true});
  }, [focus]);
  const visible = ids.filter(id => allowed(id) && id !== special);
  const tile = id => <CanopyWidget id={id} {...props} />;
  function move(id,target) {
    if (!id || id === target) return;
    const cards = [...settings.cards], from = cards.indexOf(id), to = cards.indexOf(target);
    if (from < 0 || to < 0) return;
    cards.splice(to,0,...cards.splice(from,1)); commit({cards});
  }
  const dragHandle = id => ({draggable:true,onDragStart:e => { dragging.current=id; e.dataTransfer.effectAllowed='move'; e.dataTransfer.setData('text/plain',id); },onDragEnd:() => {dragging.current=null;}});
  const dropTarget = id => ({onDragOver:e => {if (dragging.current) {e.preventDefault(); e.dataTransfer.dropEffect='move';}},onDrop:e => {if (!dragging.current) return; e.preventDefault(); move(dragging.current,id); dragging.current=null;}});
  const freeform = editable && mode === 'full';
  const positions = settings.positions || {};
  const reorder = useCanopyCardReorder(visible, move, { freeform, positions, save: next => commit({ positions: next }) });
  const layout = reorder.drag?.layout || positions;
  const card = (id, focused = false) => <CanopyCard key={id} id={id} focused={focused} scale={cardScale} size={settings.sizes[id]}
    position={!focused && freeform ? layout[id] : undefined}
    minimized={!focused && editable && Boolean(settings.minimized[id])}
    onResize={original ? undefined : size => commit({sizes:{...settings.sizes,[id]:size}})}
    dragHandle={!focused && editable ? reorder.grip(id) : undefined}
    dragState={!focused && editable && reorder.drag ? (reorder.drag.id === id ? 'source' : reorder.drag.target === id ? 'target' : undefined) : undefined}
    onToggle={!focused && editable ? () => commit({minimized:{...settings.minimized,[id]:!settings.minimized[id]}}) : undefined}
    onRemove={!focused && editable ? () => commit({cards:settings.cards.filter(card => card !== id)}) : undefined}>{tile(id)}</CanopyCard>;
  return <div className="canopy-scroll" style={{'--widget-scale':cardScale/100}}>
    <div className="canopy-tabs">
      {editable && <button type="button" disabled={viewSaved} onClick={saveView}>{viewSaved ? 'Layout saved' : 'Save layout'}</button>}
      <button type="button" onClick={() => { setScale(null); onToggleOriginal(); }}>
        {original ? (saved ? 'Return to saved layout' : 'Return to my layout') : 'Show original layout'}
      </button>
    </div>
    {mode !== 'peek' && <CanopyCommandBar {...props} />}
    {editable && <><div className="canopy-tools"><p>{visible.length} widgets · {freeform ? <><span className="hidden md:inline">Drag a grip to place a card anywhere.</span><span className="md:hidden">Drag a grip onto another card to reorder.</span></> : 'Drag a grip onto another card to reorder.'} Drag edges to resize.</p><button aria-expanded={library} aria-controls={library ? 'canopy-library' : undefined} onClick={() => setLibrary(!library)}><Settings2 size={14} /> Customize</button></div>
      {library && <CanopyCustomizer {...{settings,commit,allowed,scale,setScale,move,dragHandle,dropTarget}} />}</>}
    {error && <p role="status" className="canopy-status">Saved on this device; account sync failed. <button onClick={() => commit({})}>Retry sync</button></p>}
    {special && <div className="canopy-focus" key={special} ref={widgetFocus}>{card(special, true)}</div>}
    <div className="canopy-grid" ref={reorder.grid} data-canopy-placed={freeform && visible.some(id => layout[id]) ? '' : undefined}>
      {!visible.length && !special && <p>{editable ? 'No widgets yet. Add one from Customize.' : 'No widgets to display.'}</p>}
      {visible.map(id => card(id))}
    </div>
  </div>;
}