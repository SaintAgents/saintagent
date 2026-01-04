// ============================================================================
// SAINTAGENT PROJECT EVALUATION SYSTEM - COMPLETE SPECIFICATION
// ============================================================================

// ============================================================================
// SECTION A: LANE TAXONOMY
// ============================================================================

export const LANE_TAXONOMY = {
  // FOOD & AGRICULTURE
  food_security: {
    code: 'food_security',
    label: 'Food Security',
    parent: null,
    children: ['regenerative_ag', 'food_distribution', 'nutrition', 'food_sovereignty'],
    typicalKPIs: ['households_served', 'acres_regenerated', 'yield_improvement', 'food_waste_reduction'],
    evidenceHierarchy: ['yield_data', 'soil_tests', 'farmer_contracts', 'baseline_surveys'],
    benchmarks: { good_impact: 500, excellent_impact: 2000 },
    failureModes: ['yield_washing', 'baseline_inflation', 'monocrop_disguised'],
    gamingPatterns: ['cherry_picked_farms', 'short_term_yields_only']
  },
  regenerative_ag: {
    code: 'regenerative_ag',
    label: 'Regenerative Agriculture',
    parent: 'food_security',
    typicalKPIs: ['soil_carbon_sequestered', 'biodiversity_index', 'water_retention', 'input_reduction'],
    evidenceHierarchy: ['soil_carbon_tests', 'biodiversity_surveys', 'water_table_data', 'input_records'],
    benchmarks: { soil_carbon_gain_pct: 2, biodiversity_increase: 15 },
    failureModes: ['greenwash_certification', 'temporary_practices'],
    gamingPatterns: ['cherry_picked_plots', 'ignoring_full_farm_impact']
  },
  
  // WATER & MARINE
  water_infrastructure: {
    code: 'water_infrastructure',
    label: 'Water Infrastructure',
    parent: null,
    children: ['wastewater', 'water_access', 'marine_protection'],
    typicalKPIs: ['population_served', 'contaminant_reduction', 'cost_per_gallon'],
    evidenceHierarchy: ['engineering_studies', 'permits', 'water_quality_tests', 'budget_docs'],
    benchmarks: { cost_per_person: 500, contaminant_reduction: 80 },
    failureModes: ['regulatory_stall', 'cost_overrun', 'maintenance_neglect'],
    gamingPatterns: ['inflated_population_served', 'pre_construction_claims']
  },
  wastewater: {
    code: 'wastewater',
    label: 'Wastewater Treatment',
    parent: 'water_infrastructure',
    typicalKPIs: ['gallons_treated', 'bod_removal', 'nutrient_reduction', 'ocean_outfall_eliminated'],
    evidenceHierarchy: ['permit_applications', 'engineering_reports', 'epa_compliance', 'contractor_bids'],
    benchmarks: { treatment_efficiency: 85, cost_per_mgd: 5000000 },
    failureModes: ['permit_delays', 'cost_escalation', 'political_opposition'],
    gamingPatterns: ['optimistic_timelines', 'understated_costs']
  },
  marine_protection: {
    code: 'marine_protection',
    label: 'Marine Ecosystem Protection',
    parent: 'water_infrastructure',
    typicalKPIs: ['reef_area_protected', 'species_recovery', 'pollution_reduction'],
    evidenceHierarchy: ['marine_surveys', 'species_counts', 'water_quality_data'],
    benchmarks: { reef_recovery_rate: 5, species_increase: 10 },
    failureModes: ['climate_override', 'enforcement_gaps'],
    gamingPatterns: ['baseline_manipulation', 'seasonal_cherry_picking']
  },

  // HEALTH & WELLNESS
  health_services: {
    code: 'health_services',
    label: 'Health Services',
    parent: null,
    children: ['community_health', 'medical_devices', 'mental_health', 'wellness_devices'],
    typicalKPIs: ['patients_served', 'health_outcomes', 'cost_per_intervention', 'qaly_gained'],
    evidenceHierarchy: ['clinical_data', 'patient_records', 'outcome_studies', 'cost_records'],
    benchmarks: { cost_per_qaly: 50000, patient_satisfaction: 80 },
    failureModes: ['access_barriers', 'quality_drift', 'sustainability_gaps'],
    gamingPatterns: ['cream_skimming', 'outcome_gaming']
  },
  wellness_devices: {
    code: 'wellness_devices',
    label: 'Wellness Devices',
    parent: 'health_services',
    scrutinyLevel: 'high',
    typicalKPIs: ['user_outcomes', 'safety_incidents', 'efficacy_data'],
    evidenceHierarchy: ['clinical_trials', 'peer_reviewed_studies', 'fda_clearance', 'user_testimonials'],
    benchmarks: { clinical_evidence_required: true, minimum_sample_size: 100 },
    failureModes: ['pseudoscience', 'placebo_only', 'harm_potential'],
    gamingPatterns: ['cherry_picked_testimonials', 'fake_certifications', 'unverifiable_claims'],
    harmGateRequired: true
  },

  // ENERGY
  clean_energy: {
    code: 'clean_energy',
    label: 'Clean Energy',
    parent: null,
    children: ['solar', 'wind', 'energy_efficiency', 'grid_storage'],
    typicalKPIs: ['mw_installed', 'co2_avoided', 'cost_per_kwh', 'households_powered'],
    evidenceHierarchy: ['feasibility_studies', 'grid_interconnect', 'performance_data', 'permits'],
    benchmarks: { cost_per_watt: 2, capacity_factor: 25 },
    failureModes: ['grid_connection_delays', 'intermittency_underestimate'],
    gamingPatterns: ['peak_only_reporting', 'ignoring_transmission_losses']
  },

  // EDUCATION
  education: {
    code: 'education',
    label: 'Education',
    parent: null,
    children: ['k12', 'vocational', 'digital_learning', 'early_childhood'],
    typicalKPIs: ['students_reached', 'learning_outcomes', 'completion_rates', 'employment_outcomes'],
    evidenceHierarchy: ['assessment_data', 'enrollment_records', 'outcome_tracking', 'comparison_groups'],
    benchmarks: { learning_gain: 20, completion_rate: 70 },
    failureModes: ['attendance_without_learning', 'selection_bias'],
    gamingPatterns: ['teaching_to_test', 'dropout_exclusion']
  },

  // ECONOMIC DEVELOPMENT
  economic_resilience: {
    code: 'economic_resilience',
    label: 'Economic Resilience',
    parent: null,
    children: ['microfinance', 'livelihoods', 'cooperative_enterprise', 'local_manufacturing'],
    typicalKPIs: ['jobs_created', 'income_increase', 'businesses_started', 'loan_repayment'],
    evidenceHierarchy: ['income_surveys', 'business_records', 'employment_data', 'baseline_comparison'],
    benchmarks: { income_increase_pct: 25, job_cost: 5000 },
    failureModes: ['displacement_effects', 'loan_default_cascade'],
    gamingPatterns: ['double_counting_jobs', 'temporary_employment_only']
  },

  // HOUSING & SHELTER
  housing: {
    code: 'housing',
    label: 'Housing & Shelter',
    parent: null,
    children: ['affordable_housing', 'homeless_services', 'disaster_recovery'],
    typicalKPIs: ['units_created', 'families_housed', 'cost_per_unit', 'housing_stability'],
    evidenceHierarchy: ['construction_permits', 'occupancy_data', 'cost_records', 'stability_tracking'],
    benchmarks: { cost_per_unit: 150000, stability_rate: 85 },
    failureModes: ['gentrification_effects', 'maintenance_gaps'],
    gamingPatterns: ['inflated_unit_counts', 'ignoring_displacement']
  },

  // GOVERNANCE & CIVIC
  governance: {
    code: 'governance',
    label: 'Governance & Civic',
    parent: null,
    children: ['civic_tech', 'transparency', 'community_organizing'],
    typicalKPIs: ['civic_participation', 'policy_changes', 'transparency_score'],
    evidenceHierarchy: ['participation_data', 'policy_outcomes', 'governance_audits'],
    benchmarks: { participation_increase: 20, policy_wins: 3 },
    failureModes: ['elite_capture', 'tokenism'],
    gamingPatterns: ['inflated_engagement_metrics', 'superficial_policy_claims']
  },

  // ENVIRONMENT
  conservation: {
    code: 'conservation',
    label: 'Conservation',
    parent: null,
    children: ['reforestation', 'wildlife_protection', 'ecosystem_restoration'],
    typicalKPIs: ['acres_protected', 'species_recovered', 'carbon_sequestered'],
    evidenceHierarchy: ['satellite_imagery', 'species_surveys', 'carbon_measurements'],
    benchmarks: { cost_per_acre: 100, survival_rate: 70 },
    failureModes: ['permanence_risk', 'leakage'],
    gamingPatterns: ['paper_parks', 'baseline_inflation']
  },

  // TECHNOLOGY
  technology: {
    code: 'technology',
    label: 'Technology',
    parent: null,
    children: ['digital_inclusion', 'ai_for_good', 'appropriate_tech'],
    typicalKPIs: ['users_reached', 'efficiency_gain', 'adoption_rate'],
    evidenceHierarchy: ['usage_data', 'outcome_studies', 'user_research'],
    benchmarks: { adoption_rate: 50, efficiency_gain: 30 },
    failureModes: ['tech_solutionism', 'maintenance_burden'],
    gamingPatterns: ['vanity_metrics', 'active_user_inflation']
  }
};

