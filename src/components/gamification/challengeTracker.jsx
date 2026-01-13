import { base44 } from '@/api/base44Client';

/**
 * Track a user action for challenge progress
 * @param {string} actionType - The action type (e.g., 'send_message', 'update_profile', 'view_listing')
 * @param {string} userId - The user's email
 */
export async function trackChallengeAction(actionType, userId) {
  if (!userId) {
    console.log('trackChallengeAction: No userId provided');
    return;
  }
  
  console.log(`trackChallengeAction: Tracking "${actionType}" for user "${userId}"`);
  
  try {
    // Find active challenges for this user with matching target_action
    const challenges = await base44.entities.Challenge.filter({
      user_id: userId,
      status: 'active'
    });
    
    console.log(`trackChallengeAction: Found ${challenges.length} active challenges for user`);
    
    // Filter to matching action type and increment
    const matchingChallenges = challenges.filter(c => c.target_action === actionType);
    console.log(`trackChallengeAction: ${matchingChallenges.length} challenges match action "${actionType}"`);
    
    // Increment current_count for each matching challenge
    for (const challenge of matchingChallenges) {
      if (challenge.current_count < challenge.target_count) {
        const newCount = (challenge.current_count || 0) + 1;
        console.log(`trackChallengeAction: Updating challenge "${challenge.title}" from ${challenge.current_count} to ${newCount}`);
        await base44.entities.Challenge.update(challenge.id, {
          current_count: newCount
        });
      } else {
        console.log(`trackChallengeAction: Challenge "${challenge.title}" already at target (${challenge.current_count}/${challenge.target_count})`);
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