// User Audit Service - tracks all user actions in the app
import { base44 } from '@/api/base44Client';

// Generate a session ID for grouping actions
const getSessionId = () => {
  if (typeof window === 'undefined') return null;
  let sessionId = sessionStorage.getItem('audit_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('audit_session_id', sessionId);
  }
  return sessionId;
};

// Track a user action
export async function trackUserAction({
  action_type,
  action_detail,
  entity_type = null,
  entity_id = null,
  page_name = null,
  ggg_delta = 0,
  metadata = {}
}) {
  try {
    const user = await base44.auth.me();
    if (!user?.email) return;

    const currentPage = page_name || (typeof window !== 'undefined' ? window.location.pathname.split('/').pop() : 'unknown');

    await base44.entities.UserAuditLog.create({
      user_id: user.email,
      session_id: getSessionId(),
      action_type,
      action_detail,
      entity_type,
      entity_id,
      page_name: currentPage,
      ggg_delta,
      metadata,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
}

// Convenience methods for common actions
export const AuditService = {
  pageView: (pageName) => trackUserAction({
    action_type: 'page_view',
    action_detail: `Viewed ${pageName}`,
    page_name: pageName
  }),

  click: (element, page) => trackUserAction({
    action_type: 'click',
    action_detail: `Clicked ${element}`,
    page_name: page
  }),

  create: (entityType, entityId, description) => trackUserAction({
    action_type: 'create',
    action_detail: description || `Created ${entityType}`,
    entity_type: entityType,
    entity_id: entityId
  }),

  update: (entityType, entityId, description) => trackUserAction({
    action_type: 'update',
    action_detail: description || `Updated ${entityType}`,
    entity_type: entityType,
    entity_id: entityId
  }),

  delete: (entityType, entityId, description) => trackUserAction({
    action_type: 'delete',
    action_detail: description || `Deleted ${entityType}`,
    entity_type: entityType,
    entity_id: entityId
  }),

  search: (query, page) => trackUserAction({
    action_type: 'search',
    action_detail: `Searched: "${query}"`,
    page_name: page,
    metadata: { query }
  }),

  message: (recipientId) => trackUserAction({
    action_type: 'message',
    action_detail: 'Sent message',
    entity_type: 'Message',
    metadata: { recipient: recipientId }
  }),

  profileView: (profileUserId) => trackUserAction({
    action_type: 'profile_view',
    action_detail: 'Viewed profile',
    entity_type: 'UserProfile',
    entity_id: profileUserId
  }),

  gggEarned: (amount, reason) => trackUserAction({
    action_type: 'ggg_earned',
    action_detail: `Earned ${amount} GGG: ${reason}`,
    ggg_delta: amount,
    metadata: { reason }
  }),

  gggSpent: (amount, reason) => trackUserAction({
    action_type: 'ggg_spent',
    action_detail: `Spent ${amount} GGG: ${reason}`,
    ggg_delta: -amount,
    metadata: { reason }
  }),

  bankDeposit: (amount) => trackUserAction({
    action_type: 'bank_deposit',
    action_detail: `Deposited ${amount} to Gaia Bank`,
    ggg_delta: amount,
    metadata: { amount }
  }),

  bankWithdraw: (amount) => trackUserAction({
    action_type: 'bank_withdraw',
    action_detail: `Withdrew ${amount} from Gaia Bank`,
    ggg_delta: -amount,
    metadata: { amount }
  }),

  missionJoin: (missionId, missionTitle) => trackUserAction({
    action_type: 'mission_join',
    action_detail: `Joined mission: ${missionTitle}`,
    entity_type: 'Mission',
    entity_id: missionId
  }),

  booking: (listingId, listingTitle) => trackUserAction({
    action_type: 'booking',
    action_detail: `Booked: ${listingTitle}`,
    entity_type: 'Listing',
    entity_id: listingId
  }),

  login: () => trackUserAction({
    action_type: 'login',
    action_detail: 'User logged in'
  }),

  logout: () => trackUserAction({
    action_type: 'logout',
    action_detail: 'User logged out'
  })
};

export default AuditService;