import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Rocket,
  Palette,
  GraduationCap,
  DollarSign,
  Heart,
  Users,
  Briefcase,
  Lightbulb,
  Target,
  Crown,
  CheckCircle2,
  ArrowRight,
  Sparkles
} from "lucide-react";

const ONBOARDING_TRACKS = [
  {
    id: 'creator',
    title: 'Creator',
    subtitle: 'Build, teach, and share',
    description: 'For artists, educators, and content creators looking to share their work and build an audience.',
    icon: Palette,
    color: 'violet',
    gradient: 'from-violet-500 to-purple-600',
    focusAreas: ['Portfolio showcase', 'Course creation', 'Community building', 'Digital products'],
    recommendedSteps: ['identity', 'skills', 'portfolio', 'offerings']
  },
  {
    id: 'entrepreneur',
    title: 'Entrepreneur',
    subtitle: 'Launch and scale',
    description: 'For founders and business builders seeking collaborators, investors, and growth opportunities.',
    icon: Rocket,
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-600',
    focusAreas: ['Project showcase', 'Team building', 'Investor connections', 'Mission creation'],
    recommendedSteps: ['identity', 'projects', 'team', 'missions']
  },
  {
    id: 'mentor',
    title: 'Mentor / Coach',
    subtitle: 'Guide and support',
    description: 'For experienced professionals ready to share wisdom and guide others on their journey.',
    icon: GraduationCap,
    color: 'amber',
    gradient: 'from-amber-500 to-orange-600',
    focusAreas: ['Mentorship profile', 'Session scheduling', 'Testimonials', 'Expertise showcase'],
    recommendedSteps: ['identity', 'expertise', 'availability', 'pricing']
  },
  {
    id: 'investor',
    title: 'Investor / Supporter',
    subtitle: 'Fund and empower',
    description: 'For those looking to invest in or support conscious projects and emerging leaders.',
    icon: DollarSign,
    color: 'blue',
    gradient: 'from-blue-500 to-indigo-600',
    focusAreas: ['Investment criteria', 'Deal flow', 'Project discovery', 'Impact tracking'],
    recommendedSteps: ['identity', 'interests', 'criteria', 'portfolio']
  },
  {
    id: 'healer',
    title: 'Healer / Practitioner',
    subtitle: 'Serve and transform',
    description: 'For wellness practitioners, healers, and spiritual guides offering services to the community.',
    icon: Heart,
    color: 'rose',
    gradient: 'from-rose-500 to-pink-600',
    focusAreas: ['Modalities', 'Session types', 'Booking system', 'Client management'],
    recommendedSteps: ['identity', 'modalities', 'services', 'schedule']
  },
  {
    id: 'collaborator',
    title: 'Collaborator',
    subtitle: 'Connect and contribute',
    description: 'For those seeking meaningful collaborations and wanting to contribute to existing projects.',
    icon: Users,
    color: 'teal',
    gradient: 'from-teal-500 to-cyan-600',
    focusAreas: ['Skills showcase', 'Availability', 'Project interests', 'Team preferences'],
    recommendedSteps: ['identity', 'skills', 'availability', 'preferences']
  },
  {
    id: 'leader',
    title: 'Community Leader',
    subtitle: 'Organize and inspire',
    description: 'For those ready to lead circles, organize events, and build communities around shared visions.',
    icon: Crown,
    color: 'purple',
    gradient: 'from-purple-500 to-violet-600',
    focusAreas: ['Circle creation', 'Event hosting', 'Mission leadership', 'Regional coordination'],
    recommendedSteps: ['identity', 'vision', 'community', 'leadership']
  },
  {
    id: 'explorer',
    title: 'Explorer',
    subtitle: 'Discover and learn',
    description: 'New to the ecosystem? Start here to explore all possibilities before choosing a path.',
    icon: Lightbulb,
    color: 'slate',
    gradient: 'from-slate-500 to-slate-700',
    focusAreas: ['Platform overview', 'Feature discovery', 'Connection building', 'Learning resources'],
    recommendedSteps: ['identity', 'interests', 'goals', 'exploration']
  }
];

export default function OnboardingTrackSelector({ selectedTrack, onSelectTrack, onContinue }) {
  const [hoveredTrack, setHoveredTrack] = useState(null);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 mb-4">
          <Target className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Choose Your Path</h2>
        <p className="text-slate-600">Select the track that best describes your primary intention. You can always explore other areas later.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ONBOARDING_TRACKS.map((track) => {
          const Icon = track.icon;
          const isSelected = selectedTrack === track.id;
          const isHovered = hoveredTrack === track.id;

          return (
            <motion.button
              key={track.id}
              onClick={() => onSelectTrack(track.id)}
              onMouseEnter={() => setHoveredTrack(track.id)}
              onMouseLeave={() => setHoveredTrack(null)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "relative p-5 rounded-2xl border-2 text-left transition-all",
                isSelected 
                  ? "border-violet-500 bg-violet-50 shadow-lg shadow-violet-100" 
                  : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
              )}
            >
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <CheckCircle2 className="w-6 h-6 text-violet-600" />
                </div>
              )}

              <div className="flex items-start gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                  `bg-gradient-to-br ${track.gradient}`
                )}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900">{track.title}</h3>
                  <p className="text-sm text-slate-500 mb-2">{track.subtitle}</p>
                  <p className="text-sm text-slate-600 line-clamp-2">{track.description}</p>
                </div>
              </div>

              {/* Expanded Focus Areas on Hover/Select */}
              {(isSelected || isHovered) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-slate-100"
                >
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Focus Areas</p>
                  <div className="flex flex-wrap gap-2">
                    {track.focusAreas.map((area, idx) => (
                      <span 
                        key={idx}
                        className={cn(
                          "px-2 py-1 text-xs rounded-full",
                          isSelected ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-600"
                        )}
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {selectedTrack && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center pt-4"
        >
          <Button 
            onClick={onContinue}
            size="lg"
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 gap-2 px-8"
          >
            Continue as {ONBOARDING_TRACKS.find(t => t.id === selectedTrack)?.title}
            <ArrowRight className="w-5 h-5" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}

export { ONBOARDING_TRACKS };