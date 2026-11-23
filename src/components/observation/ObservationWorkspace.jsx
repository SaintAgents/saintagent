import React, { useEffect, useState } from 'react';
import { Bookmark, Grid2X2, RotateCcw, Search } from 'lucide-react';
import useObservationWorkspace, { cleanView, DECK_NAMES, LIMIT } from '@/components/observation/useObservationWorkspace';
import useObservationAccess from '@/components/observation/useObservationAccess';
import ObservationHero from '@/components/observation/ObservationHero';
import ObservationPicker from '@/components/observation/ObservationPicker';
import ObservationControls from '@/components/observation/ObservationControls';
import ObservationCanvas from '@/components/observation/ObservationCanvas';

const device = () => window.innerWidth >= 1100 ? 'desktop' : window.innerWidth >= 768 ? 'tablet' : 'mobile';
export default function ObservationWorkspace({ user }) {
  const { data,change,status,retry,query } = useObservationWorkspace(user);
  const pages=useObservationAccess(user), staff=['admin','coordinator'].includes(user.role);
  const [header,setHeader]=useState(true), [picker,setPicker]=useState(null), [touch,setTouch]=useState(0);
  const [actual,setActual]=useState(device), [viewport,setViewport]=useState('auto'), [message,setMessage]=useState('');
  useEffect(() => { const measure=() => setActual(device()); window.addEventListener('resize',measure); return () => window.removeEventListener('resize',measure); },[]);
  useEffect(() => { if (!header || picker) return; const id=setTimeout(() => setHeader(false),22000); return () => clearTimeout(id); },[header,picker,touch]);
  const type = actual === 'mobile' || viewport === 'mobile' ? 'mobile' : viewport === 'auto' || viewport === 'desktop' ? actual : 'tablet';
  const active=data.active, deck=data.decks[active], view={...cleanView(),...deck.views[type]};
  const cards=deck.cards.filter(id => pages.some(p => p.id === id));
  const patchDeck=(update,index=active) => change(s => ({...s,decks:s.decks.map((d,i) => i === index ? update(d) : d)}));
  const patchView=update => patchDeck(d => ({...d,views:{...d.views,[type]:update({...cleanView(),...d.views[type]})}}));
  const toggle=id => { if (!pages.some(p => p.id === id)) return; patchDeck(d => {
    if (d.cards.includes(id)) { const { [id]:_,...collapsed }=d.collapsed; return {...d,cards:d.cards.filter(c => c !== id),collapsed,views:Object.fromEntries(Object.entries(d.views).map(([key,v]) => {const {[id]:old,...positions}=v.positions; return [key,{...v,positions}];}))}; }
    return d.cards.length >= LIMIT ? d : {...d,cards:[...d.cards,id]};
  }); };
  const pin=id => { if (data.decks[0].cards.length >= LIMIT) { setMessage('Dock Deck is full. Remove a card there before pinning another.'); return; } patchDeck(d => d.cards.includes(id) || d.cards.length >= LIMIT ? d : {...d,cards:[...d.cards,id]},0); setMessage('Pinned to Dock Deck.'); };
  const arrange=arrangement => patchView(v => ({...v,arrangement,positions:{}}));
  const browse=() => setPicker('search');
  if (query.isPending) return <p className="p-6" role="status">Loading your Observation Deck…</p>;
  if (query.isError) return <div className="p-6"><p>Could not load your Observation Deck.</p><button onClick={() => query.refetch()}>Try again</button></div>;
  return <div className="ob-workspace">
    <div onPointerDown={() => setTouch(t => t+1)} onKeyDown={() => setTouch(t => t+1)}><ObservationHero open={header} setOpen={setHeader}><div className="ob-actions">
      <button onClick={browse}><Search size={16}/>{staff ? 'Add Any Page' : 'Search Pages'}</button><button onClick={() => setPicker('groups')}><Bookmark size={16}/>My Groups</button>
      <button onClick={() => arrange('grid')}><Grid2X2 size={16}/>Grid</button><button onClick={() => patchView(() => cleanView())}><RotateCcw size={16}/>Reset</button>
    </div></ObservationHero></div>
    <div className="ob-board"><div className="ob-board-head"><div><p className="ob-kicker">ACTIVE WORKSPACE</p><h2>{DECK_NAMES[active]}</h2></div><span>{deck.cards.length} / {LIMIT} cards</span></div>
      {message && <p className="ob-notice" role="status">{message} <button onClick={() => setMessage('')}>Dismiss</button></p>}
      {cards.length ? <ObservationCanvas key={active} {...{cards,pages,type,view,deck,toggle,pin,active}} custom={data.custom} dock={data.decks[0].cards} fold={id => patchDeck(d => ({...d,collapsed:{...d.collapsed,[id]:!d.collapsed[id]}}))} save={(id,box) => patchView(v => ({...v,positions:{...v.positions,[id]:box}}))}/> : <section className="ob-empty"><h3>No pages on this deck yet</h3><p>Search for a page or add bookmarks from one of your groups.</p><div className="ob-actions"><button onClick={browse}><Search size={16}/>{staff ? 'Add Any Page' : 'Search Pages'}</button><button onClick={() => setPicker('groups')}><Bookmark size={16}/>My Groups</button></div></section>}
    </div>
    <ObservationControls deck={active} selectDeck={index => {change(s => ({...s,active:index})); setMessage('');}} arrangement={view.arrangement} {...{arrange,viewport,setViewport,actual,status,retry}}/>
    {picker && <ObservationPicker mode={picker} close={() => setPicker(null)} {...{pages,cards:deck.cards,data,change,toggle,staff}}/>}
  </div>;
}