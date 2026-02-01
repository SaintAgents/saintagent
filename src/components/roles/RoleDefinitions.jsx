import React from 'react';

// Rank codes in order of progression
export const RANK_CODES = ['seeker', 'initiate', 'adept', 'practitioner', 'master', 'sage', 'oracle', 'ascended', 'guardian'];

export const ROLE_ORDER = [
  'contributor',
  'moderator',
  'guardian_role',
  'reviewer',
  'council_member',
  'administrator',
  'architect',
  'founder_custodian'
];

const ROLE_DEFS = {
  contributor: {
    title: 'Contributor',
    who: 'Trusted members with consistent participation',
    purpose: 'Content and value creation',
    capabilities: [
      'Submit featured content or agents',
      'Propose improvements or ideas',
      'Participate in structured discussions',
      'Assist lower-rank users'
    ],
    minRank: 'adept',
    requestable: true,
    notes: 'Requires Adept rank or higher to request'
  },
  moderator: {
    title: 'Moderator',
    who: 'Trusted stewards of community conduct',
    purpose: 'Order, fairness, and tone',
    capabilities: [
      'Review and moderate user content',
      'Resolve disputes and enforce guidelines',
      'Flag issues for escalation',
      'Temporarily restrict actions (timeouts, warnings)'
    ],
    minRank: 'master',
    requestable: true,
    notes: 'Requires Master rank or higher to request'
  },
  guardian_role: {
    title: 'Guardian (Role)',
    who: 'High-trust protectors of system integrity',
    purpose: 'Stewardship and protection',
    capabilities: [
      'Override moderation decisions when necessary',
      'Handle sensitive cases',
      'Safeguard platform values',
      'Final human judgment before Admin escalation'
    ],
    minRank: 'sage',
    requestable: true,
    notes: 'Requires Sage rank or higher; distinct from Guardian rank'
  },
  reviewer: {
    title: 'Reviewer',
    who: 'Evaluators of submissions, agents, or proposals',
    purpose: 'Quality control and ethical alignment',
    capabilities: [
      'Score or review submissions',
      'Provide structured feedback',
      'Participate in governance workflows',
      'Flag ethical or technical issues'
    ],
    minRank: 'practitioner',
    requestable: true,
    notes: 'Requires Practitioner rank or higher'
  },
  council_member: {
    title: 'Council Member',
    who: 'Strategic advisors and senior stewards',
    purpose: 'Direction and governance',
    capabilities: [
      'Participate in platform-level decisions',
      'Influence policy or rank criteria',
      'Resolve high-level disputes',
      'Approve major changes'
    ],
    minRank: 'oracle',
    requestable: false,
    notes: 'Invite-only by admin. Requires Oracle rank or higher.'
  },
  administrator: {
    title: 'Administrator',
    who: 'Platform operators',
    purpose: 'Technical and operational control',
    capabilities: [
      'Manage users and roles',
      'Configure system settings',
      'Deploy updates',
      'Access logs and infrastructure tools'
    ],
    minRank: null,
    requestable: false,
    notes: 'Admin-assigned only. Technical power, not rank superiority.'
  },
  architect: {
    title: 'Architect',
    who: 'Designers of systems, agents, or frameworks',
    purpose: 'Creation and evolution',
    capabilities: [
      'Design core agents or workflows',
      'Define schemas, logic, or models',
      'Influence long-term platform architecture'
    ],
    minRank: 'ascended',
    requestable: false,
    notes: 'Admin-assigned only. Requires Ascended rank or higher.'
  },
  founder_custodian: {
    title: 'Founder / Custodian',
    who: 'Originators and ultimate stewards',
    purpose: 'Vision and continuity',
    capabilities: [
      'Final authority on platform purpose',
      'Long-term guardianship',
      'Emergency override (rare, restrained)'
    ],
    minRank: null,
    requestable: false,
    notes: 'Admin-assigned only. Reserved for platform founders.'
  }
};

export default ROLE_DEFS;