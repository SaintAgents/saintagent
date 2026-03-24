import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, Calendar, Loader2, ExternalLink, Clock, Copy, Check } from "lucide-react";
import { format } from "date-fns";

export default function VideoCallModal({ open, onClose, user, recipientId, recipientName, conversationId, onCallCreated }) {
  const [tab, setTab] = useState('instant');
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [duration, setDuration] = useState(30);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    const meetingTopic = topic.trim() || `Call with ${recipientName}`;
    const meetingDetails = { topic: meetingTopic, duration };

    if (tab === 'scheduled' && scheduledDate && scheduledTime) {
      meetingDetails.start_time = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
    }

    const response = await base44.functions.invoke('zoomMeeting', {
      action: 'create',
      meetingDetails,
      sendEmails: true,
      hostEmail: user.email,
      hostName: user.full_name,
      guestEmail: recipientId,
      guestName: recipientName,
    });

    const meeting = response.data?.meeting;
    if (meeting) {
      setResult(meeting);
      onCallCreated?.(meeting, tab);
    }
    setLoading(false);
  };

  const handleCopy = () => {
    if (result?.join_url) {
      navigator.clipboard.writeText(result.join_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setResult(null);
    setTopic('');
    setScheduledDate('');
    setScheduledTime('');
    setDuration(30);
    setTab('instant');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="w-5 h-5 text-emerald-600" />
            Video Call with {recipientName}
          </DialogTitle>
        </DialogHeader>

        {result ? (
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-emerald-900">
                {result.start_time ? 'Meeting Scheduled!' : 'Meeting Created!'}
              </h3>
              {result.start_time && (
                <p className="text-sm text-emerald-700">
                  <Clock className="w-3.5 h-3.5 inline mr-1" />
                  {format(new Date(result.start_time), 'MMM d, yyyy h:mm a')}
                </p>
              )}
              <p className="text-xs text-emerald-600">
                Email invitations have been sent to both participants.
              </p>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => window.open(result.join_url, '_blank')}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Join Now
              </Button>
              <Button variant="outline" onClick={handleCopy}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <Button variant="ghost" className="w-full" onClick={handleClose}>Done</Button>
          </div>
        ) : (
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="w-full">
              <TabsTrigger value="instant" className="flex-1 gap-1.5">
                <Video className="w-3.5 h-3.5" /> Start Now
              </TabsTrigger>
              <TabsTrigger value="scheduled" className="flex-1 gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Schedule
              </TabsTrigger>
            </TabsList>

            <TabsContent value="instant" className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Topic (optional)</label>
                <Input
                  placeholder={`Call with ${recipientName}`}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Duration</label>
                <div className="flex gap-2">
                  {[15, 30, 45, 60].map((d) => (
                    <Button
                      key={d}
                      variant={duration === d ? "default" : "outline"}
                      size="sm"
                      className={duration === d ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                      onClick={() => setDuration(d)}
                    >
                      {d}m
                    </Button>
                  ))}
                </div>
              </div>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleCreate} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Video className="w-4 h-4 mr-2" />}
                Start Zoom Call
              </Button>
            </TabsContent>

            <TabsContent value="scheduled" className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Topic (optional)</label>
                <Input
                  placeholder={`Call with ${recipientName}`}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Date</label>
                  <Input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">Time</label>
                  <Input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Duration</label>
                <div className="flex gap-2">
                  {[15, 30, 45, 60].map((d) => (
                    <Button
                      key={d}
                      variant={duration === d ? "default" : "outline"}
                      size="sm"
                      className={duration === d ? "bg-violet-600 hover:bg-violet-700" : ""}
                      onClick={() => setDuration(d)}
                    >
                      {d}m
                    </Button>
                  ))}
                </div>
              </div>
              <Button
                className="w-full bg-violet-600 hover:bg-violet-700"
                onClick={handleCreate}
                disabled={loading || !scheduledDate || !scheduledTime}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Calendar className="w-4 h-4 mr-2" />}
                Schedule Zoom Meeting
              </Button>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}