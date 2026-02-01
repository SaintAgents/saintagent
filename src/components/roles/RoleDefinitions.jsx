import React from 'react';

// Rank order for comparison
export const RANK_ORDER = ['seeker', 'initiate', 'adept', 'practitioner', 'master', 'sage', 'oracle', 'ascended', 'guardian'];

export const ROLE_ORDER = [
  'member',
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
  member: {
    title: 'Member',
    who: 'All registered users',
    purpose: 'Participation',
    capabilities: [
      'Create and manage profile',
      'Earn rank progression',
      'Submit content, prompts, or actions',
      'Engage with features based on rank'
    ],
    notes: 'Automatically granted upon registration',
    min_rank: null, // Auto-granted
    requestable: false,
    admin_only: false
  },
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
    notes: 'Request at Adept+; admin approval required',
    min_rank: 'adept',
    requestable: true,
    admin_only: false
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
    notes: 'Request at Master+; admin approval required',
    min_rank: 'master',
    requestable: true,
    admin_only: false
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
    notes: 'Admin assignment only; Sage+ recommended',
    min_rank: 'sage',
    requestable: false,
    admin_only: true
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
    notes: 'Request at Practitioner+; admin approval required',
    min_rank: 'practitioner',
    requestable: true,
    admin_only: false
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
    notes: 'Invite-only; admin assignment only',
    min_rank: 'oracle',
    requestable: false,
    admin_only: true
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
    notes: 'Admin assignment only',
    min_rank: null,
    requestable: false,
    admin_only: true
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
    notes: 'Admin assignment only; Ascended+ recommended',
    min_rank: 'ascended',
    requestable: false,
    admin_only: true
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
    notes: 'Non-assignable; reserved for platform originators',
    min_rank: null,
    requestable: false,
    admin_only: true,
    locked: true // Cannot be assigned through UI
  }
};

export default ROLE_DEFS;