const amount = 0.77;
const type = 'site_skills_quest';
const memo = 'Completed all five Site Skills lessons';

export default async function creditSiteSkills(entities, email) {
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
  await entities.Wallet.updateMany({ id: wallet.id, user_id: email }, {
    $inc: { available_balance: amount, total_earned: amount, total_rewards: amount },
    $set: { updated_at: timestamp },
  });
  if (profile) await entities.UserProfile.updateMany({ id: profile.id, user_id: email }, { $inc: { ggg_balance: amount } });
  const balance = await (profile ? entities.UserProfile.get(profile.id) : entities.Wallet.get(wallet.id));
  await entities.GGGTransaction.create({ user_id: email, delta: amount, reason_code: type, description: memo,
    balance_after: profile ? balance.ggg_balance : balance.available_balance, source_type: 'reward', source_id: type });
  await entities.WalletTransaction.create({ tx_id: crypto.randomUUID(), timestamp, tx_type: 'EARN_REWARD', actor_user_id: email,
    amount_ggg: amount, direction: 'CREDIT', status: 'COMPLETED', related_object_type: type, related_object_id: type,
    memo, event_id: `earn_${type}_${email}` });
}