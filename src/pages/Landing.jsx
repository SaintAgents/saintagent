import React from 'react';
import { Button } from "@/components/ui/button";
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { 
  Sparkles, 
  Users, 
  Target, 
  ShoppingBag, 
  Zap,
  ArrowRight,
  Shield,
  Globe,
  Heart
} from "lucide-react";

export default function Landing() {
  const handleSignIn = () => {
    base44.auth.redirectToLogin(createPageUrl('Onboarding'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-72 h-72 bg-violet-500 rounded-full blur-[120px]" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-amber-500 rounded-full blur-[150px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500 rounded-full blur-[200px] opacity-20" />
        </div>

        {/* Navigation */}
        <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">SaintAgent</span>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              className="text-white/80 hover:text-white hover:bg-white/10"
              onClick={handleSignIn}
            >
              Sign In
            </Button>
            <Button 
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl"
              onClick={handleSignIn}
            >
              Get Started
            </Button>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 px-6 pt-20 pb-32 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-amber-300 text-sm mb-8">
            <Sparkles className="w-4 h-4" />
            <span>The Future of Conscious Collaboration</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Connect. Collaborate.
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400 bg-clip-text text-transparent">
              Create Impact.
            </span>
          </h1>
          
          <p className="text-xl text-white/70 max-w-2xl mx-auto mb-10">
            Join a community of conscious creators, healers, and change-makers. 
            Find your tribe, share your gifts, and build a regenerative future together.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl px-8 h-14 text-lg gap-2"
              onClick={handleSignIn}
            >
              Join the Movement
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 rounded-xl px-8 h-14 text-lg"
              onClick={() => window.location.href = createPageUrl('FAQ')}
            >
              Learn More
            </Button>
          </div>

          {/* Demo Account Info */}
          <div className="mt-8 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-amber-500/30 max-w-md mx-auto">
            <p className="text-amber-300 text-sm font-semibold mb-2">🎮 Try a Demo Account</p>
            <div className="text-white/90 text-sm space-y-1">
              <p><span className="text-white/60">USERID:</span> <code className="bg-white/20 px-2 py-0.5 rounded">DemoUser000</code></p>
              <p><span className="text-white/60">Email:</span> <code className="bg-white/20 px-2 py-0.5 rounded">StGermainTrust@gmail.com</code></p>
              <p><span className="text-white/60">Password:</span> <code className="bg-white/20 px-2 py-0.5 rounded">GaiaLove</code></p>
            </div>
            <p className="text-white/50 text-xs mt-2">Experience the platform before creating your own account</p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 px-6 py-24 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            Everything You Need to Thrive
          </h2>
          <p className="text-white/60 text-center mb-16 max-w-2xl mx-auto">
            Powerful tools designed for meaningful connections and real-world impact
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Users, title: "AI Matchmaking", desc: "Find your perfect collaborators with intelligent matching", color: "from-violet-500 to-purple-600" },
              { icon: Target, title: "Missions & Quests", desc: "Join collaborative missions and earn rewards", color: "from-amber-500 to-orange-600" },
              { icon: ShoppingBag, title: "Marketplace", desc: "Offer your skills and find mentors", color: "from-emerald-500 to-teal-600" },
              { icon: Zap, title: "GGG Economy", desc: "Earn tokens for contributions", color: "from-blue-500 to-cyan-600" },
            ].map((feature, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/60 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="relative z-10 px-6 py-24">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-16">
            Built on Trust & Transparency
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "Verified Community", desc: "Every member is verified for a safe, authentic experience" },
              { icon: Globe, title: "Global Network", desc: "Connect with conscious creators worldwide" },
              { icon: Heart, title: "Purpose-Driven", desc: "Focused on regenerative impact and collective growth" },
            ].map((value, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-amber-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{value.title}</h3>
                <p className="text-white/60">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 px-6 py-24">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-violet-600/20 to-amber-600/20 backdrop-blur-sm border border-white/10 rounded-3xl p-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            Join thousands of conscious creators building a better world together.
          </p>
          <Button 
            size="lg"
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl px-10 h-14 text-lg gap-2"
            onClick={handleSignIn}
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-white/60">© 2026 SaintAgent</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-white/60">
            <a href={createPageUrl('Terms')} className="hover:text-white transition-colors">Terms</a>
            <a href={createPageUrl('FAQ')} className="hover:text-white transition-colors">FAQ</a>
          </div>
        </div>
      </footer>
    </div>
  );
}