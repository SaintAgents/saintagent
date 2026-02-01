import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Awards GGG when onboarding is completed.
 * Triggered by entity automation on OnboardingProgress update.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    let body;
    try {
      body = await req.json();
    } catch {
      body = {};
    }
    
    const { event, data } = body;
    
    // Only process if status changed to 'complete'
    if (!data || data.status !== 'complete') {
      return Response.json({ skipped: true, reason: 'Not a completion event' });
    }
    
    const userId = data.user_id;
    if (!userId) {
      return Response.json({ skipped: true, reason: 'No user_id' });
    }
    
    // Check if reward already given (idempotency)
    const existingTx = await base44.asServiceRole.entities.WalletTransaction.filter({
      actor_user_id: userId,
      tx_type: 'EARN_REWARD',
      memo: 'Onboarding completion bonus'
    });
    
    if (existingTx?.length > 0) {
      return Response.json({ skipped: true, reason: 'Reward already granted' });
    }
    
    // Fetch the GGG rule for finish_onboard
    const rules = await base44.asServiceRole.entities.GGGRewardRule.filter({ 
      action_type: 'finish_onboard', 
      is_active: true 
    });
    const gggAmount = rules?.[0]?.ggg_amount || 0.1122;
    
    if (gggAmount <= 0) {
      return Response.json({ skipped: true, reason: 'No GGG amount configured' });
    }
    
    // Get or create wallet for user
    const wallets = await base44.asServiceRole.entities.Wallet.filter({ user_id: userId });
    let wallet = wallets?.[0];
    
    if (!wallet) {
      // Get profile balance for migration
      const profiles = await base44.asServiceRole.entities.UserProfile.filter({ user_id: userId });
      const startingBalance = profiles?.[0]?.ggg_balance || 0;
      
      wallet = await base44.asServiceRole.entities.Wallet.create({
        user_id: userId,
        available_balance: startingBalance,
        locked_balance: 0,
        total_earned: 0,
        total_spent: 0,
        total_rewards: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    
    // Credit the wallet
    const newBalance = Math.round((wallet.available_balance + gggAmount) * 10000) / 10000;
    const newTotalEarned = Math.round(((wallet.total_earned || 0) + gggAmount) * 10000) / 10000;
    const newTotalRewards = Math.round(((wallet.total_rewards || 0) + gggAmount) * 10000) / 10000;
    
    await base44.asServiceRole.entities.Wallet.update(wallet.id, {
      available_balance: newBalance,
      total_earned: newTotalEarned,
      total_rewards: newTotalRewards,
      updated_at: new Date().toISOString(),
    });
    
    // Update profile balance
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({ user_id: userId });
    if (profiles?.[0]) {
      await base44.asServiceRole.entities.UserProfile.update(profiles[0].id, {
        ggg_balance: newBalance
      });
    }
    
    // Create transaction record
    await base44.asServiceRole.entities.WalletTransaction.create({
      tx_id: `onboard_${userId}_${Date.now()}`,
      timestamp: new Date().toISOString(),
      tx_type: 'EARN_REWARD',
      actor_user_id: userId,
      amount_ggg: gggAmount,
      direction: 'CREDIT',
      status: 'COMPLETED',
      memo: 'Onboarding completion bonus',
      related_object_type: 'ONBOARDING',
      event_id: `onboard_complete_${userId}`,
    });
    
    // Also create a GGGTransaction for legacy compatibility
    await base44.asServiceRole.entities.GGGTransaction.create({
      user_id: userId,
      source_type: 'reward',
      delta: gggAmount,
      reason_code: 'finish_onboard',
      description: 'Completed onboarding profile setup',
      balance_after: newBalance,
    });
    
    // Create notification
    await base44.asServiceRole.entities.Notification.create({
      user_id: userId,
      type: 'ggg',
      title: '🎉 Onboarding Bonus Awarded!',
      message: `You earned ${gggAmount.toFixed(4)} GGG for completing your profile setup!`,
      priority: 'high',
    });
    
    console.log(`Awarded ${gggAmount} GGG to ${userId} for onboarding completion`);
    
    return Response.json({ 
      success: true, 
      user_id: userId,
      amount: gggAmount,
      new_balance: newBalance
    });
    
  } catch (error) {
    console.error('Award onboarding GGG error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});