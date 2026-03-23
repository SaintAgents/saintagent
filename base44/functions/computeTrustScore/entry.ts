import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Trust Score computation weights (sum caps to 100)
const MAXES = {
  testimonials: 40,
  collaborations: 20,
  interactions: 15,
  presence: 10,
  rp: 15,
};

function clamp(n, min = 0, max = 100) { return Math.max(min, Math.min(max, n)); }

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();
    if (!me) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    let payload = {};
    try { payload = await req.json(); } catch {}
    const targetUserId = payload?.target_user_id || me.email;

    // Only admins can compute for others
    if (targetUserId !== me.email) {
      if (me.role !== 'admin') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Load profile
    const profList = await base44.entities.UserProfile.filter({ user_id: targetUserId });
    const profile = profList?.[0];
    if (!profile) return Response.json({ error: 'Profile not found' }, { status: 404 });

    // Testimonials (to_user_id = target)
    const testimonials = await base44.entities.Testimonial.filter({ to_user_id: targetUserId });
    const tRatings = testimonials.map(t => Number(t.rating || 0)).filter(r => r > 0);
    const tAvg = tRatings.length ? tRatings.reduce((a, b) => a + b, 0) / tRatings.length : 0;
    const tPos = tRatings.filter(r => r >= 4).length;
    // Score: average drives up to 25, positive count adds up to 15
    const tScore = clamp((tAvg / 5) * 25 + Math.min(tPos * 3, 15), 0, MAXES.testimonials);

    // Collaborations & projects (approved projects + completed meetings)
    // Projects by owner or creator
    const ownedProjects = await base44.entities.Project.filter({ owner_id: targetUserId }).catch(() => []);
    const createdProjects = await base44.entities.Project.filter({ creator_id: targetUserId }).catch(() => []);
    const projMap = new Map();
    [...(ownedProjects || []), ...(createdProjects || [])].forEach(p => { projMap.set(p.id, p); });
    const projects = Array.from(projMap.values());
    const approvedProjects = projects.filter(p => p.status === 'approved').length;

    // Meetings completed
    const allMeetings = await base44.entities.Meeting.filter({ status: 'completed' }).catch(() => []);
    const myCompletedMeetings = (allMeetings || []).filter(m => m.host_id === targetUserId || m.guest_id === targetUserId).length;
    // Score: projects (4 pts each up to 12) + meetings (1 pt each up to 8) => cap 20
    const collabScore = clamp(Math.min(approvedProjects * 4, 12) + Math.min(myCompletedMeetings, 8), 0, MAXES.collaborations);

    // Interaction ratings (from Match.user_rating)
    const myMatches = await base44.entities.Match.filter({ user_id: targetUserId }).catch(() => []);
    const mRatings = (myMatches || []).map(m => Number(m.user_rating || 0)).filter(r => r > 0);
    const mAvg = mRatings.length ? mRatings.reduce((a, b) => a + b, 0) / mRatings.length : 0;
    const interactionsScore = clamp((mAvg / 5) * MAXES.interactions, 0, MAXES.interactions);

    // Presence (last_seen_at recency)
    const lastSeen = profile?.last_seen_at ? new Date(profile.last_seen_at).getTime() : 0;
    const now = Date.now();
    const diffHrs = lastSeen ? (now - lastSeen) / (1000 * 60 * 60) : Infinity;
    let presenceScore = 0;
    if (diffHrs <= 24) presenceScore = MAXES.presence; // daily active
    else if (diffHrs <= 24 * 7) presenceScore = Math.round(MAXES.presence * 0.6); // weekly active
    else if (diffHrs <= 24 * 30) presenceScore = Math.round(MAXES.presence * 0.3);
    else presenceScore = 0;

    // RP rank / points contribution (up to 15)
    const rpPoints = Number(profile?.rp_points || 0);
    const rpScore = clamp(Math.round(Math.min(rpPoints / 7200, 1) * MAXES.rp), 0, MAXES.rp);

    const score = clamp(Math.round(tScore + collabScore + interactionsScore + presenceScore + rpScore), 0, 100);

    // Persist
    await base44.entities.UserProfile.update(profile.id, { trust_score: score });
    // Log event (best-effort)
    try {
      await base44.entities.TrustEvent.create({
        user_id: targetUserId,
        delta: score - Number(profile.trust_score || 0),
        reason_code: 'recalc',
        source_type: 'system',
        description: 'Automated trust score recalculation',
        score_after: score,
        metrics: {
          testimonials: tScore,
          collaborations: collabScore,
          interactions: interactionsScore,
          presence: presenceScore,
          rp: rpScore,
        }
      });
    } catch (_) {}

    return Response.json({
      success: true,
      score,
      breakdown: {
        testimonials: tScore,
        collaborations: collabScore,
        interactions: interactionsScore,
        presence: presenceScore,
        rp: rpScore,
      }
    });
  } catch (error) {
    return Response.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
});