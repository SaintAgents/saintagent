import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const caller = await base44.auth.me().catch(error => error.status === 401 ? null : Promise.reject(error));
    if (!caller) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (caller.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
    const { user_id, event_type, occurred_at } = await req.json().catch(() => ({}));
    const time = typeof occurred_at === 'string' ? Date.parse(occurred_at) : NaN;
    if (typeof user_id !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(user_id) || !['login', 'signup'].includes(event_type) || !Number.isFinite(time)) {
      return Response.json({ error: 'A valid sign-in event is required' }, { status: 400 });
    }
    if (Math.abs(Date.now() - time) > 120000) return Response.json({ skipped: 'stale' });
    const entities = base44.asServiceRole.entities;
    const user = await entities.User.get(user_id).catch(error => error.status === 404 ? null : Promise.reject(error));
    if (!user) return Response.json({ error: 'Member not found' }, { status: 404 });
    const stamp = new Date(time).toISOString();
    const [prior] = await entities.LiveEvent.filter({ category: 'sign_ins', audience: 'personal', recipient_id: user.id, metric: stamp }, '-created_date', 1);
    if (prior) return Response.json({ skipped: 'already announced' });
    const [profile] = await entities.UserProfile.filter({ user_id: user.email }, '-updated_date', 1);
    const name = [profile?.display_name, profile?.handle].find(value => typeof value === 'string' && value.trim() && !value.includes('@'))?.trim().slice(0, 140);
    const prefs = user.live_activity_preferences;
    const records = [{ category: 'sign_ins', audience: 'personal', recipient_id: user.id, metric: stamp, headline: event_type === 'signup' ? 'Welcome to SaintAgent!' : 'Welcome back to SaintAgent!', description: 'You’re signed in.' }];
    if (name && ['public', 'members_only'].includes(profile.profile_visibility ?? 'public') && !['offline', 'dnd'].includes(profile.status) && prefs?.shareSignIn !== false) {
      records.push({ category: 'sign_ins', audience: 'members', profile_user_id: user.id, headline: `${name} just signed in` });
    }
    await Promise.all(records.map(record => entities.LiveEvent.create(record)));
    return Response.json({ ok: true });
  } catch (error) {
    console.error('Sign-in announcement failed', error.status || 'unknown status');
    return Response.json({ error: 'Unable to announce sign-in' }, { status: 500 });
  }
}