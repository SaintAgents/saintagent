import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

function nowIso() { return new Date().toISOString(); }
function tid(prefix = 'tx') { return `${prefix}_${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}`; }
function toNum(n) { return Math.round((Number(n) || 0) * 10000000) / 10000000; }

async function getOrCreateWallet(base44, userId) {
  const rows = await base44.entities.Wallet.filter({ user_id: userId });
  if (rows?.length) return rows[0];
  const profiles = await base44.entities.UserProfile.filter({ user_id: userId });
  const startingAvail = toNum(profiles?.[0]?.ggg_balance || 0);
  const created = await base44.entities.Wallet.create({
    user_id: userId,
    available_balance: startingAvail,
    locked_balance: 0,
    total_earned: 0,
    total_spent: 0,
    total_received_transfers: 0,
    total_sent_transfers: 0,
    total_mission_earnings: 0,
    total_marketplace_earnings: 0,
    total_rewards: 0,
    created_at: nowIso(),
    updated_at: nowIso(),
  });
  return created;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { action_type, source_id, memo } = body;

    if (!action_type) {
      return Response.json({ error: 'action_type is required' }, { status: 400 });
    }

    const userId = user.email;

    // Build idempotent event_id: one reward per action_type + source per day (for micro actions)
    // For source-specific actions (follow user X, post Y), allow one per source
    const today = new Date().toISOString().slice(0, 10);
    const DAILY_CAPPED = [
      'profile_view', 'post_view', 'like_react', 'daily_checkin', 'profile_update'
    ];
    let eventId;
    if (DAILY_CAPPED.includes(action_type)) {
      // Daily cap: one reward per action_type per day
      eventId = `earn_${action_type}_${userId}_${today}`;
    } else if (source_id) {
      // Source-specific: one reward per action_type + source ever
      eventId = `earn_${action_type}_${userId}_${source_id}`;
    } else {
      // No source: one per action_type per day
      eventId = `earn_${action_type}_${userId}_${today}`;
    }

    // Check idempotency - already earned?
    const existing = await base44.entities.WalletTransaction.filter({ event_id: eventId });
    if (existing?.length > 0) {
      return Response.json({ 
        awarded: false, 
        reason: 'Already earned for this action',
        event_id: eventId 
      });
    }

    // Look up active reward rule
    const rules = await base44.entities.GGGRewardRule.filter({ action_type, is_active: true });
    const rule = rules?.[0];
    if (!rule) {
      return Response.json({ 
        awarded: false, 
        reason: `No active reward rule for "${action_type}"` 
      });
    }

    const amount = toNum(rule.ggg_amount);
    if (amount <= 0) {
      return Response.json({ awarded: false, reason: 'Rule amount is 0' });
    }

    // Credit the wallet
    const wallet = await getOrCreateWallet(base44, userId);
    const newAvail = toNum(wallet.available_balance + amount);
    const updates = {
      available_balance: newAvail,
      total_earned: toNum((wallet.total_earned || 0) + amount),
      total_rewards: toNum((wallet.total_rewards || 0) + amount),
      updated_at: nowIso(),
    };
    const saved = await base44.entities.Wallet.update(wallet.id, updates);

    // Update profile balance
    const profiles = await base44.entities.UserProfile.filter({ user_id: userId });
    if (profiles?.[0]) {
      await base44.entities.UserProfile.update(profiles[0].id, { ggg_balance: toNum(newAvail) });
    }

    // Write transaction
    await base44.entities.WalletTransaction.create({
      tx_id: tid('earn'),
      timestamp: nowIso(),
      tx_type: 'EARN_REWARD',
      actor_user_id: userId,
      amount_ggg: amount,
      direction: 'CREDIT',
      status: 'COMPLETED',
      related_object_type: action_type,
      related_object_id: source_id || undefined,
      memo: memo || `Earned GGG: ${rule.description || action_type}`,
      event_id: eventId,
      metadata: { rule_id: rule.id, action_type },
    });

    // Also write legacy GGGTransaction for backward compat
    await base44.entities.GGGTransaction.create({
      user_id: userId,
      delta: amount,
      reason_code: action_type,
      description: memo || `Earned: ${rule.description || action_type}`,
      balance_after: newAvail,
      source_type: 'reward',
      source_id: source_id || undefined,
    });

    return Response.json({
      awarded: true,
      amount,
      action_type,
      new_balance: newAvail,
      event_id: eventId,
    });
  } catch (error) {
    return Response.json({ error: error.message || String(error) }, { status: 500 });
  }
});