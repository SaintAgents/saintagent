import React from 'react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { CheckCircle2, Shield, Lock } from 'lucide-react';

export default function InviteLanding() {
  const bullets = [
    'Claim your Avatar Console — personalize your badge rings, mystical identity, and purpose signature',
    'Join or Launch Missions — build with collaborators who share your frequency',
    'Earn GGG — for contributions, verified trust, mentorship, and system upgrades',
    'Unlock Badges — as you progress through stages of contribution and self-mastery',
    'Activate Synchronicity Mode — detect high-resonance connections and aligned opportunities',
    'Deploy Agents — assist, communicate, and synchronize systems across time and role zones',
    'Step into Leadership — with transparent trust scores, badge-level access, and mission proof',
  ];

  const checklist = [
    'Set up your profile',
    'Activate your avatar',
    'Complete your onboarding mission',
    'Explore synchronicity matches',
    'Join the collaboration chamber',
  ];

  const handlePrimary = () => {
    base44.auth.redirectToLogin(createPageUrl('CommandDeck'));
  };

  const handleInvite = () => {
    base44.auth.redirectToLogin(createPageUrl('CommandDeck'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Hero */}
      <section className="px-6 pt-16 pb-10 max-w-5xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            <span className="mr-2">🔱</span> Welcome to SaintAgents
          </h1>
          <p className="mt-3 text-lg text-slate-600">Your Mission. Your Identity. Your Signal. Activated.</p>
        </div>

        <div className="mt-8 mx-auto max-w-3xl text-slate-700 space-y-4 text-base leading-relaxed">
          <p>
            SaintAgents is a secure, sovereign networking platform built for visionaries, creators, protectors, and system
            architects of the New Earth. This is not just a social space — it’s your command deck, your divine dashboard,
            and your gateway to aligned action.
          </p>
          <p>
            Here, identity is more than a username. You arrive as an agent of purpose — verified by your journey, your values,
            and your earned badges. Every mission, message, and match is encoded with intentionality, synchronized through our
            Synchronicity Engine, and empowered by real-time trust dynamics.
          </p>
        </div>

        <div className="mt-10 flex items-center justify-center gap-3">
          <Button className="h-11 px-5 rounded-xl" onClick={handlePrimary}>Create My Agent Profile</Button>
          <Button variant="outline" className="h-11 px-5 rounded-xl" onClick={handleInvite}>Enter Invite Code</Button>
        </div>
      </section>

      {/* What You Can Do Here */}
      <section className="px-6 py-8 max-w-5xl mx-auto">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">🧬 What You Can Do Here</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {bullets.map((b, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200">
              <CheckCircle2 className="h-5 w-5 text-violet-600 mt-0.5" />
              <p className="text-sm text-slate-700">{b}</p>
            </div>
          ))}
        </div>

        <p className="mt-6 text-slate-700 max-w-3xl">
          This is a living network of divine builders — here to synchronize, activate, and safeguard the new systems of reality.
          Whether you are a mentor, builder, guardian, or messenger, your path is honored, your mission is real, and your access is earned.
        </p>
      </section>

      {/* Security */}
      <section className="px-6 py-8 max-w-5xl mx-auto">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">🔐 Secure. Private. Activated by Trust.</h2>
        <div className="rounded-2xl border bg-white p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-slate-800 font-medium">
            <Shield className="h-4 w-4 text-slate-600" /> Closed-loop access • <Lock className="h-4 w-4 text-slate-600" /> Encrypted identity
          </div>
          <p className="text-slate-700 text-sm leading-relaxed">
            SaintAgents is a closed-loop system. Access is by invitation or direct approval only. Identity is encrypted, tracked through
            agent provisioning, and connected via verified devices or digital IDs.
          </p>
          <p className="text-slate-700 text-sm leading-relaxed">No manipulation. No surveillance. Only signal, clarity, and true alignment.</p>
        </div>
      </section>

      {/* Begin Now */}
      <section className="px-6 py-10 max-w-5xl mx-auto">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">🌐 Begin Now</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {checklist.map((c, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
              <p className="text-sm text-slate-700">{c}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center gap-3">
          <Button className="h-11 px-5 rounded-xl" onClick={handlePrimary}>Create My Agent Profile</Button>
          <Button variant="outline" className="h-11 px-5 rounded-xl" onClick={handleInvite}>Enter Invite Code</Button>
        </div>

        <p className="mt-10 text-slate-600 text-sm">
          🌀 SaintAgents is where destiny becomes structured, signal becomes system, and synchronicity becomes strategy.
        </p>
      </section>
    </div>
  );
}