// ============================================================================
// SECTION B: STAGE DEFINITIONS & MODIFIERS
// ============================================================================

export const STAGE_DEFINITIONS = {
  idea: {
    code: 'idea',
    label: 'Idea Stage',
    description: 'Concept or early research phase',
    evidenceExpectations: {
      required: ['problem_statement', 'theory_of_change'],
      preferred: ['market_research', 'stakeholder_interviews'],
      optional: ['prototype_plans']
    },
    feasibilityExpectations: 'Focus on clarity of vision and logical coherence',
    governanceExpectations: 'Basic team structure; formal governance not required',
    scoreModifiers: {
      feasibility_weight: 0.7,
      evidence_threshold: 'low',
      team_weight: 0.8
    },
    stageLaunderingTriggers: [
      'Claims customer contracts without signed agreements',
      'Reports revenue without financial statements',
      'Claims pilot results without baseline data'
    ]
  },
  prototype: {
    code: 'prototype',
    label: 'Prototype Stage',
    description: 'Building and testing initial solution',
    evidenceExpectations: {
      required: ['working_prototype', 'initial_user_feedback'],
      preferred: ['technical_validation', 'cost_estimates'],
      optional: ['early_adopter_data']
    },
    feasibilityExpectations: 'Technical feasibility demonstrated; cost estimates reasonable',
    governanceExpectations: 'Clear roles; basic financial tracking',
    scoreModifiers: {
      feasibility_weight: 0.85,
      evidence_threshold: 'medium',
      team_weight: 0.9
    },
    stageLaunderingTriggers: [
      'Claims scale impact without pilot data',
      'Reports validated model without comparison groups',
      'Claims market fit without usage metrics'
    ]
  },
  pilot: {
    code: 'pilot',
    label: 'Pilot Stage',
    description: 'Testing solution in real conditions',
    evidenceExpectations: {
      required: ['pilot_data', 'baseline_comparison', 'cost_actuals'],
      preferred: ['outcome_metrics', 'stakeholder_feedback', 'iteration_log'],
      optional: ['third_party_validation']
    },
    feasibilityExpectations: 'Demonstrated delivery capability; realistic scaling plans',
    governanceExpectations: 'Formal governance; financial controls; accountability mechanisms',
    scoreModifiers: {
      feasibility_weight: 1.0,
      evidence_threshold: 'medium-high',
      team_weight: 1.0
    },
    stageLaunderingTriggers: [
      'Claims proven model without rigorous outcome data',
      'Reports ready to scale without operational systems',
      'Claims validated economics without unit cost data'
    ]
  },
  scaling: {
    code: 'scaling',
    label: 'Scaling Stage',
    description: 'Expanding proven solution',
    evidenceExpectations: {
      required: ['validated_outcomes', 'unit_economics', 'scaling_plan', 'operational_systems'],
      preferred: ['third_party_evaluation', 'replication_evidence'],
      optional: ['policy_advocacy_results']
    },
    feasibilityExpectations: 'Proven delivery at current scale; credible scaling pathway',
    governanceExpectations: 'Robust governance; board oversight; financial audits',
    scoreModifiers: {
      feasibility_weight: 1.0,
      evidence_threshold: 'high',
      team_weight: 1.0
    },
    stageLaunderingTriggers: [
      'Claims mature operations without multi-year track record',
      'Reports sustainable model without path to financial sustainability'
    ]
  },
  mature_ops: {
    code: 'mature_ops',
    label: 'Mature Operations',
    description: 'Established organization with proven track record',
    evidenceExpectations: {
      required: ['multi_year_outcomes', 'financial_audits', 'governance_docs', 'impact_evaluation'],
      preferred: ['independent_evaluation', 'replication_success'],
      optional: ['systems_change_evidence']
    },
    feasibilityExpectations: 'Demonstrated long-term sustainability',
    governanceExpectations: 'Exemplary governance; transparent reporting; independent board',
    scoreModifiers: {
      feasibility_weight: 1.0,
      evidence_threshold: 'very_high',
      team_weight: 1.0
    },
    stageLaunderingTriggers: []
  }
};

// ============================================================================
// SECTION C: PHASE 1 - WHY FILTER (ETHICAL FIREWALL)
// ============================================================================

export const PHASE1_CONFIG = {
  hardStops: [
    { id: 'fraud', label: 'Fraud or Financial Deception', description: 'Evidence of intentional misrepresentation for financial gain' },
    { id: 'coercion', label: 'Coercion or Forced Participation', description: 'Requiring participation through threats, manipulation, or undue pressure' },
    { id: 'hate_violence', label: 'Hate or Violence', description: 'Promoting discrimination, hate, or violence against any group' },
    { id: 'medical_misinfo', label: 'Medical Misinformation', description: 'Making unsubstantiated health claims that could cause harm' },
    { id: 'scam', label: 'Scam or Pyramid Scheme', description: 'Business model dependent on recruiting rather than value creation' },
    { id: 'exploitative_labor', label: 'Exploitative Labor', description: 'Using forced, child, or severely underpaid labor' },
    { id: 'land_rights', label: 'Land Rights Abuse', description: 'Displacing communities or violating indigenous land rights' },
    { id: 'data_abuse', label: 'Non-consensual Data Practices', description: 'Collecting or using personal data without informed consent' },
    { id: 'weapons', label: 'Weapons or Harm Tools', description: 'Creating tools designed primarily for harm' },
    { id: 'environmental_catastrophe', label: 'Environmental Catastrophe Risk', description: 'Activities with potential for severe, irreversible environmental damage' }
  ],
  
  manipulationIndicators: [
    { id: 'dependency_creation', label: 'Dependency Creation', description: 'Creating emotional, financial, or social dependency' },
    { id: 'isolation_tactics', label: 'Isolation Tactics', description: 'Separating participants from family, friends, or support systems' },
    { id: 'exclusive_truth', label: 'Exclusive Truth Claims', description: '"Only we have the answer" or "others are lying/deceived"' },
    { id: 'coercive_payments', label: 'Coercive Payment Requirements', description: 'Escalating payment demands tied to belonging or advancement' },
    { id: 'threat_punishment', label: 'Threats or Punishment', description: 'Threatening harm, ostracism, or punishment for questioning or leaving' },
    { id: 'sleep_food_control', label: 'Basic Needs Control', description: 'Controlling sleep, food, or other basic needs' },
    { id: 'mandated_secrecy', label: 'Mandated Secrecy', description: 'Requiring secrecy about practices, finances, or internal matters' },
    { id: 'punitive_shaming', label: 'Punitive Shaming', description: 'Using public shame, confession, or humiliation as control' },
    { id: 'love_bombing', label: 'Love Bombing', description: 'Overwhelming new members with attention/affection to create attachment' },
    { id: 'leader_infallibility', label: 'Leader Infallibility', description: 'Presenting leader as beyond question, special, or divine' },
    { id: 'financial_opacity', label: 'Financial Opacity', description: 'Refusing to disclose how funds are used or leader compensation' }
  ],

  questions: [
    {
      id: 'q1_harm_potential',
      question: 'Could this project directly or indirectly cause physical, psychological, financial, or environmental harm to any stakeholder group?',
      type: 'assessment',
      failOn: ['clear_harm_identified'],
      evidenceRequired: ['harm_assessment']
    },
    {
      id: 'q2_consent',
      question: 'Do all participants/beneficiaries provide informed, voluntary consent without coercion?',
      type: 'assessment',
      failOn: ['no_consent_mechanism', 'coerced_participation'],
      evidenceRequired: ['consent_process_description']
    },
    {
      id: 'q3_vulnerable_populations',
      question: 'Does this project involve vulnerable populations (children, elderly, disabled, economically desperate)? If yes, what safeguards exist?',
      type: 'conditional',
      flagOn: ['vulnerable_without_safeguards'],
      evidenceRequired: ['safeguard_documentation']
    },
    {
      id: 'q4_claims_verification',
      question: 'Can the primary claims made by this project be verified through independent means?',
      type: 'assessment',
      flagOn: ['unverifiable_claims'],
      uncertainOn: ['partially_verifiable'],
      evidenceRequired: ['verification_pathway']
    },
    {
      id: 'q5_financial_transparency',
      question: 'Is there transparent disclosure of fund usage, team compensation, and financial relationships?',
      type: 'assessment',
      flagOn: ['opaque_finances'],
      evidenceRequired: ['budget_breakdown', 'compensation_disclosure']
    },
    {
      id: 'q6_governance_checks',
      question: 'Are there governance mechanisms preventing single-person control and enabling accountability?',
      type: 'assessment',
      flagOn: ['no_governance_checks'],
      uncertainOn: ['weak_governance'],
      evidenceRequired: ['governance_structure']
    },
    {
      id: 'q7_exit_rights',
      question: 'Can participants freely exit without penalty, shame, or loss of invested resources?',
      type: 'assessment',
      failOn: ['no_exit_rights', 'punitive_exit'],
      evidenceRequired: ['exit_policy']
    },
    {
      id: 'q8_scientific_basis',
      question: 'For health/wellness/technology claims: Is there peer-reviewed or scientifically validated evidence?',
      type: 'conditional',
      applicableLanes: ['health_services', 'wellness_devices', 'medical_devices'],
      failOn: ['pseudoscience_primary'],
      flagOn: ['weak_evidence'],
      evidenceRequired: ['scientific_citations', 'clinical_evidence']
    },
    {
      id: 'q9_manipulation_screen',
      question: 'Are any of the manipulation indicators present in organizational practices?',
      type: 'screen',
      checkAgainst: 'manipulationIndicators',
      failOn: ['3_or_more_indicators'],
      flagOn: ['1_to_2_indicators'],
      evidenceRequired: ['organizational_practices_description']
    },
    {
      id: 'q10_counterfactual',
      question: 'Would the claimed outcomes happen anyway without this intervention?',
      type: 'assessment',
      flagOn: ['high_counterfactual_risk'],
      uncertainOn: ['unclear_additionality'],
      evidenceRequired: ['counterfactual_analysis']
    }
  ],

  decisionRules: {
    FAIL: [
      'Any hardStop triggered',
      '3+ manipulation indicators present',
      'q1_harm_potential: clear_harm_identified',
      'q2_consent: no_consent_mechanism OR coerced_participation',
      'q7_exit_rights: no_exit_rights OR punitive_exit',
      'q8_scientific_basis: pseudoscience_primary (for applicable lanes)'
    ],
    UNCERTAIN: [
      'Any flagged items without clear resolution',
      'Missing required evidence for any question',
      '1-2 manipulation indicators',
      'q4_claims_verification: partially_verifiable',
      'q6_governance_checks: weak_governance'
    ],
    PASS: [
      'No hardStops',
      'No FAIL conditions',
      'No UNCERTAIN conditions OR all resolved'
    ]
  },

  rfiTemplate: {
    intro: 'We need additional information to complete our evaluation of your project. Please provide the following within 14 days:',
    categories: {
      harm_clarification: {
        label: 'Harm & Safety Clarification',
        questions: [
          'Please describe any potential risks to participants and your mitigation strategies',
          'Provide documentation of safety protocols and incident response procedures'
        ]
      },
      consent_documentation: {
        label: 'Consent Documentation',
        questions: [
          'Provide sample consent forms used with participants',
          'Describe how you ensure informed consent for vulnerable populations'
        ]
      },
      financial_transparency: {
        label: 'Financial Transparency',
        questions: [
          'Provide detailed budget breakdown showing fund allocation',
          'Disclose compensation for key team members and any related-party transactions'
        ]
      },
      governance_structure: {
        label: 'Governance Structure',
        questions: [
          'Provide organizational chart and decision-making processes',
          'List board members (if applicable) and their independence'
        ]
      },
      evidence_verification: {
        label: 'Evidence Verification',
        questions: [
          'Provide third-party references who can verify your claims',
          'Share raw data or documentation supporting your impact claims'
        ]
      },
      scientific_validation: {
        label: 'Scientific Validation (Health/Wellness)',
        questions: [
          'Provide peer-reviewed citations supporting your approach',
          'Share any clinical trial data or regulatory approvals'
        ]
      }
    }
  },

  uiCopy: {
    passMessage: 'Project passed ethical screening and is ready for detailed evaluation.',
    failMessage: 'Project did not pass ethical screening due to fundamental concerns.',
    uncertainMessage: 'Additional information required before proceeding with evaluation.',
    failReasons: {
      fraud: 'Evidence of fraudulent practices or intentional misrepresentation',
      coercion: 'Presence of coercive practices or forced participation',
      medical_misinfo: 'Unsubstantiated health claims that could cause harm',
      manipulation: 'Multiple indicators of manipulative organizational practices',
      no_consent: 'No mechanism for informed consent from participants',
      pseudoscience: 'Primary claims based on pseudoscience without scientific validation'
    },
    escalationNote: 'If you believe this assessment is in error, you may request a human review within 30 days.'
  }
};

