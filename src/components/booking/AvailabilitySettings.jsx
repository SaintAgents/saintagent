import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Save, Loader2, Copy, Check, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from 'sonner';
import WeeklySlotEditor from './WeeklySlotEditor';

const DAYS = [
  { code: 'mon', label: 'Mon' },
  { code: 'tue', label: 'Tue' },
  { code: 'wed', label: 'Wed' },
  { code: 'thu', label: 'Thu' },
  { code: 'fri', label: 'Fri' },
  { code: 'sat', label: 'Sat' },
  { code: 'sun', label: 'Sun' },
];

// Convert onboarding time_windows to hour ranges
const TIME_WINDOW_HOURS = {
  morning: { start_hour: 8, start_minute: 0, end_hour: 12, end_minute: 0 },
  afternoon: { start_hour: 12, start_minute: 0, end_hour: 17, end_minute: 0 },
  evening: { start_hour: 17, start_minute: 0, end_hour: 21, end_minute: 0 }
};

// Build weekly_slots from onboarding data (days_of_week + time_windows) or legacy start/end hour
function migrateToWeeklySlots(pref) {
  if (pref.weekly_slots?.length > 0) return pref.weekly_slots;
  const days = pref.days_of_week?.length ? pref.days_of_week : ['mon', 'tue', 'wed', 'thu', 'fri'];
  const windows = pref.time_windows?.length ? pref.time_windows : null;

  if (windows) {
    // Merge adjacent windows into continuous blocks per day
    const ordered = ['morning', 'afternoon', 'evening'].filter(w => windows.includes(w));
    const merged = [];
    let current = null;
    for (const w of ordered) {
      const range = TIME_WINDOW_HOURS[w];
      if (current && current.end_hour === range.start_hour) {
        current = { ...current, end_hour: range.end_hour, end_minute: range.end_minute };
      } else {
        if (current) merged.push(current);
        current = { ...range };
      }
    }
    if (current) merged.push(current);

    const slots = [];
    for (const day of days) {
      for (const block of merged) {
        slots.push({ day, ...block });
      }
    }
    return slots;
  }

  // Fallback: single window from legacy start/end hour
  return days.map(day => ({
    day,
    start_hour: pref.start_hour ?? 9,
    start_minute: 0,
    end_hour: pref.end_hour ?? 17,
    end_minute: 0
  }));
}

export default function AvailabilitySettings() {
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: prefs, isLoading } = useQuery({
    queryKey: ['myAvailPref', currentUser?.email],
    queryFn: () => base44.entities.AvailabilityPreference.filter({ user_id: currentUser.email }),
    enabled: !!currentUser?.email
  });
  const pref = prefs?.[0];

  const [form, setForm] = useState({
    booking_enabled: false,
    weekly_slots: [],
    slot_duration_minutes: 30,
    buffer_minutes: 15,
    meeting_format: 'online',
    booking_message: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  });

  useEffect(() => {
    if (pref) {
      setForm({
        booking_enabled: pref.booking_enabled ?? false,
        weekly_slots: migrateToWeeklySlots(pref),
        slot_duration_minutes: pref.slot_duration_minutes ?? 30,
        buffer_minutes: pref.buffer_minutes ?? 15,
        meeting_format: pref.meeting_format ?? 'online',
        booking_message: pref.booking_message ?? '',
        timezone: pref.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
      });
    }
  }, [pref]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      // Derive days_of_week and start/end hour from weekly_slots for backward compat
      const days_of_week = [...new Set(form.weekly_slots.map(s => s.day))];
      const allStarts = form.weekly_slots.map(s => s.start_hour);
      const allEnds = form.weekly_slots.map(s => s.end_hour);
      const saveData = {
        ...form,
        days_of_week,
        start_hour: allStarts.length ? Math.min(...allStarts) : 9,
        end_hour: allEnds.length ? Math.max(...allEnds) : 17
      };
      if (pref) {
        await base44.entities.AvailabilityPreference.update(pref.id, saveData);
      } else {
        await base44.entities.AvailabilityPreference.create({
          user_id: currentUser.email,
          ...saveData
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myAvailPref'] });
      toast.success('Availability settings saved!');
    }
  });

  // No longer needed - weekly slots handle day selection

  const bookingUrl = currentUser
    ? `${window.location.origin}/BookCall?host=${encodeURIComponent(currentUser.email)}`
    : '';

  const copyLink = () => {
    navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    toast.success('Booking link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-violet-600" />
            Open Call Times
          </h3>
          <p className="text-sm text-slate-500">Let others book meetings with you based on your Google Calendar availability</p>
        </div>
        <Switch
          checked={form.booking_enabled}
          onCheckedChange={(v) => setForm(f => ({ ...f, booking_enabled: v }))}
        />
      </div>

      {form.booking_enabled && (
        <>
          {/* Booking Link */}
          <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
            <Label className="text-xs text-violet-700 mb-2 block">Your booking link</Label>
            <div className="flex gap-2">
              <Input value={bookingUrl} readOnly className="text-sm bg-white" />
              <Button variant="outline" size="sm" onClick={copyLink} className="shrink-0 gap-1">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>

          {/* Weekly Availability Slots */}
          <div>
            <Label className="mb-2 block">Weekly Availability</Label>
            <WeeklySlotEditor
              slots={form.weekly_slots}
              onChange={(slots) => setForm(f => ({ ...f, weekly_slots: slots }))}
            />
          </div>

          {/* Slot Duration & Buffer */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Slot Duration</Label>
              <Select value={form.slot_duration_minutes.toString()} onValueChange={(v) => setForm(f => ({ ...f, slot_duration_minutes: parseInt(v) }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Buffer Between Meetings</Label>
              <Select value={form.buffer_minutes.toString()} onValueChange={(v) => setForm(f => ({ ...f, buffer_minutes: parseInt(v) }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No buffer</SelectItem>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Timezone */}
          <div>
            <Label>Timezone</Label>
            <Input
              value={form.timezone}
              onChange={(e) => setForm(f => ({ ...f, timezone: e.target.value }))}
              placeholder="e.g., America/Phoenix"
              className="mt-1"
            />
            <p className="text-xs text-slate-500 mt-1">Your local timezone for slot calculations</p>
          </div>

          {/* Custom Message */}
          <div>
            <Label>Booking Page Message (optional)</Label>
            <Textarea
              placeholder="e.g., Looking forward to connecting! Please include what you'd like to discuss."
              value={form.booking_message}
              onChange={(e) => setForm(f => ({ ...f, booking_message: e.target.value }))}
              rows={2}
            />
          </div>
        </>
      )}

      <Button
        onClick={() => saveMutation.mutate()}
        disabled={saveMutation.isPending}
        className="bg-violet-600 hover:bg-violet-700 gap-2"
      >
        {saveMutation.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        Save Settings
      </Button>
    </div>
  );
}