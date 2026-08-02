import { createClientFromRequest } from 'npm:@base44/sdk@0.8.41';

function toNum(n) { return Math.round((Number(n) || 0) * 10000000) / 10000000; }

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get all user profiles (paginate)
    let allProfiles = [];
    let skip = 0;
    while (true) {
      const batch = await base44.asServiceRole.entities.UserProfile.list('-created_date', 200, skip);
      if (!batch || batch.length === 0) break;
      allProfiles = allProfiles.concat(batch);
      if (batch.length < 200) break;
      skip += 200;
    }
    
    // Get ALL GGGTransaction records (the SINGLE source of truth)
    let allTx = [];
    skip = 0;
    while (true) {
      const batch = await base44.asServiceRole.entities.GGGTransaction.list('-created_date', 200, skip);
      if (!batch || batch.length === 0) break;
      allTx = allTx.concat(batch);
      if (batch.length < 200) break;
      skip += 200;
    }
    
    // Build balance map: sum all deltas per user_id
    const balanceMap = {};
    for (const tx of allTx) {
      if (!tx.user_id) continue;
      balanceMap[tx.user_id] = toNum((balanceMap[tx.user_id] || 0) + (tx.delta || 0));
    }
    
    // Get all wallets for batch sync
    let allWallets = [];
    skip = 0;
    while (true) {
      const batch = await base44.asServiceRole.entities.Wallet.list('-created_date', 200, skip);
      if (!batch || batch.length === 0) break;
      allWallets = allWallets.concat(batch);
      if (batch.length < 200) break;
      skip += 200;
    }
    const walletMap = {};
    for (const w of allWallets) {
      if (w.user_id) walletMap[w.user_id] = w;
    }
    
    // Update each profile AND wallet where balance is wrong
    let updatedProfiles = 0;
    let updatedWallets = 0;
    let skippedProfiles = 0;
    const details = [];
    
    for (const profile of allProfiles) {
      const correctBalance = balanceMap[profile.user_id] || 0;
      const currentBalance = profile.ggg_balance || 0;
      
      const roundedCorrect = toNum(correctBalance);
      const roundedCurrent = toNum(currentBalance);
      
      // Fix UserProfile balance
      if (Math.abs(roundedCorrect - roundedCurrent) > 0.000001) {
        await base44.asServiceRole.entities.UserProfile.update(profile.id, {
          ggg_balance: roundedCorrect
        });
        details.push({
          user_id: profile.user_id,
          display_name: profile.display_name,
          old_profile_balance: roundedCurrent,
          new_balance: roundedCorrect,
          fixed: 'profile'
        });
        updatedProfiles++;
      } else {
        skippedProfiles++;
      }
      
      // Fix Wallet balance to match
      const wallet = walletMap[profile.user_id];
      if (wallet) {
        const walletBalance = toNum(wallet.available_balance || 0);
        if (Math.abs(roundedCorrect - walletBalance) > 0.000001) {
          await base44.asServiceRole.entities.Wallet.update(wallet.id, {
            available_balance: roundedCorrect,
            total_earned: roundedCorrect + toNum(wallet.total_spent || 0),
            updated_at: new Date().toISOString(),
          });
          updatedWallets++;
          const existing = details.find(d => d.user_id === profile.user_id);
          if (existing) {
            existing.old_wallet_balance = walletBalance;
            existing.fixed = 'both';
          } else {
            details.push({
              user_id: profile.user_id,
              display_name: profile.display_name,
              old_wallet_balance: walletBalance,
              new_balance: roundedCorrect,
              fixed: 'wallet'
            });
          }
        }
      }
    }
    
    return Response.json({
      success: true,
      source_of_truth: 'GGGTransaction ledger (sum of all deltas)',
      total_profiles: allProfiles.length,
      total_transactions: allTx.length,
      total_wallets: allWallets.length,
      updated_profiles: updatedProfiles,
      updated_wallets: updatedWallets,
      skipped: skippedProfiles,
      details
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});