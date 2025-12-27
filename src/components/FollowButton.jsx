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

  // Check if already following (this would need a Follow entity)
  const { data: followRecords = [] } = useQuery({
    queryKey: ['following', currentUser?.email, targetUserId],
    queryFn: () => {
      // For now, we'll track this in a simple way
      // You would need to create a Follow entity with follower_id and following_id
      return [];
    },
    enabled: !!currentUser && !!targetUserId && currentUser.email !== targetUserId
  });

  const isFollowing = followRecords.length > 0;

  const followMutation = useMutation({
    mutationFn: async () => {
      // This would create a Follow record
      // For now, we'll just update follower counts directly
      const targetProfiles = await base44.entities.UserProfile.filter({ user_id: targetUserId });
      const currentProfiles = await base44.entities.UserProfile.filter({ user_id: currentUser.email });
      
      if (targetProfiles[0] && currentProfiles[0]) {
        if (isFollowing) {
          // Unfollow
          await base44.entities.UserProfile.update(targetProfiles[0].id, {
            follower_count: Math.max(0, (targetProfiles[0].follower_count || 0) - 1)
          });
          await base44.entities.UserProfile.update(currentProfiles[0].id, {
            following_count: Math.max(0, (currentProfiles[0].following_count || 0) - 1)
          });
        } else {
          // Follow
          await base44.entities.UserProfile.update(targetProfiles[0].id, {
            follower_count: (targetProfiles[0].follower_count || 0) + 1
          });
          await base44.entities.UserProfile.update(currentProfiles[0].id, {
            following_count: (currentProfiles[0].following_count || 0) + 1
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
    }
  });

  if (!currentUser || currentUser.email === targetUserId) {
    return null;
  }

  return (
    <Button
      onClick={() => followMutation.mutate()}
      variant={isFollowing ? "outline" : "default"}
      className={className}
      disabled={followMutation.isPending}
    >
      {isFollowing ? (
        <>
          <UserMinus className="w-4 h-4 mr-2" />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4 mr-2" />
          Follow
        </>
      )}
    </Button>
  );
}