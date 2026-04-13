import React from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, Calendar, Clock, ExternalLink, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { Link } from 'react-router-dom';

export default function BookingConfirmation({ event, hostProfile, selectedSlot, meetingType, timezone }) {
  const calEvent = event?.calEvent?.event;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-emerald-600" />
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-2">Booking Confirmed!</h2>
        <p className="text-slate-500 mb-6">Your meeting has been added to Google Calendar</p>

        {hostProfile && (
          <div className="flex items-center gap-3 justify-center mb-6">
            <Avatar className="w-10 h-10">
              <AvatarImage src={hostProfile.avatar_url} />
              <AvatarFallback>{hostProfile.display_name?.[0]}</AvatarFallback>
            </Avatar>
            <span className="font-medium text-slate-900">{hostProfile.display_name}</span>
          </div>
        )}

        <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left space-y-3">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-violet-600 shrink-0" />
            <span className="text-slate-700">
              {selectedSlot ? format(new Date(selectedSlot.start), 'EEEE, MMMM d, yyyy') : ''}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-violet-600 shrink-0" />
            <div>
              <span className="text-slate-700">
                {selectedSlot ? `${selectedSlot.label} — ${selectedSlot.endLabel}` : ''}
              </span>
              {timezone && (
                <p className="text-xs text-slate-500 mt-0.5">{timezone}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-5 h-5 shrink-0 text-center text-violet-600 font-bold text-sm">📋</span>
            <span className="text-slate-700 capitalize">{meetingType}</span>
          </div>
        </div>

        {calEvent?.htmlLink && (
          <a 
            href={calEvent.htmlLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700 mb-6"
          >
            <ExternalLink className="w-4 h-4" />
            View in Google Calendar
          </a>
        )}

        <div className="flex gap-3">
          <Link to="/Meetings" className="flex-1">
            <Button variant="outline" className="w-full gap-2">
              <ArrowLeft className="w-4 h-4" />
              My Meetings
            </Button>
          </Link>
          <Link to="/Schedule" className="flex-1">
            <Button className="w-full bg-violet-600 hover:bg-violet-700 gap-2">
              <Calendar className="w-4 h-4" />
              Schedule
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}