import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { X } from 'lucide-react';

export default function BetaTicker({ topbarCollapsed, sidebarCollapsed, currentPageName }) {
  const [isDismissed, setIsDismissed] = useState(() => {
    try {
      return sessionStorage.getItem('betaTickerDismissed') === 'true';
    } catch {
      return false;
    }
  });

  // Fetch platform settings to check if ticker is enabled
  const { data: settings = [] } = useQuery({
    queryKey: ['platformSettings'],
    queryFn: () => base44.entities.PlatformSetting.list(),
    staleTime: 60000
  });

  const setting = settings[0] || {};
  const tickerEnabled = setting.beta_bonus_active === true;
  const tickerMessage = setting.announcement_banner || 'Beta test active! Earn bonus GGG for feedback submissions.';
  
  // Hide on G3Dex page
  if (currentPageName === 'G3Dex') return null;
  
  // Don't render if not enabled in admin settings
  if (!tickerEnabled) return null;
  
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
          "fixed z-40 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-white text-center py-1.5 text-sm font-medium overflow-hidden transition-all duration-300",
          "left-0 right-0",
          "md:pl-20",
          !sidebarCollapsed && "md:pl-64",
          "top-[56px] md:top-[72px]"
        )}
      >
        <div className="flex items-center justify-center relative">
          <div className="animate-marquee whitespace-nowrap inline-block">
            🚀 {tickerMessage} 🚀 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            🚀 {tickerMessage} 🚀 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
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
  
  // Beta Ticker when topbar is collapsed - shows thin bar below collapsed topbar
  if (topbarCollapsed) {
    return (
      <div 
        className={cn(
          "fixed right-0 z-[51] bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-white text-center py-0.5 text-xs font-medium overflow-hidden transition-all duration-300",
          sidebarCollapsed ? "left-0 md:left-20" : "left-0 md:left-64"
        )}
        style={{ top: '40px' }}
      >
        <div className="flex items-center justify-center relative">
          <div className="animate-marquee whitespace-nowrap inline-block">
            🚀 {tickerMessage.slice(0, 50)}... 🚀 &nbsp;&nbsp;&nbsp;&nbsp;
            🚀 {tickerMessage.slice(0, 50)}... 🚀 &nbsp;&nbsp;&nbsp;&nbsp;
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