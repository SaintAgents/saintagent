import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Clock, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { format, addDays, startOfDay, isSameDay, isAfter, setHours, setMinutes } from "date-fns";
import { cn } from "@/lib/utils";

export default function AvailabilitySlotPicker({ 
  hostAvailability, 
  durationMinutes = 30,
  onSelectSlot,
  selectedSlot 
}) {
  const [weekOffset, setWeekOffset] = useState(0);
  const today = startOfDay(new Date());
  const weekStart = addDays(today, weekOffset * 7);
  const weekEnd = addDays(weekStart, 7);

  // Days to show (next 7 days from weekStart)
  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart.toISOString()]);

  // Fetch free/busy from Google Calendar
  const { data: freeBusyData, isLoading } = useQuery({
    queryKey: ['freeBusy', weekStart.toISOString(), weekEnd.toISOString()],
    queryFn: async () => {
      const res = await base44.functions.invoke('calendarBooking', {
        action: 'getFreeBusy',
        dateFrom: weekStart.toISOString(),
        dateTo: weekEnd.toISOString()
      });
      return res.data;
    },
    staleTime: 60000,
  });

  const busySlots = freeBusyData?.busySlots || [];

  // Generate available slots based on host preferences and busy times
  const getAvailableSlots = (day) => {
    const startHour = hostAvailability?.start_hour ?? 9;
    const endHour = hostAvailability?.end_hour ?? 17;
    const availableDays = hostAvailability?.days_of_week || ['mon', 'tue', 'wed', 'thu', 'fri'];
    
    const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const dayName = dayNames[day.getDay()];
    
    if (!availableDays.includes(dayName)) return [];
    
    const slots = [];
    const slotDuration = durationMinutes;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let min = 0; min < 60; min += slotDuration) {
        if (hour === endHour - 1 && min + slotDuration > 60) continue;
        
        const slotStart = setMinutes(setHours(new Date(day), hour), min);
        const slotEnd = new Date(slotStart.getTime() + slotDuration * 60000);
        
        // Skip past slots
        if (!isAfter(slotStart, new Date())) continue;
        
        // Check against busy times
        const isBusy = busySlots.some(busy => {
          const busyStart = new Date(busy.start);
          const busyEnd = new Date(busy.end);
          return slotStart < busyEnd && slotEnd > busyStart;
        });
        
        if (!isBusy) {
          slots.push({ start: slotStart, end: slotEnd });
        }
      }
    }
    
    return slots;
  };

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))}
          disabled={weekOffset === 0}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-violet-600" />
          <span className="text-sm font-medium">
            {format(weekStart, 'MMM d')} — {format(addDays(weekStart, 6), 'MMM d, yyyy')}
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setWeekOffset(weekOffset + 1)}
          disabled={weekOffset >= 3}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
          <span className="ml-2 text-sm text-slate-500">Checking calendar availability...</span>
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {days.map(day => (
            <div key={day.toISOString()} className="text-center">
              <p className="text-xs font-medium text-slate-500">{format(day, 'EEE')}</p>
              <p className={cn(
                "text-sm font-bold mb-1",
                isSameDay(day, new Date()) ? "text-violet-600" : "text-slate-900"
              )}>
                {format(day, 'd')}
              </p>
            </div>
          ))}

          {/* Slot columns */}
          {days.map(day => {
            const slots = getAvailableSlots(day);
            return (
              <ScrollArea key={`slots-${day.toISOString()}`} className="max-h-48">
                <div className="space-y-1 px-0.5">
                  {slots.length === 0 ? (
                    <p className="text-[10px] text-slate-400 text-center py-2">—</p>
                  ) : (
                    slots.map(slot => {
                      const isSelected = selectedSlot && 
                        slot.start.getTime() === new Date(selectedSlot.start).getTime();
                      return (
                        <button
                          key={slot.start.toISOString()}
                          onClick={() => onSelectSlot(slot)}
                          className={cn(
                            "w-full text-[11px] py-1.5 px-1 rounded-md border transition-all text-center",
                            isSelected 
                              ? "bg-violet-600 text-white border-violet-600 shadow-md" 
                              : "bg-white hover:bg-violet-50 hover:border-violet-300 border-slate-200 text-slate-700"
                          )}
                        >
                          {format(slot.start, 'h:mm a')}
                        </button>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            );
          })}
        </div>
      )}

      {/* Selected slot summary */}
      {selectedSlot && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-violet-50 border border-violet-200">
          <Clock className="w-4 h-4 text-violet-600" />
          <div>
            <p className="text-sm font-medium text-violet-900">
              {format(new Date(selectedSlot.start), 'EEEE, MMMM d')} at {format(new Date(selectedSlot.start), 'h:mm a')}
            </p>
            <p className="text-xs text-violet-600">{durationMinutes} minutes</p>
          </div>
          <Badge className="ml-auto bg-violet-100 text-violet-700">Selected</Badge>
        </div>
      )}
    </div>
  );
}