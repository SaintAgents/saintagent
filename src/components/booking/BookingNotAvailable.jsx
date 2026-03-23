import React from 'react';
import { Button } from "@/components/ui/button";
import { Calendar, Settings, ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function BookingNotAvailable({ hostProfile, isOwnProfile }) {
  if (isOwnProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 flex items-center justify-center p-6">
        <div className="text-center max-w-md bg-white rounded-2xl border p-8 shadow-sm">
          <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-violet-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Set Up Your Open Call Times</h2>
          <p className="text-slate-500 mb-6">
            You haven't enabled booking yet. Set up your availability so others can schedule calls with you.
          </p>
          <div className="space-y-3 text-left bg-slate-50 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
              <p className="text-sm text-slate-700">Go to <strong>Settings → Account</strong></p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
              <p className="text-sm text-slate-700">Find <strong>Open Call Times</strong> and toggle it on</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
              <p className="text-sm text-slate-700">Choose your available days, hours, and slot duration</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</div>
              <p className="text-sm text-slate-700">Share your booking link with others!</p>
            </div>
          </div>
          <Button
            onClick={() => window.location.href = '/Settings'}
            className="bg-violet-600 hover:bg-violet-700 gap-2 w-full"
          >
            <Settings className="w-4 h-4" />
            Go to Settings
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 flex items-center justify-center p-6">
      <div className="text-center max-w-md bg-white rounded-2xl border p-8 shadow-sm">
        {hostProfile && (
          <Avatar className="w-16 h-16 mx-auto mb-4">
            <AvatarImage src={hostProfile.avatar_url} />
            <AvatarFallback className="text-lg">{hostProfile.display_name?.[0]}</AvatarFallback>
          </Avatar>
        )}
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Booking Not Available</h2>
        <p className="text-slate-500 mb-4">
          {hostProfile?.display_name || 'This user'} hasn't enabled open call times yet.
          You can send them a message to request a meeting.
        </p>
        <Button
          onClick={() => {
            document.dispatchEvent(new CustomEvent('openFloatingChat', {
              detail: {
                recipientId: hostProfile?.user_id,
                recipientName: hostProfile?.display_name || 'User',
                recipientAvatar: hostProfile?.avatar_url || ''
              },
              bubbles: true
            }));
          }}
          className="bg-violet-600 hover:bg-violet-700 gap-2"
        >
          Send a Message Instead
        </Button>
      </div>
    </div>
  );
}