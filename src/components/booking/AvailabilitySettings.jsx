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

const DAYS = [
  { code: 'mon', label: 'Mon' },
  { code: 'tue', label: 'Tue' },
  { code: 'wed', label: 'Wed' },
  { code: 'thu', label: 'Thu' },
  { code: 'fri', label: 'Fri' },
  { code: 'sat', label: 'Sat' },
  { code: 'sun', label: 'Sun' },
];

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
    days_of_week: ['mon', 'tue', 'wed', 'thu', 'fri'],
    start_hour: 9,
    end_hour: 17,
    slot_duration_minutes: 30,
    buffer_minutes: 15,
    meeting_format: 'online',
    booking_message: '',
    timezone: 'UTC'
  });

  useEffect(() => {
    if (pref) {
      setForm({
        booking_enabled: pref.booking_enabled ?? false,
        days_of_week: pref.days_of_week?.length ? pref.days_of_week : ['mon', 'tue', 'wed', 'thu', 'fri'],
        start_hour: pref.start_hour ?? 9,
        end_hour: pref.end_hour ?? 17,
        slot_duration_minutes: pref.slot_duration_minutes ?? 30,
        buffer_minutes: pref.buffer_minutes ?? 15,
        meeting_format: pref.meeting_format ?? 'online',
        booking_message: pref.booking_message ?? '',
        timezone: pref.timezone ?? 'UTC'
      });
    }
  }, [pref]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (pref) {
        await base44.entities.AvailabilityPreference.update(pref.id, form);
      } else {
        await base44.entities.AvailabilityPreference.create({
          user_id: currentUser.email,
          ...form
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myAvailPref'] });
      toast.success('Availability settings saved!');
    }
  });

  const toggleDay = (day) => {
    setForm(f => ({
      ...f,
      days_of_week: f.days_of_week.includes(day)
        ? f.days_of_week.filter(d => d !== day)
        : [...f.days_of_week, day]
    }));
  };

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

          {/* Days of Week */}
          <div>
            <Label className="mb-2 block">Available Days</Label>
            <div className="flex gap-2">
              {DAYS.map(d => (
                <button
                  key={d.code}
                  onClick={() => toggleDay(d.code)}
                  className={cn(
                    "w-10 h-10 rounded-lg text-sm font-medium transition-all border",
                    form.days_of_week.includes(d.code)
                      ? "bg-violet-600 text-white border-violet-600"
                      : "bg-white text-slate-500 border-slate-200 hover:border-violet-300"
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Hour</Label>
              <Select value={form.start_hour.toString()} onValueChange={(v) => setForm(f => ({ ...f, start_hour: parseInt(v) }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 18 }, (_, i) => i + 6).map(h => (
                    <SelectItem key={h} value={h.toString()}>
                      {h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>End Hour</Label>
              <Select value={form.end_hour.toString()} onValueChange={(v) => setForm(f => ({ ...f, end_hour: parseInt(v) }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 18 }, (_, i) => i + 6).map(h => (
                    <SelectItem key={h} value={h.toString()}>
                      {h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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