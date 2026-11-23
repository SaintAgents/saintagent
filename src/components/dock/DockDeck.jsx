import React, { useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import DockDeckIcon from '@/components/dock/DockDeckIcon';
import { Button } from '@/components/ui/button';
import CanopyResize from '@/components/canopy/CanopyResize';
import { VIDEO_LIBRARY } from '@/components/hud/videoLibrary';
import { links } from '@/components/dock/dockCatalog';
import DockHeader from '@/components/dock/DockHeader';
import DockFolders from '@/components/dock/DockFolders';
import DockDialogs from '@/components/dock/DockDialogs';
import DockCard from '@/components/dock/DockCard';
import useDockPreferences from '@/components/dock/useDockPreferences';
import useDockActions from '@/components/dock/useDockActions';
import useDockPanel from '@/components/dock/useDockPanel';
import '@/components/dock/dock.css';

export default function DockDeck({user, disabled}) {
  const location=useLocation(), navigate=useNavigate();
  const {prefs,commit,error}=useDockPreferences(user);
  const actions=useDockActions(commit,prefs.active);
  const [modal,setModal]=useState(null), [drag,setDrag]=useState(null);
  const visited = useRef(new Set());
  const dragId=useRef(null), panel=useRef(null), launcher=useRef(null);
  const {shown, setOpen, wide, width, max, resize, recent} = useDockPanel({prefs,commit,disabled,panel,actions,location,dragId,setDrag,setModal});
  const close=() => {setOpen(false); requestAnimationFrame(() => launcher.current?.focus());};
  const deck=prefs.decks.find(d=>d.id===prefs.active) || prefs.decks[0];
  if (shown) visited.current.add(deck.id);
  const deckCards=prefs.cards.filter(c=>c.place==='deck');
  const openModal=type => {if (!shown) setOpen(true);setModal(type);};
  const drop=(e, apply) => {e.preventDefault();e.stopPropagation();if(dragId.current) apply(dragId.current);dragId.current=null;setDrag(null);};
  const columns=width>=930 ? 3 : width>=535 ? 2 : 1;
  const cardProps=card => ({card,user,navigate,openModal,shortcuts:prefs.shortcuts,recent,drag,columnWidth:(width-12*(columns+1))/columns,patch:update=>actions.patch(card.id,update),remove:()=>actions.remove(card.id),shift:dir=>actions.shift(card.id,dir),
    dragStart:(e,id)=>{if(!wide){e.preventDefault();return;}e.dataTransfer.setData('text/plain',id);e.dataTransfer.effectAllowed='move';dragId.current=id;setDrag(id);},dragEnd:()=>{dragId.current=null;setDrag(null);},reorder:(e,target)=>drop(e,id=>actions.reorder(id,target))});
  return <div className="dock-root" hidden={disabled} data-dock-open={shown}>
    {!shown && <Button ref={launcher} className="dock-launcher" variant="outline" onClick={() => setOpen(true)} aria-label="Open Dock Deck" aria-controls="dock-deck" aria-expanded={false}><DockDeckIcon />{prefs.label && 'Dock Deck'}</Button>}
    <aside ref={panel} id="dock-deck" aria-label="Dock Deck" aria-hidden={!shown} {...(!shown ? {inert:''} : {})} className="dock-panel" style={{width,'--dock-opacity':prefs.opacity/100}}>
      {wide && <><CanopyResize label="Resize Dock Deck" className="dock-resize" direction="left" value={width} min={320} max={max} onChange={resize} /><button type="button" className="dock-edge" aria-label="Collapse Dock Deck" title="Collapse Dock Deck" onClick={close}><ChevronRight size={16} /></button></>}
      {shown && prefs.video && <video className="dock-video" aria-hidden="true" src={VIDEO_LIBRARY[0].url} autoPlay muted loop playsInline />}
      <DockHeader {...{prefs,deck,commit,close,openModal}} />
      <div className="dock-scroll">
        <DockFolders {...{prefs,commit,openModal,drag}} drop={(e,target)=>drop(e,id=>{if(target!==prefs.active)actions.restore(id,target);})} />
        <div className="dock-grid" style={{'--dock-columns':columns}}>{deckCards.filter(card=>visited.current.has(card.deck)).map(card=><DockCard key={card.id} visible={card.deck===deck.id} {...cardProps(card)} />)}{deckCards.every(c=>c.deck!==deck.id) && <p className="p-3">This deck is empty. Use Add Widget to get started.</p>}</div>
      </div>
      <footer className="dock-footer"><DockWidgetShortcuts {...{prefs,openModal}} /><p>{deckCards.filter(c=>c.deck===deck.id).length} active · {prefs.cards.filter(c=>c.place==='drawer').length} archived · Rearrange or resize cards</p>{error && <p role="alert">Could not sync to your account. Your browser copy was kept.</p>}</footer>
    </aside>
    {prefs.cards.filter(c=>c.place==='float').map(card=><DockCard key={card.id} floating visible={!disabled} {...cardProps(card)} />)}
    {shown && modal && <DockDialogs key={modal} {...{modal,prefs,deck,actions}} cards={prefs.cards} close={()=>setModal(null)} />}
  </div>;
}

function DockWidgetShortcuts({prefs,openModal}) {return <nav aria-label="Dock Quick Access" className="flex flex-wrap items-center gap-2">{prefs.shortcuts.map(label=><Link key={label} to={links[label]}>{label}</Link>)}<button onClick={()=>openModal('shortcuts')}>Edit Quick Access</button></nav>; }