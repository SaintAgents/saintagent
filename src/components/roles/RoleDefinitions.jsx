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

// Role hierarchy levels (higher = more authority)
export const ROLE_HIERARCHY = {
  member: 0,
  contributor: 1,
  reviewer: 2,
  moderator: 3,
  guardian_role: 4,
  council_member: 5,
  administrator: 6,
  architect: 7,
  founder_custodian: 8
};

// Default role groups with permissions
export const DEFAULT_ROLE_GROUPS = {
  content_team: {
    name: 'Content Team',
    code: 'content_team',
    description: 'Manages content creation and curation',
    color: 'emerald',
    hierarchy_level: 2,
    roles: ['contributor', 'reviewer'],
    permissions: {
      can_manage_content: true,
      can_view_analytics: true
    },
    section_access: ['Studio', 'ContentStudio', 'Videos', 'News']
  },
  moderation_team: {
    name: 'Moderation Team',
    code: 'moderation_team',
    description: 'Handles community moderation and safety',
    color: 'amber',
    hierarchy_level: 3,
    roles: ['moderator', 'guardian_role'],
    permissions: {
      can_moderate: true,
      can_manage_content: true,
      can_view_admin_panel: true
    },
    section_access: ['Admin', 'Forum', 'CommunityFeed', 'Circles']
  },
  leadership_team: {
    name: 'Leadership Team',
    code: 'leadership_team',
    description: 'Strategic leadership and governance',
    color: 'violet',
    hierarchy_level: 5,
    roles: ['council_member', 'administrator'],
    permissions: {
      can_manage_users: true,
      can_manage_roles: true,
      can_view_admin_panel: true,
      can_view_analytics: true,
      can_approve_requests: true,
      can_manage_settings: true
    },
    section_access: ['Admin', 'Leaderboards', 'Projects', 'CRM']
  },
  platform_team: {
    name: 'Platform Team',
    code: 'platform_team',
    description: 'Core platform architecture and operations',
    color: 'rose',
    hierarchy_level: 7,
    roles: ['architect', 'founder_custodian'],
    permissions: {
      can_manage_users: true,
      can_manage_content: true,
      can_moderate: true,
      can_manage_roles: true,
      can_manage_missions: true,
      can_manage_projects: true,
      can_manage_events: true,
      can_manage_circles: true,
      can_manage_marketplace: true,
      can_manage_crm: true,
      can_view_admin_panel: true,
      can_view_analytics: true,
      can_approve_requests: true,
      can_manage_ggg: true,
      can_manage_settings: true
    },
    section_access: ['*'] // All sections
  }
};

// Permission definitions for UI
export const PERMISSION_DEFINITIONS = {
  can_manage_users: { label: 'Manage Users', description: 'View and manage user accounts' },
  can_manage_content: { label: 'Manage Content', description: 'Create, edit, and delete content' },
  can_moderate: { label: 'Moderate', description: 'Review and moderate community content' },
  can_manage_roles: { label: 'Manage Roles', description: 'Assign and revoke roles' },
  can_manage_missions: { label: 'Manage Missions', description: 'Create and manage missions' },
  can_manage_projects: { label: 'Manage Projects', description: 'Oversee project submissions' },
  can_manage_events: { label: 'Manage Events', description: 'Create and manage events' },
  can_manage_circles: { label: 'Manage Circles', description: 'Administer circles/groups' },
  can_manage_marketplace: { label: 'Manage Marketplace', description: 'Oversee marketplace listings' },
  can_manage_crm: { label: 'Manage CRM', description: 'Access CRM and contact management' },
  can_view_admin_panel: { label: 'View Admin Panel', description: 'Access admin dashboard' },
  can_view_analytics: { label: 'View Analytics', description: 'Access analytics and reports' },
  can_approve_requests: { label: 'Approve Requests', description: 'Review and approve admin requests' },
  can_manage_ggg: { label: 'Manage GGG', description: 'Configure GGG rewards and rules' },
  can_manage_settings: { label: 'Manage Settings', description: 'Configure platform settings' }
};

// Section definitions for access control
export const SECTION_DEFINITIONS = {
  Admin: { label: 'Admin Dashboard', category: 'admin' },
  Leaderboards: { label: 'Leaderboards', category: 'community' },
  Projects: { label: 'Projects', category: 'core' },
  CRM: { label: 'CRM', category: 'admin' },
  Studio: { label: 'Studio', category: 'content' },
  ContentStudio: { label: 'Content Studio', category: 'content' },
  Videos: { label: 'Videos', category: 'content' },
  News: { label: 'News', category: 'content' },
  Forum: { label: 'Forum', category: 'community' },
  CommunityFeed: { label: 'Community Feed', category: 'community' },
  Circles: { label: 'Circles', category: 'community' },
  Missions: { label: 'Missions', category: 'core' },
  Marketplace: { label: 'Marketplace', category: 'core' },
  Events: { label: 'Events', category: 'community' },
  Meetings: { label: 'Meetings', category: 'core' },
  Messages: { label: 'Messages', category: 'core' }
};

// Helper to check if a role has higher hierarchy than another
export const hasHigherAuthority = (roleA, roleB) => {
  return (ROLE_HIERARCHY[roleA] || 0) > (ROLE_HIERARCHY[roleB] || 0);
};

// Helper to get permissions for a role based on its groups
export const getRolePermissions = (roleCode, roleGroups = []) => {
  const permissions = {};
  
  // Check default groups
  Object.values(DEFAULT_ROLE_GROUPS).forEach(group => {
    if (group.roles.includes(roleCode)) {
      Object.entries(group.permissions || {}).forEach(([key, value]) => {
        if (value) permissions[key] = true;
      });
    }
  });
  
  // Check custom groups
  roleGroups.forEach(group => {
    if (group.roles?.includes(roleCode)) {
      Object.entries(group.permissions || {}).forEach(([key, value]) => {
        if (value) permissions[key] = true;
      });
    }
  });
  
  return permissions;
};

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
    min_rank: null,
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
    locked: true
  }
};

export default ROLE_DEFS;

// Helper to check if user has permission based on their roles
export const userHasPermission = (userRoles, permission, roleGroups = []) => {
  if (!userRoles || userRoles.length === 0) return false;
  
  for (const role of userRoles) {
    const permissions = getRolePermissions(role.role_code, roleGroups);
    if (permissions[permission]) return true;
  }
  
  return false;
};

// Helper to check section access
export const userHasSectionAccess = (userRoles, sectionName, roleGroups = []) => {
  if (!userRoles || userRoles.length === 0) return false;
  
  for (const role of userRoles) {
    // Check default groups
    for (const group of Object.values(DEFAULT_ROLE_GROUPS)) {
      if (group.roles.includes(role.role_code)) {
        if (group.section_access.includes('*') || group.section_access.includes(sectionName)) {
          return true;
        }
      }
    }
    
    // Check custom groups
    for (const group of roleGroups) {
      if (group.roles?.includes(role.role_code)) {
        if (group.section_access?.includes('*') || group.section_access?.includes(sectionName)) {
          return true;
        }
      }
    }
  }
  
  return false;
};