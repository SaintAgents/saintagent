import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck, UserX, Clock, MessageCircle } from 'lucide-react';

export default function FriendRequestButton({ targetUserId, targetUserName, targetUserAvatar, currentUser, currentUserProfile }) {
  const queryClient = useQueryClient();

  const { data: friendships = [] } = useQuery({
    queryKey: ['friendships', currentUser?.email, targetUserId],
    queryFn: () => base44.entities.Friendship.filter({
      $or: [
        { requester_id: currentUser?.email, recipient_id: targetUserId },
        { requester_id: targetUserId, recipient_id: currentUser?.email }
      ]
    }),
    enabled: !!currentUser?.email && !!targetUserId && currentUser?.email !== targetUserId
  });

  const friendship = friendships?.[0];
  const isPending = friendship?.status === 'pending';
  const isAccepted = friendship?.status === 'accepted';
  const iAmRequester = friendship?.requester_id === currentUser?.email;

  const sendRequestMutation = useMutation({
    mutationFn: () => base44.entities.Friendship.create({
      requester_id: currentUser.email,
      requester_name: currentUserProfile?.display_name || currentUser.full_name,
      requester_avatar: currentUserProfile?.avatar_url,
      recipient_id: targetUserId,
      recipient_name: targetUserName,
      recipient_avatar: targetUserAvatar,
      status: 'pending'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendships'] });
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
    }
  });

  const acceptRequestMutation = useMutation({
    mutationFn: () => base44.entities.Friendship.update(friendship.id, {
      status: 'accepted',
      accepted_at: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendships'] });
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    }
  });

  const declineRequestMutation = useMutation({
    mutationFn: () => base44.entities.Friendship.update(friendship.id, {
      status: 'declined'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendships'] });
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
    }
  });

  const cancelRequestMutation = useMutation({
    mutationFn: () => base44.entities.Friendship.delete(friendship.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendships'] });
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
    }
  });

  // Don't show button for own profile
  if (!currentUser?.email || currentUser.email === targetUserId) {
    return null;
  }

  // Already friends
  if (isAccepted) {
    return (
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="gap-1.5 text-emerald-600 border-emerald-200 bg-emerald-50">
          <UserCheck className="w-4 h-4" />
          Friends
        </Button>
        <Button
          size="sm"
          className="gap-1.5 bg-blue-600 hover:bg-blue-700"
          onClick={() => {
            document.dispatchEvent(new CustomEvent('openFloatingChat', {
              detail: {
                recipientId: targetUserId,
                recipientName: targetUserName,
                recipientAvatar: targetUserAvatar
              }
            }));
          }}
        >
          <MessageCircle className="w-4 h-4" />
          Message
        </Button>
      </div>
    );
  }

  // Pending request I sent
  if (isPending && iAmRequester) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-amber-600 border-amber-200"
        onClick={() => cancelRequestMutation.mutate()}
        disabled={cancelRequestMutation.isPending}
      >
        <Clock className="w-4 h-4" />
        Request Sent
      </Button>
    );
  }

  // Pending request I received
  if (isPending && !iAmRequester) {
    return (
      <div className="flex gap-2">
        <Button
          size="sm"
          className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
          onClick={() => acceptRequestMutation.mutate()}
          disabled={acceptRequestMutation.isPending}
        >
          <UserCheck className="w-4 h-4" />
          Accept
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-red-600 border-red-200"
          onClick={() => declineRequestMutation.mutate()}
          disabled={declineRequestMutation.isPending}
        >
          <UserX className="w-4 h-4" />
          Decline
        </Button>
      </div>
    );
  }

  // No relationship - show add friend button
  return (
    <Button
      size="sm"
      className="gap-1.5 bg-violet-600 hover:bg-violet-700"
      onClick={() => sendRequestMutation.mutate()}
      disabled={sendRequestMutation.isPending}
    >
      <UserPlus className="w-4 h-4" />
      Add Friend
    </Button>
  );
}