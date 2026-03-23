import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Daily Slippage Monitor
 * 
 * Scans all active projects for:
 * 1. Task completion velocity trends (rolling 14-day window)
 * 2. Dependency delays (blocked/overdue predecessor chains)
 * 3. Projected end-date slip vs planned end date
 * 
 * Sends summary notification + email when projected slip exceeds
 * the per-project slippage_threshold_days (default: 5).
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const results = { projectsScanned: 0, alertsSent: 0, skipped: 0, details: [] };

    // Batch-fetch all data upfront
    const [projects, allTasks, allConfigs, profiles] = await Promise.all([
      base44.asServiceRole.entities.Project.filter({}, '-updated_date', 500),
      base44.asServiceRole.entities.ProjectTask.list('-created_date', 5000),
      base44.asServiceRole.entities.ProjectAlertConfig.list('-created_date', 500),
      base44.asServiceRole.entities.UserProfile.list('-updated_date', 500),
    ]);

    const activeProjects = projects.filter(p =>
      ['in_progress', 'planned', 'funded', 'approved'].includes(p.project_status || p.status)
    );

    for (const project of activeProjects) {
      results.projectsScanned++;

      const config = allConfigs.find(c => c.project_id === project.id);
      if (config && !config.is_enabled) { results.skipped++; continue; }

      const slippageThreshold = config?.slippage_threshold_days ?? 5;
      const tasks = allTasks.filter(t => t.project_id === project.id);
      if (tasks.length < 2) continue;

      // ─── 1. Completion Velocity Trend ─────────────────────
      const velocity = computeVelocityTrend(tasks, now);

      // ─── 2. Dependency Delay Analysis ─────────────────────
      const depDelays = computeDependencyDelays(tasks, now);

      // ─── 3. Critical Path & Projected End Date ────────────
      const cpResult = computeCriticalPath(tasks);
      const projectedSlip = computeProjectedSlip(project, tasks, cpResult, velocity, now);

      // ─── 4. Determine if alert is needed ──────────────────
      const shouldAlert = projectedSlip.slipDays >= slippageThreshold
        || depDelays.criticalChainDelays > 0
        || velocity.trendDirection === 'declining' && velocity.projectedWeeksToComplete > 8;

      if (!shouldAlert) continue;

      // ─── 5. Deduplicate (one alert per project per day) ───
      const existing = await base44.asServiceRole.entities.Notification.filter({
        type: 'project',
        'metadata.slippage_monitor_date': todayStr,
        'metadata.project_id': project.id,
      }, '-created_date', 1);

      if (existing.length > 0) { results.skipped++; continue; }

      // ─── 6. Build Summary ─────────────────────────────────
      const severity = projectedSlip.slipDays >= slippageThreshold * 2
        || depDelays.criticalChainDelays >= 3
        ? 'critical' : 'warning';

      const lines = [];
      if (projectedSlip.slipDays > 0) {
        lines.push(`📅 End date projected to slip by ${projectedSlip.slipDays} days (planned: ${project.end_date || 'unset'}, projected: ${projectedSlip.projectedEndStr})`);
      }
      if (velocity.trendDirection === 'declining') {
        lines.push(`📉 Completion velocity declining: ${velocity.recentRate.toFixed(1)} tasks/week (was ${velocity.priorRate.toFixed(1)})`);
      }
      if (depDelays.criticalChainDelays > 0) {
        lines.push(`🔗 ${depDelays.criticalChainDelays} dependency chain(s) causing cascading delays (max ${depDelays.maxCascadeDays}d)`);
      }
      if (depDelays.blockedByOverdue > 0) {
        lines.push(`🚧 ${depDelays.blockedByOverdue} task(s) waiting on overdue predecessors`);
      }
      if (velocity.remainingTasks > 0) {
        lines.push(`⏳ ${velocity.remainingTasks} tasks remaining · Est. ${velocity.projectedWeeksToComplete.toFixed(1)} weeks at current pace`);
      }

      const notifTitle = severity === 'critical'
        ? `🚨 "${project.title}" – ${projectedSlip.slipDays}d schedule slip detected`
        : `⚠️ "${project.title}" – Potential ${projectedSlip.slipDays}d delay`;

      const notifMessage = lines.join('\n');

      // ─── 7. Identify recipients ───────────────────────────
      const recipientIds = new Set();
      if (project.owner_id) recipientIds.add(project.owner_id);

      // Notify all team members for critical slips
      if (severity === 'critical' || (config?.notify_team_members)) {
        (project.team_member_ids || []).forEach(id => recipientIds.add(id));
      }

      // Notify assignees of delayed dependency chains
      depDelays.affectedAssignees.forEach(id => recipientIds.add(id));

      // ─── 8. Send notifications ────────────────────────────
      for (const userId of recipientIds) {
        await base44.asServiceRole.entities.Notification.create({
          user_id: userId,
          type: 'project',
          title: notifTitle,
          message: notifMessage,
          priority: severity === 'critical' ? 'urgent' : 'high',
          action_url: `/ProjectTrack?project=${project.id}`,
          action_label: 'View Project',
          metadata: {
            project_id: project.id,
            slippage_monitor_date: todayStr,
            slip_days: projectedSlip.slipDays,
            velocity_trend: velocity.trendDirection,
            severity,
          },
        });
        results.alertsSent++;
      }

      // ─── 9. Email to owner for critical alerts ────────────
      if (severity === 'critical' && project.owner_id) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: project.owner_id,
          subject: `🚨 Schedule Alert: "${project.title}" projected to slip ${projectedSlip.slipDays} days`,
          body: buildSlippageEmail(project, projectedSlip, velocity, depDelays, lines),
        });
      }

      results.details.push({
        project: project.title,
        slipDays: projectedSlip.slipDays,
        velocityTrend: velocity.trendDirection,
        depChainDelays: depDelays.criticalChainDelays,
        severity,
        recipients: [...recipientIds],
      });
    }

    return Response.json({ success: true, ...results });
  } catch (error) {
    console.error('Slippage monitor error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});


// ═══════════════════════════════════════════════════════
// VELOCITY TREND — rolling 14-day window vs prior 14-day
// ═══════════════════════════════════════════════════════
function computeVelocityTrend(tasks, now) {
  const day = 86400000;
  const recentWindowStart = new Date(now.getTime() - 14 * day);
  const priorWindowStart = new Date(now.getTime() - 28 * day);

  const completedTasks = tasks.filter(t => t.status === 'completed' && t.completed_at);
  const recentCompleted = completedTasks.filter(t => {
    const d = new Date(t.completed_at);
    return d >= recentWindowStart && d <= now;
  });
  const priorCompleted = completedTasks.filter(t => {
    const d = new Date(t.completed_at);
    return d >= priorWindowStart && d < recentWindowStart;
  });

  const recentRate = recentCompleted.length / 2; // per week
  const priorRate = priorCompleted.length / 2;

  const remainingTasks = tasks.filter(t => t.status !== 'completed').length;
  const effectiveRate = Math.max(recentRate, 0.5); // floor to avoid division by 0
  const projectedWeeksToComplete = remainingTasks / effectiveRate;

  let trendDirection = 'stable';
  if (priorRate > 0 && recentRate < priorRate * 0.7) trendDirection = 'declining';
  else if (priorRate > 0 && recentRate > priorRate * 1.3) trendDirection = 'improving';

  return { recentRate, priorRate, remainingTasks, projectedWeeksToComplete, trendDirection };
}


// ═══════════════════════════════════════════════════════
// DEPENDENCY DELAY ANALYSIS
// ═══════════════════════════════════════════════════════
function computeDependencyDelays(tasks, now) {
  const taskMap = new Map();
  tasks.forEach(t => taskMap.set(t.id, t));

  let criticalChainDelays = 0;
  let blockedByOverdue = 0;
  let maxCascadeDays = 0;
  const affectedAssignees = new Set();

  for (const task of tasks) {
    if (task.status === 'completed') continue;
    const depIds = getDependencyIds(task);
    if (depIds.length === 0) continue;

    let worstPredDelay = 0;
    let hasOverduePred = false;

    for (const depId of depIds) {
      const pred = taskMap.get(depId);
      if (!pred || pred.status === 'completed') continue;

      // Predecessor is not done — check if it's overdue
      if (pred.due_date && new Date(pred.due_date) < now) {
        hasOverduePred = true;
        const predDelayDays = Math.ceil((now - new Date(pred.due_date)) / 86400000);
        worstPredDelay = Math.max(worstPredDelay, predDelayDays);
      }
    }

    if (hasOverduePred) {
      blockedByOverdue++;
      if (task.assignee_id) affectedAssignees.add(task.assignee_id);
    }

    if (worstPredDelay > 0) {
      // Check if this task also has successors — cascading delay
      const hasSuccessors = tasks.some(t => {
        const ids = getDependencyIds(t);
        return ids.includes(task.id);
      });
      if (hasSuccessors) {
        criticalChainDelays++;
        maxCascadeDays = Math.max(maxCascadeDays, worstPredDelay);
      }
    }
  }

  return { criticalChainDelays, blockedByOverdue, maxCascadeDays, affectedAssignees: [...affectedAssignees] };
}


// ═══════════════════════════════════════════════════════
// CRITICAL PATH (server-side, lightweight)
// ═══════════════════════════════════════════════════════
function computeCriticalPath(tasks) {
  const taskMap = new Map();
  tasks.forEach(t => taskMap.set(t.id, t));

  const successors = new Map();
  const predecessors = new Map();
  tasks.forEach(t => {
    successors.set(t.id, []);
    predecessors.set(t.id, []);
  });

  tasks.forEach(t => {
    getDependencyIds(t).forEach(predId => {
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
      if (!isNaN(s) && !isNaN(e)) return Math.max(Math.ceil((e - s) / 86400000), 1);
    }
    return Math.max(Math.ceil((t.estimated_hours || 8) / 8), 1);
  }

  const schedule = new Map();
  tasks.forEach(t => schedule.set(t.id, { ES: 0, EF: 0, duration: getDuration(t) }));

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
    return { projectEndDay: 0, criticalTaskIds: new Set() };
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

  const projectEndDay = Math.max(...sorted.map(id => schedule.get(id).EF), 0);

  // Backward pass for slack
  sorted.forEach(id => { const s = schedule.get(id); s.LF = projectEndDay; s.LS = s.LF; });
  for (let i = sorted.length - 1; i >= 0; i--) {
    const id = sorted[i];
    const s = schedule.get(id);
    const succs = successors.get(id) || [];
    s.LF = succs.length === 0 ? projectEndDay : Math.min(...succs.map(sid => schedule.get(sid).LS));
    s.LS = s.LF - s.duration;
    s.slack = s.LS - s.ES;
  }

  const criticalTaskIds = new Set();
  sorted.forEach(id => {
    if (Math.abs(schedule.get(id).slack) < 0.5) criticalTaskIds.add(id);
  });

  return { projectEndDay, criticalTaskIds };
}


// ═══════════════════════════════════════════════════════
// PROJECTED SLIP CALCULATION
// ═══════════════════════════════════════════════════════
function computeProjectedSlip(project, tasks, cpResult, velocity, now) {
  if (!project.end_date) {
    // No planned end date — estimate based on velocity
    const weeksOut = velocity.projectedWeeksToComplete;
    const projectedEnd = new Date(now.getTime() + weeksOut * 7 * 86400000);
    return { slipDays: 0, projectedEndStr: projectedEnd.toISOString().split('T')[0], method: 'no_end_date' };
  }

  const plannedEnd = new Date(project.end_date);

  // Method A: Critical path projection
  // Find earliest incomplete task start date as anchor
  const incompleteTasks = tasks.filter(t => t.status !== 'completed');
  let anchor = now;
  for (const t of incompleteTasks) {
    if (t.start_date) {
      const s = new Date(t.start_date);
      if (s < anchor) anchor = s;
    }
  }
  const cpProjectedEnd = new Date(anchor.getTime() + cpResult.projectEndDay * 86400000);

  // Method B: Velocity-based projection
  const velProjectedEnd = new Date(now.getTime() + velocity.projectedWeeksToComplete * 7 * 86400000);

  // Use the worse (later) of the two projections
  const projectedEnd = cpProjectedEnd > velProjectedEnd ? cpProjectedEnd : velProjectedEnd;
  const slipDays = Math.max(0, Math.ceil((projectedEnd - plannedEnd) / 86400000));

  return {
    slipDays,
    projectedEndStr: projectedEnd.toISOString().split('T')[0],
    plannedEndStr: project.end_date,
    method: cpProjectedEnd > velProjectedEnd ? 'critical_path' : 'velocity',
  };
}


// ═══════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════
function getDependencyIds(task) {
  const ids = new Set();
  if (task.depends_on?.length) task.depends_on.forEach(id => ids.add(id));
  if (task.dependencies?.length) task.dependencies.forEach(d => { if (d.task_id) ids.add(d.task_id); });
  return [...ids];
}

function buildSlippageEmail(project, slip, velocity, depDelays, summaryLines) {
  const rows = summaryLines.map(line => {
    const isRed = line.startsWith('🚨') || line.startsWith('📅') || line.includes('declining');
    return `<tr><td style="padding:10px 14px;border-bottom:1px solid #f1f5f9;color:${isRed ? '#dc2626' : '#475569'};font-size:13px;">${line}</td></tr>`;
  }).join('');

  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:640px;margin:0 auto;">
      <div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:24px 28px;border-radius:12px 12px 0 0;">
        <h1 style="color:#fff;font-size:20px;margin:0;">📊 Daily Slippage Report</h1>
        <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:6px 0 0;">Project: <strong>${project.title}</strong></p>
      </div>
      
      <div style="background:#fff;padding:24px 28px;border:1px solid #e2e8f0;border-top:none;">
        <div style="display:flex;gap:12px;margin-bottom:20px;">
          <div style="background:#fef2f2;padding:14px;border-radius:8px;text-align:center;flex:1;">
            <div style="font-size:28px;font-weight:700;color:#dc2626;">${slip.slipDays}d</div>
            <div style="font-size:11px;color:#991b1b;text-transform:uppercase;">Projected Slip</div>
          </div>
          <div style="background:${velocity.trendDirection === 'declining' ? '#fffbeb' : '#f0fdf4'};padding:14px;border-radius:8px;text-align:center;flex:1;">
            <div style="font-size:28px;font-weight:700;color:${velocity.trendDirection === 'declining' ? '#d97706' : '#16a34a'};">${velocity.recentRate.toFixed(1)}</div>
            <div style="font-size:11px;color:#475569;text-transform:uppercase;">Tasks/Week</div>
          </div>
          <div style="background:#f0f9ff;padding:14px;border-radius:8px;text-align:center;flex:1;">
            <div style="font-size:28px;font-weight:700;color:#2563eb;">${velocity.remainingTasks}</div>
            <div style="font-size:11px;color:#1e40af;text-transform:uppercase;">Remaining</div>
          </div>
        </div>

        <table style="width:100%;border-collapse:collapse;">
          <thead><tr style="background:#f8fafc;">
            <th style="padding:10px 14px;text-align:left;font-size:11px;text-transform:uppercase;color:#64748b;">Finding</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>

        <div style="margin-top:20px;padding:14px;background:#f8fafc;border-radius:8px;font-size:12px;color:#475569;">
          <strong>Timeline:</strong> Planned end ${slip.plannedEndStr || 'unset'} → Projected ${slip.projectedEndStr} (${slip.method === 'critical_path' ? 'based on critical path' : 'based on velocity trend'})
        </div>
      </div>
      
      <div style="background:#f8fafc;padding:14px 28px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none;text-align:center;">
        <p style="font-size:11px;color:#94a3b8;margin:0;">Daily Slippage Monitor · Automated scan at 8:00 AM</p>
      </div>
    </div>`;
}