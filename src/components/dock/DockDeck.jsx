import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import DockDeckIcon from '@/components/dock/DockDeckIcon';
import { Button } from '@/components/ui/button';
import CanopyResize from '@/components/canopy/CanopyResize';
import { VIDEO_LIBRARY } from '@/components/hud/videoLibrary';
import SurfaceHeroLayer from '@/components/hero/SurfaceHeroLayer';
import { useSurfaceHeroes } from '@/components/hero/surfaceHeroSettings';
import DockFooter from '@/components/dock/DockFooter';
import DockHeader from '@/components/dock/DockHeader';
import DockFolders from '@/components/dock/DockFolders';
import DockEmptyFolder from '@/components/dock/DockEmptyFolder';
import DockDialogs from '@/components/dock/DockDialogs';
import DockMoveDialog from '@/components/dock/DockMoveDialog';
import DockCardSlot from '@/components/dock/DockCardSlot';
import DockPinProvider from '@/components/dock/DockPinContext';
import DockWritingStore from '@/components/dock/DockWritingStore';
import useDockPreferences from '@/components/dock/useDockPreferences';
import useDockActions from '@/components/dock/useDockActions';
import useDockPanel from '@/components/dock/useDockPanel';
import useDockHistory from '@/components/dock/useDockHistory';
import useDockCardDrag from '@/components/dock/useDockCardDrag';
import '@/components/dock/dock.css';

export default function DockDeck({user, disabled, preview = false, children}) {
  const location=useLocation(), navigate=useNavigate();
  const {prefs,commit,error}=useDockPreferences(user, preview);
  const heroes = useSurfaceHeroes();
  const actions=useDockActions(commit,prefs.active);
  const [modal,setModal]=useState(null), [revealId,setRevealId]=useState(null);
  const visited = useRef(new Set());
  const panel=useRef(null), scroll=useRef(null), launcher=useRef(null), grid=useRef(null), floatingTools=useRef(null);
  const {shown, setOpen, wide, width, max, resize} = useDockPanel({prefs,commit,disabled,actions,setModal,setRevealId});
  const { handle, ghost, showFolders } = useDockCardDrag({ panel, scroll, shown, wide, actions });
  const history = useDockHistory(user.id, location.pathname, disabled || preview);
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
  const revealCard = id => { setRevealId(id); setOpen(true); };
  useEffect(() => {
    if (!shown || modal || !revealId) return;
    const frame = requestAnimationFrame(() => {
      const card = grid.current?.querySelector(`[data-dock-card="${CSS.escape(revealId)}"]:not([hidden])`);
      if (card && scroll.current) {
        const area = scroll.current.getBoundingClientRect(), rect = card.getBoundingClientRect();
        if (rect.top < area.top || rect.bottom > area.bottom) scroll.current.scrollTop += rect.top - area.top - 12;
      }
      setRevealId(null);
    });
    return () => cancelAnimationFrame(frame);
  }, [shown, modal, revealId, deck.id]);
  if (shown) visited.current.add(deck.id);
  const deckCards=prefs.cards.filter(c=>c.place==='deck');
  const openModal=type => {if (!shown) setOpen(true);setModal(type);};
  const columns=width>=930 ? 3 : width>=535 ? 2 : 1;
  const cardProps=card => ({card,user,navigate,openModal,shortcuts:prefs.shortcuts,history,arrangeHandle:handle(card.id),panelOpen:shown || card.place==='float',columnWidth:(width-12*(columns+1))/columns,patch:update=>actions.patch(card.id,update),remove:()=>actions.remove(card.id),shift:dir=>actions.shift(card.id,dir),
    onMoveFolder:prefs.decks.length > 1 ? trigger => setModal({ moveId:card.id, trigger }) : undefined,
    onFloat:() => actions.float(card.id), onReturn:() => { actions.patch(card.id,{place:'deck'}); if (card.deck!==deck.id) commit({active:card.deck}); setOpen(true); } });
  const movingCard = modal?.moveId ? deckCards.find(card => card.id === modal.moveId) : null;
  const captureAvailable = prefs.cards.some(card => card.type === 'Clipboard History' && card.place !== 'drawer');
  return <DockPinProvider {...{prefs, commit, disabled, revealCard}}>{children}<DockWritingStore userId={user.id} captureAvailable={captureAvailable} writable={!disabled && !preview}><div className="dock-root" hidden={disabled} data-dock-open={shown}>
    {!shown && <Button ref={launcher} className="dock-launcher" data-dock-handle={compactLauncher ? '' : undefined} variant="outline" onClick={() => setOpen(true)} aria-label="Open Dock Deck" title="Open Dock Deck" aria-controls="dock-deck" aria-expanded={false}><DockDeckIcon />{!compactLauncher && prefs.label && 'Dock Deck'}</Button>}
    <aside ref={panel} id="dock-deck" aria-label="Dock Deck" aria-hidden={!shown} {...(!shown ? {inert:''} : {})} className="dock-panel" style={{width,'--dock-video-opacity':prefs.opacity/100}}>
      {wide && <><CanopyResize label="Resize Dock Deck" className="dock-resize" direction="left" value={width} min={320} max={max} onChange={resize} /><button type="button" className="dock-edge" aria-label="Collapse Dock Deck" title="Collapse Dock Deck" onClick={close}><ChevronRight size={16} /></button></>}
      {!preview && heroes.surfaces?.dock ? <SurfaceHeroLayer surface="dock" visible={shown} /> : shown && prefs.video && (preview || !heroes.hidden) && <video className="dock-video" aria-hidden="true" src={VIDEO_LIBRARY[0].url} autoPlay muted loop playsInline />}
      <DockHeader {...{prefs,deck,commit,close,openModal,compactLauncher,preview}} configured={Boolean(heroes.surfaces?.dock)} />
      <div ref={scroll} className="dock-scroll">
        <DockFolders {...{prefs,commit,openModal,showFolders}} />
        <div ref={grid} className="dock-grid" style={{'--dock-columns':columns}}>{deckCards.every(c=>c.deck!==deck.id) && <DockEmptyFolder onAddWidget={() => openModal('library')} />}</div>
      </div>
      <DockFooter {...{prefs,openModal,error}} archived={prefs.cards.filter(c=>c.place==='drawer').length} />
    </aside>
    <div ref={floatingTools} />
    <div ref={ghost} className="dock-drag-preview" hidden aria-hidden="true" />
    {prefs.cards.map((card, order) => {
      const floating = card.place === 'float';
      if (!floating && (card.place !== 'deck' || !visited.current.has(card.deck))) return null;
      return <DockCardSlot key={card.id} target={floating ? floatingTools : grid} floating={floating} visible={!disabled && (floating || card.deck===deck.id)} order={order} {...cardProps(card)} />;
    })}
    {shown && typeof modal === 'string' && <DockDialogs key={modal} {...{modal,prefs,deck,actions,revealCard}} cards={prefs.cards} close={()=>setModal(null)} />}
    {shown && movingCard && <DockMoveDialog key={movingCard.id} card={movingCard} folders={prefs.decks} trigger={modal.trigger} onClose={() => setModal(null)} onMove={destination => {
      actions.restore(movingCard.id, destination, true);
      setModal(null);
      revealCard(movingCard.id);
    }} />}
  </div></DockWritingStore></DockPinProvider>;
}