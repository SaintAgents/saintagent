import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

function toNum(n) { return Math.round((Number(n) || 0) * 10000) / 10000; }

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

    let body;
    try { body = await req.json(); } catch { body = {}; }
    const targetUserId = body.user_id;
    if (!targetUserId) return Response.json({ error: 'user_id required' }, { status: 400 });

    // 1. Get UserProfile balance
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({ user_id: targetUserId });
    const profile = profiles?.[0];
    const profileBalance = toNum(profile?.ggg_balance || 0);

    // 2. Get Wallet balance
    const wallets = await base44.asServiceRole.entities.Wallet.filter({ user_id: targetUserId });
    const wallet = wallets?.[0];
    const walletBalance = toNum(wallet?.available_balance || 0);
    const walletLocked = toNum(wallet?.locked_balance || 0);

    // 3. Sum ALL WalletTransaction records for this user (paginated)
    let allWalletTxs = [];
    let skip = 0;
    const pageSize = 200;
    while (true) {
      const batch = await base44.asServiceRole.entities.WalletTransaction.filter(
        { actor_user_id: targetUserId },
        '-timestamp',
        pageSize,
        skip
      );
      if (!batch || batch.length === 0) break;
      allWalletTxs = allWalletTxs.concat(batch);
      if (batch.length < pageSize) break;
      skip += pageSize;
    }

    // Calculate computed balance from transaction ledger
    let computedFromTxs = 0;
    let totalCredits = 0;
    let totalDebits = 0;
    const txBreakdown = {};

    for (const tx of allWalletTxs) {
      if (tx.status === 'FAILED' || tx.status === 'REVERSED') continue;
      
      const amount = toNum(tx.amount_ggg || 0);
      const type = tx.tx_type || 'UNKNOWN';
      
      if (!txBreakdown[type]) txBreakdown[type] = { count: 0, credits: 0, debits: 0 };
      txBreakdown[type].count++;
      
      if (tx.direction === 'CREDIT') {
        computedFromTxs = toNum(computedFromTxs + amount);
        totalCredits = toNum(totalCredits + amount);
        txBreakdown[type].credits = toNum(txBreakdown[type].credits + amount);
      } else if (tx.direction === 'DEBIT') {
        computedFromTxs = toNum(computedFromTxs - amount);
        totalDebits = toNum(totalDebits + amount);
        txBreakdown[type].debits = toNum(txBreakdown[type].debits + amount);
      }
    }

    // 4. Sum legacy GGGTransaction records
    let allLegacyTxs = [];
    skip = 0;
    while (true) {
      const batch = await base44.asServiceRole.entities.GGGTransaction.filter(
        { user_id: targetUserId },
        '-created_date',
        pageSize,
        skip
      );
      if (!batch || batch.length === 0) break;
      allLegacyTxs = allLegacyTxs.concat(batch);
      if (batch.length < pageSize) break;
      skip += pageSize;
    }

    let legacySum = 0;
    for (const tx of allLegacyTxs) {
      legacySum = toNum(legacySum + (tx.delta || 0));
    }

    // Also check by SA number if profile has one
    let legacyBySA = [];
    if (profile?.sa_number) {
      skip = 0;
      while (true) {
        const batch = await base44.asServiceRole.entities.GGGTransaction.filter(
          { user_id: profile.sa_number },
          '-created_date',
          pageSize,
          skip
        );
        if (!batch || batch.length === 0) break;
        legacyBySA = legacyBySA.concat(batch);
        if (batch.length < pageSize) break;
        skip += pageSize;
      }
      for (const tx of legacyBySA) {
        legacySum = toNum(legacySum + (tx.delta || 0));
      }
    }

    // 5. Determine discrepancies
    const discrepancies = [];
    
    const walletVsProfile = toNum(walletBalance - profileBalance);
    if (Math.abs(walletVsProfile) > 0.0001) {
      discrepancies.push({
        type: 'WALLET_VS_PROFILE',
        severity: 'warning',
        message: `Wallet balance (${walletBalance}) differs from UserProfile.ggg_balance (${profileBalance}) by ${walletVsProfile}`
      });
    }

    const walletVsLedger = toNum(walletBalance - computedFromTxs);
    if (Math.abs(walletVsLedger) > 0.0001) {
      discrepancies.push({
        type: 'WALLET_VS_LEDGER',
        severity: 'critical',
        message: `Wallet balance (${walletBalance}) differs from WalletTransaction ledger sum (${computedFromTxs}) by ${walletVsLedger}`
      });
    }

    const walletTotalsCheck = toNum((wallet?.total_earned || 0) - (wallet?.total_spent || 0));
    const walletTotalsVsBalance = toNum(walletBalance - walletTotalsCheck);
    if (wallet && Math.abs(walletTotalsVsBalance) > 0.01) {
      discrepancies.push({
        type: 'WALLET_TOTALS_MISMATCH',
        severity: 'info',
        message: `Wallet earned(${wallet.total_earned || 0}) - spent(${wallet.total_spent || 0}) = ${walletTotalsCheck}, but available_balance is ${walletBalance} (diff: ${walletTotalsVsBalance}). This can happen if wallet was initialized with a pre-existing balance.`
      });
    }

    const isHealthy = discrepancies.filter(d => d.severity === 'critical').length === 0;

    return Response.json({
      user_id: targetUserId,
      sa_number: profile?.sa_number || null,
      display_name: profile?.display_name || null,
      audit_timestamp: new Date().toISOString(),
      is_healthy: isHealthy,
      balances: {
        profile_ggg_balance: profileBalance,
        wallet_available: walletBalance,
        wallet_locked: walletLocked,
        wallet_total_earned: toNum(wallet?.total_earned || 0),
        wallet_total_spent: toNum(wallet?.total_spent || 0),
      },
      ledger: {
        wallet_tx_count: allWalletTxs.length,
        wallet_tx_computed_balance: computedFromTxs,
        total_credits: totalCredits,
        total_debits: totalDebits,
        tx_breakdown: txBreakdown,
      },
      legacy: {
        legacy_tx_count: allLegacyTxs.length + legacyBySA.length,
        legacy_sum: legacySum,
      },
      discrepancies,
      fix_available: discrepancies.some(d => d.type === 'WALLET_VS_PROFILE'),
    });
  } catch (error) {
    return Response.json({ error: error.message || String(error) }, { status: 500 });
  }
}