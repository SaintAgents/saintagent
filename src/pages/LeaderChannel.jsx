import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Crown, 
  Radio, 
  Users, 
  Award,
  Plus,
  Lock
} from "lucide-react";
import SaintStewardNominationModal from '@/components/leader/SaintStewardNominationModal';
import SaintStewardReviewPanel from '@/components/leader/SaintStewardReviewPanel';
import BroadcastCenter from '@/components/leader/BroadcastCenter';
import LeaderMissionsPanel from '@/components/leader/LeaderMissionsPanel';
import GovernancePortal from '@/components/leader/GovernancePortal';
import BackButton from '@/components/hud/BackButton';

export default function LeaderChannel() {
  const [nominationModalOpen, setNominationModalOpen] = useState(false);

  const { data: profiles, isLoading } = useQuery({
    queryKey: ['userProfileLeader'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.UserProfile.filter({ user_id: user.email });
    },
    staleTime: 0 // Always fetch fresh data
  });
  const profile = profiles?.[0];

  const isLeader = profile?.leader_tier === 'verified144k' || profile?.leader_tier === 'candidate';
  const canAccessChannel = isLeader;

  // Show loading state while checking access
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30 p-6 flex items-center justify-center">
        <div className="text-slate-500">Checking access...</div>
      </div>
    );
  }

  if (!canAccessChannel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30 p-6 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <Lock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Leader Channel Locked</h2>
            <p className="text-slate-600 mb-6">
              This channel is reserved for verified 144K leaders. Complete the Leadership pathway to gain access.
            </p>
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              Return to Command Deck
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:bg-transparent dark:bg-none">
      {/* Hero Section */}
      <div className="page-hero relative overflow-hidden">
        <img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/45a43f923_leader.jpg"
          alt="144K Leader Channel"
          className="w-full h-full object-cover object-center hero-image"
          data-no-filter="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-slate-50 dark:to-[#050505]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-[0_0_30px_rgba(139,92,246,0.5)] tracking-wide flex items-center justify-center gap-3"
                style={{ fontFamily: 'serif', textShadow: '0 0 40px rgba(139,92,246,0.6), 0 2px 4px rgba(0,0,0,0.8)' }}>
              <Radio className="w-10 h-10 text-amber-300 drop-shadow-lg" />
              144K Leader Channel
            </h1>
            <p className="text-violet-200/90 mt-2 text-lg tracking-wider drop-shadow-lg">
              Exclusive space for verified leaders and stewards
            </p>
          </div>
        </div>
        <div className="absolute top-4 left-4">
          <BackButton className="text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-lg" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Header Actions */}
        <div className="flex items-center justify-end mb-6">
          <Button 
            onClick={() => setNominationModalOpen(true)}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white gap-2"
          >
            <Plus className="w-4 h-4" />
            Nominate Saint Steward
          </Button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <Crown className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900">342</p>
              <p className="text-sm text-slate-500">Active Leaders</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Award className="w-8 h-8 text-violet-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900">89</p>
              <p className="text-sm text-slate-500">Saint Stewards</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900">1,247</p>
              <p className="text-sm text-slate-500">Total Missions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Radio className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900">8.4K</p>
              <p className="text-sm text-slate-500">Community Reach</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="nominations" className="space-y-6">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="nominations">Saint Steward Review</TabsTrigger>
            <TabsTrigger value="broadcast">Broadcast Center</TabsTrigger>
            <TabsTrigger value="missions">Leader Missions</TabsTrigger>
            <TabsTrigger value="governance">Governance</TabsTrigger>
          </TabsList>

          <TabsContent value="nominations">
            <SaintStewardReviewPanel currentUser={profile} />
          </TabsContent>

          <TabsContent value="broadcast">
            <BroadcastCenter profile={profile} />
          </TabsContent>

          <TabsContent value="missions">
            <LeaderMissionsPanel profile={profile} />
          </TabsContent>

          <TabsContent value="governance">
            <GovernancePortal profile={profile} />
          </TabsContent>
        </Tabs>
      </div>

      <SaintStewardNominationModal
        open={nominationModalOpen}
        onClose={() => setNominationModalOpen(false)}
        nominator={profile}
      />
    </div>
  );
}