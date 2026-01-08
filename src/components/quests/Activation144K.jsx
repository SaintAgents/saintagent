import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Sparkles, Heart, Zap, Globe, CheckCircle, ChevronRight, ChevronLeft, Play, Pause } from 'lucide-react';
import PlanetaryGrid from './PlanetaryGrid';
import CoherenceSlider from './CoherenceSlider';
import { TRANSMISSIONS, calculateQuestRewards } from './MetaVarianceConfig';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const ACTIVATION_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome, Frequency Stabilizer',
    affirmation: null,
    instruction: 'You are about to begin the 144K Activation — a sacred process of becoming a conscious node in the planetary grid.',
    content: TRANSMISSIONS.transmission4.content.split('\n\n')[0]
  },
  {
    id: 'understanding',
    title: 'Understanding Your Role',
    affirmation: null,
    instruction: 'Read and absorb the transmission from Saint Germain.',
    content: `"The 144K are not soldiers, nor followers, nor anointed elites. They are frequency stabilizers."

"144,000 is not a headcount — it is a harmonic."

It is the minimum number of coherent nodes required to lock the planetary grid into its ascension trajectory.`
  },
  {
    id: 'coherence',
    title: 'Tune Your Frequency',
    affirmation: 'I AM a coherent node in the planetary grid. My frequency stabilizes timelines.',
    instruction: 'Set your Meta-Variance coherence level. Higher coherence amplifies your impact.',
    content: 'Your coherence factor determines how strongly your node resonates with the collective field. Choose a level that reflects your current alignment.'
  },
  {
    id: 'intention',
    title: 'Set Your Intention',
    affirmation: 'I choose to serve as a frequency stabilizer for the Earth. My presence awakens others.',
    instruction: 'Speak this intention aloud or hold it clearly in your heart.',
    content: `"Each awakened soul becomes a tuning fork. Groups of them become a stabilizing field. When enough are coherent simultaneously, the Earth's energetic architecture upgrades itself."`
  },
  {
    id: 'breathwork',
    title: 'Breathwork Activation',
    affirmation: 'With each breath, I anchor more light into the planetary grid.',
    instruction: 'Follow this breathing pattern: Inhale for 4 counts, hold for 7, exhale for 8. Repeat 7 times.',
    content: 'This sacred breath pattern activates your energy field and prepares your node for full integration with the Ultranet.'
  },
  {
    id: 'visualization',
    title: 'Grid Visualization',
    affirmation: 'I see myself as a golden point of light on the crystalline grid of Earth.',
    instruction: 'Close your eyes. Visualize the planetary grid. See your node lighting up and connecting to others.',
    content: 'Watch the grid below. Your node is activating. Feel the connections forming with other stabilizers across the planet.'
  },
  {
    id: 'activation',
    title: 'The Activation',
    affirmation: 'I AM activated. I AM a node of the Ultranet. I AM a frequency stabilizer of the 144K harmonic.',
    instruction: 'This is the moment of activation. Speak the affirmation with full conviction.',
    content: `"Through your voice, your presence, your remembrance, the nodes awaken."

"Your mission is not recruitment — it is resonance."

"When the 144K harmonic stabilizes, the Earth will no longer wobble between timelines. Ascension becomes the dominant frequency."`
  }
];

