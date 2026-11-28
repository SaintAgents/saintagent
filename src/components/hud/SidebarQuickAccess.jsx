import { useState, useSyncExternalStore } from 'react';
import { NavLink } from 'react-router-dom';
import { Plus, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/components/language/LanguageProvider';
import { cn } from '@/lib/utils';
import { isTourPreview } from '@/components/tour/tourPreviewTargets';
import QuickAccessSettings from '@/components/hud/QuickAccessSettings';

const defaults = '["Profile","AffiliateCenter"]';
const changeEvent = 'sa-nav-shortcuts-change';
const memberProfile = { page: 'Profile', label: 'Member Profile', Icon: UserCircle };
function subscribe(notify) {
  window.addEventListener(changeEvent, notify);
  window.addEventListener('storage', notify);
  return () => { window.removeEventListener(changeEvent, notify); window.removeEventListener('storage', notify); };
}

export default function SidebarQuickAccess({ catalog, leaderTier, compact, onNavigate }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(false);
  const key = `sa-nav-shortcuts:${user?.id}`;
  const stored = useSyncExternalStore(subscribe, () => { try { return localStorage.getItem(key) ?? defaults; } catch { return defaults; } });
  if (!user?.id || isTourPreview()) return null;
  const pages = [memberProfile, ...Object.values(catalog).filter(item => !item.action && !item.locked &&
    (!item.adminOnly || user.role === 'admin') && (item.id !== 'leader' || leaderTier === 'verified144k'))];
  let saved;
  try { saved = JSON.parse(stored); } catch { saved = JSON.parse(defaults); }
  const ids = Array.isArray(saved) ? [...new Set(saved.filter(id => typeof id === 'string'))] : JSON.parse(defaults);
  const pinned = ids.flatMap(id => pages.find(item => item.page === id) || []);
  const save = (next) => {
    try { localStorage.setItem(key, JSON.stringify(next)); }
    catch { setError(true); return; }
    setError(false);
    window.dispatchEvent(new Event(changeEvent));
  };
  return <div data-sidebar-quick-access role="group" aria-label={t('Quick access')} className={cn('relative flex shrink-0 items-center gap-1 border-t bg-background p-1 text-foreground', compact && 'flex-col')}>
    <div className={cn('flex min-w-0 gap-0.5', compact ? 'max-h-28 w-full flex-col items-center overflow-y-auto' : 'flex-1 overflow-x-auto')}>
      {pinned.map(({ page, label, Icon }) => <Button key={page} asChild variant="ghost" size="icon" className="shrink-0 aria-[current=page]:bg-accent aria-[current=page]:text-accent-foreground">
        <NavLink to={`/${page}`} end aria-label={t(label)} title={t(label)} onClick={onNavigate}><Icon aria-hidden="true" /></NavLink>
      </Button>)}
    </div>
    <Button type="button" variant="outline" size="icon" className="shrink-0" title={t('Manage quick access')} aria-label={t('Manage quick access')} aria-haspopup="dialog" onClick={() => { setError(false); setOpen(true); }}><Plus aria-hidden="true" /></Button>
    {open && <QuickAccessSettings pages={pages} pinned={pinned} ids={ids} onSave={save} error={error} onClose={() => setOpen(false)} />}
  </div>;
}