import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageCircle, Users } from 'lucide-react';

export default function FriendsList({ userId, compact = false }) {
  const { data: friendships = [], isLoading } = useQuery({
    queryKey: ['friends', userId],
    queryFn: async () => {
      const [asRequester, asRecipient] = await Promise.all([
        base44.entities.Friendship.filter({
          requester_id: userId,
          status: 'accepted'
        }),
        base44.entities.Friendship.filter({
          recipient_id: userId,
          status: 'accepted'
        })
      ]);
      return [...asRequester, ...asRecipient];
    },
    enabled: !!userId
  });

  // Extract friend info from friendships
  const friends = friendships.map((f) => {
    const iAmRequester = f.requester_id === userId;
    return {
      id: f.id,
      friendId: iAmRequester ? f.recipient_id : f.requester_id,
      friendName: iAmRequester ? f.recipient_name : f.requester_name,
      friendAvatar: iAmRequester ? f.recipient_avatar : f.requester_avatar,
      acceptedAt: f.accepted_at
    };
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-600" />
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="text-center py-6 text-slate-500">
        <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No friends yet</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {friends.slice(0, 6).map((friend) => (
          <Avatar
            key={friend.id}
            className="w-10 h-10 cursor-pointer border-2 border-white shadow-sm hover:scale-110 transition-transform"
            data-user-id={friend.friendId}
          >
            <AvatarImage src={friend.friendAvatar} />
            <AvatarFallback>{friend.friendName?.[0] || '?'}</AvatarFallback>
          </Avatar>
        ))}
        {friends.length > 6 && (
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-600">
            +{friends.length - 6}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {friends.map((friend) => (
        <div
          key={friend.id}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <Avatar
            className="w-10 h-10 cursor-pointer"
            data-user-id={friend.friendId}
          >
            <AvatarImage src={friend.friendAvatar} />
            <AvatarFallback>{friend.friendName?.[0] || '?'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p
              className="font-medium text-sm text-slate-900 dark:text-white truncate cursor-pointer hover:underline"
              data-user-id={friend.friendId}
            >
              {friend.friendName || 'Unknown'}
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => {
              document.dispatchEvent(new CustomEvent('openFloatingChat', {
                detail: {
                  recipientId: friend.friendId,
                  recipientName: friend.friendName,
                  recipientAvatar: friend.friendAvatar
                }
              }));
            }}
          >
            <MessageCircle className="w-4 h-4 text-blue-600" />
          </Button>
        </div>
      ))}
    </div>
  );
}