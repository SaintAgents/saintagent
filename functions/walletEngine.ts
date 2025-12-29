import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

function nowIso() { return new Date().toISOString(); }
function tid(prefix='tx') { return `${prefix}_${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}`; }
function toNum(n) { return Math.round((Number(n) || 0) * 10000) / 10000; }

async function getOrCreateWallet(base44, userId) {
  const rows = await base44.entities.Wallet.filter({ user_id: userId });
  if (rows?.length) return rows[0];
  return base44.entities.Wallet.create({
    user_id: userId,
    available_balance: 0,
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
}

async function updateProfileBalance(base44, userId, available) {
  const profiles = await base44.entities.UserProfile.filter({ user_id: userId });
  if (profiles?.[0]) {
    await base44.entities.UserProfile.update(profiles[0].id, { ggg_balance: toNum(available) });
  }
}

async function writeTx(base44, tx) {
  const record = {
    tx_id: tx.tx_id || tid('tx'),
    timestamp: tx.timestamp || nowIso(),
    tx_type: tx.tx_type,
    actor_user_id: tx.actor_user_id,
    counterparty_user_id: tx.counterparty_user_id || undefined,
    amount_ggg: toNum(tx.amount_ggg),
    direction: tx.direction,
    status: tx.status || 'COMPLETED',
    related_object_type: tx.related_object_type || undefined,
    related_object_id: tx.related_object_id || undefined,
    memo: tx.memo || undefined,
    metadata: tx.metadata || undefined,
    linked_tx_id: tx.linked_tx_id || undefined,
    event_id: tx.event_id || undefined,
  };
  return base44.entities.WalletTransaction.create(record);
}

async function alreadyProcessed(base44, eventId) {
  if (!eventId) return false;
  const existing = await base44.entities.WalletTransaction.filter({ event_id: eventId });
  return (existing?.length || 0) > 0;
}

async function credit(base44, { user_id, amount, tx_type, memo, related, event_id, metadata }) {
  amount = toNum(amount);
  if (amount <= 0) throw new Error('Amount must be > 0');
  if (await alreadyProcessed(base44, event_id)) {
    const w = await getOrCreateWallet(base44, user_id);
    return { wallet: w, transactions: [], summary: 'Idempotent: event already processed' };
  }
  const w = await getOrCreateWallet(base44, user_id);
  const newAvail = toNum(w.available_balance + amount);
  const updates = { available_balance: newAvail, updated_at: nowIso() };
  if (tx_type === 'EARN_MISSION') updates.total_mission_earnings = toNum((w.total_mission_earnings || 0) + amount);
  if (tx_type === 'EARN_MARKET_SALE') updates.total_marketplace_earnings = toNum((w.total_marketplace_earnings || 0) + amount);
  if (tx_type === 'EARN_REWARD') updates.total_rewards = toNum((w.total_rewards || 0) + amount);
  if (tx_type?.startsWith('EARN_') || tx_type === 'ADJUSTMENT_CREDIT' || tx_type === 'REFUND' || tx_type === 'TRANSFER_IN') {
    updates.total_earned = toNum((w.total_earned || 0) + amount);
  }
  const saved = await base44.entities.Wallet.update(w.id, updates);
  await updateProfileBalance(base44, user_id, saved.available_balance);
  const tx = await writeTx(base44, {
    tx_type,
    actor_user_id: user_id,
    amount_ggg: amount,
    direction: 'CREDIT',
    memo,
    related_object_type: related?.type,
    related_object_id: related?.id,
    event_id,
    metadata,
  });
  return { wallet: saved, transactions: [tx], summary: `${amount} GGG credited to ${user_id} (${tx_type})` };
}

async function debit(base44, { user_id, amount, tx_type, memo, related, event_id, metadata }) {
  amount = toNum(amount);
  if (amount <= 0) throw new Error('Amount must be > 0');
  if (await alreadyProcessed(base44, event_id)) {
    const w = await getOrCreateWallet(base44, user_id);
    return { wallet: w, transactions: [], summary: 'Idempotent: event already processed' };
  }
  const w = await getOrCreateWallet(base44, user_id);
  if (toNum(w.available_balance) < amount) {
    const tx = await writeTx(base44, {
      tx_type,
      actor_user_id: user_id,
      amount_ggg: amount,
      direction: 'DEBIT',
      status: 'FAILED',
      memo: memo || 'Insufficient funds',
      related_object_type: related?.type,
      related_object_id: related?.id,
      event_id,
      metadata,
    });
    throw new Error('Insufficient balance');
  }
  const newAvail = toNum(w.available_balance - amount);
  const updates = {
    available_balance: newAvail,
    total_spent: toNum((w.total_spent || 0) + amount),
    updated_at: nowIso(),
  };
  const saved = await base44.entities.Wallet.update(w.id, updates);
  await updateProfileBalance(base44, user_id, saved.available_balance);
  const tx = await writeTx(base44, {
    tx_type,
    actor_user_id: user_id,
    amount_ggg: amount,
    direction: 'DEBIT',
    memo,
    related_object_type: related?.type,
    related_object_id: related?.id,
    event_id,
    metadata,
  });
  return { wallet: saved, transactions: [tx], summary: `${amount} GGG debited from ${user_id} (${tx_type})` };
}

async function transfer(base44, { from_user_id, to_user_id, amount, memo, event_id }) {
  amount = toNum(amount);
  if (amount <= 0) throw new Error('Amount must be > 0');
  if (from_user_id === to_user_id) throw new Error('Cannot transfer to self');
  if (await alreadyProcessed(base44, event_id)) {
    const [sw, rw] = await Promise.all([
      getOrCreateWallet(base44, from_user_id),
      getOrCreateWallet(base44, to_user_id),
    ]);
    return { wallets: [sw, rw], transactions: [], summary: 'Idempotent: event already processed' };
  }
  const sender = await getOrCreateWallet(base44, from_user_id);
  if (toNum(sender.available_balance) < amount) throw new Error('Insufficient balance');
  const receiver = await getOrCreateWallet(base44, to_user_id);

  // Update balances (best-effort atomicity)
  const sNew = await base44.entities.Wallet.update(sender.id, {
    available_balance: toNum(sender.available_balance - amount),
    total_spent: toNum((sender.total_spent || 0) + amount),
    total_sent_transfers: toNum((sender.total_sent_transfers || 0) + amount),
    updated_at: nowIso(),
  });
  try {
    const rNew = await base44.entities.Wallet.update(receiver.id, {
      available_balance: toNum(receiver.available_balance + amount),
      total_earned: toNum((receiver.total_earned || 0) + amount),
      total_received_transfers: toNum((receiver.total_received_transfers || 0) + amount),
      updated_at: nowIso(),
    });
    await Promise.all([
      updateProfileBalance(base44, from_user_id, sNew.available_balance),
      updateProfileBalance(base44, to_user_id, rNew.available_balance),
    ]);
    const outId = tid('tx');
    const inId = tid('tx');
    const t1 = await writeTx(base44, {
      tx_id: outId,
      tx_type: 'TRANSFER_OUT',
      actor_user_id: from_user_id,
      counterparty_user_id: to_user_id,
      amount_ggg: amount,
      direction: 'DEBIT',
      memo: memo || 'Transfer to user',
      event_id,
      metadata: { linked_tx_id: inId },
    });
    const t2 = await writeTx(base44, {
      tx_id: inId,
      tx_type: 'TRANSFER_IN',
      actor_user_id: to_user_id,
      counterparty_user_id: from_user_id,
      amount_ggg: amount,
      direction: 'CREDIT',
      memo: memo || 'Transfer from user',
      event_id,
      metadata: { linked_tx_id: outId },
    });
    return { wallets: [sNew, rNew], transactions: [t1, t2], summary: `${from_user_id} sent ${amount} GGG to ${to_user_id}` };
  } catch (e) {
    // Attempt rollback sender
    await base44.entities.Wallet.update(sender.id, {
      available_balance: toNum(sender.available_balance),
      total_spent: toNum(sender.total_spent || 0),
      total_sent_transfers: toNum(sender.total_sent_transfers || 0),
      updated_at: nowIso(),
    });
    await updateProfileBalance(base44, from_user_id, sender.available_balance);
    throw e;
  }
}

async function lockFunds(base44, { user_id, amount, memo, related, event_id }) {
  amount = toNum(amount);
  const w = await getOrCreateWallet(base44, user_id);
  if (toNum(w.available_balance) < amount) throw new Error('Insufficient balance');
  const saved = await base44.entities.Wallet.update(w.id, {
    available_balance: toNum(w.available_balance - amount),
    locked_balance: toNum((w.locked_balance || 0) + amount),
    updated_at: nowIso(),
  });
  await updateProfileBalance(base44, user_id, saved.available_balance);
  const tx = await writeTx(base44, {
    tx_type: 'LOCK_FUNDS',
    actor_user_id: user_id,
    amount_ggg: amount,
    direction: 'DEBIT',
    memo: memo || 'Funds locked',
    related_object_type: related?.type,
    related_object_id: related?.id,
    event_id,
  });
  return { wallet: saved, transactions: [tx], summary: `${amount} GGG locked for ${user_id}` };
}

async function releaseFunds(base44, { from_user_id, to_user_id, amount, memo, related, event_id }) {
  amount = toNum(amount);
  const fromW = await getOrCreateWallet(base44, from_user_id);
  if (toNum(fromW.locked_balance) < amount) throw new Error('Insufficient locked balance');
  const afterFrom = await base44.entities.Wallet.update(fromW.id, {
    locked_balance: toNum(fromW.locked_balance - amount),
    updated_at: nowIso(),
  });
  let txs = [];
  // Credit receiver if specified, else return to from_user available
  if (to_user_id && to_user_id !== from_user_id) {
    const toW = await getOrCreateWallet(base44, to_user_id);
    const afterTo = await base44.entities.Wallet.update(toW.id, {
      available_balance: toNum(toW.available_balance + amount),
      total_earned: toNum((toW.total_earned || 0) + amount),
      updated_at: nowIso(),
    });
    await Promise.all([
      updateProfileBalance(base44, from_user_id, afterFrom.available_balance),
      updateProfileBalance(base44, to_user_id, afterTo.available_balance),
    ]);
    const out = await writeTx(base44, {
      tx_type: 'RELEASE_FUNDS',
      actor_user_id: from_user_id,
      counterparty_user_id: to_user_id,
      amount_ggg: amount,
      direction: 'DEBIT',
      memo: memo || 'Released from lock',
      related_object_type: related?.type,
      related_object_id: related?.id,
      event_id,
    });
    const inc = await writeTx(base44, {
      tx_type: 'EARN_MISSION',
      actor_user_id: to_user_id,
      counterparty_user_id: from_user_id,
      amount_ggg: amount,
      direction: 'CREDIT',
      memo: memo || 'Released to recipient',
      related_object_type: related?.type,
      related_object_id: related?.id,
      event_id,
    });
    txs = [out, inc];
  } else {
    const afterReturn = await base44.entities.Wallet.update(fromW.id, {
      available_balance: toNum(afterFrom.available_balance + amount),
      updated_at: nowIso(),
    });
    await updateProfileBalance(base44, from_user_id, afterReturn.available_balance);
    txs = [await writeTx(base44, {
      tx_type: 'RELEASE_FUNDS',
      actor_user_id: from_user_id,
      amount_ggg: amount,
      direction: 'CREDIT',
      memo: memo || 'Returned to available',
      related_object_type: related?.type,
      related_object_id: related?.id,
      event_id,
    })];
  }
  return { transactions: txs, summary: `${amount} GGG released from ${from_user_id}${to_user_id ? ' to ' + to_user_id : ''}` };
}

async function refund(base44, { user_id, amount, memo, related, event_id }) {
  return credit(base44, { user_id, amount, tx_type: 'REFUND', memo, related, event_id });
}

async function adjustment(base44, { user_id, amount, direction, memo, admin_note, event_id }, currentUser) {
  if (currentUser?.role !== 'admin') throw new Error('Admin only');
  if (direction === 'CREDIT') return credit(base44, { user_id, amount, tx_type: 'ADJUSTMENT_CREDIT', memo: memo || admin_note, event_id, metadata: { admin: currentUser?.email } });
  if (direction === 'DEBIT') return debit(base44, { user_id, amount, tx_type: 'ADJUSTMENT_DEBIT', memo: memo || admin_note, event_id, metadata: { admin: currentUser?.email } });
  throw new Error('direction must be CREDIT or DEBIT');
}

async function processMissionCompleted(base44, payload) {
  const { mission_id, buyer_id, seller_id, amount_ggg, fee_percent = 0, event_id } = payload;
  if (await alreadyProcessed(base44, event_id)) {
    const [bw, sw] = await Promise.all([getOrCreateWallet(base44, buyer_id), getOrCreateWallet(base44, seller_id)]);
    return { wallets: [bw, sw], transactions: [], summary: 'Idempotent: event already processed' };
  }
  const fee = toNum((Number(fee_percent) || 0) / 100 * amount_ggg);
  const sellerNet = toNum(amount_ggg - fee);
  // Move locked funds from buyer to seller
  const rel = await releaseFunds(base44, {
    from_user_id: buyer_id,
    to_user_id: seller_id,
    amount: amount_ggg,
    memo: `Mission ${mission_id} payout`,
    related: { type: 'MISSION', id: mission_id },
    event_id,
  });
  let feeTx = [];
  if (fee > 0) {
    // charge fee to seller (debit)
    const d = await debit(base44, {
      user_id: seller_id,
      amount: fee,
      tx_type: 'SPEND_FEE',
      memo: `Platform fee ${fee_percent}% for mission ${mission_id}`,
      related: { type: 'MISSION', id: mission_id },
      event_id: `${event_id}-FEE`,
    });
    // compensate seller net if needed (their balance already got gross amount); holding pattern: debit fee only
    feeTx = d.transactions;
  }
  const [bw, sw] = await Promise.all([getOrCreateWallet(base44, buyer_id), getOrCreateWallet(base44, seller_id)]);
  return {
    wallets: [bw, sw],
    transactions: [...rel.transactions, ...feeTx],
    summary: `Mission ${mission_id} completed. Buyer ${buyer_id} released ${amount_ggg} GGG; seller ${seller_id} received ${sellerNet} GGG after ${fee_percent}% fee.`
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { action, payload } = await req.json();

    if (action === 'getWallet') {
      const uid = payload?.user_id || user.email;
      const w = await getOrCreateWallet(base44, uid);
      return Response.json({ wallet: w });
    }
    if (action === 'getTransactions') {
      const uid = payload?.user_id || user.email;
      const tx = await base44.entities.WalletTransaction.filter({ actor_user_id: uid }, '-timestamp', 200);
      return Response.json({ transactions: tx });
    }
    if (action === 'credit') {
      const res = await credit(base44, { ...payload });
      return Response.json(res);
    }
    if (action === 'debit') {
      const res = await debit(base44, { ...payload });
      return Response.json(res);
    }
    if (action === 'transfer') {
      const res = await transfer(base44, { ...payload });
      return Response.json(res);
    }
    if (action === 'lockFunds') {
      const res = await lockFunds(base44, { ...payload });
      return Response.json(res);
    }
    if (action === 'releaseFunds') {
      const res = await releaseFunds(base44, { ...payload });
      return Response.json(res);
    }
    if (action === 'refund') {
      const res = await refund(base44, { ...payload });
      return Response.json(res);
    }
    if (action === 'adjustment') {
      const res = await adjustment(base44, { ...payload }, user);
      return Response.json(res);
    }
    if (action === 'processEvent') {
      if (payload?.event_type === 'MISSION_COMPLETED') {
        const res = await processMissionCompleted(base44, payload);
        return Response.json(res);
      }
      return Response.json({ error: 'Unsupported event_type' }, { status: 400 });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message || String(error) }, { status: 500 });
  }
});