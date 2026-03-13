import { addDays, addWeeks, startOfWeek, endOfWeek, differenceInDays, parseISO, isValid, format, isWithinInterval } from 'date-fns';

const HOURS_PER_WEEK = 40;

export function getQuarterWeeks(startDate) {
  const weeks = [];
  let current = startOfWeek(startDate, { weekStartsOn: 1 });
  for (let i = 0; i < 13; i++) {
    weeks.push({
      start: current,
      end: endOfWeek(current, { weekStartsOn: 1 }),
      label: format(current, 'MMM d'),
      weekNum: i,
    });
    current = addWeeks(current, 1);
  }
  return weeks;
}

export function computeMemberCapacity(memberId, tasks, weeks) {
  const memberTasks = tasks.filter(t => t.assignee_id === memberId && t.status !== 'completed');
  const weeklyLoad = weeks.map(week => {
    let hours = 0;
    memberTasks.forEach(task => {
      const tStart = task.start_date ? parseISO(task.start_date) : null;
      const tEnd = task.due_date ? parseISO(task.due_date) : null;
      if (!tStart || !tEnd || !isValid(tStart) || !isValid(tEnd)) {
        // No dates: assume 1-week task starting now, spread evenly
        if (differenceInDays(week.end, new Date()) >= 0 && differenceInDays(new Date(), week.start) >= -7) {
          hours += (task.estimated_hours || 8) / 1;
        }
        return;
      }
      // Check overlap between task duration and this week
      const overlapStart = tStart > week.start ? tStart : week.start;
      const overlapEnd = tEnd < week.end ? tEnd : week.end;
      const overlapDays = differenceInDays(overlapEnd, overlapStart) + 1;
      if (overlapDays <= 0) return;
      const totalDays = Math.max(differenceInDays(tEnd, tStart) + 1, 1);
      const weekDays = Math.min(overlapDays, 5); // cap at 5 working days
      const taskHours = task.estimated_hours || 8;
      hours += (taskHours / totalDays) * weekDays;
    });
    return Math.round(hours * 10) / 10;
  });

  const totalAllocated = weeklyLoad.reduce((a, b) => a + b, 0);
  const totalCapacity = weeks.length * HOURS_PER_WEEK;
  const utilization = totalCapacity > 0 ? Math.round((totalAllocated / totalCapacity) * 100) : 0;
  const peakWeek = Math.max(...weeklyLoad);

  return { memberId, weeklyLoad, totalAllocated, totalCapacity, utilization, peakWeek, taskCount: memberTasks.length };
}

export function computeOrgCapacity(members, weeks) {
  const weeklyDemand = weeks.map((_, wi) =>
    members.reduce((sum, m) => sum + m.weeklyLoad[wi], 0)
  );
  const weeklySupply = weeks.map(() => members.length * HOURS_PER_WEEK);
  const weeklyGap = weeks.map((_, wi) => weeklySupply[wi] - weeklyDemand[wi]);
  const totalDemand = weeklyDemand.reduce((a, b) => a + b, 0);
  const totalSupply = weeklySupply.reduce((a, b) => a + b, 0);
  const avgUtilization = totalSupply > 0 ? Math.round((totalDemand / totalSupply) * 100) : 0;

  // Hiring needs: weeks where demand > supply
  const shortageWeeks = weeklyGap.filter(g => g < 0).length;
  const maxShortage = Math.min(...weeklyGap);
  const additionalHeadcount = maxShortage < 0 ? Math.ceil(Math.abs(maxShortage) / HOURS_PER_WEEK) : 0;

  return { weeklyDemand, weeklySupply, weeklyGap, totalDemand, totalSupply, avgUtilization, shortageWeeks, maxShortage, additionalHeadcount };
}

export const HOURS_PER_WEEK_CONST = HOURS_PER_WEEK;