// ============================================================================
// SECTION D: PHASE 2 - QUANTITATIVE SCORING
// ============================================================================

export const PHASE2_SCORING_RUBRIC = {
  categories: {
    impact_score: {
      weight: 40,
      subcriteria: {
        planetary_wellbeing: {
          weight: 20,
          definition: 'Contribution to ecological health, climate stability, and planetary boundaries',
          guidingQuestions: [
            'Does this regenerate or deplete natural systems?',
            'What is the carbon/ecological footprint?',
            'Does it operate within planetary boundaries?',
            'Are there cascade effects to other ecosystems?'
          ],
          rubric: {
            low: { range: [1, 3], description: 'Neutral or marginally positive environmental impact; no regenerative elements; limited scope' },
            mid: { range: [4, 7], description: 'Clear environmental benefits; some regenerative practices; measurable positive outcomes' },
            high: { range: [8, 10], description: 'Strongly regenerative; measurable ecosystem restoration; cascade positive effects; aligned with doughnut economics ceiling' }
          },
          evidenceRequirements: ['environmental_assessment', 'carbon_footprint', 'biodiversity_metrics'],
          eaIntegration: 'Scale × Duration × Confidence of environmental impact',
          blueEconomyIntegration: 'Multi-benefit design, cascade effects, local resource leveraging'
        },
        human_wellbeing: {
          weight: 20,
          definition: 'Direct improvement to human flourishing across multiple dimensions',
          guidingQuestions: [
            'How many people benefit and how deeply?',
            'Does it address root causes or symptoms?',
            'Are benefits distributed equitably?',
            'Does it enhance agency and capability?'
          ],
          rubric: {
            low: { range: [1, 3], description: 'Limited reach; surface-level benefits; unclear pathway to wellbeing improvement' },
            mid: { range: [4, 7], description: 'Meaningful benefits to identifiable population; addresses real needs; some capability building' },
            high: { range: [8, 10], description: 'Deep, lasting improvement across multiple flourishing domains; high reach; addresses root causes; enhances agency' }
          },
          evidenceRequirements: ['beneficiary_data', 'outcome_metrics', 'flourishing_indicators'],
          flourishingDomains: ['happiness', 'health', 'meaning', 'character', 'relationships', 'financial_stability'],
          eaIntegration: 'Importance × Neglectedness × Tractability; cost-effectiveness per person impacted'
        }
      }
    },
    
    regenerative_ethical: {
      weight: 25,
      subcriteria: {
        regenerative_potential: {
          weight: 15,
          definition: 'Capacity to restore, renew, and improve systems rather than just sustain or extract',
          guidingQuestions: [
            'Does this build capacity for ongoing regeneration?',
            'Are local/indigenous knowledge systems respected?',
            'Does it create positive feedback loops?',
            'Is it designed for circular resource flows?'
          ],
          rubric: {
            low: { range: [1, 3], description: 'Extractive or merely sustainable; no regenerative design; linear resource use' },
            mid: { range: [4, 7], description: 'Some regenerative elements; partial circularity; building toward restoration' },
            high: { range: [8, 10], description: 'Fully regenerative design; positive cascades; circular flows; restores community/ecosystem capacity' }
          },
          evidenceRequirements: ['regenerative_design_docs', 'circular_economy_metrics', 'community_capacity_indicators'],
          blueEconomyIntegration: 'Local loops, multi-benefit cascades, low-capex leveraging local resources'
        },
        ethical_governance: {
          weight: 10,
          definition: 'Transparency, accountability, consent-based operations, and non-extractive incentives',
          guidingQuestions: [
            'Is decision-making transparent and participatory?',
            'Are there accountability mechanisms?',
            'Do incentives align with mission (not extraction)?',
            'Is there meaningful consent from stakeholders?'
          ],
          rubric: {
            low: { range: [1, 3], description: 'Opaque governance; founder-controlled; extractive incentives; minimal accountability' },
            mid: { range: [4, 7], description: 'Basic transparency; some stakeholder input; mixed incentives; developing accountability' },
            high: { range: [8, 10], description: 'Exemplary transparency; distributed governance; fully aligned incentives; strong accountability; meaningful consent' }
          },
          evidenceRequirements: ['governance_docs', 'stakeholder_input_process', 'incentive_structure', 'transparency_reports'],
          presenceVsEgoProxies: ['transparency_score', 'humility_indicators', 'consent_mechanisms', 'non_extractive_incentives']
        }
      }
    },
    
    feasibility_sustainability: {
      weight: 20,
      subcriteria: {
        cost_effectiveness: {
          weight: 10,
          definition: 'Efficiency of resource use relative to outcomes achieved',
          guidingQuestions: [
            'What is the cost per unit of impact?',
            'How does this compare to alternatives?',
            'Are there leverage points that multiply impact?',
            'Is spending appropriate for stage and context?'
          ],
          rubric: {
            low: { range: [1, 3], description: 'Poor cost-effectiveness; much better alternatives exist; inefficient resource use' },
            mid: { range: [4, 7], description: 'Reasonable cost-effectiveness; comparable to alternatives; some efficiency gains possible' },
            high: { range: [8, 10], description: 'Excellent cost-effectiveness; competitive or superior to alternatives; high leverage design' }
          },
          evidenceRequirements: ['budget', 'unit_economics', 'comparison_analysis'],
          eaIntegration: 'Cost per outcome; room for more funding; marginal vs average cost-effectiveness'
        },
        scalability_model: {
          weight: 10,
          definition: 'Viability of business/operating model and ability to grow impact',
          guidingQuestions: [
            'Is there a path to sustainability?',
            'Can this scale without proportional cost increase?',
            'Are there network effects or leverage?',
            'Does the model work in different contexts?'
          ],
          rubric: {
            low: { range: [1, 3], description: 'No clear sustainability path; heavy donor dependency; unclear unit economics; limited scalability' },
            mid: { range: [4, 7], description: 'Viable model with some dependencies; moderate scaling potential; context-limited' },
            high: { range: [8, 10], description: 'Strong sustainability path; proven unit economics; high scaling potential; adaptable model' }
          },
          evidenceRequirements: ['financial_model', 'scaling_plan', 'replication_evidence'],
          mountainsBeyondIntegration: 'Iteration evidence, delivery under constraints, dignified partnership'
        }
      }
    },
    
    team_solidity: {
      weight: 10,
      subcriteria: {
        expertise_track_record: {
          weight: 5,
          definition: 'Team capability and demonstrated ability to execute',
          guidingQuestions: [
            'Does the team have relevant expertise?',
            'Is there a track record of delivery?',
            'Are there gaps in critical capabilities?',
            'Is there evidence of learning and adaptation?'
          ],
          rubric: {
            low: { range: [1, 3], description: 'Limited relevant expertise; no track record; significant capability gaps' },
            mid: { range: [4, 7], description: 'Adequate expertise; some track record; manageable gaps with plans to address' },
            high: { range: [8, 10], description: 'Deep expertise; strong track record; complete team; demonstrated learning culture' }
          },
          evidenceRequirements: ['team_bios', 'past_projects', 'references'],
          antiBiasNote: 'Evaluate capability, not credentials. Lived experience counts. Avoid prestige bias.'
        },
        community_integration: {
          weight: 5,
          definition: 'Authentic engagement with and accountability to affected communities',
          guidingQuestions: [
            'Is the community genuinely engaged in design and governance?',
            'Is there local ownership and leadership?',
            'Are community assets and knowledge leveraged?',
            'Is there long-term commitment (accompaniment)?'
          ],
          rubric: {
            low: { range: [1, 3], description: 'Top-down design; community as beneficiaries only; extractive relationship' },
            mid: { range: [4, 7], description: 'Some community input; emerging local leadership; respectful engagement' },
            high: { range: [8, 10], description: 'Co-designed with community; community governance; local leadership; dignified partnership' }
          },
          evidenceRequirements: ['community_engagement_docs', 'local_leadership_evidence', 'partnership_agreements'],
          mountainsBeyondIntegration: 'Accompaniment model; iteration with community; dignified partnership'
        }
      }
    },
    
    innovation_replicability: {
      weight: 5,
      subcriteria: {
        innovation: {
          weight: 2,
          definition: 'Novel approaches that could unlock new impact pathways',
          guidingQuestions: [
            'Is this a genuinely new approach?',
            'Does innovation serve impact or just novelty?',
            'Is there potential for sector-wide learning?'
          ],
          rubric: {
            low: { range: [1, 3], description: 'Standard approach; no particular innovation; adequate but ordinary' },
            mid: { range: [4, 7], description: 'Some innovative elements; useful adaptations; moderate learning potential' },
            high: { range: [8, 10], description: 'Genuinely innovative; potential paradigm shift; high learning value for sector' }
          },
          evidenceRequirements: ['innovation_description', 'differentiation_analysis']
        },
        replicability: {
          weight: 3,
          definition: 'Potential for model to be adopted by others',
          guidingQuestions: [
            'Can others adopt this approach?',
            'Is knowledge being documented and shared?',
            'Are there barriers to replication?'
          ],
          rubric: {
            low: { range: [1, 3], description: 'Highly context-specific; no documentation; limited transfer potential' },
            mid: { range: [4, 7], description: 'Some replicability; basic documentation; moderate adaptation required' },
            high: { range: [8, 10], description: 'Highly replicable; excellent documentation; active knowledge sharing; proven in multiple contexts' }
          },
          evidenceRequirements: ['documentation', 'replication_toolkit', 'adaptation_evidence']
        }
      }
    }
  },

  missingDataHandling: {
    noData: { score: 3, confidenceImpact: -30, gapFlag: true },
    partialData: { score: 'estimated_with_discount', confidenceImpact: -15, gapFlag: true },
    selfReportedOnly: { score: 'as_reported_minus_1', confidenceImpact: -10, gapFlag: false },
    thirdPartyVerified: { score: 'as_verified', confidenceImpact: 0, gapFlag: false }
  },

  confidenceComputation: {
    baseConfidence: 70,
    modifiers: {
      thirdPartyEvidence: +15,
      multipleSourcesAgree: +10,
      selfReportedOnly: -15,
      missingKeyEvidence: -20,
      inconsistentData: -25,
      unverifiableClaims: -30,
      stageAppropriate: +5,
      laneBenchmarkMet: +5
    },
    formula: 'baseConfidence + sum(applicable_modifiers), clamped to [0, 100]'
  }
};

