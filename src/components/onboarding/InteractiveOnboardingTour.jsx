import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { createPageUrl } from '@/utils';
import {
  Rocket,
  Users,
  Target,
  ShoppingBag,
  MessageCircle,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Star,
  Zap,
  Heart,
  BookOpen,
  Compass,
  DollarSign,
  GraduationCap,
  Shield,
  Play,
  Trophy,
  ArrowRight
} from "lucide-react";

const TOUR_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Saint Agents! 🌟',
    description: 'Your journey as a conscious creator begins here. Let us show you around the platform and help you get started.',
    icon: Rocket,
    color: 'violet',
    image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/ccd2173e5_universal_upscale_0_cd3894c1-6a97-4a04-8d63-916963fb681c_0.jpg',
    tips: [
      'Complete your profile to unlock powerful AI matching',
      'Earn GGG tokens for every meaningful action',
      'Build your reputation through collaboration'
    ]
  },
  {
    id: 'command_deck',
    title: 'Your Command Deck',
    description: 'This is your personal mission control center. View your stats, matches, upcoming meetings, and track your progress all in one place.',
    icon: Shield,
    color: 'emerald',
    page: 'CommandDeck',
    features: [
      { icon: Star, label: 'GGG Balance & Earnings' },
      { icon: Users, label: 'Match Suggestions' },
      { icon: Target, label: 'Active Missions' },
      { icon: Trophy, label: 'Rank & Achievements' }
    ]
  },
  {
    id: 'synchronicity',
    title: 'Synchronicity Engine',
    description: 'Our AI-powered matching system analyzes your profile, skills, and intentions to connect you with the perfect collaborators, mentors, and opportunities.',
    icon: Sparkles,
    color: 'purple',
    page: 'Matches',
    features: [
      { icon: Heart, label: 'Personality Compatibility' },
      { icon: Zap, label: 'Skill Alignment' },
      { icon: Compass, label: 'Goal Synergy' },
      { icon: Star, label: 'Spiritual Resonance' }
    ]
  },
  {
    id: 'missions',
    title: 'Missions & Quests',
    description: 'Join collaborative missions with other agents, complete quests to earn rewards, and make real-world impact together.',
    icon: Target,
    color: 'amber',
    page: 'Missions',
    features: [
      { icon: Users, label: 'Team Collaboration' },
      { icon: DollarSign, label: 'GGG Rewards' },
      { icon: Trophy, label: 'Achievement Badges' },
      { icon: Zap, label: 'Rank Points' }
    ]
  },
  {
    id: 'marketplace',
    title: 'Marketplace',
    description: 'Offer your services, find mentors, book sessions, and exchange value with other conscious creators in our trusted marketplace.',
    icon: ShoppingBag,
    color: 'teal',
    page: 'Marketplace',
    features: [
      { icon: GraduationCap, label: 'Mentorship Sessions' },
      { icon: BookOpen, label: 'Courses & Learning' },
      { icon: Heart, label: 'Healing Services' },
      { icon: Users, label: 'Consulting' }
    ]
  },
  {
    id: 'community',
    title: 'Community & Circles',
    description: 'Join circles based on your interests, connect with like-minded agents, and participate in group discussions and events.',
    icon: Users,
    color: 'blue',
    page: 'Circles',
    features: [
      { icon: MessageCircle, label: 'Group Chats' },
      { icon: Star, label: 'Shared Missions' },
      { icon: Heart, label: 'Events & Meetups' },
      { icon: Compass, label: 'Regional Hubs' }
    ]
  },
  {
    id: 'profile',
    title: 'Your Profile',
    description: 'Your profile is your digital identity. The more complete it is, the better matches and opportunities you\'ll receive.',
    icon: Star,
    color: 'rose',
    page: 'Profile',
    tips: [
      'Add a clear photo to build trust',
      'List your skills and what you offer',
      'Share your intentions and goals',
      'Complete mystical profile for deeper matches'
    ]
  },
  {
    id: 'complete',
    title: "You're Ready! 🎉",
    description: 'You now know the essentials. Start by completing your profile, then explore matches and join your first mission!',
    icon: CheckCircle2,
    color: 'green',
    actions: [
      { label: 'Complete Profile', page: 'Profile', primary: true },
      { label: 'View Matches', page: 'Matches' },
      { label: 'Explore Missions', page: 'Missions' }
    ]
  }
];

