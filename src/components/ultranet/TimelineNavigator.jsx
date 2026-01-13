import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { 
  Compass, Sparkles, Star, Flame, Eye, Crown, 
  ChevronRight, Radio, Zap, Heart, Globe, Clock,
  TrendingUp, ArrowRight, Lock, Unlock
} from 'lucide-react';
import { calculateResonance } from './UltranetResonanceIndicator';
import { COHERENCE_MULTIPLIERS } from '@/components/quests/MetaVarianceConfig';

// Timeline archetypes based on coherence and alignment
const TIMELINE_ARCHETYPES = {
  seeker: {
    name: 'The Seeker Path',
    description: 'Discovery, learning, and initial awakening',
    color: 'slate',
    icon: Compass,
    milestones: ['First Awakening', 'Finding Community', 'Initial Missions', 'Skill Discovery']
  },
  builder: {
    name: 'The Builder Path',
    description: 'Creating, constructing, and manifesting',
    color: 'emerald',
    icon: Zap,
    milestones: ['Project Launch', 'Team Formation', 'Impact Creation', 'Legacy Building']
  },
  healer: {
    name: 'The Healer Path',
    description: 'Restoration, transformation, and service',
    color: 'rose',
    icon: Heart,
    milestones: ['Gift Discovery', 'Mentorship Begin', 'Community Healing', 'Master Teacher']
  },
  visionary: {
    name: 'The Visionary Path',
    description: 'Innovation, inspiration, and leadership',
    color: 'violet',
    icon: Eye,
    milestones: ['Vision Clarity', 'Movement Building', 'Collective Shift', 'New Paradigm']
  },
  sovereign: {
    name: 'The Sovereign Path',
    description: 'Mastery, authority, and timeline architecture',
    color: 'amber',
    icon: Crown,
    milestones: ['Self-Mastery', 'Field Stabilization', 'Council Integration', 'Christos Activation']
  }
};

// Timeline probability based on current coherence
function calculateTimelineProbabilities(profile, coherence) {
  const resonance = calculateResonance(profile);
  const baseProb = Math.min(resonance.level * 10, 100);
  
  // Calculate which timelines are most probable based on profile data
  const probabilities = {};
  
  // Seeker - default path
  probabilities.seeker = Math.max(20, 100 - coherence * 8);
  
  // Builder - based on projects, missions
  const builderScore = (profile?.missions_completed_season || 0) * 5 + 
                       (profile?.meetings_completed || 0) * 2;
  probabilities.builder = Math.min(builderScore + coherence * 5, 95);
  
  // Healer - based on mentorship, testimonials
  const healerScore = (profile?.mentorship_hours_season || 0) * 3 + 
                      (profile?.mentorship_upvotes_season || 0) * 2;
  probabilities.healer = Math.min(healerScore + coherence * 4, 90);
  
  // Visionary - based on influence, followers
  const visionaryScore = (profile?.follower_count || 0) * 0.5 + 
                         (profile?.influence_score || 0) * 0.3;
  probabilities.visionary = Math.min(visionaryScore + coherence * 6, 85);
  
  // Sovereign - requires high coherence
  probabilities.sovereign = coherence >= 7 ? Math.min(coherence * 10, 80) : 0;
  
  return probabilities;
}

