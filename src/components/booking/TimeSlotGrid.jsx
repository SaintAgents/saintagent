import React from 'react';
import { Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TimeSlotGrid({ slots, loading, selectedSlot, onSelect }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-violet-600 mr-2" />
        <span className="text-slate-500">Checking availability...</span>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="font-medium text-slate-700">No available slots for this day</p>
        <p className="text-sm text-slate-500 mt-1">Try selecting a different date</p>
      </div>
    );
  }

  // Group slots by period
  const morning = slots.filter(s => {
    const h = new Date(s.start).getUTCHours();
    return h < 12;
  });
  const afternoon = slots.filter(s => {
    const h = new Date(s.start).getUTCHours();
    return h >= 12 && h < 17;
  });
  const evening = slots.filter(s => {
    const h = new Date(s.start).getUTCHours();
    return h >= 17;
  });

  const renderGroup = (label, groupSlots) => {
    if (groupSlots.length === 0) return null;
    return (
      <div className="mb-4">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">{label}</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {groupSlots.map((slot) => (
            <button
              key={slot.start}
              onClick={() => onSelect(slot)}
              className={cn(
                "px-3 py-2.5 rounded-lg border text-sm font-medium transition-all",
                selectedSlot?.start === slot.start
                  ? "bg-violet-600 text-white border-violet-600 shadow-md"
                  : "bg-white hover:bg-violet-50 hover:border-violet-300 text-slate-700 border-slate-200"
              )}
            >
              {slot.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      {renderGroup('Morning', morning)}
      {renderGroup('Afternoon', afternoon)}
      {renderGroup('Evening', evening)}
    </div>
  );
}