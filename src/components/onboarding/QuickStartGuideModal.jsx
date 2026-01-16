import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  User, 
  Target, 
  Users, 
  Brain,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Compass,
  Zap,
  Crown
} from 'lucide-react';
import { createPageUrl } from '@/utils';

const STEPS = [
  {
    id: 1,
    title: "Calibrate Your Agent Blueprint",
    subtitle: "Your profile is more than just a bio; it's your archetypal signature.",
    icon: User,
    color: "violet",
    content: [
      {
        title: "Sync Your Cards",
        description: "Input your birth data to integrate your Destiny Card archetype. This helps the system suggest projects and partners aligned with your natural timing."
      },
      {
        title: "Identify Your Pillars",
        description: "Choose 2–3 \"Humanitarian Pillars\" (e.g., Sustainable Tech, Spiritual Education, Clean Water) to define your mission."
      }
    ],
    action: { label: "Edit Profile", url: "Profile" }
  },
  {
    id: 2,
    title: "Initiate Your First Quest",
    subtitle: "We don't just \"post\" here; we execute.",
    icon: Target,
    color: "emerald",
    content: [
      {
        title: "Onboarding Mission",
        description: "Head to the Quest Hub and select the \"Onboarding Mission.\" This mini-quest will walk you through the platform's layout while rewarding you with your first Saint Points—the internal metric for ethical contribution."
      }
    ],
    action: { label: "View Quests", url: "Quests" }
  },
  {
    id: 3,
    title: "Enter the Synergy Engine",
    subtitle: "SaintAgent.World thrives on collaboration.",
    icon: Users,
    color: "blue",
    content: [
      {
        title: "Find Your \"Eddie\"",
        description: "Use the Synergy Search to look for members whose skills complement yours. If you are a Visionary (King of Spades logic), look for a \"Builder\" (Ten of Diamonds logic) to ground your ideas."
      },
      {
        title: "Join a Project",
        description: "Browse active project boards. Each project displays its Ethical Weighting—look for one that matches your humanitarian pillars."
      }
    ],
    action: { label: "Find Collaborators", url: "FindCollaborators" }
  },
  {
    id: 4,
    title: "Master the Logic Framework",
    subtitle: "To move into high-level status, you must learn the \"Agent Logic.\"",
    icon: Brain,
    color: "amber",
    content: [
      {
        title: "Use the Logic Templates",
        description: "When starting a task, use a \"High-Level Synergy\" template. This structures your project with industrial efficiency while maintaining a humanitarian soul."
      },
      {
        title: "Track Your Impact",
        description: "Watch your Impact Dashboard to see how your digital actions translate into real-world energy and project growth."
      }
    ],
    action: { label: "View Projects", url: "Projects" }
  }
];

export default function QuickStartGuideModal({ open, onOpenChange }) {
  const [currentStep, setCurrentStep] = useState(0);
  
  const step = STEPS[currentStep];
  const StepIcon = step.icon;
  
  const colorClasses = {
    violet: "bg-violet-100 text-violet-600 border-violet-200",
    emerald: "bg-emerald-100 text-emerald-600 border-emerald-200",
    blue: "bg-blue-100 text-blue-600 border-blue-200",
    amber: "bg-amber-100 text-amber-600 border-amber-200"
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAction = () => {
    onOpenChange(false);
    window.location.href = createPageUrl(step.action.url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-lg">SaintAgent.World Quick Start</DialogTitle>
              <p className="text-xs text-slate-500">Your 4-Step Guide to Active Agent Status</p>
            </div>
          </div>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 py-3">
          {STEPS.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentStep(idx)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                idx === currentStep 
                  ? 'bg-violet-600 text-white scale-110' 
                  : idx < currentStep 
                    ? 'bg-emerald-100 text-emerald-600' 
                    : 'bg-slate-100 text-slate-400'
              }`}
            >
              {idx < currentStep ? <CheckCircle2 className="w-4 h-4" /> : s.id}
            </button>
          ))}
        </div>

        {/* Step Content */}
        <div className="space-y-4 py-2">
          {/* Step Header */}
          <div className="flex items-start gap-3">
            <div className={`p-3 rounded-xl border ${colorClasses[step.color]}`}>
              <StepIcon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">Step {step.id}: {step.title}</h3>
              <p className="text-sm text-slate-600 mt-1">{step.subtitle}</p>
            </div>
          </div>

          {/* Step Details */}
          <div className="space-y-3 pl-2">
            {step.content.map((item, idx) => (
              <div key={idx} className="flex gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="mt-0.5">
                  <Zap className="w-4 h-4 text-violet-500" />
                </div>
                <div>
                  <h4 className="font-medium text-sm text-slate-800">{item.title}</h4>
                  <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pro Tip (only on last step) */}
          {currentStep === STEPS.length - 1 && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
              <div className="flex items-start gap-2">
                <Crown className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-800 text-sm">Pro Tip</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    Don't just watch the feed. SaintAgent.World is built for the initiators. 
                    The more quests you start, the more the platform's logic adapts to help you expand.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleAction}
              className="gap-1"
            >
              <Compass className="w-4 h-4" />
              {step.action.label}
            </Button>
            
            {currentStep < STEPS.length - 1 ? (
              <Button onClick={handleNext} className="gap-1 bg-violet-600 hover:bg-violet-700">
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button 
                onClick={() => onOpenChange(false)} 
                className="gap-1 bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle2 className="w-4 h-4" />
                Start Journey
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}