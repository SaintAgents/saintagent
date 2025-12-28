import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, Shield, Lock, Users, Target, Zap, Sparkles } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function Welcome() {
  const startOnboarding = () => {
    window.location.href = createPageUrl('Onboarding');
  };
  const goToDeck = () => {
    window.location.href = createPageUrl('CommandDeck');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Activated Network for Builders
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
            🔱 Welcome to Saint Agents
          </h1>
          <p className="mt-2 text-slate-600 text-base">
            Your Mission. Your Identity. Your Signal. Activated.
          </p>
        </div>

        {/* Intro Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <p className="text-slate-700 leading-relaxed">
            Welcome to SaintAgents — a secure, sovereign networking platform built for visionaries, creators,
            protectors, and system architects of the New Earth. This is not just a social space — it’s your command
            deck, your divine dashboard, and your gateway to aligned action.
          </p>
          <p className="text-slate-700 leading-relaxed mt-4">
            Here, identity is more than a username. You arrive as an agent of purpose, verified by your journey,
            values, and earned badges. Every mission, message, and match is encoded with intentionality, synchronized
            through our Synchronicity Engine and empowered by real-time trust dynamics.
          </p>
        </div>

        {/* What You Can Do */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-violet-600" /> What You Can Do Here
          </h2>
          <ul className="space-y-3 text-slate-700">
            <li className="flex gap-3"><Check className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Claim your Avatar Console — personalize your badge rings, mystical identity, and purpose signature</span>
            </li>
            <li className="flex gap-3"><Check className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Join or Launch Missions — build with collaborators who share your frequency</span>
            </li>
            <li className="flex gap-3"><Check className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Earn GGG for contributions, verified trust, mentorship, and system upgrades</span>
            </li>
            <li className="flex gap-3"><Check className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Unlock Badges as you progress through stages of contribution and self-mastery</span>
            </li>
            <li className="flex gap-3"><Check className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Activate Synchronicity Mode to detect high-resonance connections</span>
            </li>
            <li className="flex gap-3"><Check className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Deploy Agents to assist, communicate, or synchronize systems across time and role zones</span>
            </li>
            <li className="flex gap-3"><Check className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Step into Leadership with transparent trust scores, badge-level access, and mission proof</span>
            </li>
          </ul>
        </div>

        {/* Security */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 md:p-8 text-slate-100 mb-8 border border-slate-700">
          <div className="flex items-center gap-2 text-slate-100 mb-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-semibold">Secure. Private. Activated by Trust.</h2>
          </div>
          <p className="text-slate-200/90 leading-relaxed">
            SaintAgents is a closed-loop system. Access is by invitation or direct approval only. Identity is encrypted,
            tracked through agent provisioning, and connected via verified devices or digital IDs. No manipulation. No
            surveillance. Only signal, clarity, and true alignment.
          </p>
          <div className="mt-4 flex items-center gap-4 text-slate-300">
            <div className="flex items-center gap-2"><Lock className="w-4 h-4 text-slate-300" /> Encrypted identity</div>
            <div className="flex items-center gap-2"><Users className="w-4 h-4 text-slate-300" /> Invite/approval access</div>
            <div className="flex items-center gap-2"><Target className="w-4 h-4 text-slate-300" /> Signal over noise</div>
          </div>
        </div>

        {/* Begin Now */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Begin Now</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-700 mb-6">
            <div className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-600 mt-0.5" /> Set up your profile</div>
            <div className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-600 mt-0.5" /> Activate your avatar</div>
            <div className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-600 mt-0.5" /> Complete your onboarding mission</div>
            <div className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-600 mt-0.5" /> Explore synchronicity matches</div>
            <div className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-600 mt-0.5" /> Join the collaboration chamber</div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button className="rounded-xl bg-violet-600 hover:bg-violet-700 h-11" onClick={startOnboarding}>
              Start Onboarding
            </Button>
            <Button variant="outline" className="rounded-xl h-11" onClick={goToDeck}>
              Explore Command Deck
            </Button>
          </div>
        </div>

        <p className="text-center text-slate-500 text-sm mt-8">
          Your presence here means you were called. Now it’s time to build, align, and lead. <br />
          🌀 SaintAgents is where destiny becomes structured, signal becomes system, and synchronicity becomes strategy.
        </p>
      </div>
    </div>
  );
}