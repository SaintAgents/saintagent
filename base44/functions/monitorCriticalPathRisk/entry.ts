import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Automated Risk Monitoring System
 * Analyzes: task delays, missing dependencies, resource capacity, critical path risk
 * Sends: in-app notifications + email alerts to project managers
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const now = new Date();
    const results = { projectsScanned: 0, risksFound: 0, alertsSent: 0, emailsSent: 0, details: [] };

    // Fetch all data upfront
    const [projects, allTasks, profiles, milestones, alertConfigs] = await Promise.all([
      base44.asServiceRole.entities.Project.filter({}, '-updated_date', 500),
      base44.asServiceRole.entities.ProjectTask.list('-created_date', 2000),
      base44.asServiceRole.entities.UserProfile.list('-updated_date', 500),
      base44.asServiceRole.entities.ProjectMilestone.list('-created_date', 500),
      base44.asServiceRole.entities.ProjectAlertConfig.list('-created_date', 500),
    ]);

    const activeProjects = projects.filter(p =>
      ['in_progress', 'funded', 'approved', 'planned'].includes(p.project_status || p.status)
    );

    for (const project of activeProjects) {
      results.projectsScanned++;
      const projectTasks = allTasks.filter(t => t.project_id === project.id);
      if (projectTasks.length < 2) continue;

      const config = alertConfigs.find(c => c.project_id === project.id);
      if (config && !config.is_enabled) continue;

      const projectMilestones = milestones.filter(m => m.project_id === project.id);
      const risks = [];

      // ========== 1. CRITICAL PATH ANALYSIS ==========
      const cpResult = computeCriticalPathServer(projectTasks);
      const criticalTasks = projectTasks.filter(t => cpResult.criticalTaskIds.has(t.id));

      // Check if any critical path task is delayed
      const delayedCriticalTasks = criticalTasks.filter(t => {
        if (t.status === 'completed') return false;
        if (!t.due_date) return false;
        return new Date(t.due_date) < now;
      });

      if (delayedCriticalTasks.length > 0) {
        const maxDelay = Math.max(...delayedCriticalTasks.map(t => {
          return Math.ceil((now - new Date(t.due_date)) / (1000 * 60 * 60 * 24));
        }));
        risks.push({
          type: 'critical_path_delay',
          severity: maxDelay >= 5 ? 'critical' : 'warning',
          title: `${delayedCriticalTasks.length} critical path task(s) overdue by up to ${maxDelay} days`,
          detail: delayedCriticalTasks.map(t => `"${t.title}" (${Math.ceil((now - new Date(t.due_date)) / 86400000)}d)`).join(', '),
          impact: 'Project end date will slip by at least ' + maxDelay + ' days',
        });
      }

      // Check critical path tasks that are blocked
      const blockedCritical = criticalTasks.filter(t => t.status === 'blocked');
      if (blockedCritical.length > 0) {
        risks.push({
          type: 'critical_path_blocked',
          severity: 'critical',
          title: `${blockedCritical.length} critical path task(s) are BLOCKED`,
          detail: blockedCritical.map(t => `"${t.title}"`).join(', '),
          impact: 'Project delivery is halted until blockers are resolved',
        });
      }

      // ========== 2. PROJECT END DATE RISK ==========
      if (project.end_date && cpResult.projectEndDay > 0) {
        const plannedEnd = new Date(project.end_date);
        // Estimate actual end: earliest critical task start + projectEndDay
        const earliestStart = criticalTasks.reduce((min, t) => {
          if (t.start_date) {
            const d = new Date(t.start_date);
            return d < min ? d : min;
          }
          return min;
        }, now);
        
        const projectedEnd = new Date(earliestStart.getTime() + cpResult.projectEndDay * 86400000);
        const slipDays = Math.ceil((projectedEnd - plannedEnd) / 86400000);
        
        if (slipDays > 3) {
          risks.push({
            type: 'end_date_risk',
            severity: slipDays > 14 ? 'critical' : 'warning',
            title: `Project projected to miss deadline by ${slipDays} days`,
            detail: `Planned end: ${project.end_date} · Projected: ${projectedEnd.toISOString().split('T')[0]}`,
            impact: `${slipDays}-day schedule overrun based on current critical path`,
          });
        }
      }

      // ========== 3. MISSING / BROKEN DEPENDENCIES ==========
      const missingDeps = [];
      for (const task of projectTasks) {
        if (task.status === 'completed') continue;
        const deps = getDependencyIds(task);
        for (const depId of deps) {
          const depTask = projectTasks.find(t => t.id === depId);
          if (!depTask) {
            missingDeps.push({ task: task.title, missingId: depId });
          }
        }
      }
      if (missingDeps.length > 0) {
        risks.push({
          type: 'missing_dependencies',
          severity: 'warning',
          title: `${missingDeps.length} task(s) reference missing dependencies`,
          detail: missingDeps.slice(0, 3).map(d => `"${d.task}"`).join(', '),
          impact: 'Dependency graph is incomplete – scheduling may be inaccurate',
        });
      }

      // Unresolved predecessors on in-progress tasks
      const unresolvedPredecessors = [];
      for (const task of projectTasks) {
        if (task.status !== 'in_progress') continue;
        const deps = getDependencyIds(task);
        for (const depId of deps) {
          const pred = projectTasks.find(t => t.id === depId);
          if (pred && pred.status !== 'completed') {
            unresolvedPredecessors.push({ task: task.title, predecessor: pred.title });
          }
        }
      }
      if (unresolvedPredecessors.length > 0) {
        risks.push({
          type: 'dependency_violation',
          severity: 'warning',
          title: `${unresolvedPredecessors.length} in-progress task(s) have unfinished predecessors`,
          detail: unresolvedPredecessors.slice(0, 3).map(d => `"${d.task}" waiting on "${d.predecessor}"`).join('; '),
          impact: 'Work may need to be redone if predecessor output changes',
        });
      }

      // ========== 4. RESOURCE CAPACITY BOTTLENECK ==========
      const activeTasks = projectTasks.filter(t => t.status === 'in_progress' || t.status === 'todo');
      const loadByAssignee = {};
      activeTasks.forEach(t => {
        if (!t.assignee_id) return;
        if (!loadByAssignee[t.assignee_id]) loadByAssignee[t.assignee_id] = { hours: 0, count: 0, tasks: [] };
        loadByAssignee[t.assignee_id].hours += (t.estimated_hours || 8);
        loadByAssignee[t.assignee_id].count++;
        loadByAssignee[t.assignee_id].tasks.push(t.title);
      });

      const overloaded = Object.entries(loadByAssignee).filter(([, v]) => v.hours > 60); // >1.5 weeks backlog
      if (overloaded.length > 0) {
        for (const [memberId, load] of overloaded) {
          const prof = profiles.find(p => p.user_id === memberId);
          const name = prof?.display_name || memberId.split('@')[0];
          risks.push({
            type: 'capacity_bottleneck',
            severity: load.hours > 120 ? 'critical' : 'warning',
            title: `${name} has ${Math.round(load.hours)}h of work queued (${load.count} tasks)`,
            detail: load.tasks.slice(0, 3).join(', ') + (load.tasks.length > 3 ? ` +${load.tasks.length - 3} more` : ''),
            impact: 'Resource bottleneck may cascade delays to downstream tasks',
          });
        }
      }

      // Unassigned tasks on critical path
      const unassignedCritical = criticalTasks.filter(t => !t.assignee_id && t.status !== 'completed');
      if (unassignedCritical.length > 0) {
        risks.push({
          type: 'unassigned_critical',
          severity: 'warning',
          title: `${unassignedCritical.length} critical path task(s) have no assignee`,
          detail: unassignedCritical.map(t => `"${t.title}"`).join(', '),
          impact: 'Critical tasks without owners are likely to be delayed',
        });
      }

      // ========== 5. MILESTONE RISK ==========
      for (const ms of projectMilestones) {
        if (ms.status === 'completed') continue;
        if (!ms.end_date) continue;
        const msEnd = new Date(ms.end_date);
        const daysUntil = Math.ceil((msEnd - now) / 86400000);
        if (daysUntil < 0) {
          risks.push({
            type: 'milestone_overdue',
            severity: Math.abs(daysUntil) > 7 ? 'critical' : 'warning',
            title: `Milestone "${ms.name}" is ${Math.abs(daysUntil)} days overdue`,
            detail: `Due: ${ms.end_date} · Progress: ${ms.progress_percent || 0}%`,
            impact: 'Downstream milestones and deliverables may also slip',
          });
        } else if (daysUntil <= 7 && (ms.progress_percent || 0) < 70) {
          risks.push({
            type: 'milestone_at_risk',
            severity: 'warning',
            title: `Milestone "${ms.name}" due in ${daysUntil} days at only ${ms.progress_percent || 0}% complete`,
            detail: `Due: ${ms.end_date}`,
            impact: 'Unlikely to hit milestone deadline without intervention',
          });
        }
      }

      // ========== SEND ALERTS ==========
      if (risks.length === 0) continue;
      results.risksFound += risks.length;

      const criticalRisks = risks.filter(r => r.severity === 'critical');
      const warningRisks = risks.filter(r => r.severity === 'warning');

      // Determine recipients
      const recipientIds = new Set();
      if (project.owner_id) recipientIds.add(project.owner_id);
      (project.team_member_ids || []).forEach(id => recipientIds.add(id));

      // Deduplicate: check if we already sent today
      const todayStr = now.toISOString().split('T')[0];
      const existingNotifs = await base44.asServiceRole.entities.Notification.filter({
        type: 'project',
        'metadata.risk_monitor_date': todayStr,
        'metadata.project_id': project.id,
      }, '-created_date', 5);

      if (existingNotifs.length > 0) continue; // Already alerted today for this project

      // Build alert summary
      const summaryLines = risks.map(r => {
        const icon = r.severity === 'critical' ? '🔴' : '🟡';
        return `${icon} ${r.title}`;
      });

      const notifTitle = criticalRisks.length > 0
        ? `🚨 ${criticalRisks.length} Critical Risk(s) in "${project.title}"`
        : `⚠️ ${warningRisks.length} Risk(s) in "${project.title}"`;

      const notifMessage = summaryLines.slice(0, 5).join('\n') +
        (summaryLines.length > 5 ? `\n+${summaryLines.length - 5} more...` : '');

      // Create in-app notifications
      for (const userId of recipientIds) {
        await base44.asServiceRole.entities.Notification.create({
          user_id: userId,
          type: 'project',
          title: notifTitle,
          message: notifMessage,
          priority: criticalRisks.length > 0 ? 'urgent' : 'high',
          action_url: `/ProjectTrack?project=${project.id}`,
          action_label: 'View Project',
          metadata: {
            project_id: project.id,
            risk_monitor_date: todayStr,
            risk_count: risks.length,
            critical_count: criticalRisks.length,
            warning_count: warningRisks.length,
          },
        });
        results.alertsSent++;
      }

      // Send email to project owner (or all critical risk recipients)
      const emailRecipients = criticalRisks.length > 0
        ? [...recipientIds]
        : project.owner_id ? [project.owner_id] : [];

      for (const recipientId of emailRecipients) {
        const emailBody = buildEmailBody(project, risks, criticalRisks, warningRisks);
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: recipientId,
          subject: criticalRisks.length > 0
            ? `🚨 CRITICAL: ${project.title} – ${criticalRisks.length} risk(s) threatening deadline`
            : `⚠️ Risk Alert: ${project.title} – ${risks.length} issue(s) detected`,
          body: emailBody,
        });
        results.emailsSent++;
      }

      results.details.push({
        project: project.title,
        risks: risks.length,
        critical: criticalRisks.length,
        warnings: warningRisks.length,
        recipients: [...recipientIds],
      });
    }

    return Response.json({ success: true, ...results });
  } catch (error) {
    console.error('Risk monitor error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});


// ======= CRITICAL PATH (server-side, no date-fns) =======
function computeCriticalPathServer(tasks) {
  const taskMap = new Map();
  tasks.forEach(t => taskMap.set(t.id, t));

  const successors = new Map();
  const predecessors = new Map();
  tasks.forEach(t => {
    successors.set(t.id, []);
    predecessors.set(t.id, []);
  });

  tasks.forEach(t => {
    const deps = getDependencyIds(t);
    deps.forEach(predId => {
      if (taskMap.has(predId)) {
        successors.get(predId).push(t.id);
        predecessors.get(t.id).push(predId);
      }
    });
  });

  function getDuration(t) {
    if (t.start_date && t.due_date) {
      const s = new Date(t.start_date);
      const e = new Date(t.due_date);
      if (!isNaN(s) && !isNaN(e)) {
        return Math.max(Math.ceil((e - s) / 86400000), 1);
      }
    }
    return Math.max(Math.ceil((t.estimated_hours || 8) / 8), 1);
  }

  const schedule = new Map();
  tasks.forEach(t => schedule.set(t.id, { ES: 0, EF: 0, LS: 0, LF: 0, slack: 0, duration: getDuration(t) }));

  // Topological sort
  const inDegree = new Map();
  tasks.forEach(t => inDegree.set(t.id, (predecessors.get(t.id) || []).length));
  const queue = [];
  tasks.forEach(t => { if (inDegree.get(t.id) === 0) queue.push(t.id); });
  const sorted = [];
  while (queue.length > 0) {
    const id = queue.shift();
    sorted.push(id);
    (successors.get(id) || []).forEach(succId => {
      inDegree.set(succId, inDegree.get(succId) - 1);
      if (inDegree.get(succId) === 0) queue.push(succId);
    });
  }

  if (sorted.length !== tasks.length) {
    return { criticalTaskIds: new Set(), projectEndDay: 0 };
  }

  // Forward pass
  sorted.forEach(id => {
    const s = schedule.get(id);
    const preds = predecessors.get(id) || [];
    if (preds.length > 0) {
      s.ES = Math.max(...preds.map(pid => schedule.get(pid).EF));
    }
    s.EF = s.ES + s.duration;
  });

  const projectEnd = Math.max(...sorted.map(id => schedule.get(id).EF), 0);

  // Backward pass
  for (let i = sorted.length - 1; i >= 0; i--) {
    const id = sorted[i];
    const s = schedule.get(id);
    const succs = successors.get(id) || [];
    s.LF = succs.length === 0 ? projectEnd : Math.min(...succs.map(sid => schedule.get(sid).LS));
    s.LS = s.LF - s.duration;
    s.slack = s.LS - s.ES;
  }

  const criticalTaskIds = new Set();
  sorted.forEach(id => {
    if (Math.abs(schedule.get(id).slack) < 0.5) criticalTaskIds.add(id);
  });

  return { criticalTaskIds, projectEndDay: projectEnd };
}

function getDependencyIds(task) {
  const ids = new Set();
  if (task.depends_on?.length) task.depends_on.forEach(id => ids.add(id));
  if (task.dependencies?.length) task.dependencies.forEach(d => { if (d.task_id) ids.add(d.task_id); });
  return [...ids];
}

function buildEmailBody(project, risks, critical, warnings) {
  const riskRows = risks.map(r => {
    const color = r.severity === 'critical' ? '#dc2626' : '#d97706';
    const badge = r.severity === 'critical' ? '🔴 CRITICAL' : '🟡 WARNING';
    return `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;">
          <span style="color:${color};font-weight:600;font-size:12px;">${badge}</span>
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;">
          <strong style="font-size:13px;">${r.title}</strong><br>
          <span style="color:#64748b;font-size:12px;">${r.detail || ''}</span>
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;color:#475569;font-size:12px;">
          ${r.impact || ''}
        </td>
      </tr>`;
  }).join('');

  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:680px;margin:0 auto;">
      <div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:24px 28px;border-radius:12px 12px 0 0;">
        <h1 style="color:#fff;font-size:20px;margin:0;">Risk Monitor Alert</h1>
        <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:6px 0 0;">Project: <strong>${project.title}</strong></p>
      </div>
      
      <div style="background:#fff;padding:24px 28px;border:1px solid #e2e8f0;border-top:none;">
        <div style="display:flex;gap:16px;margin-bottom:20px;">
          <div style="background:#fef2f2;padding:12px 16px;border-radius:8px;text-align:center;flex:1;">
            <div style="font-size:24px;font-weight:700;color:#dc2626;">${critical.length}</div>
            <div style="font-size:11px;color:#991b1b;text-transform:uppercase;">Critical</div>
          </div>
          <div style="background:#fffbeb;padding:12px 16px;border-radius:8px;text-align:center;flex:1;">
            <div style="font-size:24px;font-weight:700;color:#d97706;">${warnings.length}</div>
            <div style="font-size:11px;color:#92400e;text-transform:uppercase;">Warnings</div>
          </div>
          <div style="background:#f0fdf4;padding:12px 16px;border-radius:8px;text-align:center;flex:1;">
            <div style="font-size:24px;font-weight:700;color:#16a34a;">${risks.length}</div>
            <div style="font-size:11px;color:#166534;text-transform:uppercase;">Total Risks</div>
          </div>
        </div>

        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="background:#f8fafc;">
              <th style="padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;color:#64748b;width:100px;">Severity</th>
              <th style="padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;color:#64748b;">Risk</th>
              <th style="padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;color:#64748b;width:200px;">Impact</th>
            </tr>
          </thead>
          <tbody>
            ${riskRows}
          </tbody>
        </table>

        <div style="margin-top:20px;padding:12px 16px;background:#f8fafc;border-radius:8px;font-size:12px;color:#475569;">
          <strong>Recommended Actions:</strong>
          <ul style="margin:8px 0 0;padding-left:20px;">
            ${critical.length > 0 ? '<li>Immediately address blocked/delayed critical path tasks</li>' : ''}
            ${risks.some(r => r.type === 'capacity_bottleneck') ? '<li>Redistribute workload from overloaded team members</li>' : ''}
            ${risks.some(r => r.type === 'unassigned_critical') ? '<li>Assign owners to unassigned critical path tasks</li>' : ''}
            ${risks.some(r => r.type === 'missing_dependencies') ? '<li>Review and fix broken task dependencies</li>' : ''}
            <li>Review project timeline and adjust deadlines if needed</li>
          </ul>
        </div>
      </div>
      
      <div style="background:#f8fafc;padding:16px 28px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none;text-align:center;">
        <p style="font-size:11px;color:#94a3b8;margin:0;">Automated Risk Monitor · Runs every 6 hours</p>
      </div>
    </div>`;
}