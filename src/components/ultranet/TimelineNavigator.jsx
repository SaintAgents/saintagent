import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { 
  GitBranch, Sparkles, Clock, Zap, Star, 
  ChevronRight, Lock, Eye, Compass, Target,
  TrendingUp, Heart, Users, Crown
} from 'lucide-react';

// Timeline archetypes based on Meta-Variance alignment
const TIMELINE_ARCHETYPES = {
  architect: {
    id: 'architect',
    name: 'The Architect Path',
    icon: Target,
    color: 'violet',
    description: 'Building new systems and structures for the New Earth',
    traits: ['visionary', 'systematic', 'innovative'],
    milestones: [
      { year: 2026, event: 'Launch foundational project' },
      { year: 2030, event: 'Establish network of builders' },
      { year: 2033, event: 'Systems integration at scale' },
      { year: 2040, event: 'Legacy architecture complete' }
    ]
  },
  healer: {
    id: 'healer',
    name: 'The Healer Path',
    icon: Heart,
    color: 'rose',
    description: 'Facilitating transformation and restoration of souls',
    traits: ['compassionate', 'intuitive', 'restorative'],
    milestones: [
      { year: 2026, event: 'Deepen healing modalities' },
      { year: 2030, event: 'Train next generation' },
      { year: 2033, event: 'Collective healing ceremonies' },
      { year: 2040, event: 'Planetary restoration work' }
    ]
  },
  connector: {
    id: 'connector',
    name: 'The Connector Path',
    icon: Users,
    color: 'emerald',
    description: 'Weaving souls together in sacred community',
    traits: ['relational', 'bridge-builder', 'harmonizer'],
    milestones: [
      { year: 2026, event: 'Build core community' },
      { year: 2030, event: 'Regional network expansion' },
      { year: 2033, event: 'Global node activation' },
      { year: 2040, event: 'Unified consciousness grid' }
    ]
  },
  teacher: {
    id: 'teacher',
    name: 'The Teacher Path',
    icon: Crown,
    color: 'amber',
    description: 'Transmitting wisdom and awakening remembrance',
    traits: ['wise', 'patient', 'illuminating'],
    milestones: [
      { year: 2026, event: 'Crystallize teachings' },
      { year: 2030, event: 'Establish mystery school' },
      { year: 2033, event: 'Mass awakening facilitation' },
      { year: 2040, event: 'Wisdom keeper lineage' }
    ]
  }
};

// Calculate timeline alignment based on profile
function calculateTimelineAlignment(profile) {
  if (!profile) return null;
  
  const scores = {
    architect: 0,
    healer: 0,
    connector: 0,
    teacher: 0
  };
  
  // Skills and intentions affect alignment
  const skills = profile.skills || [];
  const intentions = profile.intentions || [];
  const practices = profile.spiritual_practices || [];
  
  // Architect indicators
  if (skills.some(s => ['technology', 'engineering', 'design', 'systems'].includes(s?.toLowerCase()))) scores.architect += 20;
  if (intentions.includes('build')) scores.architect += 15;
  if (profile.collaboration_preferences?.preferred_roles?.includes('co-founder')) scores.architect += 10;
  
  // Healer indicators
  if (practices.some(p => ['energy_work', 'reiki', 'healing'].includes(p))) scores.healer += 20;
  if (skills.some(s => ['healing', 'therapy', 'counseling'].includes(s?.toLowerCase()))) scores.healer += 15;
  if (intentions.includes('heal')) scores.healer += 10;
  
  // Connector indicators
  if (profile.follower_count > 50) scores.connector += 15;
  if (profile.meetings_completed > 10) scores.connector += 15;
  if (intentions.includes('service')) scores.connector += 10;
  
  // Teacher indicators
  if (profile.practice_depth === 'teaching' || profile.practice_depth === 'mastery') scores.teacher += 20;
  if (intentions.includes('teach')) scores.teacher += 15;
  if (skills.some(s => ['teaching', 'mentoring', 'coaching'].includes(s?.toLowerCase()))) scores.teacher += 10;
  
  // Normalize
  const total = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
  const alignments = Object.entries(scores).map(([key, value]) => ({
    archetype: key,
    percentage: Math.round((value / total) * 100)
  })).sort((a, b) => b.percentage - a.percentage);
  
  return alignments;
}

