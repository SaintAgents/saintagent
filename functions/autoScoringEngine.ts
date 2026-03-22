import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

// ===== SCORING CONFIGURATION =====
const ETHICAL_FLOOR_THRESHOLD = 3; // Planetary wellbeing score below this triggers flag
const PLANETARY_WELLBEING_MIN = 3;
const HUMAN_WELLBEING_MIN = 3;
const MIN_CONFIDENCE_FOR_AUTO_DECISION = 50;

const SCORING_WEIGHTS = {
  planetary_wellbeing: 20,
  human_wellbeing: 20,
  regenerative_potential: 15,
  ethical_governance: 10,
  cost_effectiveness: 10,
  scalability_model: 10,
  expertise_track_record: 5,
  community_integration: 5,
  innovation: 2,
  replicability: 3
};

const HARD_STOPS = [
  'fraud', 'coercion', 'hate_violence', 'medical_misinfo', 'scam',
  'exploitative_labor', 'land_rights', 'data_abuse', 'weapons', 'environmental_catastrophe'
];

const HARM_GATES = [
  'physical_harm', 'psychological_harm', 'environmental_harm',
  'financial_harm', 'rebound_effects', 'regulatory_shutdown'
];

const BLOCKING_HARM_GATES = ['physical_harm', 'psychological_harm', 'environmental_harm', 'financial_harm'];

const RFI_TEMPLATES = {
  ethical_floor_violation: {
    category: 'Ethical Floor Violation',
    questions: [
      'The project scores below the minimum ethical floor on planetary wellbeing metrics. Please provide documentation of environmental impact assessment and any mitigation strategies.',
      'Describe how the project avoids negative environmental externalities and operates within planetary boundaries.',
      'Provide evidence of regenerative or restorative environmental practices.'
    ]
  },
  planetary_wellbeing_low: {
    category: 'Planetary Wellbeing Deficiency',
    questions: [
      'Please provide an environmental assessment or carbon footprint analysis for this project.',
      'Describe how this project contributes to (or avoids harming) ecological health and climate stability.',
      'Are there cascade effects to other ecosystems? If so, describe monitoring plans.'
    ]
  },
  human_wellbeing_low: {
    category: 'Human Wellbeing Concerns',
    questions: [
      'Provide detailed data on the number and demographics of beneficiaries.',
      'Describe how the project addresses root causes rather than just symptoms.',
      'What mechanisms ensure equitable distribution of benefits?'
    ]
  },
  harm_gate_triggered: {
    category: 'Harm Gate Triggered',
    questions: [
      'A potential harm gate has been triggered. Please provide a comprehensive safety/mitigation plan.',
      'Describe third-party oversight mechanisms in place to prevent identified harms.',
      'What monitoring and early-warning systems are in place?'
    ]
  },
  missing_governance: {
    category: 'Governance Documentation',
    questions: [
      'Provide organizational chart and decision-making processes.',
      'List board members (if applicable) and describe their independence from founders.',
      'Describe accountability mechanisms and how stakeholders can raise concerns.'
    ]
  },
  missing_evidence: {
    category: 'Insufficient Evidence',
    questions: [
      'Provide third-party references who can verify your impact claims.',
      'Share raw data or documentation supporting your stated outcomes.',
      'Describe your baseline measurement methodology and comparison groups.'
    ]
  },
  financial_concerns: {
    category: 'Financial Transparency',
    questions: [
      'Provide detailed budget breakdown showing fund allocation across project activities.',
      'Disclose compensation for key team members and any related-party transactions.',
      'Describe path to financial sustainability beyond initial funding.'
    ]
  },
  pseudoscience_flag: {
    category: 'Scientific Validation Required',
    questions: [
      'Provide peer-reviewed citations supporting the scientific basis of your approach.',
      'Share any clinical trial data, regulatory approvals, or third-party certifications.',
      'Describe how your methodology has been validated by independent experts.'
    ]
  }
};

