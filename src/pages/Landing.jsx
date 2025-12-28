import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Users, Target, Crown, ArrowRight } from "lucide-react";
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

export default function Landing() {
  const handleSignIn = () => {
    base44.auth.redirectToLogin(createPageUrl('CommandDeck'));
  };

  const handleSignUp = () => {
    base44.auth.redirectToLogin(createPageUrl('CommandDeck'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 flex items-center justify-center p-6">
      <div className="max-w-5xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Welcome to SaintAgent</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Connect. Collaborate. Ascend.
          </h1>
          <p className="text-xl text-violet-100 max-w-2xl mx-auto">
            The sacred network for conscious leaders, builders, and seekers on the path of service.
          </p>
        </div>

        {/* Auth Card */}
        <Card className="max-w-md mx-auto shadow-2xl">
          <CardContent className="p-8">
            <div className="space-y-4">
              <Button 
                onClick={handleSignIn}
                className="w-full h-12 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold"
              >
                Enter
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button 
                onClick={handleSignUp}
                variant="outline"
                className="w-full h-12 border-2 border-violet-600 text-violet-600 hover:bg-violet-50 font-semibold"
              >
                Explore App
              </Button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">Features</span>
              </div>
            </div>

            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                  <Users className="w-4 h-4 text-violet-600" />
                </div>
                <span>AI-powered synchronicity matching</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Target className="w-4 h-4 text-purple-600" />
                </div>
                <span>Collaborative missions & marketplace</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Crown className="w-4 h-4 text-amber-600" />
                </div>
                <span>Leadership pathways & recognition</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-violet-100 text-sm mt-8">
          Join the 144,000 conscious leaders building the new earth
        </p>
      </div>
    </div>
  );
}