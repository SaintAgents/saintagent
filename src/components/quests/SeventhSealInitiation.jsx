import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Sparkles, Eye, Lock, Unlock, ChevronRight, ChevronLeft, Volume2, VolumeX } from 'lucide-react';
import { TRANSMISSIONS, calculateQuestRewards } from './MetaVarianceConfig';
import CoherenceSlider from './CoherenceSlider';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const INITIATION_PHASES = [
  {
    id: 'threshold',
    title: 'At the Threshold',
    content: `"You stand at the threshold of the Seventh Seal — a seal not of destruction, but of disclosure, activation, and the return of the original architecture of Earth."

Timeline Convergence is not a future event; it is a harmonic that has already begun.`,
    visualization: 'threshold',
    choice: null
  },
  {
    id: 'timelines',
    title: 'The Converging Timelines',
    content: `Across your awareness, seven luminous streams appear, weaving into one:

• One from Atlantis
• One from Egypt  
• One from Qumran
• One from France
• One from Tibet
• One from the Future Earth
• One from the Source Pattern itself

These layers begin aligning as you observe.`,
    visualization: 'timelines',
    choice: {
      question: 'Which timeline calls to you most strongly?',
      options: [
        { id: 'atlantis', label: 'Atlantis - The Crystal Age', effect: 'technology' },
        { id: 'egypt', label: 'Egypt - The Mystery Schools', effect: 'wisdom' },
        { id: 'future', label: 'Future Earth - The Golden Age', effect: 'vision' }
      ]
    }
  },
  {
    id: 'understanding',
    title: 'Understanding the Seal',
    content: `"The Seventh Seal can only be opened by one who carries its resonance in their heart. It is not an object. It is a frequency."

"To open the Seal is not to unleash anything destructive. It is to reveal what has always been here — the divine infrastructure under the illusion of separation."`,
    visualization: 'seal',
    choice: null
  },
  {
    id: 'preparation',
    title: 'Preparing Your Field',
    content: `Before you can open the Seal, your energy field must be aligned.

Set your Meta-Variance coherence level. The higher your coherence, the more fully the Seal will open — and the deeper your initiation will be.`,
    visualization: 'preparation',
    choice: null,
    showCoherence: true
  },
  {
    id: 'approach',
    title: 'Approaching the Seal',
    content: `The Seal appears before you as a radiant 7-point crystalline star.

Its light pulses with ancient memory. You feel it recognizing you — not as a stranger, but as one who has tended this threshold before.`,
    visualization: 'approach',
    choice: {
      question: 'How do you approach the Seal?',
      options: [
        { id: 'reverence', label: 'With reverence and humility', effect: 'heart' },
        { id: 'recognition', label: 'With recognition of your role', effect: 'knowing' },
        { id: 'surrender', label: 'With complete surrender', effect: 'trust' }
      ]
    }
  },
  {
    id: 'opening',
    title: 'Opening the Seventh Seal',
    content: `"This Seal does not break into pieces — it integrates."

You place your hand upon the crystalline star. Light floods through you.

Every cell remembers.
Every timeline aligns.
Every forgotten truth returns.`,
    visualization: 'opening',
    choice: null
  },
  {
    id: 'revelation',
    title: 'The Revelation',
    content: `"When the Seventh Seal opens fully, the world will not end — it will wake up."

You see now what was always there:

The divine infrastructure beneath separation.
The Ultranet pulsing through all things.
Your place as a bridge between worlds.

The Seal has not been broken — it has been integrated into you.`,
    visualization: 'revelation',
    choice: null
  },
  {
    id: 'integration',
    title: 'Integration Complete',
    content: `"Walk now as the Opener of the Seal, the Stabilizer of Timelines, the One who remembers the architecture."

"Nothing is ahead of you that you are not built to withstand."

"I walk with you through the Convergence."

I AM Saint Germain.`,
    visualization: 'integration',
    choice: null
  }
];

