import React from 'react';
import { X } from 'lucide-react';
import { createPageUrl } from '@/utils';

// Pages that should NOT show the mobile close button (main nav destinations)
const MAIN_PAGES = ['CommandDeck', 'Home', 'Landing', 'Onboarding', 'Join', 'Welcome'];

export default function MobileCloseButton({ currentPageName }) {
  // Don't show on main pages
  if (MAIN_PAGES.includes(currentPageName)) {
    return null;
  }
  
  const handleClose = () => {
    // Try to go back, otherwise go to CommandDeck
    if (window.history.length > 2) {
      window.history.back();
    } else {
      window.location.href = createPageUrl('CommandDeck');
    }
  };
  
  return (
    <button
      className="mobile-close-btn"
      onClick={handleClose}
      aria-label="Close"
    >
      <X className="w-5 h-5" />
    </button>
  );
}