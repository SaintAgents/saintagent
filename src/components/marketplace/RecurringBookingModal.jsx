import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Repeat, User, CalendarCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00"
];

export default function RecurringBookingModal({ open, onOpenChange, listing }) {
  const [frequency, setFrequency] = useState('weekly');
  const [dayOfWeek, setDayOfWeek] = useState('1');
  const [dayOfMonth, setDayOfMonth] = useState('1');
  const [timeSlot, setTimeSlot] = useState('');
  const [totalSessions, setTotalSessions] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 300000
  });

  const { data: profiles } = useQuery({
    queryKey: ['myProfile', currentUser?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: currentUser.email }, '-updated_date', 1),
    enabled: !!currentUser?.email,
    staleTime: 300000
  });
  const myProfile = profiles?.[0];

  // Get available time slots for selected day based on provider's recurring_availability
  const availableSlots = React.useMemo(() => {
    if (!listing?.recurring_availability?.length) return TIME_SLOTS;
    const dayNum = parseInt(dayOfWeek);
    const dayWindows = listing.recurring_availability.filter(w => w.day_of_week === dayNum);
    if (dayWindows.length === 0) return [];
    
    return TIME_SLOTS.filter(slot => {
      return dayWindows.some(w => slot >= w.start_time && slot < w.end_time);
    });
  }, [listing?.recurring_availability, dayOfWeek]);

  // Available days based on provider's recurring_availability
  const availableDays = React.useMemo(() => {
    if (!listing?.recurring_availability?.length) return [0,1,2,3,4,5,6];
    return [...new Set(listing.recurring_availability.map(w => w.day_of_week))].sort();
  }, [listing?.recurring_availability]);

  const handleSubmit = async () => {
    if (!timeSlot || !listing || !currentUser) return;
    setIsSubmitting(true);

    // Calculate next session date
    const now = new Date();
    let nextSession = new Date();
    if (frequency === 'monthly') {
      const dom = parseInt(dayOfMonth);
      nextSession.setDate(dom);
      if (nextSession <= now) nextSession.setMonth(nextSession.getMonth() + 1);
    } else {
      const targetDay = parseInt(dayOfWeek);
      const currentDay = now.getDay();
      let daysUntil = (targetDay - currentDay + 7) % 7;
      if (daysUntil === 0) daysUntil = frequency === 'biweekly' ? 14 : 7;
      nextSession.setDate(now.getDate() + daysUntil);
    }
    const [h, m] = timeSlot.split(':');
    nextSession.setHours(parseInt(h), parseInt(m), 0, 0);

    await base44.entities.RecurringBooking.create({
      listing_id: listing.id,
      listing_title: listing.title,
      buyer_id: currentUser.email,
      buyer_name: myProfile?.display_name || currentUser.full_name,
      seller_id: listing.owner_id,
      seller_name: listing.owner_name,
      frequency,
      day_of_week: frequency !== 'monthly' ? parseInt(dayOfWeek) : undefined,
      day_of_month: frequency === 'monthly' ? parseInt(dayOfMonth) : undefined,
      time_slot: timeSlot,
      duration_minutes: listing.duration_minutes || 60,
      start_date: new Date().toISOString().split('T')[0],
      total_sessions: totalSessions ? parseInt(totalSessions) : undefined,
      status: 'pending',
      next_session_date: nextSession.toISOString(),
      amount_per_session: listing.is_free ? 0 : (listing.price_amount || 0),
      ggg_per_session: listing.price_ggg || 0,
      notes,
    });

    await base44.entities.Notification.create({
      user_id: listing.owner_id,
      type: 'booking',
      title: 'New Recurring Booking Request',
      message: `${myProfile?.display_name || currentUser.full_name} wants to book recurring ${frequency} sessions for "${listing.title}"`,
      action_url: '/Marketplace',
      source_user_id: currentUser.email,
      source_user_name: myProfile?.display_name || currentUser.full_name,
      source_user_avatar: myProfile?.avatar_url,
    });

    queryClient.invalidateQueries({ queryKey: ['recurringBookings'] });
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    onOpenChange(false);
    setIsSubmitting(false);
    setNotes('');
    setTimeSlot('');
    setTotalSessions('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Repeat className="w-5 h-5 text-violet-600" />
            Book Recurring Sessions
          </DialogTitle>
        </DialogHeader>

        {listing && (
          <div className="p-3 rounded-lg bg-violet-50 border border-violet-100 mb-2">
            <p className="font-semibold text-slate-900 text-sm">{listing.title}</p>
            <p className="text-xs text-slate-500 mt-0.5">with {listing.owner_name} · {listing.duration_minutes}min</p>
          </div>
        )}

        <div className="space-y-4">
          {/* Frequency */}
          <div>
            <Label>Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Every week</SelectItem>
                <SelectItem value="biweekly">Every 2 weeks</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Day selection */}
          {frequency !== 'monthly' ? (
            <div>
              <Label>Day of the week</Label>
              <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((day, i) => (
                    <SelectItem key={i} value={String(i)} disabled={availableDays.length > 0 && !availableDays.includes(i)}>
                      {day} {availableDays.length > 0 && !availableDays.includes(i) ? '(unavailable)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div>
              <Label>Day of the month</Label>
              <Select value={dayOfMonth} onValueChange={setDayOfMonth}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
                    <SelectItem key={d} value={String(d)}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Time slot */}
          <div>
            <Label>Time</Label>
            <Select value={timeSlot} onValueChange={setTimeSlot}>
              <SelectTrigger className="mt-1">
                <Clock className="w-4 h-4 mr-2 text-slate-400" />
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {(availableSlots.length > 0 ? availableSlots : TIME_SLOTS).map(slot => (
                  <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableSlots.length === 0 && listing?.recurring_availability?.length > 0 && (
              <p className="text-xs text-amber-600 mt-1">Provider has no availability on this day</p>
            )}
          </div>

          {/* Total sessions */}
          <div>
            <Label>Number of sessions (optional)</Label>
            <Input
              type="number"
              min="1"
              max="52"
              placeholder="Ongoing (no limit)"
              value={totalSessions}
              onChange={e => setTotalSessions(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Price summary */}
          {listing && !listing.is_free && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Per session</span>
                <span className="font-semibold text-slate-900">
                  {listing.price_ggg > 0 ? `${listing.price_ggg} GGG` : `$${listing.price_amount}`}
                </span>
              </div>
              {totalSessions && (
                <div className="flex justify-between text-sm mt-1 pt-1 border-t border-emerald-200">
                  <span className="text-slate-600">Total ({totalSessions} sessions)</span>
                  <span className="font-bold text-emerald-700">
                    {listing.price_ggg > 0
                      ? `${listing.price_ggg * parseInt(totalSessions)} GGG`
                      : `$${(listing.price_amount * parseInt(totalSessions)).toFixed(2)}`}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <Label>Notes (optional)</Label>
            <Textarea
              placeholder="Any preferences or details for your recurring sessions..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              className="mt-1"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={!timeSlot || isSubmitting}
            className="flex-1 bg-violet-600 hover:bg-violet-700"
          >
            {isSubmitting ? 'Sending...' : 'Request Recurring'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}