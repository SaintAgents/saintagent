import React, { useEffect, useRef, useState } from 'react';
import { Settings2 } from 'lucide-react';
import CanopyWidget from '@/components/canopy/CanopyWidget';
import CanopyCard from '@/components/canopy/CanopyCard';
import CanopyCommandBar from '@/components/canopy/CanopyCommandBar';
import CanopyCustomizer from '@/components/canopy/CanopyCustomizer';

export default function CanopyWorkspace(props) {
  const { mode, ids, settings, commit, profile, error, focus } = props;
  const [library,setLibrary] = useState(false), [scale,setScale] = useState(null);
  const cardScale = scale ?? settings.scale;
  const dragging = useRef(null);
  const editable = mode !== 'peek';
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
  const card = (id, focused = false) => <CanopyCard key={id} id={id} focused={focused} scale={cardScale} size={settings.sizes[id]}
    minimized={!focused && editable && Boolean(settings.minimized[id])}
    onResize={size => commit({sizes:{...settings.sizes,[id]:size}})}
    dragHandle={!focused && editable ? dragHandle(id) : undefined} dropTarget={!focused && editable ? dropTarget(id) : undefined}
    onToggle={!focused && editable ? () => commit({minimized:{...settings.minimized,[id]:!settings.minimized[id]}}) : undefined}
    onRemove={!focused && editable ? () => commit({cards:settings.cards.filter(card => card !== id)}) : undefined}>{tile(id)}</CanopyCard>;
  return <div className="canopy-scroll" style={{'--widget-scale':cardScale/100}}>
    {editable && <><CanopyCommandBar {...props} /><div className="canopy-tools"><p>{visible.length} widgets · Drag edges to resize or a grip to reorder</p><button aria-expanded={library} aria-controls={library ? 'canopy-library' : undefined} onClick={() => setLibrary(!library)}><Settings2 size={14} /> Customize</button></div>
      {library && <CanopyCustomizer {...{settings,commit,allowed,scale,setScale,move,dragHandle,dropTarget}} />}</>}
    {error && <p role="status" className="canopy-status">Saved on this device; account sync failed. <button onClick={() => commit({})}>Retry sync</button></p>}
    {special && <div className="canopy-focus" key={special} ref={widgetFocus}>{card(special, true)}</div>}
    <div className="canopy-grid">
      {!visible.length && !special && <p>No widgets yet. Add one from Customize.</p>}
      {visible.map(id => card(id))}
    </div>
  </div>;
}