/**
 * Budget Forecasting Utilities
 * Calculates burn rate, EAC, cost variance, and trend predictions.
 */

// Default hourly rate assumption when not specified
const DEFAULT_HOURLY_RATE = 75;

/**
 * Calculate forecast metrics for a single project.
 * @param {Object} project - Project entity record
 * @param {Array} tasks - ProjectTask records for this project
 * @param {Array} timeEntries - TaskTimeEntry records for this project
 * @returns {Object} Forecast metrics
 */
export function calculateProjectForecast(project, tasks, timeEntries) {
  const budget = project.budget || 0;
  const hourlyRate = DEFAULT_HOURLY_RATE;

  // Estimated hours from all tasks
  const totalEstimatedHours = tasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0);
  const estimatedCost = totalEstimatedHours * hourlyRate;

  // Actual hours from time entries
  const totalActualMinutes = timeEntries.reduce((sum, e) => sum + (e.duration_minutes || 0), 0);
  const totalActualHours = Math.round((totalActualMinutes / 60) * 100) / 100;
  const actualCost = totalActualHours * hourlyRate;

  // Task-based progress
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const taskProgress = totalTasks > 0 ? completedTasks / totalTasks : 0;

  // Hours variance (negative = over budget)
  const hoursVariance = totalEstimatedHours - totalActualHours;
  const costVariance = estimatedCost - actualCost;
  const costVariancePercent = estimatedCost > 0 ? (costVariance / estimatedCost) * 100 : 0;

  // Burn rate: actual hours per completed task
  const hoursPerTask = completedTasks > 0 ? totalActualHours / completedTasks : 0;
  const remainingTasks = totalTasks - completedTasks;

  // EAC (Estimate at Completion) based on burn rate
  const forecastedRemainingHours = hoursPerTask * remainingTasks;
  const forecastedTotalHours = totalActualHours + forecastedRemainingHours;
  const forecastedTotalCost = forecastedTotalHours * hourlyRate;

  // Budget health
  const budgetUtilization = budget > 0 ? (actualCost / budget) * 100 : 0;
  const forecastedBudgetUtil = budget > 0 ? (forecastedTotalCost / budget) * 100 : 0;

  // CPI (Cost Performance Index) — >1 is under budget
  const cpi = actualCost > 0 && taskProgress > 0
    ? (taskProgress * estimatedCost) / actualCost
    : 1;

  // SPI (Schedule Performance Index)
  const now = new Date();
  const startDate = project.start_date ? new Date(project.start_date) : new Date(project.created_date);
  const endDate = project.end_date ? new Date(project.end_date) : null;
  let scheduledProgress = 1;
  if (endDate && endDate > startDate) {
    const totalDuration = endDate - startDate;
    const elapsed = Math.min(now - startDate, totalDuration);
    scheduledProgress = Math.max(0, elapsed / totalDuration);
  }
  const spi = scheduledProgress > 0 ? taskProgress / scheduledProgress : 1;

  // Health status
  let health = 'on_track';
  if (forecastedBudgetUtil > 120 || cpi < 0.8) health = 'at_risk';
  if (forecastedBudgetUtil > 150 || cpi < 0.6) health = 'critical';

  return {
    budget,
    hourlyRate,
    totalEstimatedHours,
    totalActualHours,
    estimatedCost,
    actualCost,
    hoursVariance,
    costVariance,
    costVariancePercent,
    completedTasks,
    totalTasks,
    taskProgress,
    hoursPerTask,
    forecastedTotalHours,
    forecastedTotalCost,
    forecastedRemainingHours,
    budgetUtilization,
    forecastedBudgetUtil,
    cpi,
    spi,
    health,
  };
}

/**
 * Generate weekly burn data for charting.
 */
export function generateWeeklyBurnData(tasks, timeEntries) {
  if (timeEntries.length === 0 && tasks.length === 0) return [];

  // Find date range
  const allDates = [
    ...timeEntries.map(e => new Date(e.start_time || e.created_date)),
    ...tasks.filter(t => t.created_date).map(t => new Date(t.created_date)),
  ].filter(d => !isNaN(d));

  if (allDates.length === 0) return [];

  const minDate = new Date(Math.min(...allDates));
  const maxDate = new Date(Math.max(Date.now(), Math.max(...allDates)));

  // Generate weeks
  const weeks = [];
  const current = new Date(minDate);
  current.setDate(current.getDate() - current.getDay()); // Start on Sunday

  let cumActual = 0;
  let cumEstimated = 0;

  while (current <= maxDate) {
    const weekEnd = new Date(current);
    weekEnd.setDate(weekEnd.getDate() + 7);

    // Actual hours this week
    const weekActual = timeEntries
      .filter(e => {
        const d = new Date(e.start_time || e.created_date);
        return d >= current && d < weekEnd;
      })
      .reduce((sum, e) => sum + (e.duration_minutes || 0), 0) / 60;

    // Tasks created/scoped this week (estimated hours)
    const weekEstimated = tasks
      .filter(t => {
        const d = new Date(t.created_date);
        return d >= current && d < weekEnd;
      })
      .reduce((sum, t) => sum + (t.estimated_hours || 0), 0);

    cumActual += weekActual;
    cumEstimated += weekEstimated;

    weeks.push({
      week: `${current.getMonth() + 1}/${current.getDate()}`,
      weekStart: new Date(current),
      actual: Math.round(weekActual * 10) / 10,
      estimated: Math.round(weekEstimated * 10) / 10,
      cumActual: Math.round(cumActual * 10) / 10,
      cumEstimated: Math.round(cumEstimated * 10) / 10,
    });

    current.setDate(current.getDate() + 7);
  }

  return weeks;
}

/**
 * Calculate portfolio-level aggregates.
 */
export function calculatePortfolioSummary(projectForecasts) {
  const totals = {
    totalBudget: 0,
    totalEstimatedCost: 0,
    totalActualCost: 0,
    totalForecastedCost: 0,
    totalEstimatedHours: 0,
    totalActualHours: 0,
    projectCount: projectForecasts.length,
    atRiskCount: 0,
    criticalCount: 0,
    onTrackCount: 0,
  };

  for (const f of projectForecasts) {
    totals.totalBudget += f.budget;
    totals.totalEstimatedCost += f.estimatedCost;
    totals.totalActualCost += f.actualCost;
    totals.totalForecastedCost += f.forecastedTotalCost;
    totals.totalEstimatedHours += f.totalEstimatedHours;
    totals.totalActualHours += f.totalActualHours;
    if (f.health === 'critical') totals.criticalCount++;
    else if (f.health === 'at_risk') totals.atRiskCount++;
    else totals.onTrackCount++;
  }

  totals.totalCostVariance = totals.totalEstimatedCost - totals.totalActualCost;
  totals.avgCPI = projectForecasts.length > 0
    ? projectForecasts.reduce((s, f) => s + f.cpi, 0) / projectForecasts.length
    : 1;

  return totals;
}