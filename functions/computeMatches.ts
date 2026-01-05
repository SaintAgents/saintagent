import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

function arr(a) {
  if (!a) return [];
  if (Array.isArray(a)) return a.filter(Boolean).map(x => String(x).toLowerCase());
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

// Weighted overlap: how much of A is covered by B
function coverage(a, b) {
  const A = new Set(arr(a));
  const B = new Set(arr(b));
  if (A.size === 0) return 0;
  let hits = 0;
  for (const v of A) if (B.has(v)) hits++;
  return hits / A.size;
}

// Skill complementarity: user seeks skills the candidate offers
function skillMatch(userSeeking, userOffering, candidateSkills, candidateIntentions) {
  const seekCoverage = coverage(userSeeking, candidateSkills);
  const offerRelevance = coverage(userOffering, candidateIntentions);
  return (seekCoverage * 0.7 + offerRelevance * 0.3);
}

// Intention alignment scoring
function intentionScore(userIntentions, candidateIntentions) {
  return jaccard(userIntentions, candidateIntentions);
}

// Relationship compatibility for dating/connection
function relationshipScore(me, candidate) {
  let score = 0;
  let factors = 0;
  
  // Relationship type seeking alignment
  if (me.relationship_type_seeking?.length && candidate.relationship_type_seeking?.length) {
    const overlap = jaccard(me.relationship_type_seeking, candidate.relationship_type_seeking);
    score += overlap;
    factors++;
  }
  
  // Qualities seeking vs providing match
  if (me.qualities_seeking?.length && candidate.qualities_providing?.length) {
    const match = coverage(me.qualities_seeking, candidate.qualities_providing);
    score += match;
    factors++;
  }
  if (me.qualities_providing?.length && candidate.qualities_seeking?.length) {
    const match = coverage(candidate.qualities_seeking, me.qualities_providing);
    score += match;
    factors++;
  }
  
  // Dating preferences alignment (if both have them)
  if (me.dating_preferences && candidate.dating_preferences) {
    const meInterested = arr(me.dating_preferences.interested_in || []);
    const candInterested = arr(candidate.dating_preferences.interested_in || []);
    if (meInterested.length && candInterested.length) {
      // Check mutual interest compatibility (simplified)
      score += 0.5;
      factors++;
    }
  }
  
  return factors > 0 ? score / factors : 0;
}

// Communication style compatibility
function communicationScore(me, candidate) {
  let score = 0;
  let factors = 0;
  
  // Communication style compatibility matrix
  const styleCompatibility = {
    'direct_honest': { 'direct_honest': 1, 'analytical_precise': 0.8, 'expressive_emotional': 0.5, 'diplomatic_gentle': 0.6, 'intuitive_flowing': 0.5, 'quiet_reflective': 0.4 },
    'diplomatic_gentle': { 'diplomatic_gentle': 1, 'intuitive_flowing': 0.9, 'quiet_reflective': 0.8, 'expressive_emotional': 0.7, 'direct_honest': 0.6, 'analytical_precise': 0.6 },
    'intuitive_flowing': { 'intuitive_flowing': 1, 'diplomatic_gentle': 0.9, 'expressive_emotional': 0.8, 'quiet_reflective': 0.7, 'direct_honest': 0.5, 'analytical_precise': 0.4 },
    'analytical_precise': { 'analytical_precise': 1, 'direct_honest': 0.8, 'quiet_reflective': 0.7, 'diplomatic_gentle': 0.6, 'intuitive_flowing': 0.4, 'expressive_emotional': 0.4 },
    'expressive_emotional': { 'expressive_emotional': 1, 'intuitive_flowing': 0.8, 'diplomatic_gentle': 0.7, 'direct_honest': 0.5, 'quiet_reflective': 0.5, 'analytical_precise': 0.4 },
    'quiet_reflective': { 'quiet_reflective': 1, 'diplomatic_gentle': 0.8, 'analytical_precise': 0.7, 'intuitive_flowing': 0.7, 'direct_honest': 0.4, 'expressive_emotional': 0.5 }
  };
  
  if (me.communication_style && candidate.communication_style) {
    const compat = styleCompatibility[me.communication_style]?.[candidate.communication_style] || 0.5;
    score += compat;
    factors++;
  }
  
  // Communication depth preference
  const depthCompatibility = {
    'deep_only': { 'deep_only': 1, 'prefer_meaningful': 0.8, 'adaptable': 0.7, 'small_talk_ok': 0.3 },
    'prefer_meaningful': { 'prefer_meaningful': 1, 'deep_only': 0.8, 'adaptable': 0.9, 'small_talk_ok': 0.5 },
    'small_talk_ok': { 'small_talk_ok': 1, 'adaptable': 0.9, 'prefer_meaningful': 0.5, 'deep_only': 0.3 },
    'adaptable': { 'adaptable': 1, 'prefer_meaningful': 0.9, 'small_talk_ok': 0.9, 'deep_only': 0.7 }
  };
  
  if (me.communication_depth_preference && candidate.communication_depth_preference) {
    const compat = depthCompatibility[me.communication_depth_preference]?.[candidate.communication_depth_preference] || 0.5;
    score += compat;
    factors++;
  }
  
  // Feedback style alignment
  if (me.feedback_style && candidate.feedback_style) {
    score += me.feedback_style === candidate.feedback_style ? 1 : 0.6;
    factors++;
  }
  
  // Conflict approach compatibility
  const conflictCompatibility = {
    'address_immediately': { 'address_immediately': 1, 'reflect_then_discuss': 0.7, 'seek_mediation': 0.6, 'avoid_when_possible': 0.3 },
    'reflect_then_discuss': { 'reflect_then_discuss': 1, 'address_immediately': 0.7, 'seek_mediation': 0.8, 'avoid_when_possible': 0.5 },
    'avoid_when_possible': { 'avoid_when_possible': 1, 'reflect_then_discuss': 0.5, 'seek_mediation': 0.6, 'address_immediately': 0.3 },
    'seek_mediation': { 'seek_mediation': 1, 'reflect_then_discuss': 0.8, 'address_immediately': 0.6, 'avoid_when_possible': 0.6 }
  };
  
  if (me.conflict_approach && candidate.conflict_approach) {
    const compat = conflictCompatibility[me.conflict_approach]?.[candidate.conflict_approach] || 0.5;
    score += compat;
    factors++;
  }
  
  return factors > 0 ? score / factors : 0;
}

// Goals and life direction alignment
function goalsScore(me, candidate) {
  let score = 0;
  let factors = 0;
  
  // Current focus areas overlap
  if (me.current_focus_areas?.length && candidate.current_focus_areas?.length) {
    const overlap = jaccard(me.current_focus_areas, candidate.current_focus_areas);
    score += overlap;
    factors++;
  }
  
  // Short term goals alignment
  if (me.short_term_goals?.length && candidate.short_term_goals?.length) {
    const overlap = jaccard(me.short_term_goals, candidate.short_term_goals);
    score += overlap;
    factors++;
  }
  
  // Support seeking/offering match
  if (me.seeking_support_in?.length && candidate.can_offer_support_in?.length) {
    const match = coverage(me.seeking_support_in, candidate.can_offer_support_in);
    score += match;
    factors++;
  }
  if (me.can_offer_support_in?.length && candidate.seeking_support_in?.length) {
    const match = coverage(candidate.seeking_support_in, me.can_offer_support_in);
    score += match;
    factors++;
  }
  
  return factors > 0 ? score / factors : 0;
}

// Enhanced spiritual practice compatibility
function spiritualDepthScore(me, candidate) {
  let score = 0;
  let factors = 0;
  
  // Practice frequency compatibility (similar frequencies connect better)
  const freqOrder = ['daily', 'few_times_week', 'weekly', 'monthly', 'occasionally'];
  if (me.practice_frequency && candidate.practice_frequency) {
    const myIdx = freqOrder.indexOf(me.practice_frequency);
    const candIdx = freqOrder.indexOf(candidate.practice_frequency);
    if (myIdx >= 0 && candIdx >= 0) {
      const diff = Math.abs(myIdx - candIdx);
      score += diff <= 1 ? 1 : diff <= 2 ? 0.7 : 0.4;
      factors++;
    }
  }
  
  // Practice depth compatibility
  const depthOrder = ['exploring', 'developing', 'established', 'teaching', 'mastery'];
  if (me.practice_depth && candidate.practice_depth) {
    const myIdx = depthOrder.indexOf(me.practice_depth);
    const candIdx = depthOrder.indexOf(candidate.practice_depth);
    if (myIdx >= 0 && candIdx >= 0) {
      // Close depth or mentor/student dynamic is good
      const diff = Math.abs(myIdx - candIdx);
      score += diff <= 1 ? 1 : diff === 2 ? 0.8 : 0.5;
      factors++;
    }
  }
  
  // Shared teachers or texts
  if (me.spiritual_teachers?.length && candidate.spiritual_teachers?.length) {
    const overlap = jaccard(me.spiritual_teachers, candidate.spiritual_teachers);
    if (overlap > 0) {
      score += 0.5 + (overlap * 0.5); // Bonus for shared teachers
      factors++;
    }
  }
  
  if (me.sacred_texts?.length && candidate.sacred_texts?.length) {
    const overlap = jaccard(me.sacred_texts, candidate.sacred_texts);
    if (overlap > 0) {
      score += 0.5 + (overlap * 0.5);
      factors++;
    }
  }
  
  // Lineage/tradition alignment
  if (me.lineage_tradition && candidate.lineage_tradition) {
    if (me.lineage_tradition !== 'prefer_not_to_say' && candidate.lineage_tradition !== 'prefer_not_to_say') {
      score += me.lineage_tradition === candidate.lineage_tradition ? 1 : 
               (me.lineage_tradition === 'eclectic_personal' || candidate.lineage_tradition === 'eclectic_personal') ? 0.7 : 0.4;
      factors++;
    }
  }
  
  // Human design compatibility
  if (me.human_design_type && candidate.human_design_type) {
    // Simplified HD compatibility
    const hdCompat = {
      'generator': { 'projector': 0.9, 'manifestor': 0.7, 'generator': 0.8, 'manifesting_generator': 0.85, 'reflector': 0.6 },
      'manifesting_generator': { 'projector': 0.85, 'manifestor': 0.75, 'generator': 0.85, 'manifesting_generator': 0.8, 'reflector': 0.65 },
      'projector': { 'generator': 0.9, 'manifesting_generator': 0.85, 'manifestor': 0.7, 'projector': 0.6, 'reflector': 0.7 },
      'manifestor': { 'generator': 0.7, 'projector': 0.7, 'manifesting_generator': 0.75, 'manifestor': 0.5, 'reflector': 0.6 },
      'reflector': { 'generator': 0.6, 'projector': 0.7, 'manifestor': 0.6, 'manifesting_generator': 0.65, 'reflector': 0.8 }
    };
    const compat = hdCompat[me.human_design_type]?.[candidate.human_design_type] || 0.5;
    score += compat;
    factors++;
  }
  
  return factors > 0 ? score / factors : 0;
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

    // Fetch user intentions and desires for enhanced matching
    let userIntentions = [];
    let userDesires = [];
    let userHopes = [];
    try {
      const intents = await base44.entities.UserIntention.filter({ user_id: user.email });
      userIntentions = intents.map(i => i.intention_code);
      const desires = await base44.entities.UserDesire.filter({ user_id: user.email });
      userDesires = desires.map(d => d.desire_code);
      const hopes = await base44.entities.UserHope.filter({ user_id: user.email });
      userHopes = hopes.map(h => h.hope_code);
    } catch (_) {}

    // Base weights and feedback-driven adjustments
    let weights = { 
      values: 0.15, 
      practices: 0.10, 
      skills: 0.15, 
      intentions: 0.12,
      relationship: 0.10,
      communication: 0.12,
      goals: 0.10,
      spiritual_depth: 0.08,
      region: 0.05, 
      reputation: 0.03 
    };

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
    const myIntentions = arr(me.intentions || userIntentions);
    const mySeeking = arr(me.qualities_seeking);
    const myProviding = arr(me.qualities_providing);
    const myRegion = (me.region || '').toLowerCase();

    const now = Date.now();

    const scored = candidates.map((p) => {
      // Core alignment scores
      const v = jaccard(myValues, p.values_tags);
      const sp = jaccard(myPractices, p.spiritual_practices);
      
      // Enhanced skill matching - seeking vs offering
      const candidateSkills = arr(p.skills);
      const candidateIntentions = arr(p.intentions);
      const sk = skillMatch(mySeeking, myProviding, candidateSkills, candidateIntentions);
      const basicSkillOverlap = jaccard(mySkills, candidateSkills);
      const skillScore = (sk * 0.6 + basicSkillOverlap * 0.4);
      
      // Intention alignment
      const intentAlign = intentionScore(myIntentions, candidateIntentions);
      
      // Relationship/connection compatibility
      const relScore = relationshipScore(me, p);
      
      // NEW: Communication style compatibility
      const commScore = communicationScore(me, p);
      
      // NEW: Goals and life direction alignment  
      const goalScore = goalsScore(me, p);
      
      // NEW: Enhanced spiritual depth score
      const spiritDepthScore = spiritualDepthScore(me, p);
      
      // Region proximity
      const region = myRegion && p.region ? (p.region.toLowerCase() === myRegion ? 1 : 0) : 0;
      
      // Reputation/trust
      const rep = clamp01((p.trust_score || 0) / 100);

      // Calculate sub-scores for display
      const intent_alignment = Math.round((v * 0.5 + intentAlign * 0.5) * 100);
      const spiritual_alignment_score = Math.round((sp * 0.6 + spiritDepthScore * 0.4) * 100);
      const skill_complementarity = Math.round(skillScore * 100);
      const proximity_score = Math.round(region * 100);
      const trust_score = Math.round(rep * 100);
      const communication_compatibility = Math.round(commScore * 100);
      const goals_alignment = Math.round(goalScore * 100);

      // Timing readiness based on activity
      let timing_readiness = 40;
      const last = p.last_seen_at ? Date.parse(p.last_seen_at) : 0;
      if (p.status === 'online') timing_readiness = 90;
      else if (last) {
        const hours = (now - last) / 36e5;
        timing_readiness = hours < 2 ? 85 : hours < 6 ? 75 : hours < 24 ? 55 : hours < 72 ? 40 : 25;
      }

      // Final weighted score with new factors
      const matchScore01 = clamp01(
        weights.values * v +
        weights.practices * sp +
        weights.skills * skillScore +
        weights.intentions * intentAlign +
        weights.relationship * relScore +
        weights.communication * commScore +
        weights.goals * goalScore +
        weights.spiritual_depth * spiritDepthScore +
        weights.region * region +
        weights.reputation * rep
      );
      const match_score = Math.round(matchScore01 * 100);

      // Generate meaningful conversation starters
      const sharedValues = arr(p.values_tags).filter(x => myValues.includes(x)).slice(0, 3);
      const sharedPractices = arr(p.spiritual_practices).filter(x => myPractices.includes(x)).slice(0, 3);
      const sharedIntentions = candidateIntentions.filter(x => myIntentions.includes(x)).slice(0, 2);
      const complementarySkills = candidateSkills.filter(x => mySeeking.includes(x)).slice(0, 2);
      const sharedFocusAreas = arr(p.current_focus_areas).filter(x => arr(me.current_focus_areas).includes(x)).slice(0, 2);
      const supportMatch = arr(p.can_offer_support_in).filter(x => arr(me.seeking_support_in).includes(x)).slice(0, 2);
      
      const starters = [];
      if (sharedValues[0]) starters.push(`You both value "${sharedValues[0]}" - what does that mean to you?`);
      if (sharedPractices[0]) starters.push(`I see you practice ${sharedPractices[0]} too! How has your journey been?`);
      if (sharedIntentions[0]) starters.push(`We share the intention to ${sharedIntentions[0].replace(/_/g, ' ')}. Would love to explore collaboration.`);
      if (complementarySkills[0]) starters.push(`Your ${complementarySkills[0]} skill could really help with what I'm working on.`);
      if (sharedFocusAreas[0]) starters.push(`I see we're both focused on ${sharedFocusAreas[0].replace(/_/g, ' ')} right now. Would love to share experiences.`);
      if (supportMatch[0]) starters.push(`Your experience in ${supportMatch[0]} is exactly what I'm looking to learn about.`);
      if (me.communication_style === p.communication_style) starters.push(`We seem to share a similar communication style. I appreciate that!`);
      if (starters.length === 0) starters.push(`Your profile resonates with me. I'd love to connect and learn more about your path.`);

      // Build shared arrays for display
      const shared_values = sharedValues;
      const complementary_skills = complementarySkills;
      const spiritual_synergies = sharedPractices;
      const shared_goals = sharedFocusAreas;

      // Enhanced AI reasoning with new factors
      const reasoningParts = [];
      reasoningParts.push(`Values alignment: ${Math.round(v*100)}%`);
      reasoningParts.push(`Spiritual practices: ${Math.round(sp*100)}%`);
      if (spiritDepthScore > 0) reasoningParts.push(`Practice depth compatibility: ${Math.round(spiritDepthScore*100)}%`);
      reasoningParts.push(`Skills complementarity: ${Math.round(skillScore*100)}%`);
      reasoningParts.push(`Intentions: ${Math.round(intentAlign*100)}%`);
      if (commScore > 0) reasoningParts.push(`Communication style: ${Math.round(commScore*100)}%`);
      if (goalScore > 0) reasoningParts.push(`Goals alignment: ${Math.round(goalScore*100)}%`);
      if (relScore > 0) reasoningParts.push(`Relationship fit: ${Math.round(relScore*100)}%`);
      
      const insights = [];
      if (commScore > 0.7) insights.push('Excellent communication compatibility.');
      if (goalScore > 0.6) insights.push('Aligned life direction and goals.');
      if (spiritDepthScore > 0.7) insights.push('Deep spiritual practice alignment.');
      if (relScore > 0.5) insights.push('Strong relationship compatibility.');
      if (intentAlign > 0.5) insights.push('Aligned life intentions.');
      if (supportMatch.length > 0) insights.push('Good support exchange potential.');
      
      const ai_reasoning = `Match based on: ${reasoningParts.join(', ')}. ${insights.join(' ')}`;

      return {
        target: p,
        score: match_score,
        fields: {
          intent_alignment,
          spiritual_alignment_score,
          skill_complementarity,
          proximity_score,
          timing_readiness,
          trust_score,
          communication_compatibility,
          goals_alignment,
          conversation_starters: starters,
          shared_values,
          complementary_skills,
          spiritual_synergies,
          shared_goals,
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
        trust_score: item.fields.trust_score,
        conversation_starters: item.fields.conversation_starters,
        shared_values: item.fields.shared_values,
        complementary_skills: item.fields.complementary_skills,
        spiritual_synergies: item.fields.spiritual_synergies,
        ai_reasoning: item.fields.ai_reasoning,
        explanation: `Communication: ${item.fields.communication_compatibility}% | Goals: ${item.fields.goals_alignment}%`,
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