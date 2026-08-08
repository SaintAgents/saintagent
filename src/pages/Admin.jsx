import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { HERO_IMAGES } from '@/components/hud/HeroImageData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, Coins, Crown, Settings, BarChart3, Share2, Folder, Network, MessageSquare, Award, TrendingUp, Target, Percent, Newspaper, Bell, Radio, BookOpen, Gift, Image, Mail, Activity, Eye, Star, AlertTriangle, UserPlus, Inbox, FileText, Layers, Wallet, Map, Shuffle, Gauge, LayoutDashboard, Database, Mic, Vote, Zap, LogIn } from "lucide-react";
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
import CacheAdminTab from '@/components/admin/CacheAdminTab';
import DeepDisclosureAdmin from '@/components/broadcast/DeepDisclosureAdmin';
import ActivityBannerManager from '@/components/admin/ActivityBannerManager';
import AdminProposalsPanel from '@/components/admin/AdminProposalsPanel';
import LiveToastsAdmin from '@/components/admin/LiveToastsAdmin';
import UsageAnalyticsTab from '@/components/admin/UsageAnalyticsTab';
import SignInsTab from '@/components/admin/SignInsTab';
import AdminBroadcastTab from '@/components/admin/AdminBroadcastTab';

export default function Admin() {
  const [activeTab, setActiveTab] = React.useState('overview');
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const isAdmin = user?.role === 'admin';
  const isCoordinator = user?.role === 'coordinator';

  // Tabs that coordinators cannot access (financial/GGG control)
  const COORDINATOR_RESTRICTED_TABS = new Set([
    'ggg', 'ggg-totals', 'affiliate-payouts', 'affiliate', 'settings'
  ]);

  const canAccessTab = (tabValue) => {
    if (isAdmin) return true;
    if (isCoordinator) return !COORDINATOR_RESTRICTED_TABS.has(tabValue);
    return false;
  };

  // Check if user is admin or coordinator
  if (!isAdmin && !isCoordinator) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
        <div className="text-center">
          <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-slate-500">You need admin or coordinator privileges to access this page.</p>
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

      <div className="max-w-7xl mx-auto px-6 -mt-[100px] relative z-10">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <BackButton />
            <div className="p-3 rounded-xl bg-violet-100">
              <Shield className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-slate-900">
                  {isCoordinator ? 'Coordinator Dashboard' : 'Admin Dashboard'}
                </h1>
                {isAdmin && (
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="p-2 rounded-lg bg-violet-100 hover:bg-violet-200 transition-colors"
                    title="Platform Settings"
                  >
                    <Settings className="w-5 h-5 text-violet-600" />
                  </button>
                )}
              </div>
              <p className="text-slate-500 mt-1">
                {isCoordinator ? 'Coordinate platform operations' : 'Platform management and controls'}
              </p>
            </div>
          </div>
        </div>

        {/* Admin Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-7 w-full bg-white/[0.88] dark:bg-black/[0.88] backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg p-2 h-auto">
            {[
              { value: 'overview', icon: LayoutDashboard, label: 'Overview' },
              { value: 'users', icon: Users, label: 'Users' },
              { value: 'ggg', icon: Coins, label: 'GGG Rules' },
              { value: 'badges', icon: Award, label: 'Badges' },
              { value: 'rp', icon: TrendingUp, label: 'RP' },
              { value: 'leaders', icon: Crown, label: 'Leaders' },
              { value: 'referrals', icon: Share2, label: 'Referrals' },
              { value: 'affiliate', icon: Percent, label: 'Affiliate' },
              { value: 'affiliate-payouts', icon: Wallet, label: 'Payouts' },
              { value: 'settings', icon: Settings, label: 'Settings' },
              { value: 'stats', icon: BarChart3, label: 'Stats' },
              { value: 'projects', icon: Folder, label: 'Projects' },
              { value: 'crm', icon: Network, label: 'CRM' },
              { value: 'feedback', icon: MessageSquare, label: 'Feedback' },
              { value: 'challenges', icon: Target, label: 'Challenges' },
              { value: 'news', icon: Newspaper, label: 'News' },
              { value: 'alerts', icon: Bell, label: 'Alerts' },
              { value: 'press', icon: Radio, label: 'Press' },
              { value: 'insights', icon: BookOpen, label: 'Insights' },
              { value: 'onboarding', icon: Gift, label: 'Onboarding' },
              { value: 'hero-images', icon: Image, label: 'Hero Images' },
              { value: 'newsletter', icon: Mail, label: 'Newsletter' },
              { value: 'audit', icon: Activity, label: 'Audit Log' },
              { value: 'master-log', icon: Eye, label: 'Master Log' },
              { value: 'ggg-totals', icon: Coins, label: 'GGG Totals' },
              { value: 'testimonials', icon: Star, label: 'Testimonials' },
              { value: 'moderation', icon: AlertTriangle, label: 'Moderation' },
              { value: 'wisdom-mod', icon: Shield, label: 'Wisdom Mod' },
              { value: 'demo-users', icon: UserPlus, label: 'Demo Users' },
              { value: 'requests', icon: Inbox, label: 'Requests' },
              { value: 'pages', icon: FileText, label: 'Pages' },
              { value: 'ticker', icon: Bell, label: 'Ticker' },
              { value: 'role-groups', icon: Layers, label: 'Role Groups' },
              { value: 'workload', icon: BarChart3, label: 'Workload' },
              { value: 'health', icon: Activity, label: 'Health Map' },
              { value: 'roadmap', icon: Map, label: 'Roadmap' },
              { value: 'risk', icon: AlertTriangle, label: 'Risk Score' },
              { value: 'reassign', icon: Shuffle, label: 'Reassign' },
              { value: 'capacity', icon: Gauge, label: 'Capacity' },
              { value: 'user-log', icon: Activity, label: 'User Log' },
              { value: 'learn-popup', icon: BookOpen, label: 'Learn Popup' },
              { value: 'progress', icon: Target, label: 'Progress' },
              { value: 'cache', icon: Database, label: 'Cache' },
              { value: 'activity-banner', icon: Image, label: 'Feed Banner' },
              { value: 'deep-disclosure', icon: Mic, label: 'Podcast' },
              { value: 'proposals', icon: Vote, label: 'Proposals' },
              { value: 'live-toasts', icon: Zap, label: 'Live Toasts' },
              { value: 'usage', icon: Activity, label: 'Usage' },
              { value: 'signins', icon: LogIn, label: 'Sign-Ins' },
              { value: 'broadcast', icon: Radio, label: 'Broadcast' },
            ].filter(tab => canAccessTab(tab.value)).map(tab => (
              <TabsTrigger key={tab.value} value={tab.value} className="gap-2 px-3 py-2">
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview">
            <AdminOverviewDashboard onNavigateTab={setActiveTab} />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement viewerRole={user?.role} />
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
            <AdminBetaFeedback viewerRole={user?.role} />
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

          <TabsContent value="cache">
            <CacheAdminTab />
          </TabsContent>

          <TabsContent value="activity-banner">
            <ActivityBannerManager />
          </TabsContent>

          <TabsContent value="deep-disclosure">
            <DeepDisclosureAdmin />
          </TabsContent>

          <TabsContent value="proposals">
            <AdminProposalsPanel />
          </TabsContent>

          <TabsContent value="live-toasts">
            <LiveToastsAdmin />
          </TabsContent>

          <TabsContent value="usage">
            <UsageAnalyticsTab />
          </TabsContent>

          <TabsContent value="signins">
            <SignInsTab />
          </TabsContent>

          <TabsContent value="broadcast">
            <AdminBroadcastTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}