Deno.serve(async (req) => {
  const startTime = Date.now();
  
  try {
    const base44 = createClientFromRequest(req);
    
    // This can be called by automation (entity trigger) or manually
    const body = await req.json();
    const { project_id, trigger_source = 'manual' } = body?.data?.id 
      ? { project_id: body.data.id, trigger_source: 'automation' }
      : (body || {});

    // For automation triggers, extract project_id from event
    const actualProjectId = project_id || body?.event?.entity_id;
    
    if (!actualProjectId) {
      return Response.json({ error: 'project_id required' }, { status: 400 });
    }

    // Fetch project using service role for automation access
    const projects = await base44.asServiceRole.entities.Project.filter({ id: actualProjectId });
    const project = projects[0];
    
    if (!project) {
      return Response.json({ error: 'Project not found' }, { status: 404 });
    }

    // Skip if already fully evaluated and not manually triggered
    if (trigger_source === 'automation' && project.ai_evaluated_at && project.status !== 'pending_review') {
      return Response.json({ skipped: true, reason: 'Already evaluated' });
    }

    // Skip drafts for automation
    if (trigger_source === 'automation' && project.status === 'draft') {
      return Response.json({ skipped: true, reason: 'Draft project' });
    }

    // ===== PHASE 1: ETHICAL FIREWALL =====
    const phase1 = await runPhase1(base44, project);

    // If Phase 1 fails, short-circuit
    if (phase1.result === 'fail') {
      const result = await saveResults(base44, project, {
        phase1,
        phase2: { scores: {}, base_score: 0, confidence: 0, gaps: ['Phase 1 FAIL - evaluation halted'] },
        phase3: { execution_risks: [], execution_multiplier: 0, harm_gates: buildHarmGatesFromPhase1(phase1), risk_grade: 'F', derisking_plan: [] },
        phase4: { final_score: 0, decision_tier: 'decline', conditions: [], next_best_action: 'Generate decline notice' },
        derived_tags: ['harm_gate_triggered', 'integrity_concern'],
        anti_gaming_flags: phase1.anti_gaming_flags || [],
        rfi_items: phase1.rfi_items || [],
        processing_time_ms: Date.now() - startTime,
        trigger_source
      });
      return Response.json({ success: true, ...result });
    }

    // ===== PHASE 2: QUANTITATIVE SCORING (via AI) =====
    const phase2 = await runPhase2(base44, project, phase1);

    // ===== PHASE 3: RISK MODEL & HARM GATES =====
    const phase3 = await runPhase3(base44, project, phase2);

    // ===== CHECK ETHICAL FLOORS =====
    const ethicalFloorViolations = checkEthicalFloors(phase2.scores);

    // ===== GENERATE RFI LIST =====
    const rfiItems = generateRFI(phase1, phase2, phase3, ethicalFloorViolations, project);

    // ===== PHASE 4: DECISION =====
    const phase4 = computeDecision(phase1, phase2, phase3, ethicalFloorViolations);

    // ===== DERIVE TAGS =====
    const derived_tags = deriveTags(phase1, phase2, phase3, phase4, ethicalFloorViolations);
    const anti_gaming_flags = detectAntiGaming(phase2, project);

    // ===== SAVE RESULTS =====
    const result = await saveResults(base44, project, {
      phase1,
      phase2,
      phase3,
      phase4,
      derived_tags,
      anti_gaming_flags,
      rfi_items: [...(phase1.rfi_items || []), ...rfiItems],
      ethical_floor_violations: ethicalFloorViolations,
      processing_time_ms: Date.now() - startTime,
      trigger_source
    });

    return Response.json({ success: true, ...result });

  } catch (error) {
    console.error('Auto scoring engine error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// ===== PHASE 1: ETHICAL FIREWALL =====
async function runPhase1(base44, project) {
  const prompt = `You are an ethical screening AI for a humanitarian funding platform. 
Evaluate this project for ethical concerns ONLY. Be rigorous but fair.

PROJECT:
Title: ${project.title}
Description: ${project.description || 'Not provided'}
Budget: $${project.budget || 0}
Stage: ${project.stage || 'unknown'}
Lane: ${project.lane_code || 'auto-detect'}
Organization: ${project.organization_name || 'Not provided'}
Geography: ${project.geography || 'Not specified'}
Problem Statement: ${project.problem_statement || 'Not provided'}
Funding Type: ${project.funding_type || 'Not specified'}
Amount Requested: $${project.amount_requested || 0}
Use of Funds: ${project.use_of_funds || 'Not specified'}
Impact Beneficiaries: ${project.impact_beneficiaries || 'Not specified'}
Revenue Model: ${project.revenue_model || 'Not specified'}

CHECK FOR HARD STOPS: ${HARD_STOPS.join(', ')}
CHECK MANIPULATION INDICATORS: dependency_creation, isolation_tactics, exclusive_truth, coercive_payments, threat_punishment, mandated_secrecy, punitive_shaming, love_bombing, leader_infallibility, financial_opacity

RULES:
- FAIL if ANY hard stop triggered OR 3+ manipulation indicators
- UNCERTAIN if missing critical ethical info OR 1-2 manipulation indicators  
- PASS only if no concerns AND adequate information provided`;

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        result: { type: 'string', enum: ['pass', 'fail', 'uncertain'] },
        flags: { type: 'array', items: { type: 'string' } },
        rationale: { type: 'string' },
        hard_stops_triggered: { type: 'array', items: { type: 'string' } },
        manipulation_indicators_found: { type: 'array', items: { type: 'string' } },
        rfi_items: { type: 'array', items: { type: 'string' } },
        anti_gaming_flags: { type: 'array', items: { type: 'string' } }
      }
    }
  });

  return result;
}

