import { useEffect, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

function clamp({ x, y }) {
  return { x: Math.max(0, Math.min(x, document.documentElement.clientWidth - 44)), y: Math.max(0, Math.min(y, window.innerHeight - 44)) };
}

export default function AssistantLauncher({ launcher, userId, label, previewOnly, onOpen }) {
  const key = `sa-my-assistant:${userId}:launcher-position`;
  const [position, setPosition] = useState(() => {
    if (previewOnly) return null;
    try { const saved = JSON.parse(localStorage.getItem(key)); return Number.isFinite(saved?.x) && Number.isFinite(saved?.y) ? clamp(saved) : null; }
    catch { return null; }
  });
  const gesture = useRef(null), skipClick = useRef(false);
  useEffect(() => {
    const resize = () => setPosition(current => current && clamp(current));
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);
  function start(e) {
    if (e.button !== 0 || !e.isPrimary) return;
    const {left,top} = e.currentTarget.getBoundingClientRect();
    skipClick.current = false;
    gesture.current = { id:e.pointerId, x:e.clientX, y:e.clientY, left, top };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function move(e) {
    const g = gesture.current;
    if (g?.id !== e.pointerId) return;
    const dx = e.clientX - g.x, dy = e.clientY - g.y;
    if (!g.next && Math.hypot(dx,dy) < 6) return;
    skipClick.current = true;
    g.next = clamp({x:g.left+dx,y:g.top+dy});
    setPosition(g.next);
  }
  function end(e) {
    const g = gesture.current;
    if (g?.id !== e.pointerId) return;
    gesture.current = null;
    if (g.next && !previewOnly) { try { localStorage.setItem(key,JSON.stringify(g.next)); } catch {} }
  }
  return <Button ref={launcher} type="button" size="icon" data-deck-tour="help" aria-label={label} aria-keyshortcuts="Alt+Shift+A" aria-controls="sa-assistant-panel" onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end}
    onClick={e => { if (!skipClick.current || e.detail === 0) onOpen(); skipClick.current = false; }}
    className="fixed bottom-[calc(6rem+var(--activity-ticker-height,0px))] right-4 z-[170] size-11 touch-none select-none cursor-grab shadow-lg active:cursor-grabbing md:bottom-[calc(1.5rem+var(--activity-ticker-height,0px))] md:right-16"
    style={position ? {left:position.x,top:position.y,right:'auto',bottom:'auto'} : undefined}><Sparkles aria-hidden="true" className="!size-5" /></Button>;
}