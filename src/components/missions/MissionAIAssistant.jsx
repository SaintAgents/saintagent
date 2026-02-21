import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Sparkles, Loader2, Wand2, Target, ListTodo, Users, 
  ChevronRight, Check, RefreshCw, Lightbulb
} from "lucide-react";

export default function MissionAIAssistant({ 
  title, 
  description, 
  onApplySuggestions,
  disabled 
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [error, setError] = useState(null);
  const [appliedSections, setAppliedSections] = useState([]);

  const generateSuggestions = async () => {
    if (!title.trim()) {
      setError('Please enter a mission title first');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuggestions(null);
    setAppliedSections([]);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert mission designer for a community collaboration platform. Based on the mission title and description provided, generate comprehensive suggestions including:

1. A clear, actionable objective statement
2. An enhanced description (2-3 sentences)
3. 3-5 milestones that break down the mission into phases
4. For each milestone, suggest 2-4 specific tasks
5. Suggested roles needed for this mission (2-4 roles)
6. Recommended reward structure

Mission Title: ${title}
${description ? `Description: ${description}` : ''}

Generate practical, achievable milestones and tasks that would help someone successfully complete this mission.`,
        response_json_schema: {
          type: 'object',
          properties: {
            objective: { type: 'string', description: 'Clear objective statement' },
            enhanced_description: { type: 'string', description: 'Enhanced 2-3 sentence description' },
            milestones: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  tasks: {
                    type: 'array',
                    items: { type: 'string' }
                  }
                }
              }
            },
            roles_needed: {
              type: 'array',
              items: { type: 'string' }
            },
            suggested_rewards: {
              type: 'object',
              properties: {
                ggg: { type: 'number' },
                rank_points: { type: 'number' },
                reasoning: { type: 'string' }
              }
            }
          }
        }
      });

      setSuggestions(result);
    } catch (err) {
      console.error('AI generation failed:', err);
      setError('Failed to generate suggestions. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const applySuggestion = (section) => {
    if (!suggestions) return;
    
    const updates = {};
    
    switch (section) {
      case 'objective':
        updates.objective = suggestions.objective;
        break;
      case 'description':
        updates.description = suggestions.enhanced_description;
        break;
      case 'milestones':
        updates.milestones = suggestions.milestones.map((m, idx) => ({
          id: `ai-${Date.now()}-${idx}`,
          title: m.title,
          description: m.description,
          order: idx,
          completed: false,
          tasks: m.tasks.map((t, tIdx) => ({
            id: `task-${Date.now()}-${idx}-${tIdx}`,
            title: t,
            completed: false
          }))
        }));
        break;
      case 'roles':
        updates.roles_needed = suggestions.roles_needed;
        break;
      case 'rewards':
        updates.reward_ggg = suggestions.suggested_rewards.ggg;
        updates.reward_rank_points = suggestions.suggested_rewards.rank_points;
        break;
    }

    onApplySuggestions(updates);
    setAppliedSections([...appliedSections, section]);
  };

  const applyAll = () => {
    if (!suggestions) return;
    
    onApplySuggestions({
      objective: suggestions.objective,
      description: suggestions.enhanced_description,
      milestones: suggestions.milestones.map((m, idx) => ({
        id: `ai-${Date.now()}-${idx}`,
        title: m.title,
        description: m.description,
        order: idx,
        completed: false,
        tasks: m.tasks.map((t, tIdx) => ({
          id: `task-${Date.now()}-${idx}-${tIdx}`,
          title: t,
          completed: false
        }))
      })),
      roles_needed: suggestions.roles_needed,
      reward_ggg: suggestions.suggested_rewards.ggg,
      reward_rank_points: suggestions.suggested_rewards.rank_points
    });
    setAppliedSections(['objective', 'description', 'milestones', 'roles', 'rewards']);
  };

  const isApplied = (section) => appliedSections.includes(section);

  return (
    <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="p-1.5 rounded-lg bg-violet-100">
            <Sparkles className="w-4 h-4 text-violet-600" />
          </div>
          AI Mission Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!suggestions ? (
          <>
            <p className="text-sm text-slate-600">
              Let AI help you design your mission with suggested objectives, milestones, tasks, and reward structures.
            </p>
            {error && (
              <Alert variant="destructive" className="py-2">
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}
            <Button
              type="button"
              onClick={generateSuggestions}
              disabled={disabled || isGenerating || !title.trim()}
              className="w-full bg-violet-600 hover:bg-violet-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating suggestions...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate Mission Plan
                </>
              )}
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            {/* Apply All Button */}
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="gap-1">
                <Lightbulb className="w-3 h-3" />
                AI Suggestions Ready
              </Badge>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => { setSuggestions(null); setAppliedSections([]); }}
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Regenerate
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={applyAll}
                  disabled={appliedSections.length === 5}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Apply All
                </Button>
              </div>
            </div>

            {/* Objective */}
            <div className="p-3 rounded-lg bg-white border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium">Objective</span>
                </div>
                <Button
                  type="button"
                  variant={isApplied('objective') ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => applySuggestion('objective')}
                  disabled={isApplied('objective')}
                  className="h-7 text-xs"
                >
                  {isApplied('objective') ? <Check className="w-3 h-3 mr-1" /> : <ChevronRight className="w-3 h-3 mr-1" />}
                  {isApplied('objective') ? 'Applied' : 'Apply'}
                </Button>
              </div>
              <p className="text-sm text-slate-600">{suggestions.objective}</p>
            </div>

            {/* Description */}
            <div className="p-3 rounded-lg bg-white border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Enhanced Description</span>
                </div>
                <Button
                  type="button"
                  variant={isApplied('description') ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => applySuggestion('description')}
                  disabled={isApplied('description')}
                  className="h-7 text-xs"
                >
                  {isApplied('description') ? <Check className="w-3 h-3 mr-1" /> : <ChevronRight className="w-3 h-3 mr-1" />}
                  {isApplied('description') ? 'Applied' : 'Apply'}
                </Button>
              </div>
              <p className="text-sm text-slate-600">{suggestions.enhanced_description}</p>
            </div>

            {/* Milestones */}
            <div className="p-3 rounded-lg bg-white border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ListTodo className="w-4 h-4 text-violet-500" />
                  <span className="text-sm font-medium">Milestones ({suggestions.milestones.length})</span>
                </div>
                <Button
                  type="button"
                  variant={isApplied('milestones') ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => applySuggestion('milestones')}
                  disabled={isApplied('milestones')}
                  className="h-7 text-xs"
                >
                  {isApplied('milestones') ? <Check className="w-3 h-3 mr-1" /> : <ChevronRight className="w-3 h-3 mr-1" />}
                  {isApplied('milestones') ? 'Applied' : 'Apply'}
                </Button>
              </div>
              <div className="space-y-2">
                {suggestions.milestones.map((m, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-600 text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{m.title}</p>
                      <p className="text-xs text-slate-500">{m.tasks.length} tasks</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Roles */}
            <div className="p-3 rounded-lg bg-white border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-medium">Suggested Roles</span>
                </div>
                <Button
                  type="button"
                  variant={isApplied('roles') ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => applySuggestion('roles')}
                  disabled={isApplied('roles')}
                  className="h-7 text-xs"
                >
                  {isApplied('roles') ? <Check className="w-3 h-3 mr-1" /> : <ChevronRight className="w-3 h-3 mr-1" />}
                  {isApplied('roles') ? 'Applied' : 'Apply'}
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {suggestions.roles_needed.map((role, idx) => (
                  <Badge key={idx} variant="secondary">{role}</Badge>
                ))}
              </div>
            </div>

            {/* Rewards */}
            <div className="p-3 rounded-lg bg-white border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium">Suggested Rewards</span>
                </div>
                <Button
                  type="button"
                  variant={isApplied('rewards') ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => applySuggestion('rewards')}
                  disabled={isApplied('rewards')}
                  className="h-7 text-xs"
                >
                  {isApplied('rewards') ? <Check className="w-3 h-3 mr-1" /> : <ChevronRight className="w-3 h-3 mr-1" />}
                  {isApplied('rewards') ? 'Applied' : 'Apply'}
                </Button>
              </div>
              <div className="flex gap-4 text-sm">
                <span className="text-amber-600 font-medium">{suggestions.suggested_rewards.ggg} GGG</span>
                <span className="text-violet-600 font-medium">{suggestions.suggested_rewards.rank_points} RP</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{suggestions.suggested_rewards.reasoning}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}