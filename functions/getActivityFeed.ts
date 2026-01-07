import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Normalize items into a common feed shape
function toEvent({ type, source, createdAt, actorId, title, description, targetId }) {
  return {
    id: `${type}-${source.id}`,
    type,
    created_date: createdAt || source.created_date || source.updated_date,
    actor_id: actorId,
    title,
    description,
    source, // original record for client-side linking
    target_id: targetId || source.id,
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();
    if (!me) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    let body = {};
    try { body = await req.json(); } catch {}
    const types = Array.isArray(body?.types) && body.types.length ? body.types : ['listings','missions','testimonials','reputation'];
    const limit = Math.min(Number(body?.limit || 50), 200);
    const scope = body?.scope || 'everyone'; // 'friends' or 'everyone'

    // Build relevant user set: followings + me
    const followings = await base44.entities.Follow.filter({ follower_id: me.email }).catch(() => []);
    const followingIds = new Set([me.email, ...(followings || []).map(f => f.following_id).filter(Boolean)]);
    const filterByFriends = scope === 'friends';

    const results = [];

    // Listings
    if (types.includes('listings')) {
      const recentListings = await base44.entities.Listing.list('-created_date', 60).catch(() => []);
      for (const l of recentListings) {
        if (filterByFriends && !followingIds.has(l.owner_id)) continue;
        results.push(toEvent({
          type: 'listings',
          source: l,
          createdAt: l.created_date,
          actorId: l.owner_id,
          title: `New listing: ${l.title}`,
          description: l.description || `${l.category} • ${l.delivery_mode}`,
        }));
      }
    }

    // Missions
    if (types.includes('missions')) {
      const recentMissions = await base44.entities.Mission.list('-updated_date', 60).catch(() => []);
      for (const m of recentMissions) {
        if (filterByFriends && !followingIds.has(m.creator_id)) continue;
        const desc = m.status === 'completed' ? 'Mission completed' : (m.status === 'active' ? 'Mission active' : `Status: ${m.status}`);
        results.push(toEvent({
          type: 'missions',
          source: m,
          createdAt: m.updated_date || m.created_date,
          actorId: m.creator_id,
          title: m.title,
          description: `${desc} • ${m.participant_count || 0} participants`,
        }));
      }
    }

    // Testimonials
    if (types.includes('testimonials')) {
      const recentTestimonials = await base44.entities.Testimonial.list('-created_date', 60).catch(() => []);
      for (const t of recentTestimonials) {
        if (filterByFriends && !followingIds.has(t.from_user_id) && !followingIds.has(t.to_user_id)) continue;
        results.push(toEvent({
          type: 'testimonials',
          source: t,
          createdAt: t.created_date,
          actorId: t.from_user_id,
          title: `New testimonial for ${t.to_user_id}`,
          description: `Rating ${t.rating || 5}★${t.text ? ' • ' + t.text : ''}`,
          targetId: t.to_user_id,
        }));
      }
    }

    // Reputation changes (TrustEvent and ReputationEvent)
    if (types.includes('reputation')) {
      const trustEvents = await base44.entities.TrustEvent.list('-created_date', 60).catch(() => []);
      for (const ev of trustEvents) {
        if (filterByFriends && !followingIds.has(ev.user_id)) continue;
        if (Math.abs(Number(ev.delta || 0)) < 3) continue;
        results.push(toEvent({
          type: 'reputation',
          source: ev,
          createdAt: ev.created_date,
          actorId: ev.user_id,
          title: `Trust score ${ev.delta >= 0 ? 'increased' : 'decreased'} to ${ev.score_after}`,
          description: ev.reason_code || 'trust update',
          targetId: ev.user_id,
        }));
      }
      try {
        const repEvents = await base44.entities.ReputationEvent.list('-created_date', 60);
        for (const ev of repEvents) {
          if (filterByFriends && !followingIds.has(ev.user_id)) continue;
          results.push(toEvent({
            type: 'reputation',
            source: ev,
            createdAt: ev.created_date,
            actorId: ev.user_id,
            title: ev.reason_code || 'Reputation update',
            description: ev.description || '',
            targetId: ev.user_id,
          }));
        }
      } catch (_) {}
    }

    // Sort desc by created_date and trim
    results.sort((a,b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime());
    const sliced = results.slice(0, limit);

    return Response.json({ items: sliced });
  } catch (err) {
    return Response.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
});