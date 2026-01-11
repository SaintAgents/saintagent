import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import AffiliateTracker from '@/components/affiliate/AffiliateTracker';
import { 
  Sparkles, 
  DollarSign, 
  Hammer, 
  GraduationCap, 
  Users, 
  Radio,
  Shield,
  Lock,
  Eye,
  ArrowRight,
  Star,
  Zap,
  Target,
  Heart,
  Crown,
  HelpCircle
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const PILLARS = [
  { id: 'earn', label: 'Earn', icon: DollarSign, color: 'from-emerald-500 to-teal-600', description: 'Monetize your skills and services in our trusted marketplace' },
  { id: 'build', label: 'Build', icon: Hammer, color: 'from-amber-500 to-orange-600', description: 'Launch missions and projects with aligned collaborators' },
  { id: 'learn', label: 'Learn', icon: GraduationCap, color: 'from-blue-500 to-indigo-600', description: 'Access mentors, courses, and growth opportunities' },
  { id: 'teach', label: 'Teach', icon: Radio, color: 'from-purple-500 to-violet-600', description: 'Share your wisdom and guide others on their path' },
  { id: 'connect', label: 'Connect', icon: Users, color: 'from-rose-500 to-pink-600', description: 'Find your tribe through AI-powered synchronicity matching' },
];

const PHASES = [
  { phase: 1, title: 'Arrival', description: 'Create your profile and set your intentions', icon: Star, gradient: 'from-[#2d1b69] to-[#1a0f3d]', border: '#4a2fb8' },
  { phase: 2, title: 'Discovery', description: 'Explore the platform and find your first connections', icon: Eye, gradient: 'from-[#1e3a5f] to-[#0f1e30]', border: '#2e5c8a' },
  { phase: 3, title: 'Activation', description: 'Complete your first meeting and earn GGG', icon: Zap, gradient: 'from-[#0d4d4d] to-[#063333]', border: '#1a7a7a' },
  { phase: 4, title: 'Contribution', description: 'Join a mission or create an offer', icon: Target, gradient: 'from-[#4d2c1e] to-[#331c14]', border: '#7a4a2e' },
  { phase: 5, title: 'Integration', description: 'Build your reputation and trust score', icon: Shield, gradient: 'from-[#4d1e4d] to-[#2d0f2d]', border: '#7a2e7a' },
  { phase: 6, title: 'Expansion', description: 'Grow your network and influence', icon: Heart, gradient: 'from-[#1e4d3a] to-[#0f2d1e]', border: '#2e7a5c' },
  { phase: 7, title: 'Ascension', description: 'Unlock leadership tiers and advanced features', icon: Crown, gradient: 'from-[#5c4d1e] to-[#3d2d0f]', border: '#8a7a2e' },
];

const TRUST_FEATURES = [
  { icon: Shield, title: 'Verified Members', description: 'Every Saint Agent is verified through our trust system' },
  { icon: Lock, title: 'Secure Platform', description: 'Your data is protected with enterprise-grade security' },
  { icon: Eye, title: 'Transparent Reputation', description: 'See trust scores and testimonials before connecting' },
];

export default function Join() {
  const handleJoin = () => {
    base44.auth.redirectToLogin(createPageUrl('Onboarding'));
  };

  const handleSignIn = () => {
    base44.auth.redirectToLogin(createPageUrl('CommandDeck'));
  };

  return (
    <div className="min-h-screen text-white" style={{
      backgroundImage: `url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/48467bf50_universal_upscale_0_1f89ab0b-f95f-44fd-abf7-63c29460b2b1_0.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      {/* Track affiliate referrals from ?ref=CODE */}
      <AffiliateTracker />
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-900/50" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-violet-950/60 to-slate-900/90" />
        
        {/* Gold Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="gold-particle absolute rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                bottom: `-20px`,
                width: `${Math.random() * 6 + 3}px`,
                height: `${Math.random() * 6 + 3}px`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 4 + 4}s`,
              }}
            />
          ))}
        </div>
        
        <style>{`
          @keyframes floatUp {
            0% {
              transform: translateY(0) scale(0.5);
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            50% {
              opacity: 1;
              transform: translateY(-40vh) scale(1);
            }
            90% {
              opacity: 0.5;
            }
            100% {
              transform: translateY(-80vh) scale(0.3);
              opacity: 0;
            }
          }
          @keyframes pulse {
            0%, 100% {
              box-shadow: 0 0 4px 2px rgba(255, 215, 0, 0.6);
            }
            50% {
              box-shadow: 0 0 12px 4px rgba(255, 215, 0, 1);
            }
          }
          .gold-particle {
            background: radial-gradient(circle, #ffd700 0%, #daa520 50%, #b8860b 100%);
            animation: floatUp 6s ease-in-out infinite, pulse 2s ease-in-out infinite;
          }
        `}</style>
        
        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-32 text-center">
          {/* Animated Gold Title */}
          <h2 className="text-2xl md:text-3xl font-bold mb-6 gold-shimmer-text">
            Agents of Positive Change Unite!
          </h2>
          
          <style>{`
            @keyframes goldShimmer {
              0% {
                background-position: -200% center;
              }
              90% {
                background-position: 200% center;
              }
              95% {
                background-position: 200% center;
                filter: brightness(1);
              }
              97% {
                filter: brightness(2);
              }
              100% {
                background-position: 200% center;
                filter: brightness(1);
              }
            }
            .gold-shimmer-text {
              background: linear-gradient(
                90deg,
                #b8860b 0%,
                #ffd700 15%,
                #ffec8b 30%,
                #ffd700 45%,
                #daa520 60%,
                #b8860b 75%,
                #ffd700 90%,
                #ffec8b 100%
              );
              background-size: 200% auto;
              -webkit-background-clip: text;
              background-clip: text;
              -webkit-text-fill-color: transparent;
              animation: goldShimmer 4s ease-in-out infinite;
              text-shadow: none;
            }
          `}</style>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/20 border border-violet-400/30 mb-8">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-sm text-violet-300">Join the 144,000 Super-Conscious Leaders</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-violet-200 to-amber-200 bg-clip-text text-transparent">
            Build Together.<br />Rise Together.
          </h1>

          {/* SAINT Acronym */}
          <div className="mb-8 px-6 py-4 rounded-xl bg-gradient-to-r from-violet-900/40 to-purple-900/40 border border-violet-500/30 max-w-xl mx-auto">
            <p className="text-lg md:text-xl font-semibold text-violet-200 tracking-wide">
              <span className="text-amber-400">S</span>piritually <span className="text-amber-400">A</span>ligned <span className="text-amber-400">I</span>nternational <span className="text-amber-400">N</span>etworking <span className="text-amber-400">T</span>eams
            </p>
          </div>
          
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10">
            Saint Agents is a platform for conscious creators, healers, builders, and leaders 
            to connect, collaborate, and create meaningful impact in the world.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-lg px-8 py-6 rounded-xl shadow-lg shadow-violet-500/25"
              onClick={handleJoin}
            >
              Become a Saint Agent
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-slate-600 text-slate-300 hover:bg-slate-800 text-lg px-8 py-6 rounded-xl"
              onClick={handleSignIn}
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>

      {/* 5 Pillars Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">The Five Pillars</h2>
            <p className="text-cyan-400 max-w-xl mx-auto">
              Everything you need to thrive in the new conscious economy
            </p>
          </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {PILLARS.map((pillar) => (
            <Card key={pillar.id} className="bg-slate-800/50 border-slate-700 hover:border-violet-500/50 transition-all hover:scale-105 cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${pillar.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <pillar.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{pillar.label}</h3>
                <p className="text-sm text-cyan-400">{pillar.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* GGG Value Section */}
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 rounded-2xl border border-amber-500/30 p-8">
          <p className="text-lg md:text-xl text-slate-200 mb-4">
            Earn value through interactions, exchange real currency, gain valuable wisdom and connections.
          </p>
          <p className="text-amber-400 font-semibold">
            <a 
              href="https://gaiaglobal.gold" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-amber-300 underline underline-offset-4 transition-colors"
            >
              Gaia Global Gold (GGG)
            </a>
            {" "}redeemable monthly.
          </p>
        </div>
      </div>

      {/* Trust Features */}
      <div className="bg-slate-800/30 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TRUST_FEATURES.map((feature, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center shrink-0">
                  <feature.icon className="w-6 h-6 text-violet-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-cyan-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7 Phases Journey */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Your 7-Phase Journey</h2>
            <p className="text-cyan-400 max-w-xl mx-auto">
              A guided path from newcomer to conscious leader
            </p>
          </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {PHASES.map((phase) => (
            <div 
              key={phase.phase} 
              className={`relative p-6 rounded-xl bg-gradient-to-br ${phase.gradient} shadow-lg`}
              style={{ border: `2px solid ${phase.border}`, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)' }}
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <phase.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-xs text-violet-300 font-semibold tracking-wide">PHASE {phase.phase}</div>
                  <h3 className="text-lg font-bold text-white" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)' }}>{phase.title}</h3>
                </div>
              </div>
              <p className="text-sm text-gray-100 leading-relaxed font-medium">{phase.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="bg-gradient-to-br from-violet-900/50 to-purple-900/50 rounded-3xl border border-violet-500/30 p-12">
          <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Begin?</h2>
          <p className="text-slate-300 mb-8 max-w-lg mx-auto">
            Join thousands of conscious creators building the future together. 
            Your mission awaits.
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-lg px-10 py-6 rounded-xl shadow-lg shadow-amber-500/25"
            onClick={handleJoin}
          >
            Become a Saint Agent
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <span className="font-semibold text-white">Saint Agents</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-400">
            <a href={createPageUrl('Terms')} className="hover:text-white transition-colors">Terms</a>
            <a href={createPageUrl('FAQ')} className="hover:text-white transition-colors">FAQ</a>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 mt-6 text-center">
          <p className="text-xs text-violet-400">
            © Copyright Saint Agents 1998 - Built by Mathew Louis Schlueter aka Mathues Imhotep - Author of "The 7th Seal: Hidden Wisdom Unveiled" - Founder of 7th Seal Temple
          </p>
        </div>
      </div>
    </div>
  );
}