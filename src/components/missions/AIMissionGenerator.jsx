import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sparkles,
  Loader2,
  Target,
  Coins,
  TrendingUp,
  Zap,
  Copy,
  Check,
  Lightbulb,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

const EXAMPLE_TOPICS = [
  "Improve local recycling rates",
  "Promote renewable energy education",
  "Support mental health awareness",
  "Build community gardens",
  "Reduce food waste in restaurants",
  "Teach digital literacy to seniors"
];

export default function AIMissionGenerator({ open, onClose, onUseMission }) {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMissions, setGeneratedMissions] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const generateMissions = async () => {
    if (!topic.trim()) return;
    
    setIsGenerating(true);
    setGeneratedMissions(null);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a mission design expert for a conscious community platform focused on spiritual growth, sustainability, and positive impact.

IMPORTANT: GGG is a gold-backed currency where 1 GGG = $145 USD (1 gram of gold).

Generate 3 creative and actionable mission ideas based on this topic/goal: "${topic}"

For each mission, provide:
1. A compelling title (short, action-oriented)
2. A clear objective (1-2 sentences)
3. A detailed description (2-3 sentences explaining the mission and its impact)
4. 3-5 specific tasks that participants should complete
5. Suggested rewards (scale appropriately - most missions should be $80-200 USD worth):
   - GGG tokens: Use these ranges based on effort level:
     * Simple tasks (1-2 hours): 0.1-0.3 GGG ($14.50-$43.50)
     * Medium tasks (half day): 0.3-0.7 GGG ($43.50-$101.50)
     * Large missions (full day+): 0.7-1.4 GGG ($101.50-$203)
   - Rank Points (5-50 based on impact)
   - Boost multiplier (1.5x-3x for exceptional missions, or 0 for none)
6. Recommended mission type: platform, circle, region, or leader
7. Suggested roles needed (1-3 roles like "Coordinator", "Researcher", "Outreach Specialist")

Make missions achievable, impactful, and aligned with values of community, sustainability, and conscious growth.`,
        response_json_schema: {
          type: "object",
          properties: {
            missions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  objective: { type: "string" },
                  description: { type: "string" },
                  tasks: { type: "array", items: { type: "string" } },
                  reward_ggg: { type: "number" },
                  reward_rank_points: { type: "number" },
                  reward_boost: { type: "number" },
                  mission_type: { type: "string" },
                  roles_needed: { type: "array", items: { type: "string" } }
                }
              }
            }
          }
        }
      });

      setGeneratedMissions(response.missions || []);
    } catch (error) {
      console.error('Error generating missions:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (mission, index) => {
    const text = `Title: ${mission.title}\nObjective: ${mission.objective}\nDescription: ${mission.description}\nTasks: ${mission.tasks.join(', ')}\nRewards: ${mission.reward_ggg} GGG, ${mission.reward_rank_points} RP`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleUseMission = (mission) => {
    onUseMission?.(mission);
    onClose();
  };

  const handleClose = () => {
    setTopic('');
    setGeneratedMissions(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            AI Mission Generator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Input Section */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700">
              What goal or topic would you like to create a mission around?
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Improve local recycling rates, Promote renewable energy..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && generateMissions()}
                className="flex-1"
              />
              <Button
                onClick={generateMissions}
                disabled={!topic.trim() || isGenerating}
                className="bg-violet-600 hover:bg-violet-700 gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Ideas
                  </>
                )}
              </Button>
            </div>

            {/* Example Topics */}
            {!generatedMissions && (
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" />
                  Try:
                </span>
                {EXAMPLE_TOPICS.map((example, i) => (
                  <button
                    key={i}
                    onClick={() => setTopic(example)}
                    className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-violet-100 hover:text-violet-700 transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Loading State */}
          {isGenerating && (
            <div className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-violet-100 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
              </div>
              <p className="text-slate-600">Crafting mission ideas...</p>
              <p className="text-sm text-slate-400 mt-1">This may take a few seconds</p>
            </div>
          )}

          {/* Generated Missions */}
          {generatedMissions && generatedMissions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Generated Mission Ideas</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateMissions}
                  disabled={isGenerating}
                  className="gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Regenerate
                </Button>
              </div>

              <div className="space-y-4">
                {generatedMissions.map((mission, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={cn(
                            "text-xs",
                            mission.mission_type === 'platform' && "bg-violet-100 text-violet-700",
                            mission.mission_type === 'circle' && "bg-blue-100 text-blue-700",
                            mission.mission_type === 'region' && "bg-emerald-100 text-emerald-700",
                            mission.mission_type === 'leader' && "bg-amber-100 text-amber-700"
                          )}>
                            {mission.mission_type}
                          </Badge>
                          <h4 className="font-semibold text-slate-900">{mission.title}</h4>
                        </div>
                        
                        <p className="text-sm text-slate-600 mb-2">{mission.objective}</p>
                        <p className="text-sm text-slate-500 mb-3">{mission.description}</p>

                        {/* Tasks */}
                        <div className="mb-3">
                          <p className="text-xs font-medium text-slate-500 mb-1.5">Tasks:</p>
                          <ul className="space-y-1">
                            {mission.tasks?.map((task, ti) => (
                              <li key={ti} className="text-sm text-slate-600 flex items-start gap-2">
                                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-xs flex items-center justify-center shrink-0 mt-0.5">
                                  {ti + 1}
                                </span>
                                {task}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Roles */}
                        {mission.roles_needed?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {mission.roles_needed.map((role, ri) => (
                              <Badge key={ri} variant="outline" className="text-xs">
                                {role}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Rewards */}
                        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-amber-50 border border-amber-100">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          <div className="flex items-center gap-3 text-sm">
                            {mission.reward_ggg > 0 && (
                              <span className="flex items-center gap-1 font-medium text-amber-700">
                                <Coins className="w-3.5 h-3.5" />
                                {mission.reward_ggg} GGG
                              </span>
                            )}
                            {mission.reward_rank_points > 0 && (
                              <span className="flex items-center gap-1 font-medium text-violet-700">
                                <TrendingUp className="w-3.5 h-3.5" />
                                {mission.reward_rank_points} RP
                              </span>
                            )}
                            {mission.reward_boost > 0 && (
                              <span className="flex items-center gap-1 font-medium text-blue-700">
                                <Zap className="w-3.5 h-3.5" />
                                {mission.reward_boost}x Boost
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(mission, index)}
                        className="gap-1.5"
                      >
                        {copiedIndex === index ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copy
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleUseMission(mission)}
                        className="bg-violet-600 hover:bg-violet-700 gap-1.5"
                      >
                        Use This Mission
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}