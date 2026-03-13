import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HOURS_PER_WEEK_CONST } from './CapacityUtils';

function getHeatColor(hours) {
  const ratio = hours / HOURS_PER_WEEK_CONST;
  if (ratio >= 1.3) return { bg: '#fecaca', text: '#991b1b' };    // over 130% - red
  if (ratio >= 1.0) return { bg: '#fed7aa', text: '#9a3412' };    // 100-130% - orange
  if (ratio >= 0.7) return { bg: '#bbf7d0', text: '#166534' };    // 70-100% - green
  if (ratio >= 0.3) return { bg: '#dbeafe', text: '#1e40af' };    // 30-70% - blue
  return { bg: '#f1f5f9', text: '#64748b' };                       // <30% - grey
}

export default function CapacityHeatmap({ members, weeks, profiles }) {
  return (
    <TooltipProvider delayDuration={80}>
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-slate-50 border-b border-r border-slate-200 px-3 py-2 text-left font-semibold text-slate-600 min-w-[180px]">
                Team Member
              </th>
              {weeks.map((w, i) => (
                <th key={i} className="border-b border-slate-200 px-1 py-2 text-center font-medium text-slate-500 min-w-[52px]">
                  {w.label}
                </th>
              ))}
              <th className="border-b border-l border-slate-200 px-3 py-2 text-center font-semibold text-slate-600 min-w-[70px]">
                Util%
              </th>
            </tr>
          </thead>
          <tbody>
            {members.map(m => {
              const prof = profiles.find(p => p.user_id === m.memberId);
              const name = prof?.display_name || m.memberId.split('@')[0];
              return (
                <tr key={m.memberId} className="group">
                  <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50 border-b border-r border-slate-200 px-3 py-2">
                    <div className="flex items-center gap-2">
                      {prof?.avatar_url ? (
                        <img src={prof.avatar_url} className="w-5 h-5 rounded-full object-cover" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-500">
                          {name[0]}
                        </div>
                      )}
                      <span className="font-medium text-slate-700 truncate max-w-[130px]">{name}</span>
                    </div>
                  </td>
                  {m.weeklyLoad.map((hours, wi) => {
                    const color = getHeatColor(hours);
                    return (
                      <Tooltip key={wi}>
                        <TooltipTrigger asChild>
                          <td className="border-b border-slate-100 px-0.5 py-1 text-center">
                            <div
                              className="mx-auto rounded-md flex items-center justify-center h-7 w-full text-[10px] font-semibold transition-transform hover:scale-110"
                              style={{ backgroundColor: color.bg, color: color.text }}
                            >
                              {hours > 0 ? Math.round(hours) : ''}
                            </div>
                          </td>
                        </TooltipTrigger>
                        <TooltipContent className="text-xs">
                          <p className="font-medium">{name} · {weeks[wi].label}</p>
                          <p>{Math.round(hours)}h / {HOURS_PER_WEEK_CONST}h ({Math.round((hours / HOURS_PER_WEEK_CONST) * 100)}%)</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                  <td className="border-b border-l border-slate-200 px-2 py-2 text-center">
                    <span className={`font-bold text-[11px] ${
                      m.utilization > 100 ? 'text-red-600' : m.utilization > 80 ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {m.utilization}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </TooltipProvider>
  );
}