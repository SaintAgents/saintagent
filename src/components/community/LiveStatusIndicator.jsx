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
        const statuses = await base44.entities.LiveStatus.filter({ user_id: userId });
        return statuses?.[0];
      } catch (err) {
        console.warn('LiveStatus fetch error:', err?.message);
        return null;
      }
    },
    enabled: !!userId,
    refetchInterval: 60000, // Poll every 60s instead of 10s to reduce API calls
    staleTime: 30000,
    retry: false,
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus) => {
      const existing = await base44.entities.LiveStatus.filter({ user_id: currentUser.email });
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

  // Heartbeat effect - update every 2 minutes when online (reduced from 30s)
  useEffect(() => {
    if (!currentUser?.email || userId !== currentUser.email) return;
    
    const heartbeat = async () => {
      try {
        const existing = await base44.entities.LiveStatus.filter({ user_id: currentUser.email });
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

    const interval = setInterval(heartbeat, 120000); // 2 minutes instead of 30s
    return () => clearInterval(interval);
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

    const initStatus = async () => {
      try {
        const existing = await base44.entities.LiveStatus.filter({ user_id: currentUser.email });
        if (!isMounted) return;
        
        if (!existing?.length) {
          await base44.entities.LiveStatus.create({
            user_id: currentUser.email,
            status: 'online',
            last_heartbeat: new Date().toISOString()
          });
        } else {
          await base44.entities.LiveStatus.update(existing[0].id, {
            status: 'online',
            last_heartbeat: new Date().toISOString()
          });
        }
        if (isMounted) {
          queryClient.invalidateQueries({ queryKey: ['liveStatus', currentUser.email] });
        }
      } catch (err) {
        // Silently ignore rate limit or other errors - non-critical feature
        console.warn('LiveStatus init skipped:', err?.message);
      }
    };

    initStatus();

    // Set offline on page unload
    const handleUnload = () => {
      navigator.sendBeacon && navigator.sendBeacon('/api/offline', JSON.stringify({ user_id: currentUser.email }));
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => {
      isMounted = false;
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [currentUser?.email]);
}