import { useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Maximize2, PanelTop, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import '@/components/tour/tourWindow.css';

export default function TourWindow({ header, children, onClose, returnFocus, busy, welcome }) {
  const [floating, setFloating] = useState(false);
  const [position, setPosition] = useState(null);
  const [dragging, setDragging] = useState(false);
  const drag = useRef(null), mode = useRef(false), toggle = useRef(null);
  const switchMode = () => { mode.current = !floating; setFloating(!floating); };
  function start(event) {
    if (!floating || event.button !== 0 || drag.current || event.target.closest('button, a, input, select, textarea')) return;
    const { left, top } = event.currentTarget.parentElement.getBoundingClientRect();
    drag.current = { id: event.pointerId, x: event.clientX - left, y: event.clientY - top };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  }
  function move(event) {
    if (drag.current?.id !== event.pointerId) return;
    setPosition({ x: event.clientX - drag.current.x, y: event.clientY - drag.current.y });
  }
  function stop(event) {
    if (drag.current?.id !== event.pointerId) return;
    drag.current = null;
    setDragging(false);
  }
  return <Dialog.Root open modal={!floating} onOpenChange={open => { if (!open && !busy) onClose(); }}>
    <Dialog.Portal>
      <Dialog.Content data-dock-full-tour={floating ? undefined : ''} data-readable-surface data-hacker-draggable="true"
        data-tour-window={floating ? 'floating' : 'full'} data-tour-welcome={welcome ? '' : undefined} data-tour-dragging={dragging ? '' : undefined}
        style={floating && position ? { '--tour-x': `${position.x}px`, '--tour-y': `${position.y}px` } : undefined}
        className="fixed flex min-w-0 flex-col overflow-hidden bg-background text-foreground"
        onInteractOutside={event => event.preventDefault()}
        onOpenAutoFocus={event => { if (toggle.current) { event.preventDefault(); toggle.current.focus(); } }}
        onCloseAutoFocus={event => { if (floating !== mode.current || returnFocus) event.preventDefault(); if (floating === mode.current) returnFocus?.(); }}>
        <header className="flex shrink-0 flex-wrap items-start justify-between gap-2 border-b px-4 py-3 sm:px-6" onPointerDown={start} onPointerMove={move} onLostPointerCapture={stop}>
          <div className="min-w-0 flex-1 basis-48 space-y-1">{header}</div>
          <div className="flex flex-wrap gap-2">
            <Button ref={toggle} type="button" size="sm" variant="outline" onClick={switchMode}>{floating ? <Maximize2 aria-hidden="true" /> : <PanelTop aria-hidden="true" />}{floating ? 'Full screen' : 'Float window'}</Button>
            <Button type="button" size="sm" variant="outline" disabled={busy} onClick={onClose}><X aria-hidden="true" />Exit tour</Button>
          </div>
        </header>
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}