import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Inbox,
  Send,
  Check,
  X,
  Clock,
  MessageCircle,
  ChevronRight,
  Target,
  Users,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from 'date-fns';

const STAGE_LABELS = {
  ideation: 'Ideation',
  planning: 'Planning',
  early_development: 'Early Dev',
  active: 'Active',
  scaling: 'Scaling',
  maintenance: 'Maintenance',
};

const ROLE_LABELS = {
  'co-founder': '🚀 Co-founder',
  contributor: '🛠️ Contributor',
  advisor: '💡 Advisor',
  mentor: '🎯 Mentor',
  learner: '📚 Learner',
  partner: '🤝 Partner',
};

const TIME_LABELS = {
  few_hours_week: 'Few hrs/wk',
  part_time: 'Part-time',
  full_time: 'Full-time',
  flexible: 'Flexible',
  one_time: 'One-time',
};

export default function CollaborationRequestsPanel({ userId }) {
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [responseModalOpen, setResponseModalOpen] = useState(false);
  const [responseType, setResponseType] = useState(null);

  // Fetch incoming requests
  const { data: incomingRequests = [] } = useQuery({
    queryKey: ['incomingCollabRequests', userId],
    queryFn: () => base44.entities.CollaborationRequest.filter(
      { to_user_id: userId },
      '-created_date',
      50
    ),
    enabled: !!userId,
  });

  // Fetch outgoing requests
  const { data: outgoingRequests = [] } = useQuery({
    queryKey: ['outgoingCollabRequests', userId],
    queryFn: () => base44.entities.CollaborationRequest.filter(
      { from_user_id: userId },
      '-created_date',
      50
    ),
    enabled: !!userId,
  });

  const respondToRequest = useMutation({
    mutationFn: async ({ request, status, message }) => {
      // Update request
      await base44.entities.CollaborationRequest.update(request.id, {
        status,
        response_message: message,
        responded_at: new Date().toISOString(),
      });

      // Notify sender
      await base44.entities.Notification.create({
        user_id: request.from_user_id,
        type: 'collaboration',
        title: status === 'accepted' 
          ? `${request.to_name} accepted your request!`
          : `${request.to_name} declined your request`,
        message: status === 'accepted'
          ? `Ready to collaborate on "${request.project_title}"`
          : message || 'Maybe next time!',
        priority: status === 'accepted' ? 'high' : 'normal',
        source_user_id: request.to_user_id,
        source_user_name: request.to_name,
        metadata: {
          request_id: request.id,
          status,
        },
      });

      // If accepted, open chat
      if (status === 'accepted') {
        const event = new CustomEvent('openFloatingChat', {
          detail: {
            recipientId: request.from_user_id,
            recipientName: request.from_name,
            recipientAvatar: request.from_avatar,
          },
        });
        document.dispatchEvent(event);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomingCollabRequests'] });
      queryClient.invalidateQueries({ queryKey: ['outgoingCollabRequests'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setResponseModalOpen(false);
      setSelectedRequest(null);
      setResponseMessage('');
    },
  });

  const handleResponse = (request, type) => {
    setSelectedRequest(request);
    setResponseType(type);
    if (type === 'accept') {
      respondToRequest.mutate({ request, status: 'accepted', message: '' });
    } else {
      setResponseModalOpen(true);
    }
  };

  const pendingIncoming = incomingRequests.filter(r => r.status === 'pending');
  const pendingOutgoing = outgoingRequests.filter(r => r.status === 'pending');

  const RequestCard = ({ request, isIncoming }) => (
    <div className="p-4 rounded-xl border bg-white hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3">
        <Avatar 
          className="w-11 h-11 cursor-pointer"
          data-user-id={isIncoming ? request.from_user_id : request.to_user_id}
        >
          <AvatarImage src={isIncoming ? request.from_avatar : null} />
          <AvatarFallback className="bg-violet-100 text-violet-600">
            {(isIncoming ? request.from_name : request.to_name)?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-slate-900">
              {isIncoming ? request.from_name : request.to_name}
            </p>
            <Badge 
              variant="outline" 
              className={cn(
                "text-[10px]",
                request.status === 'pending' && "border-amber-300 text-amber-700",
                request.status === 'accepted' && "border-emerald-300 text-emerald-700",
                request.status === 'declined' && "border-slate-300 text-slate-500"
              )}
            >
              {request.status}
            </Badge>
          </div>
          <p className="text-sm font-medium text-violet-700 mt-1">{request.project_title}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <Badge variant="secondary" className="text-[10px]">
              {ROLE_LABELS[request.collaboration_type] || request.collaboration_type}
            </Badge>
            <Badge variant="secondary" className="text-[10px]">
              {STAGE_LABELS[request.project_stage] || request.project_stage}
            </Badge>
            <Badge variant="secondary" className="text-[10px]">
              <Clock className="w-2.5 h-2.5 mr-0.5" />
              {TIME_LABELS[request.time_commitment] || request.time_commitment}
            </Badge>
          </div>
          {request.skills_needed?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {request.skills_needed.slice(0, 4).map((s, i) => (
                <Badge key={i} className="text-[10px] bg-blue-100 text-blue-700">{s}</Badge>
              ))}
            </div>
          )}
          <p className="text-sm text-slate-600 mt-2 line-clamp-2">{request.message}</p>
          <p className="text-xs text-slate-400 mt-2">
            {format(parseISO(request.created_date), 'MMM d, h:mm a')}
          </p>
        </div>
      </div>

      {isIncoming && request.status === 'pending' && (
        <div className="flex items-center gap-2 mt-4 pt-3 border-t">
          <Button
            size="sm"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            onClick={() => handleResponse(request, 'accept')}
          >
            <Check className="w-4 h-4 mr-1" />
            Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => handleResponse(request, 'decline')}
          >
            <X className="w-4 h-4 mr-1" />
            Decline
          </Button>
        </div>
      )}

      {request.response_message && (
        <div className="mt-3 p-2 rounded-lg bg-slate-50 text-sm text-slate-600">
          <span className="font-medium">Response:</span> {request.response_message}
        </div>
      )}
    </div>
  );

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-violet-500" />
            Collaboration Requests
            {pendingIncoming.length > 0 && (
              <Badge className="bg-violet-100 text-violet-700">{pendingIncoming.length} new</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="incoming">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="incoming" className="flex-1">
                <Inbox className="w-4 h-4 mr-1" />
                Incoming ({pendingIncoming.length})
              </TabsTrigger>
              <TabsTrigger value="outgoing" className="flex-1">
                <Send className="w-4 h-4 mr-1" />
                Sent ({pendingOutgoing.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="incoming" className="space-y-3">
              {incomingRequests.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">No incoming requests</p>
              ) : (
                incomingRequests.map(req => (
                  <RequestCard key={req.id} request={req} isIncoming={true} />
                ))
              )}
            </TabsContent>

            <TabsContent value="outgoing" className="space-y-3">
              {outgoingRequests.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">No sent requests</p>
              ) : (
                outgoingRequests.map(req => (
                  <RequestCard key={req.id} request={req} isIncoming={false} />
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Decline response modal */}
      <Dialog open={responseModalOpen} onOpenChange={setResponseModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Decline Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Add an optional message to {selectedRequest?.from_name}
            </p>
            <Textarea
              placeholder="Thanks for reaching out, but I'm currently unavailable..."
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              className="min-h-24"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResponseModalOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => respondToRequest.mutate({
                request: selectedRequest,
                status: 'declined',
                message: responseMessage,
              })}
              disabled={respondToRequest.isPending}
            >
              Decline Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}