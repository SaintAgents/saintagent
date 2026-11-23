import React, { useRef, useState } from 'react';
import { Archive, GripVertical, Link2, Maximize2, MoreHorizontal, MoveUpRight, Newspaper, PanelsTopLeft, X } from 'lucide-react';
import DockWidget from '@/components/dock/DockWidget';
import { widgetLabel } from '@/components/dock/dockCatalog';

export default function DockCard({ card, floating, visible, patch, dragStart, dragEnd, reorder, drag, remove, columnWidth, ...widgetProps }) {
  const host = useRef(null), gesture = useRef(null);
  const [menu,setMenu] = useState(false), [preview,setPreview] = useState(null);
  const {type, settings} = card;
  const WidgetIcon = ['Community Feed', 'News'].includes(type) ? Newspaper : ['Quick Links', 'Quick Access', 'Pinned Item', 'pinned_item'].includes(type) ? Link2 : PanelsTopLeft;
  const frameless = floating && (settings.frameless || type === 'Inspiration' || settings.compact);
  const move = mode => ({
    onPointerDown:e => { if(e.button !== 0) return; const r=host.current.getBoundingClientRect(); gesture.current={mode,x:e.clientX,y:e.clientY,left:r.left,top:r.top,w:r.width,h:r.height}; e.currentTarget.setPointerCapture(e.pointerId); },
    onPointerMove:e => { const g=gesture.current; if(!g) return; const dx=e.clientX-g.x,dy=e.clientY-g.y;
      setPreview(g.mode==='move' ? {x:Math.max(0,Math.min(window.innerWidth-64,g.left+dx)),y:Math.max(0,Math.min(window.innerHeight-45,g.top+dy))} : {w:Math.max(155,g.w+dx),h:Math.max(120,g.h+dy)}); },
    onPointerUp:() => { if(preview) patch(preview); gesture.current=null; setPreview(null); },
    onPointerCancel:() => {gesture.current=null;setPreview(null);}
  });
  const g={...card,...preview};
  const style = floating ? {left:`min(${g.x ?? 24}px, max(0px, 100vw - 210px))`,top:`min(${g.y ?? 96}px, max(0px, 100dvh - 85px))`,width:settings.compact ? 245 : (g.w || 355),height:settings.compact || (frameless && !g.h) ? undefined : (g.h || 280)} : {width:g.w || undefined,height:g.h || undefined, '--dock-card-span': Math.max(1, Math.ceil(((g.w || 1) + 10) / (columnWidth + 10)))};
  return <article ref={host} hidden={!visible} className={`dock-card ${floating?'dock-float':''} ${frameless?'dock-frameless':''}`} style={style} onDragOver={e => {if(!floating && drag) e.preventDefault();}} onDrop={e => {if(!floating && drag) reorder(e,card.id);}} onContextMenu={e => {if(frameless) {e.preventDefault();setMenu(true);}}}>
    <div className="dock-card-header">
      {!floating && <button type="button" draggable onDragStart={e => dragStart(e,card.id)} onDragEnd={dragEnd} title="Drag to rearrange, or press Enter for options" aria-label={`Arrange ${type}`} onClick={() => setMenu(!menu)}><GripVertical size={14} /></button>}
      {floating && <button type="button" aria-label="Move widget" title="Drag to move" className="dock-move" {...move('move')}><GripVertical size={14} /></button>}
      {!frameless && <strong className="dock-card-title"><WidgetIcon size={14} aria-hidden="true" /><span className="truncate">{settings.title || widgetLabel(type)}</span></strong>}
      {!floating && <><button aria-label="Pop out widget" title="Pop out widget" onClick={() => patch({place:'float'})}><MoveUpRight size={15} /></button><button aria-label="Archive widget" title="Archive widget" onClick={() => patch({place:'drawer'})}><Archive size={15} /></button></>}
      {floating && <><button aria-label="Widget options" title="Widget options" aria-expanded={menu} onClick={() => setMenu(!menu)}><MoreHorizontal size={16} /></button>{!frameless && <button aria-label="Close floating widget" title="Close floating widget" onClick={() => patch({place:'drawer'})}><X size={15} /></button>}</>}
    </div>
    {menu && <div className="dock-card-menu dock-links">{floating ? <><button onClick={() => {patch({place:'deck'});setMenu(false);}}>Return to deck</button>{type !== 'Inspiration' && <button onClick={() => {patch({settings:{frameless:!frameless,compact:false}});setMenu(false);}}>{frameless?'Restore frame':'Frameless mode'}</button>}{type === 'Music Player' && <button onClick={() => {patch({settings:{compact:!settings.compact}});setMenu(false);}}>{settings.compact?'Full player':'Compact player'}</button>}<button onClick={() => patch({place:'drawer'})}>Close to Drawer</button><button onClick={() => {if(window.confirm(`Permanently remove ${type}?`)) remove();}}>Remove widget</button></> : <><button onClick={() => widgetProps.shift(-1)}>Move earlier</button><button onClick={() => widgetProps.shift(1)}>Move later</button><button onClick={() => patch({w:null,h:null})}>Reset size</button></>}</div>}
    <div className="dock-card-body"><DockWidget {...widgetProps} {...{card,visible,save:settings => patch({settings})}} /></div>
    {!settings.compact && <button className="dock-card-resize" aria-label="Resize widget" title="Drag to resize; arrow keys adjust size" onKeyDown={e => {const x=(e.key==='ArrowRight'?24:e.key==='ArrowLeft'?-24:0), y=(e.key==='ArrowDown'?24:e.key==='ArrowUp'?-24:0);if(!x&&!y)return;e.preventDefault();const r=host.current.getBoundingClientRect();patch({w:Math.max(155,r.width+x),h:Math.max(120,r.height+y)});}} {...move('resize')}><Maximize2 size={13} /></button>}
  </article>;
}