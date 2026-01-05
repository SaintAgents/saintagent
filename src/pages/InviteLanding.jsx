import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { 
  Coins, Users, BookOpen, Sparkles, Target, Shield, 
  ArrowRight, CheckCircle2, Zap, Globe, Heart, Star,
  TrendingUp, Award, Lock, MessageCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

const PILLARS = [
  { 
    icon: Coins, 
    title: 'Earn', 
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    desc: 'GGG rewards for every meaningful contribution — mentorship, introductions, missions completed' 
  },
  { 
    icon: Target, 
    title: 'Build', 
    color: 'from-violet-500 to-purple-500',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    desc: 'Launch projects with aligned collaborators. Find your co-founders, not just connections.' 
  },
  { 
    icon: BookOpen, 
    title: 'Learn', 
    color: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    desc: 'Access wisdom from practitioners, healers, builders, and guides on the same path.' 
  },
  { 
    icon: Heart, 
    title: 'Teach', 
    color: 'from-rose-500 to-pink-500',
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    desc: 'Share your gifts in the marketplace. Your expertise becomes someone else\'s breakthrough.' 
  },
  { 
    icon: Sparkles, 
    title: 'Connect', 
    color: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    desc: 'AI-powered matching based on values, skills, and spiritual alignment — not algorithms.' 
  },
];

const TRUST_FEATURES = [
  { icon: Shield, text: 'Trust-weighted reputation system' },
  { icon: Lock, text: 'Permission-based contact sharing' },
  { icon: Award, text: 'Earned badges & verifiable contributions' },
  { icon: TrendingUp, text: 'Transparent rank progression' },
];

export default function InviteLanding() {
  const handleJoin = async () => {
    const isAuthed = await base44.auth.isAuthenticated();
    if (isAuthed) {
      window.location.href = createPageUrl('Onboarding');
    } else {
      base44.auth.redirectToLogin(createPageUrl('Onboarding'));
    }
  };

  return (
    <div className="min-h-screen text-white overflow-hidden relative" style={{ background: `linear-gradient(to bottom, rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.9), rgba(46, 16, 101, 0.95)), url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/dbcd7bf6d_gemini-25-flash-image_make_yes_normal_human_with_blue_iris-0.jpg') center/cover fixed` }}>
      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-24 max-w-6xl mx-auto">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-6 bg-violet-500/20 text-violet-300 border-violet-500/30 px-4 py-1.5">
              <Zap className="w-3 h-3 mr-1" />
              The Network for Conscious Builders
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
              Build Together.
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Rise Together.
              </span>
            </h1>
            
            <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              You're not just another user. You're a <span className="text-violet-400 font-semibold">Saint Agent</span> — 
              part of a trust-based network where contribution is currency, collaboration is sacred, 
              and your growth fuels the collective mission.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button 
              size="lg" 
              onClick={handleJoin}
              className="h-14 px-8 text-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 rounded-xl shadow-lg shadow-violet-500/25"
            >
              Become a Saint Agent
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-sm text-slate-400">
              Join 144,000+ conscious creators
            </p>
          </motion.div>
        </div>
      </section>

      {/* Value Pillars */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">One Platform. Five Paths.</h2>
          <p className="mt-3 text-slate-400">Everything you need to grow, contribute, and connect.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {PILLARS.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative p-6 rounded-2xl ${pillar.bg} border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all group`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${pillar.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <pillar.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900">{pillar.title}</h3>
              <p className="text-sm text-slate-700 leading-relaxed">{pillar.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trust & Reputation */}
      <section className="px-6 py-20 bg-gradient-to-b from-transparent to-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                Trust-First Design
              </Badge>
              <h2 className="text-3xl font-bold mb-4">
                Reputation is Earned,
                <br />
                <span className="text-emerald-400">Never Bought.</span>
              </h2>
              <p className="text-slate-300 leading-relaxed mb-6">
                This isn't LinkedIn. It's not a dating app. It's a federated intelligence network 
                for conscious builders — where your reputation is earned through action, 
                access is permission-based, and every connection serves a higher purpose.
              </p>
              
              <div className="space-y-3">
                {TRUST_FEATURES.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 text-slate-300">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <feature.icon className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span>{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-emerald-600/20 rounded-3xl blur-2xl" />
              <div className="relative bg-slate-800/50 border border-white/10 rounded-3xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-2xl font-bold">
                    SA
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Saint Agent #144</h4>
                    <p className="text-sm text-slate-400">Rank: Oracle • Trust: 94</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-slate-700/50 rounded-xl p-3">
                    <p className="text-2xl font-bold text-amber-400">2,450</p>
                    <p className="text-xs text-slate-400">GGG Earned</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-3">
                    <p className="text-2xl font-bold text-violet-400">47</p>
                    <p className="text-xs text-slate-400">Missions</p>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-3">
                    <p className="text-2xl font-bold text-emerald-400">12</p>
                    <p className="text-xs text-slate-400">Badges</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Do */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Your First 7 Phases</h2>
          <p className="mt-3 text-slate-400">A guided journey to activation.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { day: '1', action: 'Claim your SA number & set up your profile' },
            { day: '2', action: 'Complete spiritual & skills assessments' },
            { day: '3', action: 'Get your first AI-powered matches' },
            { day: '4', action: 'Join or create your first mission' },
            { day: '5', action: 'Make your first introduction' },
            { day: '6', action: 'Earn your first GGG rewards' },
            { day: '7', action: 'Unlock the Synchronicity Engine' },
            { day: '∞', action: 'Build, grow, and rise together' },
          ].map((step, i) => (
            <div key={i} className="bg-slate-800/30 border border-white/10 rounded-xl p-4 hover:bg-slate-800/50 transition-colors">
              <div className="w-8 h-8 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center font-bold text-sm mb-3">
                {step.day}
              </div>
              <p className="text-sm text-slate-300">{step.action}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-24 text-center">
        <div className="max-w-3xl mx-auto">
          <Globe className="w-16 h-16 mx-auto mb-6 text-violet-400" />
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Activate?
          </h2>
          <p className="text-lg text-slate-300 mb-8">
            Your mission awaits. Your tribe is gathering. 
            <br />
            The time for conscious collaboration is now.
          </p>
          <Button 
            size="lg" 
            onClick={handleJoin}
            className="h-14 px-10 text-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 rounded-xl shadow-lg shadow-violet-500/25"
          >
            Become a Saint Agent
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="mt-6 text-sm text-slate-400 max-w-xl mx-auto">
            If you're seeking a spiritual romantic connection, you'll discover like-minded matches through our AI-powered system that identifies deeper, more meaningful connections.
          </p>
          <p className="mt-4 text-sm text-slate-500">
            🌀 Where destiny becomes structured, signal becomes system, and synchronicity becomes strategy.
          </p>
        </div>
      </section>

      {/* Dev Toggle */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.href = createPageUrl('CommandDeck')}
          className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 text-xs"
        >
          → Skip to App (Dev)
        </Button>
      </div>
    </div>
  );
}