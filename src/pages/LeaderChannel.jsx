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

export default function LeaderChannel() {
  const [nominationModalOpen, setNominationModalOpen] = useState(false);

  const { data: profiles } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.UserProfile.filter({ user_id: user.email });
    }
  });
  const profile = profiles?.[0];

  const isLeader = profile?.leader_tier === 'verified144k' || profile?.leader_tier === 'candidate';
  const canAccessChannel = isLeader;

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Radio className="w-6 h-6 text-amber-500" />
                144K Leader Channel
              </h1>
              <p className="text-slate-500 mt-1">Exclusive space for verified leaders and stewards</p>
            </div>
            <Button 
              onClick={() => setNominationModalOpen(true)}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white gap-2"
            >
              <Plus className="w-4 h-4" />
              Nominate Saint Steward
            </Button>
          </div>
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
            <Card>
              <CardContent className="py-12 text-center">
                <Radio className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Broadcast Center - Coming Soon</p>
                <p className="text-xs text-slate-400 mt-2">Send announcements to the entire community</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="missions">
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Leader Missions Dashboard - Coming Soon</p>
                <p className="text-xs text-slate-400 mt-2">Coordinate high-impact missions</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="governance">
            <Card>
              <CardContent className="py-12 text-center">
                <Crown className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Governance Portal - Coming Soon</p>
                <p className="text-xs text-slate-400 mt-2">Vote on platform decisions</p>
              </CardContent>
            </Card>
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