import React from 'react';
import { cn } from "@/lib/utils";

export default function ImpactStatCard({ icon: Icon, label, value, subtitle, color = 'violet', trend }) {
  const colorMap = {
    violet: 'from-violet-500 to-purple-600',
    emerald: 'from-emerald-500 to-teal-600',
    amber: 'from-amber-500 to-orange-600',
    blue: 'from-blue-500 to-indigo-600',
    rose: 'from-rose-500 to-pink-600',
    cyan: 'from-cyan-500 to-sky-600',
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 relative overflow-hidden group hover:shadow-lg transition-shadow">
      <div className={cn("absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10", `bg-gradient-to-br ${colorMap[color]}`)} />
      <div className="flex items-start gap-3">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br text-white shrink-0", colorMap[color])}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-slate-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-0.5">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          {trend != null && (
            <p className={cn("text-xs font-medium mt-1", trend >= 0 ? "text-emerald-600" : "text-red-500")}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% this month
            </p>
          )}
        </div>
      </div>
    </div>
  );
}