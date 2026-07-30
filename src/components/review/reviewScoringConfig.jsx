// Review scoring configuration matching the AI evaluation rubric
export const REVIEW_SECTIONS = [
  {
    id: 'planetary_wellbeing',
    label: 'Planetary Wellbeing',
    category: 'Impact',
    weight: 20,
    guiding: 'Does this regenerate or deplete natural systems? What is the ecological footprint?',
  },
  {
    id: 'human_wellbeing',
    label: 'Human Wellbeing',
    category: 'Impact',
    weight: 20,
    guiding: 'How many people benefit and how deeply? Does it address root causes?',
  },
  {
    id: 'regenerative_potential',
    label: 'Regenerative Potential',
    category: 'Regenerative & Ethical',
    weight: 15,
    guiding: 'Does this build capacity for ongoing regeneration? Circular resource flows?',
  },
  {
    id: 'ethical_governance',
    label: 'Ethical Governance',
    category: 'Regenerative & Ethical',
    weight: 10,
    guiding: 'Is decision-making transparent and participatory?',
  },
  {
    id: 'cost_effectiveness',
    label: 'Cost Effectiveness',
    category: 'Feasibility',
    weight: 10,
    guiding: 'What is the cost per unit of impact? How does it compare to alternatives?',
  },
  {
    id: 'scalability_model',
    label: 'Scalability & Model',
    category: 'Feasibility',
    weight: 10,
    guiding: 'Is there a path to sustainability? Can it scale?',
  },
  {
    id: 'expertise_track_record',
    label: 'Expertise & Track Record',
    category: 'Team',
    weight: 5,
    guiding: 'Does the team have relevant expertise and delivery track record?',
  },
  {
    id: 'community_integration',
    label: 'Community Integration',
    category: 'Team',
    weight: 5,
    guiding: 'Is the community genuinely engaged in design and governance?',
  },
  {
    id: 'innovation',
    label: 'Innovation',
    category: 'Innovation',
    weight: 2,
    guiding: 'Is this a genuinely new approach that could unlock new impact?',
  },
  {
    id: 'replicability',
    label: 'Replicability',
    category: 'Innovation',
    weight: 3,
    guiding: 'Can others adopt this approach? Is knowledge documented?',
  },
];

export const CHECKLIST_ITEMS = [
  { id: 'project_overview', label: 'Project Overview Reviewed', description: 'Read title, description, problem statement, and all attached documents.' },
  { id: 'ethics_screening', label: 'Ethics Screening', description: 'Checked for harm potential, consent, vulnerable populations, and manipulation indicators.' },
  { id: 'impact_assessment', label: 'Impact Assessment', description: 'Evaluated planetary and human wellbeing potential with evidence.' },
  { id: 'financial_review', label: 'Financial Review', description: 'Reviewed budget, cost-effectiveness, revenue model, and funding sources.' },
  { id: 'team_evaluation', label: 'Team Evaluation', description: 'Assessed team expertise, track record, and community integration.' },
  { id: 'risk_assessment', label: 'Risk Assessment', description: 'Identified execution, financial, technical, and external risks.' },
  { id: 'governance_review', label: 'Governance Review', description: 'Evaluated governance structure, transparency, and accountability.' },
  { id: 'evidence_verification', label: 'Evidence Verification', description: 'Verified claims against provided evidence and flagged unverifiable claims.' },
];

export function calculateWeightedScore(sectionScores) {
  if (!sectionScores) return 0;
  let totalWeight = 0;
  let weightedSum = 0;
  REVIEW_SECTIONS.forEach(s => {
    const score = sectionScores[s.id];
    if (score != null && score > 0) {
      weightedSum += score * s.weight;
      totalWeight += s.weight;
    }
  });
  if (totalWeight === 0) return 0;
  // Normalize to 0-100 scale (scores are 1-10, weight is percentage)
  return Math.round((weightedSum / totalWeight) * 10);
}

export const RECOMMENDATION_OPTIONS = [
  { value: 'approve_fund', label: 'Approve & Fund', color: 'emerald', scoreRange: '80-100' },
  { value: 'incubate_derisk', label: 'Incubate & De-Risk', color: 'amber', scoreRange: '60-79' },
  { value: 'review_reevaluate', label: 'Review & Re-evaluate', color: 'blue', scoreRange: '40-59' },
  { value: 'decline', label: 'Decline', color: 'rose', scoreRange: '0-39' },
];