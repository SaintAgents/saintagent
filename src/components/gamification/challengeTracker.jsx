import { base44 } from '@/api/base44Client';

/**
 * Track a user action for challenge progress
 * @param {string} actionType - The action type (e.g., 'send_message', 'update_profile', 'view_listing')
 * @param {string} userId - The user's email
 */
export async function trackChallengeAction(actionType, userId) {
  if (!userId) return;
  
  try {
    // Find active challenges for this user with matching target_action
    const challenges = await base44.entities.Challenge.filter({
      user_id: userId,
      target_action: actionType,
      status: 'active'
    });
    
    // Increment current_count for each matching challenge
    for (const challenge of challenges) {
      if (challenge.current_count < challenge.target_count) {
        await base44.entities.Challenge.update(challenge.id, {
          current_count: challenge.current_count + 1
        });
      }
    }
  } catch (error) {
    console.error('Error tracking challenge action:', error);
  }
}

// Convenience functions for common actions
export const trackSendMessage = (userId) => trackChallengeAction('send_message', userId);
export const trackUpdateProfile = (userId) => trackChallengeAction('update_profile', userId);
export const trackViewListing = (userId) => trackChallengeAction('view_listing', userId);
export const trackInteractListing = (userId) => trackChallengeAction('interact_listing', userId);
export const trackJoinMission = (userId) => trackChallengeAction('join_mission', userId);
export const trackDailyLogin = (userId) => trackChallengeAction('daily_login', userId);
export const trackScheduleMeeting = (userId) => trackChallengeAction('schedule_meeting', userId);