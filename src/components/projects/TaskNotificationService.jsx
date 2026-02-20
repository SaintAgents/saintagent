import { base44 } from '@/api/base44Client';

// Create a task notification
export async function createTaskNotification({
  type,
  userId,
  taskTitle,
  projectTitle,
  projectId,
  taskId,
  sourceUser,
  extraData = {}
}) {
  const notificationConfig = {
    task_assigned: {
      title: 'New Task Assigned',
      message: `You've been assigned to "${taskTitle}" in project "${projectTitle}"`,
      priority: 'normal'
    },
    task_due: {
      title: 'Task Due Soon',
      message: `"${taskTitle}" is due ${extraData.dueText || 'soon'}`,
      priority: 'high'
    },
    task_dependency: {
      title: 'Task Ready to Start',
      message: `Dependencies met for "${taskTitle}" - you can now start working on it`,
      priority: 'normal'
    },
    task_completed: {
      title: 'Task Completed',
      message: `"${taskTitle}" has been completed in project "${projectTitle}"`,
      priority: 'low'
    }
  };

  const config = notificationConfig[type];
  if (!config) return null;

  return base44.entities.Notification.create({
    user_id: userId,
    type: type === 'task_dependency' ? 'task_dependency' : 
          type === 'task_due' ? 'task_due' : 'task_assigned',
    title: config.title,
    message: config.message,
    priority: config.priority,
    action_url: `/ProjectTrack?project=${projectId}`,
    action_label: 'View Task',
    metadata: {
      project_id: projectId,
      task_id: taskId,
      ...extraData
    },
    source_user_id: sourceUser?.email,
    source_user_name: sourceUser?.name,
    source_user_avatar: sourceUser?.avatar
  });
}

// Check and send due date notifications
export async function checkDueDateNotifications(tasks, userProfiles) {
  const now = new Date();
  const notifications = [];

  for (const task of tasks) {
    if (!task.due_date || task.status === 'completed') continue;
    if (!task.assignee_id) continue;

    const dueDate = new Date(task.due_date);
    const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

    // Get user's notification preferences
    const userProfile = userProfiles.find(p => p.user_id === task.assignee_id);
    const prefs = userProfile?.task_notification_prefs || {};
    const daysBefore = prefs.task_due_days_before || 1;

    if (prefs.task_due_reminder !== false && daysUntilDue <= daysBefore && daysUntilDue >= 0) {
      let dueText = 'today';
      if (daysUntilDue === 1) dueText = 'tomorrow';
      else if (daysUntilDue > 1) dueText = `in ${daysUntilDue} days`;

      notifications.push({
        type: 'task_due',
        userId: task.assignee_id,
        taskTitle: task.title,
        projectTitle: task.project_title || 'Unknown Project',
        projectId: task.project_id,
        taskId: task.id,
        extraData: { dueText, daysUntilDue }
      });
    }
  }

  return notifications;
}

// Check for dependency notifications
export async function checkDependencyNotifications(task, allTasks, sourceUser) {
  if (!task.depends_on || task.depends_on.length === 0) return [];
  if (!task.assignee_id) return [];

  // Check if all dependencies are now completed
  const allDepsCompleted = task.depends_on.every(depId => {
    const depTask = allTasks.find(t => t.id === depId);
    return depTask?.status === 'completed';
  });

  if (allDepsCompleted && task.status === 'todo') {
    return [{
      type: 'task_dependency',
      userId: task.assignee_id,
      taskTitle: task.title,
      projectId: task.project_id,
      taskId: task.id,
      sourceUser
    }];
  }

  return [];
}

// Hook to use in components
export function useTaskNotifications() {
  const notifyTaskAssigned = async ({ task, project, assignee, sourceUser }) => {
    return createTaskNotification({
      type: 'task_assigned',
      userId: assignee.user_id || assignee.email,
      taskTitle: task.title,
      projectTitle: project.title,
      projectId: project.id,
      taskId: task.id,
      sourceUser
    });
  };

  const notifyTaskCompleted = async ({ task, project, sourceUser }) => {
    // Notify project owner or relevant team members
    if (project.owner_id && project.owner_id !== sourceUser?.email) {
      return createTaskNotification({
        type: 'task_completed',
        userId: project.owner_id,
        taskTitle: task.title,
        projectTitle: project.title,
        projectId: project.id,
        taskId: task.id,
        sourceUser
      });
    }
    return null;
  };

  const notifyDependencyMet = async ({ task, allTasks, sourceUser }) => {
    const notifications = await checkDependencyNotifications(task, allTasks, sourceUser);
    for (const notif of notifications) {
      await createTaskNotification(notif);
    }
    return notifications.length;
  };

  return {
    notifyTaskAssigned,
    notifyTaskCompleted,
    notifyDependencyMet
  };
}