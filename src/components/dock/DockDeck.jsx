import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import DockDeckIcon from '@/components/dock/DockDeckIcon';
import { Button } from '@/components/ui/button';
import CanopyResize from '@/components/canopy/CanopyResize';
import { VIDEO_LIBRARY } from '@/components/hud/videoLibrary';
import DockFooter from '@/components/dock/DockFooter';
import DockHeader from '@/components/dock/DockHeader';
import DockFolders from '@/components/dock/DockFolders';
import DockDialogs from '@/components/dock/DockDialogs';
import DockCardSlot from '@/components/dock/DockCardSlot';
import DockPinProvider from '@/components/dock/DockPinContext';
import useDockPreferences from '@/components/dock/useDockPreferences';
import useDockActions from '@/components/dock/useDockActions';
import useDockPanel from '@/components/dock/useDockPanel';
import useDockHistory from '@/components/dock/useDockHistory';
import '@/components/dock/dock.css';

export default function DockDeck({user, disabled, children}) {
  const location=useLocation(), navigate=useNavigate();
  const {prefs,commit,error}=useDockPreferences(user);
  const actions=useDockActions(commit,prefs.active);
  const [modal,setModal]=useState(null), [drag,setDrag]=useState(null);
  const visited = useRef(new Set());
  const dragId=useRef(null), panel=useRef(null), launcher=useRef(null), grid=useRef(null), floatingTools=useRef(null);
  const {shown, setOpen, wide, width, max, resize} = useDockPanel({prefs,commit,disabled,panel,actions,dragId,setDrag,setModal});
  const history = useDockHistory(user.id, location.pathname, disabled);
  const countedOpening = useRef(false);
  const compactLauncher = (prefs.launcherUses ?? 0) >= 3;
  useEffect(() => {
    if (!shown) { countedOpening.current = false; return; }
    if (compactLauncher || countedOpening.current) return;
    countedOpening.current = true;
    commit(previous => ({ launcherUses: Math.min((previous.launcherUses ?? 0) + 1, 3) }));
  }, [shown, compactLauncher, commit]);
  const close=() => {setOpen(false); requestAnimationFrame(() => launcher.current?.focus());};
  const deck=prefs.decks.find(d=>d.id===prefs.active) || prefs.decks[0];
  if (shown) visited.current.add(deck.id);
  const deckCards=prefs.cards.filter(c=>c.place==='deck');
  const openModal=type => {if (!shown) setOpen(true);setModal(type);};
  const drop=(e, apply) => {e.preventDefault();e.stopPropagation();if(dragId.current) apply(dragId.current);dragId.current=null;setDrag(null);};
  const columns=width>=930 ? 3 : width>=535 ? 2 : 1;
  const cardProps=card => ({card,user,navigate,openModal,shortcuts:prefs.shortcuts,history,drag,panelOpen:shown || card.place==='float',columnWidth:(width-12*(columns+1))/columns,patch:update=>actions.patch(card.id,update),remove:()=>actions.remove(card.id),shift:dir=>actions.shift(card.id,dir),
    onFloat:() => actions.float(card.id), onReturn:() => { actions.patch(card.id,{place:'deck'}); if (card.deck!==deck.id) commit({active:card.deck}); setOpen(true); },
    dragStart:(e,id)=>{if(!wide){e.preventDefault();return;}e.dataTransfer.setData('text/plain',id);e.dataTransfer.effectAllowed='move';dragId.current=id;setDrag(id);},dragEnd:()=>{dragId.current=null;setDrag(null);},reorder:(e,target)=>drop(e,id=>actions.reorder(id,target))});
  return <DockPinProvider {...{prefs, commit, disabled}}>{children}<div className="dock-root" hidden={disabled} data-dock-open={shown}>
    {!shown && <Button ref={launcher} className="dock-launcher" data-dock-handle={compactLauncher ? '' : undefined} variant="outline" onClick={() => setOpen(true)} aria-label="Open Dock Deck" title="Open Dock Deck" aria-controls="dock-deck" aria-expanded={false}><DockDeckIcon />{!compactLauncher && prefs.label && 'Dock Deck'}</Button>}
    <aside ref={panel} id="dock-deck" aria-label="Dock Deck" aria-hidden={!shown} {...(!shown ? {inert:''} : {})} className="dock-panel" style={{width,'--dock-video-opacity':prefs.opacity/100}}>
      {wide && <><CanopyResize label="Resize Dock Deck" className="dock-resize" direction="left" value={width} min={320} max={max} onChange={resize} /><button type="button" className="dock-edge" aria-label="Collapse Dock Deck" title="Collapse Dock Deck" onClick={close}><ChevronRight size={16} /></button></>}
      {shown && prefs.video && <video className="dock-video" aria-hidden="true" src={VIDEO_LIBRARY[0].url} autoPlay muted loop playsInline />}
      <DockHeader {...{prefs,deck,commit,close,openModal,compactLauncher}} />
      <div className="dock-scroll">
        <DockFolders {...{prefs,commit,openModal,drag}} drop={(e,target)=>drop(e,id=>{if(target!==prefs.active)actions.restore(id,target);})} />
        <div ref={grid} className="dock-grid" style={{'--dock-columns':columns}}>{deckCards.every(c=>c.deck!==deck.id) && <p className="p-3">This deck is empty. Use Add Widget to get started.</p>}</div>
      </div>
      <DockFooter {...{prefs,openModal,error}} archived={prefs.cards.filter(c=>c.place==='drawer').length} />
    </aside>
    <div ref={floatingTools} />
    {prefs.cards.map((card, order) => {
      const floating = card.place === 'float';
      if (!floating && (card.place !== 'deck' || !visited.current.has(card.deck))) return null;
      return <DockCardSlot key={card.id} target={floating ? floatingTools : grid} floating={floating} visible={!disabled && (floating || card.deck===deck.id)} order={order} {...cardProps(card)} />;
    })}
    {shown && modal && <DockDialogs key={modal} {...{modal,prefs,deck,actions}} cards={prefs.cards} close={()=>setModal(null)} />}
  </div></DockPinProvider>;
}