import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import creditGGGReward from '../../shared/creditGGGReward.ts';

const GOAL = 45;
const AMOUNT = 0.045;
const DAY = 86_400_000;
const DAILY_MAX = 10;
const MIN_SPACING = 700;
const MIN_REPEAT = 2800;
const TYPE = 'gold_flake_clicks';

function validClicks(clicks, elapsed) {
  if (!Array.isArray(clicks) || clicks.length !== GOAL || elapsed < (GOAL - 1) * MIN_SPACING) return false;
  const controls = new Map();
  let last = -MIN_SPACING;
  for (const click of clicks) {
    if (!Array.isArray(click) || click.length !== 2) return false;
    const [control, time] = click;
    if (!Number.isInteger(control) || control < 0 || control > 0xffffffff || !Number.isInteger(time) || time < 0 || time > elapsed + 1500 || time - last < MIN_SPACING) return false;
    const previous = controls.get(control);
    if (previous && (previous.count >= 5 || time - previous.time < MIN_REPEAT)) return false;
    controls.set(control, { count: (previous?.count ?? 0) + 1, time });
    last = time;
  }
  return true;
}

export default async function(req) {
  let lockedRound;
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(e => e.status === 401 ? null : Promise.reject(e));
    if (!user?.id || !user.email) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const input = await req.json().catch(() => null);
    if (!['start','claim'].includes(input?.action) || (input.action === 'claim' && (!/^[a-f\d-]{36}$/.test(input.round || '') || !Array.isArray(input.clicks) || input.clicks.length !== GOAL))) {
      return Response.json({ error: 'Invalid reward request' }, { status: 400 });
    }
    const now = Date.now();
    const day = new Date(now).toISOString().slice(0, 10);
    const resumesAt = (Math.floor(now / DAY) + 1) * DAY;
    const entities = base44.asServiceRole.entities;
    const progress = entities.GoldFlakeProgress;
    const [row] = await progress.filter({ user_id: user.id }, 'created_date', 1);
    const awards = row?.day === day ? row.awards : 0;
    const current = row?.status === 'active' && now - row.started_at < DAY;
    const key = row && { id: row.id, user_id: user.id, round: row.round, status: row.status };
    if (input.action === 'claim' && row?.round === input.round && row.status === 'awarded') return Response.json({ status: 'awarded', amount: AMOUNT });
    if (row?.status === 'processing') return Response.json({ status: 'processing' });
    if (awards >= DAILY_MAX) return Response.json({ status: 'limit', resumesAt });
    if (input.action === 'start') {
      if (current) return Response.json({ status: 'active', round: row.round, expiresAt: row.started_at + DAY });
      const fresh = { user_id: user.id, round: crypto.randomUUID(), started_at: now, day, awards, status: 'active' };
      if (row) {
        const result = await progress.updateMany(key, { $set: fresh });
        if (result.updated !== 1) return Response.json({ status: 'retry' });
      } else {
        await progress.create(fresh);
        const [canonical] = await progress.filter({ user_id: user.id }, 'created_date', 1);
        return Response.json({ status: 'active', round: canonical.round, expiresAt: canonical.started_at + DAY });
      }
      return Response.json({ status: 'active', round: fresh.round, expiresAt: now + DAY });
    }
    if (!current || row.round !== input.round) return Response.json({ status: 'expired' });
    if (!validClicks(input.clicks, now - row.started_at)) return Response.json({ status: 'rejected' });
    const reserved = await progress.updateMany(key, { $set: { status: 'processing', day, awards: awards + 1 } });
    if (reserved.updated !== 1) return Response.json({ status: 'retry' });
    lockedRound = row.round;
    await creditGGGReward(entities, user.email, { amount: AMOUNT, type: TYPE, memo: 'GGG Gold Flakes: 45 qualifying clicks', sourceId: row.round, eventId: `${TYPE}_${row.round}` });
    await progress.update(row.id, { status: 'awarded' });
    return Response.json({ status: 'awarded', amount: AMOUNT });
  } catch (error) {
    console.error('Gold Flake reward failed', { round: lockedRound, message: error.message });
    return Response.json(lockedRound ? { status: 'processing' } : { error: 'Could not check Gold Flakes progress' }, { status: lockedRound ? 200 : 500 });
  }
}