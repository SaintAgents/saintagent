import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Circle, Video, Users, Coffee, Moon } from "lucide-react";

const STATUS_CONFIG = {
  online: { label: 'Online', color: 'bg-emerald-500', icon: Circle },
  away: { label: 'Away', color: 'bg-amber-500', icon: Coffee },
  busy: { label: 'Busy', color: 'bg-rose-500', icon: Moon },
  live_streaming: { label: 'Live', color: 'bg-red-500 animate-pulse', icon: Video },
  in_meeting: { label: 'In Meeting', color: 'bg-blue-500', icon: Users },
  offline: { label: 'Offline', color: 'bg-slate-400', icon: Circle }
};

export default function LiveStatusIndicator({ userId, showDropdown = false, size = 'sm' }) {
  const queryClient = useQueryClient();

  const { data: liveStatus } = useQuery({
    queryKey: ['liveStatus', userId],
    queryFn: async () => {
      try {
        const statuses = await base44.entities.LiveStatus.filter({ user_id: userId }, '-updated_date', 1);
        return statuses?.[0];
      } catch (err) {
        console.warn('LiveStatus fetch error:', err?.message);
        return null;
      }
    },
    enabled: !!userId,
    refetchInterval: 120000, // Poll every 2 min to reduce API calls
    staleTime: 60000,
    retry: false,
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus) => {
      const existing = await base44.entities.LiveStatus.filter({ user_id: currentUser.email }, '-updated_date', 1);
      if (existing?.[0]) {
        return base44.entities.LiveStatus.update(existing[0].id, {
          status: newStatus,
          last_heartbeat: new Date().toISOString()
        });
      } else {
        return base44.entities.LiveStatus.create({
          user_id: currentUser.email,
          status: newStatus,
          last_heartbeat: new Date().toISOString()
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liveStatus', currentUser?.email] });
    }
  });

  // Heartbeat effect - update every 5 minutes when online (generous interval to avoid rate limits)
  useEffect(() => {
    if (!currentUser?.email || userId !== currentUser.email) return;
    
    const heartbeat = async () => {
      try {
        const existing = await base44.entities.LiveStatus.filter({ user_id: currentUser.email }, '-updated_date', 1);
        if (existing?.[0] && existing[0].status !== 'offline') {
          await base44.entities.LiveStatus.update(existing[0].id, {
            last_heartbeat: new Date().toISOString()
          });
        }
      } catch (err) {
        // Silently skip on rate limit
        console.warn('LiveStatus heartbeat skipped:', err?.message);
      }
    };

    // Initial heartbeat after 30s delay to avoid competing with page load
    const initialTimeout = setTimeout(heartbeat, 30000);
    const interval = setInterval(heartbeat, 300000); // 5 minutes
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [currentUser?.email, userId]);

  const status = liveStatus?.status || 'offline';
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.offline;
  const Icon = config.icon;

  const sizeClasses = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const dotElement = (
    <span 
      className={cn(
        "rounded-full border-2 border-white",
        config.color,
        sizeClasses[size]
      )}
      title={config.label}
    />
  );

  if (!showDropdown || userId !== currentUser?.email) {
    return dotElement;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="focus:outline-none">
          {dotElement}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-40">
        {Object.entries(STATUS_CONFIG).filter(([key]) => key !== 'live_streaming' && key !== 'in_meeting').map(([key, cfg]) => {
          const StatusIcon = cfg.icon;
          return (
            <DropdownMenuItem 
              key={key}
              onClick={() => updateStatusMutation.mutate(key)}
              className="gap-2"
            >
              <span className={cn("w-2.5 h-2.5 rounded-full", cfg.color)} />
              {cfg.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Hook to initialize and maintain live status
export function useLiveStatus() {
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  useEffect(() => {
    if (!currentUser?.email) return;
    let isMounted = true;
    let retryTimeout = null;

    const initStatus = async (attempt = 0) => {
      if (!isMounted) return;
      try {
        const existing = await base44.entities.LiveStatus.filter({ user_id: currentUser.email }, '-updated_date', 1);
        if (!isMounted) return;
        
        const now = new Date().toISOString();
        if (!existing?.length) {
          await base44.entities.LiveStatus.create({
            user_id: currentUser.email,
            status: 'online',
            last_heartbeat: now
          });
        } else {
          await base44.entities.LiveStatus.update(existing[0].id, {
            status: 'online',
            last_heartbeat: now
          });
        }
        if (isMounted) {
          queryClient.invalidateQueries({ queryKey: ['liveStatus', currentUser.email] });
        }
      } catch (err) {
        console.warn('LiveStatus init attempt', attempt + 1, 'skipped:', err?.message);
        // Retry up to 3 times with increasing delay (10s, 20s, 40s)
        if (isMounted && attempt < 3) {
          const delay = (attempt + 1) * 10000;
          retryTimeout = setTimeout(() => initStatus(attempt + 1), delay);
        }
      }
    };

    // CRITICAL: Delay init by 5 seconds to let the main page load first
    // This avoids competing with all the other API calls that fire on mount
    const initDelay = setTimeout(() => initStatus(0), 5000);

    // Set offline on page unload by updating the LiveStatus record directly
    // The sendBeacon to /api/offline doesn't exist, so we mark offline via visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // When tab becomes hidden, update heartbeat so we know when user left
        // The user will appear "stale" after the window expires
        base44.entities.LiveStatus.filter({ user_id: currentUser.email }, '-updated_date', 1)
          .then(existing => {
            if (existing?.[0]) {
              base44.entities.LiveStatus.update(existing[0].id, {
                last_heartbeat: new Date().toISOString()
              }).catch(() => {});
            }
          }).catch(() => {});
      } else if (document.visibilityState === 'visible') {
        // When tab becomes visible again, refresh status
        initStatus(0);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      clearTimeout(initDelay);
      if (retryTimeout) clearTimeout(retryTimeout);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentUser?.email]);
}