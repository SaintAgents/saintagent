// GGG Earnings Matrix helpers
// 1 GGG ≈ $145 (1 gram gold). Tiers scale from 0.001 to 1.0 GGG.
// Two-tier system: BONUS (60-day beta) and LIVE (post-beta at 50% value)

export const GGG_TO_USD = 145; // 1.00 GGG ≈ $145 (1 gram gold)

// Tier mode: 'bonus' = 60-day beta incentive, 'live' = post-beta (50% of bonus)
export const TIER_MODES = {
  bonus: { label: 'Bonus Period (60-Day Beta)', multiplier: 1.0 },
  live: { label: 'Live Tier', multiplier: 0.5 }
};

// Default tier mode - can be toggled in UI
export let currentTierMode = 'bonus';
export const setTierMode = (mode) => { currentTierMode = mode; };
export const getTierMode = () => currentTierMode;

// Tiers now scale from 0.001 to 1.0 GGG (bonus period values)
export const TIERS = [0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1.0];

export const ACTIONS = [
  { key: 'posting', title: 'Posting', base: 0.001, definition: 'A basic post or update that meets minimum quality standards (on-topic, useful, and not spam).' },
  { key: 'post_update', title: 'Daily Field Update', base: 0.005, definition: 'A short daily report on what you did, observed, or progressed that day—focused on signal (status, blockers, key insights), not noise.' },
  { key: 'comment_helpful', title: 'Helpful Comment (Accepted)', base: 0.01, definition: 'A comment that meaningfully solves a problem, clarifies confusion, or adds value and is marked as "accepted" or "helpful" by the mission owner/mod.' },
  { key: 'thread_summary', title: 'Thread Summary', base: 0.01, definition: 'A concise summary of a discussion thread, capturing key decisions, options, links, and next steps so others do not have to read the entire thread.' },
  { key: 'how_to', title: 'Structured How-To', base: 0.02, definition: 'A step-by-step guide with clear structure (title, steps, checks, tips) that helps others repeat a process reliably.' },
  { key: 'template', title: 'Template / SOP Snippet', base: 0.02, definition: 'A reusable template or SOP segment that others can plug into their own work (e.g., checklists, email templates, doc skeletons).' },
  { key: 'weekly_recap', title: 'Weekly Team Recap', base: 0.02, definition: 'A weekly overview of what the team accomplished, current status, blockers, and upcoming priorities in one clean recap.' },

  { key: 'mission_onboarding', title: 'Mission Onboarding', base: 0.005, definition: 'Setting up a new agent or member on a mission—sharing context, links, expectations, and making sure they are ready to operate.' },
  { key: 'task_confirmed', title: 'Mission Task Confirmed', base: 0.01, definition: 'Confirming a specific task is fully actionable (requirements clarified, dependencies identified, acceptance criteria defined).' },
  { key: 'milestone', title: 'Milestone Deliverable', base: 0.05, definition: 'Delivering a major piece of work tied to a defined milestone (e.g., draft complete, feature built, report finished).' },
  { key: 'impact_unlock', title: 'Impact Contribution (Adopted)', base: 0.1, definition: 'A contribution (idea, doc, flow, pattern) that gets adopted into live use—actually implemented, not just proposed.' },
  { key: 'lead_sprint', title: 'Lead Sprint Segment', base: 0.2, definition: 'Owning planning and execution for a defined chunk of work/time (e.g., a one-week sprint), including coordination and follow-through.' },

  { key: 'security_review', title: 'Security Review', base: 0.3, definition: 'A focused review of flows, data handling, and permissions with documented risks and recommendations.' },
  { key: 'cross_mission', title: 'Cross-Mission Coordination', base: 0.5, definition: 'Aligning multiple missions or teams—resolving conflicts, syncing dependencies, and making sure efforts don't collide.' },
  { key: 'mission_lead', title: 'Mission Lead (End-to-End)', base: 1.0, definition: 'Owning the full mission lifecycle—from scoping and setup through execution, handoffs, and final wrap-up.' },

  { key: 'agent_publish', title: 'Agent Published (Usage Threshold)', base: 0.1, definition: 'Creating an agent that goes live and reaches a predefined usage bar (e.g., minimum number of runs or active users).' },
  { key: 'agent_flagship', title: 'Flagship Agent Release', base: 0.5, definition: 'Launching a mission-critical or featured agent that is approved as a flagship tool for the network.' },

  { key: 'lesson_micro', title: 'Micro-Lesson + Quiz', base: 0.005, definition: 'A short training piece plus a quiz to validate understanding (bite-sized learning unit).' },
  { key: 'module_complete', title: 'Module Complete + Assessment', base: 0.01, definition: 'Completing an entire learning module and passing the associated assessment.' },
  { key: 'class_final', title: 'Class Final (Intermediate)', base: 0.02, definition: 'Finishing an intermediate-level course with the required final project or exam.' },
  { key: 'security_trained', title: 'Security Trained Certification', base: 0.05, definition: 'Completing the full security training path and passing the certification requirements.' },
  { key: 'mentor_ta', title: 'TA / Mentor for Cohort', base: 0.2, definition: 'Serving as a teaching assistant or mentor for a cohort over a defined period—supporting learners, answering questions, and keeping them on track.' },
];

function applyLifts(base, { verified, securityTrained, impactAdopted, leadership } = {}) {
  let tier = base;

  // Caps (gates) - adjusted for new scale
  if (!verified) tier = Math.min(tier, 0.02);
  if (!securityTrained) tier = Math.min(tier, 0.05);

  // Impact lift (adoption/usage)
  if (impactAdopted) {
    if (tier <= 0.02) tier = tier * 1.5;
    else if (tier <= 0.05) tier = tier * 1.25;
    else if (tier <= 0.1) tier = tier * 1.2;
  }

  // Leadership lift (ownership/coordination)
  if (leadership) {
    if (tier < 0.2 && tier >= 0.02) tier = 0.2; // contributor -> lead baseline
    else if (tier >= 0.2) tier = Math.min(1.0, +(tier * 1.25).toFixed(4));
  }

  return Math.min(1.0, tier);
}

export function calculatePayout(actionKey, lifts, tierMode = null) {
  const mode = tierMode || currentTierMode;
  const multiplier = TIER_MODES[mode]?.multiplier || 1.0;
  
  const act = ACTIONS.find(a => a.key === actionKey);
  const base = act?.base ?? 0.005;
  const tier = applyLifts(base, lifts);
  const adjustedGgg = +(tier * multiplier).toFixed(4);
  
  return { 
    base, 
    tier, 
    ggg: adjustedGgg, 
    usd: +(adjustedGgg * GGG_TO_USD).toFixed(2),
    mode,
    modeLabel: TIER_MODES[mode]?.label
  };
}

// Matrix sections with new tier scale (0.001 to 1.0 GGG)
// Values shown are BONUS period values; LIVE = 50% of these
export const MATRIX_SECTIONS = [
  { tier: 0.001, title: 'Micro Posts', items: [
    'Posting that meets minimum quality standards',
    'Quick on-topic update with value',
  ] },
  { tier: 0.002, title: 'Basic Engagement', items: [
    'Reaction or simple helpful response',
    'Share with brief context',
  ] },
  { tier: 0.005, title: 'Entry Actions', items: [
    'Daily field update using template',
    'Useful comment that improves a thread',
    'Submit resource link with short summary',
    'Mission onboarding micro-task'
  ] },
  { tier: 0.01, title: 'Verified Micro-Contributions', items: [
    'Accepted answer / moderator-marked helpful',
    'Short guide confirmed to work',
    'Task completion confirmed by owner',
    'Module complete + assessment'
  ] },
  { tier: 0.02, title: 'Structured Deliverables', items: [
    'How-To with steps + expected outcome',
    'Template / SOP / checklist',
    'Weekly team recap',
    'Defined work item delivered'
  ] },
  { tier: 0.05, title: 'Completion Milestones', items: [
    'Mini-playbook with edge cases',
    'Community help session w/ notes',
    'Milestone deliverable accepted',
    'Security Trained / role unlock'
  ] },
  { tier: 0.1, title: 'Impact Contributions', items: [
    'Reference page adopted by others',
    'Toolkit adopted by a mission',
    'Resolve mid-complexity blocker',
    'Agent passes safety + usage threshold'
  ] },
  { tier: 0.2, title: 'Leadership Contributions', items: [
    'Run recurring office hours + notes',
    'Curated monthly digest as reference',
    'Lead sprint segment (plan → deliver)',
    'TA / mentor for cohort'
  ] },
  { tier: 0.3, title: 'High-Trust Ops', items: [
    'Structured security review + report',
    'Solve high-priority multi-team blocker',
    'Manage dispute resolution to completion',
    'Maintain node/network health with logs'
  ] },
  { tier: 0.5, title: 'Cross-Team Authority', items: [
    'Coordinate across missions to a combined milestone',
    'Incident response owner with postmortem',
    'Reviewer/moderator for high-value submissions',
    'Flagship agent release'
  ] },
  { tier: 1.0, title: 'Top-Tier Outcomes', items: [
    'Lead mission e2e (brief → closeout)',
    'Platform-standard outcome (SOP/policy)',
    'Launch full class track',
    'Critical incident resolved'
  ] },
];