// ============================================================================
// SECTION E: PHASE 3 - RISK MODEL
// ============================================================================

export const PHASE3_RISK_CONFIG = {
  executionRisks: {
    dimensions: [
      {
        id: 'team_risk',
        label: 'Team Execution Risk',
        factors: ['capability_gaps', 'turnover_risk', 'bandwidth', 'key_person_dependency']
      },
      {
        id: 'technical_risk',
        label: 'Technical/Operational Risk',
        factors: ['technology_readiness', 'operational_complexity', 'supply_chain', 'infrastructure_dependency']
      },
      {
        id: 'financial_risk',
        label: 'Financial Risk',
        factors: ['funding_gap', 'cash_flow', 'cost_overrun_history', 'revenue_uncertainty']
      },
      {
        id: 'external_risk',
        label: 'External/Regulatory Risk',
        factors: ['regulatory_approval', 'political_environment', 'market_conditions', 'partner_dependency']
      },
      {
        id: 'timeline_risk',
        label: 'Timeline Risk',
        factors: ['milestone_complexity', 'dependency_chains', 'historical_delays']
      }
    ],
    
    severityScale: {
      1: { label: 'Very Low', description: 'Minimal risk; strong mitigation in place' },
      2: { label: 'Low', description: 'Some risk; adequate mitigation' },
      3: { label: 'Moderate', description: 'Meaningful risk; mitigation plan needed' },
      4: { label: 'High', description: 'Significant risk; requires active management' },
      5: { label: 'Very High', description: 'Severe risk; may block success without major changes' }
    },

    multiplierFormula: {
      description: 'Weighted average of risk dimensions, mapped to multiplier',
      calculation: `
        avgRisk = weightedAverage(dimensions)
        multiplier = 1.0 - (avgRisk - 1) * 0.1
        // avgRisk 1 → 1.0, avgRisk 3 → 0.8, avgRisk 5 → 0.6
        clamp(multiplier, 0.6, 1.0)
      `
    }
  },

  harmGates: {
    description: 'Binary gates that can block funding regardless of score',
    gates: [
      {
        id: 'physical_harm',
        label: 'Physical Harm Potential',
        trigger: 'Credible risk of physical harm to participants or communities',
        blockFunding: true,
        requiresMitigation: 'Comprehensive safety plan with third-party review'
      },
      {
        id: 'psychological_harm',
        label: 'Psychological Harm Potential',
        trigger: 'Risk of psychological manipulation, trauma, or exploitation',
        blockFunding: true,
        requiresMitigation: 'Mental health safeguards and professional oversight'
      },
      {
        id: 'environmental_harm',
        label: 'Environmental Harm Potential',
        trigger: 'Risk of significant, potentially irreversible environmental damage',
        blockFunding: true,
        requiresMitigation: 'Environmental impact assessment and mitigation plan'
      },
      {
        id: 'financial_harm',
        label: 'Financial Harm to Vulnerable',
        trigger: 'Risk of financial exploitation of vulnerable populations',
        blockFunding: true,
        requiresMitigation: 'Financial safeguards and consumer protection measures'
      },
      {
        id: 'rebound_effects',
        label: 'Rebound/Backfire Effects',
        trigger: 'Potential for intervention to cause opposite of intended effect',
        blockFunding: false,
        requiresMitigation: 'Monitoring plan with early warning indicators'
      },
      {
        id: 'regulatory_shutdown',
        label: 'Regulatory Shutdown Risk',
        trigger: 'High probability of regulatory action that would end project',
        blockFunding: false,
        requiresMitigation: 'Regulatory strategy and compliance plan'
      }
    ]
  },

  riskGradeComputation: {
    A: { range: [0.95, 1.0], description: 'Very low risk; no harm gates triggered' },
    B: { range: [0.85, 0.94], description: 'Low risk; minor concerns addressed' },
    C: { range: [0.75, 0.84], description: 'Moderate risk; mitigation plans required' },
    D: { range: [0.65, 0.74], description: 'High risk; significant de-risking needed' },
    F: { range: [0.6, 0.64], description: 'Very high risk; may not be fundable' }
  },

  deriskingPlaybooks: {
    team_risk: [
      'Add advisor with relevant expertise',
      'Hire for critical capability gap',
      'Reduce key-person dependency with cross-training',
      'Establish succession plan'
    ],
    technical_risk: [
      'Complete technical proof-of-concept before full funding',
      'Engage technical reviewer/validator',
      'Reduce scope to proven components',
      'Phase implementation with validation gates'
    ],
    financial_risk: [
      'Secure bridge funding or runway extension',
      'Reduce burn rate',
      'Diversify funding sources',
      'Establish financial controls and reporting'
    ],
    external_risk: [
      'Engage regulatory counsel early',
      'Build coalition support',
      'Develop contingency plans',
      'Reduce single-partner dependency'
    ],
    timeline_risk: [
      'Add buffer to timeline',
      'Reduce scope or phase approach',
      'Address critical path dependencies',
      'Establish milestone-based funding'
    ]
  },

  finalScoreFormula: {
    description: 'Combines base score, execution risk, and confidence',
    formula: `
      // If any blocking harm gate is triggered and not mitigated: Final Score = 0
      if (anyBlockingHarmGate && !mitigated) return 0;
      
      // Otherwise:
      adjustedScore = baseScore * executionMultiplier;
      
      // Confidence discount for low confidence
      if (confidence < 50) adjustedScore *= 0.9;
      if (confidence < 30) adjustedScore *= 0.8;
      
      return Math.round(adjustedScore);
    `
  }
};

