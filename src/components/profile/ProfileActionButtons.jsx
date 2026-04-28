import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { MessageCircle, Calendar, Video, Loader2 } from "lucide-react";
import FriendRequestButton from '@/components/friends/FriendRequestButton';
import TipButton from '@/components/creator/TipButton';

export default function ProfileActionButtons({ profile, currentUser, currentUserProfile }) {
  const [zoomLoading, setZoomLoading] = useState(false);

  const handleMessage = () => {
    document.dispatchEvent(new CustomEvent('openFloatingChat', {
      detail: { recipientId: profile?.user_id, recipientName: profile?.display_name || 'User', recipientAvatar: profile?.avatar_url || '' },
      bubbles: true
    }));
  };

  const handleBook = () => {
    window.location.href = '/BookCall?host=' + encodeURIComponent(profile?.user_id);
  };

  const handleZoom = async () => {
    if (zoomLoading) return;
    setZoomLoading(true);
    try {
      const res = await base44.functions.invoke('zoomMeeting', {
        action: 'create',
        meetingDetails: {
          topic: `Meeting: ${currentUser?.full_name || 'You'} & ${profile?.display_name || 'Guest'}`,
          duration: 30
        },
        sendEmails: true,
        hostEmail: currentUser?.email,
        hostName: currentUser?.full_name,
        guestEmail: profile?.user_id,
        guestName: profile?.display_name
      });
      if (res.data?.meeting?.join_url) {
        window.open(res.data.meeting.join_url, '_blank');
      }
    } catch (err) {
      console.error('Zoom invite failed:', err);
    } finally {
      setZoomLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button onClick={handleMessage} className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl gap-2 text-sm">
        <MessageCircle className="w-4 h-4" /> Message
      </Button>
      <Button onClick={handleBook} variant="outline" className="rounded-xl gap-2 text-sm border-violet-300 text-violet-700 hover:bg-violet-50">
        <Calendar className="w-4 h-4" /> Book
      </Button>
      <FriendRequestButton
        targetUserId={profile?.user_id}
        targetUserName={profile?.display_name}
        targetUserAvatar={profile?.avatar_url}
        currentUser={currentUser}
        currentUserProfile={currentUserProfile}
      />
      <TipButton
        toUserId={profile?.user_id}
        toUserName={profile?.display_name}
        contextType="profile"
        contextId={profile?.id}
      />
      <Button onClick={handleZoom} disabled={zoomLoading} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2 text-sm">
        {zoomLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />} Zoom
      </Button>
    </div>
  );
}