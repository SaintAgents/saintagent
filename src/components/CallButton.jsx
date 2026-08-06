import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Phone, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function CallButton({ userId, userName, variant = 'icon', className }) {
  const [loading, setLoading] = useState(false);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 1800000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const handleCall = async (e) => {
    e?.stopPropagation?.();
    if (loading || !currentUser || userId === currentUser.email) return;
    setLoading(true);
    try {
      const res = await base44.functions.invoke('zoomMeeting', {
        action: 'create',
        meetingDetails: {
          topic: `Call: ${currentUser.full_name || 'You'} & ${userName || 'Member'}`,
          duration: 15
        },
        sendEmails: true,
        hostEmail: currentUser.email,
        hostName: currentUser.full_name,
        guestEmail: userId,
        guestName: userName
      });
      if (res.data?.meeting?.join_url) {
        // Notify the recipient
        try {
          await base44.entities.Notification.create({
            user_id: userId,
            type: 'meeting',
            title: `${currentUser.full_name} is calling you`,
            message: `Click to join the call`,
            action_url: res.data.meeting.join_url,
            priority: 'urgent',
          });
        } catch (_) {}
        window.open(res.data.meeting.join_url, '_blank');
      }
    } catch (err) {
      console.error('Call failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Don't show call button for yourself
  if (currentUser && userId === currentUser.email) return null;

  if (variant === 'icon') {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleCall}
              disabled={loading}
              className={`h-7 w-7 flex items-center justify-center rounded-md border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 transition-colors disabled:opacity-50 ${className || ''}`}
              title={`Call ${userName || 'member'}`}
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
              ) : (
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">Call {userName || 'member'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button
      onClick={handleCall}
      disabled={loading}
      variant="outline"
      className={`rounded-xl gap-2 text-sm border-emerald-300 text-emerald-700 hover:bg-emerald-50 ${className || ''}`}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />}
      Call
    </Button>
  );
}