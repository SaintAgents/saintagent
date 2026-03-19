import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, X, Clock, Users } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";

export default function MissionJoinRequestsPanel({ mission }) {
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['missionJoinRequests', mission.id],
    queryFn: () => base44.entities.MissionJoinRequest.filter({ mission_id: mission.id }, '-created_date', 50),
    enabled: !!mission.id,
  });

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const pastRequests = requests.filter(r => r.status !== 'pending');

  const approveMutation = useMutation({
    mutationFn: async (request) => {
      // Update request status
      await base44.entities.MissionJoinRequest.update(request.id, {
        status: 'approved',
        reviewed_at: new Date().toISOString(),
      });
      // Add user to mission participants
      const newParticipants = [...(mission.participant_ids || []), request.user_id];
      await base44.entities.Mission.update(mission.id, {
        participant_ids: newParticipants,
        participant_count: newParticipants.length,
      });
      // Notify the user
      await base44.entities.Notification.create({
        user_id: request.user_id,
        type: 'mission',
        title: 'Join Request Approved',
        message: `Your request to join "${mission.title}" has been approved!`,
        action_url: `/MissionDetail?id=${mission.id}`,
        action_label: 'View Mission',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missionJoinRequests', mission.id] });
      queryClient.invalidateQueries({ queryKey: ['mission', mission.id] });
      queryClient.invalidateQueries({ queryKey: ['missionParticipants'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (request) => {
      await base44.entities.MissionJoinRequest.update(request.id, {
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
      });
      await base44.entities.Notification.create({
        user_id: request.user_id,
        type: 'mission',
        title: 'Join Request Declined',
        message: `Your request to join "${mission.title}" was not approved.`,
        action_url: `/Missions`,
        action_label: 'Browse Missions',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missionJoinRequests', mission.id] });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-600" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-violet-600" />
            Join Requests
          </h3>
          {pendingRequests.length > 0 && (
            <Badge className="bg-amber-100 text-amber-700">
              {pendingRequests.length} pending
            </Badge>
          )}
        </div>

        {requests.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">No join requests yet</p>
        ) : (
          <ScrollArea className="max-h-80">
            <div className="space-y-3">
              {/* Pending first */}
              {pendingRequests.map(req => (
                <div key={req.id} className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
                  <Avatar className="w-9 h-9" data-user-id={req.user_id}>
                    <AvatarImage src={req.user_avatar} />
                    <AvatarFallback className="text-xs">{req.user_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{req.user_name}</p>
                    {req.role_applied && (
                      <p className="text-xs text-slate-500">Role: {req.role_applied}</p>
                    )}
                    {req.message && (
                      <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">"{req.message}"</p>
                    )}
                    <p className="text-xs text-slate-400 mt-0.5">
                      {req.created_date && formatDistanceToNow(parseISO(req.created_date), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-8 h-8 text-emerald-600 hover:bg-emerald-100"
                      onClick={() => approveMutation.mutate(req)}
                      disabled={approveMutation.isPending}
                      title="Approve"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-8 h-8 text-red-600 hover:bg-red-100"
                      onClick={() => rejectMutation.mutate(req)}
                      disabled={rejectMutation.isPending}
                      title="Reject"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {/* Past requests */}
              {pastRequests.map(req => (
                <div key={req.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                  <Avatar className="w-9 h-9" data-user-id={req.user_id}>
                    <AvatarImage src={req.user_avatar} />
                    <AvatarFallback className="text-xs">{req.user_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{req.user_name}</p>
                    {req.role_applied && (
                      <p className="text-xs text-slate-500">Role: {req.role_applied}</p>
                    )}
                  </div>
                  <Badge variant="outline" className={
                    req.status === 'approved' ? 'border-emerald-200 text-emerald-700' : 'border-red-200 text-red-700'
                  }>
                    {req.status}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}