import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import FeedbackDialog from './FeedbackDialog';
import { format } from 'date-fns';

export default function SessionList() {
  const qc = useQueryClient();
  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const { data: sessions = [] } = useQuery({
    queryKey: ['mentorshipSessions', user?.email],
    queryFn: async () => user?.email ? base44.entities.MentorshipSession.filter({ $or: [{ mentor_id: user.email }, { mentee_id: user.email }] }, '-created_date', 100) : [],
    enabled: !!user?.email
  });

  const update = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MentorshipSession.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mentorshipSessions'] })
  });

  const [scheduleData, setScheduleData] = React.useState({});

  const handleSchedule = (s) => {
    const dt = scheduleData[s.id];
    if (!dt) return;
    update.mutate({ id: s.id, data: { scheduled_time: new Date(dt).toISOString(), status: 'scheduled' } });
  };

  const handleFeedback = (s, who) => async ({ rating, comment }) => {
    const patch = who === 'mentor'
      ? { feedback_mentor_rating: rating, feedback_mentor_comment: comment, status: 'completed' }
      : { feedback_mentee_rating: rating, feedback_mentee_comment: comment, status: 'completed' };
    update.mutate({ id: s.id, data: patch });
  };

  return (
    <div className="space-y-3">
      {sessions.length === 0 && <p className="text-sm text-slate-500">No sessions yet</p>}
      {sessions.map((s) => {
        const isMentor = s.mentor_id === user?.email;
        const when = s.scheduled_time ? format(new Date(s.scheduled_time), 'PP p') : 'Not scheduled';
        return (
          <Card key={s.id}>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <div className="text-sm text-slate-500">Status: <span className="font-medium text-slate-700 capitalize">{s.status}</span></div>
                  <div className="text-sm">When: {when}</div>
                  {s.objectives && <div className="text-xs text-slate-500 mt-1">Objectives: {s.objectives}</div>}
                </div>
                <div className="flex items-center gap-2">
                  {s.status === 'requested' && isMentor && (
                    <div className="flex items-center gap-2">
                      <Input type="datetime-local" value={scheduleData[s.id] || ''} onChange={(e) => setScheduleData({ ...scheduleData, [s.id]: e.target.value })} className="w-56" />
                      <Button size="sm" className="bg-violet-600 hover:bg-violet-700" onClick={() => handleSchedule(s)}>Schedule</Button>
                    </div>
                  )}
                  {s.status !== 'completed' && (
                    <FeedbackDialog
                      trigger={<Button size="sm" variant="outline">Leave Feedback</Button>}
                      onSubmit={handleFeedback(s, isMentor ? 'mentor' : 'mentee')}
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}