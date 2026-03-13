import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, UserPlus, CheckCircle2, Clock, Users } from 'lucide-react';
import { HOURS_PER_WEEK_CONST } from './CapacityUtils';

export default function HiringNeedsPanel({ orgData, members, weeks }) {
  const overloadedMembers = members.filter(m => m.utilization > 100);
  const idleMembers = members.filter(m => m.utilization < 30);
  const optimalMembers = members.filter(m => m.utilization >= 60 && m.utilization <= 100);

  // Project across weeks where demand exceeds supply
  const shortageWeekDetails = weeks
    .map((w, i) => ({
      week: w.label,
      gap: Math.round(orgData.weeklyGap[i]),
      demand: Math.round(orgData.weeklyDemand[i]),
      supply: Math.round(orgData.weeklySupply[i]),
    }))
    .filter(w => w.gap < 0);

  const severity = orgData.additionalHeadcount >= 3 ? 'critical'
    : orgData.additionalHeadcount >= 1 ? 'warning'
    : 'healthy';

  return (
    <div className="space-y-4">
      {/* Hiring recommendation */}
      <Card className={`border-2 ${
        severity === 'critical' ? 'border-red-200 bg-red-50/40' :
        severity === 'warning' ? 'border-amber-200 bg-amber-50/40' :
        'border-emerald-200 bg-emerald-50/40'
      }`}>
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              severity === 'critical' ? 'bg-red-100' :
              severity === 'warning' ? 'bg-amber-100' : 'bg-emerald-100'
            }`}>
              {severity === 'healthy' ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              ) : (
                <UserPlus className={`w-6 h-6 ${severity === 'critical' ? 'text-red-600' : 'text-amber-600'}`} />
              )}
            </div>
            <div className="flex-1">
              <h3 className={`font-bold text-lg ${
                severity === 'critical' ? 'text-red-800' :
                severity === 'warning' ? 'text-amber-800' : 'text-emerald-800'
              }`}>
                {severity === 'healthy'
                  ? 'Team capacity is adequate'
                  : `Recommend hiring ${orgData.additionalHeadcount} additional member${orgData.additionalHeadcount !== 1 ? 's' : ''}`
                }
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                {severity === 'healthy'
                  ? `Current team of ${members.length} can handle projected workload at ${orgData.avgUtilization}% average utilization.`
                  : `Peak shortage of ${Math.abs(Math.round(orgData.maxShortage))}h/week across ${orgData.shortageWeeks} week(s) this quarter. Current team is at ${orgData.avgUtilization}% avg utilization.`
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="border-red-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-semibold">Overloaded ({'>'}100%)</span>
            </div>
            {overloadedMembers.length === 0 ? (
              <p className="text-xs text-slate-400">None</p>
            ) : (
              <div className="space-y-1.5">
                {overloadedMembers.map(m => (
                  <div key={m.memberId} className="flex items-center justify-between">
                    <span className="text-xs text-slate-700 truncate">{m.memberId.split('@')[0]}</span>
                    <Badge className="bg-red-100 text-red-700 text-[10px]">{m.utilization}%</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-emerald-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-emerald-600 mb-2">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-semibold">Optimal (60-100%)</span>
            </div>
            {optimalMembers.length === 0 ? (
              <p className="text-xs text-slate-400">None</p>
            ) : (
              <div className="space-y-1.5">
                {optimalMembers.map(m => (
                  <div key={m.memberId} className="flex items-center justify-between">
                    <span className="text-xs text-slate-700 truncate">{m.memberId.split('@')[0]}</span>
                    <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">{m.utilization}%</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-semibold">Underutilized ({'<'}30%)</span>
            </div>
            {idleMembers.length === 0 ? (
              <p className="text-xs text-slate-400">None</p>
            ) : (
              <div className="space-y-1.5">
                {idleMembers.map(m => (
                  <div key={m.memberId} className="flex items-center justify-between">
                    <span className="text-xs text-slate-700 truncate">{m.memberId.split('@')[0]}</span>
                    <Badge className="bg-blue-100 text-blue-700 text-[10px]">{m.utilization}%</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Shortage weeks detail */}
      {shortageWeekDetails.length > 0 && (
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <h4 className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              Weeks with capacity shortage
            </h4>
            <div className="space-y-1.5">
              {shortageWeekDetails.map((w, i) => (
                <div key={i} className="flex items-center gap-3 text-xs">
                  <span className="font-medium text-slate-700 w-16">{w.week}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-400 rounded-full"
                      style={{ width: `${Math.min((w.demand / w.supply) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-red-600 font-medium w-14 text-right">{w.gap}h</span>
                  <span className="text-slate-400 w-20 text-right">({w.demand}/{w.supply}h)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}