// ===== PHASE 2: QUANTITATIVE SCORING =====
async function runPhase2(base44, project, phase1) {
  const prompt = `Score this project on 10 subcriteria (1-10 each). Be data-driven and evidence-based.

PROJECT:
Title: ${project.title}
Description: ${project.description || 'Not provided'}
Budget: $${project.budget || 0}
Stage: ${project.stage || 'unknown'}
Lane: ${project.lane_code || 'auto-detect'}
Organization: ${project.organization_name || 'Not provided'}
Team Size: ${project.team_size || 'Unknown'}
Geography: ${project.geography || 'Not specified'}
Problem Statement: ${project.problem_statement || 'Not provided'}
Funding Type: ${project.funding_type || 'Not specified'}
Amount Requested: $${project.amount_requested || 0}
Use of Funds: ${project.use_of_funds || 'Not specified'}
Revenue Model: ${project.revenue_model || 'Not specified'}
Current Revenue: ${project.current_revenue || 'Not specified'}
Projected Revenue: ${project.projected_revenue || 'Not specified'}
Impact Beneficiaries: ${project.impact_beneficiaries || 'Not specified'}
Impact Scale: ${project.impact_scale || 'Not specified'}
Geographic Focus: ${project.geographic_focus || 'Not specified'}
Readiness Items: ${(project.readiness_items || []).join(', ') || 'None listed'}
Alignment Statement: ${project.alignment_statement || 'Not provided'}
Success Definition: ${project.success_definition || 'Not provided'}
Additional Metadata: ${JSON.stringify(project.metadata || {})}

Phase 1 Result: ${phase1.result}
Phase 1 Notes: ${phase1.rationale}

SCORING (1-10 each):
- planetary_wellbeing (20%): Environmental impact, regenerative design, planetary boundaries
- human_wellbeing (20%): Direct benefit to people, reach, root causes
- regenerative_potential (15%): Circular design, restoration capacity
- ethical_governance (10%): Transparency, accountability, consent
- cost_effectiveness (10%): Cost per outcome, efficiency vs alternatives
- scalability_model (10%): Sustainability path, scaling potential
- expertise_track_record (5%): Team capability, past performance
- community_integration (5%): Local ownership, dignified partnership
- innovation (2%): Novel approaches
- replicability (3%): Transfer potential

Calculate base_score as weighted sum (0-100).
Calculate confidence (0-100) based on evidence quality.
List information gaps.`;

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
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
    }
  });

  return result;
}

