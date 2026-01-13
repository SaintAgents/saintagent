import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { X } from 'lucide-react';

export default function BetaTicker({ topbarCollapsed, sidebarCollapsed }) {
  const [isDismissed, setIsDismissed] = useState(() => {
    // Initialize from sessionStorage
    try {
      return sessionStorage.getItem('betaTickerDismissed') === 'true';
    } catch {
      return false;
    }
  });
  
  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem('betaTickerDismissed', 'true');
    } catch {}
  };
  
  // Don't render if dismissed
  if (isDismissed) return null;
  
  // Beta Ticker - only show when topbar is not collapsed
  if (!topbarCollapsed) {
    return (
      <div 
        className={cn(
          "fixed left-0 right-0 z-40 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-white text-center py-1.5 text-sm font-medium overflow-hidden transition-all duration-300",
          sidebarCollapsed ? "pl-20" : "pl-64"
        )}
        style={{ top: '64px' }}
      >
        <div className="flex items-center justify-center relative">
          <div className="animate-marquee whitespace-nowrap inline-block">
            🚀 This is a Mock up demo app - many elements are demonstrations and examples - live launch scheduled for 2/22/26 - earn x3 GGG as a beta tester now 🚀 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            🚀 This is a Mock up demo app - many elements are demonstrations and examples - live launch scheduled for 2/22/26 - earn x3 GGG as a beta tester now 🚀 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </div>
          <button
            onClick={handleDismiss}
            className="absolute right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
            title="Dismiss until next session"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }
  
  // Beta Ticker when BOTH topbar AND sidebar are collapsed - shows thin bar
  if (topbarCollapsed && sidebarCollapsed) {
    return (
      <div 
        className="fixed left-20 right-0 z-40 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-white text-center py-0.5 text-xs font-medium overflow-hidden transition-all duration-300"
        style={{ top: '32px' }}
      >
        <div className="flex items-center justify-center relative">
          <div className="animate-marquee whitespace-nowrap inline-block">
            🚀 BETA - live launch 2/22/26 🚀 &nbsp;&nbsp;&nbsp;&nbsp;
            🚀 BETA - live launch 2/22/26 🚀 &nbsp;&nbsp;&nbsp;&nbsp;
          </div>
          <button
            onClick={handleDismiss}
            className="absolute right-2 p-0.5 rounded-full hover:bg-white/20 transition-colors"
            title="Dismiss until next session"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }
  
  return null;
}