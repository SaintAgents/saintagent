import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, Sparkles, AlertTriangle, TrendingUp, CheckCircle2, 
  Clock, Target, Zap, RefreshCw, ChevronRight, Calendar,
  ListOrdered, FileText, Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AIProjectAssistant({ project, tasks, onApplyPriorities }) {
  const [activeTab, setActiveTab] = useState('prioritize');
  const [aiResult, setAiResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const queryClient = useQueryClient();

  // AI Task Prioritization
  const prioritizeTasks = async () => {
    setIsAnalyzing(true);
    setAiResult(null);
    
    const taskSummary = tasks.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description || '',
      priority: t.priority,
      status: t.status,
      due_date: t.due_date,
      assignee: t.assignee_name
    }));

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a project management AI assistant. Analyze these tasks and provide smart prioritization recommendations.

PROJECT: ${project.title}
DESCRIPTION: ${project.description || 'No description'}
END DATE: ${project.end_date || 'Not set'}
BUDGET: $${project.budget || 0}

CURRENT TASKS:
${JSON.stringify(taskSummary, null, 2)}

Provide prioritization based on:
1. Deadline urgency (tasks due soon should be higher priority)
2. Dependencies (if a task seems like a blocker for others)
3. Impact on project goals
4. Current workload balance

Return a JSON response with prioritized task recommendations.`,
      response_json_schema: {
        type: "object",
        properties: {
          prioritized_tasks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                task_id: { type: "string" },
                task_title: { type: "string" },
                recommended_priority: { type: "string", enum: ["urgent", "high", "medium", "low"] },
                reason: { type: "string" },
                suggested_order: { type: "number" }
              }
            }
          },
          overall_recommendation: { type: "string" },
          critical_path_tasks: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    setAiResult({ type: 'prioritize', data: result });
    setIsAnalyzing(false);
  };

  // AI Status Report Generation
  const generateStatusReport = async () => {
    setIsAnalyzing(true);
    setAiResult(null);

    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
    const todoTasks = tasks.filter(t => t.status === 'todo').length;
    const reviewTasks = tasks.filter(t => t.status === 'review').length;
    const overdueTasks = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed');

    const taskDetails = tasks.map(t => ({
      title: t.title,
      status: t.status,
      priority: t.priority,
      due_date: t.due_date,
      assignee: t.assignee_name,
      is_overdue: t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
    }));

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a professional project status report.

PROJECT: ${project.title}
DESCRIPTION: ${project.description || 'No description'}
TARGET END DATE: ${project.end_date || 'Not set'}
BUDGET: $${project.budget || 0}

PROGRESS SUMMARY:
- Total Tasks: ${tasks.length}
- Completed: ${completedTasks} (${tasks.length > 0 ? Math.round(completedTasks/tasks.length*100) : 0}%)
- In Progress: ${inProgressTasks}
- In Review: ${reviewTasks}
- To Do: ${todoTasks}
- Overdue: ${overdueTasks.length}

TASK DETAILS:
${JSON.stringify(taskDetails, null, 2)}

Create a concise but comprehensive status report suitable for stakeholders.`,
      response_json_schema: {
        type: "object",
        properties: {
          executive_summary: { type: "string" },
          health_score: { type: "number", minimum: 0, maximum: 100 },
          health_status: { type: "string", enum: ["on_track", "at_risk", "behind", "ahead"] },
          key_accomplishments: { type: "array", items: { type: "string" } },
          current_focus_areas: { type: "array", items: { type: "string" } },
          blockers_and_concerns: { type: "array", items: { type: "string" } },
          next_milestones: { type: "array", items: { type: "string" } },
          team_workload_assessment: { type: "string" },
          timeline_assessment: { type: "string" }
        }
      }
    });

    setAiResult({ type: 'status', data: result });
    setIsAnalyzing(false);
  };

  // AI Risk Analysis
  const analyzeRisks = async () => {
    setIsAnalyzing(true);
    setAiResult(null);

    const taskDetails = tasks.map(t => ({
      title: t.title,
      status: t.status,
      priority: t.priority,
      due_date: t.due_date,
      assignee: t.assignee_name,
      days_until_due: t.due_date ? Math.ceil((new Date(t.due_date) - new Date()) / (1000 * 60 * 60 * 24)) : null
    }));

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Perform a risk analysis for this project and predict potential delays or issues.

PROJECT: ${project.title}
DESCRIPTION: ${project.description || 'No description'}
TARGET END DATE: ${project.end_date || 'Not set'}
BUDGET: $${project.budget || 0}
STAGE: ${project.stage || 'Not specified'}

TASKS:
${JSON.stringify(taskDetails, null, 2)}

Analyze for:
1. Schedule risks (overdue tasks, tight deadlines)
2. Resource risks (unassigned tasks, overloaded team members)
3. Scope risks (too many high-priority tasks)
4. Dependency risks (potential bottlenecks)

Provide actionable mitigation strategies.`,
      response_json_schema: {
        type: "object",
        properties: {
          overall_risk_level: { type: "string", enum: ["low", "medium", "high", "critical"] },
          risk_score: { type: "number", minimum: 0, maximum: 100 },
          delay_probability: { type: "number", minimum: 0, maximum: 100 },
          estimated_delay_days: { type: "number" },
          risks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                category: { type: "string" },
                description: { type: "string" },
                severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
                likelihood: { type: "string", enum: ["unlikely", "possible", "likely", "certain"] },
                impact: { type: "string" },
                mitigation: { type: "string" }
              }
            }
          },
          early_warning_signs: { type: "array", items: { type: "string" } },
          recommended_actions: { type: "array", items: { type: "string" } },
          contingency_plan: { type: "string" }
        }
      }
    });

    setAiResult({ type: 'risk', data: result });
    setIsAnalyzing(false);
  };

  const applyPrioritiesMutation = useMutation({
    mutationFn: async (priorities) => {
      await Promise.all(
        priorities.map(p => 
          base44.entities.ProjectTask.update(p.task_id, { 
            priority: p.recommended_priority,
            order: p.suggested_order 
          })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectTasks'] });
      onApplyPriorities?.();
    }
  });

  const getRiskColor = (level) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-amber-600 bg-amber-100';
      default: return 'text-emerald-600 bg-emerald-100';
    }
  };

  const getHealthColor = (status) => {
    switch (status) {
      case 'ahead': return 'text-emerald-600';
      case 'on_track': return 'text-green-600';
      case 'at_risk': return 'text-amber-600';
      case 'behind': return 'text-red-600';
      default: return 'text-slate-600';
    }
  };

  return (
    <div className="bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 rounded-xl border border-violet-200 dark:border-violet-800 p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-violet-600 text-white">
          <Brain className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">AI Project Assistant</h3>
          <p className="text-xs text-slate-500">Intelligent project management insights</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-3 mb-4">
          <TabsTrigger value="prioritize" className="gap-1 text-xs">
            <ListOrdered className="w-3 h-3" />
            Prioritize
          </TabsTrigger>
          <TabsTrigger value="status" className="gap-1 text-xs">
            <FileText className="w-3 h-3" />
            Status Report
          </TabsTrigger>
          <TabsTrigger value="risks" className="gap-1 text-xs">
            <Shield className="w-3 h-3" />
            Risk Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prioritize" className="space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            AI analyzes your tasks and recommends optimal prioritization based on deadlines, dependencies, and project goals.
          </p>
          <Button 
            onClick={prioritizeTasks} 
            disabled={isAnalyzing || tasks.length === 0}
            className="w-full bg-violet-600 hover:bg-violet-700"
          >
            {isAnalyzing ? (
              <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" /> Prioritize Tasks</>
            )}
          </Button>

          {aiResult?.type === 'prioritize' && aiResult.data && (
            <div className="mt-4 space-y-4">
              <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border">
                <p className="text-sm text-slate-700 dark:text-slate-300">{aiResult.data.overall_recommendation}</p>
              </div>

              {aiResult.data.critical_path_tasks?.length > 0 && (
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-1">
                    <Target className="w-4 h-4" /> Critical Path Tasks
                  </h4>
                  <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                    {aiResult.data.critical_path_tasks.map((task, i) => (
                      <li key={i} className="flex items-center gap-1">
                        <ChevronRight className="w-3 h-3" /> {task}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {aiResult.data.prioritized_tasks?.map((task, idx) => (
                    <div key={task.task_id} className="p-3 rounded-lg bg-white dark:bg-slate-800 border flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-slate-400">#{idx + 1}</span>
                          <span className="font-medium text-sm text-slate-900 dark:text-white">{task.task_title}</span>
                          <Badge className={cn(
                            "text-xs",
                            task.recommended_priority === 'urgent' && "bg-red-100 text-red-600",
                            task.recommended_priority === 'high' && "bg-amber-100 text-amber-600",
                            task.recommended_priority === 'medium' && "bg-blue-100 text-blue-600",
                            task.recommended_priority === 'low' && "bg-slate-100 text-slate-600"
                          )}>
                            {task.recommended_priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500">{task.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <Button 
                onClick={() => applyPrioritiesMutation.mutate(aiResult.data.prioritized_tasks)}
                disabled={applyPrioritiesMutation.isPending}
                className="w-full"
                variant="outline"
              >
                <Zap className="w-4 h-4 mr-2" />
                Apply Recommended Priorities
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="status" className="space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Generate a comprehensive status report suitable for stakeholders and team updates.
          </p>
          <Button 
            onClick={generateStatusReport} 
            disabled={isAnalyzing}
            className="w-full bg-violet-600 hover:bg-violet-700"
          >
            {isAnalyzing ? (
              <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
            ) : (
              <><FileText className="w-4 h-4 mr-2" /> Generate Report</>
            )}
          </Button>

          {aiResult?.type === 'status' && aiResult.data && (
            <ScrollArea className="h-[350px]">
              <div className="space-y-4 pr-2">
                {/* Health Score */}
                <div className="p-4 rounded-lg bg-white dark:bg-slate-800 border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-600">Project Health</span>
                    <Badge className={cn("capitalize", getHealthColor(aiResult.data.health_status))}>
                      {aiResult.data.health_status?.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={aiResult.data.health_score} className="flex-1 h-2" />
                    <span className="text-lg font-bold text-slate-900 dark:text-white">{aiResult.data.health_score}%</span>
                  </div>
                </div>

                {/* Executive Summary */}
                <div className="p-4 rounded-lg bg-white dark:bg-slate-800 border">
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Executive Summary</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{aiResult.data.executive_summary}</p>
                </div>

                {/* Key Accomplishments */}
                {aiResult.data.key_accomplishments?.length > 0 && (
                  <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                    <h4 className="text-sm font-medium text-emerald-800 dark:text-emerald-200 mb-2 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Key Accomplishments
                    </h4>
                    <ul className="text-sm text-emerald-700 dark:text-emerald-300 space-y-1">
                      {aiResult.data.key_accomplishments.map((item, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <ChevronRight className="w-3 h-3 mt-0.5 shrink-0" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Current Focus */}
                {aiResult.data.current_focus_areas?.length > 0 && (
                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-1">
                      <Target className="w-4 h-4" /> Current Focus
                    </h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      {aiResult.data.current_focus_areas.map((item, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <ChevronRight className="w-3 h-3 mt-0.5 shrink-0" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Blockers */}
                {aiResult.data.blockers_and_concerns?.length > 0 && (
                  <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" /> Blockers & Concerns
                    </h4>
                    <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                      {aiResult.data.blockers_and_concerns.map((item, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <ChevronRight className="w-3 h-3 mt-0.5 shrink-0" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Timeline & Workload */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border">
                    <h4 className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Timeline
                    </h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300">{aiResult.data.timeline_assessment}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border">
                    <h4 className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> Workload
                    </h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300">{aiResult.data.team_workload_assessment}</p>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="risks" className="space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Identify potential risks, predict delays, and get actionable mitigation strategies.
          </p>
          <Button 
            onClick={analyzeRisks} 
            disabled={isAnalyzing}
            className="w-full bg-violet-600 hover:bg-violet-700"
          >
            {isAnalyzing ? (
              <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
            ) : (
              <><Shield className="w-4 h-4 mr-2" /> Analyze Risks</>
            )}
          </Button>

          {aiResult?.type === 'risk' && aiResult.data && (
            <ScrollArea className="h-[350px]">
              <div className="space-y-4 pr-2">
                {/* Risk Overview */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border text-center">
                    <div className="text-xs text-slate-500 mb-1">Risk Level</div>
                    <Badge className={cn("capitalize", getRiskColor(aiResult.data.overall_risk_level))}>
                      {aiResult.data.overall_risk_level}
                    </Badge>
                  </div>
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border text-center">
                    <div className="text-xs text-slate-500 mb-1">Delay Probability</div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white">{aiResult.data.delay_probability}%</div>
                  </div>
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border text-center">
                    <div className="text-xs text-slate-500 mb-1">Est. Delay</div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white">{aiResult.data.estimated_delay_days} days</div>
                  </div>
                </div>

                {/* Early Warning Signs */}
                {aiResult.data.early_warning_signs?.length > 0 && (
                  <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" /> Early Warning Signs
                    </h4>
                    <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                      {aiResult.data.early_warning_signs.map((item, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <ChevronRight className="w-3 h-3 mt-0.5 shrink-0" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Individual Risks */}
                {aiResult.data.risks?.map((risk, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-white dark:bg-slate-800 border">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="capitalize">{risk.category}</Badge>
                      <div className="flex gap-2">
                        <Badge className={getRiskColor(risk.severity)}>{risk.severity}</Badge>
                        <Badge variant="outline" className="capitalize">{risk.likelihood}</Badge>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">{risk.description}</p>
                    <p className="text-xs text-slate-500 mb-2"><strong>Impact:</strong> {risk.impact}</p>
                    <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-900/20">
                      <p className="text-xs text-emerald-700 dark:text-emerald-300">
                        <strong>Mitigation:</strong> {risk.mitigation}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Recommended Actions */}
                {aiResult.data.recommended_actions?.length > 0 && (
                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-1">
                      <Zap className="w-4 h-4" /> Recommended Actions
                    </h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      {aiResult.data.recommended_actions.map((item, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <ChevronRight className="w-3 h-3 mt-0.5 shrink-0" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Contingency Plan */}
                {aiResult.data.contingency_plan && (
                  <div className="p-4 rounded-lg bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800">
                    <h4 className="text-sm font-medium text-violet-800 dark:text-violet-200 mb-2">Contingency Plan</h4>
                    <p className="text-sm text-violet-700 dark:text-violet-300">{aiResult.data.contingency_plan}</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}