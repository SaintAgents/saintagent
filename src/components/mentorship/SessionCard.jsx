import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, CheckCircle, XCircle, MessageSquare, Star } from 'lucide-react';
import { format } from 'date-fns';
import MentorReviewDialog from './MentorReviewDialog';

const STATUS_CONFIG = {
  requested: { color: 'bg-blue-100 text-blue-700', label: 'Requested' },
  scheduled: { color: 'bg-violet-100 text-violet-700', label: 'Scheduled' },
  completed: { color: 'bg-emerald-100 text-emerald-700', label: 'Completed' },
  cancelled: { color: 'bg-red-100 text-red-700', label: 'Cancelled' },
};

export default function SessionCard({ session, currentUser, userProfileMap }) {
  const qc = useQueryClient();
  const isMentor = session.mentor_id === currentUser?.email;
  const partnerId = isMentor ? session.mentee_id : session.mentor_id;
  const partnerName = isMentor ? session.mentee_name : session.mentor_name;
  const partnerAvatar = isMentor ? session.mentee_avatar : session.mentor_avatar;
  const statusCfg = STATUS_CONFIG[session.status] || STATUS_CONFIG.requested;

  const [scheduleTime, setScheduleTime] = useState('');

  const updateSession = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MentorshipSession.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mentorshipSessions'] }),
  });

  const submitReview = useMutation({
    mutationFn: async (reviewData) => {
      const up = userProfileMap?.[currentUser.email];
      await base44.entities.MentorReview.create({
        mentor_id: session.mentor_id,
        reviewer_id: currentUser.email,
        reviewer_name: up?.display_name || currentUser.full_name,
        reviewer_avatar: up?.avatar_url,
        session_id: session.id,
        ...reviewData,
      });
      updateSession.mutate({ id: session.id, data: { status: 'completed' } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mentorReviews'] }),
  });

  const handleSchedule = () => {
    if (!scheduleTime) return;
    updateSession.mutate({ id: session.id, data: { scheduled_time: new Date(scheduleTime).toISOString(), status: 'scheduled' } });
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className={`h-1 ${session.status === 'completed' ? 'bg-emerald-400' : session.status === 'scheduled' ? 'bg-violet-400' : 'bg-blue-400'}`} />
        <div className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="w-10 h-10 shrink-0" data-user-id={partnerId}>
              <AvatarImage src={partnerAvatar} />
              <AvatarFallback className="bg-violet-100 text-violet-700 text-sm font-bold">{(partnerName || '?')[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm text-slate-900 cursor-pointer hover:text-violet-600" data-user-id={partnerId}>
                  {partnerName || partnerId}
                </span>
                <Badge className={`${statusCfg.color} text-[10px] h-5`}>{statusCfg.label}</Badge>
                <Badge variant="outline" className="text-[10px] h-5">{isMentor ? 'You mentor' : 'You learn'}</Badge>
              </div>

              {session.scheduled_time && (
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {format(new Date(session.scheduled_time), 'PPP')} at {format(new Date(session.scheduled_time), 'p')}
                  <Clock className="w-3 h-3 ml-2" /> {session.duration_minutes || 60}min
                </p>
              )}
              {session.objectives && (
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" /> {session.objectives}
                </p>
              )}
            </div>
          </div>

          {/* Actions row */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 flex-wrap">
            {session.status === 'requested' && isMentor && (
              <>
                <Input type="datetime-local" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} className="h-8 text-xs flex-1 min-w-[180px]" />
                <Button size="sm" className="h-8 bg-violet-600 hover:bg-violet-700 text-xs gap-1" onClick={handleSchedule}>
                  <CheckCircle className="w-3 h-3" /> Schedule
                </Button>
                <Button size="sm" variant="outline" className="h-8 text-xs gap-1 text-red-600"
                  onClick={() => updateSession.mutate({ id: session.id, data: { status: 'cancelled' } })}>
                  <XCircle className="w-3 h-3" /> Decline
                </Button>
              </>
            )}
            {session.status === 'scheduled' && (
              <Button size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700 text-xs gap-1"
                onClick={() => updateSession.mutate({ id: session.id, data: { status: 'completed' } })}>
                <CheckCircle className="w-3 h-3" /> Mark Complete
              </Button>
            )}
            {session.status === 'completed' && !isMentor && (
              <MentorReviewDialog
                trigger={<Button size="sm" variant="outline" className="h-8 text-xs gap-1"><Star className="w-3 h-3" /> Leave Review</Button>}
                mentorName={session.mentor_name}
                onSubmit={submitReview.mutateAsync}
              />
            )}
            {session.status === 'requested' && !isMentor && (
              <span className="text-xs text-slate-400 italic">Awaiting mentor response...</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}