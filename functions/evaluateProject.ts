import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Evaluation configuration (simplified version for AI prompting)
const SCORING_CATEGORIES = {
  impact_score: { weight: 40, subcriteria: ['planetary_wellbeing', 'human_wellbeing'] },
  regenerative_ethical: { weight: 25, subcriteria: ['regenerative_potential', 'ethical_governance'] },
  feasibility_sustainability: { weight: 20, subcriteria: ['cost_effectiveness', 'scalability_model'] },
  team_solidity: { weight: 10, subcriteria: ['expertise_track_record', 'community_integration'] },
  innovation_replicability: { weight: 5, subcriteria: ['innovation', 'replicability'] }
};

const HARD_STOPS = [
  'fraud', 'coercion', 'hate_violence', 'medical_misinfo', 'scam', 
  'exploitative_labor', 'land_rights', 'data_abuse', 'weapons', 'environmental_catastrophe'
];

const MANIPULATION_INDICATORS = [
  'dependency_creation', 'isolation_tactics', 'exclusive_truth', 'coercive_payments',
  'threat_punishment', 'sleep_food_control', 'mandated_secrecy', 'punitive_shaming',
  'love_bombing', 'leader_infallibility', 'financial_opacity'
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { project_id, evaluation_mode = 'single' } = await req.json();

    if (!project_id) {
      return Response.json({ error: 'project_id required' }, { status: 400 });
    }

    // Fetch project
    const projects = await base44.entities.Project.filter({ id: project_id });
    const project = projects[0];
    
    if (!project) {
      return Response.json({ error: 'Project not found' }, { status: 404 });
    }

    // Build comprehensive prompt for AI evaluation
    const evaluationPrompt = buildEvaluationPrompt(project);

    // Call AI for evaluation
    const aiResult = await base44.integrations.Core.InvokeLLM({
      prompt: evaluationPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          phase1: {
            type: 'object',
            properties: {
              result: { type: 'string', enum: ['pass', 'fail', 'uncertain'] },
              flags: { type: 'array', items: { type: 'string' } },
              rationale: { type: 'string' },
              rfi_items: { type: 'array', items: { type: 'string' } }
            }
          },
          phase2: {
            type: 'object',
            properties: {
              scores: {
                type: 'object',
                properties: {
                  planetary_wellbeing: { type: 'object', properties: { score: { type: 'number' }, rationale: { type: 'string' }, evidence: { type: 'string' } } },
                  human_wellbeing: { type: 'object', properties: { score: { type: 'number' }, rationale: { type: 'string' }, evidence: { type: 'string' } } },
                  regenerative_potential: { type: 'object', properties: { score: { type: 'number' }, rationale: { type: 'string' }, evidence: { type: 'string' } } },
                  ethical_governance: { type: 'object', properties: { score: { type: 'number' }, rationale: { type: 'string' }, evidence: { type: 'string' } } },
                  cost_effectiveness: { type: 'object', properties: { score: { type: 'number' }, rationale: { type: 'string' }, evidence: { type: 'string' } } },
                  scalability_model: { type: 'object', properties: { score: { type: 'number' }, rationale: { type: 'string' }, evidence: { type: 'string' } } },
                  expertise_track_record: { type: 'object', properties: { score: { type: 'number' }, rationale: { type: 'string' }, evidence: { type: 'string' } } },
                  community_integration: { type: 'object', properties: { score: { type: 'number' }, rationale: { type: 'string' }, evidence: { type: 'string' } } },
                  innovation: { type: 'object', properties: { score: { type: 'number' }, rationale: { type: 'string' }, evidence: { type: 'string' } } },
                  replicability: { type: 'object', properties: { score: { type: 'number' }, rationale: { type: 'string' }, evidence: { type: 'string' } } }
                }
              },
              base_score: { type: 'number' },
              confidence: { type: 'number' },
              gaps: { type: 'array', items: { type: 'string' } }
            }
          },
          phase3: {
            type: 'object',
            properties: {
              execution_risks: { type: 'array', items: { type: 'object', properties: { dimension: { type: 'string' }, severity: { type: 'number' }, factors: { type: 'array', items: { type: 'string' } } } } },
              execution_multiplier: { type: 'number' },
              harm_gates: { type: 'object' },
              risk_grade: { type: 'string' },
              derisking_plan: { type: 'array', items: { type: 'string' } }
            }
          },
          phase4: {
            type: 'object',
            properties: {
              final_score: { type: 'number' },
              decision_tier: { type: 'string', enum: ['approve_fund', 'incubate_derisk', 'review_reevaluate', 'decline'] },
              conditions: { type: 'array', items: { type: 'string' } },
              next_best_action: { type: 'string' }
            }
          },
          derived_tags: { type: 'array', items: { type: 'string' } },
          anti_gaming_flags: { type: 'array', items: { type: 'string' } },
          lane_detected: { type: 'string' },
          stage_detected: { type: 'string' }
        }
      }
    });

    // Create evaluation record
    const evaluation = await base44.asServiceRole.entities.ProjectEvaluation.create({
      project_id,
      evaluation_type: 'ai_single',
      evaluator_id: user.email,
      phase1_result: aiResult.phase1?.result,
      phase1_flags: aiResult.phase1?.flags || [],
      phase1_rationale: aiResult.phase1?.rationale,
      phase2_scores: aiResult.phase2?.scores,
      phase2_base_score: aiResult.phase2?.base_score,
      phase2_confidence: aiResult.phase2?.confidence,
      phase2_gaps: aiResult.phase2?.gaps || [],
      phase3_execution_risks: aiResult.phase3?.execution_risks,
      phase3_execution_multiplier: aiResult.phase3?.execution_multiplier,
      phase3_harm_gates: aiResult.phase3?.harm_gates,
      phase3_risk_grade: aiResult.phase3?.risk_grade,
      phase3_derisking_plan: aiResult.phase3?.derisking_plan || [],
      final_score: aiResult.phase4?.final_score,
      decision_tier: aiResult.phase4?.decision_tier,
      decision_conditions: aiResult.phase4?.conditions || [],
      derived_tags: aiResult.derived_tags || [],
      anti_gaming_flags: aiResult.anti_gaming_flags || [],
      raw_ai_output: aiResult,
      model_version: 'v1.0'
    });

    // Update project with evaluation results
    await base44.asServiceRole.entities.Project.update(project_id, {
      lane_code: aiResult.lane_detected || project.lane_code,
      stage: aiResult.stage_detected || project.stage,
      phase1_result: aiResult.phase1?.result,
      phase1_flags: aiResult.phase1?.flags || [],
      phase1_rationale: aiResult.phase1?.rationale,
      phase1_rfi_items: aiResult.phase1?.rfi_items || [],
      phase2_scores: aiResult.phase2?.scores,
      phase2_base_score: aiResult.phase2?.base_score,
      phase2_confidence: aiResult.phase2?.confidence,
      phase2_gaps: aiResult.phase2?.gaps || [],
      phase3_execution_multiplier: aiResult.phase3?.execution_multiplier,
      phase3_harm_gates: aiResult.phase3?.harm_gates,
      phase3_risk_grade: aiResult.phase3?.risk_grade,
      phase3_derisking_plan: aiResult.phase3?.derisking_plan || [],
      final_score: aiResult.phase4?.final_score,
      decision_tier: aiResult.phase4?.decision_tier,
      decision_conditions: aiResult.phase4?.conditions || [],
      derived_tags: aiResult.derived_tags || [],
      ai_evaluation_id: evaluation.id,
      ai_evaluated_at: new Date().toISOString(),
      status: mapTierToStatus(aiResult.phase4?.decision_tier, aiResult.phase1?.result)
    });

    // Create audit log
    await base44.asServiceRole.entities.EvaluationAuditLog.create({
      project_id,
      evaluation_id: evaluation.id,
      action: 'ai_evaluated',
      actor_id: user.email,
      actor_type: 'ai',
      reason: `AI evaluation completed: ${aiResult.phase4?.decision_tier}`,
      metadata: {
        final_score: aiResult.phase4?.final_score,
        confidence: aiResult.phase2?.confidence,
        tier: aiResult.phase4?.decision_tier
      }
    });

    return Response.json({
      success: true,
      evaluation_id: evaluation.id,
      result: aiResult
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function buildEvaluationPrompt(project) {
  return `You are an expert project evaluator for a humanitarian funding platform. Evaluate this project through our 4-phase methodology.

PROJECT DATA:
Title: ${project.title}
Description: ${project.description || 'Not provided'}
Budget: $${project.budget?.toLocaleString() || 'Not specified'}
Stage: ${project.stage || 'Not specified'}
Lane/Sector: ${project.lane_code || 'Auto-detect'}
Geography: ${project.geography || 'Not specified'}
Organization: ${project.organization_name || 'Not specified'}
Team Size: ${project.team_size || 'Not specified'}
Strategic Intent: ${project.strategic_intent || 'Not specified'}
Impact Tags: ${(project.impact_tags || []).join(', ') || 'None'}
Additional Data: ${JSON.stringify(project.metadata || {})}

EVALUATION INSTRUCTIONS:

**PHASE 1: WHY FILTER (Ethical Firewall)**
Check for hard stops: ${HARD_STOPS.join(', ')}
Check for manipulation indicators: ${MANIPULATION_INDICATORS.join(', ')}
Result must be: pass, fail, or uncertain
- FAIL if any hard stop triggered or 3+ manipulation indicators
- UNCERTAIN if missing critical information or 1-2 manipulation indicators
- PASS if no concerns identified

**PHASE 2: QUANTITATIVE SCORING**
Score each subcriterion 1-10 with rationale and evidence:
- Planetary Wellbeing (20% weight): Environmental impact, regenerative design
- Human Wellbeing (20% weight): Direct benefit to people, flourishing domains
- Regenerative Potential (15% weight): Circular design, restoration capacity
- Ethical Governance (10% weight): Transparency, accountability, consent
- Cost Effectiveness (10% weight): Cost per outcome, efficiency
- Scalability/Model (10% weight): Sustainability path, scaling potential
- Expertise/Track Record (5% weight): Team capability, past performance
- Community Integration (5% weight): Local ownership, dignified partnership
- Innovation (2% weight): Novel approaches
- Replicability (3% weight): Transfer potential

Calculate base_score = weighted sum / 10 (0-100)
Calculate confidence (0-100) based on evidence quality

**PHASE 3: RISK MODEL**
Assess execution risks (1-5 severity):
- Team risk, Technical risk, Financial risk, External risk, Timeline risk
Calculate execution_multiplier (0.6-1.0)
Check harm gates: physical, psychological, environmental, financial
Assign risk_grade: A, B, C, D, or F

**PHASE 4: DECISION**
Calculate final_score = base_score × execution_multiplier (adjusted for confidence)
Assign tier:
- approve_fund: ≥80, Phase 1 pass, Risk A-C
- incubate_derisk: 60-79, needs support
- review_reevaluate: 40-59, needs more info
- decline: <40 or Phase 1 fail

**ANTI-GAMING**
Flag any concerns: impact_theater, manipulated_metrics, charisma_capture, unverifiable_claims, benchmark_mismatch, evidence_laundering, stage_laundering, governance_theater

**DERIVED TAGS**
Generate relevant tags based on evaluation results.

Detect the most appropriate lane_code and stage if not provided.

Be rigorous but fair. Evaluate capability, not credentials. Flag missing information in gaps.`;
}

function mapTierToStatus(tier, phase1Result) {
  if (phase1Result === 'fail') return 'declined';
  switch (tier) {
    case 'approve_fund': return 'approved';
    case 'incubate_derisk': return 'incubate';
    case 'review_reevaluate': return 'rfi_pending';
    case 'decline': return 'declined';
    default: return 'pending_review';
  }
}