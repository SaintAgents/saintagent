import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Loader2, RefreshCw, AlertTriangle, Lightbulb, TrendingUp, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function AIClaimReviewSuggestions({ project }) {
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const hasIssues = project.phase1_result === 'fail' || 
    project.phase1_result === 'uncertain' ||
    (project.final_score !== undefined && project.final_score !== null && project.final_score < 60) ||
    project.phase3_risk_grade === 'D' || project.phase3_risk_grade === 'F' ||
    project.status === 'flagged' || project.status === 'declined';

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const prompt = `You are an expert project evaluator and advisor for a social impact investment fund. Analyze this project and provide actionable improvement suggestions.

PROJECT DATA:
- Title: ${project.title}
- Description: ${project.description || 'N/A'}
- Status: ${project.status}
- Stage: ${project.stage || 'N/A'}
- Budget: $${project.budget || 0}
- Geography: ${project.geography || 'N/A'}
- Organization: ${project.organization_name || 'N/A'}
- Lane/Category: ${project.lane_code || 'N/A'}
- Strategic Intent: ${project.strategic_intent || 'N/A'}
- Problem Statement: ${project.problem_statement || 'N/A'}
- Funding Type: ${project.funding_type || 'N/A'}
- Amount Requested: $${project.amount_requested || 0}
- Use of Funds: ${project.use_of_funds || 'N/A'}
- Revenue Model: ${project.revenue_model || 'N/A'}
- Impact Beneficiaries: ${project.impact_beneficiaries || 'N/A'}
- Impact Scale: ${project.impact_scale || 'N/A'}

EVALUATION RESULTS:
- Phase 1 (Ethics): ${project.phase1_result || 'Not evaluated'}
- Phase 1 Flags: ${project.phase1_flags?.join(', ') || 'None'}
- Phase 1 Rationale: ${project.phase1_rationale || 'N/A'}
- Phase 1 RFI Items: ${project.phase1_rfi_items?.join(', ') || 'None'}
- Phase 2 Base Score: ${project.phase2_base_score ?? 'N/A'}/100
- Phase 2 Confidence: ${project.phase2_confidence ?? 'N/A'}%
- Phase 2 Gaps: ${project.phase2_gaps?.join(', ') || 'None'}
- Phase 3 Risk Grade: ${project.phase3_risk_grade || 'N/A'}
- Phase 3 Execution Multiplier: ${project.phase3_execution_multiplier || 'N/A'}
- Phase 3 De-risking Plan: ${project.phase3_derisking_plan?.join(', ') || 'None'}
- Final Score: ${project.final_score ?? 'N/A'}/100
- Decision Tier: ${project.decision_tier || 'N/A'}
- Decision Conditions: ${project.decision_conditions?.join(', ') || 'None'}

CLAIM INFO:
- Claim Status: ${project.claim_status || 'unclaimed'}
- Claimed By: ${project.claimed_by || 'N/A'}
- Claim Note: ${project.claim_note || 'N/A'}

Provide your analysis in this exact format using markdown:

## Risk Assessment
Brief overview of the key risks and red flags.

## Improvement Recommendations
Numbered list of specific, actionable steps the project owner should take to improve their score and address evaluation gaps. Focus on the weakest areas.

## Claim Review Advice
For the admin reviewing this claim: should they approve, reject, or request more info? Why? Consider the project quality, the claimer's note, and any flags.

## Quick Wins
2-3 easy things the project team could do immediately to improve their standing.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            risk_assessment: { type: "string" },
            improvement_recommendations: { type: "string" },
            claim_review_advice: { type: "string" },
            quick_wins: { type: "string" },
            overall_sentiment: { type: "string", enum: ["critical", "concerning", "moderate", "positive"] },
            priority_areas: { type: "array", items: { type: "string" } }
          }
        }
      });

      setSuggestions(result);
    } catch (error) {
      console.error('AI suggestions failed:', error);
      setSuggestions({ error: 'Failed to generate suggestions. Please try again.' });
    }
    setLoading(false);
  };

  const sentimentConfig = {
    critical: { color: 'bg-rose-100 text-rose-700', label: 'Critical Issues' },
    concerning: { color: 'bg-amber-100 text-amber-700', label: 'Concerning' },
    moderate: { color: 'bg-blue-100 text-blue-700', label: 'Moderate' },
    positive: { color: 'bg-emerald-100 text-emerald-700', label: 'Positive' }
  };

  return (
    <div className="rounded-xl border-2 border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-900/10">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-violet-600 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              AI Review Suggestions
              {hasIssues && (
                <Badge className="bg-amber-100 text-amber-700 gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Issues Detected
                </Badge>
              )}
            </h3>
            <p className="text-xs text-slate-500">AI-powered analysis and improvement recommendations</p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
      </div>

      {expanded && (
        <div className="px-4 pb-4">
          {!suggestions && !loading && (
            <Button
              onClick={generateSuggestions}
              className="w-full bg-violet-600 hover:bg-violet-700 gap-2"
            >
              <Brain className="w-4 h-4" />
              Generate AI Suggestions
              {hasIssues && <span className="text-violet-200 text-xs">(Issues detected — recommended)</span>}
            </Button>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
              <p className="text-sm text-slate-500">Analyzing project data and evaluation results...</p>
            </div>
          )}

          {suggestions && !suggestions.error && (
            <div className="space-y-4">
              {/* Sentiment + Priority Areas */}
              <div className="flex items-center gap-2 flex-wrap">
                {suggestions.overall_sentiment && (
                  <Badge className={sentimentConfig[suggestions.overall_sentiment]?.color || 'bg-slate-100 text-slate-700'}>
                    {sentimentConfig[suggestions.overall_sentiment]?.label || suggestions.overall_sentiment}
                  </Badge>
                )}
                {suggestions.priority_areas?.map((area, i) => (
                  <Badge key={i} variant="outline" className="text-xs">{area}</Badge>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={generateSuggestions}
                  className="ml-auto gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Regenerate
                </Button>
              </div>

              {/* Sections */}
              <SuggestionSection
                icon={AlertTriangle}
                title="Risk Assessment"
                content={suggestions.risk_assessment}
                iconColor="text-rose-500"
                bgColor="bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800"
              />
              <SuggestionSection
                icon={TrendingUp}
                title="Improvement Recommendations"
                content={suggestions.improvement_recommendations}
                iconColor="text-blue-500"
                bgColor="bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800"
              />
              <SuggestionSection
                icon={Shield}
                title="Claim Review Advice"
                content={suggestions.claim_review_advice}
                iconColor="text-violet-500"
                bgColor="bg-violet-50 dark:bg-violet-900/10 border-violet-200 dark:border-violet-800"
              />
              <SuggestionSection
                icon={Lightbulb}
                title="Quick Wins"
                content={suggestions.quick_wins}
                iconColor="text-amber-500"
                bgColor="bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800"
              />
            </div>
          )}

          {suggestions?.error && (
            <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-700">
              {suggestions.error}
              <Button variant="outline" size="sm" onClick={generateSuggestions} className="mt-2 gap-1">
                <RefreshCw className="w-3 h-3" /> Retry
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SuggestionSection({ icon: Icon, title, content, iconColor, bgColor }) {
  if (!content) return null;
  return (
    <div className={`rounded-lg border p-4 ${bgColor}`}>
      <h4 className="font-medium text-sm text-slate-900 dark:text-white flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${iconColor}`} />
        {title}
      </h4>
      <div className="text-sm text-slate-700 dark:text-slate-300 prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}