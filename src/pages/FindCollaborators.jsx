import React, { useState } from "react";
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import CollaboratorFinder from "@/components/collaboration/CollaboratorFinder";
import AICollaboratorHub from "@/components/ai/AICollaboratorHub";
import { Users, Sparkles, Brain } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BackButton from '@/components/hud/BackButton';
import ForwardButton from '@/components/hud/ForwardButton';
import { HeroGalleryTrigger } from '@/components/hud/HeroGalleryViewer';

export default function FindCollaborators() {
  const [activeTab, setActiveTab] = useState('finder');

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: profiles } = useQuery({
    queryKey: ['userProfile', currentUser?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: currentUser.email }),
    enabled: !!currentUser?.email
  });
  const profile = profiles?.[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:bg-transparent dark:bg-none">
      {/* Hero Section */}
      <div className="relative h-40 md:h-48 overflow-hidden">
        <img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/3ba1dc1c5_22.png"
          alt="Find Collaborators"
          className="w-full h-full object-cover hero-image"
          data-no-filter="true"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/30 to-transparent" />
        <HeroGalleryTrigger startIndex={13} className="absolute bottom-4 left-4 text-white/80 !p-1 [&_svg]:w-3 [&_svg]:h-3 z-10" />
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <BackButton className="text-white hover:bg-white/20" />
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg flex items-center justify-center gap-2">
              <Users className="w-6 h-6 text-violet-300" />
              Find Collaborators
              <Sparkles className="w-5 h-5 text-amber-400" />
            </h1>
            <p className="text-violet-100 mt-0.5 text-xs md:text-sm">
              AI-powered matching based on skills, values, availability, and collaboration goals
            </p>
          </div>
          <ForwardButton className="text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-lg" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 w-full max-w-md">
            <TabsTrigger value="finder" className="gap-2">
              <Users className="w-4 h-4" />
              Browse & Filter
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <Brain className="w-4 h-4" />
              AI Collaboration Hub
            </TabsTrigger>
          </TabsList>

          <TabsContent value="finder">
            <CollaboratorFinder />
          </TabsContent>

          <TabsContent value="ai">
            <AICollaboratorHub 
              userId={currentUser?.email} 
              profile={profile}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}