import { base44 } from '@/api/base44Client';
import { checkContentForViolations, createContentFlag } from './contentModerationUtils';

/**
 * Hook for content moderation - checks and flags inappropriate content
 * about protected topics (7th Seal Temple, Mathues Imhotep, Mathew Schlueter)
 */
export function useContentModeration() {
  
  /**
   * Check content before submission and flag if necessary
   * @param {string} content - The content to check
   * @param {object} options - Additional options
   * @returns {Promise<{ allowed: boolean, message?: string }>}
   */
  const checkContent = async (content, options = {}) => {
    const {
      contentType = 'other',
      contentId = null,
      userId = null,
      userName = null,
      userEmail = null,
      blockOnViolation = true // Whether to block submission or just flag
    } = options;

    // Check for violations
    const result = checkContentForViolations(content);

    if (result.isFlagged) {
      // Get current user if not provided
      let flagUserId = userId;
      let flagUserName = userName;
      let flagUserEmail = userEmail;

      if (!flagUserId) {
        try {
          const currentUser = await base44.auth.me();
          flagUserId = currentUser?.email;
          flagUserName = currentUser?.full_name;
          flagUserEmail = currentUser?.email;
        } catch (e) {
          console.warn('Could not get current user for flag');
        }
      }

      // Create the flag
      await createContentFlag(base44, {
        flaggedUserId: flagUserId,
        flaggedUserName: flagUserName,
        flaggedUserEmail: flagUserEmail,
        contentType,
        contentId,
        contentText: content,
        detectedKeywords: result.detectedKeywords,
        flagReason: result.reason
      });

      if (blockOnViolation) {
        return {
          allowed: false,
          message: 'Your content has been flagged for review. Please ensure all content is positive and uplifting. A moderator will review this shortly.'
        };
      }
    }

    return { allowed: true };
  };

  /**
   * Quick check without flagging (for real-time validation)
   */
  const quickCheck = (content) => {
    return checkContentForViolations(content);
  };

  return {
    checkContent,
    quickCheck
  };
}

export default useContentModeration;