// ============================================================================
// SECTION F: PHASE 4 - DECISION PATHWAYS
// ============================================================================

export const PHASE4_DECISION_CONFIG = {
  tiers: {
    approve_fund: {
      code: 'approve_fund',
      label: 'Approve & Fund',
      scoreRange: [80, 100],
      conditions: [
        'Phase 1 PASS',
        'No blocking harm gates',
        'Risk grade A, B, or C',
        'Confidence >= 60'
      ],
      sop: [
        'Generate funding agreement with standard terms',
        'Set reporting schedule (quarterly for <$500K, monthly for >$500K)',
        'Assign relationship manager',
        'Schedule 90-day check-in',
        'Add to active portfolio monitoring'
      ],
      monitoringExpectations: {
        reportingFrequency: 'quarterly',
        siteVisits: 'annual',
        outcomeVerification: 'at_milestones'
      },
      nextBestAction: 'Proceed to funding agreement',
      documentationRequired: ['final_evaluation', 'funding_terms', 'monitoring_plan']
    },
    
    incubate_derisk: {
      code: 'incubate_derisk',
      label: 'Incubate & De-Risk',
      scoreRange: [60, 79],
      conditions: [
        'Phase 1 PASS',
        'No blocking harm gates',
        'Identified de-risking pathway',
        'Team committed to improvements'
      ],
      sop: [
        'Generate de-risking plan based on risk assessment',
        'Offer technical assistance menu',
        'Set milestone-based funding (if applicable)',
        'Schedule 60-day progress review',
        'Assign mentor or advisor'
      ],
      supportMenu: [
        'Technical assistance grant',
        'Advisor connection',
        'Capacity building program',
        'Pilot funding for validation',
        'Peer learning cohort'
      ],
      milestoneExamples: [
        'Complete governance restructure',
        'Achieve pilot outcome targets',
        'Secure matching funding',
        'Add critical team member',
        'Complete third-party validation'
      ],
      nextBestAction: 'Create incubation roadmap',
      documentationRequired: ['evaluation_summary', 'derisk_plan', 'milestone_agreement']
    },
    
    review_reevaluate: {
      code: 'review_reevaluate',
      label: 'Review & Re-evaluate',
      scoreRange: [40, 59],
      conditions: [
        'Phase 1 PASS or UNCERTAIN (with RFI path)',
        'No blocking harm gates',
        'Potential but significant gaps'
      ],
      sop: [
        'Generate detailed feedback report',
        'Identify specific gaps and improvement areas',
        'Send RFI for missing information',
        'Set 90-day resubmission window',
        'Offer optional feedback call'
      ],
      feedbackStructure: {
        strengths: 'What the project does well',
        gaps: 'Specific missing information or evidence',
        concerns: 'Areas needing improvement',
        suggestions: 'Concrete steps to strengthen application',
        resubmissionGuidance: 'What would change the evaluation'
      },
      nextBestAction: 'Generate feedback and RFI',
      documentationRequired: ['evaluation_summary', 'feedback_report', 'rfi_document']
    },
    
    decline: {
      code: 'decline',
      label: 'Decline',
      scoreRange: [0, 39],
      conditions: [
        'Score below 40 OR',
        'Phase 1 FAIL OR',
        'Blocking harm gate triggered without mitigation'
      ],
      sop: [
        'Generate decline letter with clear reasons',
        'Provide constructive feedback where appropriate',
        'Offer harm-safe referrals (categories only, no specific orgs)',
        'Document for appeals process',
        'Close evaluation record'
      ],
      referralCategories: [
        'Early-stage incubators',
        'Capacity building organizations',
        'Sector-specific networks',
        'Technical assistance providers'
      ],
      notReferredIf: ['Phase 1 FAIL for harm/fraud', 'Blocking harm gate'],
      nextBestAction: 'Generate decline notice',
      documentationRequired: ['evaluation_summary', 'decline_letter', 'referral_categories']
    }
  },

  uiCopy: {
    approve_fund: {
      title: 'Recommended: Approve & Fund',
      description: 'This project meets our criteria for funding. Proceed to agreement.',
      icon: 'check-circle',
      color: 'emerald'
    },
    incubate_derisk: {
      title: 'Recommended: Incubate & De-Risk',
      description: 'This project shows promise but needs support to address specific risks.',
      icon: 'trending-up',
      color: 'amber'
    },
    review_reevaluate: {
      title: 'Recommended: Review & Re-evaluate',
      description: 'This project needs additional information or improvements before decision.',
      icon: 'refresh-cw',
      color: 'blue'
    },
    decline: {
      title: 'Recommended: Decline',
      description: 'This project does not meet our criteria at this time.',
      icon: 'x-circle',
      color: 'rose'
    }
  }
};

// ============================================================================
// SECTION G: ANTI-GAMING & INTEGRITY CONTROLS
// ============================================================================

export const ANTI_GAMING_CONFIG = {
  checks: {
    impact_theater: {
      id: 'impact_theater',
      label: 'Impact Theater',
      description: 'Impressive presentation without substance',
      triggers: [
        'High claimed impact with minimal budget',
        'Vague beneficiary definitions',
        'No baseline or comparison data',
        'Outcomes not tied to activities',
        'Celebrity involvement without substance'
      ],
      response: 'Flag for detailed evidence review; reduce confidence score'
    },
    
    manipulated_metrics: {
      id: 'manipulated_metrics',
      label: 'Manipulated Metrics',
      description: 'Metrics that appear inflated or misleading',
      triggers: [
        'Metrics 3x+ above lane benchmark without explanation',
        'Counting same beneficiary multiple times',
        'Short timeframe cherry-picking',
        'Changing definitions between periods',
        'Vanity metrics emphasized over outcomes'
      ],
      response: 'Request raw data; apply confidence penalty; require third-party verification'
    },
    
    charisma_capture: {
      id: 'charisma_capture',
      label: 'Charisma Capture',
      description: 'Over-reliance on founder persona',
      triggers: [
        'All materials focus on founder story',
        'No governance checks on founder',
        'Team presented as supporting cast',
        'Founder compensation not disclosed',
        'Founder controls all decisions'
      ],
      response: 'Evaluate project independent of founder; require governance assessment'
    },
    
    unverifiable_claims: {
      id: 'unverifiable_claims',
      label: 'Unverifiable Claims',
      description: 'Claims that cannot be independently verified',
      triggers: [
        'No third-party references provided',
        'Beneficiaries cannot be contacted',
        'Data sources not specified',
        'Partnerships cannot be confirmed',
        '"Proprietary" excuse for no data'
      ],
      response: 'Request verifiable evidence; apply heavy confidence penalty; consider Phase 1 flag'
    },
    
    benchmark_mismatch: {
      id: 'benchmark_mismatch',
      label: 'Benchmark Mismatch',
      description: 'Claims inconsistent with lane/stage norms',
      triggers: [
        'Cost per outcome far below lane average',
        'Timeline far shorter than comparable projects',
        'Scale far larger than team/budget supports',
        'Claims of unique breakthrough without evidence'
      ],
      response: 'Flag for expert review; require detailed explanation; verify against comparables'
    },
    
    evidence_laundering: {
      id: 'evidence_laundering',
      label: 'Evidence Laundering',
      description: 'Using weak evidence as if it were strong',
      triggers: [
        'Self-commissioned studies cited as "independent"',
        'Testimonials presented as outcomes data',
        'Anecdotes scaled to populations',
        'Correlation claimed as causation',
        'Pilot data extrapolated linearly'
      ],
      response: 'Classify evidence properly; apply confidence adjustment; require stronger evidence'
    },
    
    stage_laundering: {
      id: 'stage_laundering',
      label: 'Stage Laundering',
      description: 'Claiming earlier stage to avoid scrutiny',
      triggers: [
        'Organization age inconsistent with claimed stage',
        'Revenue/funding history suggests later stage',
        'Team size suggests operations beyond claimed stage',
        'Previous evaluations at different stage',
        'Public materials suggest different stage'
      ],
      response: 'Verify actual stage; apply appropriate stage expectations; flag for review'
    },
    
    governance_theater: {
      id: 'governance_theater',
      label: 'Governance Theater',
      description: 'Formal governance structures without real power',
      triggers: [
        'Board never meets or never dissents',
        'Board members are all founder-selected allies',
        'Policies exist but not followed',
        'No evidence of accountability in practice',
        'Transparency reports with no real disclosure'
      ],
      response: 'Evaluate governance in practice; request evidence of board activity; interview board members'
    }
  },

  detectionThresholds: {
    singleTriggerFlag: true,
    multiTriggerEscalate: 3,
    confidencePenaltyPerFlag: 10,
    maxPenalty: 40
  }
};

