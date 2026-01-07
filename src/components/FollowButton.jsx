import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus } from "lucide-react";

export default function FollowButton({ targetUserId, className }) {
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  // Check if already following using Follow entity
  const { data: followRecords = [] } = useQuery({
    queryKey: ['following', currentUser?.email, targetUserId],
    queryFn: async () => {
      return base44.entities.Follow.filter({
        follower_id: currentUser.email,
        following_id: targetUserId
      });
    },
    enabled: !!currentUser && !!targetUserId && currentUser.email !== targetUserId
  });

  const isFollowing = followRecords.length > 0;

  const followMutation = useMutation({
    mutationFn: async () => {
      const targetProfiles = await base44.entities.UserProfile.filter({ user_id: targetUserId });
      const currentProfiles = await base44.entities.UserProfile.filter({ user_id: currentUser.email });
      const target = targetProfiles?.[0];
      const current = currentProfiles?.[0];
      if (!target || !current) return;

      if (isFollowing && followRecords?.[0]) {
        // Unfollow: delete follow record and decrement counters
        await base44.entities.Follow.delete(followRecords[0].id);
        await base44.entities.UserProfile.update(target.id, {
          follower_count: Math.max(0, (target.follower_count || 0) - 1)
        });
        await base44.entities.UserProfile.update(current.id, {
          following_count: Math.max(0, (current.following_count || 0) - 1)
        });
      } else if (!isFollowing) {
        // Follow: create record and increment counters
        await base44.entities.Follow.create({
          follower_id: current.user_id,
          follower_name: current.display_name,
          follower_avatar: current.avatar_url,
          following_id: target.user_id,
          following_name: target.display_name,
          following_avatar: target.avatar_url
        });
        await base44.entities.UserProfile.update(target.id, {
          follower_count: (target.follower_count || 0) + 1
        });
        await base44.entities.UserProfile.update(current.id, {
          following_count: (current.following_count || 0) + 1
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
    }
  });

  if (!currentUser || currentUser.email === targetUserId) {
    return null;
  }

  return (
    <Button
      onClick={() => followMutation.mutate()}
      variant={isFollowing ? "outline" : "default"} className="bg-purple-100 text-green-200 px-4 py-2 text-sm font-medium rounded-xl inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input shadow-sm hover:bg-accent hover:text-accent-foreground h-9 w-full"

      disabled={followMutation.isPending}>

      {isFollowing ?
      <>
          <UserMinus className="w-4 h-4 mr-2" />
          Unfollow
        </> :

      <>
          <UserPlus className="w-4 h-4 mr-2" />
          Follow
        </>
      }
    </Button>);

}