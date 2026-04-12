import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { HERO_IMAGES } from '@/components/hud/HeroImageData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, Coins, Crown, Settings, BarChart3, Share2, Folder, Network, MessageSquare, Award, TrendingUp, Target, Percent, Newspaper, Bell, Radio, BookOpen, Gift, Image, Mail, Activity, Eye, Star, AlertTriangle, UserPlus, Inbox, FileText, Layers, Wallet, Map, Shuffle, Gauge, LayoutDashboard } from "lucide-react";
import BackButton from '@/components/hud/BackButton';

import UserManagement from '@/components/admin/UserManagement';
import RoleGroupsManager from '@/components/admin/RoleGroupsManager';
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
import NewsAdminPanel from '@/components/news/NewsAdminPanel';
import GlobalAlertManager from '@/components/admin/GlobalAlertManager';
import PressReleaseManager from '@/components/news/PressReleaseManager';
import InsightsAdminPanel from '@/components/admin/InsightsAdminPanel';
import ProjectClaimsManager from '@/components/admin/ProjectClaimsManager';
import OnboardingRewardsManager from '@/components/admin/OnboardingRewardsManager';
import HeroImageManager from '@/components/admin/HeroImageManager';
import EmailNewsletterManager from '@/components/admin/EmailNewsletterManager';
import NewsletterAnalyticsDashboard from '@/components/admin/NewsletterAnalyticsDashboard';
import AdminAuditLog from '@/components/admin/AdminAuditLog';
import MasterActivityLog from '@/components/admin/MasterActivityLog';
import GGGTotalsTab from '@/components/admin/GGGTotalsTab';
import AdminTestimonialsTab from '@/components/admin/AdminTestimonialsTab.jsx';
import ModeratorReviewPanel from '@/components/admin/ModeratorReviewPanel';
import DemoUsersManager from '@/components/admin/DemoUsersManager';
import AdminRequestsPanel from '@/components/admin/AdminRequestsPanel';
import PagesControlPanel from '@/components/admin/PagesControlPanel';
import BetaTickerManager from '@/components/admin/BetaTickerManager';
import AffiliatePayoutManager from '@/components/admin/AffiliatePayoutManager';
import TeamWorkloadDashboard from '@/components/admin/TeamWorkloadDashboard';
import ProjectHealthHeatmap from '@/components/admin/ProjectHealthHeatmap';
import ExecutiveRoadmap from '@/components/admin/ExecutiveRoadmap';
import AIRiskScoring from '@/components/admin/AIRiskScoring';
import SmartReassignment from '@/components/admin/SmartReassignment';
import ResourceCapacityPlanner from '@/components/admin/ResourceCapacityPlanner';
import AdminOverviewDashboard from '@/components/admin/AdminOverviewDashboard';
import WisdomModerationQueue from '@/components/admin/WisdomModerationQueue';
import LearnPopupSettings from '@/components/admin/LearnPopupSettings';
import UserActivityLog from '@/components/admin/UserActivityLog';
import AdminProgressTab from '@/components/admin/AdminProgressTab';

