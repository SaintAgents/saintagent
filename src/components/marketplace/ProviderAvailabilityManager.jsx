import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Clock, Plus, Trash2, CalendarClock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const TIMES = [];
for (let h = 7; h <= 21; h++) {
  TIMES.push(`${String(h).padStart(2, '0')}:00`);
  TIMES.push(`${String(h).padStart(2, '0')}:30`);
}

export default function ProviderAvailabilityManager({ listing, onUpdate }) {
  const [enabled, setEnabled] = useState(listing?.recurring_available || false);
  const [windows, setWindows] = useState(listing?.recurring_availability || []);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    setEnabled(listing?.recurring_available || false);
    setWindows(listing?.recurring_availability || []);
  }, [listing?.id]);

  const addWindow = () => {
    setWindows(prev => [...prev, { day_of_week: 1, start_time: '09:00', end_time: '17:00' }]);
  };

  const updateWindow = (index, field, value) => {
    setWindows(prev => prev.map((w, i) => i === index ? { ...w, [field]: value } : w));
  };

  const removeWindow = (index) => {
    setWindows(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!listing?.id) return;
    setSaving(true);
    await base44.entities.Listing.update(listing.id, {
      recurring_available: enabled,
      recurring_availability: enabled ? windows : [],
    });
    queryClient.invalidateQueries({ queryKey: ['listings'] });
    onUpdate?.();
    setSaving(false);
  };

  // Group windows by day for display
  const daysSummary = DAYS.map((name, i) => {
    const dayWindows = windows.filter(w => w.day_of_week === i);
    return { name, shortName: SHORT_DAYS[i], index: i, windows: dayWindows };
  }).filter(d => d.windows.length > 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarClock className="w-5 h-5 text-violet-600" />
            Recurring Availability
          </CardTitle>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Allow clients to book recurring weekly/monthly sessions
        </p>
      </CardHeader>

      {enabled && (
        <CardContent className="space-y-4">
          {/* Current summary */}
          {daysSummary.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {daysSummary.map(d => (
                <Badge key={d.index} variant="secondary" className="gap-1 text-xs">
                  {d.shortName}: {d.windows.map(w => `${w.start_time}-${w.end_time}`).join(', ')}
                </Badge>
              ))}
            </div>
          )}

          {/* Windows list */}
          <div className="space-y-2">
            {windows.map((w, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg border bg-slate-50">
                <Select value={String(w.day_of_week)} onValueChange={v => updateWindow(i, 'day_of_week', parseInt(v))}>
                  <SelectTrigger className="w-28 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map((day, idx) => (
                      <SelectItem key={idx} value={String(idx)}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={w.start_time} onValueChange={v => updateWindow(i, 'start_time', v)}>
                  <SelectTrigger className="w-24 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMES.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <span className="text-xs text-slate-400">to</span>

                <Select value={w.end_time} onValueChange={v => updateWindow(i, 'end_time', v)}>
                  <SelectTrigger className="w-24 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMES.filter(t => t > w.start_time).map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeWindow(i)}>
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                </Button>
              </div>
            ))}
          </div>

          <Button variant="outline" size="sm" className="gap-1.5 w-full" onClick={addWindow}>
            <Plus className="w-3.5 h-3.5" />
            Add Time Window
          </Button>

          <Button onClick={handleSave} disabled={saving} className="w-full bg-violet-600 hover:bg-violet-700" size="sm">
            {saving ? 'Saving...' : 'Save Availability'}
          </Button>
        </CardContent>
      )}
    </Card>
  );
}