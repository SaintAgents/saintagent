import { useEffect, useRef, useState } from 'react';
import { localRead, localWrite, toastEligible } from '@/components/live/activity';

export default function useEventToasts(user, events, ready, config, silenced) {
  const key = `live-toast-history:${user.id}`;
  const tracker = useRef(localRead(key, { seen: [] }));
  const cutoff = useRef(tracker.current.last);
  const lastShown = useRef(0);
  const queue = useRef([]);
  const initialized = useRef(false);
  const known = useRef(new Set());
  const [visible, setVisible] = useState([]);
  const blocked = silenced || !config.enabled;
  const joined = Date.parse(user.created_date);
  const [clock, tick] = useState(Date.now);
  useEffect(() => {
    const timer = setInterval(() => tick(Date.now()), 15000);
    return () => clearInterval(timer);
  }, []);
  const isNew = Number.isFinite(joined) && clock < joined + (config.quiet_minutes ?? 30) * 60000;
  useEffect(() => {
    if (!ready) return;
    const fresh = events.filter(event => !known.current.has(event.id));
    fresh.forEach(event => known.current.add(event.id));
    if (known.current.size > 250) known.current = new Set(events.map(event => event.id));
    const eligible = fresh.filter(event => !tracker.current.seen.includes(event.id) && toastEligible(event, config) && (initialized.current || !cutoff.current || Date.parse(event.created_date) > cutoff.current));
    if (!blocked && !isNew) queue.current.push(...eligible.slice(0, initialized.current || cutoff.current ? 6 : 2).reverse());
    queue.current = queue.current.slice(0, 12);
    initialized.current = true;
  }, [events, ready, config, blocked, isNew]);
  useEffect(() => {
    if (blocked) { queue.current = []; setVisible(previous => previous.length ? [] : previous); return; }
    if (!ready || visible.length >= config.max_visible) return;
    const activeIds = new Set(events.filter(event => toastEligible(event, config)).map(event => event.id));
    queue.current = isNew ? [] : queue.current.filter(event => activeIds.has(event.id));
    const welcome = config.welcome_enabled && !tracker.current.welcome && Number.isFinite(joined) && clock >= joined + 900000 && clock < joined + 86400000;
    if (!welcome && !queue.current.length) return;
    const timer = setTimeout(() => {
      const next = welcome ? { id:'welcome', headline:'Welcome to SaintAgent', description:'Live activity will help you keep up with what’s happening.' } : queue.current.shift();
      if (!next) return;
      lastShown.current = Date.now();
      const state = tracker.current;
      tracker.current = { last: Math.max(state.last || 0, Date.parse(next.created_date) || 0), seen: [next.id, ...state.seen].slice(0, 250), welcome: state.welcome || welcome };
      localWrite(key, tracker.current);
      setVisible(list => [...list, next]);
    }, lastShown.current ? Math.max(0, config.stagger_ms - (Date.now() - lastShown.current)) : 0);
    return () => clearTimeout(timer);
  }, [blocked, ready, visible.length, config, events, key, joined, clock, isNew]);
  return { visible: blocked ? [] : visible.slice(0, config.max_visible), dismiss: id => setVisible(list => list.filter(event => event.id !== id)) };
}