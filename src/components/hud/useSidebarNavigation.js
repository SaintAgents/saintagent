import { useEffect, useState } from 'react';
import { isTourPreview } from '@/components/tour/tourPreviewTargets';

const storageKey = 'sidebarNavMode';

export default function useSidebarNavigation({ groups, currentPage, startNavCollapsed, onToggle }) {
  const [mode, setMode] = useState(() => {
    if (isTourPreview()) return 'default';
    try { return sessionStorage.getItem(storageKey) || 'default'; } catch { return 'default'; }
  });
  const [navOpen, setNavOpen] = useState(() => mode !== 'collapsed');
  const [overrides, setOverrides] = useState({});
  const activeGroup = groups.find(group => group.items.includes(currentPage));
  const defaults = mode === 'expanded' ? Object.fromEntries(groups.map(({ key }) => [key, true]))
    : mode === 'collapsed' || startNavCollapsed ? {} : { [activeGroup?.key || 'discover']: true };
  useEffect(() => setOverrides({}), [currentPage]);

  const toggleGroup = key => setOverrides(prev => ({ ...prev, [key]: !(prev[key] ?? defaults[key]) }));

  const changeNavMode = (value, compact = false) => {
    setMode(value);
    setOverrides({});
    setNavOpen(value !== 'collapsed');
    if (compact && value === 'expanded') onToggle?.();
    if (!isTourPreview()) {
      try { sessionStorage.setItem(storageKey, value); } catch {}
    }
  };
  return { mode, navOpen, setNavOpen, expandedGroups: { ...defaults, ...overrides }, toggleGroup, changeNavMode };
}