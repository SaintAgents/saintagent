// GGG Earnings Matrix helpers

export const GGG_TO_USD = 145; // 1.00 GGG = $145.00
export const TIERS = [0.10, 0.15, 0.20, 0.25, 0.30, 0.35, 0.40, 0.45, 0.50];

export const ACTIONS = [
  { key: 'post_update', title: 'Daily Field Update', base: 0.10 },
  { key: 'comment_helpful', title: 'Helpful Comment (Accepted)', base: 0.15 },
  { key: 'thread_summary', title: 'Thread Summary', base: 0.15 },
  { key: 'how_to', title: 'Structured How-To', base: 0.20 },
  { key: 'template', title: 'Template / SOP Snippet', base: 0.20 },
  { key: 'weekly_recap', title: 'Weekly Team Recap', base: 0.20 },

  { key: 'mission_onboarding', title: 'Mission Onboarding', base: 0.10 },
  { key: 'task_confirmed', title: 'Mission Task Confirmed', base: 0.15 },
  { key: 'milestone', title: 'Milestone Deliverable', base: 0.25 },
  { key: 'impact_unlock', title: 'Impact Contribution (Adopted)', base: 0.30 },
  { key: 'lead_sprint', title: 'Lead Sprint Segment', base: 0.35 },

  { key: 'security_review', title: 'Security Review', base: 0.40 },
  { key: 'cross_mission', title: 'Cross-Mission Coordination', base: 0.45 },
  { key: 'mission_lead', title: 'Mission Lead (End-to-End)', base: 0.50 },

  { key: 'agent_publish', title: 'Agent Published (Usage Threshold)', base: 0.30 },
  { key: 'agent_flagship', title: 'Flagship Agent Release', base: 0.50 },

  { key: 'lesson_micro', title: 'Micro-Lesson + Quiz', base: 0.10 },
  { key: 'module_complete', title: 'Module Complete + Assessment', base: 0.15 },
  { key: 'class_final', title: 'Class Final (Intermediate)', base: 0.20 },
  { key: 'security_trained', title: 'Security Trained Certification', base: 0.25 },
  { key: 'mentor_ta', title: 'TA / Mentor for Cohort', base: 0.35 },
];

function applyLifts(base, { verified, securityTrained, impactAdopted, leadership } = {}) {
  let tier = base;

  // Caps (gates)
  if (!verified) tier = Math.min(tier, 0.20);
  if (!securityTrained) tier = Math.min(tier, 0.25);

  // Impact lift (adoption/usage)
  if (impactAdopted) {
    if (tier === 0.20) tier = 0.25;
    else if (tier === 0.25) tier = 0.30;
    else if (tier === 0.30) tier = 0.35;
  }

  // Leadership lift (ownership/coordination)
  if (leadership) {
    if (tier < 0.35 && tier >= 0.20) tier = 0.35; // contributor -> lead baseline
    else if (tier >= 0.35) tier = Math.min(0.50, +(tier + 0.05).toFixed(2));
  }

  return Math.min(0.50, tier);
}

export function calculatePayout(actionKey, lifts) {
  const act = ACTIONS.find(a => a.key === actionKey);
  const base = act?.base ?? 0.10;
  const tier = applyLifts(base, lifts);
  return { base, tier, ggg: tier, usd: +(tier * GGG_TO_USD).toFixed(2) };
}

export const MATRIX_SECTIONS = [
  { tier: 0.10, title: 'Entry Actions', items: [
    'Daily field update using template',
    'Useful comment that improves a thread',
    'Submit resource link with short summary',
    'Mission onboarding micro-task'
  ] },
  { tier: 0.15, title: 'Verified Micro-Contributions', items: [
    'Accepted answer / moderator-marked helpful',
    'Short guide confirmed to work',
    'Task completion confirmed by owner',
    'Module complete + assessment'
  ] },
  { tier: 0.20, title: 'Structured Deliverables', items: [
    'How-To with steps + expected outcome',
    'Template / SOP / checklist',
    'Weekly team recap',
    'Defined work item delivered'
  ] },
  { tier: 0.25, title: 'Completion Milestones', items: [
    'Mini-playbook with edge cases',
    'Community help session w/ notes',
    'Milestone deliverable accepted',
    'Security Trained / role unlock'
  ] },
  { tier: 0.30, title: 'Impact Contributions', items: [
    'Reference page adopted by others',
    'Toolkit adopted by a mission',
    'Resolve mid-complexity blocker',
    'Agent passes safety + usage threshold'
  ] },
  { tier: 0.35, title: 'Leadership Contributions', items: [
    'Run recurring office hours + notes',
    'Curated monthly digest as reference',
    'Lead sprint segment (plan → deliver)',
    'TA / mentor for cohort'
  ] },
  { tier: 0.40, title: 'High-Trust Ops', items: [
    'Structured security review + report',
    'Solve high-priority multi-team blocker',
    'Manage dispute resolution to completion',
    'Maintain node/network health with logs'
  ] },
  { tier: 0.45, title: 'Cross-Team Authority', items: [
    'Coordinate across missions to a combined milestone',
    'Incident response owner with postmortem',
    'Reviewer/moderator for high-value submissions'
  ] },
  { tier: 0.50, title: 'Top-Tier Outcomes', items: [
    'Lead mission e2e (brief → closeout)',
    'Platform-standard outcome (SOP/policy)',
    'Launch full class track',
    'Flagship agent / critical incident resolved'
  ] },
];