import React from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import MeetingCard from '@/components/hud/MeetingCard';
import HelpHint from '@/components/hud/HelpHint';

export default function MeetingsMomentum({ pendingMeetings = [], scheduledMeetings = [], onAction }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-end -mt-2 mb-2">
        <HelpHint content="Meetings & Connections shows your upcoming and pending meetings. Accept meeting requests, confirm scheduled sessions, and earn GGG for completing meetings. Both parties must confirm completion to receive rewards." />
      </div>
      {scheduledMeetings.length === 0 && pendingMeetings.length === 0 ? (
        <div className="text-center py-6">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No upcoming meetings</p>
          <Button variant="outline" className="mt-3 rounded-xl">
            Schedule a meeting
          </Button>
        </div>
      ) : (
        [...pendingMeetings, ...scheduledMeetings].slice(0, 3).map((meeting) => (
          <MeetingCard 
            key={meeting.id} 
            meeting={meeting} 
            onAction={onAction}
          />
        ))
      )}
    </div>
  );
}