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
    const types = Array.isArray(body?.types) && body.types.length ? body.types : ['listings','missions','testimonials','reputation','posts','meetings','follows','events'];
    const limit = Math.min(Number(body?.limit || 50), 200);
    const scope = body?.scope || 'everyone'; // 'me', 'friends', or 'everyone'
    const filterByMe = scope === 'me';

    // Build relevant user set: followings + me
    let followings = [];
    try {
      followings = await base44.entities.Follow.filter({ follower_id: me.email }) || [];
    } catch (_) {}
    const followingIds = new Set([me.email, ...followings.map(f => f.following_id).filter(Boolean)]);
    const filterByFriends = scope === 'friends';

    const results = [];

    // Announcements / News Articles
    if (types.includes('announcements')) {
      let recentArticles = [];
      try {
        recentArticles = await base44.entities.NewsArticle.filter({ is_published: true }, '-created_date', 30) || [];
      } catch (_) {}
      for (const a of recentArticles) {
        if (filterByMe && a.author_id !== me.email) continue;
        if (filterByFriends && !followingIds.has(a.author_id)) continue;
        results.push(toEvent({
          type: 'announcements',
          source: a,
          createdAt: a.published_date || a.created_date,
          actorId: a.author_id,
          title: a.title || 'News Update',
          description: a.summary || a.content?.substring(0, 150) || '',
        }));
      }
    }

    // Listings
    if (types.includes('listings')) {
      let recentListings = [];
      try {
        recentListings = await base44.entities.Listing.list('-created_date', 60) || [];
      } catch (_) {}
      for (const l of recentListings) {
        if (filterByMe && l.owner_id !== me.email) continue;
        if (filterByFriends && !followingIds.has(l.owner_id)) continue;
        results.push(toEvent({
          type: 'listings',
          source: l,
          createdAt: l.created_date,
          actorId: l.owner_id,
          title: `New listing: ${l.title}`,
          description: l.description || `${l.category || ''} • ${l.delivery_mode || ''}`,
        }));
      }
    }

    // Missions
    if (types.includes('missions')) {
      let recentMissions = [];
      try {
        recentMissions = await base44.entities.Mission.list('-updated_date', 60) || [];
      } catch (_) {}
      for (const m of recentMissions) {
        if (filterByMe && m.creator_id !== me.email) continue;
        if (filterByFriends && !followingIds.has(m.creator_id)) continue;
        const desc = m.status === 'completed' ? 'Mission completed' : (m.status === 'active' ? 'Mission active' : `Status: ${m.status || 'unknown'}`);
        results.push(toEvent({
          type: 'missions',
          source: m,
          createdAt: m.updated_date || m.created_date,
          actorId: m.creator_id,
          title: m.title || 'Untitled Mission',
          description: `${desc} • ${m.participant_count || 0} participants`,
        }));
      }
    }

    // Testimonials
    if (types.includes('testimonials')) {
      let recentTestimonials = [];
      try {
        recentTestimonials = await base44.entities.Testimonial.list('-created_date', 60) || [];
      } catch (_) {}
      for (const t of recentTestimonials) {
        if (filterByMe && t.from_user_id !== me.email && t.to_user_id !== me.email) continue;
        if (filterByFriends && !followingIds.has(t.from_user_id) && !followingIds.has(t.to_user_id)) continue;
        results.push(toEvent({
          type: 'testimonials',
          source: t,
          createdAt: t.created_date,
          actorId: t.from_user_id,
          title: `New testimonial for ${t.to_user_id || 'user'}`,
          description: `Rating ${t.rating || 5}★${t.text ? ' • ' + t.text : ''}`,
          targetId: t.to_user_id,
        }));
      }
    }

    // Reputation changes (TrustEvent and ReputationEvent)
    if (types.includes('reputation')) {
      let trustEvents = [];
      try {
        trustEvents = await base44.entities.TrustEvent.list('-created_date', 60) || [];
      } catch (_) {}
      for (const ev of trustEvents) {
        if (filterByMe && ev.user_id !== me.email) continue;
        if (filterByFriends && !followingIds.has(ev.user_id)) continue;
        if (Math.abs(Number(ev.delta || 0)) < 3) continue;
        results.push(toEvent({
          type: 'reputation',
          source: ev,
          createdAt: ev.created_date,
          actorId: ev.user_id,
          title: `Trust score ${ev.delta >= 0 ? 'increased' : 'decreased'} to ${ev.score_after || 0}`,
          description: ev.reason_code || 'trust update',
          targetId: ev.user_id,
        }));
      }
      let repEvents = [];
      try {
        repEvents = await base44.entities.ReputationEvent.list('-created_date', 60) || [];
      } catch (_) {}
      for (const ev of repEvents) {
        if (filterByMe && ev.user_id !== me.email) continue;
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
    }

    // Posts
    if (types.includes('posts')) {
      let recentPosts = [];
      try {
        recentPosts = await base44.entities.Post.list('-created_date', 60) || [];
      } catch (_) {}
      for (const p of recentPosts) {
        if (filterByMe && p.author_id !== me.email) continue;
        if (filterByFriends && !followingIds.has(p.author_id)) continue;
        results.push(toEvent({
          type: 'posts',
          source: p,
          createdAt: p.created_date,
          actorId: p.author_id,
          title: `${p.author_name || 'Someone'} posted`,
          description: p.content?.substring(0, 100) || '',
        }));
      }
    }

    // Meetings
    if (types.includes('meetings')) {
      let recentMeetings = [];
      try {
        recentMeetings = await base44.entities.Meeting.list('-created_date', 60) || [];
      } catch (_) {}
      for (const m of recentMeetings) {
        if (filterByMe && m.host_id !== me.email && m.guest_id !== me.email) continue;
        if (filterByFriends && !followingIds.has(m.host_id) && !followingIds.has(m.guest_id)) continue;
        results.push(toEvent({
          type: 'meetings',
          source: m,
          createdAt: m.created_date,
          actorId: m.host_id,
          title: m.title || 'Meeting scheduled',
          description: `${m.host_name || 'Host'} & ${m.guest_name || 'Guest'} • ${m.status || 'pending'}`,
          targetId: m.guest_id,
        }));
      }
    }

    // Follows
    if (types.includes('follows')) {
      let recentFollows = [];
      try {
        recentFollows = await base44.entities.Follow.list('-created_date', 60) || [];
      } catch (_) {}
      for (const f of recentFollows) {
        if (filterByMe && f.follower_id !== me.email && f.following_id !== me.email) continue;
        if (filterByFriends && !followingIds.has(f.follower_id) && !followingIds.has(f.following_id)) continue;
        results.push(toEvent({
          type: 'follows',
          source: f,
          createdAt: f.created_date,
          actorId: f.follower_id,
          title: `New follow`,
          description: `${f.follower_id} followed ${f.following_id}`,
          targetId: f.following_id,
        }));
      }
    }

    // Events
    if (types.includes('events')) {
      let recentEvents = [];
      try {
        recentEvents = await base44.entities.Event.list('-created_date', 60) || [];
      } catch (_) {}
      for (const e of recentEvents) {
        if (filterByMe && e.host_id !== me.email) continue;
        if (filterByFriends && !followingIds.has(e.host_id)) continue;
        results.push(toEvent({
          type: 'events',
          source: e,
          createdAt: e.created_date,
          actorId: e.host_id,
          title: e.title || 'New event',
          description: `${e.status || 'upcoming'} • ${e.host_name || ''}`,
        }));
      }
    }

    // Sort desc by created_date and trim
    results.sort((a,b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime());
    const sliced = results.slice(0, limit);

    return Response.json({ items: sliced });
  } catch (err) {
    console.error('getActivityFeed error:', err);
    // Return empty array on error instead of 500 to allow page to load
    return Response.json({ items: [], error: err?.message || 'Internal error' });
  }
});