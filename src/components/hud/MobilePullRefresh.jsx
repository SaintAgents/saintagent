import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';

const keys = { CommunityFeed: [['posts'], ['postLikes'], ['postComments']], ActivityFeed: [['activityFeed']], News: [['newsArticles']], Missions: [['missions']] };
const threshold = 72;

export default function MobilePullRefresh({ page }) {
  const anchor = useRef(null);
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('');
  useEffect(() => {
    const main = anchor.current?.closest('main');
    if (!main || !keys[page]) return;
    let start, distance = 0, refreshing = false, active = true;
    const atTop = () => window.scrollY <= 0 && main.scrollTop <= 0;
    const begin = (event) => {
      if (event.touches.length !== 1 || refreshing || !atTop() || window.innerWidth >= 768 || event.target.closest('button, a, input, textarea, select, nav, [role="dialog"], [role="button"], [role="tab"], [contenteditable]')) return;
      for (let node = event.target; node && node !== main; node = node.parentElement) {
        if (node.scrollHeight > node.clientHeight && /^(auto|scroll)$/.test(window.getComputedStyle(node).overflowY)) return;
      }
      start = event.touches[0];
    };
    const move = (event) => {
      if (!start) return;
      const touch = event.touches[0];
      distance = touch.clientY - start.clientY;
      if (event.touches.length !== 1 || !atTop() || distance < -8 || Math.abs(touch.clientX - start.clientX) > Math.max(12, distance)) return finish();
      if (distance > 8 && event.cancelable) event.preventDefault();
      setStatus(distance >= threshold ? 'Release to refresh' : distance > 18 ? 'Pull to refresh' : '');
    };
    function finish() { start = null; distance = 0; if (!refreshing) setStatus(''); }
    const end = async () => {
      const shouldRefresh = start && distance >= threshold && atTop();
      finish();
      if (!shouldRefresh) return;
      refreshing = true;
      setStatus('Refreshing…');
      try { await Promise.all(keys[page].map(queryKey => queryClient.refetchQueries({ queryKey, type: 'active' }))); }
      finally { refreshing = false; if (active) setStatus(''); }
    };
    const handlers = { touchstart: begin, touchmove: move, touchend: end, touchcancel: finish };
    for (const [name, handler] of Object.entries(handlers)) main.addEventListener(name, handler, { passive: name !== 'touchmove' });
    return () => { active = false; for (const [name, handler] of Object.entries(handlers)) main.removeEventListener(name, handler); };
  }, [page, queryClient]);
  if (!keys[page]) return null;
  return <div ref={anchor} className="mobile-pull-status" role="status">{status && <span className="inline-flex items-center gap-2 rounded-full border bg-popover px-3 py-2 text-sm text-popover-foreground shadow"><RefreshCw className={status === 'Refreshing…' ? 'h-4 w-4 motion-safe:animate-spin' : 'h-4 w-4'} aria-hidden="true" />{status}</span>}</div>;
}