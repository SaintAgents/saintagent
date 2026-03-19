import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, DollarSign, TrendingDown } from 'lucide-react';

export default function BudgetDelayAlerts({ projectForecasts }) {
  const alerts = useMemo(() => {
    const result = [];
    
    for (const { project, forecast } of projectForecasts) {
      // 1. Forecasted cost exceeds budget
      if (forecast.budget > 0 && forecast.forecastedBudgetUtil > 110) {
        result.push({
          severity: forecast.forecastedBudgetUtil > 150 ? 'critical' : 'warning',
          project: project.title,
          type: 'budget_overrun',
          message: `Projected to hit ${Math.round(forecast.forecastedBudgetUtil)}% of budget ($${Math.round(forecast.forecastedTotalCost).toLocaleString()} vs $${Math.round(forecast.budget).toLocaleString()})`,
          icon: DollarSign,
        });
      }

      // 2. Burn rate too high (hours/task significantly above estimate)
      if (forecast.completedTasks >= 2 && forecast.totalEstimatedHours > 0) {
        const avgEstPerTask = forecast.totalEstimatedHours / forecast.totalTasks;
        if (forecast.hoursPerTask > avgEstPerTask * 1.5) {
          result.push({
            severity: forecast.hoursPerTask > avgEstPerTask * 2 ? 'critical' : 'warning',
            project: project.title,
            type: 'burn_rate',
            message: `Burn rate ${forecast.hoursPerTask.toFixed(1)}h/task vs ${avgEstPerTask.toFixed(1)}h estimated — ${Math.round(((forecast.hoursPerTask / avgEstPerTask) - 1) * 100)}% over`,
            icon: TrendingDown,
          });
        }
      }

      // 3. Schedule slippage threatens budget (SPI < 0.8 with remaining budget)
      if (forecast.spi < 0.8 && forecast.totalTasks > forecast.completedTasks && forecast.budget > 0) {
        result.push({
          severity: forecast.spi < 0.6 ? 'critical' : 'warning',
          project: project.title,
          type: 'schedule_slip',
          message: `Schedule performance at ${(forecast.spi * 100).toFixed(0)}% — delays may add $${Math.round(forecast.forecastedTotalCost - forecast.estimatedCost).toLocaleString()} to costs`,
          icon: Clock,
        });
      }

      // 4. CPI below threshold
      if (forecast.cpi < 0.85 && forecast.completedTasks >= 2) {
        result.push({
          severity: forecast.cpi < 0.65 ? 'critical' : 'warning',
          project: project.title,
          type: 'cpi_low',
          message: `Cost efficiency at ${(forecast.cpi * 100).toFixed(0)}% — getting less value per dollar spent`,
          icon: AlertTriangle,
        });
      }
    }

    // Sort: critical first, then warning
    result.sort((a, b) => (a.severity === 'critical' ? 0 : 1) - (b.severity === 'critical' ? 0 : 1));
    return result;
  }, [projectForecasts]);

  if (alerts.length === 0) {
    return (
      <Card className="border-emerald-200 bg-emerald-50/30 mb-6">
        <CardContent className="p-4 text-center text-sm text-emerald-700 font-medium">
          ✓ No budget or delay alerts — all projects tracking within baseline
        </CardContent>
      </Card>
    );
  }

  const severityStyle = {
    critical: 'bg-red-50 border-red-200 text-red-700',
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
  };

  const badgeStyle = {
    critical: 'bg-red-100 text-red-700',
    warning: 'bg-amber-100 text-amber-700',
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Budget & Delay Alerts ({alerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {alerts.slice(0, 10).map((alert, i) => {
          const Icon = alert.icon;
          return (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border ${severityStyle[alert.severity]}`}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold">{alert.project}</span>
                <p className="text-xs mt-0.5">{alert.message}</p>
              </div>
              <Badge className={`text-[10px] ${badgeStyle[alert.severity]}`}>
                {alert.severity}
              </Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}