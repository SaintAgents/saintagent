import { useEffect, useRef, useState } from 'react';
import { canopyPlacementQuery, measureCanopyPlacement, placeCanopyCard, sameCanopyPosition } from '@/components/canopy/canopyCardPositions';

export default function useCanopyCardReorder(visible, move, { freeform, positions, save }) {
  const canPlace = () => freeform && window.matchMedia(canopyPlacementQuery).matches;
  const grid = useRef(null), press = useRef(null), frame = useRef(0);
  const [drag, setDrag] = useState(null);
  const cardAt = (x, y) => {
    const card = document.elementFromPoint(x, y)?.closest('[data-canopy-card-id]');
    return card?.parentElement === grid.current ? card.dataset.canopyCardId : null;
  };
  const stop = () => { cancelAnimationFrame(frame.current); frame.current = 0; press.current = null; setDrag(null); };
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  function positionAt(current, x, y) {
    const { placement, gridTop, startX, startY } = current;
    return placeCanopyCard(grid.current, placement, placement.origin.x + x - startX,
      placement.origin.y + y - startY + gridTop - grid.current.getBoundingClientRect().top);
  }

  function preview() {
    const current = press.current, scroller = grid.current?.closest('.canopy-scroll');
    if (!current?.active || !scroller) return;
    const { x, y, id } = current;
    const { top, bottom, left, right } = scroller.getBoundingClientRect();
    if (x >= left && x <= right && y >= top && y <= bottom) {
      if (y < top + 32) scroller.scrollTop -= 9;
      if (y > bottom - 32) scroller.scrollTop += 9;
    }
    if (current.placement) {
      const point = positionAt(current, x, y);
      setDrag(previous => previous?.id === id && sameCanopyPosition(previous.layout?.[id], point)
        ? previous : { id, layout: { ...current.placement.layout, [id]: point } });
    } else {
      const target = cardAt(x, y);
      setDrag(previous => previous?.id === id && previous?.target === target ? previous : { id, target });
    }
    frame.current = requestAnimationFrame(preview);
  }

  return { grid, drag, grip: id => ({
    onPointerDown(e) {
      if (e.button !== 0 || !e.isPrimary || press.current) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      const placement = canPlace() ? measureCanopyPlacement(grid.current, id, positions) : null;
      press.current = { id, pointer: e.pointerId, startX: e.clientX, startY: e.clientY, placement, gridTop: grid.current.getBoundingClientRect().top };
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
      const current = press.current;
      if (current?.pointer !== e.pointerId) return;
      if (current.active && current.placement) {
        const point = positionAt(current, e.clientX, e.clientY);
        if (!sameCanopyPosition(point, current.placement.origin)) save({ ...current.placement.layout, [id]: point });
      } else if (current.active) {
        const target = cardAt(e.clientX, e.clientY);
        if (target) move(id, target);
      }
      stop();
    },
    onPointerCancel(e) { if (press.current?.pointer === e.pointerId) stop(); },
    onLostPointerCapture(e) { if (press.current?.pointer === e.pointerId) stop(); },
    onKeyDown(e) {
      if (e.key === 'Escape' && press.current) { stop(); return; }
      const step = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }[e.key];
      if (!step || press.current) return;
      e.preventDefault();
      if (canPlace()) {
        const placement = measureCanopyPlacement(grid.current, id, positions);
        if (!placement) return;
        const axis = e.key === 'ArrowUp' || e.key === 'ArrowDown' ? 'y' : 'x';
        const next = { ...placement.origin, [axis]: placement.origin[axis] + step * (e.shiftKey ? 24 : 4) };
        const point = placeCanopyCard(grid.current, placement, next.x, next.y);
        if (!sameCanopyPosition(point, placement.origin)) save({ ...placement.layout, [id]: point });
        return;
      }
      const target = visible[visible.indexOf(id) + step];
      if (target) move(id, target);
    },
  }) };
}