export default function Activation144K({ profile, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [coherence, setCoherence] = useState(5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [breathPhase, setBreathPhase] = useState('ready');
  const [breathCount, setBreathCount] = useState(0);
  const [userNodeActive, setUserNodeActive] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const queryClient = useQueryClient();

  const step = ACTIVATION_STEPS[currentStep];
  const progress = ((currentStep + 1) / ACTIVATION_STEPS.length) * 100;
  const rewards = calculateQuestRewards(500, 0.25, coherence);

  // Breathwork timer
  useEffect(() => {
    if (!isPlaying || step.id !== 'breathwork') return;
    
    const phases = ['inhale', 'hold', 'exhale'];
    const durations = [4000, 7000, 8000];
    let phaseIndex = 0;
    
    const cycle = () => {
      setBreathPhase(phases[phaseIndex]);
      setTimeout(() => {
        phaseIndex = (phaseIndex + 1) % 3;
        if (phaseIndex === 0) {
          setBreathCount(c => {
            if (c >= 6) {
              setIsPlaying(false);
              setBreathPhase('complete');
              return 7;
            }
            return c + 1;
          });
        }
        if (isPlaying) cycle();
      }, durations[phaseIndex]);
    };
    
    cycle();
  }, [isPlaying, step.id]);

  // Activate user node on visualization step
  useEffect(() => {
    if (step.id === 'visualization' || step.id === 'activation') {
      const timer = setTimeout(() => setUserNodeActive(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [step.id]);

  const badgeMutation = useMutation({
    mutationFn: async () => {
      // Award Frequency Stabilizer badge
      await base44.entities.Badge.create({
        user_id: profile.user_id,
        code: 'frequency_stabilizer',
        name: 'Frequency Stabilizer',
        category: 'accomplishment',
        description: 'Completed the 144K Activation and became a node in the planetary grid',
        status: 'active',
        meta_variance_level: coherence
      });
      
      // Award RP and GGG
      await base44.entities.UserProfile.update(profile.id, {
        rp_points: (profile.rp_points || 0) + rewards.rp,
        ggg_balance: (profile.ggg_balance || 0) + parseFloat(rewards.ggg),
        engagement_points: (profile.engagement_points || 0) + 100
      });
      
      // Log transaction
      await base44.entities.GGGTransaction.create({
        user_id: profile.user_id,
        source_type: 'mission',
        delta: parseFloat(rewards.ggg),
        reason_code: '144k_activation',
        description: '144K Activation completed at coherence level ' + coherence,
        balance_after: (profile.ggg_balance || 0) + parseFloat(rewards.ggg)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['userBadges'] });
      onComplete?.();
    }
  });

  const handleNext = () => {
    setCompletedSteps(prev => new Set([...prev, step.id]));
    if (currentStep < ACTIVATION_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleComplete = () => {
    badgeMutation.mutate();
  };

  const isLastStep = currentStep === ACTIVATION_STEPS.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-violet-950 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/30 mb-4">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-amber-300 text-sm font-medium">144K Activation</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">The Planetary Grid Activation</h1>
          <p className="text-violet-300">Saint Germain Transmission IV</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Step {currentStep + 1} of {ACTIVATION_STEPS.length}</span>
            <span className="text-sm text-violet-400">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="bg-slate-800/50 border-violet-500/30 mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
                {completedSteps.has(step.id) ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                  <span className="text-violet-400 font-bold">{currentStep + 1}</span>
                )}
              </div>
              <CardTitle className="text-white">{step.title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Instruction */}
            <div className="p-4 rounded-xl bg-slate-700/50 border border-slate-600">
              <p className="text-slate-300">{step.instruction}</p>
            </div>

            {/* Affirmation */}
            {step.affirmation && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-violet-500/20 border border-amber-500/30">
                <div className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-amber-300 uppercase tracking-wide mb-1">Affirmation</p>
                    <p className="text-white font-medium italic">"{step.affirmation}"</p>
                  </div>
                </div>
              </div>
            )}

            {/* Transmission Content */}
            <div className="p-4 rounded-xl bg-violet-900/30 border border-violet-500/20">
              <p className="text-violet-200 whitespace-pre-line leading-relaxed">{step.content}</p>
            </div>

            {/* Coherence Slider (step 3) */}
            {step.id === 'coherence' && (
              <CoherenceSlider 
                value={coherence}
                onChange={setCoherence}
                baseReward={500}
                baseGGG={0.25}
              />
            )}

            {/* Breathwork (step 5) */}
            {step.id === 'breathwork' && (
              <div className="text-center space-y-4">
                <div className={cn(
                  "w-32 h-32 mx-auto rounded-full flex items-center justify-center transition-all duration-1000",
                  breathPhase === 'inhale' && "bg-blue-500/30 scale-110",
                  breathPhase === 'hold' && "bg-violet-500/30 scale-110",
                  breathPhase === 'exhale' && "bg-emerald-500/30 scale-90",
                  breathPhase === 'ready' && "bg-slate-700/50",
                  breathPhase === 'complete' && "bg-amber-500/30"
                )}>
                  <span className="text-2xl font-bold text-white capitalize">
                    {breathPhase === 'ready' ? 'Begin' : 
                     breathPhase === 'complete' ? '✓ Done' : 
                     breathPhase}
                  </span>
                </div>
                <p className="text-slate-400">Breath cycle: {breathCount}/7</p>
                <Button
                  onClick={() => {
                    if (breathPhase === 'complete') return;
                    setIsPlaying(!isPlaying);
                    if (!isPlaying) setBreathPhase('inhale');
                  }}
                  disabled={breathPhase === 'complete'}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {isPlaying ? 'Pause' : breathPhase === 'complete' ? 'Complete' : 'Start Breathwork'}
                </Button>
              </div>
            )}

            {/* Grid Visualization (step 6 & 7) */}
            {(step.id === 'visualization' || step.id === 'activation') && (
              <PlanetaryGrid 
                activeNodes={144 + Math.floor(Math.random() * 1000)}
                userNodeActive={userNodeActive}
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {isLastStep ? (
            <Button
              onClick={handleComplete}
              disabled={badgeMutation.isPending}
              className="bg-gradient-to-r from-amber-500 to-violet-600 hover:from-amber-600 hover:to-violet-700 text-white px-8"
            >
              {badgeMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⟳</span>
                  Activating...
                </span>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Complete Activation
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="bg-violet-600 hover:bg-violet-700"
            >
              Continue
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Rewards Preview */}
        <div className="mt-8 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-6 h-6 text-violet-400" />
              <div>
                <p className="text-sm text-slate-400">Completion Rewards</p>
                <p className="text-white font-semibold">Frequency Stabilizer Badge</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-violet-400 font-bold">{rewards.rp} RP</p>
              <p className="text-amber-400 text-sm">{rewards.ggg} GGG</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}