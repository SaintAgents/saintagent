import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Target,
  Users,
  MessageSquare,
  FileText,
  Sparkles,
  ArrowLeft
} from "lucide-react";
import { createPageUrl } from '@/utils';

import AITeamBuilder from '@/components/ai/AITeamBuilder';
import AIMissionBrief from '@/components/ai/AIMissionBrief';
import AIDiscussionAssistant from '@/components/ai/AIDiscussionAssistant';

export default function MissionCollaboration() {
  const [searchParams] = useSearchParams();
  const missionId = searchParams.get('id');
  const [activeTab, setActiveTab] = useState('brief');

  const { data: missions } = useQuery({
    queryKey: ['missions'],
    queryFn: () => base44.entities.Mission.list('-created_date', 100)
  });
  const mission = missions?.find(m => m.id === missionId);

  const { data: profiles } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.UserProfile.filter({ user_id: user.email });
    }
  });
  const profile = profiles?.[0];

  if (!mission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 flex items-center justify-center p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Mission not found</h2>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = createPageUrl('Missions')}
              className="mt-4"
            >
              Back to Missions
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => window.location.href = createPageUrl('Missions')}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Missions
          </Button>

          <Card className="overflow-hidden">
            <div 
              className="h-32 bg-gradient-to-r from-violet-600 to-purple-600 relative"
              style={mission.image_url ? { backgroundImage: `url(${mission.image_url})`, backgroundSize: 'cover' } : {}}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-6 right-6">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                    {mission.mission_type}
                  </Badge>
                  <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                    {mission.participant_count || 0} participants
                  </Badge>
                </div>
                <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                  {mission.title}
                </h1>
              </div>
            </div>
            <CardContent className="p-6">
              <p className="text-slate-700 mb-4">{mission.objective}</p>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Created by {mission.creator_name}
                </span>
                {mission.reward_ggg > 0 && (
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    {mission.reward_ggg} GGG reward
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Collaboration Tools */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-12 bg-white rounded-xl border">
            <TabsTrigger value="brief" className="rounded-lg gap-2">
              <FileText className="w-4 h-4" />
              Mission Brief
            </TabsTrigger>
            <TabsTrigger value="team" className="rounded-lg gap-2">
              <Users className="w-4 h-4" />
              Build Team
            </TabsTrigger>
            <TabsTrigger value="discussion" className="rounded-lg gap-2">
              <MessageSquare className="w-4 h-4" />
              Discussion AI
            </TabsTrigger>
          </TabsList>

          <TabsContent value="brief" className="space-y-6">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                AI-Generated Mission Brief
              </h2>
              <p className="text-slate-600">
                Get comprehensive guidance, strategies, and success metrics for your mission
              </p>
            </div>
            <AIMissionBrief mission={mission} />
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                AI Team Builder
              </h2>
              <p className="text-slate-600">
                Find the perfect collaborators based on skills, values, and mission fit
              </p>
            </div>
            <AITeamBuilder mission={mission} currentProfile={profile} />
          </TabsContent>

          <TabsContent value="discussion" className="space-y-6">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                AI Discussion Assistant
              </h2>
              <p className="text-slate-600">
                Analyze team conversations to extract action items, decisions, and next steps
              </p>
            </div>
            <AIDiscussionAssistant missionId={mission.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}