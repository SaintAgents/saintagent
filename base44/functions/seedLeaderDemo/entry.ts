import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    // Admin-only safety for seeding
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });

    // Get candidate leaders (top by rp_points)
    const profiles = await base44.asServiceRole.entities.UserProfile.list('-rp_points', 20);
    const top = (profiles || []).slice(0, 3);
    const updates = [];
    const created = { badges: 0, roles: 0, listings: 0, trustEvents: 0 };

    for (let i = 0; i < top.length; i++) {
      const p = top[i];
      if (!p?.user_id) continue;
      const trust = [91, 86, 78][i] ?? 75 + (i * 3);
      const influence = [88, 76, 69][i] ?? 60 + (i * 5);
      const expertise = [92, 81, 73][i] ?? 65 + (i * 4);

      // Update profile trust/influence/expertise and leader tier
      await base44.asServiceRole.entities.UserProfile.update(p.id, {
        leader_tier: 'verified144k',
        trust_score: trust,
        influence_score: influence,
        expertise_score: expertise,
      });

      // Ensure a role
      const roles = await base44.asServiceRole.entities.UserRole.filter({ user_id: p.user_id, status: 'active' });
      if (!roles?.length) {
        await base44.asServiceRole.entities.UserRole.create({
          user_id: p.user_id,
          role_code: i === 0 ? 'guardian' : (i === 1 ? 'moderator' : 'architect'),
          status: 'active',
          assigned_by: user.email,
          notes: 'Demo seeded role'
        });
        created.roles++;
      }

      // Add a few badges if not present
      const existingBadges = await base44.asServiceRole.entities.Badge.filter({ user_id: p.user_id });
      const have = new Set((existingBadges || []).map(b => b.code));
      const badgeCodes = ['leader_verified', 'top_mentor', 'market_maven'];
      for (const code of badgeCodes) {
        if (!have.has(code)) {
          await base44.asServiceRole.entities.Badge.create({ user_id: p.user_id, code, status: 'active' });
          created.badges++;
        }
      }

      // Seed a listing for activity feed
      const listings = await base44.asServiceRole.entities.Listing.filter({ owner_id: p.user_id });
      if (!listings?.length) {
        await base44.asServiceRole.entities.Listing.create({
          owner_id: p.user_id,
          owner_name: p.display_name || p.user_id,
          owner_avatar: p.avatar_url,
          listing_type: 'offer',
          category: 'mentorship',
          title: `Mentorship Session with ${p.display_name || 'Leader'}`,
          description: 'Book a 60-minute mentorship session to accelerate your path.',
          price_amount: 99,
          is_free: false,
          duration_minutes: 60,
          delivery_mode: 'online',
          status: 'active'
        });
        created.listings++;
      }

      // Add a TrustEvent reflecting trust_score (significant)
      await base44.asServiceRole.entities.TrustEvent.create({
        user_id: p.user_id,
        delta: 10 + (i * 3),
        reason_code: 'demo_seed',
        source_type: 'system',
        description: 'Demo seed trust boost',
        score_after: trust,
        metrics: { source: 'seedLeaderDemo' }
      });
      created.trustEvents++;

      // Ensure the current admin follows these top leaders so their events show in the feed
      const existingFollow = await base44.asServiceRole.entities.Follow.filter({ follower_id: user.email, following_id: p.user_id });
      if (!existingFollow?.length) {
        await base44.asServiceRole.entities.Follow.create({ follower_id: user.email, following_id: p.user_id, follower_name: user.full_name, following_name: p.display_name });
      }
    }

    return Response.json({ ok: true, topCount: top.length, created });
  } catch (err) {
    return Response.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
});