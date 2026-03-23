import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get all tasks with due dates
    const tasks = await base44.asServiceRole.entities.ProjectTask.filter({}, '-due_date', 1000);
    const projects = await base44.asServiceRole.entities.Project.list('-created_date', 500);
    const profiles = await base44.asServiceRole.entities.UserProfile.list('-created_date', 500);

    const now = new Date();
    const notificationsCreated = [];

    for (const task of tasks) {
      if (!task.due_date || task.status === 'completed' || !task.assignee_id) continue;

      const dueDate = new Date(task.due_date);
      const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

      // Get user's notification preferences
      const userProfile = profiles.find(p => p.user_id === task.assignee_id);
      const prefs = userProfile?.task_notification_prefs || {};
      
      if (prefs.task_due_reminder === false) continue;
      
      const daysBefore = prefs.task_due_days_before || 1;

      // Only notify if within the reminder window
      if (daysUntilDue <= daysBefore && daysUntilDue >= 0) {
        let dueText = 'today';
        if (daysUntilDue === 1) dueText = 'tomorrow';
        else if (daysUntilDue > 1) dueText = `in ${daysUntilDue} days`;

        const project = projects.find(p => p.id === task.project_id);

        // Check if notification already sent today
        const existingNotifications = await base44.asServiceRole.entities.Notification.filter({
          user_id: task.assignee_id,
          type: 'task_due'
        }, '-created_date', 10);

        const alreadySent = existingNotifications.some(n => {
          const notifDate = new Date(n.created_date);
          const sameDay = notifDate.toDateString() === now.toDateString();
          return sameDay && n.metadata?.task_id === task.id;
        });

        if (!alreadySent) {
          await base44.asServiceRole.entities.Notification.create({
            user_id: task.assignee_id,
            type: 'task_due',
            title: 'Task Due Soon',
            message: `"${task.title}" is due ${dueText}${project ? ` in project "${project.title}"` : ''}`,
            priority: daysUntilDue === 0 ? 'urgent' : 'high',
            action_url: `/ProjectTrack?project=${task.project_id}`,
            action_label: 'View Task',
            metadata: {
              project_id: task.project_id,
              task_id: task.id,
              due_date: task.due_date,
              days_until_due: daysUntilDue
            }
          });

          notificationsCreated.push({
            task: task.title,
            user: task.assignee_id,
            daysUntilDue
          });
        }
      }
    }

    return Response.json({
      success: true,
      notificationsCreated: notificationsCreated.length,
      details: notificationsCreated
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});