// ============================================================================
// SECTION H: PORTFOLIO OPTIMIZATION LAYER
// ============================================================================

export const PORTFOLIO_CONFIG = {
  description: 'Separate from project score; used for portfolio-level decisions',
  
  fitDimensions: {
    geographic_diversity: {
      label: 'Geographic Diversity',
      description: 'Adds diversity to portfolio geography',
      scoring: 'Higher if region underrepresented in current portfolio'
    },
    sector_diversity: {
      label: 'Sector Diversity',
      description: 'Adds diversity to portfolio sectors',
      scoring: 'Higher if lane underrepresented in current portfolio'
    },
    neglectedness: {
      label: 'Neglectedness',
      description: 'Addresses neglected problem areas',
      scoring: 'Based on EA neglectedness analysis; funding gap data'
    },
    systemic_leverage: {
      label: 'Systemic Leverage',
      description: 'Potential for systems-level change',
      scoring: 'Policy influence, market transformation, norm change potential'
    },
    strategic_fit: {
      label: 'Strategic Fit',
      description: 'Alignment with portfolio strategy',
      scoring: 'Based on current strategic priorities'
    },
    risk_contribution: {
      label: 'Risk Contribution',
      description: 'Effect on portfolio risk profile',
      scoring: 'Barbell: mix of safe bets and moonshots'
    }
  },

  barbellStrategy: {
    safeBets: {
      target: 60,
      criteria: ['Risk grade A or B', 'Stage: pilot or later', 'Confidence >= 70']
    },
    moonshots: {
      target: 20,
      criteria: ['High innovation score', 'Stage: idea or prototype', 'Transformative potential']
    },
    incubation: {
      target: 20,
      criteria: ['Tier: incubate_derisk', 'Strong team', 'Clear de-risk path']
    }
  },

  outputFormat: {
    portfolioFitScore: 'number 0-100',
    fitBreakdown: 'object with dimension scores',
    portfolioRecommendation: 'string: prioritize | neutral | deprioritize',
    barbellCategory: 'string: safe_bet | moonshot | incubation'
  }
};

// ============================================================================
// SECTION I: DERIVED TAGS TAXONOMY
// ============================================================================

export const DERIVED_TAGS_CONFIG = {
  tags: {
    // Impact tags
    'high_impact_high_confidence': {
      condition: 'impactScore >= 35 AND confidence >= 70',
      label: 'High Impact / High Confidence',
      color: 'emerald',
      priority: 1
    },
    'high_impact_low_evidence': {
      condition: 'impactScore >= 35 AND confidence < 50',
      label: 'High Impact / Low Evidence',
      color: 'amber',
      priority: 2
    },
    
    // Risk tags
    'moonshot_high_risk': {
      condition: 'innovationScore >= 8 AND riskGrade in [D, F]',
      label: 'Moonshot / High Execution Risk',
      color: 'purple',
      priority: 2
    },
    'governance_red_flag': {
      condition: 'antiGamingFlags includes governance_theater OR charisma_capture',
      label: 'Governance Red Flag',
      color: 'rose',
      priority: 1
    },
    'harm_gate_triggered': {
      condition: 'anyHarmGateTriggered',
      label: 'Potential Harm Gate',
      color: 'rose',
      priority: 1
    },
    
    // Model tags
    'blue_economy_cascade': {
      condition: 'regenerativeScore >= 8 AND blueEconomyIndicators present',
      label: 'Blue Economy Cascade',
      color: 'cyan',
      priority: 2
    },
    'community_led': {
      condition: 'communityIntegrationScore >= 8',
      label: 'Community-Led',
      color: 'violet',
      priority: 2
    },
    
    // Process tags
    'needs_rfi_baseline': {
      condition: 'gaps includes "baseline_data"',
      label: 'Needs RFI: Missing Baseline',
      color: 'blue',
      priority: 3
    },
    'needs_rfi_governance': {
      condition: 'gaps includes "governance_docs"',
      label: 'Needs RFI: Governance Docs',
      color: 'blue',
      priority: 3
    },
    'needs_rfi_evidence': {
      condition: 'confidence < 40',
      label: 'Needs RFI: Insufficient Evidence',
      color: 'blue',
      priority: 3
    },
    'ready_for_approval': {
      condition: 'tier == approve_fund AND confidence >= 70 AND riskGrade in [A, B]',
      label: 'Ready for Approval',
      color: 'emerald',
      priority: 1
    },
    
    // Stage tags
    'early_stage_promising': {
      condition: 'stage in [idea, prototype] AND baseScore >= 60',
      label: 'Early Stage Promising',
      color: 'amber',
      priority: 2
    },
    'scaling_ready': {
      condition: 'stage == pilot AND feasibilityScore >= 8 AND confidence >= 70',
      label: 'Scaling Ready',
      color: 'emerald',
      priority: 2
    },
    
    // Anti-gaming tags
    'integrity_concern': {
      condition: 'antiGamingFlags.length >= 2',
      label: 'Integrity Concern',
      color: 'rose',
      priority: 1
    },
    'evidence_quality_low': {
      condition: 'evidenceQualityScore < 40',
      label: 'Evidence Quality Low',
      color: 'amber',
      priority: 2
    }
  },

  queueRouting: {
    'high_priority_review': {
      tags: ['governance_red_flag', 'harm_gate_triggered', 'integrity_concern'],
      assignTo: 'senior_reviewer',
      sla: '24_hours'
    },
    'standard_review': {
      tags: ['ready_for_approval', 'high_impact_high_confidence'],
      assignTo: 'any_reviewer',
      sla: '72_hours'
    },
    'rfi_queue': {
      tags: ['needs_rfi_baseline', 'needs_rfi_governance', 'needs_rfi_evidence'],
      assignTo: 'rfi_coordinator',
      sla: '48_hours'
    },
    'expert_review': {
      tags: ['moonshot_high_risk', 'blue_economy_cascade'],
      assignTo: 'domain_expert',
      sla: '1_week'
    }
  }
};

// ============================================================================
// SECTION J: CALIBRATION & INTER-RATER RELIABILITY
// ============================================================================

export const CALIBRATION_CONFIG = {
  calibrationSessions: {
    frequency: 'monthly',
    structure: [
      'Review 3-5 projects independently',
      'Compare scores in group session',
      'Discuss divergences (>10 point difference)',
      'Update rubric clarifications as needed',
      'Document consensus interpretations'
    ],
    participants: 'All active reviewers + AI system'
  },

  goldStandardProjects: {
    description: 'Pre-scored projects for calibration and drift detection',
    count: 20,
    coverage: 'Across all lanes, stages, and score ranges',
    usage: [
      'New reviewer training',
      'Monthly calibration checks',
      'AI model validation',
      'Drift detection'
    ]
  },

  driftDetection: {
    metrics: [
      'Average score by reviewer over time',
      'Standard deviation from gold standards',
      'Correlation with other reviewers',
      'Category-specific scoring patterns'
    ],
    thresholds: {
      warning: 'Average deviation > 8 points from gold standard',
      action: 'Average deviation > 15 points OR systematic bias detected'
    },
    response: [
      'Individual calibration session',
      'Review of recent evaluations',
      'Rubric refresher training'
    ]
  },

  secondReviewTriggers: [
    'Final score within 5 points of tier boundary',
    'High-value projects (>$1M)',
    'Any harm gate triggered',
    'Confidence score < 40',
    'Anti-gaming flags present',
    'Reviewer requests second opinion',
    'Random sample (10% of all evaluations)'
  ],

  appealsWorkflow: {
    eligibility: 'Any declined or downgraded project within 30 days',
    process: [
      'Submit appeal with new information or objection to evaluation',
      'Assigned to different reviewer than original',
      'Re-evaluate specific contested areas only',
      'Final decision by appeals committee if disagreement persists'
    ],
    timeline: '14 business days',
    documentation: 'Full audit trail of original and appeal evaluation'
  },

  aiHumanAlignment: {
    monitoring: [
      'Compare AI scores to human scores on same projects',
      'Track override rates and patterns',
      'Identify systematic AI biases',
      'Update AI prompts based on human feedback'
    ],
    acceptableDeviation: '±10 points average; ±5 points for tier boundaries',
    recalibrationTrigger: 'Deviation exceeds acceptable range for >20% of projects'
  }
};

// ============================================================================
// SECTION K: AI OUTPUT FORMAT & PROCESSING
// ============================================================================

