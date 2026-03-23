import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();
    if (!me) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const targetEmail = (body?.target_email || me.email || '').toLowerCase();

    // Limit to the requester or Mathues email explicitly
    if (targetEmail !== (me.email || '').toLowerCase() && me.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch profile
    const profs = await base44.entities.UserProfile.filter({ user_id: targetEmail });
    const profile = profs?.[0];
    if (!profile) return Response.json({ error: 'Profile not found for ' + targetEmail }, { status: 404 });

    // Update identity to reflect founder and final rank
    const finalRP = 5600; // Ascended threshold 5200+
    const finalTrust = 92;
    const updates = {
      display_name: 'MATHUES IMHOTEP',
      rp_points: finalRP,
      rp_rank_code: 'ascended',
      trust_score: finalTrust
    };
    await base44.entities.UserProfile.update(profile.id, updates);

    // Ensure Founder/Custodian role
    const existingFounder = await base44.entities.UserRole.filter({ user_id: targetEmail, role_code: 'founder_custodian', status: 'active' });
    if (!existingFounder?.length) {
      await base44.entities.UserRole.create({ user_id: targetEmail, role_code: 'founder_custodian', status: 'active', assigned_by: me.email, notes: 'Seeded demo role' });
    }

    // Reputation events sequence (milestones)
    const rpSteps = [
      { delta: 300, reason_code: 'onboarding_completed', description: 'Completed onboarding with full profile' },
      { delta: 250, reason_code: 'first_meeting_completed', source_type: 'meeting', description: 'Completed first meeting' },
      { delta: 400, reason_code: 'testimonial_received', source_type: 'testimonial', description: 'Received a 5-star testimonial' },
      { delta: 500, reason_code: 'mission_completed', source_type: 'mission', description: 'Led a mission to completion' },
      { delta: 650, reason_code: 'content_quality', source_type: 'post', description: 'High-impact content recognized by community' },
      { delta: 900, reason_code: 'peer_endorsements', source_type: 'system', description: 'Endorsements from peers' },
      { delta: 1200, reason_code: 'stewardship', source_type: 'system', description: 'Sustained stewardship and reliability' },
      { delta: 1200, reason_code: 'alignment_integrity', source_type: 'system', description: 'Longitudinal integrity and alignment' }
    ];
    let rpRunning = 0;
    for (const step of rpSteps) {
      rpRunning += step.delta;
      await base44.entities.ReputationEvent.create({
        user_id: targetEmail,
        delta: step.delta,
        reason_code: step.reason_code,
        source_type: step.source_type || 'system',
        description: step.description,
        rp_after: rpRunning
      });
    }

    // Trust events sequence (audit)
    const trustSteps = [
      { delta: 10, reason_code: 'verified_identity', source_type: 'system', description: 'Identity verified and Soulbound confirmed', metrics: { kyc: true } },
      { delta: 12, reason_code: 'mentor_feedback', source_type: 'testimonial', description: 'Multiple positive mentor/mentee feedback cycles', metrics: { avg_rating: 4.9, count: 6 } },
      { delta: 15, reason_code: 'conflict_resolution', source_type: 'dispute', description: 'Resolved a dispute with empathy and fairness', metrics: { cases: 1 } },
      { delta: 20, reason_code: 'policy_adherence', source_type: 'policy', description: 'Long-term adherence to policies and tone standards', metrics: { days: 120 } },
      { delta: 35, reason_code: 'community_stewardship', source_type: 'system', description: 'Demonstrated stewardship across missions and forums', metrics: { missions_led: 2, threads_moderated: 5 } }
    ];
    let trustRunning = 0;
    for (const step of trustSteps) {
      trustRunning += step.delta;
      await base44.entities.TrustEvent.create({
        user_id: targetEmail,
        delta: step.delta,
        reason_code: step.reason_code,
        source_type: step.source_type,
        description: step.description,
        score_after: trustRunning,
        metrics: step.metrics
      });
    }

    return Response.json({ ok: true, targetEmail, rp_final: rpRunning, trust_final: trustRunning });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});