import React, { useState, useRef, useCallback } from 'react';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MobileTabBar({ currentPage, onWalletOpen, onMenuOpen }) {
  const [pos, setPos] = useState(() => {
    try {
      const saved = localStorage.getItem('mobileMenuPos');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { right: 16, bottom: 20 };
  });
  const dragRef = useRef({ dragging: false, startX: 0, startY: 0, startRight: 0, startBottom: 0, moved: false });

  const onTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    dragRef.current = {
      dragging: true,
      startX: touch.clientX,
      startY: touch.clientY,
      startRight: pos.right,
      startBottom: pos.bottom,
      moved: false
    };
  }, [pos]);

  const onTouchMove = useCallback((e) => {
    if (!dragRef.current.dragging) return;
    const touch = e.touches[0];
    const dx = dragRef.current.startX - touch.clientX;
    const dy = dragRef.current.startY - touch.clientY;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) dragRef.current.moved = true;
    if (!dragRef.current.moved) return;
    e.preventDefault();
    const newRight = Math.max(4, Math.min(window.innerWidth - 60, dragRef.current.startRight + dx));
    const newBottom = Math.max(4, Math.min(window.innerHeight - 60, dragRef.current.startBottom + dy));
    setPos({ right: newRight, bottom: newBottom });
  }, []);

  const onTouchEnd = useCallback(() => {
    const wasDrag = dragRef.current.moved;
    dragRef.current.dragging = false;
    if (wasDrag) {
      try { localStorage.setItem('mobileMenuPos', JSON.stringify(pos)); } catch {}
    } else {
      onMenuOpen();
    }
  }, [pos, onMenuOpen]);

  return (
    <button
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onClick={(e) => {
        // Desktop fallback — touch devices use onTouchEnd
        if (!('ontouchstart' in window)) onMenuOpen();
      }}
      className={cn(
        "fixed z-[9999] md:hidden",
        "w-14 h-14 rounded-full",
        "bg-violet-600 dark:bg-[#00ff88] shadow-xl",
        "flex items-center justify-center",
        "hover:bg-violet-700 dark:hover:bg-[#00dd77]",
        "transition-colors",
        "shadow-violet-500/40 dark:shadow-[#00ff88]/40",
        "ring-4 ring-white/50 dark:ring-black/30",
        "touch-none select-none"
      )}
      style={{ zIndex: 99999, right: pos.right, bottom: pos.bottom }}
    >
      <Menu className="w-6 h-6 text-white dark:text-black" />
    </button>
  );
}