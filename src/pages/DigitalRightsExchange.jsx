import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, Key, Clock, Lock, Unlock, FileText, Music, Video, Image as ImageIcon,
  Users, TrendingUp, DollarSign, Eye, Download, Edit3, Share2, Plus,
  ChevronRight, Sparkles, CheckCircle2, AlertTriangle, BarChart3, Zap,
  BookOpen, Brain, Mic, HelpCircle, ArrowRight, Globe, Layers, RefreshCcw
} from 'lucide-react';
import { cn } from "@/lib/utils";
import BackButton from '@/components/hud/BackButton';
import ForwardButton from '@/components/hud/ForwardButton';
import DRXMyAssets from '@/components/drx/DRXMyAssets';
import DRXGrantedRights from '@/components/drx/DRXGrantedRights';
import DRXIncomingAccess from '@/components/drx/DRXIncomingAccess';
import DRXCreateGrant from '@/components/drx/DRXCreateGrant';
import DRXAnalytics from '@/components/drx/DRXAnalytics';

const BENEFITS = [
  {
    icon: Shield,
    title: "True Digital Sovereignty",
    description: "Maintain ownership while granting controlled access. Rights can be time-bound, usage-limited, revocable, or conditional."
  },
  {
    icon: DollarSign,
    title: "Flexible Monetization",
    description: "Rent, license, subscription-based, revenue-share, or usage-metered access. Unlock new income without surrendering IP."
  },
  {
    icon: Lock,
    title: "Trust-Based Sharing",
    description: "Share sensitive materials securely with specific individuals for limited periods with verification requirements."
  },
  {
    icon: Clock,
    title: "Automated Expiration",
    description: "Rights automatically expire based on predefined conditions. Reduce legal friction and administrative overhead."
  },
  {
    icon: Eye,
    title: "Distribution Protection",
    description: "Streaming-only controls, expiring tokens, watermarking, and device binding reduce misuse while preserving usability."
  },
  {
    icon: Layers,
    title: "Scalable Licensing Economy",
    description: "Digital rights become tradable assets enabling secondary licensing, fractional access, and collaborative governance."
  }
];

const USE_CASES = [
  { icon: Music, title: "Temporary Audio Lending", desc: "7-day streaming access, auto-expires, optional renewal" },
  { icon: FileText, title: "Copy-Left Documents", desc: "30-day editable access with attribution requirements" },
  { icon: BookOpen, title: "Course Rentals", desc: "90-day full streaming, no download, fixed fee" },
  { icon: Lock, title: "Conditional Unlock", desc: "Access only after NDA or reputation threshold" },
  { icon: Users, title: "Collaborative Editing", desc: "14-day multi-user edit with version history" },
  { icon: Brain, title: "AI Prompt Licensing", desc: "100 uses, non-transferable, 30-day window" },
  { icon: Mic, title: "Advisory Replay Access", desc: "48-hour replay of strategy sessions" },
  { icon: Key, title: "Digital Inheritance", desc: "Encrypted vault with inactivity triggers" }
];

