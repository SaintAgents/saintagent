import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarCheck, Clock, CheckCircle, Inbox } from 'lucide-react';
import SessionCard from './SessionCard';

export default function SessionList() {
  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const { data: sessions = [] } = useQuery({
    queryKey: ['mentorshipSessions', user?.email],
    queryFn: () => base44.entities.MentorshipSession.list('-created_date', 100),
    enabled: !!user?.email,
  });

  const { data: allUserProfiles = [] } = useQuery({
    queryKey: ['userProfilesAll'],
    queryFn: () => base44.entities.UserProfile.list('-updated_date', 500),
  });

  const userProfileMap = React.useMemo(
    () => Object.fromEntries((allUserProfiles || []).map(p => [p.user_id, p])),
    [allUserProfiles]
  );

  const mySessions = sessions.filter(s => s.mentor_id === user?.email || s.mentee_id === user?.email);
  const requested = mySessions.filter(s => s.status === 'requested');
  const scheduled = mySessions.filter(s => s.status === 'scheduled');
  const completed = mySessions.filter(s => s.status === 'completed');

  const renderList = (list, emptyMsg) => {
    if (list.length === 0) return <p className="text-sm text-slate-400 text-center py-8">{emptyMsg}</p>;
    return (
      <div className="space-y-3">
        {list.map(s => <SessionCard key={s.id} session={s} currentUser={user} userProfileMap={userProfileMap} />)}
      </div>
    );
  };

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="all" className="gap-1 text-xs"><Inbox className="w-3.5 h-3.5" /> All ({mySessions.length})</TabsTrigger>
        <TabsTrigger value="requested" className="gap-1 text-xs"><Clock className="w-3.5 h-3.5" /> Pending ({requested.length})</TabsTrigger>
        <TabsTrigger value="scheduled" className="gap-1 text-xs"><CalendarCheck className="w-3.5 h-3.5" /> Scheduled ({scheduled.length})</TabsTrigger>
        <TabsTrigger value="completed" className="gap-1 text-xs"><CheckCircle className="w-3.5 h-3.5" /> Completed ({completed.length})</TabsTrigger>
      </TabsList>
      <TabsContent value="all">{renderList(mySessions, 'No sessions yet. Request one from a mentor!')}</TabsContent>
      <TabsContent value="requested">{renderList(requested, 'No pending requests')}</TabsContent>
      <TabsContent value="scheduled">{renderList(scheduled, 'No scheduled sessions')}</TabsContent>
      <TabsContent value="completed">{renderList(completed, 'No completed sessions')}</TabsContent>
    </Tabs>
  );
}