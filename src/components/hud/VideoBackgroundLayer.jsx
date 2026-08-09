import React, { useRef, useEffect, useState } from 'react';

const STORAGE_KEY = 'videoBgSettings';

function getSettings() {
  try { const s = localStorage.getItem(STORAGE_KEY); if (s) return JSON.parse(s); } catch {}
  return {};
}

// Check if ANY surface has an active video
function hasActiveVideo(settings) {
  return Object.values(settings).some(s => s?.videoUrl && s?.enabled);
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

  // Resolve: surface-specific first, then global
  const surfaceConfig = settings[currentSurface];
  const globalConfig = settings['global'];
  const config = (surfaceConfig?.videoUrl && surfaceConfig?.enabled) ? surfaceConfig : 
                 (globalConfig?.videoUrl && globalConfig?.enabled) ? globalConfig : null;

  // Set data-video-active on <html> so CSS can make backgrounds transparent
  useEffect(() => {
    const active = !!config;
    if (active) {
      document.documentElement.setAttribute('data-video-active', 'true');
    } else {
      document.documentElement.removeAttribute('data-video-active');
    }
    return () => document.documentElement.removeAttribute('data-video-active');
  }, [config?.videoUrl, config?.enabled, currentSurface]);

  if (!config) return null;

  // Theme filter
  if (config.themeFilter === 'light' && theme !== 'light') return null;
  if (config.themeFilter === 'dark' && theme !== 'dark' && theme !== 'hacker') return null;

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
          filter: blurPx > 0 ? `blur(${blurPx}px)` : 'none',
          transform: blurPx > 0 ? 'scale(1.05)' : 'none',
        }}
      />
    </div>
  );
}