import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { event, data } = body;

    // Only handle create events
    if (event?.type !== 'create' || !data) {
      return Response.json({ ok: true, skipped: true });
    }

    const review = data;
    if (!review.project_id || !review.reviewer_id) {
      return Response.json({ ok: true, skipped: 'missing fields' });
    }

    // Get the project to find the owner
    const projects = await base44.asServiceRole.entities.Project.filter({ id: review.project_id });
    const project = projects?.[0];
    if (!project) {
      return Response.json({ ok: true, skipped: 'project not found' });
    }

    // Don't notify yourself
    if (project.owner_id === review.reviewer_id) {
      return Response.json({ ok: true, skipped: 'self review' });
    }

    // Create notification for the project owner
    await base44.asServiceRole.entities.Notification.create({
      user_id: project.owner_id,
      type: 'peer_review',
      title: 'New Peer Review',
      message: `${review.reviewer_name || 'Someone'} reviewed your project "${project.title}" — rated ${review.overall_rating}/5`,
      action_url: `/Projects?id=${project.id}`,
      priority: 'normal',
      source_user_id: review.reviewer_id,
      source_user_name: review.reviewer_name || '',
      source_user_avatar: review.reviewer_avatar || '',
      metadata: {
        project_id: review.project_id,
        review_id: event.entity_id,
        rating: review.overall_rating
      }
    });

    // Also notify team members
    const teamIds = (project.team_member_ids || []).filter(id => id !== review.reviewer_id && id !== project.owner_id);
    for (const memberId of teamIds) {
      await base44.asServiceRole.entities.Notification.create({
        user_id: memberId,
        type: 'peer_review',
        title: 'New Review on Your Project',
        message: `${review.reviewer_name || 'Someone'} reviewed "${project.title}" — rated ${review.overall_rating}/5`,
        action_url: `/Projects?id=${project.id}`,
        priority: 'low',
        source_user_id: review.reviewer_id,
        source_user_name: review.reviewer_name || '',
        source_user_avatar: review.reviewer_avatar || '',
        metadata: { project_id: review.project_id, review_id: event.entity_id }
      });
    }

    return Response.json({ ok: true, notified: true });
  } catch (error) {
    console.error('notifyPeerReview error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});