// Single timeline card
function TimelineCard({ archetype, probability, isActive, onSelect, isLocked }) {
  const timeline = TIMELINE_ARCHETYPES[archetype];
  const Icon = timeline.icon;
  
  const colorStyles = {
    slate: 'border-slate-500/30 bg-slate-500/10',
    emerald: 'border-emerald-500/30 bg-emerald-500/10',
    rose: 'border-rose-500/30 bg-rose-500/10',
    violet: 'border-violet-500/30 bg-violet-500/10',
    amber: 'border-amber-500/30 bg-amber-500/10'
  };
  
  const iconColors = {
    slate: 'text-slate-400',
    emerald: 'text-emerald-400',
    rose: 'text-rose-400',
    violet: 'text-violet-400',
    amber: 'text-amber-400'
  };
  
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all hover:scale-[1.02]",
        "bg-[rgba(0,0,0,0.85)] border",
        isActive ? "ring-2 ring-violet-500" : "",
        colorStyles[timeline.color],
        isLocked && "opacity-50"
      )}
      onClick={() => !isLocked && onSelect(archetype)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              `bg-${timeline.color}-500/20`
            )}>
              {isLocked ? (
                <Lock className="w-4 h-4 text-slate-500" />
              ) : (
                <Icon className={cn("w-4 h-4", iconColors[timeline.color])} />
              )}
            </div>
            <div>
              <h4 className="text-white text-sm font-medium">{timeline.name}</h4>
              <p className="text-[10px] text-slate-400">{timeline.description}</p>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              "text-[10px]",
              probability > 70 ? "border-emerald-500/50 text-emerald-400" :
              probability > 40 ? "border-amber-500/50 text-amber-400" :
              "border-slate-500/50 text-slate-400"
            )}
          >
            {probability}%
          </Badge>
        </div>
        
        <Progress 
          value={probability} 
          className="h-1.5 mb-3"
        />
        
        <div className="flex flex-wrap gap-1">
          {timeline.milestones.map((milestone, idx) => (
            <Badge 
              key={milestone}
              variant="outline" 
              className={cn(
                "text-[9px] border-slate-700",
                idx < Math.floor(probability / 25) ? "text-slate-300" : "text-slate-600"
              )}
            >
              {milestone}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Main Timeline Navigator
export default function TimelineNavigator({ profile, userId }) {
  const [coherence, setCoherence] = useState(5);
  const [selectedTimeline, setSelectedTimeline] = useState(null);
  const [isExploring, setIsExploring] = useState(false);
  
  // Auto-calculate initial coherence from profile
  useEffect(() => {
    if (profile) {
      const resonance = calculateResonance(profile);
      setCoherence(resonance.level);
    }
  }, [profile]);
  
  const probabilities = calculateTimelineProbabilities(profile, coherence);
  const coherenceLabel = COHERENCE_MULTIPLIERS[coherence]?.label || 'Unknown';
  
  // Generate AI insight for selected timeline
  const handleExplore = async () => {
    if (!selectedTimeline) return;
    setIsExploring(true);
    // Simulate exploration (could integrate with AI)
    setTimeout(() => setIsExploring(false), 2000);
  };
  
  return (
    <Card className="bg-[rgba(0,0,0,0.85)] border-[rgba(0,255,136,0.2)]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-amber-500/20 flex items-center justify-center">
              <Compass className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                Timeline Navigator
                <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-400">
                  META-VARIANCE
                </Badge>
              </CardTitle>
              <CardDescription>
                Explore potential futures based on your current coherence
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Coherence Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Coherence Factor</span>
            <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30">
              {coherence}/10 — {coherenceLabel}
            </Badge>
          </div>
          <Slider
            value={[coherence]}
            onValueChange={([val]) => setCoherence(val)}
            min={1}
            max={10}
            step={1}
            className="py-2"
          />
          <p className="text-xs text-slate-500">
            Adjust to see how different coherence levels affect your timeline probabilities
          </p>
        </div>
        
        {/* Timeline Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(TIMELINE_ARCHETYPES).map(([key, timeline]) => (
            <TimelineCard
              key={key}
              archetype={key}
              probability={Math.round(probabilities[key] || 0)}
              isActive={selectedTimeline === key}
              onSelect={setSelectedTimeline}
              isLocked={key === 'sovereign' && coherence < 7}
            />
          ))}
        </div>
        
        {/* Selected Timeline Details */}
        {selectedTimeline && (
          <Card className="bg-gradient-to-br from-violet-900/20 to-amber-900/10 border-violet-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h4 className="text-white font-medium">
                    {TIMELINE_ARCHETYPES[selectedTimeline].name} Exploration
                  </h4>
                </div>
                <Button
                  size="sm"
                  onClick={handleExplore}
                  disabled={isExploring}
                  className="bg-violet-600 hover:bg-violet-700 gap-2"
                >
                  {isExploring ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                  Explore Timeline
                </Button>
              </div>
              
              <div className="space-y-3">
                <p className="text-sm text-slate-300">
                  Based on your current coherence of {coherence}/10, this timeline has a{' '}
                  <span className="text-amber-400 font-semibold">
                    {Math.round(probabilities[selectedTimeline])}%
                  </span>{' '}
                  probability of manifestation.
                </p>
                
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <TrendingUp className="w-3 h-3" />
                  <span>
                    Increase coherence to +{10 - coherence} points to maximize this timeline
                  </span>
                </div>
                
                <div className="pt-3 border-t border-slate-700">
                  <p className="text-xs text-violet-300 italic">
                    "The Seal does not open to effort, nor to force, but to resonance."
                    <span className="text-slate-500 ml-2">— Saint Germain</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Meta-Variance Info */}
        <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700">
          <div className="flex items-start gap-3">
            <Globe className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="text-white text-sm font-medium mb-1">
                Understanding Timeline Navigation
              </h5>
              <p className="text-xs text-slate-400 leading-relaxed">
                Meta-Variance describes how patterns in the quantum field reorganize based on 
                coherence, intention, and resonance. Your timeline probabilities shift as your 
                frequency stabilizes. Higher coherence unlocks more sovereign timelines and 
                increases the probability of your highest potential manifestation.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Compact timeline preview widget
export function TimelinePreviewWidget({ profile, className }) {
  const resonance = calculateResonance(profile);
  const probabilities = calculateTimelineProbabilities(profile, resonance.level);
  
  // Find most probable timeline
  const topTimeline = Object.entries(probabilities)
    .sort(([,a], [,b]) => b - a)[0];
  
  const timeline = TIMELINE_ARCHETYPES[topTimeline[0]];
  const Icon = timeline.icon;
  
  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-2 rounded-lg",
      "bg-slate-800/50 border border-slate-700",
      className
    )}>
      <Icon className={cn(
        "w-4 h-4",
        timeline.color === 'slate' && "text-slate-400",
        timeline.color === 'emerald' && "text-emerald-400",
        timeline.color === 'rose' && "text-rose-400",
        timeline.color === 'violet' && "text-violet-400",
        timeline.color === 'amber' && "text-amber-400"
      )} />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-white truncate">{timeline.name}</p>
        <p className="text-[10px] text-slate-500">{Math.round(topTimeline[1])}% aligned</p>
      </div>
      <ArrowRight className="w-3 h-3 text-slate-500" />
    </div>
  );
}