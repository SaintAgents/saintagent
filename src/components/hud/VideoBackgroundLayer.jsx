import React, { useRef, useEffect, useState } from 'react';

const STORAGE_KEY = 'videoBgSettings';

function getSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return {};
}

export function getVideoSettingsForSurface(surface) {
  const all = getSettings();
  return all[surface] || null;
}

export default function VideoBackgroundLayer({ currentPageName, theme }) {
  const videoRef = useRef(null);
  const [settings, setSettings] = useState(getSettings);
  const [currentSurface, setCurrentSurface] = useState('global');

  // Determine which surface we're on
  useEffect(() => {
    const surfaceMap = {
      'CommandDeck': 'commandDeck',
      'Profile': 'profile',
      'Missions': 'missions',
      'Projects': 'projects',
      'Marketplace': 'marketplace',
      'Messages': 'messages',
    };
    setCurrentSurface(surfaceMap[currentPageName] || 'global');
  }, [currentPageName]);

  // Listen for settings updates from toolbar
  useEffect(() => {
    const handler = () => setSettings(getSettings());
    window.addEventListener('videoBgSettingsChanged', handler);
    return () => window.removeEventListener('videoBgSettingsChanged', handler);
  }, []);

  // Resolve which video to show: surface-specific first, then global, then none
  const surfaceConfig = settings[currentSurface];
  const globalConfig = settings['global'];
  const config = (surfaceConfig?.videoUrl ? surfaceConfig : globalConfig) || null;

  if (!config?.videoUrl || !config?.enabled) return null;

  // Check theme filter
  if (config.themeFilter === 'light' && theme !== 'light') return null;
  if (config.themeFilter === 'dark' && theme !== 'dark' && theme !== 'hacker') return null;

  const opacity = config.opacity ?? 0.3;
  const playbackRate = config.speed ?? 1;
  const blurPx = config.blur ?? 0;

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: -1 }}
    >
      <video
        ref={videoRef}
        src={config.videoUrl}
        autoPlay
        loop
        muted
        playsInline
        onLoadedMetadata={() => {
          if (videoRef.current) videoRef.current.playbackRate = playbackRate;
        }}
        className="w-full h-full object-cover"
        style={{
          opacity,
          filter: blurPx > 0 ? `blur(${blurPx}px)` : 'none',
          transform: blurPx > 0 ? 'scale(1.05)' : 'none', // prevent blur edge bleed
        }}
      />
    </div>
  );
}