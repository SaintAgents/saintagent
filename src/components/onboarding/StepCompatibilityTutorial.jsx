import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, Star, Shield, MessageSquare, TrendingUp, 
  Compass, ChevronRight, ChevronLeft, CheckCircle2,
  Sparkles, Users, Target, Zap
} from "lucide-react";

const tutorialSlides = [
  {
    title: "Understanding Your Compatibility Score",
    icon: Target,
    color: 'violet',
    content: (
      <div className="space-y-4">
        <p className="text-slate-700">
          Your <strong>overall compatibility score</strong> (0-100) combines multiple factors 
          to predict relationship potential.
        </p>
        <div className="bg-violet-50 rounded-xl p-4 border border-violet-100">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium text-violet-900">Sample Match</span>
            <Badge className="bg-violet-600 text-white text-lg px-3">87%</Badge>
          </div>
          <Progress value={87} className="h-3 mb-2" />
          <p className="text-sm text-violet-700">
            Scores above 75% indicate strong potential compatibility
          </p>
        </div>
        <p className="text-sm text-slate-600">
          Higher scores don't guarantee success, but they indicate aligned values, 
          compatible communication styles, and shared life goals.
        </p>
      </div>
    )
  },
  {
    title: "The Five Compatibility Domains",
    icon: Star,
    color: 'amber',
    content: (
      <div className="space-y-3">
        <p className="text-slate-700 mb-4">
          We analyze compatibility across five key domains:
        </p>
        {[
          { name: 'Identity & Values', weight: '30%', icon: Heart, desc: 'Core values, beliefs, life priorities' },
          { name: 'Emotional Style', weight: '25%', icon: Shield, desc: 'Attachment, stress response, emotional depth' },
          { name: 'Communication', weight: '20%', icon: MessageSquare, desc: 'Conflict style, feedback, expression' },
          { name: 'Growth Orientation', weight: '15%', icon: TrendingUp, desc: 'Personal development, learning mindset' },
          { name: 'Lifestyle', weight: '10%', icon: Compass, desc: 'Daily rhythm, work-life balance, location' }
        ].map((domain, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              i === 0 ? 'bg-rose-100' : 
              i === 1 ? 'bg-blue-100' : 
              i === 2 ? 'bg-orange-100' : 
              i === 3 ? 'bg-emerald-100' : 'bg-purple-100'
            }`}>
              <domain.icon className={`w-5 h-5 ${
                i === 0 ? 'text-rose-600' : 
                i === 1 ? 'text-blue-600' : 
                i === 2 ? 'text-orange-600' : 
                i === 3 ? 'text-emerald-600' : 'text-purple-600'
              }`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-900">{domain.name}</span>
                <Badge variant="outline" className="text-xs">{domain.weight}</Badge>
              </div>
              <p className="text-xs text-slate-500">{domain.desc}</p>
            </div>
          </div>
        ))}
      </div>
    )
  },
  {
    title: "Reading Your Match Cards",
    icon: Users,
    color: 'rose',
    content: (
      <div className="space-y-4">
        <p className="text-slate-700">
          Each match card shows key insights at a glance:
        </p>
        <div className="bg-white rounded-xl border-2 border-slate-200 p-4 shadow-sm">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-200 to-pink-200 flex items-center justify-center">
              <span className="text-xl">👤</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Sample Match</span>
                <Badge className="bg-emerald-100 text-emerald-700 text-xs">91% Values</Badge>
              </div>
              <p className="text-sm text-slate-500">3 shared values • Similar conflict style</p>
            </div>
            <Badge className="bg-violet-600 text-white">85%</Badge>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs">Honesty</Badge>
            <Badge variant="secondary" className="text-xs">Growth</Badge>
            <Badge variant="secondary" className="text-xs">Adventure</Badge>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mb-1" />
            <p className="font-medium text-emerald-800">Green badges</p>
            <p className="text-xs text-emerald-600">Strong alignment areas</p>
          </div>
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
            <Sparkles className="w-4 h-4 text-amber-600 mb-1" />
            <p className="font-medium text-amber-800">AI Insights</p>
            <p className="text-xs text-amber-600">Why you might click</p>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Conversation Starters & Prompts",
    icon: MessageSquare,
    color: 'blue',
    content: (
      <div className="space-y-4">
        <p className="text-slate-700">
          We generate personalized conversation starters based on your shared interests and compatibility:
        </p>
        <div className="space-y-2">
          {[
            "You both value growth and adventure - ask about their most transformative travel experience",
            "Your communication styles complement each other - share how you prefer to handle disagreements",
            "You share spiritual interests - discuss your meditation or mindfulness practices"
          ].map((starter, i) => (
            <div key={i} className="p-3 rounded-lg bg-blue-50 border border-blue-100 flex items-start gap-2">
              <Zap className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <p className="text-sm text-blue-800">{starter}</p>
            </div>
          ))}
        </div>
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
          <p className="text-sm text-slate-600">
            <strong>Pro tip:</strong> Ask open-ended questions about shared values 
            rather than surface-level topics. This reveals compatibility faster.
          </p>
        </div>
      </div>
    )
  },
  {
    title: "You're Ready to Find Your Match!",
    icon: Sparkles,
    color: 'emerald',
    content: (
      <div className="space-y-4 text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Tutorial Complete!</h3>
        <p className="text-slate-600">
          You now understand how our compatibility system works. 
          Here's what to remember:
        </p>
        <div className="grid gap-2 text-left">
          {[
            "Focus on 75%+ matches for highest potential",
            "Pay attention to shared values (30% of score)",
            "Read AI insights for unique connection points",
            "Use conversation starters to break the ice",
            "Trust your intuition alongside the numbers"
          ].map((tip, i) => (
            <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-sm text-emerald-800">{tip}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
];

export default function StepCompatibilityTutorial({ data = {}, onChange, onComplete }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const setData = onChange || (() => {});

  const slide = tutorialSlides[currentSlide];
  const Icon = slide.icon;
  const colorClasses = {
    violet: 'from-violet-100 to-purple-100 text-violet-600',
    amber: 'from-amber-100 to-orange-100 text-amber-600',
    rose: 'from-rose-100 to-pink-100 text-rose-600',
    blue: 'from-blue-100 to-cyan-100 text-blue-600',
    emerald: 'from-emerald-100 to-teal-100 text-emerald-600'
  };

  const handleNext = () => {
    if (currentSlide < tutorialSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete && onComplete({ ...data, tutorial_completed: true });
    }
  };

  const handleBack = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2">
        {tutorialSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              i === currentSlide 
                ? 'bg-violet-600 w-6' 
                : i < currentSlide 
                  ? 'bg-violet-300' 
                  : 'bg-slate-200'
            }`}
          />
        ))}
      </div>

      {/* Slide header */}
      <div className="text-center">
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colorClasses[slide.color]} flex items-center justify-center mx-auto mb-3`}>
          <Icon className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">{slide.title}</h2>
        <p className="text-sm text-slate-500 mt-1">
          Step {currentSlide + 1} of {tutorialSlides.length}
        </p>
      </div>

      {/* Slide content */}
      <div className="min-h-[320px]">
        {slide.content}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={currentSlide === 0}
          className="gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
        
        <Button
          onClick={handleNext}
          className="gap-1 bg-violet-600 hover:bg-violet-700"
        >
          {currentSlide === tutorialSlides.length - 1 ? 'Finish Tutorial' : 'Next'}
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}