export default function DigitalRightsExchange() {
  const [activeTab, setActiveTab] = useState('overview');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: profile } = useQuery({
    queryKey: ['myProfile', currentUser?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_id: currentUser.email });
      return profiles[0];
    },
    enabled: !!currentUser?.email
  });

  const { data: myAssets = [] } = useQuery({
    queryKey: ['drxAssets', currentUser?.email],
    queryFn: () => base44.entities.DRXAsset.filter({ owner_id: currentUser.email }),
    enabled: !!currentUser?.email
  });

  const { data: grantedRights = [] } = useQuery({
    queryKey: ['drxGrantsOut', currentUser?.email],
    queryFn: () => base44.entities.DRXRightsGrant.filter({ grantor_id: currentUser.email }),
    enabled: !!currentUser?.email
  });

  const { data: incomingRights = [] } = useQuery({
    queryKey: ['drxGrantsIn', currentUser?.email],
    queryFn: () => base44.entities.DRXRightsGrant.filter({ grantee_id: currentUser.email }),
    enabled: !!currentUser?.email
  });

  const activeGrants = grantedRights.filter(g => g.status === 'active');
  const activeIncoming = incomingRights.filter(g => g.status === 'active');
  const expiringSoon = [...grantedRights, ...incomingRights].filter(g => {
    if (g.status !== 'active' || !g.expiration_date) return false;
    const daysLeft = Math.ceil((new Date(g.expiration_date) - new Date()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 7 && daysLeft > 0;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1920')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-slate-900" />
        
        <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-24">
          <div className="flex items-center justify-between mb-8">
            <BackButton className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20" />
            <ForwardButton currentPage="DigitalRightsExchange" className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20" />
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-6">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-300 text-sm font-medium">Programmable Digital Sovereignty</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6" style={{ fontFamily: 'serif' }}>
              Digital Rights Exchange
              <span className="block text-2xl md:text-3xl text-indigo-300 mt-2 font-normal">DRX</span>
            </h1>

            <p className="text-xl text-slate-300 mb-8 leading-relaxed max-w-3xl mx-auto">
              Transform how digital assets are shared, licensed, and monetized. 
              Gain <span className="text-emerald-400 font-semibold">programmable control</span> over access, 
              duration, permissions, and conditions.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Button 
                size="lg" 
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                onClick={() => setActiveTab('assets')}
              >
                <Plus className="w-5 h-5" />
                Upload Asset
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10 gap-2"
                onClick={() => setActiveTab('incoming')}
              >
                <Key className="w-5 h-5" />
                View My Access
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4">
                <div className="text-3xl font-bold text-white">{myAssets.length}</div>
                <div className="text-sm text-slate-400">My Assets</div>
              </div>
              <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4">
                <div className="text-3xl font-bold text-emerald-400">{activeGrants.length}</div>
                <div className="text-sm text-slate-400">Active Grants</div>
              </div>
              <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4">
                <div className="text-3xl font-bold text-indigo-400">{activeIncoming.length}</div>
                <div className="text-sm text-slate-400">Access Rights</div>
              </div>
              <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4">
                <div className="text-3xl font-bold text-amber-400">{expiringSoon.length}</div>
                <div className="text-sm text-slate-400">Expiring Soon</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/5 border border-white/10 p-1 mb-8">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white/10 text-white/70 data-[state=active]:text-white gap-2">
              <HelpCircle className="w-4 h-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="assets" className="data-[state=active]:bg-white/10 text-white/70 data-[state=active]:text-white gap-2">
              <Layers className="w-4 h-4" /> My Assets
            </TabsTrigger>
            <TabsTrigger value="granted" className="data-[state=active]:bg-white/10 text-white/70 data-[state=active]:text-white gap-2">
              <Share2 className="w-4 h-4" /> Granted Rights
            </TabsTrigger>
            <TabsTrigger value="incoming" className="data-[state=active]:bg-white/10 text-white/70 data-[state=active]:text-white gap-2">
              <Key className="w-4 h-4" /> My Access
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-white/10 text-white/70 data-[state=active]:text-white gap-2">
              <BarChart3 className="w-4 h-4" /> Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-12">
            {/* Benefits Grid */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Shield className="w-6 h-6 text-emerald-400" />
                Core Benefits
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {BENEFITS.map((benefit, i) => (
                  <Card key={i} className="bg-white/5 border-white/10 hover:border-emerald-500/30 transition-all">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4">
                        <benefit.icon className="w-6 h-6 text-emerald-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">{benefit.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Use Cases */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-indigo-400" />
                Use Cases
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {USE_CASES.map((uc, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all cursor-pointer">
                    <div className="flex items-center gap-3 mb-2">
                      <uc.icon className="w-5 h-5 text-indigo-400" />
                      <h4 className="font-medium text-white text-sm">{uc.title}</h4>
                    </div>
                    <p className="text-xs text-slate-400">{uc.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-gradient-to-br from-indigo-900/50 to-emerald-900/30 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-8 text-center">How DRX Works</h2>
              <div className="grid md:grid-cols-4 gap-6">
                {[
                  { step: 1, title: "Upload Asset", desc: "Add your digital content to the vault", icon: Plus },
                  { step: 2, title: "Define Rights", desc: "Set access scope, duration, conditions", icon: Edit3 },
                  { step: 3, title: "Grant Access", desc: "Issue rights token to specific users", icon: Key },
                  { step: 4, title: "Track & Monetize", desc: "Monitor usage, auto-expire, earn", icon: TrendingUp }
                ].map((item, i) => (
                  <div key={i} className="text-center">
                    <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-4">
                      <item.icon className="w-7 h-7 text-emerald-400" />
                    </div>
                    <div className="text-xs text-emerald-400 mb-1">Step {item.step}</div>
                    <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                    {i < 3 && <ChevronRight className="w-5 h-5 text-white/30 mx-auto mt-4 hidden md:block" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Strategic Value */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Globe className="w-6 h-6 text-amber-400" />
                Strategic Value
              </h2>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <p className="text-slate-300 leading-relaxed mb-6">
                  The Digital Rights Exchange shifts SaintAgent.world from being a content platform to becoming a 
                  <span className="text-emerald-400 font-semibold"> programmable digital ownership infrastructure</span>.
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    "Intellectual property protection",
                    "Secure collaboration",
                    "Creator monetization",
                    "Knowledge economy growth",
                    "Rights-based digital commerce",
                    "Programmable access control"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-sm text-slate-300">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <p className="text-amber-200 text-sm italic">
                    "In a world where digital duplication is frictionless, DRX reintroduces controlled permission 
                    as a first-class asset — turning access itself into value."
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center py-8">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white gap-2"
                onClick={() => setActiveTab('assets')}
              >
                Get Started with DRX
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="assets">
            <DRXMyAssets 
              assets={myAssets} 
              profile={profile} 
              currentUser={currentUser}
              onCreateGrant={() => setCreateModalOpen(true)}
            />
          </TabsContent>

          <TabsContent value="granted">
            <DRXGrantedRights grants={grantedRights} />
          </TabsContent>

          <TabsContent value="incoming">
            <DRXIncomingAccess grants={incomingRights} />
          </TabsContent>

          <TabsContent value="analytics">
            <DRXAnalytics assets={myAssets} grants={grantedRights} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Grant Modal */}
      <DRXCreateGrant 
        open={createModalOpen} 
        onClose={() => setCreateModalOpen(false)}
        assets={myAssets}
        profile={profile}
      />
    </div>
  );
}