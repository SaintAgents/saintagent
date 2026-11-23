import React, { useRef, useEffect, useState } from 'react';
import { getHackerVideoConfig } from '@/components/hud/videoLibrary';

const STORAGE_KEY = 'videoBgSettings';

function getSettings() {
  try { const s = localStorage.getItem(STORAGE_KEY); if (s) return JSON.parse(s); } catch {}
  return {};
}

export default function VideoBackgroundLayer({ currentPageName, theme }) {
  const videoRef = useRef(null);
  const [settings, setSettings] = useState(getSettings);

  const surfaceMap = {
    'CommandDeck': 'commandDeck',
    'Profile': 'profile',
    'Missions': 'missions',
    'Projects': 'projects',
    'Marketplace': 'marketplace',
    'Messages': 'messages',
  };
  const currentSurface = surfaceMap[currentPageName] || 'global';

  useEffect(() => {
    const handler = () => setSettings(getSettings());
    window.addEventListener('videoBgSettingsChanged', handler);
    return () => window.removeEventListener('videoBgSettingsChanged', handler);
  }, []);

  // Hacker mode has its own setting so automatic playback never changes other themes.
  const surfaceConfig = settings[currentSurface];
  const globalConfig = settings.global;
  const config = theme === 'hacker' ? getHackerVideoConfig(settings)
    : surfaceConfig?.videoUrl && surfaceConfig.enabled ? surfaceConfig : globalConfig;
  const active = Boolean(config?.videoUrl && config.enabled && (theme === 'hacker'
    || (config.themeFilter !== 'light' || theme === 'light') && (config.themeFilter !== 'dark' || theme === 'dark')));

  useEffect(() => {
    if (active) document.documentElement.setAttribute('data-video-active', 'true');
    return () => document.documentElement.removeAttribute('data-video-active');
  }, [active]);

  if (!active) return null;

  const opacity = config.opacity ?? 0.3;
  const playbackRate = config.speed ?? 1;
  const blurPx = config.blur ?? 0;
  const isMuted = config.muted !== false;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      <video
        ref={videoRef}
        key={config.videoUrl}
        src={config.videoUrl}
        autoPlay
        loop
        muted={isMuted}
        playsInline
        onLoadedMetadata={() => {
          if (videoRef.current) videoRef.current.playbackRate = playbackRate;
        }}
        className="w-full h-full object-cover"
        style={{
          opacity,
          filter: theme === 'hacker' ? `var(--hacker-video-filter) blur(${blurPx}px)` : blurPx > 0 ? `blur(${blurPx}px)` : 'none',
          transform: blurPx > 0 ? 'scale(1.05)' : 'none',
        }}
      />
    </div>
  );
}