const colorMap = {
  violet: { bg: 'bg-violet-100', text: 'text-violet-600', border: 'border-violet-200', gradient: 'from-violet-500 to-purple-600' },
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-200', gradient: 'from-emerald-500 to-teal-600' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200', gradient: 'from-purple-500 to-violet-600' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-200', gradient: 'from-amber-500 to-orange-600' },
  teal: { bg: 'bg-teal-100', text: 'text-teal-600', border: 'border-teal-200', gradient: 'from-teal-500 to-emerald-600' },
  blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200', gradient: 'from-blue-500 to-indigo-600' },
  rose: { bg: 'bg-rose-100', text: 'text-rose-600', border: 'border-rose-200', gradient: 'from-rose-500 to-pink-600' },
  green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200', gradient: 'from-green-500 to-emerald-600' }
};

export default function InteractiveOnboardingTour({ open, onClose, userTrack }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);

  const step = TOUR_STEPS[currentStep];
  const colors = colorMap[step.color];
  const Icon = step.icon;
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;

  const handleNext = () => {
    setCompletedSteps(prev => [...new Set([...prev, currentStep])]);
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkipToEnd = () => {
    setCurrentStep(TOUR_STEPS.length - 1);
  };

  const handleNavigate = (page) => {
    onClose();
    window.location.href = createPageUrl(page);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">
              Step {currentStep + 1} of {TOUR_STEPS.length}
            </span>
            <Button variant="ghost" size="sm" onClick={handleSkipToEnd} className="text-xs text-slate-400 h-6">
              Skip Tour
            </Button>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="p-6"
          >
            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg",
                `bg-gradient-to-br ${colors.gradient}`
              )}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900 mb-1">{step.title}</h2>
                <p className="text-slate-600">{step.description}</p>
              </div>
            </div>

            {/* Image */}
            {step.image && (
              <div className="mb-6 rounded-xl overflow-hidden">
                <img src={step.image} alt={step.title} className="w-full h-40 object-cover" />
              </div>
            )}

            {/* Features Grid */}
            {step.features && (
              <div className="grid grid-cols-2 gap-3 mb-6">
                {step.features.map((feature, idx) => (
                  <div 
                    key={idx}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border",
                      colors.bg, colors.border
                    )}
                  >
                    <feature.icon className={cn("w-5 h-5", colors.text)} />
                    <span className="text-sm font-medium text-slate-700">{feature.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Tips */}
            {step.tips && (
              <div className={cn("p-4 rounded-xl border mb-6", colors.bg, colors.border)}>
                <h4 className={cn("font-semibold mb-2 flex items-center gap-2", colors.text)}>
                  <Zap className="w-4 h-4" />
                  Pro Tips
                </h4>
                <ul className="space-y-2">
                  {step.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle2 className={cn("w-4 h-4 mt-0.5 flex-shrink-0", colors.text)} />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions (final step) */}
            {step.actions && (
              <div className="space-y-3 mb-6">
                <h4 className="font-semibold text-slate-700 mb-3">Get Started:</h4>
                {step.actions.map((action, idx) => (
                  <Button
                    key={idx}
                    onClick={() => handleNavigate(action.page)}
                    variant={action.primary ? "default" : "outline"}
                    className={cn(
                      "w-full justify-between",
                      action.primary && "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                    )}
                  >
                    {action.label}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ))}
              </div>
            )}

            {/* Page Link */}
            {step.page && currentStep < TOUR_STEPS.length - 1 && (
              <Button
                variant="ghost"
                onClick={() => handleNavigate(step.page)}
                className={cn("w-full mb-4", colors.text)}
              >
                <Play className="w-4 h-4 mr-2" />
                Try it now: Go to {step.title.replace(/Your\s*/i, '')}
              </Button>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="px-6 pb-6 flex items-center justify-between border-t pt-4">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          {/* Step Dots */}
          <div className="flex items-center gap-1.5">
            {TOUR_STEPS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  idx === currentStep 
                    ? "w-6 bg-violet-600" 
                    : completedSteps.includes(idx) 
                      ? "bg-violet-300" 
                      : "bg-slate-200"
                )}
              />
            ))}
          </div>

          {currentStep < TOUR_STEPS.length - 1 ? (
            <Button onClick={handleNext} className="gap-2 bg-violet-600 hover:bg-violet-700">
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={onClose} className="gap-2 bg-green-600 hover:bg-green-700">
              <CheckCircle2 className="w-4 h-4" />
              Finish Tour
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}