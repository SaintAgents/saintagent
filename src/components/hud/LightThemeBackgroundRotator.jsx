import { useState, useEffect, useRef } from 'react';

const DEFAULT_BACKGROUNDS = [
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&q=80',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&q=80',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1920&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80',
];

function getStoredBackgrounds() {
  try {
    const saved = localStorage.getItem('lightBgImages');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_BACKGROUNDS;
}

function getStoredInterval() {
  try {
    const saved = localStorage.getItem('lightBgInterval');
    if (saved) return Math.max(5, parseInt(saved, 10) || 30);
  } catch {}
  return 30;
}

export default function LightThemeBackgroundRotator({ theme, bgEffect }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [backgrounds, setBackgrounds] = useState(getStoredBackgrounds);
  const [interval, setIntervalSec] = useState(getStoredInterval);
  const [opacity, setOpacity] = useState(1);
  const timerRef = useRef(null);

  // Listen for settings changes
  useEffect(() => {
    const handler = () => {
      setBackgrounds(getStoredBackgrounds());
      setIntervalSec(getStoredInterval());
    };
    window.addEventListener('lightBgSettingsChanged', handler);
    return () => window.removeEventListener('lightBgSettingsChanged', handler);
  }, []);

  // Rotate backgrounds
  useEffect(() => {
    if (theme !== 'light' || backgrounds.length <= 1) return;

    timerRef.current = window.setInterval(() => {
      // Fade out
      setOpacity(0);
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % backgrounds.length);
        setOpacity(1);
      }, 800);
    }, interval * 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [theme, backgrounds.length, interval]);

  // Reset index if backgrounds change
  useEffect(() => {
    setCurrentIndex(0);
  }, [backgrounds.length]);

  if (theme !== 'light') return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: -1 }}
    >
      <div
        className="absolute inset-0 transition-opacity duration-700 ease-in-out"
        style={{
          opacity,
          backgroundImage: `url(${backgrounds[currentIndex]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      {/* Subtle overlay so content stays readable */}
      <div className="absolute inset-0 bg-white/60" />
    </div>
  );
}