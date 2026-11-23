import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import creditSiteSkills from './creditSiteSkills.ts';

const total = 5;

export default async function(req) {
  let locked = false;
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(e => e.status === 401 ? null : Promise.reject(e));
    if (!user?.email) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json().catch(() => null);
    const count = body?.count;
    if (!Number.isInteger(count) || count < 1 || count > total) return Response.json({ error: 'Invalid lesson number' }, { status: 400 });

    const entities = base44.asServiceRole.entities;
    const progress = entities.DailyTourProgress;
    const [row] = await progress.filter({ created_by_id: user.id }, 'created_date', 1);
    if (!row) return Response.json({ error: 'Start the quest before completing a lesson' }, { status: 409 });
    const completed = row.site_skills_completed ?? 0;
    if (count > completed + 1) return Response.json({ error: 'Complete the lessons in order' }, { status: 409 });
    const key = { id: row.id, created_by_id: user.id };
    if (count === completed + 1) {
      await progress.updateMany({ ...key, site_skills_completed: row.site_skills_completed ?? null }, { $set: { site_skills_completed: count } });
    }
    if (count === total && !row.site_skills_reward) {
      const claim = await progress.updateMany({ ...key, site_skills_completed: total, site_skills_reward: null }, { $set: { site_skills_reward: 'processing' } });
      if (claim.updated === 1) {
        locked = true;
        await creditSiteSkills(entities, user.email);
        await progress.update(row.id, { site_skills_reward: 'claimed' });
      }
    }
    const saved = await progress.get(row.id);
    return Response.json({ record: saved });
  } catch (error) {
    console.error('Site Skills completion failed', { locked, message: error.message });
    return Response.json({ error: 'Could not finish this lesson' }, { status: 500 });
  }
}