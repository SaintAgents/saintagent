import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function MeetingReminderService() {
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: meetings = [] } = useQuery({
    queryKey: ['upcomingMeetings'],
    queryFn: () => base44.entities.Meeting.filter({ status: 'scheduled' }, '-scheduled_time', 50),
    enabled: !!currentUser,
    refetchInterval: 60000, // Check every minute
  });

  // Host's upcoming events
  const { data: myEvents = [] } = useQuery({
    queryKey: ['upcomingEvents', currentUser?.email],
    queryFn: () => base44.entities.Event.filter({ host_id: currentUser.email }, '-start_time', 100),
    enabled: !!currentUser?.email,
    refetchInterval: 60000,
  });

  const { data: existingNotifications = [] } = useQuery({
    queryKey: ['calendarNotifications', currentUser?.email],
    queryFn: () => base44.entities.Notification.filter({ 
      user_id: currentUser?.email
    }, '-created_date', 200),
    enabled: !!currentUser,
  });

  // Today's Daily Ops log for schedule reminders
  const todayStr = new Date().toISOString().slice(0, 10);
  const { data: myDailyLogs = [] } = useQuery({
    queryKey: ['dailyLogReminder', currentUser?.email, todayStr],
    queryFn: () => base44.entities.DailyLog.filter({ user_id: currentUser.email, date: todayStr }),
    enabled: !!currentUser?.email,
    refetchInterval: 60000,
  });

  const createNotification = useMutation({
    mutationFn: (data) => base44.entities.Notification.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['calendarNotifications'] });
    },
  });

  useEffect(() => {
    if (!currentUser || !meetings.length) return;

    const checkMeetingsAndEvents = () => {
      const now = new Date();
      const reminderWindows = [15, 60]; // 15 minutes and 1 hour
      const scheduleWindows = [5, 15]; // for personal schedule items

      // Meetings (where current user is host or guest)
      (meetings || []).forEach((meeting) => {
        if (meeting.host_id !== currentUser.email && meeting.guest_id !== currentUser.email) return;
        const meetingTime = new Date(meeting.scheduled_time);
        const minutesUntil = (meetingTime - now) / (1000 * 60);
        if (minutesUntil > 0 && minutesUntil <= 120) {
          reminderWindows.forEach((window) => {
            if (Math.abs(minutesUntil - window) <= 1) {
              const alreadySent = existingNotifications.some(
                (n) => n.metadata?.meeting_id === meeting.id && n.metadata?.reminder_window === window
              );
              if (!alreadySent) {
                const otherPerson = meeting.host_id === currentUser.email ? meeting.guest_name : meeting.host_name;
                createNotification.mutate({
                  user_id: currentUser.email,
                  type: 'meeting',
                  title: 'Meeting Reminder',
                  message: `Your meeting "${meeting.title}" with ${otherPerson} starts in ${window} minutes`,
                  action_url: '/Meetings',
                  action_label: 'View Meeting',
                  priority: window <= 15 ? 'high' : 'normal',
                  metadata: { meeting_id: meeting.id, reminder_window: window },
                });
                if (window <= 15) {
                  toast.info(`Meeting starting in ${window} minutes`, {
                    description: `"${meeting.title}" with ${otherPerson}`,
                    duration: 10000,
                  });
                }
              }
            }
          });
        }
      });

      // Events (hosted by current user)
      (myEvents || []).forEach((evt) => {
        if (evt.host_id !== currentUser.email || !evt.start_time) return;
        const eventTime = new Date(evt.start_time);
        const minutesUntil = (eventTime - now) / (1000 * 60);
        if (minutesUntil > 0 && minutesUntil <= 120) {
          reminderWindows.forEach((window) => {
            if (Math.abs(minutesUntil - window) <= 1) {
              const alreadySent = existingNotifications.some(
                (n) => n.metadata?.event_id === evt.id && n.metadata?.reminder_window === window
              );
              if (!alreadySent) {
                createNotification.mutate({
                  user_id: currentUser.email,
                  type: 'event',
                  title: 'Event Reminder',
                  message: `Your event "${evt.title}" starts in ${window} minutes`,
                  action_url: `/EventDetail?id=${evt.id}`,
                  action_label: 'Open Event',
                  priority: window <= 15 ? 'high' : 'normal',
                  metadata: { event_id: evt.id, reminder_window: window },
                });
                if (window <= 15) {
                  toast.info(`Event starting in ${window} minutes`, {
                    description: `"${evt.title}"`,
                    duration: 10000,
                  });
                }
              }
            }
          });
        }
      });

      // Personal schedule items from Daily Ops
      const daily = (myDailyLogs || [])[0];
      const schedule = Array.isArray(daily?.schedule) ? daily.schedule : [];
      schedule.forEach((blk, idx) => {
        const t = (blk?.time_block || '').trim();
        if (!t) return;
        // parse HH:mm (24h) best-effort
        let hours = null, minutes = 0;
        const m = t.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
        if (m) {
          hours = parseInt(m[1], 10);
          minutes = m[2] ? parseInt(m[2], 10) : 0;
          const ampm = m[3]?.toLowerCase();
          if (ampm) {
            if (ampm === 'pm' && hours < 12) hours += 12;
            if (ampm === 'am' && hours === 12) hours = 0;
          }
        }
        if (hours == null || hours > 23 || minutes > 59) return;
        const schedTime = new Date();
        schedTime.setHours(hours, minutes, 0, 0);
        const minutesUntil = (schedTime - now) / (1000 * 60);
        if (minutesUntil > 0 && minutesUntil <= 120) {
          scheduleWindows.forEach((window) => {
            if (Math.abs(minutesUntil - window) <= 1) {
              const alreadySent = existingNotifications.some(
                (n) => n.metadata?.daily_date === todayStr && n.metadata?.schedule_index === idx && n.metadata?.reminder_window === window
              );
              if (!alreadySent) {
                createNotification.mutate({
                  user_id: currentUser.email,
                  type: 'system',
                  title: 'Upcoming Task',
                  message: `"${blk.title || 'Scheduled item'}" starts in ${window} minutes`,
                  action_url: `/DailyOps`,
                  action_label: 'Open Daily Ops',
                  priority: window <= 5 ? 'high' : 'normal',
                  metadata: { daily_date: todayStr, schedule_index: idx, reminder_window: window },
                });
                if (window <= 5) {
                  toast.info('Upcoming task', {
                    description: `"${blk.title || 'Scheduled item'}" in ${window} minutes`,
                    duration: 8000,
                  });
                }
              }
            }
          });
        }
      });
    };

    checkMeetingsAndEvents();
  }, [meetings, currentUser, existingNotifications, createNotification]);

  return null; // This is a service component with no UI
}