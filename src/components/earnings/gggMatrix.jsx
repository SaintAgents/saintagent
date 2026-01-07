// GGG Earnings Matrix helpers
// 1 GGG = $145 USD (1 gram gold)

export const GGG_TO_USD = 145; // 1.0000000 GGG = $145 USD

// Tier mode: 'bonus' = 60-day beta incentive, 'live' = post-beta (50% of bonus)
export const TIER_MODES = {
  bonus: { label: 'Bonus Period (60-Day Beta)', multiplier: 1.0 },
  live: { label: 'Live Tier', multiplier: 0.5 }
};

// Default tier mode - can be toggled in UI
export let currentTierMode = 'bonus';
export const setTierMode = (mode) => { currentTierMode = mode; };
export const getTierMode = () => currentTierMode;

// All tiers from $0.03 to $145.00 USD
export const TIERS = [
  0.0002069,  // $0.03
  0.0004828,  // $0.07
  0.0009656,  // $0.14
  0.0019312,  // $0.28
  0.0038624,  // $0.56
  0.0077248,  // $1.12
  0.0154496,  // $2.24
  0.0308992,  // $4.48
  0.0500000,  // $7.25
  0.1000000,  // $14.50
  0.2000000,  // $29.00
  0.5000000,  // $72.50
  1.0000000   // $145.00
];

export const INTERACTION_BONUS_GGG = 0.0019312; // +$0.28 for 5+ interactions
export const INTERACTION_THRESHOLD = 5; // likes, comments, shares needed for bonus

// Tier multipliers for rank-based scaling
export const TIER_MULTIPLIERS = [1.0, 2.0, 4.0, 8.0, 16.0];

