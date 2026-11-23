import { useState, useSyncExternalStore } from 'react';

const videoUrl = 'https://base44.app/api/apps/694f3e0401b05e6e8a042002/files/mp/public/694f3e0401b05e6e8a042002/82373bef9_saintagent-animated-logo.mp4';
const motionQuery = '(prefers-reduced-motion: reduce)';

function subscribe(onChange) {
  const media = window.matchMedia(motionQuery);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

function reducedMotion() {
  return window.matchMedia(motionQuery).matches;
}

export default function AnimatedBrandLogo({ className, fallback, src = videoUrl }) {
  const reduce = useSyncExternalStore(subscribe, reducedMotion, () => true);
  const [failed, setFailed] = useState(false);
  if (reduce || failed) return <img className={className} src={fallback} alt="SaintAgent logo" />;

  return <video className={className} src={src} poster={fallback} role="img" aria-label="SaintAgent logo" autoPlay muted loop playsInline onError={() => setFailed(true)} />;
}