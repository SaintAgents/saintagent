import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Microscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { targetAt, targetRequest } from '@/components/deepdive/deepDiveTargets';

export default function DeepDiveDragTrigger({ onOpen }) {
  const drag = useRef(null), hovered = useRef(null), didDrag = useRef(false);
  const [ghost, setGhost] = useState(null);
  const highlight = target => {
    if (hovered.current === target) return;
    hovered.current?.removeAttribute('data-deep-dive-hover');
    target?.setAttribute('data-deep-dive-hover','');
    hovered.current = target;
  };
  const reset = () => { drag.current = null; highlight(null); setGhost(null); };
  useEffect(() => {
    const escape = event => { if (event.key === 'Escape' && drag.current && didDrag.current) reset(); };
    window.addEventListener('keydown',escape);
    window.addEventListener('blur',reset);
    return () => { window.removeEventListener('keydown',escape); window.removeEventListener('blur',reset); highlight(null); };
  }, []);
  const start = event => {
    if (!event.isPrimary || event.button !== 0) return;
    didDrag.current = false;
    drag.current = {id:event.pointerId,x:event.clientX,y:event.clientY};
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const move = event => {
    const origin = drag.current;
    if (origin?.id !== event.pointerId) return;
    const x = event.clientX, y = event.clientY;
    if (!didDrag.current && Math.hypot(x-origin.x,y-origin.y) < 7) return;
    didDrag.current = true;
    const target = targetAt(x,y);
    highlight(target);
    setGhost({x,y,title:target?.dataset.deepDiveTitle});
  };
  const finish = event => {
    if (drag.current?.id !== event.pointerId) return;
    const target = didDrag.current && targetAt(event.clientX,event.clientY);
    reset();
    if (target?.isConnected) onOpen(targetRequest(target),event.currentTarget);
  };
  return <><TooltipProvider><Tooltip open={ghost ? false : undefined}><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="relative size-8 shrink-0 touch-none select-none cursor-grab text-primary active:cursor-grabbing" aria-label="Open Deep Dive Intelligence" aria-haspopup="dialog" onPointerDown={start} onPointerMove={move} onPointerUp={finish} onPointerCancel={reset} onLostPointerCapture={reset} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') didDrag.current = false; }} onClick={event => { if (!didDrag.current) onOpen({},event.currentTarget); didDrag.current = false; }}><Microscope aria-hidden="true" /></Button></TooltipTrigger><TooltipContent className="z-[12000] max-w-xs"><strong className="block">Deep Dive</strong><span className="block">Drag the microscope onto a supported card, such as a project or listing. Release when the card highlights to prefill the topic, then click Begin Deep Dive to start.</span><span className="mt-1 block">Click the microscope to enter a topic yourself.</span></TooltipContent></Tooltip></TooltipProvider>
  {ghost && createPortal(<div aria-hidden="true" className="pointer-events-none fixed z-[12001] flex max-w-56 items-center gap-2 rounded-md border bg-popover px-2 py-1.5 text-xs text-popover-foreground shadow-md" style={{left:Math.max(4,Math.min(ghost.x+12,window.innerWidth-228)),top:Math.max(4,Math.min(ghost.y+12,window.innerHeight-36))}}><Microscope size={16} className="shrink-0" /> <span className="truncate">{ghost.title ? `Release to select: ${ghost.title}` : 'Drag onto a supported card'}</span></div>,document.body)}</>;
}