import React, { useState, useEffect } from 'react';
import GuidedWalkthrough from '@/components/walkthrough/GuidedWalkthrough';
import { readWalkthrough } from '@/components/walkthrough/walkthroughSession';

export default function WalkthroughManager() {
  const [activeWalkthrough, setActiveWalkthrough] = useState(() => readWalkthrough()?.id ?? null);

  // Listen for walkthrough launch events
  useEffect(() => {
    const handleLaunch = (e) => {
      setActiveWalkthrough(e.detail?.id || 'business_entity');
    };
    document.addEventListener('launchWalkthrough', handleLaunch);
    return () => document.removeEventListener('launchWalkthrough', handleLaunch);
  }, []);

  if (!activeWalkthrough) return null;

  return (
    <GuidedWalkthrough 
      walkthroughId={activeWalkthrough} 
      onClose={() => setActiveWalkthrough(null)} 
    />
  );
}