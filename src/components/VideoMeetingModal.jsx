import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  X,
  Users,
  CheckCircle,
  ExternalLink
} from "lucide-react";

export default function VideoMeetingModal({ meeting, open, onClose }) {
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const queryClient = useQueryClient();

  const confirmMutation = useMutation({
    mutationFn: () => base44.entities.Meeting.update(meeting.id, {
      status: 'completed',
      guest_confirmed: true,
      ggg_earned: 25
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      setConfirmed(true);
    }
  });

  const handleConfirmAttendance = () => {
    confirmMutation.mutate();
  };

  const isExternal = meeting?.online_link && !meeting.online_link.includes('saintagent');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl h-[600px] p-0" hideCloseButton>
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="p-4 border-b flex flex-row items-center justify-between">
            <DialogTitle>{meeting?.title}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="w-4 h-4" />
            </Button>
          </DialogHeader>

          {/* Video Area */}
          <div className="flex-1 bg-slate-900 relative">
            {isExternal ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <ExternalLink className="w-16 h-16 text-white mb-4" />
                <p className="text-white mb-4">This meeting uses an external service</p>
                <Button 
                  onClick={() => window.open(meeting.online_link, '_blank')}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  Open Meeting Link
                </Button>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Avatar className="w-32 h-32 mx-auto mb-4">
                    <AvatarImage src={meeting?.host_avatar} />
                    <AvatarFallback className="text-4xl">{meeting?.host_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <p className="text-white text-xl">{meeting?.host_name}</p>
                  <p className="text-slate-400">In-platform video coming soon</p>
                </div>
              </div>
            )}

            {/* Participant List */}
            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center gap-2 text-white text-sm mb-2">
                <Users className="w-4 h-4" />
                <span>Participants (2)</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={meeting?.host_avatar} />
                    <AvatarFallback className="text-xs">{meeting?.host_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-white text-sm">{meeting?.host_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={meeting?.guest_avatar} />
                    <AvatarFallback className="text-xs">{meeting?.guest_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-white text-sm">{meeting?.guest_name}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="p-4 border-t bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant={micOn ? "default" : "destructive"}
                size="icon"
                className="rounded-full"
                onClick={() => setMicOn(!micOn)}
              >
                {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </Button>
              <Button
                variant={videoOn ? "default" : "destructive"}
                size="icon"
                className="rounded-full"
                onClick={() => setVideoOn(!videoOn)}
              >
                {videoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </Button>
            </div>

            <Button
              onClick={handleConfirmAttendance}
              disabled={confirmed}
              className={cn(
                "rounded-xl gap-2",
                confirmed ? "bg-emerald-600" : "bg-violet-600 hover:bg-violet-700"
              )}
            >
              <CheckCircle className="w-4 h-4" />
              {confirmed ? 'Attendance Confirmed (+25 GGG)' : 'Confirm Attendance'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}