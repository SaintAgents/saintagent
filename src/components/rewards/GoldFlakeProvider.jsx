import { createContext, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { classifyClick, getProgress, GOAL, saveProgress } from '@/components/rewards/goldFlakeClicks';

export const GoldFlakeContext = createContext(null);

export default function GoldFlakeProvider({ user, disabled, children }) {
  const key = `gold-flakes:${user.id}`;
  const [view, setView] = useState(() => { const p = getProgress(key); return { count: p.clicks.length, status: p.status }; });
  const queryClient = useQueryClient();
  useEffect(() => {
    if (disabled) return;
    let live = true, busy = false, retryAt = 0, lastWarning = 0, lastEmpty = 0, empty = 0, fast = 0;
    let p = getProgress(key);
    const save = next => { p = next; saveProgress(key, p); if (live) setView({ count: p.clicks.length, status: p.status }); };
    const warn = (message, now = Date.now()) => {
      if (now - lastWarning < 12000 || !live) return;
      lastWarning = now;
      toast.warning('Gold Flakes: click not counted', { description: message, id: 'gold-flake-warning' });
    };
    const sync = async () => {
      if (busy || Date.now() < retryAt || p.status === 'limit') return;
      const action = !p.round && p.clicks.length ? 'start' : p.clicks.length === GOAL ? 'claim' : null;
      if (!action) return;
      busy = true;
      let active = false;
      try {
        const { data } = await base44.functions.invoke('earnGoldFlakes', action === 'start' ? { action } : { action, round: p.round, clicks: p.clicks });
        if (!live) return;
        active = data.status === 'active';
        if (active) save({ ...p, round: data.round, expiresAt: data.expiresAt });
        else if (data.status === 'awarded') {
          save({ clicks: [] });
          toast.success('You earned GGG Gold Flakes!', { description: `+${data.amount.toFixed(3)} GGG for 45 qualifying clicks.` });
          for (const name of ['wallet', 'walletTx', 'myProfile', 'userProfileSelf']) queryClient.invalidateQueries({ queryKey: [name, user.email] });
        } else if (data.status === 'limit') {
          save({ clicks: [], status: 'limit', expiresAt: data.resumesAt });
          toast.info('Gold Flakes daily limit reached');
        } else if (data.status === 'processing') {
          if (p.status !== 'processing') toast.info('Your Gold Flakes reward is pending.');
          save({ ...p, status: 'processing' });
          retryAt = Date.now() + 60000;
        } else if (data.status === 'expired' || data.status === 'rejected') {
          save({ clicks: [] });
          warn(data.status === 'expired' ? 'This round ended. Your next qualifying click starts a new one.' : 'This round did not pass the click checks. Use different controls at a normal pace.');
        } else retryAt = Date.now() + 2000;
      } catch {
        retryAt = Date.now() + 10000;
      } finally { busy = false; }
      if (active && p.clicks.length === GOAL) void sync();
    };
    const onClick = event => {
      const click = classifyClick(event);
      if (!click) return;
      const now = Date.now();
      if (p.expiresAt && p.expiresAt <= now && p.status !== 'processing') save({ clicks: [] });
      if (p.status === 'limit') return;
      if (p.status === 'processing') { if (click.kind === 'control') void sync(); return; }
      if (click.kind === 'empty') {
        empty = now - lastEmpty <= 3000 ? empty + 1 : 1;
        lastEmpty = now;
        if (empty >= 3) warn('Clicks on empty space don’t earn GGG. Use buttons, links, or other controls.', now);
        return;
      }
      empty = 0;
      if (p.clicks.length === GOAL) { void sync(); return; }
      const startedAt = p.startedAt ?? now;
      const time = now - startedAt;
      const same = p.clicks.filter(([id]) => id === click.id);
      if (same.length >= 5 || (same.length && time - same.at(-1)[1] < 3000)) {
        warn('Repeated clicks on the same control don’t count. Try different parts of the app.', now);
        return;
      }
      if (p.clicks.length && time - p.clicks.at(-1)[1] < 850) {
        if (++fast >= 3) warn('Rapid-fire clicks don’t count. Use the app at a normal pace.', now);
        return;
      }
      fast = 0;
      save({ ...p, startedAt, clicks: [...p.clicks, [click.id, time]] });
      void sync();
    };
    document.addEventListener('click', onClick, true);
    return () => { live = false; document.removeEventListener('click', onClick, true); };
  }, [key, disabled, queryClient, user.email]);
  return <GoldFlakeContext.Provider value={disabled ? null : view}>{children}</GoldFlakeContext.Provider>;
}