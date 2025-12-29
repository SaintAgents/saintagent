import React from 'react';
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function MetricTile({
  label,
  value,
  icon: Icon,
  trend,
  trendValue,
  color = "slate",
  size = "default",
  onClick
}) {
  const colorClasses = {
    slate: "bg-slate-50 border-slate-200 text-slate-900",
    violet: "bg-violet-50 border-violet-200 text-violet-900",
    amber: "bg-amber-50 border-amber-200 text-amber-900",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-900",
    rose: "bg-rose-50 border-rose-200 text-rose-900",
    blue: "bg-blue-50 border-blue-200 text-blue-900"
  };

  const iconColors = {
    slate: "text-slate-500",
    violet: "text-violet-500",
    amber: "text-amber-500",
    emerald: "text-emerald-500",
    rose: "text-rose-500",
    blue: "text-blue-500"
  };

  return (
    <div className="bg-teal-50 text-emerald-900 p-4 rounded-2xl relative overflow-hidden border backdrop-blur-sm transition-all duration-300 border-emerald-200"






    onClick={onClick}>

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-800 mb-1 truncate">
            {label}
          </p>
          <p className="text-neutral-950 text-2xl font-extrabold tracking-tight">



            {value}
          </p>
          {trend &&
          <div className="flex items-center gap-1 mt-1">
              {trend === 'up' ?
            <TrendingUp className="w-3 h-3 text-emerald-500" /> :

            <TrendingDown className="w-3 h-3 text-rose-500" />
            }
              <span className={cn(
              "text-xs font-medium",
              trend === 'up' ? "text-emerald-600" : "text-rose-600"
            )}>
                {trendValue}
              </span>
            </div>
          }
        </div>
        {Icon &&
        <div className={cn(
          "shrink-0 p-2 rounded-xl bg-white/50",
          iconColors[color]
        )}>
            <Icon className="w-5 h-5" />
          </div>
        }
      </div>
    </div>);

}