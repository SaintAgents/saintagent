import React from 'react';

export const ROLE_ORDER = [
  'member',
  'contributor',
  'moderator',
  'guardian',
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
    notes: 'Rank applies fully here (Seeker → Guardian)'
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
    notes: 'Typically unlocked at Adept / Practitioner; role-based, not automatic.'
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
    notes: 'Function-based authority; usually Master+, but not required.'
  },
  guardian: {
    title: 'Guardian (Role)',
    who: 'High-trust protectors of system integrity',
    purpose: 'Stewardship and protection',
    capabilities: [
      'Override moderation decisions when necessary',
      'Handle sensitive cases',
      'Safeguard platform values',
      'Final human judgment before Admin escalation'
    ],
    notes: 'Distinct from Guardian rank; overlap possible but not required.'
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
    notes: 'Often paired with Sage / Oracle ranks, but role-based.'
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
    notes: 'Small, invite-only. Operates on consensus, not command.'
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
    notes: 'Technical power, not moral or rank superiority.'
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
    notes: 'May overlap with Ascended / Guardian ranks; still a role.'
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
    notes: 'Rarely used; intentionally restrained.'
  }
};

export default ROLE_DEFS;