export const AI_OUTPUT_SCHEMA = {
  projectEvaluation: {
    type: 'object',
    properties: {
      project_id: { type: 'string' },
      evaluation_timestamp: { type: 'string', format: 'date-time' },
      model_version: { type: 'string' },
      processing_time_ms: { type: 'number' },
      
      // Phase 1
      phase1: {
        type: 'object',
        properties: {
          result: { type: 'string', enum: ['pass', 'fail', 'uncertain'] },
          flags: { type: 'array', items: { type: 'string' } },
          rationale: { type: 'string' },
          evidence: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                question_id: { type: 'string' },
                assessment: { type: 'string' },
                evidence_snippets: { type: 'array', items: { type: 'string' } },
                confidence: { type: 'number' }
              }
            }
          },
          rfi_items: { type: 'array', items: { type: 'string' } }
        }
      },
      
      // Phase 2
      phase2: {
        type: 'object',
        properties: {
          base_score: { type: 'number' },
          confidence: { type: 'number' },
          gaps: { type: 'array', items: { type: 'string' } },
          scores: {
            type: 'object',
            description: 'Nested object matching PHASE2_SCORING_RUBRIC structure',
            additionalProperties: {
              type: 'object',
              properties: {
                score: { type: 'number', minimum: 1, maximum: 10 },
                confidence: { type: 'number', minimum: 0, maximum: 100 },
                rationale: { type: 'string' },
                evidence_snippets: { type: 'array', items: { type: 'string' } },
                evidence_quality: { type: 'string', enum: ['verified', 'self_reported', 'missing'] },
                gaps: { type: 'array', items: { type: 'string' } }
              }
            }
          },
          stage_adjustments: { type: 'object' },
          lane_benchmark_comparison: { type: 'object' }
        }
      },
      
      // Phase 3
      phase3: {
        type: 'object',
        properties: {
          execution_risks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                dimension: { type: 'string' },
                severity: { type: 'number', minimum: 1, maximum: 5 },
                factors: { type: 'array', items: { type: 'string' } },
                mitigation: { type: 'string' }
              }
            }
          },
          execution_multiplier: { type: 'number' },
          harm_gates: {
            type: 'object',
            additionalProperties: {
              type: 'object',
              properties: {
                triggered: { type: 'boolean' },
                rationale: { type: 'string' },
                mitigation_status: { type: 'string' }
              }
            }
          },
          risk_grade: { type: 'string', enum: ['A', 'B', 'C', 'D', 'F'] },
          derisking_plan: { type: 'array', items: { type: 'string' } }
        }
      },
      
      // Phase 4
      phase4: {
        type: 'object',
        properties: {
          final_score: { type: 'number' },
          decision_tier: { type: 'string', enum: ['approve_fund', 'incubate_derisk', 'review_reevaluate', 'decline'] },
          conditions: { type: 'array', items: { type: 'string' } },
          next_best_action: { type: 'string' }
        }
      },
      
      // Derived
      derived_tags: { type: 'array', items: { type: 'string' } },
      anti_gaming_flags: { type: 'array', items: { type: 'string' } },
      portfolio_fit: {
        type: 'object',
        properties: {
          score: { type: 'number' },
          breakdown: { type: 'object' },
          recommendation: { type: 'string' },
          barbell_category: { type: 'string' }
        }
      }
    }
  },

  confidenceComputationLogic: `
    1. Start with base confidence 70
    2. Add modifiers based on evidence quality:
       - Third-party verified data: +15
       - Multiple corroborating sources: +10
       - Self-reported only: -15
       - Missing key evidence: -20 per gap
       - Inconsistent data found: -25
       - Unverifiable claims: -30
    3. Add stage/lane modifiers:
       - Evidence appropriate for stage: +5
       - Meets lane benchmarks: +5
    4. Clamp to [0, 100]
  `,

  evidenceSnippetRules: {
    maxLength: 200,
    format: 'Direct quote or specific data point with source reference',
    required: 'At least one snippet per subcriterion score',
    quality: 'Prefer quantitative over qualitative; third-party over self-reported'
  },

  acceptAllHighConfidence: {
    threshold: {
      confidence: 80,
      riskGrade: ['A', 'B'],
      antiGamingFlags: 0,
      harmGates: 0
    },
    behavior: 'Auto-approve for human review queue; flag as "AI High Confidence"',
    humanReviewRequired: false,
    escalationOn: ['Budget > $500K', 'Random 10% sample', 'New lane/stage combination']
  }
};

// ============================================================================
// SECTION L: WORKED EXAMPLES
// ============================================================================

