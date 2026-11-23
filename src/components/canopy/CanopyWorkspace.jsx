import React, { useEffect, useRef, useState } from 'react';
import { GripVertical, Minus, Plus, Settings2, X } from 'lucide-react';
import { actions } from '@/components/canopy/canopyCatalog';
import CanopyWidget from '@/components/canopy/CanopyWidget';
import CanopyResize from '@/components/canopy/CanopyResize';
import CanopyCommandBar from '@/components/canopy/CanopyCommandBar';
import CanopyCustomizer from '@/components/canopy/CanopyCustomizer';

export default function CanopyWorkspace(props) {
  const { mode, ids, settings, commit, profile, open, error, focus } = props;
  const [library,setLibrary] = useState(false), [sizes,setSizes] = useState({}), [scale,setScale] = useState(null);
  const dragging = useRef(null);
  const editable = mode !== 'peek';
  const allowed = id => id !== 'Contact Card' || !!profile;
  const special = focus === 'notes' ? 'Quick Notes' : focus === 'notifications' ? 'Notifications' : focus === 'knowledge' ? 'Files & Knowledge' : null;
  const knowledgeFocus = useRef(null);
  useEffect(() => {
    if (focus !== 'knowledge') return;
    knowledgeFocus.current?.scrollIntoView({block:'nearest'});
    knowledgeFocus.current?.querySelector('input[type="search"]')?.focus({preventScroll:true});
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
  return <div className="canopy-scroll">
    {editable && <><CanopyCommandBar {...props} /><div className="canopy-tools"><p>{visible.length} widgets · Drag a card by its title bar</p><button aria-expanded={library} aria-controls={library ? 'canopy-library' : undefined} onClick={() => setLibrary(!library)}><Settings2 size={14} /> Customize</button></div>
      {library && <CanopyCustomizer {...{settings,commit,allowed,scale,setScale,move,dragHandle,dropTarget}} />}</>}
    {error && <p role="status" className="canopy-status">Saved on this device; account sync failed. <button onClick={() => commit({})}>Retry sync</button></p>}
    {focus === 'actions' && <div className="canopy-action-grid">{actions.map(([label,target]) => <button key={label} onClick={() => open(target)}>{label}</button>)}</div>}
    {special && <div className="canopy-focus" key={special} ref={focus === 'knowledge' ? knowledgeFocus : undefined}><h3>{special}</h3>{tile(special)}</div>}
    <div className="canopy-grid" style={{'--widget-scale':(scale ?? settings.scale)/100}}>
      {!visible.length && !special && <p>No widgets yet. Add one from Customize.</p>}
      {visible.map(id => <article className="canopy-card" key={id} {...(editable ? dropTarget(id) : {})} style={{'--card-height':`${sizes[id] ?? settings.sizes[id] ?? (id === 'Files & Knowledge' ? 320 : 156)}px`}}>
        <header>{editable && <span className="canopy-grip" title={`Drag to reorder ${id}`} {...dragHandle(id)}><GripVertical size={14} /></span>}<strong>{id}</strong>{editable && <><button aria-label={`${settings.minimized[id] ? 'Expand' : 'Minimize'} ${id}`} onClick={() => commit({minimized:{...settings.minimized,[id]:!settings.minimized[id]}})}>{settings.minimized[id] ? <Plus size={14} /> : <Minus size={14} />}</button><button aria-label={`Remove ${id}`} onClick={() => commit({cards:settings.cards.filter(card => card !== id)})}><X size={14} /></button></>}</header>
        {(!editable || !settings.minimized[id]) && <><div className="canopy-card-body">{tile(id)}</div>{editable && <CanopyResize className="canopy-card-resize" label={`Resize ${id}`} direction="down" min={100} max={400} value={sizes[id] ?? settings.sizes[id] ?? (id === 'Files & Knowledge' ? 320 : 156)} onChange={(value,done) => { if (done && value !== (settings.sizes[id] ?? (id === 'Files & Knowledge' ? 320 : 156))) commit({sizes:{...settings.sizes,[id]:value}}); setSizes(prev => ({...prev,[id]:done ? undefined : value})); }} />}</>}
      </article>)}
    </div>
  </div>;
}