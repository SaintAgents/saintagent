import { base44 } from '@/api/base44Client';

/**
 * Fire-and-forget GGG reward trigger.
 * Calls the earnGGG backend function which:
 * - Looks up the active GGGRewardRule for the action_type
 * - Prevents double-earning via idempotent event IDs
 * - Credits the user's wallet + profile balance
 *
 * Usage: earnGGG('like_react', postId)
 */
export async function earnGGG(action_type, source_id, memo) {
  try {
    await base44.functions.invoke('earnGGG', { action_type, source_id, memo });
  } catch (e) {
    // Silent fail — rewards are non-blocking
    console.debug('[earnGGG]', action_type, e?.message || e);
  }
}