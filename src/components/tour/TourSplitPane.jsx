import React, { useRef, useState } from 'react';
import { GripVertical } from 'lucide-react';

const clamp = (value) => Math.max(25, Math.min(75, Math.round(value)));

export default function TourSplitPane({ preview, children }) {
  const [size, setSize] = useState(50);
  const [dragging, setDragging] = useState(false);
  const drag = useRef(null);
  const frame = useRef(null);
  const start = (event) => {
    if (event.button !== 0 || drag.current) return;
    drag.current = { id: event.pointerId, x: event.clientX, size, width: frame.current.clientWidth - event.currentTarget.offsetWidth };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  };
  const move = (event) => {
    const active = drag.current;
    if (active?.id !== event.pointerId || !active.width) return;
    setSize(clamp(active.size + 100 * (event.clientX - active.x) / active.width));
  };
  const end = (event) => {
    if (drag.current?.id !== event.pointerId) return;
    drag.current = null;
    setDragging(false);
  };
  const keyDown = (event) => {
    const target = { ArrowLeft: size - 2, ArrowRight: size + 2, Home: 25, End: 75 }[event.key];
    if (typeof target !== 'number') return;
    event.preventDefault();
    setSize(clamp(target));
  };

  return <div ref={frame} style={{ '--tour-preview-width': `${size}fr`, '--tour-lesson-width': `${100 - size}fr` }}
    className={`grid min-h-0 flex-1 grid-rows-[minmax(0,2fr)_minmax(0,3fr)] md:grid-rows-1 md:grid-cols-[minmax(0,var(--tour-preview-width))_0.875rem_minmax(0,var(--tour-lesson-width))] ${dragging ? 'cursor-col-resize select-none [&_iframe]:pointer-events-none' : ''}`}>
    {preview}
    <div role="separator" tabIndex={0} aria-label="Resize lesson preview and instructions" title="Drag or use arrow keys to resize the panes"
      aria-orientation="vertical" aria-valuemin={25} aria-valuemax={75} aria-valuenow={size} aria-valuetext={`${size}% preview width`}
      onPointerDown={start} onPointerMove={move} onLostPointerCapture={end} onKeyDown={keyDown}
      className="relative z-10 hidden touch-none cursor-col-resize items-center justify-center border-x bg-muted text-muted-foreground hover:text-primary focus-visible:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring md:flex">
      <GripVertical className="pointer-events-none h-5 w-3" aria-hidden="true" />
    </div>
    {children}
  </div>;
}