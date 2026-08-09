import { useEffect, useState } from 'react';

const STORAGE_KEY = 'surfaceOpacitySettings';
const SIDEBAR_KEY = 'sidebarOpacitySettings';

function getSettings(key, defaults) {
  try { const s = localStorage.getItem(key); if (s) return { ...defaults, ...JSON.parse(s) }; } catch {}
  return defaults;
}

const SURFACE_DEFAULTS = {
  surfaceOpacity: 85, heroOpacity: 30, bgOpacity: 90, contentStart: 0,
  whiteWash: 0, cardBg: 90, cardOpacity: 95, cmdBackdrop: 85, applyAll: true,
};

const SIDEBAR_DEFAULTS = { sidebarOpacity: 100, sidebarBg: 90, fontBrightness: 100 };

export default function SurfaceOpacityController() {
  const [surface, setSurface] = useState(() => getSettings(STORAGE_KEY, SURFACE_DEFAULTS));
  const [sidebar, setSidebar] = useState(() => getSettings(SIDEBAR_KEY, SIDEBAR_DEFAULTS));

  useEffect(() => {
    const h1 = (e) => setSurface(e.detail || getSettings(STORAGE_KEY, SURFACE_DEFAULTS));
    const h2 = (e) => setSidebar(e.detail || getSettings(SIDEBAR_KEY, SIDEBAR_DEFAULTS));
    window.addEventListener('surfaceOpacityChanged', h1);
    window.addEventListener('sidebarOpacityChanged', h2);
    return () => {
      window.removeEventListener('surfaceOpacityChanged', h1);
      window.removeEventListener('sidebarOpacityChanged', h2);
    };
  }, []);

  // Inject a dynamic <style> tag
  const surfaceCss = `
    /* Surface Opacity Controls */
    main > .page-hero,
    main .page-hero {
      opacity: ${surface.heroOpacity / 100} !important;
    }
    main {
      --surface-opacity: ${surface.surfaceOpacity / 100};
      --card-bg-opacity: ${surface.cardBg / 100};
      --card-opacity: ${surface.cardOpacity / 100};
    }
    main .rounded-xl:not(img):not([data-no-filter]),
    main .rounded-lg:not(img):not([data-no-filter]),
    main .rounded-2xl:not(img):not([data-no-filter]) {
      opacity: ${surface.cardOpacity / 100};
    }
    ${surface.contentStart > 0 ? `
    main > *:first-child {
      margin-top: ${surface.contentStart}px !important;
    }` : ''}
    ${surface.whiteWash > 0 ? `
    main::before {
      content: '';
      position: fixed;
      inset: 0;
      background: rgba(255,255,255,${surface.whiteWash / 100});
      pointer-events: none;
      z-index: 0;
    }` : ''}
    /* Sidebar Opacity Controls */
    aside, [data-sidebar], nav.sidebar {
      opacity: ${sidebar.sidebarOpacity / 100} !important;
    }
    aside > div:first-child, [data-sidebar] > div:first-child {
      background-color: rgba(var(--sidebar-bg-rgb, 15,23,42), ${sidebar.sidebarBg / 100}) !important;
    }
    aside a, aside span, aside p, [data-sidebar] a, [data-sidebar] span, [data-sidebar] p {
      filter: brightness(${sidebar.fontBrightness / 100}) !important;
    }
  `;

  return <style dangerouslySetInnerHTML={{ __html: surfaceCss }} />;
}