export const ACTIONS = [
  // Micro-Engagement Actions
  { key: 'profile_view', title: 'Profile View', base: 0.0002069, usd: 0.03, category: 'engagement', definition: 'Viewing another user\'s profile earns a micro-reward for engagement.' },
  { key: 'post_view', title: 'Post View', base: 0.0004828, usd: 0.07, category: 'engagement', definition: 'Viewing a post contributes to content reach and earns a small reward.' },
  { key: 'like_react', title: 'Like/React', base: 0.0002069, usd: 0.03, category: 'engagement', definition: 'Liking or reacting to content shows appreciation and earns a micro-reward.' },
  { key: 'comment', title: 'Comment', base: 0.0009656, usd: 0.14, category: 'engagement', definition: 'Adding a comment to a post or discussion contributes to engagement.' },
  { key: 'share', title: 'Share', base: 0.0019312, usd: 0.28, category: 'engagement', definition: 'Sharing content to spread valuable information within the network.' },
  { key: 'follow', title: 'Follow', base: 0.0038624, usd: 0.56, category: 'engagement', definition: 'Following another user to build your network connections.' },
  { key: 'profile_update', title: 'Profile Update', base: 0.0009656, usd: 0.14, category: 'engagement', definition: 'Updating your profile keeps your information current and earns a small reward.' },
  { key: 'daily_checkin', title: 'Daily Check-in', base: 0.0019312, usd: 0.28, category: 'engagement', definition: 'Checking in daily maintains your streak and earns consistent rewards.' },

  // Content Creation
  { key: 'post_update', title: 'Daily Field Update', base: 0.0038624, usd: 0.56, category: 'content', definition: 'A short daily report on what you did, observed, or progressed that day—focused on signal (status, blockers, key insights), not noise.' },
  { key: 'posting', title: 'Posting', base: 0.0038624, usd: 0.56, category: 'content', definition: 'A post with at least 30 characters earns base reward. Earn an additional bonus when the post receives at least 5 interactions (likes, comments, shares).' },
  { key: 'forum_post', title: 'Forum Post', base: 0.0077248, usd: 1.12, category: 'content', definition: 'Creating a structured forum post for community discussion and knowledge sharing.' },
  { key: 'comment_helpful', title: 'Helpful Comment (Accepted)', base: 0.0100000, usd: 1.45, category: 'content', definition: 'A comment that meaningfully solves a problem, clarifies confusion, or adds value and is marked as "accepted" or "helpful" by the mission owner/mod.' },
  { key: 'thread_summary', title: 'Thread Summary', base: 0.0100000, usd: 1.45, category: 'content', definition: 'A concise summary of a discussion thread, capturing key decisions, options, links, and next steps so others do not have to read the entire thread.' },
  { key: 'how_to', title: 'Structured How-To', base: 0.0154496, usd: 2.24, category: 'content', definition: 'A step-by-step guide with clear structure (title, steps, checks, tips) that helps others repeat a process reliably.' },
  { key: 'template', title: 'Template / SOP Snippet', base: 0.0154496, usd: 2.24, category: 'content', definition: 'A reusable template or SOP segment that others can plug into their own work (e.g., checklists, email templates, doc skeletons).' },
  { key: 'weekly_recap', title: 'Weekly Team Recap', base: 0.0154496, usd: 2.24, category: 'content', definition: 'A weekly overview of what the team accomplished, current status, blockers, and upcoming priorities in one clean recap.' },

  // Quest & Team Activities
  { key: 'quest_completion', title: 'Quest Completion', base: 0.0077248, usd: 1.12, category: 'mission', definition: 'Completing a defined quest or challenge within the platform.' },
  { key: 'team_collaboration', title: 'Team Collaboration', base: 0.0077248, usd: 1.12, category: 'mission', definition: 'Active participation in team activities and collaborative work.' },

  // Mission Activities
  { key: 'mission_participation', title: 'Mission Participation', base: 0.0154496, usd: 2.24, category: 'mission', definition: 'Actively participating in a mission and contributing to its objectives.' },
  { key: 'mission_onboarding', title: 'Mission Onboarding', base: 0.0050000, usd: 0.73, category: 'mission', definition: 'Setting up a new agent or member on a mission—sharing context, links, expectations, and making sure they are ready to operate.' },
  { key: 'task_confirmed', title: 'Mission Task Confirmed', base: 0.0100000, usd: 1.45, category: 'mission', definition: 'Confirming a specific task is fully actionable (requirements clarified, dependencies identified, acceptance criteria defined).' },
  { key: 'milestone', title: 'Milestone Deliverable', base: 0.0308992, usd: 4.48, category: 'mission', definition: 'Delivering a major piece of work tied to a defined milestone (e.g., draft complete, feature built, report finished).' },
  { key: 'impact_unlock', title: 'Impact Contribution (Adopted)', base: 0.0500000, usd: 7.25, category: 'mission', definition: 'A contribution (idea, doc, flow, pattern) that gets adopted into live use—actually implemented, not just proposed.' },
  { key: 'lead_sprint', title: 'Lead Sprint Segment', base: 0.1000000, usd: 14.50, category: 'leadership', definition: 'Owning planning and execution for a defined chunk of work/time (e.g., a one-week sprint), including coordination and follow-through.' },
  { key: 'security_review', title: 'Security Review', base: 0.2000000, usd: 29.00, category: 'leadership', definition: 'A focused review of flows, data handling, and permissions with documented risks and recommendations.' },
  { key: 'cross_mission', title: 'Cross-Mission Coordination', base: 0.3000000, usd: 43.50, category: 'leadership', definition: 'Aligning multiple missions or teams—resolving conflicts, syncing dependencies, and making sure efforts do not collide.' },
  { key: 'mission_lead', title: 'Mission Lead (End-to-End)', base: 0.5000000, usd: 72.50, category: 'leadership', definition: 'Owning the full mission lifecycle—from scoping and setup through execution, handoffs, and final wrap-up.' },

  // Agent Development
  { key: 'agent_publish', title: 'Agent Published (Usage Threshold)', base: 0.0500000, usd: 7.25, category: 'agent', definition: 'Creating an agent that goes live and reaches a predefined usage bar (e.g., minimum number of runs or active users).' },
  { key: 'agent_flagship', title: 'Flagship Agent Release', base: 0.3000000, usd: 43.50, category: 'agent', definition: 'Launching a mission-critical or featured agent that is approved as a flagship tool for the network.' },

  // Learning & Teaching
  { key: 'lesson_micro', title: 'Micro-Lesson + Quiz', base: 0.0050000, usd: 0.73, category: 'learning', definition: 'A short training piece plus a quiz to validate understanding (bite-sized learning unit).' },
  { key: 'module_complete', title: 'Module Complete + Assessment', base: 0.0100000, usd: 1.45, category: 'learning', definition: 'Completing an entire learning module and passing the associated assessment.' },
  { key: 'class_final', title: 'Class Final (Intermediate)', base: 0.0154496, usd: 2.24, category: 'learning', definition: 'Finishing an intermediate-level course with the required final project or exam.' },
  { key: 'security_trained', title: 'Security Trained Certification', base: 0.0308992, usd: 4.48, category: 'learning', definition: 'Completing the full security training path and passing the certification requirements.' },
  { key: 'mentor_ta', title: 'TA / Mentor for Cohort', base: 0.1000000, usd: 14.50, category: 'learning', definition: 'Serving as a teaching assistant or mentor for a cohort over a defined period—supporting learners, answering questions, and keeping them on track.' },
];

