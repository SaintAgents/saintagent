import { useEffect, useState } from 'react';
import { heroMedia, heroThemeMatches, useSurfaceHeroes } from '@/components/hero/surfaceHeroSettings';

export function SurfaceMedia({ config, className = 'absolute inset-0 -z-10', theme, opacity }) {
  const media = heroMedia(config), image = config.mode === 'image';
  const [index, setIndex] = useState(0), [previous, setPrevious] = useState(null);
  const rotating = (image ? config.imageRotate : config.videoRotate) && media.length > 1;
  const interval = (image ? config.imageInterval : config.videoInterval) * 1000;
  const fade = Math.min(image ? config.imageFade : config.videoFade, interval);
  const active = index % media.length;
  useEffect(() => {
    if (!rotating || !interval) return;
    const timer = setTimeout(() => { setPrevious(active); setIndex(active + 1); }, interval);
    return () => clearTimeout(timer);
  }, [active, interval, rotating]);
  useEffect(() => {
    if (previous === null) return;
    const timer = setTimeout(() => setPrevious(null), fade);
    return () => clearTimeout(timer);
  }, [previous, fade]);
  useEffect(() => { setIndex(0); setPrevious(null); }, [JSON.stringify(media)]);
  return <div aria-hidden="true" className={`pointer-events-none overflow-hidden ${className}`} style={{ opacity: opacity ?? config.opacity }}>
    {media.map((item, i) => {
      const current = i === active, outgoing = previous === i && !current;
      if (!current && !outgoing && (!rotating || i !== (active + 1) % media.length)) return null;
      const vars = { objectFit: config.fit, objectPosition: config.position, filter: `${theme === 'hacker' && !image ? 'var(--hacker-video-filter) ' : ''}blur(${config.blur}px)`, transform: config.blur > 0 ? 'scale(1.05)' : undefined, opacity: current ? 1 : 0, transition: `opacity ${fade}ms ease`, zIndex: outgoing ? 1 : 0 };
      const classes = 'surface-hero-media absolute inset-0 h-full w-full';
      return image ? <img key={item.url} src={item.url} alt="" className={classes} style={vars} /> : <video key={item.url} src={item.url} autoPlay={current} loop muted={!current || config.muted !== false} playsInline preload={current ? 'auto' : 'metadata'} className={classes} style={vars} ref={node => {
        if (!node) return;
        node.playbackRate = config.speed;
        if (current && node.paused) node.play().catch(() => {});
        else if (!current && !outgoing) node.pause();
      }} />;
    })}
  </div>;
}

export default function SurfaceHeroLayer({ surface, theme, fallback, visible = true, opacity, desktopOnly = false }) {
  const state = useSurfaceHeroes();
  const [desktop, setDesktop] = useState(() => !desktopOnly || window.matchMedia('(min-width: 768px)').matches);
  useEffect(() => {
    if (!desktopOnly) return;
    const query = window.matchMedia('(min-width: 768px)'), sync = () => setDesktop(query.matches);
    sync(); query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, [desktopOnly]);
  const [detected, setDetected] = useState(() => document.documentElement.dataset.theme);
  useEffect(() => {
    if (theme || !visible) return;
    const root = document.documentElement, sync = () => setDetected(root.dataset.theme);
    sync(); const observer = new MutationObserver(sync); observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, [theme, visible]);
  const config = state.surfaces?.[surface] || fallback, currentTheme = theme || detected;
  if (!visible || !desktop || state.hidden || !config?.enabled || !heroMedia(config).length || !heroThemeMatches(config, currentTheme)) return null;
  return <SurfaceMedia key={config.mode} config={config} theme={currentTheme} opacity={opacity} />;
}