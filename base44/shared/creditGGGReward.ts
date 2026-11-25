export default async function creditGGGReward(entities, email, { amount, type, memo, sourceId, eventId }) {
  const timestamp = new Date().toISOString();
  const [wallets, profiles] = await Promise.all([
    entities.Wallet.filter({ user_id: email }, 'created_date', 1),
    entities.UserProfile.filter({ user_id: email }, '-updated_date', 1),
  ]);
  const profile = profiles[0];
  const wallet = wallets[0] ?? await entities.Wallet.create({
    user_id: email, available_balance: Number(profile?.ggg_balance) || 0,
    locked_balance: 0, total_earned: 0, total_spent: 0, total_rewards: 0,
    created_at: timestamp, updated_at: timestamp,
  });
  const credited = await entities.Wallet.updateMany({ id: wallet.id, user_id: email }, {
    $inc: { available_balance: amount, total_earned: amount, total_rewards: amount },
    $set: { updated_at: timestamp },
  });
  if (credited.updated !== 1) throw new Error('Reward wallet credit did not update a wallet');
  if (profile) await entities.UserProfile.updateMany({ id: profile.id, user_id: email }, { $inc: { ggg_balance: amount } });
  const balance = await (profile ? entities.UserProfile.get(profile.id) : entities.Wallet.get(wallet.id));
  await entities.GGGTransaction.create({ user_id: email, delta: amount, reason_code: type, description: memo,
    balance_after: profile ? balance.ggg_balance : balance.available_balance, source_type: 'reward', source_id: sourceId });
  await entities.WalletTransaction.create({ tx_id: crypto.randomUUID(), timestamp, tx_type: 'EARN_REWARD', actor_user_id: email,
    amount_ggg: amount, direction: 'CREDIT', status: 'COMPLETED', related_object_type: type, related_object_id: sourceId,
    memo, event_id: eventId });
}