// ===== PHASE 3: RISK & HARM GATES =====
async function runPhase3(base44, project, phase2) {
  const prompt = `Assess execution risks and harm gates for this project.

PROJECT: ${project.title}
Description: ${project.description || 'Not provided'}
Budget: $${project.budget || 0}
Stage: ${project.stage || 'unknown'}
Phase 2 Base Score: ${phase2.base_score}
Phase 2 Confidence: ${phase2.confidence}
Key Gaps: ${(phase2.gaps || []).join('; ')}

RISK DIMENSIONS (severity 1-5):
- team_risk: capability gaps, turnover, bandwidth, key-person dependency
- technical_risk: technology readiness, operational complexity
- financial_risk: funding gap, cash flow, cost overrun history
- external_risk: regulatory, political, market conditions
- timeline_risk: milestone complexity, dependency chains

HARM GATES (boolean triggered/not):
${HARM_GATES.map(g => `- ${g}`).join('\n')}

Blocking gates (fund=0 if triggered without mitigation): ${BLOCKING_HARM_GATES.join(', ')}

Calculate execution_multiplier: 1.0 - (avgRisk - 1) * 0.1, clamped [0.6, 1.0]
Assign risk_grade: A(0.95-1.0), B(0.85-0.94), C(0.75-0.84), D(0.65-0.74), F(0.6-0.64)`;

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        execution_risks: { type: 'array', items: { type: 'object', properties: { dimension: { type: 'string' }, severity: { type: 'number' }, factors: { type: 'array', items: { type: 'string' } }, mitigation: { type: 'string' } } } },
        execution_multiplier: { type: 'number' },
        harm_gates: { type: 'object' },
        risk_grade: { type: 'string', enum: ['A', 'B', 'C', 'D', 'F'] },
        derisking_plan: { type: 'array', items: { type: 'string' } },
        blocking_gate_triggered: { type: 'boolean' }
      }
    }
  });

  return result;
}

// ===== ETHICAL FLOOR CHECK =====
function checkEthicalFloors(scores) {
  const violations = [];
  
  if (scores?.planetary_wellbeing?.score < PLANETARY_WELLBEING_MIN) {
    violations.push({
      type: 'planetary_wellbeing_below_floor',
      score: scores.planetary_wellbeing.score,
      threshold: PLANETARY_WELLBEING_MIN,
      severity: 'critical',
      message: `Planetary wellbeing score (${scores.planetary_wellbeing.score}/10) is below the minimum ethical floor of ${PLANETARY_WELLBEING_MIN}/10`
    });
  }

  if (scores?.human_wellbeing?.score < HUMAN_WELLBEING_MIN) {
    violations.push({
      type: 'human_wellbeing_below_floor',
      score: scores.human_wellbeing.score,
      threshold: HUMAN_WELLBEING_MIN,
      severity: 'critical',
      message: `Human wellbeing score (${scores.human_wellbeing.score}/10) is below the minimum ethical floor of ${HUMAN_WELLBEING_MIN}/10`
    });
  }

  // Check if regenerative score is extremely low (extractive)
  if (scores?.regenerative_potential?.score <= 2) {
    violations.push({
      type: 'extractive_model_detected',
      score: scores.regenerative_potential.score,
      threshold: 2,
      severity: 'warning',
      message: `Regenerative potential score (${scores.regenerative_potential.score}/10) indicates an extractive rather than regenerative model`
    });
  }

  // Check ethical governance floor
  if (scores?.ethical_governance?.score <= 2) {
    violations.push({
      type: 'governance_floor_violation',
      score: scores.ethical_governance.score,
      threshold: 2,
      severity: 'critical',
      message: `Ethical governance score (${scores.ethical_governance.score}/10) indicates severe governance deficiencies`
    });
  }

  return violations;
}

