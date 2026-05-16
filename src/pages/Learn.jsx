import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createPageUrl } from '@/utils';
import { ScrollArea } from "@/components/ui/scroll-area";
import TestimonialsMarquee from '@/components/testimonials/TestimonialsMarquee';
import { 
  Sparkles, DollarSign, Hammer, GraduationCap, Users, Radio,
  Shield, Lock, Eye, ArrowRight, Star, Zap, Target, Heart, Crown,
  BookOpen, Play, Compass, Rocket
} from 'lucide-react';

const PILLARS = [
  { id: 'earn', label: 'Earn', icon: DollarSign, color: 'from-emerald-500 to-teal-600', description: 'Monetize your skills and services in our trusted marketplace', link: 'Marketplace' },
  { id: 'build', label: 'Build', icon: Hammer, color: 'from-amber-500 to-orange-600', description: 'Launch missions and projects with aligned collaborators', link: 'Missions' },
  { id: 'learn', label: 'Learn', icon: GraduationCap, color: 'from-blue-500 to-indigo-600', description: 'Access mentors, courses, and growth opportunities', link: 'Mentorship' },
  { id: 'teach', label: 'Teach', icon: Radio, color: 'from-purple-500 to-violet-600', description: 'Share your wisdom and guide others on their path', link: 'Studio' },
  { id: 'connect', label: 'Connect', icon: Users, color: 'from-rose-500 to-pink-600', description: 'Find your tribe through AI-powered synchronicity matching', link: 'Matches' },
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

const QUICK_LINKS = [
  { label: 'Missions', icon: Target, href: 'Missions', color: 'bg-amber-500' },
  { label: 'Marketplace', icon: DollarSign, href: 'Marketplace', color: 'bg-emerald-500' },
  { label: 'Matches', icon: Users, href: 'Matches', color: 'bg-violet-500' },
  { label: 'Mentorship', icon: GraduationCap, href: 'Mentorship', color: 'bg-blue-500' },
  { label: 'Projects', icon: Hammer, href: 'Projects', color: 'bg-orange-500' },
  { label: 'Circles', icon: Users, href: 'Circles', color: 'bg-rose-500' },
  { label: 'Leader Channel', icon: Crown, href: 'LeaderChannel', color: 'bg-purple-500' },
  { label: 'Gamification', icon: Star, href: 'Gamification', color: 'bg-cyan-500' },
];

export default function Learn() {
  return (
    <div className="min-h-screen text-white" style={{
      backgroundImage: `url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/48467bf50_universal_upscale_0_1f89ab0b-f95f-44fd-abf7-63c29460b2b1_0.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-900/50" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-violet-950/60 to-slate-900/90" />

        <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/20 border border-violet-400/30 mb-6">
            <BookOpen className="w-4 h-4 text-violet-400" />
            <span className="text-sm text-violet-300">Platform Guide & Overview</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-violet-200 to-amber-200 bg-clip-text text-transparent">
            Learn the Platform
          </h1>

          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
            Everything you need to know about Saint Agents — the pillars, your journey, and how to maximize your impact.
          </p>

          <Button
            size="lg"
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 rounded-xl shadow-lg shadow-violet-500/25"
            onClick={() => window.location.href = createPageUrl('CommandDeck')}
          >
            <Compass className="w-5 h-5 mr-2" />
            Back to Command Deck
          </Button>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-center mb-8">Quick Navigation</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {QUICK_LINKS.map((link) => (
            <button
              key={link.label}
              onClick={() => window.location.href = createPageUrl(link.href)}
              className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-violet-500/50 hover:scale-105 transition-all text-left"
            >
              <div className={`w-10 h-10 rounded-lg ${link.color} flex items-center justify-center shrink-0`}>
                <link.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-white">{link.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 5 Pillars Section */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">The Five Pillars</h2>
          <p className="text-cyan-400 max-w-xl mx-auto">
            Everything you need to thrive in the new conscious economy
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {PILLARS.map((pillar) => (
            <Card
              key={pillar.id}
              className="bg-slate-800/50 border-slate-700 hover:border-violet-500/50 transition-all hover:scale-105 cursor-pointer"
              onClick={() => window.location.href = createPageUrl(pillar.link)}
            >
              <CardContent className="p-6 text-center">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${pillar.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <pillar.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{pillar.label}</h3>
                <p className="text-sm text-cyan-400 mb-3">{pillar.description}</p>
                <span className="text-xs text-violet-400 font-medium flex items-center justify-center gap-1">
                  Explore <ArrowRight className="w-3 h-3" />
                </span>
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
            <a href="https://gaiaglobal.gold" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 underline underline-offset-4 transition-colors">
              Gaia Global Gold (GGG)
            </a>{" "}redeemable monthly.
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

      {/* How You Earn Section */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How You Earn & Grow</h2>
          <p className="text-cyan-400 max-w-xl mx-auto">The mechanics behind your platform success</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700">
            <Target className="w-8 h-8 text-emerald-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Quest System</h3>
            <p className="text-sm text-slate-300">Every goal is structured as a mission. The platform tracks your progress, unlocks milestones, and provides the roadmap for your next expansion.</p>
          </div>
          <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700">
            <Zap className="w-8 h-8 text-amber-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Synergy Engine</h3>
            <p className="text-sm text-slate-300">Our engine identifies the exact partners you need. It matches your strengths with complementary visionaries, optimized for success and spiritual alignment.</p>
          </div>
          <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700">
            <DollarSign className="w-8 h-8 text-violet-400 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Impact Equity</h3>
            <p className="text-sm text-slate-300">Contribute to humanitarian missions to earn Impact Shares — build wealth that is inherently ethical and aligned with your values.</p>
          </div>
        </div>
      </div>

      {/* Testimonials Marquee */}
      <div className="py-16 bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-6 mb-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Agents Say</h2>
          <p className="text-cyan-400">Real stories from our conscious community</p>
        </div>
        <TestimonialsMarquee />
      </div>

      {/* CTA - Explore More */}
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="bg-gradient-to-br from-violet-900/50 to-purple-900/50 rounded-3xl border border-violet-500/30 p-12">
          <Rocket className="w-12 h-12 text-amber-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Dive In?</h2>
          <p className="text-slate-300 mb-8 max-w-lg mx-auto">
            Head back to your Command Deck and start exploring missions, earning GGG, and building your network.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-lg px-10 py-6 rounded-xl shadow-lg shadow-amber-500/25"
              onClick={() => window.location.href = createPageUrl('CommandDeck')}
            >
              Command Deck
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-violet-500/50 bg-violet-900/30 text-violet-200 hover:bg-violet-800/50 hover:border-violet-400 text-lg px-8 py-6 rounded-xl"
              onClick={() => window.location.href = createPageUrl('Missions')}
            >
              Browse Missions
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs text-violet-400">
            © Copyright Saint Agents 1998 - Built by Mathew Louis Schlueter aka Mathues Imhotep - Author of "The 7th Seal: Hidden Wisdom Unveiled" - Founder of 7th Seal Temple
          </p>
        </div>
      </div>
    </div>
  );
}