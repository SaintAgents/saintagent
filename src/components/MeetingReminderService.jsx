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

  const createNotification = useMutation({
    mutationFn: (data) => base44.entities.Notification.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['meetingNotifications'] });
    },
  });

  useEffect(() => {
    if (!currentUser || !meetings.length) return;

    const checkMeetingsAndEvents = () => {
      const now = new Date();
      const reminderWindows = [15, 60]; // 15 minutes and 1 hour

      // Meetings
        // Only check meetings where current user is participant
        if (meeting.host_id !== currentUser.email && meeting.guest_id !== currentUser.email) {
          return;
        }

        const meetingTime = new Date(meeting.scheduled_time);
        const minutesUntil = (meetingTime - now) / (1000 * 60);

        // Check if meeting is in the future and within 2 hours
        if (minutesUntil > 0 && minutesUntil <= 120) {
          reminderWindows.forEach(window => {
            // If meeting is within the window (with 1-minute tolerance)
            if (Math.abs(minutesUntil - window) <= 1) {
              // Check if we already sent this notification
              const notificationKey = `meeting-${meeting.id}-${window}min`;
              const alreadySent = existingNotifications.some(n => 
                n.metadata?.meeting_id === meeting.id && 
                n.metadata?.reminder_window === window
              );

              if (!alreadySent) {
                const otherPerson = meeting.host_id === currentUser.email 
                  ? meeting.guest_name 
                  : meeting.host_name;

                createNotification.mutate({
                  user_id: currentUser.email,
                  type: 'meeting',
                  title: `Meeting Reminder`,
                  message: `Your meeting "${meeting.title}" with ${otherPerson} starts in ${window} minutes`,
                  action_url: `/meetings`,
                  action_label: 'View Meeting',
                  priority: window <= 15 ? 'high' : 'normal',
                  metadata: {
                    meeting_id: meeting.id,
                    reminder_window: window
                  }
                });

                // Show toast for immediate notifications (15 min)
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
    };

    checkMeetingsAndEvents();
  }, [meetings, currentUser, existingNotifications, createNotification]);

  return null; // This is a service component with no UI
}