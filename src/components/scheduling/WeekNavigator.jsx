import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';

export default function WeekNavigator({ weekStart, onWeekChange }) {
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

  return (
    <div className="flex items-center gap-3">
      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onWeekChange(subWeeks(weekStart, 1))}>
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <div className="flex items-center gap-2 min-w-[200px] justify-center">
        <CalendarDays className="w-4 h-4 text-slate-500" />
        <span className="text-sm font-medium text-slate-700">
          {format(weekStart, 'MMM d')} – {format(weekEnd, 'MMM d, yyyy')}
        </span>
      </div>
      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onWeekChange(addWeeks(weekStart, 1))}>
        <ChevronRight className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="sm" className="text-xs" onClick={() => onWeekChange(startOfWeek(new Date(), { weekStartsOn: 1 }))}>
        Today
      </Button>
    </div>
  );
}