export default function Admin() {
  const [activeTab, setActiveTab] = React.useState('overview');
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
          src={HERO_IMAGES.find(h => h.id === 'admin')?.url || HERO_IMAGES[0]?.url}
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
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
                <button
                  onClick={() => setActiveTab('settings')}
                  className="p-2 rounded-lg bg-violet-100 hover:bg-violet-200 transition-colors"
                  title="Platform Settings"
                >
                  <Settings className="w-5 h-5 text-violet-600" />
                </button>
              </div>
              <p className="text-slate-500 mt-1">Platform management and controls</p>
            </div>
          </div>
        </div>

        {/* Admin Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-7 w-full bg-white/[0.88] dark:bg-black/[0.88] backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg p-2 h-auto">
            <TabsTrigger value="overview" className="gap-2 px-3 py-2">
              <LayoutDashboard className="w-4 h-4" />
              Overview
            </TabsTrigger>
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
            <TabsTrigger value="affiliate-payouts" className="gap-2 px-3 py-2">
              <Wallet className="w-4 h-4" />
              Payouts
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
            <TabsTrigger value="news" className="gap-2 px-3 py-2">
              <Newspaper className="w-4 h-4" />
              News
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-2 px-3 py-2">
              <Bell className="w-4 h-4" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="press" className="gap-2 px-3 py-2">
              <Radio className="w-4 h-4" />
              Press
            </TabsTrigger>
            <TabsTrigger value="insights" className="gap-2 px-3 py-2">
              <BookOpen className="w-4 h-4" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="onboarding" className="gap-2 px-3 py-2">
              <Gift className="w-4 h-4" />
              Onboarding
            </TabsTrigger>
            <TabsTrigger value="hero-images" className="gap-2 px-3 py-2">
              <Image className="w-4 h-4" />
              Hero Images
            </TabsTrigger>
            <TabsTrigger value="newsletter" className="gap-2 px-3 py-2">
              <Mail className="w-4 h-4" />
              Newsletter
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-2 px-3 py-2">
              <Activity className="w-4 h-4" />
              Audit Log
            </TabsTrigger>
            <TabsTrigger value="master-log" className="gap-2 px-3 py-2">
              <Eye className="w-4 h-4" />
              Master Log
            </TabsTrigger>
            <TabsTrigger value="ggg-totals" className="gap-2 px-3 py-2">
              <Coins className="w-4 h-4" />
              GGG Totals
            </TabsTrigger>
            <TabsTrigger value="testimonials" className="gap-2 px-3 py-2">
              <Star className="w-4 h-4" />
              Testimonials
            </TabsTrigger>
            <TabsTrigger value="moderation" className="gap-2 px-3 py-2">
              <AlertTriangle className="w-4 h-4" />
              Moderation
            </TabsTrigger>
            <TabsTrigger value="wisdom-mod" className="gap-2 px-3 py-2">
              <Shield className="w-4 h-4" />
              Wisdom Mod
            </TabsTrigger>
            <TabsTrigger value="demo-users" className="gap-2 px-3 py-2">
              <UserPlus className="w-4 h-4" />
              Demo Users
            </TabsTrigger>
            <TabsTrigger value="requests" className="gap-2 px-3 py-2">
              <Inbox className="w-4 h-4" />
              Requests
            </TabsTrigger>
            <TabsTrigger value="pages" className="gap-2 px-3 py-2">
              <FileText className="w-4 h-4" />
              Pages
            </TabsTrigger>
            <TabsTrigger value="ticker" className="gap-2 px-3 py-2">
              <Bell className="w-4 h-4" />
              Ticker
            </TabsTrigger>
            <TabsTrigger value="role-groups" className="gap-2 px-3 py-2">
              <Layers className="w-4 h-4" />
              Role Groups
            </TabsTrigger>
            <TabsTrigger value="workload" className="gap-2 px-3 py-2">
              <BarChart3 className="w-4 h-4" />
              Workload
            </TabsTrigger>
            <TabsTrigger value="health" className="gap-2 px-3 py-2">
              <Activity className="w-4 h-4" />
              Health Map
            </TabsTrigger>
            <TabsTrigger value="roadmap" className="gap-2 px-3 py-2">
              <Map className="w-4 h-4" />
              Roadmap
            </TabsTrigger>
            <TabsTrigger value="risk" className="gap-2 px-3 py-2">
              <AlertTriangle className="w-4 h-4" />
              Risk Score
            </TabsTrigger>
            <TabsTrigger value="reassign" className="gap-2 px-3 py-2">
              <Shuffle className="w-4 h-4" />
              Reassign
            </TabsTrigger>
            <TabsTrigger value="capacity" className="gap-2 px-3 py-2">
              <Gauge className="w-4 h-4" />
              Capacity
            </TabsTrigger>
            <TabsTrigger value="user-log" className="gap-2 px-3 py-2">
              <Activity className="w-4 h-4" />
              User Log
            </TabsTrigger>
            <TabsTrigger value="learn-popup" className="gap-2 px-3 py-2">
              <BookOpen className="w-4 h-4" />
              Learn Popup
            </TabsTrigger>
            <TabsTrigger value="progress" className="gap-2 px-3 py-2">
              <Target className="w-4 h-4" />
              Progress
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AdminOverviewDashboard onNavigateTab={setActiveTab} />
          </TabsContent>

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

          <TabsContent value="affiliate-payouts">
            <AffiliatePayoutManager />
          </TabsContent>

          <TabsContent value="settings">
            <PlatformSettings />
          </TabsContent>

          <TabsContent value="stats">
            <AdminStats />
          </TabsContent>

          <TabsContent value="projects">
            <div className="space-y-8">
              <ProjectClaimsManager />
              <div className="border-t pt-8">
                <AdminProjects />
              </div>
            </div>
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

          <TabsContent value="news">
            <NewsAdminPanel />
          </TabsContent>

          <TabsContent value="alerts">
            <GlobalAlertManager />
          </TabsContent>

          <TabsContent value="press">
            <PressReleaseManager />
          </TabsContent>

          <TabsContent value="insights">
            <InsightsAdminPanel />
          </TabsContent>

          <TabsContent value="onboarding">
            <OnboardingRewardsManager />
          </TabsContent>

          <TabsContent value="hero-images">
            <HeroImageManager />
          </TabsContent>

          <TabsContent value="newsletter">
            <Tabs defaultValue="compose" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="compose" className="gap-2">
                  <Mail className="w-4 h-4" />
                  Compose
                </TabsTrigger>
                <TabsTrigger value="analytics" className="gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </TabsTrigger>
              </TabsList>
              <TabsContent value="compose">
                <EmailNewsletterManager />
              </TabsContent>
              <TabsContent value="analytics">
                <NewsletterAnalyticsDashboard />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="audit">
            <AdminAuditLog />
          </TabsContent>

          <TabsContent value="master-log">
            <MasterActivityLog />
          </TabsContent>

          <TabsContent value="ggg-totals">
            <GGGTotalsTab />
          </TabsContent>

          <TabsContent value="testimonials">
            <AdminTestimonialsTab />
          </TabsContent>

          <TabsContent value="moderation">
            <ModeratorReviewPanel />
          </TabsContent>

          <TabsContent value="wisdom-mod">
            <WisdomModerationQueue />
          </TabsContent>

          <TabsContent value="demo-users">
            <DemoUsersManager />
          </TabsContent>

          <TabsContent value="requests">
            <AdminRequestsPanel />
          </TabsContent>

          <TabsContent value="pages">
            <PagesControlPanel />
          </TabsContent>

          <TabsContent value="ticker">
            <BetaTickerManager />
          </TabsContent>

          <TabsContent value="role-groups">
            <RoleGroupsManager />
          </TabsContent>

          <TabsContent value="workload">
            <TeamWorkloadDashboard />
          </TabsContent>

          <TabsContent value="health">
            <ProjectHealthHeatmap />
          </TabsContent>

          <TabsContent value="roadmap">
            <ExecutiveRoadmap />
          </TabsContent>

          <TabsContent value="risk">
            <AIRiskScoring />
          </TabsContent>

          <TabsContent value="reassign">
            <SmartReassignment />
          </TabsContent>

          <TabsContent value="capacity">
            <ResourceCapacityPlanner />
          </TabsContent>

          <TabsContent value="user-log">
            <UserActivityLog />
          </TabsContent>

          <TabsContent value="learn-popup">
            <LearnPopupSettings />
          </TabsContent>

          <TabsContent value="progress">
            <AdminProgressTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}