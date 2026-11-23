import { useLayoutEffect, useRef, useState } from 'react';

const key = 'toolbarDragPos';
const clamp = (value, max) => Math.min(Math.max(0, max), Math.max(0, value));
function fit(left, top, { width, height }) {
  const viewport = document.documentElement;
  return { left: clamp(left, viewport.clientWidth - width), top: clamp(top, viewport.clientHeight - height) };
}

export default function useToolbarDrag(toolbarRef, collapsed, panelRef, activePanel) {
  const [position, setPosition] = useState(() => {
    try { const saved = JSON.parse(localStorage.getItem(key)); if (Number.isFinite(saved?.left) && Number.isFinite(saved?.top)) return saved; } catch {}
    return null;
  });
  const drag = useRef(null);
  useLayoutEffect(() => {
    const toolbar = toolbarRef.current;
    if (!toolbar || !position) return;
    const sync = () => {
      const rect = toolbar.getBoundingClientRect();
      const next = fit(position.left, position.top, rect);
      if (next.left !== position.left || next.top !== position.top) setPosition(next);
      const panel = panelRef.current;
      if (!panel) return;
      const viewport = document.documentElement;
      const above = next.top, below = viewport.clientHeight - next.top - rect.height;
      const openAbove = above >= below;
      panel.style.setProperty('--drag-panel-left', `${clamp(next.left, viewport.clientWidth - panel.offsetWidth)}px`);
      panel.style.setProperty('--drag-panel-top', openAbove ? 'auto' : `${next.top + rect.height + 8}px`);
      panel.style.setProperty('--drag-panel-bottom', openAbove ? `${viewport.clientHeight - next.top + 8}px` : 'auto');
      panel.style.setProperty('--drag-panel-height', `${Math.max(0, Math.max(above, below) - 8)}px`);
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(toolbar);
    window.addEventListener('resize', sync);
    return () => { observer.disconnect(); window.removeEventListener('resize', sync); };
  }, [toolbarRef, collapsed, panelRef, activePanel, position]);

  const start = e => {
    if (!e.isPrimary || e.button !== 0) return;
    const { left, top } = toolbarRef.current.getBoundingClientRect();
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, left, top };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = e => {
    const from = drag.current;
    if (from?.id !== e.pointerId) return;
    const dx = e.clientX - from.x, dy = e.clientY - from.y;
    if (!from.next && Math.abs(dx) <= 3 && Math.abs(dy) <= 3) return;
    from.next = fit(from.left + dx, from.top + dy, toolbarRef.current.getBoundingClientRect());
    setPosition(from.next);
  };
  const end = e => {
    const from = drag.current;
    if (from?.id !== e.pointerId) return;
    if (from.next) { try { localStorage.setItem(key, JSON.stringify(from.next)); } catch {} }
    drag.current = null;
  };
  const reset = () => { setPosition(null); try { localStorage.removeItem(key); } catch {} };
  return { position, handleProps: { onPointerDown: start, onPointerMove: move, onLostPointerCapture: end, onDoubleClick: reset } };
}