// ===== RFI GENERATION =====
function generateRFI(phase1, phase2, phase3, ethicalFloorViolations, project) {
  const rfiItems = [];

  // Ethical floor violations
  for (const violation of ethicalFloorViolations) {
    if (violation.type === 'planetary_wellbeing_below_floor') {
      rfiItems.push(...RFI_TEMPLATES.planetary_wellbeing_low.questions.map(q => `[${RFI_TEMPLATES.planetary_wellbeing_low.category}] ${q}`));
    }
    if (violation.type === 'human_wellbeing_below_floor') {
      rfiItems.push(...RFI_TEMPLATES.human_wellbeing_low.questions.map(q => `[${RFI_TEMPLATES.human_wellbeing_low.category}] ${q}`));
    }
    if (violation.type === 'governance_floor_violation') {
      rfiItems.push(...RFI_TEMPLATES.missing_governance.questions.map(q => `[${RFI_TEMPLATES.missing_governance.category}] ${q}`));
    }
    if (violation.type === 'extractive_model_detected') {
      rfiItems.push(`[Extractive Model Concern] Please explain how this project avoids extractive practices and contributes to regenerative outcomes.`);
    }
  }

  // Harm gate RFIs
  if (phase3.harm_gates) {
    for (const [gate, data] of Object.entries(phase3.harm_gates)) {
      if (data?.triggered) {
        rfiItems.push(...RFI_TEMPLATES.harm_gate_triggered.questions.map(q => `[Harm Gate: ${gate.replace(/_/g, ' ')}] ${q}`));
      }
    }
  }

  // Low confidence RFIs
  if (phase2.confidence < 50) {
    rfiItems.push(...RFI_TEMPLATES.missing_evidence.questions.map(q => `[${RFI_TEMPLATES.missing_evidence.category}] ${q}`));
  }

  // Low governance score
  if (phase2.scores?.ethical_governance?.score < 5) {
    const alreadyHasGovernance = rfiItems.some(r => r.includes('Governance'));
    if (!alreadyHasGovernance) {
      rfiItems.push(...RFI_TEMPLATES.missing_governance.questions.map(q => `[${RFI_TEMPLATES.missing_governance.category}] ${q}`));
    }
  }

  // Financial concerns
  if (phase2.scores?.cost_effectiveness?.score < 4) {
    rfiItems.push(...RFI_TEMPLATES.financial_concerns.questions.map(q => `[${RFI_TEMPLATES.financial_concerns.category}] ${q}`));
  }

  // Wellness/health lane - pseudoscience check
  if (['wellness_devices', 'health_services', 'medical_devices'].includes(project.lane_code)) {
    if (phase2.scores?.innovation?.score < 3 || phase1.flags?.includes('medical_misinfo')) {
      rfiItems.push(...RFI_TEMPLATES.pseudoscience_flag.questions.map(q => `[${RFI_TEMPLATES.pseudoscience_flag.category}] ${q}`));
    }
  }

  return rfiItems;
}

