import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  AlertTriangle,
  Lightbulb,
  UserCheck,
  TrendingUp,
  RefreshCw,
  Loader2,
  CheckCircle2,
  Clock,
  Target,
  Zap,
  Shield,
  ChevronRight
} from "lucide-react";

export default function AIMissionCopilot({ mission, participants, currentProfile }) {
  const [activeTab, setActiveTab] = useState('insights');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  // Fetch all profiles for skill matching
  const { data: allProfiles = [] } = useQuery({
    queryKey: ['allProfiles'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 100)
  });

  const runAnalysis = async () => {
    if (!mission) return;
    setIsAnalyzing(true);

    const completedTasks = mission.tasks?.filter(t => t.completed).length || 0;
    const totalTasks = mission.tasks?.length || 0;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Calculate days remaining
    const now = new Date();
    const endDate = mission.end_time ? new Date(mission.end_time) : null;
    const daysRemaining = endDate ? Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)) : null;

    // Participant skills aggregation
    const participantSkills = participants.flatMap(p => p.skills || []);
    const rolesNeeded = mission.roles_needed || [];

    const prompt = `You are an AI Mission Co-pilot for a collaborative platform. Analyze this mission and provide actionable insights.

MISSION DATA:
- Title: ${mission.title}
- Objective: ${mission.objective}
- Description: ${mission.description || 'No description'}
- Status: ${mission.status}
- Type: ${mission.mission_type}
- Progress: ${progress}% (${completedTasks}/${totalTasks} tasks completed)
- Days Remaining: ${daysRemaining !== null ? daysRemaining : 'No deadline set'}
- Current Participants: ${participants.length}
- Max Participants: ${mission.max_participants || 'No limit'}
- Roles Needed: ${rolesNeeded.join(', ') || 'None specified'}
- Participant Skills: ${participantSkills.join(', ') || 'Unknown'}
- Rewards: ${mission.reward_ggg || 0} GGG, ${mission.reward_rank_points || 0} RP, ${mission.reward_boost || 0}x Boost

TASKS:
${mission.tasks?.map((t, i) => `${i + 1}. [${t.completed ? 'DONE' : 'PENDING'}] ${t.title}`).join('\n') || 'No tasks defined'}

${currentProfile ? `
CURRENT USER PROFILE:
- Name: ${currentProfile.display_name}
- Skills: ${currentProfile.skills?.join(', ') || 'None listed'}
- Intentions: ${currentProfile.intentions?.join(', ') || 'None listed'}
- Values: ${currentProfile.values_tags?.join(', ') || 'None listed'}
` : ''}

Provide a comprehensive analysis with:

1. **Progress Insights** (2-3 actionable insights about mission progress, velocity, and what's working/not working)

2. **Risk Assessment** (identify 2-3 potential risks or blockers, rate severity as high/medium/low, and suggest mitigations)

3. **Personalized Task Recommendations** (3 specific task recommendations for the current user based on their skills and the mission needs)

4. **Team Optimization** (suggestions for skill gaps, collaboration opportunities, or role assignments)

5. **Quick Wins** (2-3 immediate actions that could accelerate progress)

Be specific, actionable, and encouraging. Use the mission context to provide relevant advice.`;

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            progress_insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  impact: { type: "string", enum: ["positive", "neutral", "attention_needed"] }
                }
              }
            },
            risks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  severity: { type: "string", enum: ["high", "medium", "low"] },
                  mitigation: { type: "string" }
                }
              }
            },
            task_recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  task: { type: "string" },
                  reason: { type: "string" },
                  skill_match: { type: "string" }
                }
              }
            },
            team_optimization: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  suggestion: { type: "string" },
                  details: { type: "string" }
                }
              }
            },
            quick_wins: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  expected_outcome: { type: "string" }
                }
              }
            },
            overall_health: {
              type: "string",
              enum: ["excellent", "good", "attention_needed", "at_risk"]
            },
            summary: { type: "string" }
          }
        }
      });

      setAnalysis(response);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-run analysis on mount
  useEffect(() => {
    if (mission && !analysis && !isAnalyzing) {
      runAnalysis();
    }
  }, [mission?.id]);

  const getHealthColor = (health) => {
    switch (health) {
      case 'excellent': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'attention_needed': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'at_risk': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getImpactIcon = (impact) => {
    switch (impact) {
      case 'positive': return <TrendingUp className="w-4 h-4 text-emerald-500" />;
      case 'attention_needed': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default: return <Target className="w-4 h-4 text-slate-400" />;
    }
  };

  if (isAnalyzing) {
    return (
      <Card className="border-violet-200">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="relative mb-4">
              <Brain className="w-12 h-12 text-violet-500" />
              <div className="absolute -top-1 -right-1">
                <Loader2 className="w-5 h-5 text-violet-600 animate-spin" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Analyzing Mission...</h3>
            <p className="text-sm text-slate-500">
              AI Co-pilot is evaluating progress, identifying risks, and preparing recommendations
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className="border-violet-200">
        <CardContent className="p-6 text-center">
          <Brain className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">AI Mission Co-pilot</h3>
          <p className="text-sm text-slate-500 mb-4">
            Get AI-powered insights, risk analysis, and personalized recommendations
          </p>
          <Button onClick={runAnalysis} className="bg-violet-600 hover:bg-violet-700 gap-2">
            <Brain className="w-4 h-4" />
            Analyze Mission
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-violet-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Mission Co-pilot</CardTitle>
              <p className="text-sm text-slate-500">Real-time mission intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={cn("capitalize", getHealthColor(analysis.overall_health))}>
              {analysis.overall_health?.replace('_', ' ')}
            </Badge>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={runAnalysis}
              disabled={isAnalyzing}
              className="gap-1"
            >
              <RefreshCw className={cn("w-4 h-4", isAnalyzing && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>
        {analysis.summary && (
          <p className="text-sm text-slate-600 mt-3 p-3 bg-slate-50 rounded-lg">
            {analysis.summary}
          </p>
        )}
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-4 mb-4">
            <TabsTrigger value="insights" className="text-xs gap-1">
              <Lightbulb className="w-3.5 h-3.5" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="risks" className="text-xs gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Risks
              {analysis.risks?.filter(r => r.severity === 'high').length > 0 && (
                <span className="ml-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                  {analysis.risks.filter(r => r.severity === 'high').length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="tasks" className="text-xs gap-1">
              <UserCheck className="w-3.5 h-3.5" />
              For You
            </TabsTrigger>
            <TabsTrigger value="wins" className="text-xs gap-1">
              <Zap className="w-3.5 h-3.5" />
              Quick Wins
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[320px]">
            <TabsContent value="insights" className="mt-0 space-y-3">
              {analysis.progress_insights?.map((insight, i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-start gap-3">
                    {getImpactIcon(insight.impact)}
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-slate-900">{insight.title}</h4>
                      <p className="text-sm text-slate-600 mt-1">{insight.description}</p>
                    </div>
                  </div>
                </div>
              ))}

              {analysis.team_optimization?.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Team Optimization
                  </h4>
                  {analysis.team_optimization.map((opt, i) => (
                    <div key={i} className="p-3 rounded-lg bg-violet-50 border border-violet-100 mb-2">
                      <h5 className="font-medium text-sm text-violet-900">{opt.suggestion}</h5>
                      <p className="text-sm text-violet-700 mt-1">{opt.details}</p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="risks" className="mt-0 space-y-3">
              {analysis.risks?.length === 0 ? (
                <div className="text-center py-6">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No significant risks detected</p>
                </div>
              ) : (
                analysis.risks?.map((risk, i) => (
                  <div key={i} className={cn("p-3 rounded-lg border", getSeverityColor(risk.severity))}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        <h4 className="font-medium text-sm">{risk.title}</h4>
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">
                        {risk.severity}
                      </Badge>
                    </div>
                    <p className="text-sm opacity-90 mb-2">{risk.description}</p>
                    <div className="flex items-start gap-2 p-2 rounded bg-white/50">
                      <Shield className="w-4 h-4 mt-0.5 shrink-0" />
                      <p className="text-xs"><strong>Mitigation:</strong> {risk.mitigation}</p>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="tasks" className="mt-0 space-y-3">
              <div className="p-3 bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg border border-violet-100 mb-4">
                <p className="text-sm text-violet-800">
                  <strong>Personalized for you:</strong> Based on your skills and the mission's needs
                </p>
              </div>
              {analysis.task_recommendations?.map((rec, i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-50 border border-slate-100 hover:border-violet-200 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-full bg-violet-100">
                      <ChevronRight className="w-4 h-4 text-violet-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-slate-900">{rec.task}</h4>
                      <p className="text-sm text-slate-600 mt-1">{rec.reason}</p>
                      {rec.skill_match && (
                        <Badge variant="outline" className="mt-2 text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                          Skill Match: {rec.skill_match}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="wins" className="mt-0 space-y-3">
              <div className="p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-100 mb-4">
                <p className="text-sm text-amber-800">
                  <strong>Quick wins:</strong> Immediate actions to accelerate mission progress
                </p>
              </div>
              {analysis.quick_wins?.map((win, i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-50 border border-slate-100 hover:border-amber-200 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-full bg-amber-100">
                      <Zap className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-slate-900">{win.action}</h4>
                      <p className="text-sm text-slate-600 mt-1">
                        <strong>Expected outcome:</strong> {win.expected_outcome}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
}