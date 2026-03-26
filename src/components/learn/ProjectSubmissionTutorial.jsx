import React, { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ClipboardList, Sparkles, ChevronRight, ChevronLeft, X, CheckCircle2,
  FileText, Upload, Users, Globe, DollarSign, Target, Shield, Rocket,
  ArrowRight, Lightbulb, BarChart3, Heart, Scale
} from 'lucide-react';
import { createPageUrl } from '@/utils';

const TUTORIAL_STEPS = [
  {
    id: 'intro',
    title: 'Welcome to Project Submissions',
    icon: ClipboardList,
    color: 'violet',
    content: `The **Project Submission & Funding Intake** system lets you bring your idea to the SaintAgent community for review, collaboration, and potential funding. The process is **8 simple steps** that guide you through everything reviewers need to evaluate your project.`,
    highlights: [
      'Submit any project — from early ideas to scaling operations',
      'Get matched with collaborators, mentors, and funding partners',
      'AI-powered evaluation scores your alignment and readiness',
      'Track your project through the full review pipeline',
      'Earn GGG tokens and rank points for completed projects'
    ],
    image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/515fe6112_universal_upscale_0_da059915-7033-49cb-acf1-69b2a9df195b_0.jpg'
  },
  {
    id: 'step1',
    title: 'Step 1: Basic Information',
    icon: FileText,
    color: 'blue',
    content: `Start with the essentials — **who you are** and **what to call your project**. This is the foundation everything else builds on.`,
    highlights: [
      '**Project Name** — A clear, descriptive title (required)',
      '**Contact Name** — Your full name as primary contact (required)',
      '**Organization** — Your company or group name (optional)',
      '**Email** — How reviewers can reach you (required)',
      '**Phone** — Secondary contact method (optional)',
      '**Website** — Link to your existing presence (optional)'
    ],
    tip: 'Use a project name that clearly describes what it does. "Clean Water Initiative for Rural Kenya" is better than "Water Project".'
  },
  {
    id: 'step2',
    title: 'Step 2: Project Overview',
    icon: Lightbulb,
    color: 'amber',
    content: `This is where you paint the picture. **What does your project do?** and **What problem does it solve?** are the two most important questions reviewers look at.`,
    highlights: [
      '**Description** — What your project does, its goals, and key deliverables (required)',
      '**Problem Statement** — The core need or challenge your project addresses (required)',
      '**Current Stage** — Where you are right now: Idea → Early Stage → Active → Scaling → Mature'
    ],
    tip: 'Be specific about the problem. "Food insecurity" is vague. "400 families in X district lack access to fresh produce within 10 miles" is compelling.'
  },
  {
    id: 'step3',
    title: 'Step 3: Funding Details',
    icon: DollarSign,
    color: 'emerald',
    content: `Tell us **what kind of funding** you're looking for and **how much you need**. Be transparent — it builds trust with reviewers.`,
    highlights: [
      '**Funding Type** — Grant, Investment, or Bridge Funding (required)',
      '**Amount Requested** — How much you need in USD (required)',
      '**Use of Funds** — Breakdown of how the money will be spent (required)',
      '**Funding Timeline** — When you need it and how long it lasts',
      '**Other Sources** — Any other funding you have or are pursuing'
    ],
    tip: 'Projects with clear, detailed fund allocation tend to score higher. Break it down: "40% engineering, 30% operations, 20% marketing, 10% reserves".'
  },
  {
    id: 'step4',
    title: 'Step 4: Financial Structure',
    icon: BarChart3,
    color: 'blue',
    content: `Share your **revenue model** and **financial projections**. This step is optional for early-stage ideas but critical for scaling projects.`,
    highlights: [
      '**Revenue Model** — How does your project make money?',
      '**Current Revenue** — What are you earning now (if anything)?',
      '**Projected Revenue** — Where do you expect to be in 12-24 months?',
      '**Exit / Repayment Plan** — How will funders see returns?',
      '**Structures You\'re Open To** — Equity, revenue share, structured return, success fee'
    ],
    tip: 'If you\'re pre-revenue, that\'s okay — just be honest about it. Show your path to sustainability.'
  },
  {
    id: 'step5',
    title: 'Step 5: Impact & Reach',
    icon: Heart,
    color: 'rose',
    content: `This is where your project's **soul** shines. Who does this help? How big is the impact? SaintAgent prioritizes projects that create real positive change.`,
    highlights: [
      '**Beneficiaries** — Who specifically benefits from this project? (required)',
      '**Scale of Impact** — How many people/communities will this reach? (required)',
      '**Geographic Focus** — Where in the world does this operate?'
    ],
    tip: 'Quantify impact whenever possible. "Serve 500 families" is stronger than "help many people". Show the ripple effect.'
  },
  {
    id: 'step6',
    title: 'Step 6: Readiness Assessment',
    icon: Shield,
    color: 'purple',
    content: `Check off what you already have in place. This helps reviewers understand **how ready you are to execute** and what support you might need.`,
    highlights: [
      '**Team** — Do you have a team assembled?',
      '**Prototype** — Is there a working prototype or MVP?',
      '**Partnerships** — Any existing partnerships or agreements?',
      '**Legal Structure** — Is there a legal entity set up?'
    ],
    tip: 'Don\'t worry if you\'re not fully ready — that\'s what the SaintAgent community is here for. Honesty about gaps invites the right help.'
  },
  {
    id: 'step7',
    title: 'Step 7: Supporting Documents',
    icon: Upload,
    color: 'emerald',
    content: `Upload any materials that strengthen your submission. Documents give reviewers **confidence** in your preparedness.`,
    highlights: [
      '**Pitch Deck** — Your slides or presentation (recommended)',
      '**Business Plan** — Detailed strategy document',
      '**Financial Projections** — Spreadsheets or forecasts',
      '**Other Documents** — Letters of support, research papers, etc.'
    ],
    tip: 'Even a simple 5-slide pitch deck dramatically improves your submission quality. Focus on: Problem → Solution → Market → Team → Ask.'
  },
  {
    id: 'step8',
    title: 'Step 8: Final Alignment',
    icon: Target,
    color: 'violet',
    content: `The final step — explain **why your project aligns** with the SaintAgent mission and **what success looks like**. This is your closing statement.`,
    highlights: [
      '**Alignment Statement** — Why this project fits the platform\'s mission (required)',
      '**Success Definition** — What does success look like in 6-12 months? (required)'
    ],
    tip: 'Reference the platform\'s core values: positive change, community empowerment, conscious innovation, and global impact.'
  },
  {
    id: 'after',
    title: 'After You Submit',
    icon: Scale,
    color: 'blue',
    content: `Once you hit **Submit for Review**, here's what happens behind the scenes:`,
    highlights: [
      '**Phase 1: Eligibility Screening** — AI checks for completeness and red flags',
      '**Phase 2: Scoring Engine** — Your project gets scored on impact, feasibility, and alignment',
      '**Phase 3: Risk Assessment** — Execution risk and harm gates are evaluated',
      '**Phase 4: Decision** — Approve & Fund, Incubate, Review, or Decline',
      'You can track your status on the **Projects** page anytime',
      'Reviewers may send **RFI (Request for Info)** if they need more details'
    ],
  },
  {
    id: 'complete',
    title: 'You\'re Ready! 🎉',
    icon: CheckCircle2,
    color: 'emerald',
    content: `You now know everything about the project submission process. Here's a quick checklist to maximize your chances:`,
    highlights: [
      '✅ Choose a clear, descriptive project name',
      '✅ Write a compelling problem statement with specifics',
      '✅ Be transparent about funding needs and use of funds',
      '✅ Quantify your impact — numbers build confidence',
      '✅ Upload at least a pitch deck or overview document',
      '✅ Show alignment with community values and mission',
      '✅ Be honest about readiness — gaps invite collaboration'
    ],
    action: { label: 'Submit a Project Now', page: 'Projects' }
  },
];

