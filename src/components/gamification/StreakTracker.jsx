import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import { Flame, Calendar, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function StreakTracker({ userId, compact = false }) {
  // Get GGG transactions as activity indicator (more reliable than daily logs)
  const { data: transactions = [] } = useQuery({
    queryKey: ['streakTransactions', userId],
    queryFn: async () => {
      const txns = await base44.entities.GGGTransaction.filter({ user_id: userId }, '-created_date', 60);
      return txns;
    },
    enabled: !!userId
  });

  // Calculate current streak based on days with activity (GGG transactions)
  const calculateStreak = () => {
    if (transactions.length === 0) return 0;
    
    // Group transactions by date
    const activityDates = new Set();
    transactions.forEach(txn => {
      const date = new Date(txn.created_date);
      activityDates.add(date.toISOString().slice(0, 10));
    });
    
    const sortedDates = [...activityDates].sort((a, b) => new Date(b) - new Date(a));
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < sortedDates.length; i++) {
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      const expectedDateStr = expectedDate.toISOString().slice(0, 10);
      
      if (sortedDates.includes(expectedDateStr)) {
        streak++;
      } else {
        // Allow for today not having activity yet
        if (i === 0) continue;
        break;
      }
    }
    
    return streak;
  };

  const streak = calculateStreak();
  
  // Group by date for activity visualization
  const activityDates = new Set();
  transactions.forEach(txn => {
    const date = new Date(txn.created_date);
    activityDates.add(date.toISOString().slice(0, 10));
  });
  
  const longestStreak = Math.max(streak, 0);

  // Generate last 7 days for visualization
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    date.setHours(0, 0, 0, 0);
    const dateStr = date.toISOString().slice(0, 10);
    const hasActivity = dailyLogs.some(log => log.date === dateStr);
    return { date, dateStr, hasActivity, dayName: date.toLocaleDateString('en', { weekday: 'short' }) };
  });

  if (compact) {
    return (
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-rose-600 dark:text-rose-400">Current Streak</p>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-bold text-rose-900 dark:text-rose-100">{streak}</p>
            <Flame className={cn("w-6 h-6", streak > 0 ? "text-orange-500" : "text-slate-300")} />
          </div>
          <p className="text-xs text-rose-500">Best: {longestStreak} days</p>
        </div>
        <div className="flex gap-1">
          {last7Days.slice(-5).map((day, i) => (
            <div
              key={i}
              className={cn(
                "w-3 h-3 rounded-full",
                day.hasActivity ? "bg-rose-500" : "bg-slate-200"
              )}
              title={day.dayName}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-rose-100">
            <Flame className={cn("w-6 h-6", streak > 0 ? "text-orange-500 animate-pulse" : "text-slate-400")} />
          </div>
          <div>
            <p className="text-sm text-rose-600">Current Streak</p>
            <p className="text-2xl font-bold text-rose-900">{streak} days</p>
          </div>
        </div>
        {streak >= 7 && (
          <Badge className="bg-orange-100 text-orange-700 gap-1">
            <TrendingUp className="w-3 h-3" />
            On Fire!
          </Badge>
        )}
      </div>

      {/* 7-day visualization */}
      <div className="grid grid-cols-7 gap-2">
        {last7Days.map((day, i) => (
          <div key={i} className="text-center">
            <p className="text-xs text-slate-500 mb-1">{day.dayName}</p>
            <div
              className={cn(
                "w-8 h-8 mx-auto rounded-lg flex items-center justify-center transition-all",
                day.hasActivity
                  ? "bg-rose-500 text-white shadow-md"
                  : "bg-slate-100 text-slate-400"
              )}
            >
              {day.hasActivity ? (
                <Flame className="w-4 h-4" />
              ) : (
                <Calendar className="w-4 h-4" />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-rose-200 flex items-center justify-between text-sm">
        <span className="text-rose-600">Longest Streak</span>
        <span className="font-semibold text-rose-900">{longestStreak} days</span>
      </div>
    </div>
  );
}