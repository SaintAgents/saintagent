import { useId, useRef } from 'react';
import { cn } from '@/lib/utils';

export default function SidebarSectionSizer({ label, open, height, onResize, fill = false, children }) {
  const id = useId();
  const body = useRef(null);
  const drag = useRef(null);
  const min = fill ? 112 : 84;
  const maxHeight = () => Math.max(min, Math.min(900, window.innerHeight - 120));
  const resize = next => onResize(Math.round(Math.min(maxHeight(), Math.max(min, next))));
  const current = () => body.current.getBoundingClientRect().height;
  const sized = open && Number.isFinite(height);
  const automatic = open && fill && !sized;
  return <div className={cn('flex flex-col', automatic ? 'min-h-32 flex-1' : 'shrink-0')}>
    <div id={id} ref={body} className={cn(
      fill && open && 'flex min-h-0 flex-col',
      automatic && 'flex-1',
      sized && (fill ? 'overflow-hidden' : 'overflow-y-auto'),
    )} style={sized ? { height, maxHeight: `min(900px, max(${min}px, calc(100dvh - 120px)))` } : undefined}>{children}</div>
    {open && <div role="separator" tabIndex={0} aria-controls={id} aria-orientation="horizontal"
      aria-label={`Resize ${label}`} title={`Drag up or down to resize ${label}; double-click to reset`}
      className="group flex h-3 shrink-0 touch-none cursor-ns-resize select-none items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
      onPointerDown={event => {
        if (event.button !== 0 || !event.isPrimary) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = { id: event.pointerId, start: event.clientY, size: current() };
      }}
      onPointerMove={event => {
        if (drag.current?.id === event.pointerId) resize(drag.current.size + event.clientY - drag.current.start);
      }}
      onLostPointerCapture={() => { drag.current = null; }}
      onDoubleClick={() => onResize(undefined)}
      onKeyDown={event => {
        const next = { ArrowUp: () => resize(current() - 24), ArrowDown: () => resize(current() + 24), Home: () => resize(min), End: () => resize(maxHeight()), Enter: () => onResize(undefined) }[event.key];
        if (!next) return;
        event.preventDefault();
        next();
      }}><span aria-hidden="true" className="pointer-events-none h-0.5 w-7 bg-muted-foreground group-hover:bg-primary group-focus-visible:bg-primary" /></div>}
  </div>;
}