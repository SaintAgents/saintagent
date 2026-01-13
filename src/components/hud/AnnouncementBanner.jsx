import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { cn } from "@/lib/utils";
import { X, Megaphone, AlertTriangle, Wrench, Calendar } from 'lucide-react';

export default function AnnouncementBanner({ sidebarCollapsed, topbarCollapsed }) {
  const [dismissed, setDismissed] = useState(false);
  const [dismissedId, setDismissedId] = useState(null);

  // Load dismissed state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('dismissedAnnouncement');
      if (stored) setDismissedId(stored);
    } catch {}
  }, []);

  const { data: settings } = useQuery({
    queryKey: ['platformSettings'],
    queryFn: () => base44.entities.PlatformSetting.list(),
    staleTime: 60000
  });

  const announcement = settings?.[0]?.announcement_banner;
  const announcementId = announcement ? btoa(announcement).slice(0, 16) : null;

  // Reset dismissed state if announcement changed
  useEffect(() => {
    if (announcementId && dismissedId !== announcementId) {
      setDismissed(false);
    }
  }, [announcementId, dismissedId]);

  const handleDismiss = () => {
    setDismissed(true);
    if (announcementId) {
      setDismissedId(announcementId);
      try {
        localStorage.setItem('dismissedAnnouncement', announcementId);
      } catch {}
    }
  };

  if (!announcement || dismissed || dismissedId === announcementId) return null;

  // Detect type based on keywords
  const lowerAnnouncement = announcement.toLowerCase();
  const isMaintenance = lowerAnnouncement.includes('maintenance') || lowerAnnouncement.includes('downtime');
  const isWarning = lowerAnnouncement.includes('warning') || lowerAnnouncement.includes('urgent') || lowerAnnouncement.includes('important');
  const isEvent = lowerAnnouncement.includes('event') || lowerAnnouncement.includes('live') || lowerAnnouncement.includes('join us');

  const getIcon = () => {
    if (isMaintenance) return <Wrench className="w-4 h-4" />;
    if (isWarning) return <AlertTriangle className="w-4 h-4" />;
    if (isEvent) return <Calendar className="w-4 h-4" />;
    return <Megaphone className="w-4 h-4" />;
  };

  const getBgClass = () => {
    if (isMaintenance) return 'bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700';
    if (isWarning) return 'bg-gradient-to-r from-red-600 via-red-500 to-red-600';
    if (isEvent) return 'bg-gradient-to-r from-violet-600 via-purple-500 to-violet-600';
    return 'bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600';
  };

  // Position below ticker (ticker is at top: 64px, height ~32px)
  const topPosition = topbarCollapsed ? '32px' : '96px';

  return (
    <div 
      className={cn(
        "fixed left-0 right-0 z-39 text-white py-2 px-4 transition-all duration-300",
        getBgClass(),
        sidebarCollapsed ? "pl-24" : "pl-68"
      )}
      style={{ top: topPosition }}
    >
      <div className="max-w-4xl mx-auto flex items-center justify-center gap-3">
        <div className="flex items-center gap-2 animate-pulse">
          {getIcon()}
        </div>
        <p className="text-sm font-medium">{announcement}</p>
        <button
          onClick={handleDismiss}
          className="ml-4 p-1 rounded-full hover:bg-white/20 transition-colors"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}