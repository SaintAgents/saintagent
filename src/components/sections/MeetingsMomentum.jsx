import React from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import MeetingCard from '@/components/hud/MeetingCard';

export default function MeetingsMomentum({ pendingMeetings = [], scheduledMeetings = [], onAction }) {
  return (
    <div className="space-y-3">
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