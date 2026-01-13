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
import QuestBoard from '@/components/quests/QuestBoard';
import TimelineQuestGenerator from '@/components/quests/TimelineQuestGenerator';
import BackButton from '@/components/hud/BackButton';
import ForwardButton from '@/components/hud/ForwardButton';

const HERO_IMAGE = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/eda418711_universal_upscale_0_0b3501a9-62c0-4df4-978e-6bf4e8cb3953_0.jpg";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30 relative">
      {/* Hero Section */}
      <div className="page-hero relative h-64 md:h-72 overflow-hidden">
        <img
          src={HERO_IMAGE}
          alt="Quests"
          className="hero-image w-full h-full object-cover"
          data-no-filter="true"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <div className="flex items-center gap-3 mb-2">
            <BackButton className="text-white/80 hover:text-white" />
            <Sparkles className="w-8 h-8 text-amber-400" />
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
              Quests & Rewards
            </h1>
            <ForwardButton currentPage="Quests" className="text-white/80 hover:text-white" />
          </div>
          <p className="text-white/80 text-lg max-w-xl">
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

        {/* Timeline Quest Generator - Personalized Quests */}
        <div className="mt-8">
          <TimelineQuestGenerator userId={currentUser?.email} profile={profile} />
        </div>

        {/* Quest Board - 22 Badge Ascension Grid */}
        <div className="mt-8">
          <QuestBoard earnedBadges={badges} />
        </div>
      </div>
    </div>);

}