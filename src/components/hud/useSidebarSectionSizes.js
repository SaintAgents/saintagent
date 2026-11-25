import { useState } from 'react';
import { isTourPreview } from '@/components/tour/tourPreviewTargets';

const key = 'sidebarSectionHeights';

export default function useSidebarSectionSizes(isCompact) {
  const preview = isTourPreview();
  const [sizes, setSizes] = useState(() => {
    if (preview) return {};
    try { return JSON.parse(localStorage.getItem(key)) || {}; } catch { return {}; }
  });
  return (section, detached) => {
    const name = `${detached ? 'detached' : isCompact ? 'compact' : 'docked'}:${section}`;
    return {
      height: sizes[name],
      onResize: height => setSizes(previous => {
        const next = { ...previous };
        if (height === undefined) delete next[name]; else next[name] = height;
        if (!preview) { try { localStorage.setItem(key, JSON.stringify(next)); } catch {} }
        return next;
      }),
    };
  };
}