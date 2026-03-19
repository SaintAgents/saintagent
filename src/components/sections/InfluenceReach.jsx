import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { TrendingUp, Flame } from "lucide-react";
import HelpHint from '@/components/hud/HelpHint';

export default function InfluenceReach({ profile, onBoost }) {
  const userId = profile?.user_id;

  const { data: followers = [] } = useQuery({
    queryKey: ['followersCount', userId],
    queryFn: () => base44.entities.Follow.filter({ following_id: userId }),
    enabled: !!userId,
  });

  const { data: following = [] } = useQuery({
    queryKey: ['followingCount', userId],
    queryFn: () => base44.entities.Follow.filter({ follower_id: userId }),
    enabled: !!userId,
  });

  const followerCount = followers.length;
  const followingCount = following.length;

  return (
    <div className="space-y-4">
      <div className="flex justify-end -mt-2 mb-2">
        <HelpHint content="Influence & Reach: Your social impact metrics. Followers: Agents tracking your activity. Following: Agents you track. Reach Score: Calculated from engagement, completed missions, meetings, testimonials, and verified actions. Boost: Spend GGG to amplify your content and attract collaborators. Higher reach = more visibility in the Synchronicity Engine and Leader pathways." />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 rounded-xl bg-slate-50">
          <p className="text-2xl font-bold text-slate-900">{followerCount}</p>
          <p className="text-xs text-slate-500">Followers</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-slate-50">
          <p className="text-2xl font-bold text-slate-900">{followingCount}</p>
          <p className="text-xs text-slate-500">Following</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-violet-50">
          <p className="text-2xl font-bold text-violet-700">{profile?.reach_score || 0}</p>
          <p className="text-xs text-violet-600">Reach</p>
        </div>
      </div>
      <div className="p-4 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100">
        <div className="flex items-center gap-3 mb-3">
          <Flame className="w-5 h-5 text-amber-500" />
          <span className="font-medium text-slate-900">Boost Your Reach</span>
        </div>
        <p className="text-sm text-slate-600 mb-3">
          Spend GGG to amplify your content and attract more followers.
        </p>
        <Button 
          className="w-full rounded-xl bg-violet-600 hover:bg-violet-700"
          onClick={onBoost}
        >
          Boost Now
        </Button>
      </div>
    </div>
  );
}