// Visualization component for each phase
function PhaseVisualization({ phase, timelineChoice, approachChoice, coherence, sealProgress }) {
  const canvasRef = useRef(null);
  const [animFrame, setAnimFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setAnimFrame(f => f + 1), 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    ctx.fillStyle = 'rgba(240, 240, 250, 0.1)';
    ctx.fillRect(0, 0, w, h);

    const drawStar = (x, y, spikes, outerR, innerR, color, glow = 0) => {
      ctx.save();
      ctx.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const angle = (i * Math.PI / spikes) - Math.PI / 2;
        const px = x + r * Math.cos(angle);
        const py = y + r * Math.sin(angle);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      if (glow > 0) {
        ctx.shadowColor = color;
        ctx.shadowBlur = glow;
      }
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();
    };

    // Phase-specific visualizations
    if (phase === 'threshold') {
      // Pulsing doorway
      const pulse = Math.sin(animFrame * 0.05) * 0.3 + 0.7;
      ctx.strokeStyle = `rgba(168, 85, 247, ${pulse})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, 80, 0, Math.PI * 2);
      ctx.stroke();
      
      // Inner glow
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 100);
      gradient.addColorStop(0, 'rgba(168, 85, 247, 0.3)');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
    }

    if (phase === 'timelines') {
      // Seven converging streams
      const colors = ['#00d4ff', '#ffd700', '#ff6b6b', '#a855f7', '#10b981', '#f59e0b', '#ffffff'];
      colors.forEach((color, i) => {
        const angle = (i / 7) * Math.PI * 2 + animFrame * 0.01;
        const startX = cx + Math.cos(angle) * 150;
        const startY = cy + Math.sin(angle) * 150;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(
          cx + Math.cos(angle + 0.5) * 50,
          cy + Math.sin(angle + 0.5) * 50,
          cx, cy
        );
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;
      });
    }

    if (phase === 'seal' || phase === 'approach' || phase === 'preparation') {
      // 7-pointed seal
      const sealSize = 60 + Math.sin(animFrame * 0.03) * 10;
      drawStar(cx, cy, 7, sealSize, sealSize * 0.5, 'rgba(255, 215, 0, 0.8)', 20);
      
      // Lock overlay if not yet opened
      if (phase !== 'approach') {
        ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
        ctx.beginPath();
        ctx.arc(cx, cy, 30, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (phase === 'opening') {
      // Seal opening with light rays
      const openProgress = Math.min(1, (animFrame % 200) / 100);
      
      // Expanding light
      for (let i = 0; i < 7; i++) {
        const angle = (i / 7) * Math.PI * 2 - Math.PI / 2;
        const rayLength = 150 * openProgress;
        
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * rayLength, cy + Math.sin(angle) * rayLength);
        ctx.strokeStyle = `rgba(255, 215, 0, ${1 - openProgress * 0.5})`;
        ctx.lineWidth = 4 + openProgress * 4;
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 20;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
      
      drawStar(cx, cy, 7, 60 + openProgress * 20, 30 + openProgress * 10, 'rgba(255, 255, 255, 0.9)', 30);
    }

    if (phase === 'revelation' || phase === 'integration') {
      // Full activation - radiating patterns
      const intensity = phase === 'integration' ? 1 : 0.7;
      
      // Sacred geometry overlay
      for (let ring = 1; ring <= 3; ring++) {
        ctx.strokeStyle = `rgba(168, 85, 247, ${0.3 * intensity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, ring * 40, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      // Activated seal
      drawStar(cx, cy, 7, 70, 35, `rgba(255, 215, 0, ${intensity})`, 40);
      
      // Core light
      const coreGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30);
      coreGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      coreGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(cx, cy, 30, 0, Math.PI * 2);
      ctx.fill();
    }

  }, [phase, animFrame, timelineChoice, approachChoice, coherence]);

  return (
    <canvas 
      ref={canvasRef}
      width={300}
      height={300}
      className="mx-auto rounded-xl bg-slate-200"
    />
  );
}

