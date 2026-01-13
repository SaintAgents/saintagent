import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, Coins, Crown, Settings, BarChart3, Share2, Folder, Network, MessageSquare, Award, TrendingUp, Target, Percent } from "lucide-react";
import BackButton from '@/components/hud/BackButton';

import UserManagement from '@/components/admin/UserManagement';
import GGGRulesManager from '@/components/admin/GGGRulesManager';
import LeaderApplications from '@/components/admin/LeaderApplications';
import PlatformSettings from '@/components/admin/PlatformSettings';
import AdminProjects from '@/components/admin/AdminProjects';
import ReferralDatasets from '@/components/admin/ReferralDatasets';
import AdminStats from '@/components/admin/AdminStats';
import AdminCRM from '@/components/admin/AdminCRM';
import AdminBetaFeedback from '@/components/admin/AdminBetaFeedback';
import BadgeRewardsManager from '@/components/admin/BadgeRewardsManager';
import RPSettingsManager from '@/components/admin/RPSettingsManager';
import AdminChallenges from '@/components/admin/AdminChallenges';
import AffiliateSettings from '@/components/admin/AffiliateSettings';

export default function Admin() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  // Check if user is admin
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
        <div className="text-center">
          <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-slate-500">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
      {/* Hero Image */}
      <div className="page-hero relative w-full overflow-hidden bg-slate-900">
        <img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/c5e67d97a_universal_upscale_0_8b871d44-8964-4f37-bc81-87b7b516b155_01.jpg"
          alt="Admin Dashboard Hero"
          data-no-filter="true"
          className="w-full h-full object-cover object-center hero-image"
          style={{ opacity: 1, filter: 'none', display: 'block', visibility: 'visible' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/30 to-transparent dark:from-[#050505] dark:via-transparent dark:to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-10">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <BackButton />
            <div className="p-3 rounded-xl bg-violet-100">
              <Shield className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-slate-500 mt-1">Platform management and controls</p>
            </div>
          </div>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="flex flex-wrap gap-1 bg-white/[0.88] dark:bg-black/[0.88] backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg p-2 h-auto">
            <TabsTrigger value="users" className="gap-2 px-3 py-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="ggg" className="gap-2 px-3 py-2">
              <Coins className="w-4 h-4" />
              GGG Rules
            </TabsTrigger>
            <TabsTrigger value="badges" className="gap-2 px-3 py-2">
              <Award className="w-4 h-4" />
              Badges
            </TabsTrigger>
            <TabsTrigger value="rp" className="gap-2 px-3 py-2">
              <TrendingUp className="w-4 h-4" />
              RP
            </TabsTrigger>
            <TabsTrigger value="leaders" className="gap-2 px-3 py-2">
              <Crown className="w-4 h-4" />
              Leaders
            </TabsTrigger>
            <TabsTrigger value="referrals" className="gap-2 px-3 py-2">
              <Share2 className="w-4 h-4" />
              Referrals
            </TabsTrigger>
            <TabsTrigger value="affiliate" className="gap-2 px-3 py-2">
              <Percent className="w-4 h-4" />
              Affiliate
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2 px-3 py-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2 px-3 py-2">
              <BarChart3 className="w-4 h-4" />
              Stats
            </TabsTrigger>
            <TabsTrigger value="projects" className="gap-2 px-3 py-2">
              <Folder className="w-4 h-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="crm" className="gap-2 px-3 py-2">
              <Network className="w-4 h-4" />
              CRM
            </TabsTrigger>
            <TabsTrigger value="feedback" className="gap-2 px-3 py-2">
              <MessageSquare className="w-4 h-4" />
              Feedback
            </TabsTrigger>
            <TabsTrigger value="challenges" className="gap-2 px-3 py-2">
              <Target className="w-4 h-4" />
              Challenges
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="ggg">
            <GGGRulesManager />
          </TabsContent>

          <TabsContent value="badges">
            <BadgeRewardsManager />
          </TabsContent>

          <TabsContent value="rp">
            <RPSettingsManager />
          </TabsContent>

          <TabsContent value="leaders">
            <LeaderApplications />
          </TabsContent>

          <TabsContent value="referrals">
            <ReferralDatasets />
          </TabsContent>

          <TabsContent value="affiliate">
            <AffiliateSettings />
          </TabsContent>

          <TabsContent value="settings">
            <PlatformSettings />
          </TabsContent>

          <TabsContent value="stats">
            <AdminStats />
          </TabsContent>

          <TabsContent value="projects">
            <AdminProjects />
          </TabsContent>

          <TabsContent value="crm">
            <AdminCRM />
          </TabsContent>

          <TabsContent value="feedback">
            <AdminBetaFeedback />
          </TabsContent>

          <TabsContent value="challenges">
            <AdminChallenges />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}