import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { cn } from "@/lib/utils";
import { X, Megaphone, AlertTriangle, Wrench, Calendar, GripHorizontal, Pin, PinOff } from 'lucide-react';

export default function AnnouncementBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [pinned, setPinned] = useState(true); // pinned = inline at top, unpinned = floating
  const [initialized, setInitialized] = useState(false);
  const dragRef = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Load dismissed state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('dismissedAnnouncementV2');
      if (stored) setDismissed(true);
    } catch {}
  }, []);

  const { data: settings } = useQuery({
    queryKey: ['platformSettings'],
    queryFn: () => base44.entities.PlatformSetting.list(),
    staleTime: 60000
  });

  // Find the first PlatformSetting record that has a non-empty announcement_banner
  const announcement = settings?.reduce((found, s) => {
    if (found) return found;
    if (s.announcement_banner && s.announcement_banner.trim()) return s.announcement_banner;
    return null;
  }, null) || null;

  // Initialize floating position
  useEffect(() => {
    if (!pinned && !initialized && typeof window !== 'undefined') {
      setPosition({ x: Math.max(0, (window.innerWidth - 500) / 2), y: 80 });
      setInitialized(true);
    }
  }, [pinned, initialized]);

  // Drag handlers
  const handleMouseDown = (e) => {
    if (pinned) return;
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e) => {
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - 300, e.clientX - dragOffset.current.x)),
        y: Math.max(0, Math.min(window.innerHeight - 60, e.clientY - dragOffset.current.y))
      });
    };
    const handleMouseUp = () => setIsDragging(false);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleDismiss = () => {
    setDismissed(true);
    try { localStorage.setItem('dismissedAnnouncementV2', 'true'); } catch {}
  };

  const handleUnpin = () => {
    setPinned(false);
    setInitialized(false);
  };

  if (!announcement || dismissed) return null;

  // Detect type based on keywords
  const lower = announcement.toLowerCase();
  const isMaintenance = lower.includes('maintenance') || lower.includes('downtime');
  const isWarning = lower.includes('warning') || lower.includes('urgent') || lower.includes('important');
  const isEvent = lower.includes('event') || lower.includes('live') || lower.includes('join us');

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

  // Pinned: inline banner at top
  if (pinned) {
    return (
      <div className={cn("w-full z-[50] text-white py-2 px-4 transition-all duration-300", getBgClass())}>
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 justify-center">
            <div className="flex items-center gap-2 animate-pulse shrink-0">{getIcon()}</div>
            <p className="text-sm font-medium truncate">{announcement}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleUnpin}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors bg-black/20"
              title="Detach as floating window"
            >
              <PinOff className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors bg-black/20"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Unpinned: floating draggable window
  return (
    <div
      ref={dragRef}
      className={cn(
        "fixed z-[9999] rounded-xl shadow-2xl text-white overflow-hidden",
        "border border-white/20",
        getBgClass(),
        isDragging ? "cursor-grabbing opacity-90" : ""
      )}
      style={{
        left: position.x,
        top: position.y,
        minWidth: 320,
        maxWidth: 500
      }}
    >
      {/* Drag handle */}
      <div
        className="flex items-center justify-between px-3 py-1.5 bg-black/20 cursor-grab select-none"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-1.5 text-white/70 text-xs">
          <GripHorizontal className="w-3.5 h-3.5" />
          <span>Announcement</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPinned(true)}
            className="p-1 rounded hover:bg-white/20 transition-colors"
            title="Pin back to top"
          >
            <Pin className="w-3 h-3" />
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 rounded hover:bg-white/20 transition-colors"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-3 flex items-center gap-3">
        <div className="animate-pulse shrink-0">{getIcon()}</div>
        <p className="text-sm font-medium leading-snug">{announcement}</p>
      </div>
    </div>
  );
}