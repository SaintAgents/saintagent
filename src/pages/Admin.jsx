import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, Coins, Crown, Settings, BarChart3, Share2, Folder, Network } from "lucide-react";
import BackButton from '@/components/hud/BackButton';

import UserManagement from '@/components/admin/UserManagement';
import GGGRulesManager from '@/components/admin/GGGRulesManager';
import LeaderApplications from '@/components/admin/LeaderApplications';
import PlatformSettings from '@/components/admin/PlatformSettings';
import AdminProjects from '@/components/admin/AdminProjects';
import ReferralDatasets from '@/components/admin/ReferralDatasets';
import AdminStats from '@/components/admin/AdminStats';
import AdminCRM from '@/components/admin/AdminCRM';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
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
          <TabsList className="grid w-full max-w-4xl grid-cols-8">
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="ggg" className="gap-2">
              <Coins className="w-4 h-4" />
              GGG Rules
            </TabsTrigger>
            <TabsTrigger value="leaders" className="gap-2">
              <Crown className="w-4 h-4" />
              Leaders
            </TabsTrigger>
            <TabsTrigger value="referrals" className="gap-2">
              <Share2 className="w-4 h-4" />
              Referrals
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Stats
            </TabsTrigger>
            <TabsTrigger value="projects" className="gap-2">
              <Folder className="w-4 h-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="crm" className="gap-2">
              <Network className="w-4 h-4" />
              CRM
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="ggg">
            <GGGRulesManager />
          </TabsContent>

          <TabsContent value="leaders">
            <LeaderApplications />
          </TabsContent>

          <TabsContent value="referrals">
            <ReferralDatasets />
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
        </Tabs>
      </div>
    </div>
  );
}