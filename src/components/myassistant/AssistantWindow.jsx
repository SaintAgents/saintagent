import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Maximize2, Minimize2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AssistantWindow({ title, icon: Icon, accent, open, onClose, children }) {
  const [full, setFull] = useState(false);
  const [position, setPosition] = useState(null);
  const panel = useRef(null);
  const drag = useRef(null);
  return createPortal(<section id="sa-assistant-panel" ref={panel} role="dialog" aria-label={title} data-readable-surface
    className={`fixed z-[180] ${open ? 'flex' : 'hidden'} min-h-0 flex-col overflow-hidden border shadow-2xl ${full ? 'inset-0' : 'inset-x-3 bottom-24 h-[min(35rem,calc(100dvh-9rem))] rounded-xl md:inset-x-auto md:bottom-20 md:right-16 md:h-[min(36rem,calc(100dvh-6rem))] md:min-h-72 md:w-[27rem] md:min-w-80 md:max-w-[calc(100vw-4rem)] md:max-h-[calc(100dvh-5rem)] md:resize'}`}
    style={!full && position && window.innerWidth >= 768 ? { left: position.x, top: position.y, right: 'auto', bottom: 'auto' } : undefined}>
    <header className={`flex shrink-0 items-center gap-2 border-t-4 border-b px-3 py-2 ${accent}`}>
      <div className={`flex min-w-0 flex-1 items-center gap-2 ${!full ? 'md:cursor-move md:touch-none' : ''}`}
        onPointerDown={e => {
          if (full || window.innerWidth < 768 || e.button !== 0) return;
          const rect = panel.current.getBoundingClientRect();
          drag.current = { id: e.pointerId, dx: e.clientX - rect.left, dy: e.clientY - rect.top };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onLostPointerCapture={() => { drag.current = null; }}
        onPointerMove={e => {
          const start = drag.current;
          if (start?.id !== e.pointerId) return;
          const rect = panel.current.getBoundingClientRect();
          setPosition({ x: Math.max(0, Math.min(window.innerWidth - rect.width, e.clientX - start.dx)), y: Math.max(0, Math.min(window.innerHeight - rect.height, e.clientY - start.dy)) });
        }}><Icon className="size-4 shrink-0" /><h2 className="truncate text-sm font-semibold">{title}</h2></div>
      <Button size="icon" variant="ghost" aria-label={full ? 'Exit Takeover' : 'Open Takeover'} onClick={() => { panel.current.style.removeProperty('width'); panel.current.style.removeProperty('height'); setFull(!full); }}>
        {full ? <Minimize2 /> : <Maximize2 />}
      </Button>
      <Button size="icon" variant="ghost" aria-label="Minimize assistant" onClick={onClose}><X /></Button>
    </header>
    {children}
  </section>, document.body);
}