import React, { useRef } from 'react';

const MIN_WIDTH = 220;
const MAX_WIDTH = 400;
export const DEFAULT_SIDEBAR_WIDTH = 256;
export const COLLAPSED_SIDEBAR_WIDTH = 84;
export const clampSidebarWidth = width => Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, width));

export default function SidebarResizeHandle({ width, onResize, onDraggingChange }) {
  const drag = useRef(null);
  return <div
    role="separator" tabIndex={0} aria-label="Resize left navigation" aria-orientation="vertical"
    aria-valuemin={MIN_WIDTH} aria-valuemax={MAX_WIDTH} aria-valuenow={width}
    title="Drag to resize left navigation"
    className="group absolute -right-1 inset-y-0 z-10 hidden w-2 touch-none cursor-ew-resize select-none items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring lg:flex"
    onPointerDown={event => {
      if (event.button !== 0 || !event.isPrimary) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      drag.current = { id: event.pointerId, x: event.clientX, width };
      onDraggingChange(true);
    }}
    onPointerMove={event => {
      if (drag.current?.id !== event.pointerId) return;
      onResize(clampSidebarWidth(Math.round(drag.current.width + event.clientX - drag.current.x)));
    }}
    onLostPointerCapture={event => {
      if (drag.current?.id !== event.pointerId) return;
      drag.current = null;
      onDraggingChange(false);
    }}
    onKeyDown={event => {
      const next = { ArrowLeft: width - 12, ArrowRight: width + 12, Home: MIN_WIDTH, End: MAX_WIDTH }[event.key];
      if (typeof next !== 'number') return;
      event.preventDefault();
      onResize(clampSidebarWidth(next));
    }}
  ><span className="pointer-events-none h-9 w-0.5 bg-muted-foreground group-hover:bg-primary group-focus-visible:bg-primary" /></div>;
}