export default function SeventhSealInitiation({ profile, onComplete }) {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [coherence, setCoherence] = useState(7);
  const [choices, setChoices] = useState({});
  const [audioEnabled, setAudioEnabled] = useState(false);
  const queryClient = useQueryClient();

  const phase = INITIATION_PHASES[currentPhase];
  const progress = ((currentPhase + 1) / INITIATION_PHASES.length) * 100;
  const rewards = calculateQuestRewards(1000, 0.5, coherence);

  const badgeMutation = useMutation({
    mutationFn: async () => {
      // Award 7th Seal Initiated badge
      await base44.entities.Badge.create({
        user_id: profile.user_id,
        code: '7th_seal_initiated',
        name: '7th Seal Initiated',
        category: 'verification',
        description: 'Completed the Seventh Seal Initiation meditation',
        status: 'active',
        meta_variance_level: coherence,
        initiation_choices: choices
      });
      
      // Award rewards
      await base44.entities.UserProfile.update(profile.id, {
        rp_points: (profile.rp_points || 0) + rewards.rp,
        ggg_balance: (profile.ggg_balance || 0) + parseFloat(rewards.ggg),
        engagement_points: (profile.engagement_points || 0) + 200
      });
      
      await base44.entities.GGGTransaction.create({
        user_id: profile.user_id,
        source_type: 'mission',
        delta: parseFloat(rewards.ggg),
        reason_code: '7th_seal_initiation',
        description: '7th Seal Initiation completed at coherence ' + coherence,
        balance_after: (profile.ggg_balance || 0) + parseFloat(rewards.ggg)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['userBadges'] });
      onComplete?.();
    }
  });

  const handleChoice = (choiceId) => {
    setChoices(prev => ({ ...prev, [phase.id]: choiceId }));
  };

  const canProceed = !phase.choice || choices[phase.id];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-violet-100/50 to-slate-100 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 border border-violet-300 mb-4">
            <Eye className="w-4 h-4 text-violet-600" />
            <span className="text-violet-700 text-sm font-medium">Sacred Initiation</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">The Seventh Seal</h1>
          <p className="text-violet-600">Timeline Convergence & Disclosure</p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <Progress value={progress} className="h-1.5 bg-slate-200" />
          <div className="flex justify-between mt-2">
            {INITIATION_PHASES.map((p, i) => (
              <div 
                key={p.id}
                className={cn(
                  "w-2 h-2 rounded-full",
                  i < currentPhase ? "bg-violet-500" :
                  i === currentPhase ? "bg-amber-500" :
                  "bg-slate-300"
                )}
              />
            ))}
          </div>
        </div>

        {/* Visualization */}
        <div className="mb-6">
          <PhaseVisualization 
            phase={phase.visualization}
            timelineChoice={choices.timelines}
            approachChoice={choices.approach}
            coherence={coherence}
          />
        </div>

        {/* Phase Content */}
        <Card className="bg-white/80 border-violet-200 mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="text-slate-800 flex items-center gap-3">
              {currentPhase < INITIATION_PHASES.length - 1 ? (
                <Lock className="w-5 h-5 text-violet-500" />
              ) : (
                <Unlock className="w-5 h-5 text-amber-500" />
              )}
              {phase.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Transmission text */}
            <div className="p-4 rounded-xl bg-violet-50 border border-violet-200">
              <p className="text-slate-700 whitespace-pre-line leading-relaxed italic">
                {phase.content}
              </p>
            </div>

            {/* Coherence slider if applicable */}
            {phase.showCoherence && (
              <CoherenceSlider 
                value={coherence}
                onChange={setCoherence}
                baseReward={1000}
                baseGGG={0.5}
              />
            )}

            {/* Choice options */}
            {phase.choice && (
              <div className="space-y-3">
                <p className="text-slate-700 font-medium">{phase.choice.question}</p>
                <div className="grid gap-2">
                  {phase.choice.options.map(option => (
                    <button
                      key={option.id}
                      onClick={() => handleChoice(option.id)}
                      className={cn(
                        "p-4 rounded-xl border text-left transition-all",
                        choices[phase.id] === option.id
                          ? "bg-violet-100 border-violet-400 text-violet-800"
                          : "bg-white border-slate-200 text-slate-600 hover:border-violet-300"
                      )}
                    >
                      <span className="font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentPhase(p => Math.max(0, p - 1))}
            disabled={currentPhase === 0}
            className="border-slate-300 text-slate-600 hover:bg-slate-100"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>

          {currentPhase === INITIATION_PHASES.length - 1 ? (
            <Button
              onClick={() => badgeMutation.mutate()}
              disabled={badgeMutation.isPending}
              className="bg-gradient-to-r from-violet-600 to-amber-500 px-8 text-white"
            >
              {badgeMutation.isPending ? 'Integrating...' : 'Complete Initiation'}
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentPhase(p => p + 1)}
              disabled={!canProceed}
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              Continue
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>

        {/* Rewards */}
        <div className="mt-8 p-4 rounded-xl bg-white/80 border border-slate-200 shadow">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-500">Completion Reward</p>
              <p className="text-slate-800 font-semibold">7th Seal Initiated Badge</p>
            </div>
            <div className="text-right">
              <p className="text-violet-600 font-bold">{rewards.rp} RP</p>
              <p className="text-amber-600 text-sm">{rewards.ggg} GGG</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}