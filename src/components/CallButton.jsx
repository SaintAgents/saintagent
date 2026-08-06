import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import DirectVideoCall from '@/components/video/DirectVideoCall';

export default function CallButton({ userId, userName, userAvatar, variant = 'icon', className }) {
  const [callOpen, setCallOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 1800000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const startCall = async (e) => {
    e?.stopPropagation?.();
    if (!currentUser || userId === currentUser.email) return;
    setCallOpen(true);
    setIsFullscreen(true);
    try {
      await base44.entities.Notification.create({
        user_id: userId,
        type: 'meeting',
        title: `${currentUser.full_name || 'Someone'} is calling you`,
        message: 'Open their profile to join the call',
        priority: 'urgent',
      });
    } catch (_) {}
  };

  if (currentUser && userId === currentUser.email) return null;

  return (
    <>
      {variant === 'icon' ? (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={startCall}
                className={`h-7 w-7 flex items-center justify-center rounded-md border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 transition-colors ${className || ''}`}
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">Call {userName || 'member'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <Button
          onClick={startCall}
          variant="outline"
          className={`rounded-xl gap-2 text-sm border-emerald-300 text-emerald-700 hover:bg-emerald-50 ${className || ''}`}
        >
          <Phone className="w-4 h-4" />
          Call
        </Button>
      )}

      {callOpen && (
        <div className="fixed inset-0 z-[200]">
          <DirectVideoCall
            recipientId={userId}
            recipientName={userName || 'Member'}
            recipientAvatar={userAvatar || ''}
            user={currentUser}
            onClose={() => { setCallOpen(false); setIsFullscreen(false); }}
            isFullscreen={isFullscreen}
            onToggleFullscreen={() => setIsFullscreen(f => !f)}
          />
        </div>
      )}
    </>
  );
}