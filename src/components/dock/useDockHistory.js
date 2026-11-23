import { useEffect, useState } from 'react';
import { safePath } from '@/components/dock/dockCatalog';

const limit = 20;
const empty = { entries: [], lastPath: null };

function readHistory(key) {
  try {
    const saved = JSON.parse(sessionStorage.getItem(key));
    if (Array.isArray(saved?.entries)) return {
      entries: saved.entries.filter(safePath).slice(0, limit),
      lastPath: safePath(saved.lastPath) ? saved.lastPath : null,
    };
  } catch {}
  return empty;
}

export default function useDockHistory(userId, pathname, disabled) {
  const key = `saintagent:dock-history:${userId}`;
  const [history, setHistory] = useState(() => readHistory(key));

  useEffect(() => {
    if (disabled || !safePath(pathname)) return;
    setHistory(previous => previous.lastPath === pathname ? previous : {
      lastPath: pathname,
      entries: [pathname, ...previous.entries].slice(0, limit),
    });
  }, [disabled, pathname]);

  useEffect(() => {
    if (disabled) return;
    try { sessionStorage.setItem(key, JSON.stringify(history)); } catch {}
  }, [disabled, history, key]);

  return { entries: history.entries, clear: () => setHistory({ entries: [], lastPath: pathname }) };
}