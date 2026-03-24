import React, { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Building2, Sparkles, ChevronRight, ChevronLeft, X, CheckCircle2,
  FileText, Image, Users, Globe, Tag, MapPin, Star, Rocket, ArrowRight
} from 'lucide-react';
import { createPageUrl } from '@/utils';

const TUTORIAL_STEPS = [
  {
    id: 'intro',
    title: 'Welcome to 5D Business Entities',
    icon: Building2,
    color: 'violet',
    content: `A **5D Business Entity** is your organization's presence on the SaintAgent platform. It represents a conscious business, project, or collective that's building the new paradigm. **You don't need to sign out** — when you register an entity, you automatically become the owner.`,
    highlights: [
      'Showcase your business to the entire SaintAgent community',
      'Build trust through reviews, verification, and impact metrics',
      'Attract collaborators, team members, and clients',
      'Track your entity\'s growth with built-in analytics',
      'You are automatically the **owner** — no separate login needed'
    ],
    image: 'https://media.base44.com/images/public/694f3e0401b05e6e8a042002/6ba2b63c4_universal_upscale_0_d50f73c9-693f-450b-977e-64eea1b7922d_02.jpg'
  },
  {
    id: 'navigate',
    title: 'Step 1: Navigate to Business Entities',
    icon: Globe,
    color: 'blue',
    content: `First, you need to find the **5D Business Entities** page. There are two ways to get there:`,
    highlights: [
      '**Left Sidebar** → Look for "5D Entities" or "Business" in the navigation menu',
      '**Search Bar** → Type "Business" or "5D" in the top search bar',
      '**Profile Menu** → Your entities appear directly in the dropdown'
    ],
    action: { label: 'Go to Business Entities', page: 'BusinessEntities' }
  },
  {
    id: 'create',
    title: 'Step 2: Register Your Entity',
    icon: Rocket,
    color: 'emerald',
    content: `Click the **"Register Your Entity"** button on the Business Entities page. This opens the creation form where you'll define your organization.`,
    highlights: [
      'Click the purple **Register Your Entity** button in the hero section',
      'Or click **Register Entity** if the directory is empty',
      'The creation modal will pop up with all the fields you need'
    ],
  },
  {
    id: 'name_tagline',
    title: 'Step 3: Name & Tagline',
    icon: FileText,
    color: 'amber',
    content: `Start with the basics — your entity's **name** and **tagline**. These are the first things people see.`,
    highlights: [
      '**Entity Name** — Your official organization or business name (required)',
      '**Tagline** — A short, catchy slogan (e.g. "Healing the world one soul at a time")',
      'Keep it concise and memorable — you can always edit later'
    ],
    tip: 'Your entity name should be unique and recognizable. Avoid generic names.'
  },
  {
    id: 'category',
    title: 'Step 4: Choose Your Category',
    icon: Tag,
    color: 'purple',
    content: `Select the **category** that best represents your entity. This helps people discover you through filters.`,
    highlights: [
      '**Healing & Wellness** — Health, therapy, alternative medicine',
      '**Conscious Technology** — Ethical tech, AI for good, open source',
      '**Sustainable Living** — Eco-friendly, permaculture, green energy',
      '**Spiritual Education** — Courses, workshops, retreats',
      '**Sacred Arts** — Art, music, creative expressions',
      '**Regenerative Finance / Fintech** — Ethical finance, community banking',
      '**Community Building** — Networks, collectives, cooperatives',
      '**Earth Stewardship** — Environmental conservation, restoration'
    ],
    tip: 'Choose the category that matches your PRIMARY focus. You can add more detail with Focus Areas.'
  },
  {
    id: 'description',
    title: 'Step 5: Description & Mission',
    icon: FileText,
    color: 'blue',
    content: `Tell the community **what you do** and **why you do it**. These fields build trust and attract the right connections.`,
    highlights: [
      '**Description** — What does your entity do? What problems do you solve?',
      '**Mission Statement** — Your core purpose and values in 1-2 sentences',
      '**Focus Areas** — Comma-separated tags (e.g. "Energy Healing, Permaculture, AI Ethics")'
    ],
    tip: 'Be authentic and specific. Generic descriptions get overlooked. Share what makes you unique.'
  },
  {
    id: 'branding',
    title: 'Step 6: Logo & Cover Image',
    icon: Image,
    color: 'pink',
    content: `Visual branding makes your entity stand out. Upload a **logo** and **cover image** to create a professional presence.`,
    highlights: [
      '**Logo** — A square image (ideally 512×512px or larger)',
      '**Cover Image** — A wide banner image (ideally 1200×400px)',
      'Both are optional but strongly recommended for credibility',
      'You can update these anytime from your entity profile'
    ],
    tip: 'High-quality images dramatically increase engagement and trust.'
  },
  {
    id: 'contact',
    title: 'Step 7: Contact & Location',
    icon: MapPin,
    color: 'emerald',
    content: `Add your contact information so people can reach your entity directly.`,
    highlights: [
      '**Website URL** — Your main website or landing page',
      '**Contact Email** — Defaults to your SaintAgent email if left blank',
      '**Location** — City, Country where you operate (or "Global")'
    ],
  },
  {
    id: 'profile',
    title: 'Step 8: Your Entity Profile',
    icon: Star,
    color: 'amber',
    content: `After creation, you'll be taken to your **Entity Profile** page. This is your public-facing hub with powerful features:`,
    highlights: [
      '**Dashboard Tab** — Overview stats, quick actions, analytics',
      '**Team Tab** — Add team members from the SaintAgent community',
      '**Services Tab** — List your offerings with pricing',
      '**Reviews Tab** — Community members can leave ratings and reviews',
      '**Deals Tab** — Track business opportunities through your pipeline',
      '**Projects Tab** — Link SaintAgent projects to your entity',
      '**Trust Score** — Built from reviews, activity, and verification level'
    ],
  },
  {
    id: 'team',
    title: 'Step 9: Build Your Team',
    icon: Users,
    color: 'blue',
    content: `One of the most powerful features — invite other SaintAgent members to join your entity's team and manage them directly!`,
    highlights: [
      'Go to the **Team** tab on your entity profile',
      'Click **Add Team Member** and search for people by name or handle',
      'Assign roles (**Admin** or **Member**) and custom titles like "Marketing Lead" or "Advisor"',
      'Click the **pencil icon** on any member to update their role or title anytime',
      'Click the **trash icon** to remove a member (with confirmation)',
      'Only the **owner** can manage team roles — members cannot edit each other'
    ],
    tip: 'Building a team increases your entity\'s visibility and trust score. Use custom titles to showcase each member\'s unique contribution.'
  },
  {
    id: 'complete',
    title: 'You\'re Ready! 🎉',
    icon: CheckCircle2,
    color: 'emerald',
    content: `That's everything you need to set up your 5D Business Entity. Here's a quick summary of what to do next:`,
    highlights: [
      '✅ Register your entity with name, category, and description',
      '✅ Upload a logo and cover image for branding',
      '✅ Add your contact info and location',
      '✅ Invite team members to build your presence',
      '✅ Add services you offer to the community',
      '✅ Encourage clients to leave reviews for trust'
    ],
    action: { label: 'Create Your Entity Now', page: 'BusinessEntities' }
  },
];

const STEP_COLORS = {
  violet: { bg: 'bg-violet-50', border: 'border-violet-200', icon: 'bg-violet-100 text-violet-600', badge: 'bg-violet-600' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'bg-blue-100 text-blue-600', badge: 'bg-blue-600' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'bg-emerald-100 text-emerald-600', badge: 'bg-emerald-600' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'bg-amber-100 text-amber-600', badge: 'bg-amber-600' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'bg-purple-100 text-purple-600', badge: 'bg-purple-600' },
  pink: { bg: 'bg-pink-50', border: 'border-pink-200', icon: 'bg-pink-100 text-pink-600', badge: 'bg-pink-600' },
};

export default function BusinessEntityTutorial({ open, onClose }) {
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