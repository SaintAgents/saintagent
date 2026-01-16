import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserCheck, UserX, Users } from 'lucide-react';

export default function FriendRequestsPanel({ currentUser }) {
  const queryClient = useQueryClient();

  const { data: pendingRequests = [] } = useQuery({
    queryKey: ['friendRequests', currentUser?.email],
    queryFn: async () => {
      const requests = await base44.entities.Friendship.filter({
        recipient_id: currentUser?.email,
        status: 'pending'
      });
      return requests;
    },
    enabled: !!currentUser?.email
  });

  const acceptMutation = useMutation({
    mutationFn: (id) => base44.entities.Friendship.update(id, {
      status: 'accepted',
      accepted_at: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      queryClient.invalidateQueries({ queryKey: ['friendships'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    }
  });

  const declineMutation = useMutation({
    mutationFn: (id) => base44.entities.Friendship.update(id, { status: 'declined' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      queryClient.invalidateQueries({ queryKey: ['friendships'] });
    }
  });

  if (pendingRequests.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-slate-900/90 rounded-xl border p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-violet-600" />
        <h3 className="font-semibold text-slate-900 dark:text-white">Friend Requests</h3>
        <Badge className="bg-violet-100 text-violet-700">{pendingRequests.length}</Badge>
      </div>
      <div className="space-y-3">
        {pendingRequests.map((request) => (
          <div key={request.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
            <Avatar 
              className="w-10 h-10 cursor-pointer" 
              data-user-id={request.requester_id}
            >
              <AvatarImage src={request.requester_avatar} />
              <AvatarFallback>{request.requester_name?.[0] || '?'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p 
                className="font-medium text-sm text-slate-900 dark:text-white truncate cursor-pointer hover:underline"
                data-user-id={request.requester_id}
              >
                {request.requester_name || 'Unknown'}
              </p>
              <p className="text-xs text-slate-500">wants to be your friend</p>
            </div>
            <div className="flex gap-1.5">
              <Button
                size="sm"
                className="h-8 px-2 bg-emerald-600 hover:bg-emerald-700"
                onClick={() => acceptMutation.mutate(request.id)}
                disabled={acceptMutation.isPending}
              >
                <UserCheck className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-2 text-red-600 border-red-200"
                onClick={() => declineMutation.mutate(request.id)}
                disabled={declineMutation.isPending}
              >
                <UserX className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}