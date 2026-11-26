import React, { useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowUp } from 'lucide-react';
import '@/components/tour/tourHighlight.css';

export default function CommandDeckTourHighlight() {
  const [rect, setRect] = useState(null);

  useLayoutEffect(() => {
    const toolbar = document.getElementById('app-topbar');
    if (!toolbar) return;
    const update = () => {
      const bounds = toolbar.getBoundingClientRect();
      const icon = Array.from(toolbar.querySelectorAll('[data-tour-command-icon]')).find((el) => el.getClientRects().length);
      const box = icon?.getBoundingClientRect();
      setRect(box && box.left >= bounds.left && box.right <= bounds.right ? box : null);
    };
    update();
    const resize = new ResizeObserver(update);
    resize.observe(toolbar);
    const children = new MutationObserver(update);
    children.observe(toolbar, { childList: true, subtree: true });
    toolbar.addEventListener('scroll', update, { passive: true });
    toolbar.addEventListener('transitionend', update);
    window.addEventListener('resize', update);
    return () => {
      resize.disconnect();
      children.disconnect();
      toolbar.removeEventListener('scroll', update);
      toolbar.removeEventListener('transitionend', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  if (!rect) return null;
  return createPortal(
    <span aria-hidden="true" className="pointer-events-none fixed z-[10002] block text-primary" style={{ left: rect.left - 3, top: rect.top - 3, width: rect.width + 6, height: rect.height + 6 }}>
      <span data-tour-launcher-focus className="absolute inset-0 rounded-[var(--radius)] ring-2 ring-background" />
      <span className="absolute left-1/2 top-full mt-1 flex -translate-x-1/2 items-center justify-center rounded-full bg-background p-1 ring-2 ring-current">
        <ArrowUp size={24} strokeWidth={3} />
      </span>
    </span>,
    document.body,
  );
}