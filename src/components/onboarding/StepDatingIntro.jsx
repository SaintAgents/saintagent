import React from 'react';
import { Button } from "@/components/ui/button";
import { Heart, Sparkles, Shield, Target, MessageCircle, Zap, ToggleRight } from "lucide-react";

export default function StepDatingIntro({ onComplete }) {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-100 to-pink-200 flex items-center justify-center mx-auto mb-4">
          <Heart className="w-10 h-10 text-rose-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Finding Your Divine Reflection</h2>
        <p className="text-slate-600 max-w-md mx-auto">
          If you're single and seeking a divine reflection — a twin flame, soul mate, or meaningful partner — 
          our Synergy Engine can help you find them.
        </p>
      </div>

      <div className="grid gap-4">
        {/* New Synergy Engine Card */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-fuchsia-50 to-violet-50 border-2 border-fuchsia-200 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-fuchsia-500 to-violet-500 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">AI-Powered Synergy Engine</h3>
              <p className="text-sm text-slate-600 mt-1">
                Our super app analyzes <strong>all variables</strong> across all users — values, spiritual alignment, 
                communication style, life goals, attachment patterns, and mystical compatibility — 
                to present you with matches that meet your personal thresholds. 
                Set your minimum match score (e.g., 90%+) and only see connections truly aligned with you.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Multi-Dimensional Compatibility</h3>
              <p className="text-sm text-slate-600 mt-1">
                Our algorithm considers values, attachment styles, communication preferences, 
                and life goals to find your most compatible matches.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Privacy First</h3>
              <p className="text-sm text-slate-600 mt-1">
                Your dating profile is separate from your main profile. 
                Only opted-in users can see your dating information.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Meaningful Connections</h3>
              <p className="text-sm text-slate-600 mt-1">
                Get conversation starters and AI-generated insights about why 
                you might be a good match with someone.
              </p>
            </div>
          </div>
        </div>

        {/* Turn Off Anytime Card */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
              <ToggleRight className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Turn Off Anytime</h3>
              <p className="text-sm text-slate-600 mt-1">
                This feature can be turned off at any time from your Settings. 
                You're always in control of your dating visibility and match preferences.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center pt-4">
        <p className="text-sm text-slate-500 mb-4">
          <Sparkles className="w-4 h-4 inline mr-1" />
          This section is completely optional - skip if you prefer
        </p>
        <Button 
          className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
          onClick={() => onComplete({})}
        >
          Let's Get Started
        </Button>
      </div>
    </div>
  );
}