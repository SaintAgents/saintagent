import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { createPageUrl } from '@/utils';
import {
  CheckCircle, Play, Pause, Trash2, Shield, AlertTriangle, Globe, ShieldCheck
} from "lucide-react";

export default function MissionManageControls({ mission, currentUser, missionId }) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const queryClient = useQueryClient();

  const statusMutation = useMutation({
    mutationFn: async (newStatus) => {
      await base44.entities.Mission.update(mission.id, { status: newStatus });
    },
    onSuccess: (_, newStatus) => {
      toast.success(`Mission marked as ${newStatus}`);
      queryClient.invalidateQueries({ queryKey: ['mission', missionId] });
      queryClient.invalidateQueries({ queryKey: ['myMissions'] });
    }
  });

  const joinPolicyMutation = useMutation({
    mutationFn: async (policy) => {
      await base44.entities.Mission.update(mission.id, { join_policy: policy });
    },
    onSuccess: (_, policy) => {
      toast.success(`Join policy updated to ${policy === 'open' ? 'Open' : 'Approval Required'}`);
      queryClient.invalidateQueries({ queryKey: ['mission', missionId] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Mission.delete(mission.id);
    },
    onSuccess: () => {
      toast.success('Mission deleted');
      queryClient.invalidateQueries({ queryKey: ['myMissions'] });
      window.location.href = createPageUrl('Missions');
    }
  });

  return (
    <div className="space-y-6">
      {/* Status Controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 text-violet-500" />
            Mission Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 mb-4">
            Current status: <Badge className="ml-1">{mission.status?.replace('_', ' ')}</Badge>
          </p>
          <div className="flex flex-wrap gap-2">
            {mission.status !== 'active' && mission.status !== 'completed' && (
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 gap-1.5"
                onClick={() => statusMutation.mutate('active')}
                disabled={statusMutation.isPending}
              >
                <Play className="w-4 h-4" /> Activate
              </Button>
            )}
            {mission.status === 'active' && (
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 gap-1.5"
                onClick={() => statusMutation.mutate('completed')}
                disabled={statusMutation.isPending}
              >
                <CheckCircle className="w-4 h-4" /> Complete
              </Button>
            )}
            {mission.status === 'active' && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => statusMutation.mutate('cancelled')}
                disabled={statusMutation.isPending}
              >
                <Pause className="w-4 h-4" /> Cancel
              </Button>
            )}
            {mission.status === 'completed' && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => statusMutation.mutate('active')}
                disabled={statusMutation.isPending}
              >
                <Play className="w-4 h-4" /> Reactivate
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Join Policy */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-violet-500" />
            Join Policy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => joinPolicyMutation.mutate('open')}
              disabled={joinPolicyMutation.isPending}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                mission.join_policy === 'open'
                  ? 'border-violet-500 bg-violet-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <Globe className="w-5 h-5 text-emerald-600 mb-2" />
              <p className="font-medium text-sm text-slate-900">Open</p>
              <p className="text-xs text-slate-500 mt-0.5">Anyone can join instantly</p>
            </button>
            <button
              type="button"
              onClick={() => joinPolicyMutation.mutate('approval_required')}
              disabled={joinPolicyMutation.isPending}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                mission.join_policy === 'approval_required'
                  ? 'border-violet-500 bg-violet-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <ShieldCheck className="w-5 h-5 text-amber-600 mb-2" />
              <p className="font-medium text-sm text-slate-900">Approval Required</p>
              <p className="text-xs text-slate-500 mt-0.5">Review requests first</p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-4 h-4" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 mb-4">
            Permanently delete this mission and all associated data. This cannot be undone.
          </p>
          <Button
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50 gap-1.5"
            onClick={() => setDeleteConfirmOpen(true)}
          >
            <Trash2 className="w-4 h-4" /> Delete Mission
          </Button>
        </CardContent>
      </Card>

      {/* Delete Confirm */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Mission?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            This will permanently delete "<strong>{mission.title}</strong>" and all its data.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Forever'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}