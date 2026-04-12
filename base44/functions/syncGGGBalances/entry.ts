import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get all user profiles
    const profiles = await base44.asServiceRole.entities.UserProfile.list('-created_date', 1000);
    
    // Get all GGG transactions
    const allTx = await base44.asServiceRole.entities.GGGTransaction.list('-created_date', 10000);
    
    // Build balance map: sum all deltas per user_id
    const balanceMap = {};
    for (const tx of allTx) {
      if (!tx.user_id) continue;
      balanceMap[tx.user_id] = (balanceMap[tx.user_id] || 0) + (tx.delta || 0);
    }
    
    // Update each profile where balance is wrong
    let updated = 0;
    let skipped = 0;
    const details = [];
    
    for (const profile of profiles) {
      const correctBalance = balanceMap[profile.user_id] || 0;
      const currentBalance = profile.ggg_balance || 0;
      
      // Round to avoid floating point comparison issues
      const roundedCorrect = parseFloat(correctBalance.toFixed(4));
      const roundedCurrent = parseFloat(currentBalance.toFixed(4));
      
      if (roundedCorrect !== roundedCurrent) {
        await base44.asServiceRole.entities.UserProfile.update(profile.id, {
          ggg_balance: roundedCorrect
        });
        details.push({
          user_id: profile.user_id,
          display_name: profile.display_name,
          old_balance: roundedCurrent,
          new_balance: roundedCorrect
        });
        updated++;
      } else {
        skipped++;
      }
    }
    
    return Response.json({
      success: true,
      total_profiles: profiles.length,
      total_transactions: allTx.length,
      updated,
      skipped,
      details
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});