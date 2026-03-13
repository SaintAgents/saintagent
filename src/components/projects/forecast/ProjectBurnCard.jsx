import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Clock, DollarSign, AlertTriangle, CheckCircle2 } from 'lucide-react';
import BurnRateChart from './BurnRateChart';

function MetricPill({ label, value, sub, color }) {
  return (
    <div className="text-center px-2">
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      <div className="text-[10px] text-slate-400 leading-tight">{label}</div>
      {sub && <div className="text-[9px] text-slate-300">{sub}</div>}
    </div>
  );
}

const healthConfig = {
  on_track: { label: 'On Track', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  at_risk: { label: 'At Risk', color: 'bg-amber-100 text-amber-700', icon: AlertTriangle },
  critical: { label: 'Critical', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
};

export default function ProjectBurnCard({ project, forecast, weeklyData }) {
  const [expanded, setExpanded] = useState(false);
  const hc = healthConfig[forecast.health] || healthConfig.on_track;
  const Icon = hc.icon;

  const fmtK = (v) => v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${Math.round(v)}`;
  const fmtH = (v) => v >= 100 ? `${Math.round(v)}h` : `${v.toFixed(1)}h`;

  return (
    <div className="border rounded-xl bg-white overflow-hidden">
      {/* Header row */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm truncate">{project.title}</span>
            <Badge className={`text-[9px] px-1.5 ${hc.color}`}>
              <Icon className="w-3 h-3 mr-0.5" />{hc.label}
            </Badge>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[10px] text-slate-400">
              {forecast.completedTasks}/{forecast.totalTasks} tasks
            </span>
            <span className="text-[10px] text-slate-400">
              Budget: {forecast.budget > 0 ? fmtK(forecast.budget) : 'N/A'}
            </span>
          </div>
        </div>

        {/* Key metrics row */}
        <div className="hidden md:flex items-center gap-1 divide-x divide-slate-100">
          <MetricPill
            label="Actual"
            value={fmtH(forecast.totalActualHours)}
            sub={`of ${fmtH(forecast.totalEstimatedHours)} est.`}
            color="text-violet-600"
          />
          <MetricPill
            label="Variance"
            value={fmtK(Math.abs(forecast.costVariance))}
            sub={forecast.costVariance >= 0 ? 'under' : 'over'}
            color={forecast.costVariance >= 0 ? 'text-emerald-600' : 'text-red-500'}
          />
          <MetricPill
            label="EAC"
            value={fmtK(forecast.forecastedTotalCost)}
            sub={`CPI: ${forecast.cpi.toFixed(2)}`}
            color={forecast.cpi >= 1 ? 'text-emerald-600' : 'text-amber-600'}
          />
        </div>

        <button className="p-1 rounded hover:bg-slate-100 shrink-0">
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>
      </div>

      {/* Budget utilization bar */}
      <div className="px-4 pb-3">
        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
          <span>Budget Utilization</span>
          <span className={forecast.budgetUtilization > 100 ? 'text-red-500 font-semibold' : ''}>
            {forecast.budgetUtilization.toFixed(1)}% used
            {forecast.forecastedBudgetUtil > 100 && ` → ${forecast.forecastedBudgetUtil.toFixed(0)}% forecasted`}
          </span>
        </div>
        <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`absolute inset-y-0 left-0 rounded-full transition-all ${
              forecast.budgetUtilization > 100 ? 'bg-red-400' : forecast.budgetUtilization > 80 ? 'bg-amber-400' : 'bg-violet-400'
            }`}
            style={{ width: `${Math.min(forecast.budgetUtilization, 100)}%` }}
          />
          {/* Forecasted marker */}
          {forecast.forecastedBudgetUtil > forecast.budgetUtilization && (
            <div
              className="absolute inset-y-0 w-0.5 bg-red-500/60"
              style={{ left: `${Math.min(forecast.forecastedBudgetUtil, 100)}%` }}
            />
          )}
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t px-4 py-4 space-y-4 bg-slate-50/30">
          {/* Mobile metrics */}
          <div className="flex md:hidden items-center justify-around">
            <MetricPill label="Actual" value={fmtH(forecast.totalActualHours)} color="text-violet-600" />
            <MetricPill label="Estimated" value={fmtH(forecast.totalEstimatedHours)} color="text-cyan-600" />
            <MetricPill label="EAC" value={fmtK(forecast.forecastedTotalCost)} color="text-slate-700" />
          </div>

          {/* Detailed metrics grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-2 rounded-lg bg-white border text-center">
              <Clock className="w-3.5 h-3.5 text-violet-500 mx-auto mb-1" />
              <div className="text-sm font-bold">{fmtH(forecast.hoursPerTask)}</div>
              <div className="text-[9px] text-slate-400">Hours / Task</div>
            </div>
            <div className="p-2 rounded-lg bg-white border text-center">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-500 mx-auto mb-1" />
              <div className="text-sm font-bold">{fmtH(forecast.forecastedTotalHours)}</div>
              <div className="text-[9px] text-slate-400">Forecasted Total</div>
            </div>
            <div className="p-2 rounded-lg bg-white border text-center">
              <DollarSign className="w-3.5 h-3.5 text-emerald-500 mx-auto mb-1" />
              <div className={`text-sm font-bold ${forecast.costVariance >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {forecast.costVariance >= 0 ? '+' : ''}{fmtK(forecast.costVariance)}
              </div>
              <div className="text-[9px] text-slate-400">Cost Variance</div>
            </div>
            <div className="p-2 rounded-lg bg-white border text-center">
              {forecast.spi >= 1
                ? <TrendingUp className="w-3.5 h-3.5 text-emerald-500 mx-auto mb-1" />
                : <TrendingDown className="w-3.5 h-3.5 text-amber-500 mx-auto mb-1" />
              }
              <div className="text-sm font-bold">{forecast.spi.toFixed(2)}</div>
              <div className="text-[9px] text-slate-400">Schedule Perf. (SPI)</div>
            </div>
          </div>

          {/* Chart */}
          <BurnRateChart data={weeklyData} title="Cumulative Hours: Actual vs. Estimated" />
        </div>
      )}
    </div>
  );
}