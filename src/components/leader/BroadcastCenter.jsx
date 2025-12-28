import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Radio, 
  Send, 
  AlertCircle,
  Users,
  Globe,
  Target
} from "lucide-react";
import { toast } from "sonner";

export default function BroadcastCenter({ profile }) {
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('all');
  const queryClient = useQueryClient();

  const broadcastMutation = useMutation({
    mutationFn: async (data) => {
      // Create notifications for all users based on audience
      const allProfiles = await base44.entities.UserProfile.list();
      
      let targetProfiles = allProfiles;
      if (audience === 'leaders') {
        targetProfiles = allProfiles.filter(p => 
          p.leader_tier === 'verified144k' || p.leader_tier === 'candidate'
        );
      } else if (audience === 'region') {
        targetProfiles = allProfiles.filter(p => p.region === profile.region);
      }

      // Create notification for each target user
      const notifications = targetProfiles.map(p => ({
        user_id: p.user_id,
        type: 'system',
        title: '📢 Leader Broadcast',
        message: data.message,
        priority: 'high',
        is_read: false,
        metadata: {
          sender: profile.display_name,
          sender_id: profile.user_id,
          broadcast_type: audience
        }
      }));

      // Bulk create notifications
      for (const notif of notifications) {
        await base44.entities.Notification.create(notif);
      }

      return { count: notifications.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setMessage('');
      toast.success(`Broadcast sent to ${data.count} users!`);
    },
    onError: () => {
      toast.error('Failed to send broadcast');
    }
  });

  const handleBroadcast = () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }
    broadcastMutation.mutate({ message });
  };

  const audiences = [
    { id: 'all', label: 'All Members', icon: Globe, description: 'Entire community' },
    { id: 'leaders', label: 'Leaders Only', icon: Radio, description: 'Verified leaders & candidates' },
    { id: 'region', label: 'My Region', icon: Target, description: `${profile?.region || 'Your region'}` }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-amber-500" />
            Send Broadcast
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-2 block">Audience</Label>
            <div className="grid grid-cols-3 gap-3">
              {audiences.map((aud) => (
                <button
                  key={aud.id}
                  onClick={() => setAudience(aud.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    audience === aud.id 
                      ? 'border-amber-500 bg-amber-50' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <aud.icon className={`w-5 h-5 mb-2 ${
                    audience === aud.id ? 'text-amber-600' : 'text-slate-400'
                  }`} />
                  <p className="font-medium text-sm text-slate-900">{aud.label}</p>
                  <p className="text-xs text-slate-500">{aud.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="message" className="mb-2 block">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your announcement..."
              className="min-h-32"
              maxLength={500}
            />
            <p className="text-xs text-slate-400 mt-1">{message.length}/500 characters</p>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-700">
              Broadcasts are sent as high-priority notifications to all selected users
            </p>
          </div>

          <Button 
            onClick={handleBroadcast}
            disabled={!message.trim() || broadcastMutation.isPending}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            {broadcastMutation.isPending ? (
              'Sending...'
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Broadcast
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Broadcasts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Radio className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No recent broadcasts</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}