import { useEffect, useLayoutEffect, useState } from 'react';
import { safePath } from '@/components/dock/dockCatalog';

export default function useDockPanel({prefs,commit,disabled,panel,actions,dragId,setDrag,setModal}) {
  const [open,setOpen]=useState(false), [viewport,setViewport]=useState(()=>window.innerWidth), [draft,setDraft]=useState(null);
  const wide=viewport>=768, max=Math.min(1122,Math.floor(viewport*.88));
  const width=wide ? Math.min(max,Math.max(320,draft ?? prefs.width)) : viewport;
  const shown=open&&!disabled;
  useEffect(()=>{const update=()=>setViewport(window.innerWidth);window.addEventListener('resize',update);return ()=>window.removeEventListener('resize',update);},[]);
  useLayoutEffect(()=>{
    const style=document.documentElement.style;
    style.setProperty('--dock-occupied', `${shown && wide ? width : 0}px`);
    style.setProperty('--dock-page-reserve', `${shown && wide && prefs.beside ? width : 0}px`);
    document.dispatchEvent(new Event('dockDeckWidthChange'));
    return ()=>{style.removeProperty('--dock-occupied');style.removeProperty('--dock-page-reserve');document.dispatchEvent(new Event('dockDeckWidthChange'));};
  },[shown,wide,width,prefs.beside]);
  useEffect(()=>{
    if(disabled) return;
    const change=()=>{if (document.querySelector('[data-dock-full-tour][data-state="open"]')) {setOpen(false);setModal(null);}};
    const observer=new MutationObserver(change); if(shown) observer.observe(document.body,{childList:true,subtree:true});
    change(); return ()=>observer.disconnect();
  },[shown,disabled,setModal]);
  useEffect(()=>{
    if(disabled) return;
    const launch=()=>{if(!document.querySelector('[data-dock-full-tour][data-state="open"]'))setOpen(true);};
    const pin=e=>{const {path,title}=e.detail || {};if(safePath(path)){actions.add('Pinned Item',{path,title:typeof title==='string'?title.trim().slice(0,100):path});launch();}};
    const over=e=>{if(dragId.current&&!panel.current?.contains(e.target))e.preventDefault();};
    const drop=e=>{if(dragId.current&&!panel.current?.contains(e.target)){e.preventDefault();actions.patch(dragId.current,{place:'float',x:e.clientX,y:e.clientY});dragId.current=null;setDrag(null);}};
    document.addEventListener('openDockDeck',launch); document.addEventListener('pinDockItem',pin); window.addEventListener('dragover',over);window.addEventListener('drop',drop);
    return ()=>{document.removeEventListener('openDockDeck',launch);document.removeEventListener('pinDockItem',pin);window.removeEventListener('dragover',over);window.removeEventListener('drop',drop);};
  },[disabled,actions,panel,dragId,setDrag]);
  return {shown,setOpen,wide,width,max,resize:(value,done)=>{if(!done){setDraft(value);return;}if(value!==prefs.width)commit({width:value});setDraft(null);}};
}