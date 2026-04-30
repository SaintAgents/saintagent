import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Fixes the bogus 100 GGG onboarding_completion rewards from Jan 21, 2026.
 * These were incorrectly awarded in a bulk op. The correct onboarding reward is 0.1122 GGG.
 * This function subtracts 100 GGG from affected users' profiles and wallets, and logs correction transactions.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const dryRun = body.dry_run !== false; // default to dry run for safety

    // Find all bogus 100 GGG onboarding_completion transactions
    const bogusTxs = await base44.asServiceRole.entities.GGGTransaction.filter({
      reason_code: 'onboarding_completion',
      delta: 100
    });

    if (!bogusTxs?.length) {
      return Response.json({ success: true, message: 'No bogus transactions found', corrections: [] });
    }

    const corrections = [];

    for (const tx of bogusTxs) {
      const userId = tx.user_id;

      // Get profile
      const profiles = await base44.asServiceRole.entities.UserProfile.filter({ user_id: userId });
      const profile = profiles?.[0];

      if (!profile) {
        corrections.push({ userId, status: 'skipped', reason: 'no profile found' });
        continue;
      }

      const currentBalance = profile.ggg_balance || 0;
      const newBalance = Math.max(0, Math.round((currentBalance - 100) * 10000) / 10000);

      // Get wallet
      const wallets = await base44.asServiceRole.entities.Wallet.filter({ user_id: userId });
      const wallet = wallets?.[0];

      const correction = {
        userId,
        displayName: profile.display_name,
        handle: profile.handle,
        currentBalance,
        newBalance,
        walletAdjusted: false,
        bogusTxId: tx.id,
        status: dryRun ? 'dry_run' : 'corrected'
      };

      if (!dryRun) {
        // Subtract 100 from profile balance
        await base44.asServiceRole.entities.UserProfile.update(profile.id, {
          ggg_balance: newBalance
        });

        // Adjust wallet if it exists
        if (wallet) {
          const walletBalance = Math.max(0, Math.round(((wallet.available_balance || 0) - 100) * 10000) / 10000);
          const walletEarned = Math.max(0, Math.round(((wallet.total_earned || 0) - 100) * 10000) / 10000);
          const walletRewards = Math.max(0, Math.round(((wallet.total_rewards || 0) - 100) * 10000) / 10000);

          await base44.asServiceRole.entities.Wallet.update(wallet.id, {
            available_balance: walletBalance,
            total_earned: walletEarned,
            total_rewards: walletRewards,
            updated_at: new Date().toISOString()
          });
          correction.walletAdjusted = true;
        }

        // Create correction transaction
        await base44.asServiceRole.entities.GGGTransaction.create({
          user_id: userId,
          source_type: 'reward',
          delta: -100,
          reason_code: 'bogus_onboarding_correction',
          description: 'Reversed bogus 100 GGG onboarding_completion reward from Jan 21 2026',
          balance_after: newBalance
        });

        // Delete the bogus transaction
        await base44.asServiceRole.entities.GGGTransaction.delete(tx.id);
      }

      corrections.push(correction);
    }

    return Response.json({
      success: true,
      dry_run: dryRun,
      message: dryRun
        ? 'DRY RUN — no changes made. Call with {"dry_run": false} to apply.'
        : `Corrected ${corrections.filter(c => c.status === 'corrected').length} users.`,
      corrections
    });

  } catch (error) {
    console.error('Fix bogus onboarding rewards error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});