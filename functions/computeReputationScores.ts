import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Influence components (weights total 100)
const INFLUENCE = { engagement: 50, content: 30, mentorship: 20 };
// Expertise components (weights total 100)
const EXPERTISE = { skills: 40, projects: 35, peer: 25 };

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
    if (targetUserId !== me.email && me.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const profList = await base44.entities.UserProfile.filter({ user_id: targetUserId });
    const profile = profList?.[0];
    if (!profile) return Response.json({ error: 'Profile not found' }, { status: 404 });

    // ---------- Influence Score ----------
    // Engagement: combine reach_score and follower_count
    const reach = Number(profile?.reach_score || 0);
    const followers = Number(profile?.follower_count || 0);
    const engagementNorm = clamp((reach / 1000) * 70 + Math.min(followers / 50, 1) * 30, 0, 100);
    const engagementScore = Math.round((engagementNorm / 100) * INFLUENCE.engagement);

    // Content: count posts authored (last 90 days) and listings (offers)
    let postsAuthored = 0;
    try {
      const posts = await base44.entities.Post.filter({ author_id: targetUserId });
      const ninetyDaysAgo = Date.now() - 1000 * 60 * 60 * 24 * 90;
      postsAuthored = (posts || []).filter(p => new Date(p.created_date || 0).getTime() >= ninetyDaysAgo).length;
    } catch (_) {}
    let offers = 0;
    try {
      const listings = await base44.entities.Listing.filter({ owner_id: targetUserId, listing_type: 'offer' });
      offers = listings?.length || 0;
    } catch (_) {}
    const contentNorm = clamp(Math.min(postsAuthored, 30) / 30 * 70 + Math.min(offers, 10) / 10 * 30, 0, 100);
    const contentScore = Math.round((contentNorm / 100) * INFLUENCE.content);

    // Mentorship: completed mentorship sessions and average ratings as mentor
    let mentorCompleted = 0;
    let mentorAvg = 0;
    try {
      const sessions = await base44.entities.MentorshipSession.filter({ status: 'completed', mentor_id: targetUserId });
      mentorCompleted = sessions?.length || 0;
      const rated = (sessions || []).map(s => Number(s.feedback_mentee_rating || 0)).filter(r => r > 0);
      mentorAvg = rated.length ? rated.reduce((a,b)=>a+b,0)/rated.length : 0;
    } catch (_) {}
    const mentorshipNorm = clamp(Math.min(mentorCompleted, 20) / 20 * 60 + (mentorAvg / 5) * 40, 0, 100);
    const mentorshipScore = Math.round((mentorshipNorm / 100) * INFLUENCE.mentorship);

    const influenceScore = clamp(engagementScore + contentScore + mentorshipScore, 0, 100);

    // ---------- Expertise Score ----------
    // Skills: verified skills and proficiency
    let verifiedSkills = 0; let profSum = 0;
    try {
      const skills = await base44.entities.Skill.filter({ user_id: targetUserId });
      const verified = (skills || []).filter(s => !!s.verified);
      verifiedSkills = verified.length;
      profSum = verified.reduce((s, sk) => s + Number(sk.proficiency || 0), 0);
    } catch (_) {}
    const skillsNorm = clamp(Math.min(verifiedSkills, 10) / 10 * 60 + Math.min(profSum / (verifiedSkills || 1) / 5, 1) * 40, 0, 100);
    const skillsScore = Math.round((skillsNorm / 100) * EXPERTISE.skills);

    // Projects: approved projects count
    let approvedProjects = 0;
    try {
      const owned = await base44.entities.Project.filter({ owner_id: targetUserId });
      const created = await base44.entities.Project.filter({ creator_id: targetUserId });
      const map = new Map();
      [...(owned||[]), ...(created||[])].forEach(p => map.set(p.id, p));
      approvedProjects = Array.from(map.values()).filter(p => p.status === 'approved').length;
    } catch (_) {}
    const projectsNorm = clamp(Math.min(approvedProjects, 12) / 12 * 100, 0, 100);
    const projectsScore = Math.round((projectsNorm / 100) * EXPERTISE.projects);

    // Peer reviews: testimonials average
    let tAvg = 0;
    try {
      const testimonials = await base44.entities.Testimonial.filter({ to_user_id: targetUserId });
      const ratings = (testimonials || []).map(t => Number(t.rating || 0)).filter(r => r > 0);
      tAvg = ratings.length ? ratings.reduce((a,b)=>a+b,0)/ratings.length : 0;
    } catch (_) {}
    const peerNorm = clamp((tAvg / 5) * 100, 0, 100);
    const peerScore = Math.round((peerNorm / 100) * EXPERTISE.peer);

    const expertiseScore = clamp(skillsScore + projectsScore + peerScore, 0, 100);

    // Persist both
    await base44.entities.UserProfile.update(profile.id, {
      influence_score: influenceScore,
      expertise_score: expertiseScore,
    });

    return Response.json({
      success: true,
      influence: { score: influenceScore, breakdown: { engagement: engagementScore, content: contentScore, mentorship: mentorshipScore } },
      expertise: { score: expertiseScore, breakdown: { skills: skillsScore, projects: projectsScore, peer: peerScore } },
    });
  } catch (error) {
    return Response.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
});