import { useEffect, useRef, useState } from 'react';
import dockDropTarget from '@/components/dock/dockDropTarget';

export default function useDockCardDrag({ panel, scroll, shown, wide, actions }) {
  const session = useRef(null), ghost = useRef(null), suppressClick = useRef(false);
  const [showFolders, setShowFolders] = useState(false);
  const clear = () => {
    const s = session.current;
    session.current = null;
    if (!s) return;
    cancelAnimationFrame(s.frame);
    s.target?.removeAttribute('data-dock-drop-target');
    s.card.removeAttribute('data-dock-dragging');
    if (ghost.current) ghost.current.hidden = true;
    setShowFolders(false);
  };
  useEffect(() => { if (!shown) clear(); return clear; }, [shown]);
  useEffect(() => {
    const cancel = e => { if (e.key === 'Escape' && session.current?.active) { e.preventDefault(); clear(); } };
    window.addEventListener('keydown', cancel);
    return () => window.removeEventListener('keydown', cancel);
  }, []);
  const refresh = s => {
    s.left = s.x - s.offsetX; s.top = s.y - s.offsetY;
    const result = dockDropTarget(panel.current, s);
    const next = result.target || null;
    if (s.target !== next) { s.target?.removeAttribute('data-dock-drop-target'); next?.setAttribute('data-dock-drop-target', ''); s.target = next; }
    setShowFolders(!!result.folders);
    const snap = next?.dataset.dockCard ? next.getBoundingClientRect() : null;
    ghost.current.style.transform = `translate3d(${snap?.left ?? s.left}px, ${snap?.top ?? s.top}px, 0)`;
    return result;
  };
  const tick = s => {
    if (session.current !== s) return;
    const area = scroll.current, rect = area.getBoundingClientRect();
    if (s.x >= rect.left && s.x <= rect.right && s.y >= rect.top - 12 && s.y <= rect.bottom + 12) {
      const delta = s.y < rect.top + 48 ? -Math.min(18, (rect.top + 48 - s.y) / 3) : s.y > rect.bottom - 48 ? Math.min(18, (s.y - rect.bottom + 48) / 3) : 0;
      if (delta) area.scrollTop += delta;
    }
    refresh(s);
    s.frame = requestAnimationFrame(() => tick(s));
  };
  const handle = id => ({
    onPointerDown(e) {
      if (!e.isPrimary || e.button !== 0 || session.current) return;
      suppressClick.current = false;
      const card = e.currentTarget.closest('[data-dock-card]'), { left, top, width, height } = card.getBoundingClientRect();
      session.current = { id, card, pointer: e.pointerId, x: e.clientX, y: e.clientY, startX: e.clientX, startY: e.clientY, offsetX: e.clientX - left, offsetY: e.clientY - top, width, height };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    onPointerMove(e) {
      const s = session.current;
      if (s?.pointer !== e.pointerId) return;
      s.x = e.clientX; s.y = e.clientY;
      if (s.active || Math.hypot(s.x - s.startX, s.y - s.startY) < 7) return;
      s.active = suppressClick.current = true;
      s.card.setAttribute('data-dock-dragging', '');
      Object.assign(ghost.current.style, { width: `${s.width}px`, height: `${s.height}px` });
      ghost.current.textContent = s.card.getAttribute('aria-label');
      ghost.current.hidden = false;
      tick(s);
    },
    onPointerUp(e) {
      const s = session.current;
      if (s?.pointer !== e.pointerId) return;
      if (s.active) {
        s.x = e.clientX; s.y = e.clientY;
        const { target, outside } = refresh(s);
        if (target?.dataset.dockCard) actions.swap(id, target.dataset.dockCard);
        else if (target?.dataset.dockFolder) actions.restore(id, target.dataset.dockFolder);
        else if (outside && wide) actions.float(id, { x: s.left, y: s.top });
      }
      clear();
    },
    onLostPointerCapture(e) { if (session.current?.pointer === e.pointerId) clear(); },
    onPointerCancel(e) { if (session.current?.pointer === e.pointerId) clear(); },
    onClickCapture(e) { if (e.detail && suppressClick.current) { e.stopPropagation(); suppressClick.current = false; } },
  });
  return { handle, ghost, showFolders };
}