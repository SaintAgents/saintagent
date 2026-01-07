import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sparkles, Trophy, Target, Users, Coins, Star, Crown,
  Zap, Gift, ChevronRight, Heart, Shield, Eye, Lock } from
'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QuestTracker from '@/components/synchronicity/QuestTracker';
import LeaderboardPanel from '@/components/synchronicity/LeaderboardPanel';
import BadgesPanel from '@/components/synchronicity/BadgesPanel';
import ActiveSynchronicity from '@/components/synchronicity/ActiveSynchronicity';
import EpicQuestCard from '@/components/synchronicity/EpicQuestCard';
import BackButton from '@/components/hud/BackButton';

const HERO_IMAGE = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/862e64727_ChatGPTImageJan7202612_58_22AM.png";

export default function Quests() {
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: profile } = useQuery({
    queryKey: ['myProfile', currentUser?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_id: currentUser.email });
      return profiles?.[0];
    },
    enabled: !!currentUser?.email
  });

  const { data: quests = [] } = useQuery({
    queryKey: ['userQuests', currentUser?.email],
    queryFn: () => base44.entities.Quest.filter({ user_id: currentUser.email, status: 'active' }, '-created_date', 20),
    enabled: !!currentUser?.email
  });

  const { data: badges = [] } = useQuery({
    queryKey: ['userBadges', currentUser?.email],
    queryFn: () => base44.entities.Badge.filter({ user_id: currentUser.email, status: 'active' }),
    enabled: !!currentUser?.email
  });

  const { data: synchronicityMatches = [] } = useQuery({
    queryKey: ['synchronicityMatches', currentUser?.email],
    queryFn: () => base44.entities.SynchronicityMatch.filter({ user_id: currentUser.email }, '-resonance_score', 5),
    enabled: !!currentUser?.email
  });

  const activeMatch = synchronicityMatches.find((m) => m.status === 'revealed' || m.status === 'pending');

  const claimRewardsMutation = useMutation({
    mutationFn: async () => {
      const completedQuests = quests.filter((q) => q.status === 'completed');
      for (const quest of completedQuests) {
        await base44.entities.Quest.update(quest.id, {
          status: 'claimed',
          claimed_at: new Date().toISOString()
        });
        // Award RP to profile
        if (quest.reward_rp && profile?.id) {
          await base44.entities.UserProfile.update(profile.id, {
            rp_points: (profile.rp_points || 0) + quest.reward_rp
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userQuests'] });
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
    }
  });

  const completedQuests = quests.filter((q) => q.status === 'completed');
  const hasClaimable = completedQuests.length > 0;

  return (
    <div className="min-h-screen bg-[#0a1a0a]">
      {/* Header Section - No Hero */}
      <div className="px-4 pt-6 pb-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <BackButton className="text-amber-200/80 hover:text-amber-100" />
            <h1 className="text-3xl md:text-4xl font-bold text-amber-100 drop-shadow-[0_0_30px_rgba(251,191,36,0.5)] tracking-wide"
              style={{ fontFamily: 'serif', textShadow: '0 0 40px rgba(251,191,36,0.6), 0 2px 4px rgba(0,0,0,0.8)' }}>
              Quests & Rewards
            </h1>
          </div>
          <p className="text-amber-200/80 text-lg tracking-wider ml-12">
            Complete quests, earn badges, and climb the leaderboard
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Left Column - Quest Tracker */}
          <div className="lg:col-span-3">
            <QuestTracker
              quests={quests}
              onClaimRewards={() => claimRewardsMutation.mutate()}
              hasClaimable={hasClaimable}
              isClaimPending={claimRewardsMutation.isPending} />

          </div>

          {/* Center Column - Leaderboards & Active Synchronicity */}
          <div className="lg:col-span-6 space-y-4">
            <LeaderboardPanel />
            <ActiveSynchronicity match={activeMatch} currentUserId={currentUser?.email} />
          </div>

          {/* Right Column - Badges & Epic Quest */}
          <div className="lg:col-span-3 space-y-4">
            <BadgesPanel badges={badges} />
            <EpicQuestCard profile={profile} />
          </div>
        </div>
      </div>
    </div>);

}