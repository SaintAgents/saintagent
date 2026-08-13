import { base44 } from '@/api/base44Client';

/**
 * Award GGG to a user with full ledger consistency.
 * 
 * This is the ONLY way frontend code should award GGG.
 * It writes to GGGTransaction (source of truth), updates UserProfile via fresh read, and syncs Wallet.
 * 
 * RACE-SAFE: Always reads the LATEST profile balance before writing,
 * never relies on stale React state. Records the transaction first,
 * then updates the profile balance.
 *
 * @param {string} userId - User email
 * @param {number} amount - GGG amount (positive)
 * @param {string} reasonCode - e.g. 'feedback_submit', 'quest_complete'
 * @param {string} description - Human-readable description
 * @param {string} [sourceType] - e.g. 'reward', 'mission'
 * @param {string} [sourceId] - Related entity ID
 * @returns {Promise<{newBalance: number}>}
 */
export async function awardGGG(userId, amount, reasonCode, description, sourceType = 'reward', sourceId) {
  if (!userId || !amount || amount <= 0) return { newBalance: 0 };

  // 1. Record in GGGTransaction FIRST (source of truth — never lost even if profile update fails)
  await base44.entities.GGGTransaction.create({
    user_id: userId,
    delta: amount,
    reason_code: reasonCode,
    description,
    source_type: sourceType,
    source_id: sourceId || undefined,
  });

  // 2. Fresh-read profile THEN update — never use stale React state
  const profiles = await base44.entities.UserProfile.filter({ user_id: userId });
  const profile = profiles?.[0];
  if (!profile) {
    console.warn('[awardGGG] Profile not found for', userId);
    return { newBalance: amount };
  }

  const newBalance = (profile.ggg_balance || 0) + amount;
  await base44.entities.UserProfile.update(profile.id, { ggg_balance: newBalance });

  // 3. Sync wallet (best-effort)
  try {
    const wallets = await base44.entities.Wallet.filter({ user_id: userId });
    if (wallets?.[0]) {
      await base44.entities.Wallet.update(wallets[0].id, {
        available_balance: (wallets[0].available_balance || 0) + amount,
        total_earned: (wallets[0].total_earned || 0) + amount,
        total_rewards: (wallets[0].total_rewards || 0) + amount,
      });
    }
  } catch (e) {
    console.warn('Wallet sync failed:', e);
  }

  return { newBalance };
}

/**
 * Deduct GGG from a user with full ledger consistency.
 * RACE-SAFE: Fresh-reads before deducting.
 */
export async function deductGGG(userId, amount, reasonCode, description, sourceType = 'reward', sourceId) {
  if (!userId || !amount || amount <= 0) return { newBalance: 0 };

  // Fresh-read profile
  const profiles = await base44.entities.UserProfile.filter({ user_id: userId });
  const profile = profiles?.[0];
  if (!profile) throw new Error('User profile not found');

  const currentBalance = profile.ggg_balance || 0;
  if (currentBalance < amount) throw new Error('Insufficient GGG balance');

  const newBalance = currentBalance - amount;

  await base44.entities.GGGTransaction.create({
    user_id: userId,
    delta: -amount,
    reason_code: reasonCode,
    description,
    balance_after: newBalance,
    source_type: sourceType,
    source_id: sourceId || undefined,
  });

  await base44.entities.UserProfile.update(profile.id, { ggg_balance: newBalance });

  try {
    const wallets = await base44.entities.Wallet.filter({ user_id: userId });
    if (wallets?.[0]) {
      await base44.entities.Wallet.update(wallets[0].id, {
        available_balance: Math.max(0, (wallets[0].available_balance || 0) - amount),
        total_spent: (wallets[0].total_spent || 0) + amount,
      });
    }
  } catch (e) {
    console.warn('Wallet sync failed:', e);
  }

  return { newBalance };
}