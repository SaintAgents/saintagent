import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Shield, AlertTriangle, CheckCircle, XCircle, HelpCircle, 
  Brain, TrendingUp, Target, Users, Leaf, Scale, Lightbulb,
  FileText, Clock, Loader2, ChevronRight, AlertCircle, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TIER_CONFIG = {
  approve_fund: { label: 'Approve & Fund', color: 'emerald', icon: CheckCircle },
  incubate_derisk: { label: 'Incubate & De-Risk', color: 'amber', icon: TrendingUp },
  review_reevaluate: { label: 'Review & Re-evaluate', color: 'blue', icon: HelpCircle },
  decline: { label: 'Decline', color: 'rose', icon: XCircle }
};

const RISK_GRADE_COLORS = {
  A: 'bg-emerald-100 text-emerald-700',
  B: 'bg-green-100 text-green-700',
  C: 'bg-amber-100 text-amber-700',
  D: 'bg-orange-100 text-orange-700',
  F: 'bg-rose-100 text-rose-700'
};

const PHASE1_RESULT_CONFIG = {
  pass: { label: 'PASS', color: 'emerald', icon: CheckCircle },
  fail: { label: 'FAIL', color: 'rose', icon: XCircle },
  uncertain: { label: 'UNCERTAIN', color: 'amber', icon: HelpCircle },
  pending: { label: 'PENDING', color: 'slate', icon: Clock }
};

