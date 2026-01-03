import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

function arr(a) {
  if (!a) return [];
  if (Array.isArray(a)) return a.filter(Boolean).map(String.toLowerCase);
  return [];
}

function jaccard(a, b) {
  const A = new Set(arr(a));
  const B = new Set(arr(b));
  if (A.size === 0 && B.size === 0) return 0;
  let inter = 0;
  for (const v of A) if (B.has(v)) inter++;
  const uni = new Set([...A, ...B]).size || 1;
  return inter / uni;
}

function clamp01(x) { return Math.max(0, Math.min(1, x)); }

function normalizeWeights(w) {
  const sum = Object.values(w).reduce((s, v) => s + v, 0) || 1;
  const out = {};
  for (const k of Object.keys(w)) out[k] = w[k] / sum;
  return out;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Current user profile
    const myProfiles = await base44.entities.UserProfile.filter({ user_id: user.email });
    const me = myProfiles?.[0];
    if (!me) return Response.json({ error: 'No profile' }, { status: 400 });

    // Blocked list (optional)
    let blocked = [];
    try {
      const prefs = await base44.entities.EnginePreference.filter({ user_id: user.email });
      blocked = prefs?.[0]?.blocked_users || [];
    } catch (_) {}

    // Fetch candidate profiles (service role to read others)
    const candidates = (await base44.asServiceRole.entities.UserProfile.filter({}, '-rank_points', 1000))
      .filter(p => p.user_id !== user.email)
      .filter(p => (p.profile_visibility || 'public') !== 'private')
      .filter(p => !blocked.includes(p.user_id));

    // Base weights and feedback-driven adjustments
    let weights = { values: 0.35, practices: 0.25, skills: 0.25, region: 0.1, reputation: 0.05 };

    try {
      const history = (await base44.entities.Match.filter({ user_id: user.email }, '-updated_date', 300))
        .filter(m => typeof m.user_rating === 'number');
      if (history.length > 0) {
        let vSum = 0, pSum = 0, sSum = 0, rSum = 0; let n = 0;
        for (const m of history) {
          const delta = ((m.user_rating || 0) - 3) / 2; // -1..+1
          vSum += delta * ((m.intent_alignment || 0) / 100);
          pSum += delta * ((m.spiritual_alignment_score || 0) / 100);
          sSum += delta * ((m.skill_complementarity || 0) / 100);
          rSum += delta * ((m.proximity_score || 0) / 100);
          n++;
        }
        const factor = 0.15 / Math.max(1, n ** 0.5); // gentle adaptation
        weights.values = Math.max(0.05, Math.min(0.6, weights.values + vSum * factor));
        weights.practices = Math.max(0.05, Math.min(0.6, weights.practices + pSum * factor));
        weights.skills = Math.max(0.05, Math.min(0.6, weights.skills + sSum * factor));
        weights.region = Math.max(0.05, Math.min(0.6, weights.region + rSum * factor));
        // Keep a small reputation weight
        weights.reputation = Math.max(0.03, Math.min(0.12, weights.reputation));
        weights = normalizeWeights(weights);
      }
    } catch (_) {}

    const myValues = arr(me.values_tags);
    const myPractices = arr(me.spiritual_practices);
    const mySkills = arr(me.skills);
    const myRegion = (me.region || '').toLowerCase();

    const now = Date.now();

    const scored = candidates.map((p) => {
      const v = jaccard(myValues, p.values_tags);
      const sp = jaccard(myPractices, p.spiritual_practices);
      const sk = jaccard(mySkills, p.skills);
      const region = myRegion && p.region ? (p.region.toLowerCase() === myRegion ? 1 : 0) : 0;
      const rep = clamp01((p.trust_score || 0) / 100);

      const intent_alignment = Math.round(v * 100);
      const spiritual_alignment_score = Math.round(sp * 100);
      const skill_complementarity = Math.round(sk * 100);
      const proximity_score = Math.round(region * 100);

      let timing_readiness = 40; // default baseline
      const last = p.last_seen_at ? Date.parse(p.last_seen_at) : 0;
      if (p.status === 'online') timing_readiness = 85;
      else if (last) {
        const hours = (now - last) / 36e5;
        timing_readiness = hours < 6 ? 80 : hours < 24 ? 60 : 40;
      }

      const matchScore01 = clamp01(
        weights.values * v +
        weights.practices * sp +
        weights.skills * sk +
        weights.region * region +
        weights.reputation * rep
      );
      const match_score = Math.round(matchScore01 * 100);

      // Conversation starters from overlaps
      const sharedValues = (arr(p.values_tags).filter(x => myValues.includes(x))).slice(0, 3);
      const sharedPractices = (arr(p.spiritual_practices).filter(x => myPractices.includes(x))).slice(0, 3);
      const starters = [];
      if (sharedValues[0]) starters.push(`Shared value: ${sharedValues[0]}`);
      if (sharedPractices[0]) starters.push(`Both practice: ${sharedPractices[0]}`);
      if (mySkills[0] && arr(p.skills).includes(mySkills[0])) starters.push(`Similar skill: ${mySkills[0]}`);

      const ai_reasoning = `Weighted blend (values ${Math.round(weights.values*100)}%, practices ${Math.round(weights.practices*100)}%, skills ${Math.round(weights.skills*100)}%, region ${Math.round(weights.region*100)}%, reputation ${Math.round(weights.reputation*100)}%).`;

      return {
        target: p,
        score: match_score,
        fields: {
          intent_alignment,
          spiritual_alignment_score,
          skill_complementarity,
          proximity_score,
          timing_readiness,
          conversation_starters: starters,
          ai_reasoning,
        }
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 200);

    // Upsert into Match entity
    const existing = await base44.entities.Match.filter({ user_id: user.email, target_type: 'person' }, '-updated_date', 1000);
    const map = new Map(existing.map(m => [m.target_id, m]));

    let created = 0, updated = 0;
    for (const item of scored) {
      const m = map.get(item.target.user_id);
      const payload = {
        user_id: user.email,
        target_type: 'person',
        target_id: item.target.user_id,
        target_name: item.target.display_name || item.target.handle || item.target.user_id,
        target_avatar: item.target.avatar_url,
        target_subtitle: item.target.bio || '',
        match_score: item.score,
        intent_alignment: item.fields.intent_alignment,
        spiritual_alignment_score: item.fields.spiritual_alignment_score,
        skill_complementarity: item.fields.skill_complementarity,
        proximity_score: item.fields.proximity_score,
        timing_readiness: item.fields.timing_readiness,
        conversation_starters: item.fields.conversation_starters,
        ai_reasoning: item.fields.ai_reasoning,
        status: 'active'
      };
      if (m) {
        await base44.entities.Match.update(m.id, payload);
        updated++;
      } else {
        await base44.entities.Match.create(payload);
        created++;
      }
    }

    return Response.json({ ok: true, created, updated, total: scored.length, weights });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});