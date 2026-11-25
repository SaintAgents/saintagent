import { useEffect, useRef, useState } from 'react';

export default function useCanopyCardReorder(visible, move) {
  const grid = useRef(null), press = useRef(null), frame = useRef(0);
  const [drag, setDrag] = useState(null);
  const cardAt = (x, y) => {
    const card = document.elementFromPoint(x, y)?.closest('[data-canopy-card-id]');
    return card?.parentElement === grid.current ? card.dataset.canopyCardId : null;
  };
  const stop = () => { cancelAnimationFrame(frame.current); frame.current = 0; press.current = null; setDrag(null); };
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  function preview() {
    const current = press.current, scroller = grid.current?.closest('.canopy-scroll');
    if (!current?.active || !scroller) return;
    const { x, y, id } = current;
    const { top, bottom, left, right } = scroller.getBoundingClientRect();
    if (x >= left && x <= right && y >= top && y <= bottom) {
      if (y < top + 32) scroller.scrollTop -= 9;
      if (y > bottom - 32) scroller.scrollTop += 9;
    }
    const target = cardAt(x, y);
    setDrag(previous => previous?.id === id && previous?.target === target ? previous : { id, target });
    frame.current = requestAnimationFrame(preview);
  }

  return { grid, drag, grip: id => ({
    onPointerDown(e) {
      if (e.button !== 0 || !e.isPrimary || press.current) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      press.current = { id, pointer: e.pointerId, startX: e.clientX, startY: e.clientY };
    },
    onPointerMove(e) {
      const current = press.current;
      if (current?.pointer !== e.pointerId) return;
      current.x = e.clientX; current.y = e.clientY;
      if (!current.active && Math.hypot(current.x - current.startX, current.y - current.startY) >= 6) {
        current.active = true; preview();
      }
    },
    onPointerUp(e) {
      if (press.current?.pointer !== e.pointerId) return;
      const target = press.current.active ? cardAt(e.clientX, e.clientY) : null;
      stop();
      if (target) move(id, target);
    },
    onPointerCancel(e) { if (press.current?.pointer === e.pointerId) stop(); },
    onLostPointerCapture(e) { if (press.current?.pointer === e.pointerId) stop(); },
    onKeyDown(e) {
      if (e.key === 'Escape' && press.current) { stop(); return; }
      const step = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }[e.key];
      if (!step || press.current) return;
      e.preventDefault();
      const target = visible[visible.indexOf(id) + step];
      if (target) move(id, target);
    },
  }) };
}