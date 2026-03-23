import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, Check } from "lucide-react";
import { format, addDays, startOfDay, setHours, setMinutes, isBefore, isAfter, addMinutes } from "date-fns";
import { cn } from "@/lib/utils";

// Generate available slots for a given day based on user preferences and busy times
function generateSlots(date, availability, busySlots, durationMinutes) {
  const startHour = availability?.start_hour ?? 9;
  const endHour = availability?.end_hour ?? 17;
  const buffer = availability?.buffer_minutes ?? 15;
  const slotDuration = durationMinutes || availability?.slot_duration_minutes || 30;

  const slots = [];
  let current = setMinutes(setHours(startOfDay(date), startHour), 0);
  const dayEnd = setMinutes(setHours(startOfDay(date), endHour), 0);
  const now = new Date();

  while (isBefore(current, dayEnd)) {
    const slotEnd = addMinutes(current, slotDuration);
    if (isAfter(slotEnd, dayEnd)) break;

    // Skip past slots
    if (isBefore(current, now)) {
      current = addMinutes(current, 30);
      continue;
    }

    // Check if slot overlaps with any busy period (including buffer)
    const slotStartWithBuffer = addMinutes(current, -buffer);
    const slotEndWithBuffer = addMinutes(slotEnd, buffer);
    
    const isBusy = busySlots.some(busy => {
      const busyStart = new Date(busy.start);
      const busyEnd = new Date(busy.end);
      return isBefore(slotStartWithBuffer, busyEnd) && isAfter(slotEndWithBuffer, busyStart);
    });

    if (!isBusy) {
      slots.push({
        start: new Date(current),
        end: new Date(slotEnd),
        label: format(current, 'h:mm a')
      });
    }

    current = addMinutes(current, 30); // Step in 30-min increments
  }

  return slots;
}

// Map day abbreviation to day-of-week number (0=Sun)
const dayMap = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };

export default function AvailabilitySlotPicker({ targetUserId, duration = 30, onSelect, selectedSlot }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [busySlots, setBusySlots] = useState([]);
  const [loadingBusy, setLoadingBusy] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  // Fetch target user's availability preferences
  const { data: availPrefs = [] } = useQuery({
    queryKey: ['availabilityPrefs', targetUserId],
    queryFn: () => base44.entities.AvailabilityPreference.filter({ user_id: targetUserId }),
    enabled: !!targetUserId
  });
  const availability = availPrefs[0];

  // Generate the 7 days for current week view
  const today = startOfDay(new Date());
  const weekStart = addDays(today, weekOffset * 7);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Allowed days based on availability preferences
  const allowedDays = (availability?.days_of_week || ['mon', 'tue', 'wed', 'thu', 'fri']).map(d => dayMap[d]);

  // Fetch busy slots from Google Calendar when week changes
  useEffect(() => {
    const fetchBusy = async () => {
      setLoadingBusy(true);
      try {
        const timeMin = weekStart.toISOString();
        const timeMax = addDays(weekStart, 7).toISOString();
        const res = await base44.functions.invoke('calendarBooking', {
          action: 'getFreeBusy',
          timeMin,
          timeMax
        });
        setBusySlots(res.data?.busySlots || []);
      } catch (err) {
        console.error('Failed to fetch busy slots:', err);
        setBusySlots([]);
      } finally {
        setLoadingBusy(false);
      }
    };
    fetchBusy();
  }, [weekOffset]);

  // Auto-select first available day
  useEffect(() => {
    if (!selectedDay) {
      const firstAvailable = days.find(d => 
        allowedDays.includes(d.getDay()) && !isBefore(d, startOfDay(new Date()))
      );
      if (firstAvailable) setSelectedDay(firstAvailable);
    }
  }, [days, allowedDays]);

  const selectedDaySlots = selectedDay 
    ? generateSlots(selectedDay, availability, busySlots, duration)
    : [];

  return (
    <div className="space-y-4">
      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setWeekOffset(w => Math.max(0, w - 1))}
          disabled={weekOffset === 0}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm font-medium text-slate-700">
          {format(weekStart, 'MMM d')} – {format(addDays(weekStart, 6), 'MMM d, yyyy')}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setWeekOffset(w => w + 1)}
          disabled={weekOffset >= 4}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Day pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {days.map(day => {
          const isAllowed = allowedDays.includes(day.getDay());
          const isPast = isBefore(day, startOfDay(new Date()));
          const isSelected = selectedDay && format(day, 'yyyy-MM-dd') === format(selectedDay, 'yyyy-MM-dd');
          const daySlots = isAllowed && !isPast ? generateSlots(day, availability, busySlots, duration) : [];
          
          return (
            <button
              key={day.toISOString()}
              onClick={() => isAllowed && !isPast && setSelectedDay(day)}
              disabled={!isAllowed || isPast}
              className={cn(
                "flex flex-col items-center px-3 py-2 rounded-xl border text-xs min-w-[56px] transition-all",
                isSelected
                  ? "bg-violet-600 border-violet-600 text-white"
                  : isAllowed && !isPast
                    ? "bg-white border-slate-200 hover:border-violet-300 hover:bg-violet-50"
                    : "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
              )}
            >
              <span className="font-medium">{format(day, 'EEE')}</span>
              <span className={cn("text-lg font-bold", isSelected ? "text-white" : "text-slate-900")}>
                {format(day, 'd')}
              </span>
              {isAllowed && !isPast && (
                <span className={cn("text-[10px]", isSelected ? "text-violet-200" : "text-slate-400")}>
                  {daySlots.length} slots
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Time slots */}
      {loadingBusy ? (
        <div className="flex items-center justify-center py-8 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Checking calendar availability...
        </div>
      ) : selectedDay ? (
        <div>
          <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
            <CalendarIcon className="w-3 h-3" />
            {format(selectedDay, 'EEEE, MMMM d')} · {selectedDaySlots.length} available slots
          </p>
          {selectedDaySlots.length === 0 ? (
            <div className="text-center py-6 text-slate-400">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No available slots on this day</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
              {selectedDaySlots.map(slot => {
                const isChosen = selectedSlot && 
                  slot.start.toISOString() === new Date(selectedSlot.start).toISOString();
                return (
                  <button
                    key={slot.start.toISOString()}
                    onClick={() => onSelect(slot)}
                    className={cn(
                      "flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-all",
                      isChosen
                        ? "bg-violet-600 border-violet-600 text-white shadow-md"
                        : "bg-white border-slate-200 text-slate-700 hover:border-violet-300 hover:bg-violet-50"
                    )}
                  >
                    {isChosen && <Check className="w-3.5 h-3.5" />}
                    {slot.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : null}

      {/* No availability configured message */}
      {!availability && targetUserId && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
          <p className="font-medium">No availability set</p>
          <p className="text-xs mt-1">This user hasn't configured their availability yet. Showing default business hours (Mon-Fri, 9am-5pm).</p>
        </div>
      )}
    </div>
  );
}