// ===== DECISION COMPUTATION =====
function computeDecision(phase1, phase2, phase3, ethicalFloorViolations) {
  let finalScore = phase2.base_score * (phase3.execution_multiplier || 1);

  // Confidence discount
  if (phase2.confidence < 50) finalScore *= 0.9;
  if (phase2.confidence < 30) finalScore *= 0.8;

  // Blocking harm gate override
  const hasBlockingHarmGate = phase3.harm_gates && Object.entries(phase3.harm_gates)
    .some(([gate, data]) => BLOCKING_HARM_GATES.includes(gate) && data?.triggered);
  
  if (hasBlockingHarmGate) finalScore = 0;

  // Critical ethical floor violations force review
  const hasCriticalViolation = ethicalFloorViolations.some(v => v.severity === 'critical');

  finalScore = Math.round(finalScore);

  let decision_tier;
  let conditions = [];
  let next_best_action;

  if (finalScore === 0 || phase1.result === 'fail') {
    decision_tier = 'decline';
    next_best_action = 'Generate decline notice with clear explanation';
  } else if (hasCriticalViolation && finalScore >= 60) {
    // Ethical floor violation forces to review even if score is high
    decision_tier = 'review_reevaluate';
    conditions = ethicalFloorViolations.map(v => v.message);
    conditions.push('Must address ethical floor violations before proceeding');
    next_best_action = 'Send RFI addressing ethical floor violations';
  } else if (finalScore >= 80 && phase1.result === 'pass' && ['A', 'B', 'C'].includes(phase3.risk_grade) && phase2.confidence >= 60) {
    decision_tier = 'approve_fund';
    next_best_action = 'Proceed to funding agreement';
  } else if (finalScore >= 60) {
    decision_tier = 'incubate_derisk';
    conditions = phase3.derisking_plan || [];
    next_best_action = 'Create incubation roadmap';
  } else if (finalScore >= 40) {
    decision_tier = 'review_reevaluate';
    conditions = phase2.gaps || [];
    next_best_action = 'Generate feedback and RFI';
  } else {
    decision_tier = 'decline';
    next_best_action = 'Generate decline notice';
  }

  return { final_score: finalScore, decision_tier, conditions, next_best_action };
}

// ===== DERIVED TAGS =====
function deriveTags(phase1, phase2, phase3, phase4, ethicalFloorViolations) {
  const tags = [];

  if (ethicalFloorViolations.length > 0) {
    tags.push('ethical_floor_violation');
    ethicalFloorViolations.forEach(v => tags.push(v.type));
  }

  if (phase2.scores?.planetary_wellbeing?.score >= 8 && phase2.confidence >= 70) tags.push('high_impact_high_confidence');
  if (phase2.scores?.planetary_wellbeing?.score >= 8 && phase2.confidence < 50) tags.push('high_impact_low_evidence');
  if (phase2.scores?.community_integration?.score >= 8) tags.push('community_led');
  if (phase3.risk_grade === 'F' || phase3.risk_grade === 'D') tags.push('high_execution_risk');
  if (phase2.confidence < 40) tags.push('needs_rfi_evidence');
  if (phase2.scores?.ethical_governance?.score < 5) tags.push('needs_rfi_governance');
  if (phase4.decision_tier === 'approve_fund' && phase2.confidence >= 70) tags.push('ready_for_approval');
  if (phase1.result === 'fail') tags.push('phase1_fail');

  // Check harm gates
  if (phase3.harm_gates) {
    const triggered = Object.entries(phase3.harm_gates).filter(([_, d]) => d?.triggered);
    if (triggered.length > 0) tags.push('harm_gate_triggered');
  }

  return [...new Set(tags)];
}

// ===== ANTI-GAMING DETECTION =====
function detectAntiGaming(phase2, project) {
  const flags = [];
  
  // Impact theater: high claimed impact with low budget
  if (project.budget < 50000 && phase2.scores?.human_wellbeing?.score >= 8) {
    flags.push('possible_impact_theater');
  }
  
  // Benchmark mismatch: extremely high scores across the board
  const allScores = Object.values(phase2.scores || {}).map(s => s?.score || 0);
  const avgScore = allScores.reduce((a, b) => a + b, 0) / Math.max(allScores.length, 1);
  if (avgScore > 9 && phase2.confidence < 60) {
    flags.push('suspiciously_high_scores_low_confidence');
  }

  return flags;
}

