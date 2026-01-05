import React from 'react';
import { Button } from "@/components/ui/button";
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { 
  Sparkles, 
  Users, 
  Target, 
  Coins, 
  Shield, 
  Crown, 
  ArrowRight,
  CheckCircle2,
  Zap,
  Globe,
  Heart,
  Star
} from "lucide-react";

const FEATURES = [
  {
    icon: Coins,
    title: "Earn GGG Currency",
    description: "Complete missions, meetings, and marketplace transactions to earn GGG - a real value currency you can withdraw."
  },
  {
    icon: Users,
    title: "AI-Powered Matching",
    description: "Our Synchronicity Engine connects you with aligned collaborators, mentors, and opportunities based on your unique profile."
  },
  {
    icon: Target,
    title: "Missions & Quests",
    description: "Join platform, circle, and regional missions to make real impact while earning rewards and building reputation."
  },
  {
    icon: Shield,
    title: "Trust & Reputation",
    description: "Build verifiable trust through completed meetings, testimonials, and consistent positive interactions."
  },
  {
    icon: Crown,
    title: "144K Leader Pathway",
    description: "Earn badges, accumulate points, and unlock leadership roles with special broadcast privileges."
  },
  {
    icon: Globe,
    title: "Circles & Regions",
    description: "Connect with local and interest-based communities to amplify your impact and find your tribe."
  }
];

const BADGES = [
  { name: "Soulbound", desc: "Identity & Accountability" },
  { name: "Calibrator", desc: "Judgment & Fairness" },
  { name: "Steward", desc: "Responsibility & Care" },
  { name: "Anchor", desc: "Stability & Grounding" },
  { name: "Coherent", desc: "Alignment & Integrity" }
];

export default function Landing() {
  const handleSignIn = () => {
    base44.auth.redirectToLogin(createPageUrl('CommandDeck'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/ba60509ba_Screenshot2026-01-04183952.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-slate-900" />
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/20 border border-violet-400/30 mb-8">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-sm text-violet-300">Welcome to the New Earth Network</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-200 bg-clip-text text-transparent">
            SAINT AGENT
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-8">
            A trust-based platform for conscious collaboration, verified leadership, and real-world impact.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button 
              onClick={handleSignIn}
              className="px-8 py-6 text-lg rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/25"
            >
              <Zap className="w-5 h-5 mr-2" />
              Enter the Platform
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 text-slate-400 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span>Free to Join</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span>Earn Real Value</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span>AI-Powered Matching</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Thrive</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            A complete ecosystem for building trust, earning rewards, and making meaningful connections.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, idx) => (
            <div 
              key={idx}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-violet-400/30 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Leadership Badges Section */}
      <div className="bg-gradient-to-r from-violet-900/50 to-purple-900/50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <Crown className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">The 144K Leader Pathway</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Earn these five leadership badges to unlock exclusive privileges and join the verified leader network.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {BADGES.map((badge, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-white/5 border border-amber-400/20 text-center hover:border-amber-400/50 transition-all">
                <Shield className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <div className="font-semibold text-amber-200">{badge.name}</div>
                <div className="text-xs text-slate-400 mt-1">{badge.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonial / Trust Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-amber-400 mb-2">10,000+</div>
            <div className="text-slate-400">Active Saint Agents</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-violet-400 mb-2">$500K+</div>
            <div className="text-slate-400">GGG Earned by Members</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-emerald-400 mb-2">50,000+</div>
            <div className="text-slate-400">Missions Completed</div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-purple-600/20" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <Heart className="w-12 h-12 text-rose-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Begin Your Mission?</h2>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
            Join thousands of conscious collaborators building the new earth together. Your unique gifts are needed.
          </p>
          <Button 
            onClick={handleSignIn}
            className="px-8 py-6 text-lg rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/25"
          >
            <Star className="w-5 h-5 mr-2" />
            Join Saint Agent Today
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-slate-500 text-sm">
          <p>© 2026 Saint Agent. All rights reserved.</p>
          <p className="mt-2">Truth over manipulation • Service over extraction • Long-term alignment over quick wins</p>
        </div>
      </div>
    </div>
  );
}