import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Sprint Planner Engine
 * Analyzes historical velocity, task dependencies, and current workload
 * to generate a balanced weekly sprint schedule.
 * 
 * Algorithm:
 * 1. Calculate each member's historical velocity (hours completed / week)
 * 2. Determine current workload and burnout risk
 * 3. Topological sort tasks by dependencies
 * 4. Greedily assign tasks to members with lowest load, respecting deps
 * 5. Flag burnout risks (>35h/week or >3 consecutive heavy weeks)
 */

const MAX_HOURS_PER_WEEK = 40;
const BURNOUT_THRESHOLD = 35;
const DEFAULT_TASK_HOURS = 8;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { project_id, sprint_weeks = 2 } = await req.json();
    if (!project_id) return Response.json({ error: 'project_id required' }, { status: 400 });

    const [projects, allTasks, allTimeEntries, allProfiles] = await Promise.all([
      base44.asServiceRole.entities.Project.filter({ id: project_id }),
      base44.asServiceRole.entities.ProjectTask.filter({ project_id }, '-created_date', 1000),
      base44.asServiceRole.entities.TaskTimeEntry.filter({ project_id }, '-created_date', 5000),
      base44.asServiceRole.entities.UserProfile.list('-updated_date', 500),
    ]);

    const project = projects[0];
    if (!project) return Response.json({ error: 'Project not found' }, { status: 404 });

    const teamMemberIds = [...new Set([project.owner_id, ...(project.team_member_ids || [])])].filter(Boolean);
    if (teamMemberIds.length === 0) return Response.json({ sprint_plan: { weeks: [], members: [], warnings: ['No team members found'] } });

    // ---- 1. HISTORICAL VELOCITY per member ----
    const memberVelocity = {};
    const now = new Date();
    const fourWeeksAgo = new Date(now.getTime() - 28 * 86400000);

    for (const memberId of teamMemberIds) {
      const completedTasks = allTasks.filter(t =>
        t.assignee_id === memberId &&
        t.status === 'completed' &&
        t.completed_at &&
        new Date(t.completed_at) >= fourWeeksAgo
      );

      const recentTimeEntries = allTimeEntries.filter(e =>
        e.user_id === memberId &&
        new Date(e.start_time || e.created_date) >= fourWeeksAgo
      );

      const totalMinutesLogged = recentTimeEntries.reduce((s, e) => s + (e.duration_minutes || 0), 0);
      const hoursLogged = totalMinutesLogged / 60;

      // Weeks of data available (min 1 to avoid division by zero)
      const weeksOfData = Math.max(1, Math.min(4, Math.ceil((now - fourWeeksAgo) / (7 * 86400000))));

      const avgHoursPerWeek = hoursLogged / weeksOfData;
      const tasksCompletedPerWeek = completedTasks.length / weeksOfData;
      const avgHoursPerTask = completedTasks.length > 0
        ? completedTasks.reduce((s, t) => s + (t.estimated_hours || DEFAULT_TASK_HOURS), 0) / completedTasks.length
        : DEFAULT_TASK_HOURS;

      // Current active load
      const activeTasks = allTasks.filter(t =>
        t.assignee_id === memberId && (t.status === 'in_progress' || t.status === 'todo')
      );
      const activeHours = activeTasks.reduce((s, t) => s + (t.estimated_hours || DEFAULT_TASK_HOURS), 0);

      const profile = allProfiles.find(p => p.user_id === memberId);

      memberVelocity[memberId] = {
        memberId,
        displayName: profile?.display_name || memberId.split('@')[0],
        avatarUrl: profile?.avatar_url || null,
        avgHoursPerWeek: Math.round(avgHoursPerWeek * 10) / 10,
        tasksCompletedPerWeek: Math.round(tasksCompletedPerWeek * 10) / 10,
        avgHoursPerTask: Math.round(avgHoursPerTask * 10) / 10,
        currentActiveHours: activeHours,
        currentActiveTaskCount: activeTasks.length,
        // Capacity = max hours minus current active load spread over sprint
        weeklyCapacity: MAX_HOURS_PER_WEEK,
      };
    }

    // ---- 2. GET ASSIGNABLE TASKS (todo + unblocked) ----
    const completedIds = new Set(allTasks.filter(t => t.status === 'completed').map(t => t.id));

    // Check if dependencies are met
    function depsReady(task) {
      const deps = task.dependencies || [];
      const legacyDeps = task.depends_on || [];
      const allDepIds = [...deps.map(d => d.task_id), ...legacyDeps];
      return allDepIds.every(depId => completedIds.has(depId));
    }

    // Topological sort - tasks with no unresolved deps first, then by priority
    const priorityWeight = { urgent: 0, high: 1, medium: 2, low: 3 };
    const assignableTasks = allTasks
      .filter(t => (t.status === 'todo' || t.status === 'blocked') && depsReady(t))
      .sort((a, b) => {
        const pa = priorityWeight[a.priority] ?? 2;
        const pb = priorityWeight[b.priority] ?? 2;
        if (pa !== pb) return pa - pb;
        // Earlier due date first
        if (a.due_date && b.due_date) return new Date(a.due_date) - new Date(b.due_date);
        if (a.due_date) return -1;
        if (b.due_date) return 1;
        return 0;
      });

    // Also include in_progress tasks (already assigned) for workload tracking
    const inProgressTasks = allTasks.filter(t => t.status === 'in_progress');

    // ---- 3. GENERATE SPRINT PLAN ----
    const weeklyAllocations = {}; // memberId -> [week0Hours, week1Hours, ...]
    for (const memberId of teamMemberIds) {
      weeklyAllocations[memberId] = new Array(sprint_weeks).fill(0);
    }

    // Pre-load in-progress tasks into week 0
    for (const task of inProgressTasks) {
      if (task.assignee_id && weeklyAllocations[task.assignee_id]) {
        const hours = task.estimated_hours || DEFAULT_TASK_HOURS;
        // Spread remaining work across first week
        weeklyAllocations[task.assignee_id][0] += Math.min(hours, MAX_HOURS_PER_WEEK);
      }
    }

    const assignments = []; // { taskId, memberId, week, hours, reason }

    for (const task of assignableTasks) {
      const taskHours = task.estimated_hours || DEFAULT_TASK_HOURS;

      // If already assigned, keep the assignment but place in optimal week
      if (task.assignee_id && weeklyAllocations[task.assignee_id]) {
        // Find week with lowest load for this member
        let bestWeek = 0;
        let minLoad = Infinity;
        for (let w = 0; w < sprint_weeks; w++) {
          if (weeklyAllocations[task.assignee_id][w] + taskHours <= MAX_HOURS_PER_WEEK &&
              weeklyAllocations[task.assignee_id][w] < minLoad) {
            minLoad = weeklyAllocations[task.assignee_id][w];
            bestWeek = w;
          }
        }
        weeklyAllocations[task.assignee_id][bestWeek] += taskHours;
        assignments.push({
          taskId: task.id,
          taskTitle: task.title,
          taskPriority: task.priority,
          taskDueDate: task.due_date,
          memberId: task.assignee_id,
          memberName: memberVelocity[task.assignee_id]?.displayName || task.assignee_name,
          memberAvatar: memberVelocity[task.assignee_id]?.avatarUrl || task.assignee_avatar,
          week: bestWeek,
          hours: taskHours,
          isReassignment: false,
          reason: 'Existing assignment, scheduled to optimal week',
        });
        continue;
      }

      // Find best member: lowest total allocated hours across sprint
      let bestMember = null;
      let bestWeek = 0;
      let bestScore = Infinity;

      for (const memberId of teamMemberIds) {
        for (let w = 0; w < sprint_weeks; w++) {
          const weekLoad = weeklyAllocations[memberId][w];
          if (weekLoad + taskHours > MAX_HOURS_PER_WEEK) continue;

          // Score: prefer members with lower total allocation + historical velocity match
          const totalLoad = weeklyAllocations[memberId].reduce((a, b) => a + b, 0);
          const velocity = memberVelocity[memberId];
          const velocityBonus = velocity.avgHoursPerWeek > 0 ? (velocity.avgHoursPerWeek / MAX_HOURS_PER_WEEK) * 5 : 0;
          const score = totalLoad - velocityBonus + w * 2; // slight preference for earlier weeks

          if (score < bestScore) {
            bestScore = score;
            bestMember = memberId;
            bestWeek = w;
          }
        }
      }

      if (bestMember) {
        weeklyAllocations[bestMember][bestWeek] += taskHours;
        const vel = memberVelocity[bestMember];
        const totalAfter = weeklyAllocations[bestMember].reduce((a, b) => a + b, 0);

        let reason = `Lowest workload (${totalAfter.toFixed(0)}h total)`;
        if (vel.avgHoursPerWeek > 20) reason += `, strong velocity (${vel.avgHoursPerWeek}h/wk avg)`;

        assignments.push({
          taskId: task.id,
          taskTitle: task.title,
          taskPriority: task.priority,
          taskDueDate: task.due_date,
          memberId: bestMember,
          memberName: vel.displayName,
          memberAvatar: vel.avatarUrl,
          week: bestWeek,
          hours: taskHours,
          isReassignment: true,
          reason,
        });
      }
    }

    // ---- 4. BURNOUT DETECTION ----
    const warnings = [];
    const memberSummaries = teamMemberIds.map(memberId => {
      const vel = memberVelocity[memberId];
      const weeklyHours = weeklyAllocations[memberId];
      const totalHours = weeklyHours.reduce((a, b) => a + b, 0);
      const peakWeek = Math.max(...weeklyHours);
      const memberAssignments = assignments.filter(a => a.memberId === memberId);

      let burnoutRisk = 'low';
      if (peakWeek >= BURNOUT_THRESHOLD) burnoutRisk = 'medium';
      if (peakWeek >= MAX_HOURS_PER_WEEK || weeklyHours.filter(h => h >= BURNOUT_THRESHOLD).length >= 2) burnoutRisk = 'high';

      if (burnoutRisk === 'high') {
        warnings.push(`${vel.displayName} has high burnout risk (${peakWeek.toFixed(0)}h peak week)`);
      }

      return {
        memberId,
        displayName: vel.displayName,
        avatarUrl: vel.avatarUrl,
        weeklyHours,
        totalHours: Math.round(totalHours * 10) / 10,
        peakWeek: Math.round(peakWeek * 10) / 10,
        taskCount: memberAssignments.length,
        burnoutRisk,
        velocity: vel,
      };
    });

    // ---- 5. STRUCTURE WEEKS ----
    const sprintStart = new Date();
    sprintStart.setDate(sprintStart.getDate() - sprintStart.getDay() + 1); // Next Monday

    const weeks = [];
    for (let w = 0; w < sprint_weeks; w++) {
      const weekStart = new Date(sprintStart.getTime() + w * 7 * 86400000);
      const weekEnd = new Date(weekStart.getTime() + 4 * 86400000); // Friday
      const weekAssignments = assignments.filter(a => a.week === w);
      const totalHours = weekAssignments.reduce((s, a) => s + a.hours, 0);

      weeks.push({
        weekIndex: w,
        label: `Week ${w + 1}`,
        startDate: weekStart.toISOString().split('T')[0],
        endDate: weekEnd.toISOString().split('T')[0],
        assignments: weekAssignments,
        totalHours: Math.round(totalHours * 10) / 10,
        taskCount: weekAssignments.length,
      });
    }

    // Unassignable tasks (no capacity)
    const assignedTaskIds = new Set(assignments.map(a => a.taskId));
    const overflow = assignableTasks
      .filter(t => !assignedTaskIds.has(t.id))
      .map(t => ({ taskId: t.id, title: t.title, hours: t.estimated_hours || DEFAULT_TASK_HOURS, priority: t.priority }));

    if (overflow.length > 0) {
      warnings.push(`${overflow.length} task(s) couldn't fit in the sprint — consider extending or adding team members`);
    }

    return Response.json({
      sprint_plan: {
        projectTitle: project.title,
        sprintWeeks: sprint_weeks,
        weeks,
        members: memberSummaries,
        warnings,
        overflow,
        totalAssigned: assignments.length,
        totalHoursPlanned: Math.round(assignments.reduce((s, a) => s + a.hours, 0) * 10) / 10,
      }
    });
  } catch (error) {
    console.error('Sprint plan error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});