const STEP_COLORS = {
  violet: { bg: 'bg-violet-50', border: 'border-violet-200', icon: 'bg-violet-100 text-violet-600', badge: 'bg-violet-600' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'bg-blue-100 text-blue-600', badge: 'bg-blue-600' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'bg-emerald-100 text-emerald-600', badge: 'bg-emerald-600' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'bg-amber-100 text-amber-600', badge: 'bg-amber-600' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'bg-purple-100 text-purple-600', badge: 'bg-purple-600' },
  pink: { bg: 'bg-pink-50', border: 'border-pink-200', icon: 'bg-pink-100 text-pink-600', badge: 'bg-pink-600' },
  rose: { bg: 'bg-rose-50', border: 'border-rose-200', icon: 'bg-rose-100 text-rose-600', badge: 'bg-rose-600' },
};

export default function ProjectSubmissionTutorial({ open, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = TUTORIAL_STEPS[currentStep];
  const colors = STEP_COLORS[step.color];
  const Icon = step.icon;
  const progress = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100;

  const goNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) setCurrentStep(currentStep + 1);
  };
  const goBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleAction = () => {
    if (step.action?.page) {
      onClose();
      window.location.href = createPageUrl(step.action.page);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden gap-0">
        {/* Progress Bar */}
        <div className="h-1 bg-slate-100">
          <div className="h-full bg-violet-600 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        {/* Header */}
        <div className={`${colors.bg} ${colors.border} border-b px-5 py-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${colors.icon} flex items-center justify-center`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <Badge className={`${colors.badge} text-white text-[10px] mb-1`}>
                  Step {currentStep + 1} of {TUTORIAL_STEPS.length}
                </Badge>
                <h3 className="font-bold text-slate-900 text-sm">{step.title}</h3>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="max-h-[55vh]">
          <div className="p-5 space-y-4">
            {/* Hero image for intro */}
            {step.image && (
              <div className="rounded-xl overflow-hidden h-32">
                <img src={step.image} alt="" className="w-full h-full object-cover" />
              </div>
            )}

            {/* Description */}
            <p className="text-sm text-slate-700 leading-relaxed">
              {step.content.split('**').map((part, i) => 
                i % 2 === 1 ? <strong key={i} className="text-slate-900">{part}</strong> : part
              )}
            </p>

            {/* Highlights */}
            {step.highlights && (
              <div className="space-y-2">
                {step.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className={`w-5 h-5 rounded-full ${colors.icon} flex items-center justify-center shrink-0 mt-0.5`}>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                    <p className="text-sm text-slate-600">
                      {h.split('**').map((part, j) => 
                        j % 2 === 1 ? <strong key={j} className="text-slate-800">{part}</strong> : part
                      )}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Tip */}
            {step.tip && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Pro Tip:</strong> {step.tip}</span>
              </div>
            )}

            {/* Action Button */}
            {step.action && (
              <Button onClick={handleAction} className="w-full bg-violet-600 hover:bg-violet-700 gap-2">
                {step.action.label}
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </ScrollArea>

        {/* Navigation */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50">
          <Button variant="ghost" size="sm" onClick={goBack} disabled={currentStep === 0} className="gap-1">
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>

          {/* Step dots */}
          <div className="flex gap-1">
            {TUTORIAL_STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentStep ? 'bg-violet-600 w-4' : i < currentStep ? 'bg-violet-300' : 'bg-slate-300'
                }`}
              />
            ))}
          </div>

          {currentStep < TUTORIAL_STEPS.length - 1 ? (
            <Button size="sm" onClick={goNext} className="bg-violet-600 hover:bg-violet-700 gap-1">
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button size="sm" onClick={onClose} className="bg-emerald-600 hover:bg-emerald-700 gap-1">
              <CheckCircle2 className="w-4 h-4" /> Done
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}