export default function ProjectEvaluationPanel({ project, onUpdate }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [overrideReason, setOverrideReason] = useState('');
  const queryClient = useQueryClient();

  const { data: evaluations = [] } = useQuery({
    queryKey: ['projectEvaluations', project.id],
    queryFn: () => base44.entities.ProjectEvaluation.filter({ project_id: project.id }, '-created_date'),
    enabled: !!project.id
  });

  const { data: auditLogs = [] } = useQuery({
    queryKey: ['evaluationAuditLogs', project.id],
    queryFn: () => base44.entities.EvaluationAuditLog.filter({ project_id: project.id }, '-created_date'),
    enabled: !!project.id
  });

  const runEvaluationMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('evaluateProject', { project_id: project.id });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectEvaluations', project.id] });
      queryClient.invalidateQueries({ queryKey: ['evaluationAuditLogs', project.id] });
      onUpdate?.();
    }
  });

  const latestEvaluation = evaluations[0];
  const phase1Result = project.phase1_result || 'pending';
  const phase1Config = PHASE1_RESULT_CONFIG[phase1Result];
  const Phase1Icon = phase1Config?.icon || Clock;

  const tierConfig = project.decision_tier ? TIER_CONFIG[project.decision_tier] : null;
  const TierIcon = tierConfig?.icon || HelpCircle;

  // Calculate category scores from subcriteria
  const calculateCategoryScore = (scores, subcriteria) => {
    if (!scores) return 0;
    let total = 0;
    let count = 0;
    subcriteria.forEach(key => {
      if (scores[key]?.score) {
        total += scores[key].score;
        count++;
      }
    });
    return count > 0 ? (total / count).toFixed(1) : 0;
  };

  const impactScore = calculateCategoryScore(project.phase2_scores, ['planetary_wellbeing', 'human_wellbeing']);
  const regenerativeScore = calculateCategoryScore(project.phase2_scores, ['regenerative_potential', 'ethical_governance']);
  const feasibilityScore = calculateCategoryScore(project.phase2_scores, ['cost_effectiveness', 'scalability_model']);
  const teamScore = calculateCategoryScore(project.phase2_scores, ['expertise_track_record', 'community_integration']);
  const innovationScore = calculateCategoryScore(project.phase2_scores, ['innovation', 'replicability']);

  return (
    <div className="space-y-6">
      {/* Header with Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Phase 1 Result */}
        <div className={cn(
          "p-3 rounded-xl border",
          phase1Result === 'pass' && "bg-emerald-50 border-emerald-200",
          phase1Result === 'fail' && "bg-rose-50 border-rose-200",
          phase1Result === 'uncertain' && "bg-amber-50 border-amber-200",
          phase1Result === 'pending' && "bg-slate-50 border-slate-200"
        )}>
          <div className="text-xs text-slate-500 mb-1">Phase 1: Ethics</div>
          <div className="flex items-center gap-2">
            <Phase1Icon className={cn(
              "w-5 h-5",
              phase1Result === 'pass' && "text-emerald-600",
              phase1Result === 'fail' && "text-rose-600",
              phase1Result === 'uncertain' && "text-amber-600",
              phase1Result === 'pending' && "text-slate-400"
            )} />
            <span className="font-bold">{phase1Config?.label}</span>
          </div>
        </div>

        {/* Base Score */}
        <div className="p-3 rounded-xl bg-violet-50 border border-violet-200">
          <div className="text-xs text-slate-500 mb-1">Base Score</div>
          <div className="text-2xl font-bold text-violet-700">
            {project.phase2_base_score?.toFixed(0) || '—'}
          </div>
        </div>

        {/* Final Score */}
        <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200">
          <div className="text-xs text-slate-500 mb-1">Final Score</div>
          <div className="text-2xl font-bold text-indigo-700">
            {project.final_score?.toFixed(0) || '—'}
          </div>
        </div>

        {/* Risk Grade */}
        <div className={cn(
          "p-3 rounded-xl border",
          project.phase3_risk_grade ? RISK_GRADE_COLORS[project.phase3_risk_grade] : "bg-slate-50"
        )}>
          <div className="text-xs text-slate-500 mb-1">Risk Grade</div>
          <div className="text-2xl font-bold">
            {project.phase3_risk_grade || '—'}
          </div>
        </div>

        {/* Confidence */}
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
          <div className="text-xs text-slate-500 mb-1">Confidence</div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-700">
              {project.phase2_confidence?.toFixed(0) || '—'}%
            </span>
          </div>
        </div>
      </div>

      {/* Decision Tier Banner */}
      {tierConfig && (
        <div className={cn(
          "p-4 rounded-xl border-2 flex items-center justify-between",
          tierConfig.color === 'emerald' && "bg-emerald-50 border-emerald-300",
          tierConfig.color === 'amber' && "bg-amber-50 border-amber-300",
          tierConfig.color === 'blue' && "bg-blue-50 border-blue-300",
          tierConfig.color === 'rose' && "bg-rose-50 border-rose-300"
        )}>
          <div className="flex items-center gap-3">
            <TierIcon className={cn(
              "w-8 h-8",
              tierConfig.color === 'emerald' && "text-emerald-600",
              tierConfig.color === 'amber' && "text-amber-600",
              tierConfig.color === 'blue' && "text-blue-600",
              tierConfig.color === 'rose' && "text-rose-600"
            )} />
            <div>
              <div className="font-bold text-lg">{tierConfig.label}</div>
              <div className="text-sm text-slate-600">
                {project.decision_tier === 'approve_fund' && 'Project recommended for funding'}
                {project.decision_tier === 'incubate_derisk' && 'Project needs support to address risks'}
                {project.decision_tier === 'review_reevaluate' && 'Additional information required'}
                {project.decision_tier === 'decline' && 'Project does not meet criteria'}
              </div>
            </div>
          </div>
          {project.ai_evaluated_at && (
            <div className="text-xs text-slate-500">
              AI evaluated: {new Date(project.ai_evaluated_at).toLocaleDateString()}
            </div>
          )}
        </div>
      )}

      {/* Run Evaluation Button */}
      {(!project.ai_evaluated_at || project.status === 'pending_review') && (
        <Button
          onClick={() => runEvaluationMutation.mutate()}
          disabled={runEvaluationMutation.isPending}
          className="w-full bg-violet-600 hover:bg-violet-700 gap-2"
        >
          {runEvaluationMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Running AI Evaluation...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4" />
              Run AI Evaluation
            </>
          )}
        </Button>
      )}

      {/* Detailed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="phase1">Phase 1: Ethics</TabsTrigger>
          <TabsTrigger value="phase2">Phase 2: Scoring</TabsTrigger>
          <TabsTrigger value="phase3">Phase 3: Risk</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* Category Scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ScoreCard
              icon={Leaf}
              label="Impact Score"
              score={impactScore}
              weight={40}
              color="emerald"
              description="Planetary + Human Wellbeing"
            />
            <ScoreCard
              icon={Scale}
              label="Regenerative & Ethical"
              score={regenerativeScore}
              weight={25}
              color="violet"
              description="Regenerative Potential + Governance"
            />
            <ScoreCard
              icon={Target}
              label="Feasibility & Sustainability"
              score={feasibilityScore}
              weight={20}
              color="blue"
              description="Cost Effectiveness + Scalability"
            />
            <ScoreCard
              icon={Users}
              label="Team Solidity"
              score={teamScore}
              weight={10}
              color="amber"
              description="Expertise + Community Integration"
            />
            <ScoreCard
              icon={Lightbulb}
              label="Innovation & Replicability"
              score={innovationScore}
              weight={5}
              color="cyan"
              description="Novel approaches + Transfer potential"
            />
          </div>

          {/* Derived Tags */}
          {project.derived_tags?.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Derived Tags</h4>
              <div className="flex flex-wrap gap-2">
                {project.derived_tags.map((tag, i) => (
                  <Badge key={i} variant="outline">{tag.replace(/_/g, ' ')}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Conditions */}
          {project.decision_conditions?.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Conditions / Next Steps</h4>
              <ul className="space-y-1">
                {project.decision_conditions.map((condition, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-slate-400" />
                    {condition}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Gaps */}
          {project.phase2_gaps?.length > 0 && (
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
              <h4 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Information Gaps
              </h4>
              <ul className="space-y-1">
                {project.phase2_gaps.map((gap, i) => (
                  <li key={i} className="text-sm text-amber-700">• {gap}</li>
                ))}
              </ul>
            </div>
          )}
        </TabsContent>

        <TabsContent value="phase1" className="space-y-4 mt-4">
          <div className={cn(
            "p-4 rounded-xl",
            phase1Result === 'pass' && "bg-emerald-50",
            phase1Result === 'fail' && "bg-rose-50",
            phase1Result === 'uncertain' && "bg-amber-50",
            phase1Result === 'pending' && "bg-slate-50"
          )}>
            <div className="flex items-center gap-3 mb-3">
              <Phase1Icon className={cn(
                "w-6 h-6",
                phase1Result === 'pass' && "text-emerald-600",
                phase1Result === 'fail' && "text-rose-600",
                phase1Result === 'uncertain' && "text-amber-600"
              )} />
              <span className="font-bold text-lg">
                Ethical Screening: {phase1Config?.label}
              </span>
            </div>
            {project.phase1_rationale && (
              <p className="text-sm text-slate-700">{project.phase1_rationale}</p>
            )}
          </div>

          {project.phase1_flags?.length > 0 && (
            <div className="p-4 rounded-lg bg-rose-50 border border-rose-200">
              <h4 className="font-medium text-rose-800 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Flags Identified
              </h4>
              <div className="flex flex-wrap gap-2">
                {project.phase1_flags.map((flag, i) => (
                  <Badge key={i} className="bg-rose-100 text-rose-700">
                    {flag.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {project.phase1_rfi_items?.length > 0 && (
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Request for Information
              </h4>
              <ul className="space-y-1">
                {project.phase1_rfi_items.map((item, i) => (
                  <li key={i} className="text-sm text-blue-700">• {item}</li>
                ))}
              </ul>
            </div>
          )}
        </TabsContent>

        <TabsContent value="phase2" className="space-y-4 mt-4">
          {project.phase2_scores && Object.entries(project.phase2_scores).map(([key, data]) => (
            <SubcriterionScore key={key} criterionKey={key} data={data} />
          ))}
        </TabsContent>

        <TabsContent value="phase3" className="space-y-4 mt-4">
          {/* Risk Grade */}
          <div className="flex items-center gap-4 mb-4">
            <div className={cn(
              "w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold",
              project.phase3_risk_grade ? RISK_GRADE_COLORS[project.phase3_risk_grade] : "bg-slate-100"
            )}>
              {project.phase3_risk_grade || '—'}
            </div>
            <div>
              <div className="font-medium">Risk Grade</div>
              <div className="text-sm text-slate-500">
                Execution Multiplier: {(project.phase3_execution_multiplier || 1).toFixed(2)}x
              </div>
            </div>
          </div>

          {/* Harm Gates */}
          {project.phase3_harm_gates && (
            <div>
              <h4 className="font-medium mb-2">Harm Gates</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(project.phase3_harm_gates).map(([gate, data]) => (
                  <div key={gate} className={cn(
                    "p-3 rounded-lg border",
                    data?.triggered ? "bg-rose-50 border-rose-200" : "bg-emerald-50 border-emerald-200"
                  )}>
                    <div className="flex items-center gap-2">
                      {data?.triggered ? (
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      )}
                      <span className="text-sm font-medium capitalize">{gate.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* De-risking Plan */}
          {project.phase3_derisking_plan?.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">De-risking Plan</h4>
              <ul className="space-y-1">
                {project.phase3_derisking_plan.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-slate-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </TabsContent>

        <TabsContent value="audit" className="space-y-4 mt-4">
          {auditLogs.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No audit logs yet
            </div>
          ) : (
            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-lg border bg-white">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="outline" className="text-xs">
                      {log.action?.replace(/_/g, ' ')}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      {new Date(log.created_date).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600">{log.reason}</div>
                  <div className="text-xs text-slate-400 mt-1">
                    By: {log.actor_type === 'ai' ? 'AI System' : log.actor_id}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ScoreCard({ icon: Icon, label, score, weight, color, description }) {
  const colors = {
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    violet: 'bg-violet-50 border-violet-200 text-violet-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    cyan: 'bg-cyan-50 border-cyan-200 text-cyan-700'
  };

  return (
    <div className={cn("p-4 rounded-xl border", colors[color])}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-5 h-5" />
        <span className="font-medium">{label}</span>
        <Badge variant="outline" className="ml-auto text-xs">{weight}%</Badge>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold">{score}</span>
        <span className="text-sm text-slate-500 mb-1">/ 10</span>
      </div>
      <div className="text-xs text-slate-500 mt-1">{description}</div>
      <Progress value={score * 10} className="mt-2 h-2" />
    </div>
  );
}

function SubcriterionScore({ criterionKey, data }) {
  const labels = {
    planetary_wellbeing: 'Planetary Wellbeing',
    human_wellbeing: 'Human Wellbeing',
    regenerative_potential: 'Regenerative Potential',
    ethical_governance: 'Ethical Governance',
    cost_effectiveness: 'Cost Effectiveness',
    scalability_model: 'Scalability & Model',
    expertise_track_record: 'Expertise & Track Record',
    community_integration: 'Community Integration',
    innovation: 'Innovation',
    replicability: 'Replicability'
  };

  if (!data) return null;

  return (
    <div className="p-4 rounded-lg border bg-white">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium">{labels[criterionKey] || criterionKey}</span>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-violet-700">{data.score}</span>
          <span className="text-sm text-slate-400">/ 10</span>
        </div>
      </div>
      <Progress value={data.score * 10} className="h-2 mb-2" />
      {data.rationale && (
        <p className="text-sm text-slate-600">{data.rationale}</p>
      )}
      {data.evidence && (
        <p className="text-xs text-slate-500 mt-1 italic">Evidence: {data.evidence}</p>
      )}
    </div>
  );
}