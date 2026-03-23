import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const CORRECT_ONBOARDING_REWARD = 0.1122;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get all completed onboarding records
    const onboardingRecords = await base44.asServiceRole.entities.OnboardingProgress.filter({ status: 'complete' });
    
    // Get all user profiles
    const userProfiles = await base44.asServiceRole.entities.UserProfile.list('-created_date', 500);
    const profileMap = {};
    userProfiles.forEach(p => { profileMap[p.user_id] = p; });
    
    // Get all GGG transactions for onboarding
    const allTransactions = await base44.asServiceRole.entities.GGGTransaction.list('-created_date', 2000);
    
    // Find onboarding transactions by reason_code
    const onboardingTxByUser = {};
    allTransactions.forEach(tx => {
      if (tx.reason_code === 'profile_completed' || tx.reason_code === 'finish_onboard') {
        if (!onboardingTxByUser[tx.user_id]) {
          onboardingTxByUser[tx.user_id] = [];
        }
        onboardingTxByUser[tx.user_id].push(tx);
      }
    });
    
    const corrections = [];
    const skipped = [];
    const alreadyCorrect = [];
    
    for (const record of onboardingRecords) {
      const userId = record.user_id;
      const profile = profileMap[userId];
      
      // Skip demo users
      if (profile?.is_demo || userId?.includes('demo')) {
        skipped.push({ userId, reason: 'demo user' });
        continue;
      }
      
      const userTxs = onboardingTxByUser[userId] || [];
      const totalOnboardingGGG = userTxs.reduce((sum, tx) => sum + (tx.delta || 0), 0);
      
      // Check if they already have the correct amount (within tolerance)
      if (Math.abs(totalOnboardingGGG - CORRECT_ONBOARDING_REWARD) < 0.0001) {
        alreadyCorrect.push({ userId, amount: totalOnboardingGGG });
        continue;
      }
      
      // Calculate correction needed
      const correctionNeeded = CORRECT_ONBOARDING_REWARD - totalOnboardingGGG;
      
      if (correctionNeeded <= 0) {
        // They have more than needed - skip (don't take away)
        skipped.push({ userId, reason: `already has ${totalOnboardingGGG}` });
        continue;
      }
      
      // Apply correction
      const currentBalance = profile?.ggg_balance || 0;
      const newBalance = currentBalance + correctionNeeded;
      
      // Update profile balance
      if (profile) {
        await base44.asServiceRole.entities.UserProfile.update(profile.id, {
          ggg_balance: newBalance
        });
      }
      
      // Create correction transaction
      await base44.asServiceRole.entities.GGGTransaction.create({
        user_id: userId,
        delta: correctionNeeded,
        reason_code: 'profile_completed',
        description: `Onboarding reward correction (sweep): adjusted from ${totalOnboardingGGG.toFixed(4)} to ${CORRECT_ONBOARDING_REWARD}`,
        balance_after: newBalance,
        source_type: 'reward'
      });
      
      corrections.push({
        userId,
        previousTotal: totalOnboardingGGG,
        correctionApplied: correctionNeeded,
        newBalance
      });
    }
    
    return Response.json({
      success: true,
      summary: {
        totalCompleted: onboardingRecords.length,
        correctionsMade: corrections.length,
        alreadyCorrect: alreadyCorrect.length,
        skipped: skipped.length
      },
      corrections,
      alreadyCorrect,
      skipped
    });
    
  } catch (error) {
    console.error('Sweep error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});