// ===== HELPERS =====
function buildHarmGatesFromPhase1(phase1) {
  const gates = {};
  HARM_GATES.forEach(g => { gates[g] = { triggered: false }; });
  (phase1.flags || []).forEach(flag => {
    if (flag.includes('harm') || flag.includes('physical') || flag.includes('psychological') || flag.includes('environmental') || flag.includes('financial')) {
      const matchingGate = HARM_GATES.find(g => flag.includes(g.split('_')[0]));
      if (matchingGate) gates[matchingGate] = { triggered: true, rationale: phase1.rationale };
    }
  });
  return gates;
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

// ===== SAVE RESULTS =====
async function saveResults(base44, project, results) {
  const { phase1, phase2, phase3, phase4, derived_tags, anti_gaming_flags, rfi_items, ethical_floor_violations, processing_time_ms, trigger_source } = results;

  // Create evaluation record
  const evaluation = await base44.asServiceRole.entities.ProjectEvaluation.create({
    project_id: project.id,
    evaluation_type: trigger_source === 'automation' ? 'ai_bulk' : 'ai_single',
    phase1_result: phase1.result,
    phase1_flags: phase1.flags || [],
    phase1_rationale: phase1.rationale,
    phase2_scores: phase2.scores,
    phase2_base_score: phase2.base_score,
    phase2_confidence: phase2.confidence,
    phase2_gaps: phase2.gaps || [],
    phase3_execution_risks: phase3.execution_risks,
    phase3_execution_multiplier: phase3.execution_multiplier,
    phase3_harm_gates: phase3.harm_gates,
    phase3_risk_grade: phase3.risk_grade,
    phase3_derisking_plan: phase3.derisking_plan || [],
    final_score: phase4.final_score,
    decision_tier: phase4.decision_tier,
    decision_conditions: phase4.conditions || [],
    derived_tags,
    anti_gaming_flags,
    raw_ai_output: { phase1, phase2, phase3, phase4, ethical_floor_violations, rfi_items },
    model_version: 'scoring_engine_v2',
    processing_time_ms
  });

  // Update project
  await base44.asServiceRole.entities.Project.update(project.id, {
    phase1_result: phase1.result,
    phase1_flags: phase1.flags || [],
    phase1_rationale: phase1.rationale,
    phase1_rfi_items: rfi_items || [],
    phase2_scores: phase2.scores,
    phase2_base_score: phase2.base_score,
    phase2_confidence: phase2.confidence,
    phase2_gaps: phase2.gaps || [],
    phase3_execution_multiplier: phase3.execution_multiplier,
    phase3_harm_gates: phase3.harm_gates,
    phase3_risk_grade: phase3.risk_grade,
    phase3_derisking_plan: phase3.derisking_plan || [],
    final_score: phase4.final_score,
    decision_tier: phase4.decision_tier,
    decision_conditions: phase4.conditions || [],
    derived_tags,
    ai_evaluation_id: evaluation.id,
    ai_evaluated_at: new Date().toISOString(),
    status: mapTierToStatus(phase4.decision_tier, phase1.result),
    metadata: {
      ...(project.metadata || {}),
      ethical_floor_violations: ethical_floor_violations || [],
      scoring_engine_version: 'v2',
      last_auto_score_at: new Date().toISOString()
    }
  });

  // Create audit log
  await base44.asServiceRole.entities.EvaluationAuditLog.create({
    project_id: project.id,
    evaluation_id: evaluation.id,
    action: trigger_source === 'automation' ? 'auto_scored' : 'manual_scored',
    actor_id: 'scoring_engine_v2',
    actor_type: 'ai',
    reason: `Scoring Engine v2: ${phase4.decision_tier} (score: ${phase4.final_score}, confidence: ${phase2.confidence}${ethical_floor_violations?.length ? ', ETHICAL FLOOR VIOLATIONS: ' + ethical_floor_violations.length : ''})`,
    metadata: {
      final_score: phase4.final_score,
      confidence: phase2.confidence,
      tier: phase4.decision_tier,
      ethical_floor_violations: ethical_floor_violations?.length || 0,
      rfi_count: rfi_items?.length || 0,
      harm_gates_triggered: phase3.harm_gates ? Object.entries(phase3.harm_gates).filter(([_, d]) => d?.triggered).length : 0
    }
  });

  return {
    evaluation_id: evaluation.id,
    final_score: phase4.final_score,
    decision_tier: phase4.decision_tier,
    ethical_floor_violations: ethical_floor_violations?.length || 0,
    rfi_items_generated: rfi_items?.length || 0,
    processing_time_ms
  };
}