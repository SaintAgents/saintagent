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
  Crown,
  Lightbulb,
  MessageSquare,
  Calendar,
  Gift,
  Shield,
  Star,
  TrendingUp,
  BookOpen
} from 'lucide-react';
import { createPageUrl } from '@/utils';

const STEPS = [
  {
    id: 1,
    title: "Set Up Your Agent Blueprint",
    subtitle: "Your profile is your reputation. Make it count from Day 1.",
    icon: User,
    color: "violet",
    content: [
      {
        title: "Complete Your Profile",
        description: "Go to your Profile page. Add a professional photo, write a short bio, and set your region/timezone. This is what others see when deciding to collaborate with you."
      },
      {
        title: "Set Your Intentions",
        description: "Under your profile's 'Basic Info' tab, scroll to 'Intentions' and click Edit. Add 2–3 keywords like 'service', 'building', 'healing' — these help the matching engine connect you with aligned members."
      },
      {
        title: "Add Your Skills",
        description: "Click 'Add Skills' on your profile. Tag what you offer (e.g., Web Dev, Strategy, Writing) and what you seek. This powers the collaboration engine."
      }
    ],
    proTip: "A complete profile earns more trust and gets 3x more collaboration requests. Don't skip the spiritual profile tab either — many members match on shared practices.",
    action: { label: "Go to Profile", url: "Profile" }
  },
  {
    id: 2,
    title: "Complete Your First Actions",
    subtitle: "The platform rewards action. Here's your starter checklist.",
    icon: Target,
    color: "emerald",
    content: [
      {
        title: "Follow 5 Leaders",
        description: "Head to 'Find Collaborators' and follow members whose work inspires you. This populates your activity feed and signals your interests to the community."
      },
      {
        title: "Send Your First Message",
        description: "Go to Messages and reach out to someone. Introduce yourself — a simple 'Hi, I'm interested in your project' goes a long way."
      },
      {
        title: "Book a Meeting",
        description: "Schedule a 1-on-1 meeting through the Meetings page. Real-time connection accelerates trust faster than any text exchange."
      },
      {
        title: "Join a Mission",
        description: "Browse active Missions and join one that aligns with your skills. Missions are team-based objectives with milestones and GGG rewards."
      }
    ],
    proTip: "Each of these actions earns you GGG tokens. Check the Quick Start checklist on your Command Deck — it tracks your progress and awards bonus tokens when you hit milestones.",
    action: { label: "Find Collaborators", url: "FindCollaborators" }
  },
  {
    id: 3,
    title: "Connect & Collaborate",
    subtitle: "SaintAgent.World is built for collaboration, not consumption.",
    icon: Users,
    color: "blue",
    content: [
      {
        title: "Find Your Complement",
        description: "Use 'Find Collaborators' to search by skill. If you're a strategist, look for builders. If you're a healer, look for organizers. Diverse teams build the strongest projects."
      },
      {
        title: "Join or Create a Circle",
        description: "Circles are topic-based groups. Find one that matches your interest (e.g., 'Clean Tech', 'Digital Rights') or create your own to attract like-minded agents."
      },
      {
        title: "Create a Marketplace Offer",
        description: "Go to the Marketplace and create your first listing. Offer a skill, consultation, or service. This is how you build reputation and earn GGG."
      }
    ],
    proTip: "The strongest members don't just participate — they initiate. Creating a mission or listing signals leadership and attracts top collaborators to you.",
    action: { label: "Browse Marketplace", url: "Marketplace" }
  },
  {
    id: 4,
    title: "Level Up Your Impact",
    subtitle: "Go from participant to leader. Here's the advanced playbook.",
    icon: Brain,
    color: "amber",
    content: [
      {
        title: "Create Your First Mission",
        description: "Once you've joined a few missions, create your own. Go to Missions → Create. Define clear milestones, set rewards, and recruit your team. The AI assistant can help you structure it."
      },
      {
        title: "Submit a Project for Review",
        description: "Have a bigger initiative? Go to Projects → Add Project. Projects go through an evaluation pipeline and can receive funding and team support."
      },
      {
        title: "Track Your Reputation",
        description: "Check your Stats tab on your Profile. Your trust score, influence score, and rank all grow as you contribute. Higher ranks unlock more platform capabilities."
      },
      {
        title: "Refer Others & Earn",
        description: "Go to the Affiliate Center to get your referral link. Every activated referral earns you ongoing GGG commissions — this is a sustainable income stream."
      }
    ],
    proTip: "The GGG economy rewards consistent contribution, not one-time activity. Daily check-ins, completing mission tasks, and peer reviews all compound your earnings over time. Think long-term.",
    action: { label: "View Missions", url: "Missions" }
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
              <BookOpen className="w-5 h-5 text-white" />
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
                <div className="mt-0.5 shrink-0">
                  <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-600">
                    {idx + 1}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-slate-800">{item.title}</h4>
                  <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pro Tip - on EVERY step */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-semibold text-amber-800 text-sm">Pro Tip</h4>
                <p className="text-sm text-amber-700 mt-1">{step.proTip}</p>
              </div>
            </div>
          </div>
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