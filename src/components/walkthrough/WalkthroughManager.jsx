import React, { useState, useEffect } from 'react';
import GuidedWalkthrough from './GuidedWalkthrough';

export default function WalkthroughManager() {
  const [activeWalkthrough, setActiveWalkthrough] = useState(null);

  // Listen for walkthrough launch events
  useEffect(() => {
    const handleLaunch = (e) => {
      setActiveWalkthrough(e.detail?.id || 'business_entity');
    };
    document.addEventListener('launchWalkthrough', handleLaunch);
    return () => document.removeEventListener('launchWalkthrough', handleLaunch);
  }, []);

  // Check for persisted walkthrough on mount (survives navigation)
  useEffect(() => {
    const saved = sessionStorage.getItem('activeWalkthrough');
    if (saved) {
      const data = JSON.parse(saved);
      setActiveWalkthrough(data.id);
    }
  }, []);

  if (!activeWalkthrough) return null;

  return (
    <GuidedWalkthrough 
      walkthroughId={activeWalkthrough} 
      onClose={() => {
        setActiveWalkthrough(null);
        sessionStorage.removeItem('activeWalkthrough');
      }} 
    />
  );
}