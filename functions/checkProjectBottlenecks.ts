import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const now = new Date();
    const alertsCreated = [];

    // Get all active projects
    const projects = await base44.asServiceRole.entities.Project.filter({
      project_status: { $in: ['planned', 'in_progress'] }
    }, '-created_date', 500);

    // Get all alert configs
    const allConfigs = await base44.asServiceRole.entities.ProjectAlertConfig.list('-created_date', 500);
    
    // Get all profiles for team member lookup
    const profiles = await base44.asServiceRole.entities.UserProfile.list('-created_date', 500);

    for (const project of projects) {
      // Find config for this project or use defaults
      const config = allConfigs.find(c => c.project_id === project.id) || {
        is_enabled: true,
        overdue_threshold_days: 1,
        overdue_critical_days: 3,
        member_overload_threshold: 5,
        member_overload_critical: 8,
        blocked_task_threshold_hours: 24,
        blocked_task_critical_hours: 72,
        dependency_chain_threshold: 3,
        stale_task_days: 7,
        low_velocity_threshold: 2,
        notify_project_owner: true,
        notify_team_members: false,
        notify_on_warning: true,
        notify_on_critical: true
      };

      if (!config.is_enabled) continue;

      // Get project tasks
      const tasks = await base44.asServiceRole.entities.ProjectTask.filter(
        { project_id: project.id }, 
        '-created_date', 
        500
      );

      if (tasks.length === 0) continue;

      const bottlenecks = [];

      // 1. Check overdue tasks
      const overdueTasks = tasks.filter(t => {
        if (t.status === 'completed' || !t.due_date) return false;
        const dueDate = new Date(t.due_date);
        const daysOverdue = Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24));
        return daysOverdue > 0;
      });

      for (const task of overdueTasks) {
        const dueDate = new Date(task.due_date);
        const daysOverdue = Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24));
        
        const isCritical = daysOverdue >= config.overdue_critical_days;
        const isWarning = daysOverdue >= config.overdue_threshold_days;

        if ((isCritical && config.notify_on_critical) || (isWarning && !isCritical && config.notify_on_warning)) {
          bottlenecks.push({
            type: 'overdue',
            severity: isCritical ? 'critical' : 'warning',
            title: `Task "${task.title}" is ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue`,
            taskId: task.id,
            assigneeId: task.assignee_id,
            daysOverdue
          });
        }
      }

      // 2. Check team member overload
      const teamMemberIds = project.team_member_ids || [];
      const tasksByMember = {};
      
      tasks.forEach(t => {
        if (t.assignee_id && t.status === 'in_progress') {
          if (!tasksByMember[t.assignee_id]) tasksByMember[t.assignee_id] = [];
          tasksByMember[t.assignee_id].push(t);
        }
      });

      for (const [memberId, memberTasks] of Object.entries(tasksByMember)) {
        const count = memberTasks.length;
        const isCritical = count >= config.member_overload_critical;
        const isWarning = count >= config.member_overload_threshold;
        
        const profile = profiles.find(p => p.user_id === memberId);
        const memberName = profile?.display_name || memberId;

        if ((isCritical && config.notify_on_critical) || (isWarning && !isCritical && config.notify_on_warning)) {
          bottlenecks.push({
            type: 'overload',
            severity: isCritical ? 'critical' : 'warning',
            title: `${memberName} has ${count} tasks in progress`,
            memberId,
            taskCount: count
          });
        }
      }

      // 3. Check blocked tasks
      const blockedTasks = tasks.filter(t => t.status === 'blocked');
      
      for (const task of blockedTasks) {
        const updatedAt = new Date(task.updated_date || task.created_date);
        const hoursBlocked = Math.ceil((now - updatedAt) / (1000 * 60 * 60));
        
        const isCritical = hoursBlocked >= config.blocked_task_critical_hours;
        const isWarning = hoursBlocked >= config.blocked_task_threshold_hours;

        if ((isCritical && config.notify_on_critical) || (isWarning && !isCritical && config.notify_on_warning)) {
          bottlenecks.push({
            type: 'blocked',
            severity: isCritical ? 'critical' : 'warning',
            title: `Task "${task.title}" has been blocked for ${hoursBlocked} hours`,
            taskId: task.id,
            assigneeId: task.assignee_id,
            hoursBlocked
          });
        }
      }

      // 4. Check dependency chains
      const findDependencyChainLength = (taskId, visited = new Set()) => {
        if (visited.has(taskId)) return 0;
        visited.add(taskId);
        
        const task = tasks.find(t => t.id === taskId);
        if (!task || !task.depends_on || task.depends_on.length === 0) return 1;
        
        let maxDepth = 0;
        for (const depId of task.depends_on) {
          const depth = findDependencyChainLength(depId, new Set(visited));
          maxDepth = Math.max(maxDepth, depth);
        }
        return maxDepth + 1;
      };

      for (const task of tasks) {
        if (task.status === 'completed') continue;
        const chainLength = findDependencyChainLength(task.id);
        
        if (chainLength >= config.dependency_chain_threshold) {
          bottlenecks.push({
            type: 'dependency_chain',
            severity: chainLength >= config.dependency_chain_threshold + 2 ? 'critical' : 'warning',
            title: `Task "${task.title}" has a dependency chain of ${chainLength} tasks`,
            taskId: task.id,
            chainLength
          });
        }
      }

      // 5. Check stale tasks (no update in X days)
      const staleTasks = tasks.filter(t => {
        if (t.status === 'completed' || t.status === 'todo') return false;
        const updatedAt = new Date(t.updated_date || t.created_date);
        const daysSinceUpdate = Math.ceil((now - updatedAt) / (1000 * 60 * 60 * 24));
        return daysSinceUpdate >= config.stale_task_days;
      });

      for (const task of staleTasks) {
        const updatedAt = new Date(task.updated_date || task.created_date);
        const daysSinceUpdate = Math.ceil((now - updatedAt) / (1000 * 60 * 60 * 24));
        
        bottlenecks.push({
          type: 'stale',
          severity: daysSinceUpdate >= config.stale_task_days * 2 ? 'critical' : 'warning',
          title: `Task "${task.title}" has had no updates for ${daysSinceUpdate} days`,
          taskId: task.id,
          assigneeId: task.assignee_id,
          daysSinceUpdate
        });
      }

      // 6. Check velocity (tasks completed in last 7 days)
      const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
      const recentlyCompleted = tasks.filter(t => {
        if (t.status !== 'completed' || !t.completed_at) return false;
        return new Date(t.completed_at) >= sevenDaysAgo;
      });

      if (tasks.length >= 5 && recentlyCompleted.length < config.low_velocity_threshold) {
        bottlenecks.push({
          type: 'low_velocity',
          severity: recentlyCompleted.length === 0 ? 'critical' : 'warning',
          title: `Project velocity is low: only ${recentlyCompleted.length} tasks completed this week`,
          velocity: recentlyCompleted.length
        });
      }

      // Create notifications for bottlenecks
      if (bottlenecks.length > 0) {
        // Check for existing alerts today to avoid duplicates
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        
        const existingAlerts = await base44.asServiceRole.entities.Notification.filter({
          type: 'project',
          'metadata.project_id': project.id
        }, '-created_date', 50);

        const recentAlertTypes = new Set(
          existingAlerts
            .filter(a => new Date(a.created_date) >= todayStart)
            .map(a => `${a.metadata?.bottleneck_type}-${a.metadata?.task_id || a.metadata?.member_id || 'general'}`)
        );

        const usersToNotify = new Set();
        if (config.notify_project_owner && project.owner_id) {
          usersToNotify.add(project.owner_id);
        }

        for (const bottleneck of bottlenecks) {
          const alertKey = `${bottleneck.type}-${bottleneck.taskId || bottleneck.memberId || 'general'}`;
          
          if (recentAlertTypes.has(alertKey)) continue;

          // Add affected team member to notify list
          if (config.notify_team_members && bottleneck.assigneeId) {
            usersToNotify.add(bottleneck.assigneeId);
          }

          for (const userId of usersToNotify) {
            await base44.asServiceRole.entities.Notification.create({
              user_id: userId,
              type: 'project',
              title: bottleneck.severity === 'critical' ? '🚨 Critical Bottleneck' : '⚠️ Project Alert',
              message: `${project.title}: ${bottleneck.title}`,
              priority: bottleneck.severity === 'critical' ? 'urgent' : 'high',
              action_url: `/ProjectTrack?project=${project.id}`,
              action_label: 'View Project',
              metadata: {
                project_id: project.id,
                bottleneck_type: bottleneck.type,
                severity: bottleneck.severity,
                task_id: bottleneck.taskId,
                member_id: bottleneck.memberId
              }
            });

            alertsCreated.push({
              project: project.title,
              type: bottleneck.type,
              severity: bottleneck.severity,
              user: userId
            });
          }
        }
      }
    }

    return Response.json({
      success: true,
      projectsChecked: projects.length,
      alertsCreated: alertsCreated.length,
      details: alertsCreated
    });
  } catch (error) {
    console.error('Bottleneck check error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});