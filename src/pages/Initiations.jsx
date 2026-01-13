import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { 
  Sparkles, Eye, Globe, Lock, Unlock, ChevronRight, 
  Flame, Star, Zap, Heart, BookOpen, Crown, Trophy, Compass
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import Activation144K from '@/components/quests/Activation144K';
import SeventhSealInitiation from '@/components/quests/SeventhSealInitiation';
import { TRANSMISSIONS, META_VARIANCE_TAGLINES, BADGE_CATEGORIES } from '@/components/quests/MetaVarianceConfig';
import BackButton from '@/components/hud/BackButton';
import ForwardButton from '@/components/hud/ForwardButton';
import InitiationGamification from '@/components/gamification/InitiationGamification';
import AIOnboardingGuidance from '@/components/ai/AIOnboardingGuidance';

const INITIATIONS = [
  {
    id: '144k_activation',
    title: '144K Activation',
    subtitle: 'The Planetary Grid',
    description: 'Become a frequency stabilizer for the Earth. Activate your node in the crystalline grid.',
    transmission: 'transmission4',
    badge: 'frequency_stabilizer',
    badgeCategory: 'accomplishment',
    icon: Globe,
    color: 'amber',
    requiredRank: 'seeker',
    requiredCoherence: 5,
    rewards: { rp: 500, ggg: 0.25 }
  },
  {
    id: '7th_seal',
    title: '7th Seal Initiation',
    subtitle: 'Timeline Convergence',
    description: 'Open the seal of disclosure and step into your role as a timeline stabilizer.',
    transmission: 'transmission3',
    badge: '7th_seal_initiated',
    badgeCategory: 'verification',
    icon: Eye,
    color: 'violet',
    requiredRank: 'initiate',
    requiredCoherence: 7,
    rewards: { rp: 1000, ggg: 0.5 }
  },
  {
    id: 'high_priesthood',
    title: 'Return of the High Priesthood',
    subtitle: 'Frequency Order',
    description: 'Remember your lineage across ages. Reclaim your station as a frequency that stabilizes worlds.',
    transmission: 'transmission5',
    badge: 'high_priest',
    badgeCategory: 'identity',
    icon: Crown,
    color: 'purple',
    requiredRank: 'adept',
    requiredCoherence: 8,
    rewards: { rp: 2000, ggg: 1.0 },
    comingSoon: true
  },
  {
    id: 'ultranet_architect',
    title: 'Ultranet Architect',
    subtitle: 'Mission of the Architect',
    description: 'Step into your role as a builder of the living frameworks of the New Network.',
    transmission: 'transmission2',
    badge: 'ultranet_architect',
    badgeCategory: 'identity',
    icon: Zap,
    color: 'teal',
    requiredRank: 'practitioner',
    requiredCoherence: 9,
    rewards: { rp: 3000, ggg: 2.0 },
    comingSoon: true
  }
];

function InitiationCard({ initiation, profile, badges, onStart }) {
  const Icon = initiation.icon;
  const isCompleted = badges?.some(b => b.code === initiation.badge);
  const meetsRank = true; // Simplified - would check against actual rank
  const isLocked = initiation.comingSoon || !meetsRank;

  const colorClasses = {
    amber: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 hover:border-amber-400',
    violet: 'from-violet-500/20 to-purple-500/10 border-violet-500/30 hover:border-violet-400',
    purple: 'from-purple-500/20 to-pink-500/10 border-purple-500/30 hover:border-purple-400',
    teal: 'from-teal-500/20 to-cyan-500/10 border-teal-500/30 hover:border-teal-400'
  };

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all cursor-pointer bg-[rgba(0,0,0,0.85)] border-[rgba(0,255,136,0.2)]",
      isLocked && "opacity-60"
    )}>
      {isCompleted && (
        <div className="absolute top-3 right-3">
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            ✓ Completed
          </Badge>
        </div>
      )}
      {initiation.comingSoon && (
        <div className="absolute top-3 right-3">
          <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">
            Coming Soon
          </Badge>
        </div>
      )}
      
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className={cn(
            "w-14 h-14 rounded-xl flex items-center justify-center",
            initiation.color === 'amber' && "bg-amber-500/20",
            initiation.color === 'violet' && "bg-violet-500/20",
            initiation.color === 'purple' && "bg-purple-500/20",
            initiation.color === 'teal' && "bg-teal-500/20"
          )}>
            {isLocked ? (
              <Lock className="w-6 h-6 text-slate-500" />
            ) : (
              <Icon className={cn(
                "w-6 h-6",
                initiation.color === 'amber' && "text-amber-400",
                initiation.color === 'violet' && "text-violet-400",
                initiation.color === 'purple' && "text-purple-400",
                initiation.color === 'teal' && "text-teal-400"
              )} />
            )}
          </div>
          <div className="flex-1">
            <CardTitle className="text-white text-lg">{initiation.title}</CardTitle>
            <CardDescription className="text-slate-400">{initiation.subtitle}</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-slate-300 text-sm mb-4">{initiation.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="w-3 h-3" />
            <span>Coherence {initiation.requiredCoherence}+</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-violet-400 text-sm font-medium">{initiation.rewards.rp} RP</span>
            <span className="text-amber-400 text-sm font-medium">{initiation.rewards.ggg} GGG</span>
          </div>
        </div>

        {!isLocked && !isCompleted && (
          <Button 
            onClick={() => onStart(initiation)}
            className={cn(
              "w-full mt-4",
              initiation.color === 'amber' && "bg-amber-600 hover:bg-amber-700",
              initiation.color === 'violet' && "bg-violet-600 hover:bg-violet-700",
              initiation.color === 'purple' && "bg-purple-600 hover:bg-purple-700",
              initiation.color === 'teal' && "bg-teal-600 hover:bg-teal-700"
            )}
          >
            Begin Initiation
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function TransmissionCard({ id, transmission }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="bg-[rgba(0,0,0,0.85)] border-[rgba(0,255,136,0.2)]">
      <CardHeader 
        className="cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Flame className="w-5 h-5 text-violet-400" />
            <CardTitle className="text-white text-lg">{transmission.title}</CardTitle>
          </div>
          <ChevronRight className={cn(
            "w-5 h-5 text-slate-400 transition-transform",
            expanded && "rotate-90"
          )} />
        </div>
        <CardDescription className="text-violet-300">{transmission.subtitle}</CardDescription>
      </CardHeader>
      {expanded && (
        <CardContent>
          <div className="p-4 rounded-xl bg-violet-900/20 border border-violet-500/10">
            <p className="text-violet-100 whitespace-pre-line leading-relaxed text-sm">
              {transmission.content}
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function InitiationsPage() {
  const [activeInitiation, setActiveInitiation] = useState(null);
  const [activeTab, setActiveTab] = useState('initiations');

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

  const { data: badges = [] } = useQuery({
    queryKey: ['userBadges', profile?.user_id],
    queryFn: () => base44.entities.Badge.filter({ user_id: profile.user_id }),
    enabled: !!profile?.user_id
  });

  // Show active initiation full screen
  if (activeInitiation) {
    if (activeInitiation.id === '144k_activation') {
      return (
        <Activation144K 
          profile={profile} 
          onComplete={() => setActiveInitiation(null)} 
        />
      );
    }
    if (activeInitiation.id === '7th_seal') {
      return (
        <SeventhSealInitiation 
          profile={profile} 
          onComplete={() => setActiveInitiation(null)} 
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:bg-transparent dark:bg-none relative">
      {/* Hero Section */}
      <div className="page-hero relative overflow-hidden">
        <img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/8444707dd_universal_upscale_0_b83dfdbd-8157-43be-bdb5-6f097ca370c0_0.jpg"
          alt="Initiations"
          className="w-full h-full object-cover object-center hero-image"
          data-no-filter="true"
        />
        <div className="hero-gradient absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-slate-50 dark:to-[#050505]" style={{ opacity: '0.50' }} />
        <div className="absolute inset-0 flex items-center justify-center hero-content">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <BackButton className="text-white/80 hover:text-white bg-black/30 hover:bg-black/40 rounded-lg" />
              <Sparkles className="w-8 h-8 text-violet-400" />
              <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-[0_0_30px_rgba(139,92,246,0.5)] tracking-wide"
                  style={{ fontFamily: 'serif', textShadow: '0 0 40px rgba(139,92,246,0.6), 0 2px 4px rgba(0,0,0,0.8)' }}>
                Initiations
              </h1>
              <ForwardButton currentPage="Initiations" className="text-white/80 hover:text-white bg-black/30 hover:bg-black/40 rounded-lg" />
            </div>
            <div className="p-4 rounded-2xl bg-black/[0.94] backdrop-blur-sm border border-white/20 mt-4">
              <p className="text-violet-200/90 text-base tracking-wider drop-shadow-lg">
                Sacred Pathways · Saint Germain Transmissions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8 bg-[rgba(0,0,0,0.75)] border border-[rgba(0,255,136,0.2)] flex flex-wrap">
              <TabsTrigger value="initiations">Initiations</TabsTrigger>
              <TabsTrigger value="progress">
                <Trophy className="w-4 h-4 mr-2" />
                Progress
              </TabsTrigger>
              <TabsTrigger value="guidance">
                <Compass className="w-4 h-4 mr-2" />
                Guidance
              </TabsTrigger>
              <TabsTrigger value="transmissions">Transmissions</TabsTrigger>
              <TabsTrigger value="badges">Badge System</TabsTrigger>
              <TabsTrigger value="source">
                <BookOpen className="w-4 h-4 mr-2" />
                Source Texts
              </TabsTrigger>
            </TabsList>

            <TabsContent value="initiations">
              <div className="grid md:grid-cols-2 gap-6">
                {INITIATIONS.map(init => (
                  <InitiationCard
                    key={init.id}
                    initiation={init}
                    profile={profile}
                    badges={badges}
                    onStart={setActiveInitiation}
                  />
                ))}
              </div>

              {/* Meta-Variance Info */}
              <Card className="mt-8 bg-[rgba(0,0,0,0.85)] border-[rgba(0,255,136,0.2)]">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Star className="w-6 h-6 text-amber-400" />
                    <CardTitle className="text-white">Meta-Variance Integration</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-violet-200 mb-4">
                    {META_VARIANCE_TAGLINES.scientific}
                  </p>
                  <p className="text-slate-300 text-sm">
                    Each initiation incorporates Meta-Variance through the Coherence Factor — 
                    a measure of your alignment with the quantum field. Higher coherence means 
                    deeper initiations and greater rewards, reflecting the principle that 
                    reality adapts to your frequency.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="progress">
              <InitiationGamification 
                userId={currentUser?.email} 
                profile={profile}
              />
            </TabsContent>

            <TabsContent value="guidance">
              <AIOnboardingGuidance 
                userId={currentUser?.email} 
                profile={profile}
              />
            </TabsContent>

            <TabsContent value="transmissions">
              <div className="space-y-4">
                {Object.entries(TRANSMISSIONS).map(([key, transmission]) => (
                  <TransmissionCard key={key} id={key} transmission={transmission} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="badges">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(BADGE_CATEGORIES).map(([key, category]) => (
                  <Card key={key} className={cn(
                    "bg-[rgba(0,0,0,0.85)] border-[rgba(0,255,136,0.2)]",
                    category.color === 'violet' && "border-l-4 border-l-violet-500",
                    category.color === 'amber' && "border-l-4 border-l-amber-500",
                    category.color === 'emerald' && "border-l-4 border-l-emerald-500",
                    category.color === 'blue' && "border-l-4 border-l-blue-500",
                    category.color === 'purple' && "border-l-4 border-l-purple-500",
                    category.color === 'rose' && "border-l-4 border-l-rose-500",
                    category.color === 'teal' && "border-l-4 border-l-teal-500"
                  )}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white text-lg">{category.name}</CardTitle>
                      <CardDescription>{category.purpose}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1">
                        {category.examples.slice(0, 4).map(example => (
                          <Badge 
                            key={example} 
                            variant="outline" 
                            className="text-xs text-slate-400 border-slate-600"
                          >
                            {example}
                          </Badge>
                        ))}
                        {category.examples.length > 4 && (
                          <Badge variant="outline" className="text-xs text-slate-500 border-slate-700">
                            +{category.examples.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}