import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

const DAYS = [
  { code: 'mon', label: 'Monday' },
  { code: 'tue', label: 'Tuesday' },
  { code: 'wed', label: 'Wednesday' },
  { code: 'thu', label: 'Thursday' },
  { code: 'fri', label: 'Friday' },
  { code: 'sat', label: 'Saturday' },
  { code: 'sun', label: 'Sunday' },
];

function formatTime(hour, minute) {
  const h = hour % 12 || 12;
  const m = (minute || 0).toString().padStart(2, '0');
  const ampm = hour < 12 ? 'AM' : 'PM';
  return `${h}:${m} ${ampm}`;
}

function TimeSelect({ value, onChange, label }) {
  // Generate time options in 30-min increments from 6:00 to 22:00
  const options = [];
  for (let h = 6; h <= 22; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (h === 22 && m > 0) break;
      options.push({ hour: h, minute: m, label: formatTime(h, m) });
    }
  }

  const currentVal = `${value.hour}:${value.minute || 0}`;

  return (
    <Select value={currentVal} onValueChange={(v) => {
      const [h, m] = v.split(':').map(Number);
      onChange({ hour: h, minute: m });
    }}>
      <SelectTrigger className="w-[120px]">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {options.map(opt => (
          <SelectItem key={`${opt.hour}:${opt.minute}`} value={`${opt.hour}:${opt.minute}`}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function WeeklySlotEditor({ slots = [], onChange }) {
  const [copyFromDay, setCopyFromDay] = useState(null);

  const addSlot = (dayCode) => {
    const daySlots = slots.filter(s => s.day === dayCode);
    const lastSlot = daySlots[daySlots.length - 1];
    const newSlot = {
      day: dayCode,
      start_hour: lastSlot ? lastSlot.end_hour : 9,
      start_minute: lastSlot ? lastSlot.end_minute : 0,
      end_hour: lastSlot ? Math.min(lastSlot.end_hour + 2, 22) : 17,
      end_minute: 0
    };
    onChange([...slots, newSlot]);
  };

  const removeSlot = (index) => {
    onChange(slots.filter((_, i) => i !== index));
  };

  const updateSlot = (index, field, value) => {
    const updated = [...slots];
    updated[index] = { ...updated[index], ...value };
    onChange(updated);
  };

  const copyToAllDays = (sourceDay) => {
    const sourceSlots = slots.filter(s => s.day === sourceDay);
    if (sourceSlots.length === 0) return;

    const otherSlots = slots.filter(s => s.day === sourceDay);
    const newSlots = [...otherSlots];

    DAYS.forEach(d => {
      if (d.code === sourceDay) return;
      sourceSlots.forEach(s => {
        newSlots.push({ ...s, day: d.code });
      });
    });

    onChange(newSlots);
    setCopyFromDay(null);
  };

  // Group slots by day
  const slotsByDay = {};
  DAYS.forEach(d => {
    slotsByDay[d.code] = [];
  });
  slots.forEach((slot, idx) => {
    if (slotsByDay[slot.day]) {
      slotsByDay[slot.day].push({ ...slot, _idx: idx });
    }
  });

  // Build a flat index map so we can reference by original array index
  let flatIdx = 0;
  const indexMap = {};
  slots.forEach((s, i) => {
    indexMap[i] = i;
  });

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Define your recurring weekly availability. Add multiple time windows per day.
      </p>

      {DAYS.map(day => {
        const daySlots = slotsByDay[day.code];
        const hasSlots = daySlots.length > 0;

        return (
          <div key={day.code} className={cn(
            "rounded-lg border p-3 transition-all",
            hasSlots ? "bg-violet-50/50 border-violet-200" : "bg-slate-50 border-slate-200"
          )}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "font-medium text-sm",
                  hasSlots ? "text-violet-900" : "text-slate-500"
                )}>
                  {day.label}
                </span>
                {hasSlots && (
                  <Badge variant="secondary" className="text-xs">
                    {daySlots.length} slot{daySlots.length > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                {hasSlots && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-violet-600 gap-1"
                    onClick={() => copyToAllDays(day.code)}
                    title="Copy this day's schedule to all days"
                  >
                    <Copy className="w-3 h-3" />
                    Copy to all
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => addSlot(day.code)}
                >
                  <Plus className="w-3 h-3" />
                  Add
                </Button>
              </div>
            </div>

            {daySlots.length === 0 && (
              <p className="text-xs text-slate-400 italic">No availability — click Add to set hours</p>
            )}

            {daySlots.map((slot) => (
              <div key={slot._idx} className="flex items-center gap-2 mt-2">
                <TimeSelect
                  label="Start"
                  value={{ hour: slot.start_hour, minute: slot.start_minute || 0 }}
                  onChange={({ hour, minute }) => updateSlot(slot._idx, 'start', { start_hour: hour, start_minute: minute })}
                />
                <span className="text-slate-400 text-sm">to</span>
                <TimeSelect
                  label="End"
                  value={{ hour: slot.end_hour, minute: slot.end_minute || 0 }}
                  onChange={({ hour, minute }) => updateSlot(slot._idx, 'end', { end_hour: hour, end_minute: minute })}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-red-600"
                  onClick={() => removeSlot(slot._idx)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}