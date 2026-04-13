import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar as CalendarIcon, Clock, Loader2, Check, ArrowLeft, 
  Send, ChevronRight
} from "lucide-react";
import { format, addDays, isBefore, startOfDay, addMinutes } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from 'sonner';
import BackButton from '@/components/hud/BackButton';
import TimeSlotGrid from '@/components/booking/TimeSlotGrid';
import BookingConfirmation from '@/components/booking/BookingConfirmation';
import CallIntakeForm from '@/components/booking/CallIntakeForm';
import BookingNotAvailable from '@/components/booking/BookingNotAvailable';

export default function BookCall() {
  const urlParams = new URLSearchParams(window.location.search);
  const hostUserId = urlParams.get('host');

  const [step, setStep] = useState(1); // 1=select date, 2=select time, 3=intake form, 4=success
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [intakeForm, setIntakeForm] = useState({
    title: '',
    meetingType: 'casual',
    topics: [],
    message: '',
    additionalNotes: ''
  });
  const [bookedEvent, setBookedEvent] = useState(null);
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: myProfile } = useQuery({
    queryKey: ['myProfile', currentUser?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: currentUser.email }),
    enabled: !!currentUser?.email
  });

  // Load host's profile
  const { data: hostProfiles } = useQuery({
    queryKey: ['hostProfile', hostUserId],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: hostUserId }),
    enabled: !!hostUserId
  });
  const hostProfile = hostProfiles?.[0];

  // Load host's availability preferences
  const { data: availPrefs } = useQuery({
    queryKey: ['availPref', hostUserId],
    queryFn: () => base44.entities.AvailabilityPreference.filter({ user_id: hostUserId }),
    enabled: !!hostUserId
  });
  const availPref = availPrefs?.[0];

  // Fetch busy slots for selected date
  const { data: busyData, isLoading: loadingSlots } = useQuery({
    queryKey: ['busySlots', selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null],
    queryFn: async () => {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const res = await base44.functions.invoke('calendarBooking', {
        action: 'getFreeBusy',
        timeMin: `${dateStr}T00:00:00Z`,
        timeMax: `${dateStr}T23:59:59Z`
      });
      return res.data;
    },
    enabled: !!selectedDate
  });

  // Generate available time slots from weekly_slots or legacy fields
  const availableSlots = useMemo(() => {
    if (!selectedDate || !busyData?.success) return [];

    const dayMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const dayCode = dayMap[selectedDate.getDay()];
    const slotDuration = availPref?.slot_duration_minutes ?? 30;
    const buffer = availPref?.buffer_minutes ?? 15;
    const busySlots = busyData.busySlots || [];
    const now = new Date();
    const slots = [];

    // Check for date exception with custom hours
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const exception = (availPref?.date_exceptions || []).find(e => e.date === dateStr);

    // Get time windows for this day
    let windows = [];
    if (exception?.type === 'custom' && exception.slots?.length > 0) {
      // Use custom hours from exception
      windows = exception.slots;
    } else if (availPref?.weekly_slots?.length > 0) {
      windows = availPref.weekly_slots.filter(s => s.day === dayCode);
    } else {
      const startHour = availPref?.start_hour ?? 9;
      const endHour = availPref?.end_hour ?? 17;
      windows = [{ start_hour: startHour, start_minute: 0, end_hour: endHour, end_minute: 0 }];
    }

    for (const window of windows) {
      const winStartMin = window.start_hour * 60 + (window.start_minute || 0);
      const winEndMin = window.end_hour * 60 + (window.end_minute || 0);

      for (let totalMin = winStartMin; totalMin + slotDuration <= winEndMin; totalMin += slotDuration) {
        const h = Math.floor(totalMin / 60);
        const m = totalMin % 60;
        const slotStart = new Date(selectedDate);
        slotStart.setHours(h, m, 0, 0);
        const slotEnd = addMinutes(slotStart, slotDuration);

        // Skip past slots
        if (isBefore(slotStart, now)) continue;

        // Check if slot conflicts with any busy period (including buffer)
        const bufferedStart = addMinutes(slotStart, -buffer);
        const bufferedEnd = addMinutes(slotEnd, buffer);

        const isBusy = busySlots.some(busy => {
          const busyStart = new Date(busy.start);
          const busyEnd = new Date(busy.end);
          return bufferedStart < busyEnd && bufferedEnd > busyStart;
        });

        if (!isBusy) {
          slots.push({
            start: slotStart.toISOString(),
            end: slotEnd.toISOString(),
            label: format(slotStart, 'h:mm a'),
            endLabel: format(slotEnd, 'h:mm a')
          });
        }
      }
    }
    return slots;
  }, [selectedDate, busyData, availPref]);

  // Check which days of week are allowed, respecting date exceptions
  const isDayAllowed = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    // Check date exceptions first
    const exception = (availPref?.date_exceptions || []).find(e => e.date === dateStr);
    if (exception) {
      // Blocked dates are never allowed
      if (exception.type === 'blocked') return false;
      // Custom dates are allowed (they have custom slots)
      if (exception.type === 'custom') return true;
    }

    const dayMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const dayCode = dayMap[date.getDay()];
    if (availPref?.weekly_slots?.length > 0) {
      return availPref.weekly_slots.some(s => s.day === dayCode);
    }
    if (!availPref?.days_of_week?.length) return true;
    return availPref.days_of_week.includes(dayCode);
  };

  // Build structured notes from intake form
  const buildMeetingNotes = () => {
    const parts = [];
    if (intakeForm.meetingType) {
      const typeLabels = { casual: 'Casual Chat', collaboration: 'Collaboration', mentorship: 'Mentorship', consultation: 'Consultation', mission: 'Mission Planning', in_person: 'In-Person Meetup' };
      parts.push(`Call Type: ${typeLabels[intakeForm.meetingType] || intakeForm.meetingType}`);
    }
    if (intakeForm.topics?.length > 0) {
      parts.push(`Topics: ${intakeForm.topics.join(', ')}`);
    }
    if (intakeForm.message) {
      parts.push(`\nContext:\n${intakeForm.message}`);
    }
    if (intakeForm.additionalNotes) {
      parts.push(`\nAdditional Notes:\n${intakeForm.additionalNotes}`);
    }
    return parts.join('\n');
  };

  const bookingMutation = useMutation({
    mutationFn: async () => {
      if (!selectedSlot || !currentUser) throw new Error('Missing data');

      const me = myProfile?.[0];
      const hostName = hostProfile?.display_name || hostUserId;
      const guestName = currentUser.full_name || me?.display_name || 'Guest';
      const meetingTitle = intakeForm.title || `Meeting with ${hostName}`;
      const notes = buildMeetingNotes();

      // 1. Create Google Calendar event
      const hostTz = availPref?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      const calRes = await base44.functions.invoke('calendarBooking', {
        action: 'createEvent',
        summary: meetingTitle,
        description: notes,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
        attendeeEmails: [currentUser.email, hostUserId].filter(Boolean),
        timeZone: hostTz
      });

      // 2. Create Meeting entity
      const meeting = await base44.entities.Meeting.create({
        title: meetingTitle,
        host_id: hostUserId,
        guest_id: currentUser.email,
        host_name: hostName,
        guest_name: guestName,
        host_avatar: hostProfile?.avatar_url,
        guest_avatar: me?.avatar_url,
        scheduled_time: selectedSlot.start,
        duration_minutes: availPref?.slot_duration_minutes || 30,
        meeting_type: intakeForm.meetingType,
        location: 'Online',
        notes: notes,
        status: 'scheduled'
      });

      // 3. Notify host
      const typeLabels = { casual: 'casual', collaboration: 'collaboration', mentorship: 'mentorship', consultation: 'consultation', mission: 'mission planning', in_person: 'in-person' };
      await base44.entities.Notification.create({
        user_id: hostUserId,
        type: 'meeting',
        title: 'New Meeting Booked',
        message: `${guestName} booked a ${typeLabels[intakeForm.meetingType] || 'casual'} call on ${format(new Date(selectedSlot.start), 'MMM d')} at ${format(new Date(selectedSlot.start), 'h:mm a')}${intakeForm.topics?.length ? ` — Topics: ${intakeForm.topics.join(', ')}` : ''}`,
        action_url: '/Meetings',
        action_label: 'View Meeting',
        source_user_id: currentUser.email,
        source_user_name: guestName,
        source_user_avatar: me?.avatar_url
      });

      return { calEvent: calRes.data, meeting };
    },
    onSuccess: (data) => {
      setBookedEvent(data);
      setStep(4);
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      toast.success('Meeting booked and added to Google Calendar!');
    }
  });

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setStep(2);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setStep(3);
  };

  const isOwnProfile = currentUser?.email === hostUserId;

  // No host param
  if (!hostUserId) {
    return <BookingNotAvailable hostProfile={null} isOwnProfile={false} />;
  }

  // Host hasn't enabled booking (or no pref record)
  if (availPrefs !== undefined && (!availPref || !availPref.booking_enabled)) {
    return <BookingNotAvailable hostProfile={hostProfile} isOwnProfile={isOwnProfile} />;
  }

  if (step === 4 && bookedEvent) {
    return <BookingConfirmation 
      event={bookedEvent} 
      hostProfile={hostProfile} 
      selectedSlot={selectedSlot}
      meetingType={intakeForm.meetingType}
      timezone={availPref?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'}
    />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <BackButton />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Book a Call</h1>
            <p className="text-slate-500 text-sm">Select a time that works for you</p>
          </div>
        </div>

        {/* Host Info Card */}
        {hostProfile && (
          <div className="bg-white rounded-xl border p-5 mb-6 flex items-center gap-4">
            <Avatar className="w-14 h-14">
              <AvatarImage src={hostProfile.avatar_url} />
              <AvatarFallback className="text-lg">{hostProfile.display_name?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="font-semibold text-slate-900 text-lg">{hostProfile.display_name}</h2>
              <p className="text-sm text-slate-500">@{hostProfile.handle}</p>
              {availPref?.booking_message && (
                <p className="text-sm text-slate-600 mt-1">{availPref.booking_message}</p>
              )}
            </div>
            <div className="text-right">
              <Badge className="bg-emerald-100 text-emerald-700">
                {availPref?.slot_duration_minutes || 30} min
              </Badge>
              <p className="text-xs text-slate-400 mt-1">
                {availPref?.meeting_format || 'online'}
              </p>
            </div>
          </div>
        )}

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[
            { num: 1, label: 'Date' },
            { num: 2, label: 'Time' },
            { num: 3, label: 'About Call' }
          ].map(({ num, label }) => (
            <React.Fragment key={num}>
              <button
                onClick={() => num < step && setStep(num)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                  step === num && "bg-violet-600 text-white",
                  step > num && "bg-emerald-100 text-emerald-700 cursor-pointer",
                  step < num && "bg-slate-100 text-slate-400"
                )}
              >
                {step > num ? <Check className="w-4 h-4" /> : num}
                <span className="hidden sm:inline">{label}</span>
              </button>
              {num < 3 && <ChevronRight className="w-4 h-4 text-slate-300" />}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Date Selection */}
        {step === 1 && (
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-violet-600" />
              Select a Date
            </h3>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date) => 
                isBefore(startOfDay(date), startOfDay(new Date())) || 
                isBefore(date, new Date()) ||
                date > addDays(new Date(), 60) ||
                !isDayAllowed(date)
              }
              className="rounded-md mx-auto"
            />
          </div>
        )}

        {/* Step 2: Time Selection */}
        {step === 2 && selectedDate && (
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-violet-600" />
                Available Times — {format(selectedDate, 'EEEE, MMM d')}
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Change Date
              </Button>
            </div>
            <TimeSlotGrid
              slots={availableSlots}
              loading={loadingSlots}
              selectedSlot={selectedSlot}
              onSelect={handleSlotSelect}
            />
          </div>
        )}

        {/* Step 3: Intake Form + Confirm */}
        {step === 3 && selectedSlot && (
          <div className="bg-white rounded-xl border p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Send className="w-5 h-5 text-violet-600" />
                Tell {hostProfile?.display_name || 'the host'} about your call
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Change Time
              </Button>
            </div>

            {/* Time Summary */}
            <div className="bg-violet-50 rounded-lg p-4 border border-violet-100">
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-5 h-5 text-violet-600" />
                <div>
                  <p className="font-medium text-violet-900">
                    {format(new Date(selectedSlot.start), 'EEEE, MMMM d, yyyy')}
                  </p>
                  <p className="text-sm text-violet-600">
                    {selectedSlot.label} — {selectedSlot.endLabel}
                  </p>
                  <p className="text-xs text-violet-500 mt-0.5">
                    Timezone: {availPref?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'}
                  </p>
                </div>
              </div>
            </div>

            <CallIntakeForm
              form={intakeForm}
              onChange={setIntakeForm}
              hostName={hostProfile?.display_name}
            />

            <Button
              onClick={() => bookingMutation.mutate()}
              disabled={bookingMutation.isPending}
              className="w-full bg-violet-600 hover:bg-violet-700 gap-2"
            >
              {bookingMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Booking & Adding to Calendar...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Confirm Booking
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}