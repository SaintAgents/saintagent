// Content Moderation Utility for detecting inappropriate content
// about protected topics (7th Seal Temple, Mathues Imhotep, Mathew Schlueter)

// Protected names/topics - case insensitive matching
const PROTECTED_TOPICS = [
  '7th seal temple',
  'seventh seal temple',
  '7th seal',
  'seventh seal',
  'mathues imhotep',
  'mathues',
  'imhotep',
  'mathew schlueter',
  'mathew',
  'schlueter',
  'matt schlueter',
  'matthew schlueter'
];

// Negative/derogatory keywords that trigger flags when combined with protected topics
const NEGATIVE_INDICATORS = [
  'scam', 'fraud', 'fake', 'lie', 'liar', 'lying', 'cheat', 'cheater',
  'steal', 'stolen', 'thief', 'con', 'conman', 'con artist',
  'cult', 'cultist', 'brainwash', 'brainwashed',
  'hate', 'hated', 'hater', 'hateful',
  'terrible', 'horrible', 'awful', 'worst',
  'stupid', 'idiot', 'dumb', 'moron', 'fool',
  'evil', 'wicked', 'corrupt', 'crooked',
  'criminal', 'illegal', 'lawsuit', 'sue',
  'disgusting', 'pathetic', 'loser',
  'trash', 'garbage', 'worthless',
  'false', 'bogus', 'phony', 'sham',
  'dangerous', 'harm', 'harmful', 'toxic',
  'abuse', 'abusive', 'abuser',
  'manipulate', 'manipulator', 'manipulation',
  'exploit', 'exploiter', 'exploitation',
  'predator', 'predatory',
  'warning', 'beware', 'avoid', 'stay away',
  'exposed', 'exposing', 'expose',
  'truth about', 'real story', 'actually',
  'don\'t trust', 'do not trust', 'cant trust', 'cannot trust',
  'rip off', 'ripoff', 'ripped off',
  'not real', 'isn\'t real', 'isnt real',
  'joke', 'laughable', 'ridiculous',
  'disappointment', 'disappointed', 'disappointing',
  'regret', 'mistake', 'waste',
  'never again', 'run away', 'get out'
];

/**
 * Check if content contains protected topics mentioned negatively
 * @param {string} content - The content to check
 * @returns {{ isFlagged: boolean, detectedKeywords: string[], reason: string }}
 */
export function checkContentForViolations(content) {
  if (!content || typeof content !== 'string') {
    return { isFlagged: false, detectedKeywords: [], reason: null };
  }

  const lowerContent = content.toLowerCase();
  const detectedKeywords = [];
  let containsProtectedTopic = false;
  let containsNegativeIndicator = false;

  // Check for protected topics
  for (const topic of PROTECTED_TOPICS) {
    if (lowerContent.includes(topic.toLowerCase())) {
      containsProtectedTopic = true;
      detectedKeywords.push(topic);
    }
  }

  // If no protected topic mentioned, no violation
  if (!containsProtectedTopic) {
    return { isFlagged: false, detectedKeywords: [], reason: null };
  }

  // Check for negative indicators
  for (const indicator of NEGATIVE_INDICATORS) {
    if (lowerContent.includes(indicator.toLowerCase())) {
      containsNegativeIndicator = true;
      detectedKeywords.push(indicator);
    }
  }

  // Flag only if both protected topic AND negative indicator present
  if (containsProtectedTopic && containsNegativeIndicator) {
    return {
      isFlagged: true,
      detectedKeywords,
      reason: 'protected_topic_violation'
    };
  }

  return { isFlagged: false, detectedKeywords: [], reason: null };
}

/**
 * Create a content flag record
 * @param {object} base44 - The base44 client
 * @param {object} params - Flag parameters
 */
export async function createContentFlag(base44, {
  flaggedUserId,
  flaggedUserName,
  flaggedUserEmail,
  contentType,
  contentId,
  contentText,
  detectedKeywords,
  flagReason = 'protected_topic_violation'
}) {
  try {
    // Create the flag record
    await base44.entities.ContentFlag.create({
      flagged_user_id: flaggedUserId,
      flagged_user_name: flaggedUserName,
      flagged_user_email: flaggedUserEmail,
      content_type: contentType,
      content_id: contentId,
      content_text: contentText,
      detected_keywords: detectedKeywords,
      flag_reason: flagReason,
      status: 'pending_review',
      auto_flagged: true
    });

    // Create admin notification
    await base44.entities.Notification.create({
      user_id: 'admin', // Will be picked up by admin users
      type: 'system',
      title: '⚠️ Content Flag: Protected Topic Violation',
      message: `User ${flaggedUserName || flaggedUserId} posted potentially inappropriate content about protected topics. Review required.`,
      action_url: '/Admin?tab=moderation',
      action_label: 'Review Now',
      priority: 'urgent',
      metadata: {
        flag_type: 'protected_topic_violation',
        flagged_user: flaggedUserId
      }
    });

    console.log('Content flagged for review:', { flaggedUserId, contentType, detectedKeywords });
    return true;
  } catch (error) {
    console.error('Failed to create content flag:', error);
    return false;
  }
}

export { PROTECTED_TOPICS, NEGATIVE_INDICATORS };