export default function TimelineNavigator({ profile, coherenceLevel = 5 }) {
  const [selectedTimeline, setSelectedTimeline] = useState(null);
  const [coherenceSlider, setCoherenceSlider] = useState([coherenceLevel]);
  const [exploring, setExploring] = useState(false);
  
  const alignments = calculateTimelineAlignment(profile);
  const primaryArchetype = alignments?.[0]?.archetype;
  const primaryTimeline = primaryArchetype ? TIMELINE_ARCHETYPES[primaryArchetype] : null;
  
  // Simulate timeline exploration
  const exploreTimeline = async (archetype) => {
    setExploring(true);
    setSelectedTimeline(archetype);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setExploring(false);
  };

  const colorClasses = {
    violet: 'from-violet-500/20 to-purple-500/10 border-violet-500/30 text-violet-400',
    rose: 'from-rose-500/20 to-pink-500/10 border-rose-500/30 text-rose-400',
    emerald: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
    amber: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-violet-950/50 to-indigo-950/30 border-violet-500/20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxMzksMTM5LDI0NiwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
        
        <CardHeader className="relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <GitBranch className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                Timeline Navigator
                <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/40">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Meta-Variance
                </Badge>
              </CardTitle>
              <CardDescription className="text-violet-300/70">
                Explore potential futures based on your coherence alignment
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="relative space-y-6">
          {/* Coherence Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-violet-300">Coherence Factor</span>
              <span className="text-violet-400 font-bold">{coherenceSlider[0]}/10</span>
            </div>
            <Slider
              value={coherenceSlider}
              onValueChange={setCoherenceSlider}
              min={1}
              max={10}
              step={1}
              className="[&_[role=slider]]:bg-violet-500 [&_[role=slider]]:border-violet-400"
            />
            <p className="text-xs text-slate-400">
              Higher coherence reveals clearer timeline branches and deeper possibilities
            </p>
          </div>
          
          {/* Primary Alignment */}
          {primaryTimeline && (
            <div className={cn(
              "p-4 rounded-xl bg-gradient-to-br border",
              colorClasses[primaryTimeline.color]
            )}>
              <div className="flex items-center gap-3 mb-3">
                <primaryTimeline.icon className="w-6 h-6" />
                <div>
                  <h4 className="font-semibold text-white">{primaryTimeline.name}</h4>
                  <p className="text-xs opacity-80">Your primary timeline resonance</p>
                </div>
                <Badge className="ml-auto bg-white/10 text-white border-white/20">
                  {alignments[0].percentage}% aligned
                </Badge>
              </div>
              <p className="text-sm text-slate-300">{primaryTimeline.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {Object.values(TIMELINE_ARCHETYPES).map((timeline) => {
          const alignment = alignments?.find(a => a.archetype === timeline.id);
          const isSelected = selectedTimeline === timeline.id;
          const Icon = timeline.icon;
          
          return (
            <Card 
              key={timeline.id}
              className={cn(
                "bg-[rgba(0,0,0,0.85)] border transition-all cursor-pointer",
                isSelected 
                  ? `border-${timeline.color}-500/50 shadow-lg shadow-${timeline.color}-500/20` 
                  : "border-[rgba(0,255,136,0.2)] hover:border-[rgba(0,255,136,0.4)]"
              )}
              onClick={() => exploreTimeline(timeline.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      `bg-${timeline.color}-500/20`
                    )}>
                      <Icon className={cn("w-4 h-4", `text-${timeline.color}-400`)} />
                    </div>
                    <CardTitle className="text-white text-base">{timeline.name}</CardTitle>
                  </div>
                  {alignment && (
                    <Badge variant="outline" className="text-xs">
                      {alignment.percentage}%
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-slate-400 mb-3">{timeline.description}</p>
                
                {/* Traits */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {timeline.traits.map(trait => (
                    <Badge key={trait} variant="outline" className="text-xs text-slate-500 border-slate-700">
                      {trait}
                    </Badge>
                  ))}
                </div>
                
                {/* Milestones Preview */}
                {isSelected && !exploring && (
                  <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
                    <h5 className="text-xs font-semibold text-violet-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Timeline Milestones
                    </h5>
                    {timeline.milestones.map((m, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className="text-amber-400 font-mono w-12">{m.year}</span>
                        <ChevronRight className="w-3 h-3 text-slate-600" />
                        <span className="text-slate-300">{m.event}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {exploring && isSelected && (
                  <div className="mt-4 pt-4 border-t border-slate-800">
                    <div className="flex items-center gap-2 text-violet-400">
                      <div className="animate-spin">
                        <Compass className="w-4 h-4" />
                      </div>
                      <span className="text-sm">Navigating timeline streams...</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Timeline Integration Note */}
      <Card className="bg-gradient-to-br from-amber-950/30 to-orange-950/20 border-amber-500/20">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Eye className="w-5 h-5 text-amber-400 mt-0.5" />
            <div>
              <p className="text-sm text-amber-200">
                "These are timelines. Running beside one another, awaiting coherence."
              </p>
              <p className="text-xs text-slate-400 mt-1">
                — Transmission III: The Timeline Convergence
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}