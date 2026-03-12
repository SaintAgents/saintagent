import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { event, data, old_data } = body;

    if (!data || !event) {
      return Response.json({ ok: true, skipped: true });
    }

    const task = data;
    if (!task.project_id || !task.assignee_id) {
      return Response.json({ ok: true, skipped: 'no assignee or project' });
    }

    // For updates, only notify on meaningful changes
    if (event.type === 'update' && old_data) {
      const statusChanged = old_data.status !== task.status;
      const priorityChanged = old_data.priority !== task.priority;
      const dueDateChanged = old_data.due_date !== task.due_date;
      const assigneeChanged = old_data.assignee_id !== task.assignee_id;

      if (!statusChanged && !priorityChanged && !dueDateChanged && !assigneeChanged) {
        return Response.json({ ok: true, skipped: 'no meaningful change' });
      }

      // Don't notify if the assignee made the change themselves
      if (event.actor === task.assignee_id) {
        // Still notify on assignment changes to new assignee
        if (!assigneeChanged) {
          return Response.json({ ok: true, skipped: 'self update' });
        }
      }

      // Build description of what changed
      const changes = [];
      if (statusChanged) changes.push(`status → ${task.status?.replace('_', ' ')}`);
      if (priorityChanged) changes.push(`priority → ${task.priority}`);
      if (dueDateChanged) changes.push(`due date updated`);
      if (assigneeChanged) changes.push(`assigned to you`);

      const project = (await base44.asServiceRole.entities.Project.filter({ id: task.project_id }))?.[0];
      const projectName = project?.title || 'a project';

      await base44.asServiceRole.entities.Notification.create({
        user_id: task.assignee_id,
        type: 'task_update',
        title: 'Task Updated',
        message: `"${task.title}" in ${projectName}: ${changes.join(', ')}`,
        action_url: `/Projects?id=${task.project_id}`,
        priority: task.priority === 'urgent' ? 'high' : 'normal',
        metadata: {
          project_id: task.project_id,
          task_id: event.entity_id,
          changes
        }
      });
    }

    // For new task creation with an assignee
    if (event.type === 'create' && task.assignee_id) {
      const project = (await base44.asServiceRole.entities.Project.filter({ id: task.project_id }))?.[0];
      const projectName = project?.title || 'a project';

      await base44.asServiceRole.entities.Notification.create({
        user_id: task.assignee_id,
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: `You've been assigned "${task.title}" in ${projectName}`,
        action_url: `/Projects?id=${task.project_id}`,
        priority: task.priority === 'urgent' ? 'high' : 'normal',
        metadata: {
          project_id: task.project_id,
          task_id: event.entity_id
        }
      });
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error('notifyTaskUpdate error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});