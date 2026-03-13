import { parseISO, isValid, addDays, differenceInDays } from 'date-fns';

/**
 * Compute critical path using forward/backward pass.
 * Returns { criticalTaskIds: Set, taskSchedule: Map<id, {ES, EF, LS, LF, slack}> }
 */
export function computeCriticalPath(tasks) {
  const taskMap = new Map();
  tasks.forEach(t => taskMap.set(t.id, t));

  // Build adjacency: task -> its successors
  const successors = new Map(); // predecessorId -> [successorId]
  const predecessors = new Map(); // successorId -> [predecessorId]
  tasks.forEach(t => {
    successors.set(t.id, []);
    predecessors.set(t.id, []);
  });

  tasks.forEach(t => {
    const deps = getDependencyIds(t);
    deps.forEach(predId => {
      if (taskMap.has(predId)) {
        if (!successors.has(predId)) successors.set(predId, []);
        successors.get(predId).push(t.id);
        if (!predecessors.has(t.id)) predecessors.set(t.id, []);
        predecessors.get(t.id).push(predId);
      }
    });
  });

  // Duration in days
  function getDuration(t) {
    if (t.start_date && t.due_date) {
      const s = parseISO(t.start_date);
      const e = parseISO(t.due_date);
      if (isValid(s) && isValid(e)) {
        return Math.max(differenceInDays(e, s), 1);
      }
    }
    // Fallback: estimated_hours / 8 hours per day, minimum 1
    return Math.max(Math.ceil((t.estimated_hours || 8) / 8), 1);
  }

  // Forward pass: compute ES, EF
  const schedule = new Map();
  tasks.forEach(t => schedule.set(t.id, { ES: 0, EF: 0, LS: 0, LF: 0, slack: 0, duration: getDuration(t) }));

  // Topological sort (Kahn's algorithm)
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

  // If we couldn't sort all (cycle), just return empty
  if (sorted.length !== tasks.length) {
    return { criticalTaskIds: new Set(), taskSchedule: schedule };
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

  // Project end = max EF
  const projectEnd = Math.max(...sorted.map(id => schedule.get(id).EF), 0);

  // Backward pass
  for (let i = sorted.length - 1; i >= 0; i--) {
    const id = sorted[i];
    const s = schedule.get(id);
    const succs = successors.get(id) || [];
    if (succs.length === 0) {
      s.LF = projectEnd;
    } else {
      s.LF = Math.min(...succs.map(sid => schedule.get(sid).LS));
    }
    s.LS = s.LF - s.duration;
    s.slack = s.LS - s.ES;
  }

  // Critical path = tasks with 0 slack
  const criticalTaskIds = new Set();
  sorted.forEach(id => {
    if (Math.abs(schedule.get(id).slack) < 0.5) {
      criticalTaskIds.add(id);
    }
  });

  return { criticalTaskIds, taskSchedule: schedule, projectEnd };
}

/**
 * Propagate a date change through the dependency graph.
 * Returns array of { taskId, newStartDate, newDueDate } updates.
 */
export function propagateDateChange(tasks, changedTaskId, newStartDate) {
  const taskMap = new Map();
  tasks.forEach(t => taskMap.set(t.id, { ...t }));

  const changed = taskMap.get(changedTaskId);
  if (!changed) return [];

  const oldStart = changed.start_date ? parseISO(changed.start_date) : null;
  const oldDue = changed.due_date ? parseISO(changed.due_date) : null;
  const duration = oldStart && oldDue && isValid(oldStart) && isValid(oldDue)
    ? differenceInDays(oldDue, oldStart)
    : Math.max(Math.ceil((changed.estimated_hours || 8) / 8), 1);

  const newStart = parseISO(newStartDate);
  if (!isValid(newStart)) return [];
  const newDue = addDays(newStart, duration);

  const updates = [{ taskId: changedTaskId, newStartDate: formatDate(newStart), newDueDate: formatDate(newDue) }];
  taskMap.set(changedTaskId, { ...changed, start_date: formatDate(newStart), due_date: formatDate(newDue) });

  // BFS through successors
  const successors = new Map();
  tasks.forEach(t => {
    const deps = getDependencyIds(t);
    deps.forEach(predId => {
      if (!successors.has(predId)) successors.set(predId, []);
      successors.get(predId).push(t.id);
    });
  });

  const visited = new Set([changedTaskId]);
  const queue = [...(successors.get(changedTaskId) || [])];

  while (queue.length > 0) {
    const id = queue.shift();
    if (visited.has(id)) continue;
    visited.add(id);

    const task = taskMap.get(id);
    if (!task) continue;

    const preds = getDependencyIds(task);
    let maxPredEnd = 0;
    preds.forEach(pid => {
      const p = taskMap.get(pid);
      if (p?.due_date) {
        const pd = parseISO(p.due_date);
        if (isValid(pd)) {
          const days = differenceInDays(pd, new Date(0));
          if (days > maxPredEnd) maxPredEnd = days;
        }
      }
    });

    if (maxPredEnd > 0) {
      const predEndDate = addDays(new Date(0), maxPredEnd);
      const tStart = addDays(predEndDate, 1); // start day after predecessor ends
      const tOldStart = task.start_date ? parseISO(task.start_date) : null;
      const tOldDue = task.due_date ? parseISO(task.due_date) : null;
      const tDuration = tOldStart && tOldDue && isValid(tOldStart) && isValid(tOldDue)
        ? differenceInDays(tOldDue, tOldStart)
        : Math.max(Math.ceil((task.estimated_hours || 8) / 8), 1);

      // Only push forward, never pull back
      if (!tOldStart || !isValid(tOldStart) || tStart > tOldStart) {
        const tDue = addDays(tStart, tDuration);
        updates.push({ taskId: id, newStartDate: formatDate(tStart), newDueDate: formatDate(tDue) });
        taskMap.set(id, { ...task, start_date: formatDate(tStart), due_date: formatDate(tDue) });
      }
    }

    (successors.get(id) || []).forEach(sid => {
      if (!visited.has(sid)) queue.push(sid);
    });
  }

  return updates;
}

function getDependencyIds(task) {
  const ids = new Set();
  if (task.depends_on?.length) task.depends_on.forEach(id => ids.add(id));
  if (task.dependencies?.length) task.dependencies.forEach(d => { if (d.task_id) ids.add(d.task_id); });
  return [...ids];
}

function formatDate(d) {
  return d.toISOString().split('T')[0];
}

export { getDependencyIds };