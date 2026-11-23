import React, { useEffect, useRef, useState } from 'react';
import ObservationCard from '@/components/observation/ObservationCard';
import { bounds, layoutCards } from '@/components/observation/observationGeometry';
export default function ObservationCanvas({ cards,pages,type,view,deck,custom,dock,toggle,pin,active,fold,save }) {
  const ref=useRef(null), [width,setWidth]=useState(0), [loaded,load]=useState([]);
  useEffect(() => { const el=ref.current; const resize=new ResizeObserver(() => setWidth(Math.floor(el.clientWidth))); resize.observe(el); setWidth(Math.floor(el.clientWidth)); return () => resize.disconnect(); },[]);
  const desktop=type === 'desktop';
  const defaults=layoutCards(cards,width,view.arrangement);
  const boxes=Object.fromEntries(cards.map(id => { const p=view.positions[id] || defaults[id]; const w=bounds(p.w,Math.min(185,width),width); return [id,{...p,w,x:bounds(p.x,0,width-w)}]; }));
  const height=Math.max(370,...cards.map(id => boxes[id].y+(deck.collapsed[id] ? 44 : boxes[id].h)))+12;
  const ordered = !desktop && view.arrangement === 'reverse' ? [...cards].reverse() : cards;
  return <div ref={ref} className="ob-canvas" data-viewport={type} data-arrangement={view.arrangement} style={desktop ? {height} : undefined}>
    {(!desktop || width > 0) && ordered.map(id => {const i=cards.indexOf(id); const page=pages.find(p => p.id===id); return <ObservationCard key={id} {...{page,width,save:box => save(id,box)}} label={custom[id] || page.label} pos={desktop ? boxes[id] : null} collapsed={!!deck.collapsed[id]} live={i<2 || loaded.includes(id)} load={() => load(prev => [...prev,id])} remove={() => {load(prev => prev.filter(p => p !== id)); toggle(id);}} fold={() => fold(id)} pin={() => pin(id)} canPin={active !== 0} pinned={dock.includes(id)}/>;})}
  </div>;
}