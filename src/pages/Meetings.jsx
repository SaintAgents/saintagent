import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Check, Plus } from "lucide-react";

import QuickCreateModal from '@/components/hud/QuickCreateModal';
import MeetingCard from '@/components/hud/MeetingCard';
import RescheduleDialog from '@/components/meetings/RescheduleDialog';

export default function Meetings() {
  const [tab, setTab] = useState('upcoming');
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [rescheduleMeeting, setRescheduleMeeting] = useState(null);
  const queryClient = useQueryClient();

  const { data: meetings = [], isLoading } = useQuery({
    queryKey: ['meetings'],
    queryFn: () => base44.entities.Meeting.list('-scheduled_time', 50)
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Meeting.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['meetings'] })
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const pending = meetings.filter(m => m.status === 'pending');
  const scheduled = meetings.filter(m => m.status === 'scheduled' || m.status === 'accepted');
  const completed = meetings.filter(m => m.status === 'completed');

  const filteredMeetings = 
    tab === 'pending' ? pending :
    tab === 'upcoming' ? scheduled :
    tab === 'completed' ? completed : meetings;

  const handleAction = async (action, meeting) => {
    switch (action) {
      case 'accept':
        updateMutation.mutate({ id: meeting.id, data: { status: 'scheduled' } });
        break;
      case 'decline':
        updateMutation.mutate({ id: meeting.id, data: { status: 'declined' } });
        break;
      case 'confirm':
        updateMutation.mutate({ id: meeting.id, data: { status: 'completed', guest_confirmed: true, ggg_earned: 25 } });
        break;
      case 'reschedule':
        setRescheduleMeeting(meeting);
        break;
    }
  };

  const handleCreate = async (type, data) => {
    if (type !== 'meeting' || !currentUser) return;
    await base44.entities.Meeting.create({
      title: data.title || 'Meeting',
      host_id: currentUser.email,
      guest_id: data.recipient,
      host_name: currentUser.full_name,
      guest_name: data.recipient,
      meeting_type: data.type || 'casual',
      status: 'pending'
    });
    queryClient.invalidateQueries({ queryKey: ['meetings'] });
    setQuickCreateOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-500" />
              Meetings & Connections
            </h1>
            <p className="text-slate-500 mt-1">Schedule, attend, and verify your meetings to earn GGG</p>
          </div>
          <Button className="rounded-xl bg-violet-600 hover:bg-violet-700 gap-2" onClick={() => setQuickCreateOpen(true)}>
            <Plus className="w-4 h-4" />
            Request Meeting
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-900">{pending.length}</p>
                <p className="text-sm text-amber-600">Pending</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-900">{scheduled.length}</p>
                <p className="text-sm text-blue-600">Upcoming</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100">
                <Check className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-900">{completed.length}</p>
                <p className="text-sm text-emerald-600">Completed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="mb-6">
          <TabsList className="w-full grid grid-cols-3 h-11 bg-white rounded-xl border">
            <TabsTrigger value="pending" className="rounded-lg">
              Pending ({pending.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="rounded-lg">
              Upcoming ({scheduled.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="rounded-lg">
              Completed ({completed.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Meetings List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-white rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredMeetings.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No meetings yet</h3>
            <p className="text-slate-500 mb-6">Start connecting with matches to schedule meetings</p>
            <Button className="rounded-xl bg-violet-600 hover:bg-violet-700">
              Find Matches
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMeetings.map(meeting => (
              <MeetingCard 
                key={meeting.id} 
                meeting={meeting} 
                onAction={handleAction}
              />
            ))}
          </div>
        )}
      </div>
      <QuickCreateModal 
        open={quickCreateOpen}
        initialType="meeting"
        onClose={() => setQuickCreateOpen(false)}
        onCreate={handleCreate}
      />

      <RescheduleDialog 
        open={!!rescheduleMeeting} 
        meeting={rescheduleMeeting}
        onClose={() => setRescheduleMeeting(null)}
        onSave={(iso) => {
          updateMutation.mutate({ id: rescheduleMeeting.id, data: { scheduled_time: iso, status: 'scheduled' } });
          setRescheduleMeeting(null);
        }}
      />
    </div>
  );
}