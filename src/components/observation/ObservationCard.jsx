import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ChevronDown, ChevronUp, Grip, Pin, X } from 'lucide-react';
import { bounds } from '@/components/observation/observationGeometry';

function Frame({page,label}) {
  const ref=useRef(null), [state,setState]=useState('loading');
  useEffect(() => {
    const ready=e => { if (e.origin === window.location.origin && e.source === ref.current?.contentWindow && e.data?.type === 'observation-preview-ready' && e.data.id === page.id) { setState('ready'); clearTimeout(timer); } };
    const timer=setTimeout(() => setState('unavailable'),15000);
    window.addEventListener('message',ready);
    return () => { clearTimeout(timer); window.removeEventListener('message',ready); };
  },[page.id]);
  return <div className="ob-frame"><iframe ref={ref} title={`${label} live view`} src={`${page.path}?observationPreview=1`} sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads" referrerPolicy="same-origin" />
    {state !== 'ready' && <p role="status">{state === 'loading' ? 'Loading live view…' : <>Preview could not load. <a href={page.path} target="_blank" rel="noopener noreferrer">Open full page</a></>}</p>}
  </div>;
}
export default function ObservationCard({ page, label, pos, width, collapsed, live, load, remove, fold, pin, canPin, pinned, save }) {
  const [draft,setDraft]=useState(null), drag=useRef(null);
  const box=draft || pos;
  function adjusted(start, dx, dy, resize) {
    if (resize) return {...start,w:bounds(start.w+dx,Math.min(185,width-start.x),width-start.x),h:bounds(start.h+dy,160,950)};
    return {...start,x:bounds(start.x+dx,0,width-start.w),y:bounds(start.y+dy,0,6000)};
  }
  const handlers = resize => ({
    onPointerDown:e => { if (e.button !== 0) return; drag.current={x:e.clientX,y:e.clientY,start:box}; e.currentTarget.setPointerCapture(e.pointerId); },
    onPointerMove:e => { const d=drag.current; if (d) setDraft(adjusted(d.start,e.clientX-d.x,e.clientY-d.y,resize)); },
    onPointerUp:e => { const d=drag.current; if (d && (e.clientX!==d.x || e.clientY!==d.y)) save(adjusted(d.start,e.clientX-d.x,e.clientY-d.y,resize)); drag.current=null; setDraft(null); },
    onLostPointerCapture:() => { drag.current=null; setDraft(null); },
    onPointerCancel:() => { drag.current=null; setDraft(null); },
    onKeyDown:e => { const step={ArrowLeft:[-16,0],ArrowRight:[16,0],ArrowUp:[0,-16],ArrowDown:[0,16]}[e.key]; if (step) { e.preventDefault(); save(adjusted(box,...step,resize)); } },
  });
  return <article className="ob-card" aria-label={label} data-collapsed={collapsed} data-moving={!!draft} style={box ? {left:box.x,top:box.y,width:box.w,height:collapsed ? undefined : box.h} : undefined}>
    <header className="ob-card-tools">{box && <button type="button" className="ob-drag" aria-label={`Move ${label} (arrow keys)`} {...handlers(false)}><Grip size={16}/></button>}<h2 title={label}>{label}</h2>
      <a href={page.path} target="_blank" rel="noopener noreferrer" aria-label={`Open ${label}`}><ArrowUpRight size={16}/></a>
      {canPin && <button type="button" aria-label={pinned ? `${label} is on Dock Deck` : `Pin ${label} to Dock Deck`} title={pinned ? 'On Dock Deck' : 'Pin to Dock Deck'} disabled={pinned} onClick={pin}><Pin size={15}/></button>}
      <button type="button" aria-label={collapsed ? `Expand ${label}` : `Collapse ${label}`} aria-expanded={!collapsed} onClick={fold}>{collapsed ? <ChevronDown size={16}/> : <ChevronUp size={16}/>}</button><button type="button" aria-label={`Remove ${label}`} onClick={remove}><X size={16}/></button>
    </header>
    {!collapsed && (live ? <Frame page={page} label={label}/> : <div className="ob-unloaded"><p>Live preview is paused.</p><button type="button" onClick={load}>Load Live View</button></div>)}
    {box && !collapsed && <button type="button" className="ob-resize" aria-label={`Resize ${label} (arrow keys)`} {...handlers(true)}>◢</button>}
  </article>;
}