// Smart GGG formatting: 7 decimals for values < 0.01, otherwise appropriate precision
export const formatGGGSmart = (val) => {
  if (val < 0.01) {
    return val.toFixed(7);
  }
  if (val < 1) {
    return val.toFixed(7);
  }
  return val.toFixed(7);
};

// Smart USD formatting: show cents with precision for sub-dollar amounts
export const formatUSDSmart = (val) => {
  if (val < 1) {
    return val.toFixed(2);
  }
  return val.toFixed(2);
};

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

// Matrix sections with full tier scale from $0.03 to $145.00 USD
export const MATRIX_SECTIONS = [
  { tier: 0.0002069, title: 'Tier 1: Micro-Views ($0.03)', items: [
    'Profile View = $0.03',
    'Like/React = $0.03',
  ] },
  { tier: 0.0004828, title: 'Tier 2: Views & Reactions ($0.07)', items: [
    'Post View = $0.07',
  ] },
  { tier: 0.0009656, title: 'Tier 3: Basic Engagement ($0.14)', items: [
    'Comment = $0.14',
    'Profile Update = $0.14',
  ] },
  { tier: 0.0019312, title: 'Tier 4: Active Engagement ($0.28)', items: [
    'Share = $0.28',
    'Daily Check-in = $0.28',
    '+$0.28 bonus when post gets 5+ interactions',
  ] },
  { tier: 0.0038624, title: 'Tier 5: Content Creation ($0.56)', items: [
    'Follow = $0.56',
    'Daily Field Update = $0.56',
    'Posting (30+ chars) = $0.56',
  ] },
  { tier: 0.0077248, title: 'Tier 6: Quality Contributions ($1.12)', items: [
    'Forum Post = $1.12',
    'Quest Completion = $1.12',
    'Team Collaboration = $1.12',
  ] },
  { tier: 0.0154496, title: 'Tier 7: Structured Work ($2.24)', items: [
    'Structured How-To = $2.24',
    'Template / SOP Snippet = $2.24',
    'Weekly Team Recap = $2.24',
    'Mission Participation = $2.24',
    'Class Final (Intermediate) = $2.24',
  ] },
  { tier: 0.0308992, title: 'Tier 8: Milestones ($4.48)', items: [
    'Milestone Deliverable = $4.48',
    'Security Trained Certification = $4.48',
  ] },
  { tier: 0.0500000, title: 'Tier 9: Impact ($7.25)', items: [
    'Impact Contribution (Adopted) = $7.25',
    'Agent Published (Usage Threshold) = $7.25',
  ] },
  { tier: 0.1000000, title: 'Tier 10: Leadership ($14.50)', items: [
    'Lead Sprint Segment = $14.50',
    'TA / Mentor for Cohort = $14.50',
  ] },
  { tier: 0.2000000, title: 'Tier 11: Authority ($29.00)', items: [
    'Security Review = $29.00',
  ] },
  { tier: 0.3000000, title: 'Tier 12: Cross-Team ($43.50)', items: [
    'Cross-Mission Coordination = $43.50',
    'Flagship Agent Release = $43.50',
  ] },
  { tier: 0.5000000, title: 'Tier 13: Mission Lead ($72.50)', items: [
    'Mission Lead (End-to-End) = $72.50',
  ] },
  { tier: 1.0000000, title: 'Tier 14: Maximum ($145.00)', items: [
    'Reserved for exceptional platform-wide contributions',
  ] },
];