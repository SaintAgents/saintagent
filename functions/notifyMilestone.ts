import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { event, data, old_data } = body;

    if (!data || !event) {
      return Response.json({ ok: true, skipped: true });
    }

    const milestone = data;

    // Only notify when status changes to 'completed'
    if (event.type === 'update' && old_data) {
      if (old_data.status === milestone.status || milestone.status !== 'completed') {
        return Response.json({ ok: true, skipped: 'not a completion event' });
      }
    } else if (event.type !== 'update') {
      return Response.json({ ok: true, skipped: 'not an update' });
    }

    if (!milestone.project_id) {
      return Response.json({ ok: true, skipped: 'no project' });
    }

    // Get the project
    const project = (await base44.asServiceRole.entities.Project.filter({ id: milestone.project_id }))?.[0];
    if (!project) {
      return Response.json({ ok: true, skipped: 'project not found' });
    }

    // Notify project owner + team members
    const recipientIds = new Set();
    if (project.owner_id) recipientIds.add(project.owner_id);
    (project.team_member_ids || []).forEach(id => recipientIds.add(id));

    for (const userId of recipientIds) {
      await base44.asServiceRole.entities.Notification.create({
        user_id: userId,
        type: 'milestone',
        title: 'Milestone Reached! 🎉',
        message: `"${milestone.name}" has been completed in "${project.title}"`,
        action_url: `/Projects?id=${project.id}`,
        priority: 'high',
        metadata: {
          project_id: milestone.project_id,
          milestone_id: event.entity_id,
          milestone_name: milestone.name
        }
      });
    }

    return Response.json({ ok: true, notified: recipientIds.size });
  } catch (error) {
    console.error('notifyMilestone error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});