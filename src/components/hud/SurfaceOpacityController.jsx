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
  fontDarker: 0, fontLighter: 100, fontSize: 100,
  bgVideoOpacity: 90, heroVideoHeight: 100, glow: 0,
  bgOverlay: 0, cmdCards: 100,
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
  const heroOp = surface.heroOpacity / 100;
  const cardOp = surface.cardOpacity / 100;

  const surfaceCss = `
    /* ========== HERO OPACITY ========== */
    /* Target .page-hero at any nesting depth inside main */
    main .page-hero {
      opacity: ${heroOp} !important;
    }

    /* ========== SURFACE VARS ========== */
    main {
      --surface-opacity: ${surface.surfaceOpacity / 100};
      --card-bg-opacity: ${surface.cardBg / 100};
      --card-opacity: ${cardOp};
    }

    /* ========== CARD OPACITY ========== */
    /* Exclude hero children and images from card opacity */
    main .rounded-xl:not(img):not([data-no-filter]):not(.page-hero *),
    main .rounded-lg:not(img):not([data-no-filter]):not(.page-hero *),
    main .rounded-2xl:not(img):not([data-no-filter]):not(.page-hero *) {
      opacity: ${cardOp};
    }

    /* ========== CMD DECK BACKDROP ========== */
    main[data-page='CommandDeck'] {
      --cmd-backdrop: ${surface.cmdBackdrop / 100};
    }

    /* ========== CONTENT START OFFSET ========== */
    ${surface.contentStart > 0 ? `
    main > *:first-child {
      margin-top: ${surface.contentStart}px !important;
    }` : ''}

    /* ========== WHITE WASH ========== */
    ${surface.whiteWash > 0 ? `
    main::before {
      content: '';
      position: fixed;
      inset: 0;
      background: rgba(255,255,255,${surface.whiteWash / 100});
      pointer-events: none;
      z-index: 0;
    }` : ''}

    /* ========== SIDEBAR ========== */
    aside, [data-sidebar], nav.sidebar {
      opacity: ${sidebar.sidebarOpacity / 100} !important;
    }
    aside > div:first-child, [data-sidebar] > div:first-child {
      background-color: rgba(var(--sidebar-bg-rgb, 15,23,42), ${sidebar.sidebarBg / 100}) !important;
    }
    aside a, aside span, aside p, [data-sidebar] a, [data-sidebar] span, [data-sidebar] p {
      filter: brightness(${sidebar.fontBrightness / 100}) !important;
    }

    /* ========== FONT DARKER / LIGHTER ========== */
    ${surface.fontDarker > 0 ? `
    main p, main span, main h1, main h2, main h3, main h4, main h5, main h6,
    main a, main label, main li, main td, main th, main div:not([data-sidebar]) {
      text-shadow: 0 0 ${surface.fontDarker / 10}px rgba(0,0,0,${surface.fontDarker / 100}) !important;
    }` : ''}

    main p, main span, main h1, main h2, main h3, main h4, main h5, main h6,
    main a, main label, main li {
      filter: brightness(${(surface.fontLighter ?? 100) / 100}) !important;
    }

    /* ========== FONT SIZE ========== */
    ${(surface.fontSize ?? 100) !== 100 ? `
    main {
      font-size: ${surface.fontSize}% !important;
    }` : ''}

    /* ========== BACKGROUND VIDEO OPACITY ========== */
    [data-video-layer] video, [data-video-layer] {
      opacity: ${(surface.bgVideoOpacity ?? 90) / 100} !important;
    }

    /* ========== HERO VIDEO HEIGHT ========== */
    .page-hero {
      max-height: ${surface.heroVideoHeight ?? 100}vh !important;
    }

    /* ========== GLOW ========== */
    ${(surface.glow ?? 0) > 0 ? `
    main .rounded-xl:not(img):not([data-no-filter]):not(.page-hero *),
    main .rounded-lg:not(img):not([data-no-filter]):not(.page-hero *),
    main .rounded-2xl:not(img):not([data-no-filter]):not(.page-hero *) {
      box-shadow: 0 0 ${surface.glow / 2}px ${surface.glow / 5}px rgba(99,102,241,${surface.glow / 200}) !important;
    }` : ''}

    /* ========== BACKGROUND OVERLAY ========== */
    ${(surface.bgOverlay ?? 0) > 0 ? `
    main::after {
      content: '';
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,${surface.bgOverlay / 100});
      pointer-events: none;
      z-index: 0;
    }` : ''}

    /* ========== COMMAND DECK CARDS ========== */
    main[data-page='CommandDeck'] .rounded-xl:not(img):not([data-no-filter]),
    main[data-page='CommandDeck'] .rounded-lg:not(img):not([data-no-filter]),
    main[data-page='CommandDeck'] .rounded-2xl:not(img):not([data-no-filter]) {
      opacity: ${(surface.cmdCards ?? 100) / 100} !important;
    }
  `;

  return <style dangerouslySetInnerHTML={{ __html: surfaceCss }} />;
}