export const WORKED_EXAMPLES = {
  projectA: {
    name: 'Humanitarian Farm Aid Project',
    input: {
      title: 'Regional Farm Resilience Initiative',
      description: 'Supporting 5 small-scale farmers across 3000 acres with inputs, storage infrastructure, and market access to stabilize income and regional food supply.',
      budget: 1600000,
      lane_code: 'food_security',
      lane_secondary: ['economic_resilience', 'regenerative_ag'],
      stage: 'pilot',
      geography: 'Rural Midwest USA',
      team_size: 8,
      organization_name: 'Heartland Food Security Alliance',
      metadata: {
        farmers_contracted: 5,
        acres_covered: 3000,
        storage_capacity_tons: 500,
        baseline_income_data: true,
        soil_health_baseline: true,
        year_in_pilot: 1
      }
    },
    evaluation: {
      phase1: {
        result: 'pass',
        flags: [],
        rationale: 'No ethical concerns identified. Clear consent mechanisms with contracted farmers. Transparent governance with farmer cooperative board. No manipulation indicators.',
        evidence: [
          { question_id: 'q1_harm_potential', assessment: 'No harm potential identified', confidence: 90 },
          { question_id: 'q2_consent', assessment: 'Formal contracts with all farmers', confidence: 95 },
          { question_id: 'q5_financial_transparency', assessment: 'Detailed budget provided with cooperative oversight', confidence: 85 }
        ],
        rfi_items: []
      },
      phase2: {
        base_score: 74,
        confidence: 72,
        gaps: ['Third-party yield verification not yet available', 'Long-term sustainability model details'],
        scores: {
          planetary_wellbeing: { score: 7, rationale: 'Regenerative practices planned but early-stage; soil health baseline established', evidence_snippets: ['Soil carbon baseline: 2.1% average'] },
          human_wellbeing: { score: 8, rationale: '5 farm families directly supported; ~500 households in food access zone', evidence_snippets: ['Contract signed with 5 farmers covering 3000 acres'] },
          regenerative_potential: { score: 7, rationale: 'Cover cropping and reduced tillage in plan; not yet fully implemented', evidence_snippets: ['Regenerative practice plan submitted'] },
          ethical_governance: { score: 8, rationale: 'Farmer cooperative governance; transparent budget; community accountability', evidence_snippets: ['Cooperative bylaws with farmer board seats'] },
          cost_effectiveness: { score: 7, rationale: '$320K per farm supported; includes capital investment in storage', evidence_snippets: ['Budget breakdown: $800K storage, $500K inputs, $300K operations'] },
          scalability_model: { score: 6, rationale: 'Regional model; scaling path unclear beyond initial farms', evidence_snippets: ['No formal scaling plan provided'] },
          expertise_track_record: { score: 7, rationale: 'Team includes agronomists and community organizers; first large project', evidence_snippets: ['Lead agronomist: 15 years experience'] },
          community_integration: { score: 8, rationale: 'Farmer-led design; cooperative structure; local leadership', evidence_snippets: ['3 of 5 farmers on steering committee'] },
          innovation: { score: 5, rationale: 'Standard farm support model; storage hub is useful but not novel', evidence_snippets: [] },
          replicability: { score: 6, rationale: 'Model documented; context-specific to region', evidence_snippets: ['Operations manual in development'] }
        },
        stage_adjustments: { pilot_evidence_expectations: 'met', pilot_feasibility: 'adequate' },
        lane_benchmark_comparison: { cost_per_farmer: 'above_average', acres_per_dollar: 'average' }
      },
      phase3: {
        execution_risks: [
          { dimension: 'team_risk', severity: 2, factors: ['First large project'], mitigation: 'Experienced advisors engaged' },
          { dimension: 'external_risk', severity: 3, factors: ['Weather dependency', 'Commodity price volatility'], mitigation: 'Crop insurance, diversified crops' },
          { dimension: 'financial_risk', severity: 2, factors: ['Single funder dependency'], mitigation: 'Pursuing additional funders' }
        ],
        execution_multiplier: 0.88,
        harm_gates: {
          physical_harm: { triggered: false },
          environmental_harm: { triggered: false },
          financial_harm: { triggered: false }
        },
        risk_grade: 'B',
        derisking_plan: ['Diversify funding sources', 'Establish weather contingency fund', 'Complete third-party yield monitoring']
      },
      phase4: {
        final_score: 65, // 74 * 0.88 ≈ 65
        decision_tier: 'incubate_derisk',
        conditions: [
          'Establish third-party yield monitoring by month 6',
          'Secure at least one additional funder',
          'Complete detailed scaling plan'
        ],
        next_best_action: 'Create incubation roadmap with milestone-based funding'
      },
      derived_tags: ['community_led', 'early_stage_promising', 'needs_rfi_evidence'],
      anti_gaming_flags: [],
      portfolio_fit: {
        score: 72,
        breakdown: { geographic_diversity: 8, sector_diversity: 6, neglectedness: 7 },
        recommendation: 'neutral',
        barbell_category: 'safe_bet'
      }
    }
  },

  projectB: {
    name: 'Ocean Outfall Elimination - Wastewater Treatment Upgrade',
    input: {
      title: 'Coastal County Wastewater Treatment Plant Upgrade',
      description: 'Major infrastructure upgrade to eliminate ocean outfall discharge, including new treatment systems, regulatory compliance, and marine ecosystem protection.',
      budget: 45000000,
      lane_code: 'wastewater',
      lane_secondary: ['marine_protection', 'water_infrastructure'],
      stage: 'idea', // Planning/regulatory phase
      geography: 'Coastal California',
      team_size: 15,
      organization_name: 'Coastal County Water Authority',
      metadata: {
        population_served: 250000,
        current_outfall_mgd: 20,
        permit_status: 'in_progress',
        regulatory_deadline: '2030',
        contractor_bids: 3,
        environmental_impact_study: 'complete'
      }
    },
    evaluation: {
      phase1: {
        result: 'pass',
        flags: [],
        rationale: 'Government infrastructure project with established regulatory framework. Clear public benefit. Standard procurement processes.',
        evidence: [
          { question_id: 'q1_harm_potential', assessment: 'Project eliminates existing harm (ocean discharge)', confidence: 95 },
          { question_id: 'q5_financial_transparency', assessment: 'Public agency with audit requirements', confidence: 90 }
        ],
        rfi_items: []
      },
      phase2: {
        base_score: 78,
        confidence: 68,
        gaps: ['Final permit approval pending', 'Detailed construction timeline', 'Marine recovery baseline incomplete'],
        scores: {
          planetary_wellbeing: { score: 9, rationale: 'Eliminates 20MGD ocean outfall; significant marine ecosystem benefit', evidence_snippets: ['EIS documents 20MGD raw discharge elimination'] },
          human_wellbeing: { score: 8, rationale: '250K residents served; improved water quality and public health', evidence_snippets: ['Service area: 250,000 population'] },
          regenerative_potential: { score: 7, rationale: 'Enables marine ecosystem recovery; water reuse potential', evidence_snippets: ['Tertiary treatment enables 50% water reuse'] },
          ethical_governance: { score: 8, rationale: 'Public agency with elected oversight; standard procurement', evidence_snippets: ['Public board meetings; competitive bidding'] },
          cost_effectiveness: { score: 6, rationale: '$180/person served - high but standard for major infrastructure', evidence_snippets: ['$45M / 250K = $180/person'] },
          scalability_model: { score: 5, rationale: 'Single project; not a replicable model', evidence_snippets: [] },
          expertise_track_record: { score: 8, rationale: 'Established water authority; experienced engineering team', evidence_snippets: ['30-year operating history; previous upgrades completed'] },
          community_integration: { score: 6, rationale: 'Public hearings held; standard agency engagement', evidence_snippets: ['3 public comment periods completed'] },
          innovation: { score: 5, rationale: 'Standard wastewater technology; no innovation', evidence_snippets: [] },
          replicability: { score: 4, rationale: 'Site-specific infrastructure; limited transferability', evidence_snippets: [] }
        },
        stage_adjustments: { idea_stage: 'Planning phase appropriate for infrastructure; higher uncertainty accepted' },
        lane_benchmark_comparison: { cost_per_mgd: 'average', timeline: 'typical' }
      },
      phase3: {
        execution_risks: [
          { dimension: 'external_risk', severity: 4, factors: ['Permit approval uncertainty', 'Political changes', 'Regulatory requirements may increase'], mitigation: 'Early regulatory engagement' },
          { dimension: 'financial_risk', severity: 3, factors: ['Large capex', 'Cost escalation risk', 'Multi-year construction'], mitigation: 'Contingency budget; phased approach' },
          { dimension: 'timeline_risk', severity: 4, factors: ['Regulatory timeline', 'Construction complexity', 'Supply chain'], mitigation: 'Buffer built in; alternative suppliers identified' }
        ],
        execution_multiplier: 0.78,
        harm_gates: {
          environmental_harm: { triggered: false, rationale: 'Project reduces environmental harm' },
          regulatory_shutdown: { triggered: false, rationale: 'Regulatory mandate supports project' }
        },
        risk_grade: 'C',
        derisking_plan: ['Secure final permit approval', 'Lock in contractor pricing', 'Establish construction milestones with penalties']
      },
      phase4: {
        final_score: 61, // 78 * 0.78 ≈ 61
        decision_tier: 'incubate_derisk',
        conditions: [
          'Permit approval secured before major funding release',
          'Contractor agreement with fixed pricing',
          'Quarterly progress reporting',
          'Marine ecosystem monitoring plan approved'
        ],
        next_best_action: 'Milestone-based funding agreement tied to regulatory and construction milestones'
      },
      derived_tags: ['high_impact_high_confidence', 'governance_theater', 'needs_rfi_governance'],
      anti_gaming_flags: [],
      portfolio_fit: {
        score: 65,
        breakdown: { geographic_diversity: 5, systemic_leverage: 8, neglectedness: 6 },
        recommendation: 'neutral',
        barbell_category: 'safe_bet'
      }
    }
  },

  projectE: {
    name: 'Activation / Deprogramming Chamber',
    input: {
      title: 'Quantum Ascension Healing Chamber',
      description: 'Revolutionary healing device combining quantum energy fields, sound frequencies, and light therapy to activate DNA, release trauma, support ascension, and heal multiple conditions including cancer, depression, and chronic pain.',
      budget: 750000,
      lane_code: 'wellness_devices',
      stage: 'prototype',
      geography: 'Global (online sales)',
      team_size: 4,
      organization_name: 'Ascension Technologies LLC',
      metadata: {
        device_prototype: true,
        fda_clearance: false,
        clinical_trials: false,
        testimonials_count: 47,
        claims: ['DNA activation', 'trauma release', 'ascension support', 'cancer healing', 'chronic pain relief'],
        price_per_unit: 15000
      }
    },
    evaluation: {
      phase1: {
        result: 'fail',
        flags: ['medical_misinfo', 'unverifiable_claims', 'pseudoscience_primary', 'harm_gate_physical'],
        rationale: 'Project makes serious medical claims (cancer treatment, chronic pain relief) without any scientific evidence, clinical trials, or regulatory approval. "Quantum" and "DNA activation" claims are scientifically unsupported. High price point ($15K) targeting potentially vulnerable individuals seeking alternative treatments. Multiple manipulation indicators present.',
        evidence: [
          { question_id: 'q1_harm_potential', assessment: 'CLEAR HARM: May delay or replace evidence-based treatment for serious conditions', confidence: 95 },
          { question_id: 'q4_claims_verification', assessment: 'UNVERIFIABLE: No peer-reviewed studies, no clinical trials, no third-party validation', confidence: 98 },
          { question_id: 'q8_scientific_basis', assessment: 'PSEUDOSCIENCE: "Quantum energy fields" and "DNA activation" are not scientifically valid concepts as used', confidence: 95 },
          { question_id: 'q9_manipulation_screen', assessment: 'FLAGGED: Exclusive truth claims ("revolutionary"), dependency creation (ongoing sessions needed), financial exploitation (high price for unproven device)', confidence: 85 }
        ],
        rfi_items: [] // Not applicable for FAIL
      },
      phase2: {
        base_score: 0, // Not scored due to Phase 1 FAIL
        confidence: 0,
        gaps: ['All evidence missing'],
        scores: {}, // Not applicable
        stage_adjustments: {},
        lane_benchmark_comparison: {}
      },
      phase3: {
        execution_risks: [],
        execution_multiplier: 0,
        harm_gates: {
          physical_harm: { triggered: true, rationale: 'May cause harm by delaying evidence-based treatment for cancer and other serious conditions' },
          psychological_harm: { triggered: true, rationale: 'False hope exploitation; may cause psychological harm when device fails to deliver claimed results' },
          financial_harm: { triggered: true, rationale: '$15K price point for unproven device targeting vulnerable health-seekers' }
        },
        risk_grade: 'F',
        derisking_plan: [] // Not applicable
      },
      phase4: {
        final_score: 0,
        decision_tier: 'decline',
        conditions: [],
        next_best_action: 'Generate decline notice with clear explanation of concerns'
      },
      derived_tags: ['harm_gate_triggered', 'integrity_concern', 'governance_red_flag'],
      anti_gaming_flags: ['unverifiable_claims', 'impact_theater', 'evidence_laundering'],
      portfolio_fit: {
        score: 0,
        breakdown: {},
        recommendation: 'reject',
        barbell_category: null
      }
    },
    declineRationale: `
      This project is declined due to fundamental ethical concerns:
      
      1. MEDICAL MISINFORMATION: Claims to treat cancer, chronic pain, and other serious medical conditions without any scientific evidence, clinical trials, or regulatory approval.
      
      2. PSEUDOSCIENCE: "Quantum energy fields" and "DNA activation" as described are not scientifically supported concepts. No peer-reviewed research supports the claimed mechanisms.
      
      3. POTENTIAL FOR HARM: By claiming to treat serious conditions, this device may cause people to delay or forgo evidence-based medical treatment, potentially leading to serious harm or death.
      
      4. FINANCIAL EXPLOITATION: The $15,000 price point for an unproven device specifically targets vulnerable individuals seeking alternative treatments.
      
      5. MANIPULATION INDICATORS: The marketing language shows patterns associated with health fraud, including exclusive claims, scientific-sounding but meaningless terminology, and testimonial-based evidence.
      
      This project does not qualify for RFI or incubation. We recommend the applicants consult with medical professionals and regulatory authorities before pursuing health claims.
    `
  }
};

export default {
  LANE_TAXONOMY,
  STAGE_DEFINITIONS,
  PHASE1_CONFIG,
  PHASE2_SCORING_RUBRIC,
  PHASE3_RISK_CONFIG,
  PHASE4_DECISION_CONFIG,
  ANTI_GAMING_CONFIG,
  PORTFOLIO_CONFIG,
  DERIVED_TAGS_CONFIG,
  CALIBRATION_CONFIG,
  AI_OUTPUT_SCHEMA,
  WORKED_EXAMPLES
};