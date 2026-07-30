import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AssignReviewModal({ open, onClose, projectId, projects = [], allAssignments = [], users = [], profiles = [], onAssigned }) {
  const { user } = useAuth();
  const [selectedProject, setSelectedProject] = useState(projectId || '');
  const [reviewerId, setReviewerId] = useState('');
  const [reviewType, setReviewType] = useState('initial');
  const [priority, setPriority] = useState('normal');
  const [managerNotes, setManagerNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Detect resubmission
  const prevAssignments = allAssignments.filter(a => a.project_id === (selectedProject || projectId));
  const isResubmission = prevAssignments.length > 0;
  const resubmissionNumber = isResubmission ? prevAssignments.length : 0;

  // Reviewer workload for balancing
  const reviewerWorkload = {};
  allAssignments.filter(a => !['submitted', 'returned'].includes(a.status)).forEach(a => {
    reviewerWorkload[a.reviewer_id] = (reviewerWorkload[a.reviewer_id] || 0) + 1;
  });

  // Eligible reviewers (admins or coordinators)
  const eligibleUsers = users.filter(u => u.role === 'admin' || u.role === 'coordinator' || u.role === 'reviewer');

  const handleAssign = async () => {
    const pid = selectedProject || projectId;
    if (!pid || !reviewerId) return;
    setSaving(true);

    const reviewerProfile = profiles.find(p => p.user_id === reviewerId);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (priority === 'urgent' ? 1 : priority === 'high' ? 3 : 7));

    await base44.entities.ReviewAssignment.create({
      project_id: pid,
      reviewer_id: reviewerId,
      reviewer_name: reviewerProfile?.display_name || reviewerId,
      assigned_by: user.email,
      assigned_at: new Date().toISOString(),
      review_type: isResubmission ? 'resubmission' : reviewType,
      is_resubmission: isResubmission,
      resubmission_number: isResubmission ? resubmissionNumber + 1 : 0,
      previous_assignment_id: isResubmission ? prevAssignments[prevAssignments.length - 1]?.id : undefined,
      status: 'pending',
      priority,
      due_date: dueDate.toISOString(),
      manager_notes: managerNotes,
    });

    // Log to audit
    await base44.entities.EvaluationAuditLog.create({
      project_id: pid,
      action: 'human_reviewed',
      actor_id: user.email,
      actor_type: 'human',
      reason: `Review assigned to ${reviewerId} (${isResubmission ? 'resubmission' : reviewType}, priority: ${priority})`,
    }).catch(() => {});

    setSaving(false);
    setSelectedProject('');
    setReviewerId('');
    setManagerNotes('');
    onAssigned?.();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-violet-600" />
            Assign Review
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Project selector */}
          {!projectId && (
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Project</label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger><SelectValue placeholder="Select project..." /></SelectTrigger>
                <SelectContent>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {isResubmission && (
            <Badge className="bg-blue-100 text-blue-700">This is resubmission #{resubmissionNumber + 1}</Badge>
          )}

          {/* Reviewer selector */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Reviewer</label>
            <Select value={reviewerId} onValueChange={setReviewerId}>
              <SelectTrigger><SelectValue placeholder="Select reviewer..." /></SelectTrigger>
              <SelectContent>
                {eligibleUsers.map(u => {
                  const load = reviewerWorkload[u.email] || 0;
                  const profile = profiles.find(p => p.user_id === u.email);
                  return (
                    <SelectItem key={u.email || u.id} value={u.email}>
                      <div className="flex items-center gap-2">
                        <span>{profile?.display_name || u.full_name || u.email}</span>
                        <Badge variant="outline" className="text-[10px]">{load} active</Badge>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Type & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Type</label>
              <Select value={reviewType} onValueChange={setReviewType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="initial">Initial</SelectItem>
                  <SelectItem value="second_review">Second Review</SelectItem>
                  <SelectItem value="appeal">Appeal</SelectItem>
                  <SelectItem value="calibration">Calibration</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Priority</label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Manager Notes (optional)</label>
            <Textarea
              value={managerNotes}
              onChange={(e) => setManagerNotes(e.target.value)}
              placeholder="Instructions for the reviewer..."
              className="min-h-[60px]"
            />
          </div>

          <Button
            className="w-full"
            onClick={handleAssign}
            disabled={saving || !(selectedProject || projectId) || !reviewerId}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <UserPlus className="w-4 h-4 mr-1" />}
            Assign Review
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}