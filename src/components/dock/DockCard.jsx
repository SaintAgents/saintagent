import React, { useRef, useState } from 'react';
import { Archive, ArrowRightToLine, GripVertical, Link2, Maximize2, MoreHorizontal, MoveUpRight, Newspaper, PanelsTopLeft, X } from 'lucide-react';
import DockWidget from '@/components/dock/DockWidget';
import DockFloatResizeHandles from '@/components/dock/DockFloatResizeHandles';
import resizeFloatingDockCard from '@/components/dock/resizeFloatingDockCard';
import { widgetLabel } from '@/components/dock/dockCatalog';

export default function DockCard({ card, floating, visible, order, patch, onFloat, onReturn, arrangeHandle, remove, columnWidth, ...widgetProps }) {
  const host = useRef(null), gesture = useRef(null), pending = useRef(null);
  const switchPlace = (action, focusSelector) => {
    setMenu(false);
    action();
    requestAnimationFrame(() => host.current?.querySelector(focusSelector)?.focus());
  };
  const [menu,setMenu] = useState(false), [preview,setPreview] = useState(null);
  const {type, settings} = card;
  const autoHeight = type === 'Inspiration';
  const WidgetIcon = ['Community Feed', 'News'].includes(type) ? Newspaper : ['Quick Links', 'Quick Access', 'Pinned Item', 'pinned_item'].includes(type) ? Link2 : PanelsTopLeft;
  const frameless = floating && (settings.frameless !== false || type === 'Inspiration' || settings.compact);
  const resize = (rect, edge, dx, dy) => resizeFloatingDockCard(rect, edge, dx, dy, settings.compact, frameless);
  const bounds = () => { const {left, top, width:w, height:h} = host.current.getBoundingClientRect(); return {left, top, w, h}; };
  const finish = save => {
    if (save && pending.current && Object.keys(pending.current).length) patch(pending.current);
    gesture.current = pending.current = null;
    setPreview(null);
  };
  const move = mode => ({
    onPointerDown:e => { if(e.button !== 0 || gesture.current) return; gesture.current={...bounds(),x:e.clientX,y:e.clientY,id:e.pointerId}; e.currentTarget.setPointerCapture(e.pointerId); },
    onPointerMove:e => { const g=gesture.current; if(g?.id !== e.pointerId) return; const dx=e.clientX-g.x,dy=e.clientY-g.y;
      pending.current = mode==='move' ? {x:g.left+dx,y:g.top+dy} : floating ? resize(g,mode,dx,dy) : {w:Math.max(155,g.w+dx),...(!autoHeight && {h:Math.max(120,g.h+dy)})};
      setPreview(pending.current); },
    onPointerUp:e => { if(gesture.current?.id === e.pointerId) finish(true); },
    onLostPointerCapture:e => { if(gesture.current?.id === e.pointerId) finish(false); },
    onPointerCancel:e => { if(gesture.current?.id === e.pointerId) finish(false); },
  });
  const resizeByKey = (event, edge) => {
    const dx = event.key==='ArrowRight'?24:event.key==='ArrowLeft'?-24:0;
    const dy = event.key==='ArrowDown'?24:event.key==='ArrowUp'?-24:0;
    const update = resize(bounds(), edge, dx, dy);
    if (Object.keys(update).length) { event.preventDefault(); patch(update); }
  };
  const g={...card,...preview};
  const floatHeight = settings.compact ? g.compactHeight : g.h || (autoHeight || frameless ? undefined : 280);
  const style = floating ? {'--dock-float-x':`${g.x ?? 24}px`,'--dock-float-y':`${g.y ?? 96}px`,'--dock-float-width':`${settings.compact ? (g.compactWidth || 245) : (g.w || 355)}px`,height:floatHeight} : {order,width:g.w || undefined,height:autoHeight ? undefined : g.h || undefined, '--dock-card-span': Math.max(1, Math.ceil(((g.w || 1) + 10) / (columnWidth + 10)))};
  return <article ref={host} aria-label={settings.title || widgetLabel(type)} hidden={!visible} className={`dock-card ${floating?'dock-float':''} ${frameless?'dock-frameless':''}`} style={style} data-dock-card={floating ? undefined : card.id} onContextMenu={e => {if(frameless && !e.target.closest('input,textarea,select,a,[contenteditable]')) {e.preventDefault();setMenu(true);}}}>
    <div className="dock-card-header">
      {!floating && <button type="button" {...arrangeHandle} title="Drag onto another card to swap, or press Enter for options" data-dock-arrange aria-label={`Arrange ${type}`} onClick={() => setMenu(!menu)}><GripVertical size={14} /></button>}
      {floating && <button type="button" aria-label="Move widget" title="Drag to move; arrow keys move the widget" className="dock-move" onKeyDown={e => {
        const x=e.key==='ArrowRight'?24:e.key==='ArrowLeft'?-24:0, y=e.key==='ArrowDown'?24:e.key==='ArrowUp'?-24:0;
        if(!x&&!y) return;
        e.preventDefault(); const r=host.current.getBoundingClientRect(); patch({x:r.left+x,y:r.top+y});
      }} {...move('move')}><GripVertical size={14} /></button>}
      {!frameless && <strong className="dock-card-title"><WidgetIcon size={14} aria-hidden="true" /><span className="truncate">{settings.title || widgetLabel(type)}</span></strong>}
      {!floating && <><button type="button" aria-label={`Float ${settings.title || widgetLabel(type)}`} title="Pop out as a frameless tool" onClick={() => switchPlace(onFloat,'.dock-move')}><MoveUpRight size={15} /></button><button aria-label="Archive widget" title="Archive widget" onClick={() => patch({place:'drawer'})}><Archive size={15} /></button></>}
      {floating && <><button type="button" aria-label="Return to Dock Deck" title="Return to Dock Deck" onClick={() => switchPlace(onReturn,'[data-dock-arrange]')}><ArrowRightToLine size={15} aria-hidden="true" /></button><button aria-label="Widget options" title="Widget options" aria-expanded={menu} onClick={() => setMenu(!menu)}><MoreHorizontal size={16} /></button>{!frameless && <button aria-label="Close floating widget" title="Close floating widget" onClick={() => patch({place:'drawer'})}><X size={15} /></button>}</>}
    </div>
    {menu && <div className="dock-card-menu dock-links">{floating ? <><button onClick={() => switchPlace(onReturn,'[data-dock-arrange]')}>Return to deck</button>{type !== 'Inspiration' && <button onClick={() => {patch({settings:{frameless:!frameless,compact:false}});setMenu(false);}}>{frameless?'Restore frame':'Frameless mode'}</button>}{type === 'Music Player' && <button onClick={() => {patch({settings:{compact:!settings.compact}});setMenu(false);}}>{settings.compact?'Full player':'Compact player'}</button>}<button onClick={() => patch({place:'drawer'})}>Close to Drawer</button><button onClick={() => {if(window.confirm(`Permanently remove ${type}?`)) remove();}}>Remove widget</button></> : <><button onClick={() => widgetProps.shift(-1)}>Move earlier</button><button onClick={() => widgetProps.shift(1)}>Move later</button><button onClick={() => patch({w:null,h:null})}>Reset size</button></>}</div>}
    <div className="dock-card-body" data-inspiration-card={type === 'Inspiration' ? '' : undefined}><DockWidget {...widgetProps} {...{card,visible,save:settings => patch({settings})}} /></div>
    {floating && <DockFloatResizeHandles gesture={move} resizeByKey={resizeByKey} />}
    {!floating && !settings.compact && <button className="dock-card-resize" aria-label={autoHeight ? 'Resize widget width' : 'Resize widget'} title={autoHeight ? 'Drag sideways or use left and right arrow keys' : 'Drag to resize; arrow keys adjust size'} onKeyDown={e => {const x=(e.key==='ArrowRight'?24:e.key==='ArrowLeft'?-24:0), y=autoHeight?0:(e.key==='ArrowDown'?24:e.key==='ArrowUp'?-24:0);if(!x&&!y)return;e.preventDefault();const r=host.current.getBoundingClientRect();patch({w:Math.max(155,r.width+x),...(!autoHeight && {h:Math.max(120,r.height+y)})});}} {...move('resize')}><Maximize2 size={13} /></button>}
  </article>;
}