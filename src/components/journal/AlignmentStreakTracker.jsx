import React, { useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Flame, Heart, Zap, Calendar, Trophy } from "lucide-react";
import { format, differenceInCalendarDays, subDays } from 'date-fns';

// Badge requirements from badgeRules
const GRID_ALIGNED = {
  name: 'Grid Aligned',
  icon: Heart,
  color: 'text-pink-500',
  bgColor: 'bg-pink-50',
  borderColor: 'border-pink-200',
  requirements: {
    grid_missions: 8,
    coherence_sessions: 10,
  },
  description: 'Complete 8 grid/alignment missions and log 10 heart-coherence sessions'
};

const SACRED_FLAME = {
  name: 'Sacred Flame',
  icon: Flame,
  color: 'text-amber-500',
  bgColor: 'bg-amber-50',
  borderColor: 'border-amber-200',
  requirements: {
    transformative_missions: 12,
    period_days: 180,
  },
  description: 'Complete 12 transformative entries over 180 days'
};

function computeStats(entries) {
  const alignmentEntries = entries.filter(e =>
    e.entry_type === 'heart_coherence' || e.entry_type === 'alignment' || e.entry_type === 'grid_mission' || e.entry_type === 'transformative'
  );

  const coherenceSessions = entries.filter(e => e.entry_type === 'heart_coherence').length;
  const gridMissions = entries.filter(e => e.entry_type === 'grid_mission' || e.entry_type === 'alignment').length;
  const transformativeEntries = entries.filter(e => e.entry_type === 'transformative').length;

  // Compute streak (consecutive days with alignment entries)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;

  const entryDates = new Set(
    alignmentEntries.map(e => {
      const d = new Date(e.created_date);
      d.setHours(0, 0, 0, 0);
      return d.toISOString();
    })
  );

  for (let i = 0; i < 365; i++) {
    const checkDate = subDays(today, i);
    checkDate.setHours(0, 0, 0, 0);
    if (entryDates.has(checkDate.toISOString())) {
      streak++;
    } else if (i === 0) {
      // Today might not have an entry yet, skip
      continue;
    } else {
      break;
    }
  }

  // Compute span in days for transformative missions
  const transformativeDates = entries
    .filter(e => e.entry_type === 'transformative')
    .map(e => new Date(e.created_date));
  let spanDays = 0;
  if (transformativeDates.length >= 2) {
    const sorted = transformativeDates.sort((a, b) => a - b);
    spanDays = differenceInCalendarDays(sorted[sorted.length - 1], sorted[0]);
  }

  // Total coherence minutes
  const totalCoherenceMinutes = entries.reduce((sum, e) => sum + (e.coherence_duration_minutes || 0), 0);

  return {
    totalAlignmentEntries: alignmentEntries.length,
    coherenceSessions,
    gridMissions,
    transformativeEntries,
    streak,
    spanDays,
    totalCoherenceMinutes,
  };
}

export default function AlignmentStreakTracker({ entries = [], badges = [] }) {
  const stats = useMemo(() => computeStats(entries), [entries]);

  const hasGridAligned = badges.some(b => (b.badge_code || b.code) === 'alignment_grid_aligned');
  const hasSacredFlame = badges.some(b => (b.badge_code || b.code) === 'alignment_sacred_flame');

  const gridProgress = {
    missions: Math.min(stats.gridMissions, GRID_ALIGNED.requirements.grid_missions),
    sessions: Math.min(stats.coherenceSessions, GRID_ALIGNED.requirements.coherence_sessions),
  };
  const gridPercent = Math.round(
    ((gridProgress.missions / GRID_ALIGNED.requirements.grid_missions) +
     (gridProgress.sessions / GRID_ALIGNED.requirements.coherence_sessions)) / 2 * 100
  );

  const flameProgress = {
    missions: Math.min(stats.transformativeEntries, SACRED_FLAME.requirements.transformative_missions),
    days: Math.min(stats.spanDays, SACRED_FLAME.requirements.period_days),
  };
  const flamePercent = Math.round(
    ((flameProgress.missions / SACRED_FLAME.requirements.transformative_missions) +
     (flameProgress.days / SACRED_FLAME.requirements.period_days)) / 2 * 100
  );

  return (
    <div className="space-y-4">
      {/* Streak & Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MiniStat icon={Zap} label="Streak" value={`${stats.streak}d`} color="text-amber-500" />
        <MiniStat icon={Heart} label="Coherence" value={stats.coherenceSessions} color="text-pink-500" />
        <MiniStat icon={Calendar} label="Alignment" value={stats.totalAlignmentEntries} color="text-violet-500" />
        <MiniStat icon={Flame} label="Minutes" value={stats.totalCoherenceMinutes} color="text-orange-500" />
      </div>

      {/* Badge Progress Cards */}
      <BadgeProgressCard
        badge={GRID_ALIGNED}
        earned={hasGridAligned}
        percent={gridPercent}
        rows={[
          { label: 'Grid/Alignment Entries', current: gridProgress.missions, target: GRID_ALIGNED.requirements.grid_missions },
          { label: 'Coherence Sessions', current: gridProgress.sessions, target: GRID_ALIGNED.requirements.coherence_sessions },
        ]}
      />
      <BadgeProgressCard
        badge={SACRED_FLAME}
        earned={hasSacredFlame}
        percent={flamePercent}
        rows={[
          { label: 'Transformative Entries', current: flameProgress.missions, target: SACRED_FLAME.requirements.transformative_missions },
          { label: 'Activity Span (days)', current: flameProgress.days, target: SACRED_FLAME.requirements.period_days },
        ]}
      />
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, color }) {
  return (
    <Card>
      <CardContent className="p-3 flex items-center gap-2">
        <Icon className={`w-5 h-5 ${color}`} />
        <div>
          <div className="text-lg font-bold text-slate-900 leading-tight">{value}</div>
          <div className="text-xs text-slate-500">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function BadgeProgressCard({ badge, earned, percent, rows }) {
  const Icon = badge.icon;
  return (
    <Card className={`${badge.borderColor} ${badge.bgColor}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${badge.color}`} />
            <span className="font-semibold text-slate-900">{badge.name}</span>
          </div>
          {earned ? (
            <Badge className="bg-emerald-100 text-emerald-700 gap-1">
              <Trophy className="w-3 h-3" /> Earned
            </Badge>
          ) : (
            <span className="text-sm font-medium text-slate-600">{percent}%</span>
          )}
        </div>
        {!earned && (
          <>
            <Progress value={percent} className="h-2 mb-3" />
            <div className="space-y-1.5">
              {rows.map((row, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">{row.label}</span>
                  <span className="font-medium text-slate-800">{row.current}/{row.target}</span>
                </div>
              ))}
            </div>
          </>
        )}
        {earned && (
          <p className="text-sm text-emerald-700">Congratulations! You've earned this badge.</p>
        )}
      </CardContent>
    </Card>
  );
}

export { computeStats };