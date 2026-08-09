import { createClientFromRequest } from 'npm:@base44/sdk@0.8.41';

function toNum(n) { return Math.round((Number(n) || 0) * 10000000) / 10000000; }

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get all user profiles (paginated)
    let allProfiles = [];
    let skip = 0;
    while (true) {
      const batch = await base44.asServiceRole.entities.UserProfile.list('-created_date', 200, skip);
      if (!batch || batch.length === 0) break;
      allProfiles = allProfiles.concat(batch);
      if (batch.length < 200) break;
      skip += 200;
    }

    // Get ALL GGGTransaction records (legacy ledger)
    let allLegacyTx = [];
    skip = 0;
    while (true) {
      const batch = await base44.asServiceRole.entities.GGGTransaction.list('-created_date', 200, skip);
      if (!batch || batch.length === 0) break;
      allLegacyTx = allLegacyTx.concat(batch);
      if (batch.length < 200) break;
      skip += 200;
    }

    // Build legacy balance map: sum all deltas per user_id
    const legacyBalanceMap: Record<string, number> = {};
    for (const tx of allLegacyTx) {
      if (!tx.user_id) continue;
      legacyBalanceMap[tx.user_id] = toNum((legacyBalanceMap[tx.user_id] || 0) + (tx.delta || 0));
    }

    // Get ALL WalletTransaction records (wallet engine ledger)
    let allWalletTx = [];
    skip = 0;
    while (true) {
      const batch = await base44.asServiceRole.entities.WalletTransaction.list('-timestamp', 200, skip);
      if (!batch || batch.length === 0) break;
      allWalletTx = allWalletTx.concat(batch);
      if (batch.length < 200) break;
      skip += 200;
    }

    // Build wallet balance map from WalletTransaction, but ONLY for tx_types
    // that are NOT also written to GGGTransaction (to avoid double-counting).
    // 
    // earnGGG writes to BOTH ledgers, so EARN_REWARD with an event_id is already
    // counted in the legacy sum. We must skip those.
    //
    // Wallet-only tx_types (not written to GGGTransaction):
    //   ADJUSTMENT_CREDIT, ADJUSTMENT_DEBIT, TRANSFER_IN, TRANSFER_OUT,
    //   LOCK_FUNDS, RELEASE_FUNDS, REFUND, SPEND_FEE, EARN_MISSION,
    //   EARN_MARKET_SALE, SPEND_BOOST, SPEND_TIP, SPEND_PURCHASE
    //
    // Dual-written tx_types (already in GGGTransaction):
    //   EARN_REWARD (from earnGGG)
    //
    // Strategy: include ALL wallet txs, then subtract EARN_REWARD that have
    // a matching event_id (meaning they were dual-written by earnGGG).
    // If an EARN_REWARD has no event_id, it was likely only in wallet.
    
    // First, collect event_ids from legacy txs to detect overlap
    // Actually simpler: just skip EARN_REWARD wallet txs that have an event_id
    // starting with "earn_" since earnGGG always creates those and also writes legacy.
    
    const walletOnlyBalanceMap: Record<string, number> = {};
    for (const tx of allWalletTx) {
      if (tx.status === 'FAILED' || tx.status === 'REVERSED') continue;
      if (!tx.actor_user_id) continue;
      
      // Skip ALL EARN_REWARD txs — they are always dual-written to both
      // WalletTransaction and GGGTransaction, so they're already in the legacy sum
      if (tx.tx_type === 'EARN_REWARD') {
        continue;
      }
      
      const amount = toNum(tx.amount_ggg || 0);
      const uid = tx.actor_user_id;
      if (!walletOnlyBalanceMap[uid]) walletOnlyBalanceMap[uid] = 0;
      
      if (tx.direction === 'CREDIT') {
        walletOnlyBalanceMap[uid] = toNum(walletOnlyBalanceMap[uid] + amount);
      } else if (tx.direction === 'DEBIT') {
        walletOnlyBalanceMap[uid] = toNum(walletOnlyBalanceMap[uid] - amount);
      }
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
    const walletMap: Record<string, any> = {};
    for (const w of allWallets) {
      if (w.user_id) walletMap[w.user_id] = w;
    }

    // Collect all user_ids that appear in either ledger
    const allUserIds = new Set<string>();
    for (const uid of Object.keys(legacyBalanceMap)) allUserIds.add(uid);
    for (const uid of Object.keys(walletOnlyBalanceMap)) allUserIds.add(uid);

    // Update each profile AND wallet where balance is wrong
    let updatedProfiles = 0;
    let updatedWallets = 0;
    let skippedProfiles = 0;
    const details = [];

    for (const profile of allProfiles) {
      const uid = profile.user_id;
      // True balance = legacy sum + wallet-only sum (non-overlapping)
      const legacyPart = toNum(legacyBalanceMap[uid] || 0);
      const walletOnlyPart = toNum(walletOnlyBalanceMap[uid] || 0);
      const correctBalance = toNum(legacyPart + walletOnlyPart);
      const currentBalance = toNum(profile.ggg_balance || 0);

      // Fix UserProfile balance
      if (Math.abs(correctBalance - currentBalance) > 0.000001) {
        await base44.asServiceRole.entities.UserProfile.update(profile.id, {
          ggg_balance: correctBalance
        });
        details.push({
          user_id: uid,
          display_name: profile.display_name,
          old_profile_balance: currentBalance,
          legacy_sum: legacyPart,
          wallet_only_sum: walletOnlyPart,
          new_balance: correctBalance,
          fixed: 'profile'
        });
        updatedProfiles++;
      } else {
        skippedProfiles++;
      }

      // Fix Wallet balance to match
      const wallet = walletMap[uid];
      if (wallet) {
        const walletBalance = toNum(wallet.available_balance || 0);
        if (Math.abs(correctBalance - walletBalance) > 0.000001) {
          await base44.asServiceRole.entities.Wallet.update(wallet.id, {
            available_balance: correctBalance,
            total_earned: correctBalance + toNum(wallet.total_spent || 0),
            updated_at: new Date().toISOString(),
          });
          updatedWallets++;
          const existing = details.find(d => d.user_id === uid);
          if (existing) {
            existing.old_wallet_balance = walletBalance;
            existing.fixed = 'both';
          } else {
            details.push({
              user_id: uid,
              display_name: profile.display_name,
              old_wallet_balance: walletBalance,
              new_balance: correctBalance,
              fixed: 'wallet'
            });
          }
        }
      }
    }

    return Response.json({
      success: true,
      source_of_truth: 'Combined: GGGTransaction legacy sum + wallet-only WalletTransaction sum (all EARN_REWARD excluded since dual-written)',
      total_profiles: allProfiles.length,
      total_legacy_transactions: allLegacyTx.length,
      total_wallet_transactions: allWalletTx.length,
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