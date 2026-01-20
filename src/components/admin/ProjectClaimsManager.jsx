import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Folder,
  MessageSquare,
  AlertCircle,
  Loader2,
  Search,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export default function ProjectClaimsManager() {
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [reviewingClaim, setReviewingClaim] = useState(null);
  const [adminReason, setAdminReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const queryClient = useQueryClient();

  // Fetch projects with pending claims
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projectClaims', filter],
    queryFn: async () => {
      if (filter === 'all') {
        // Get all projects that have been claimed or have pending claims
        const all = await base44.entities.Project.list('-updated_date', 500);
        return all.filter(p => p.claimed_by || p.claim_status);
      } else {
        return base44.entities.Project.filter({ claim_status: filter }, '-updated_date', 100);
      }
    }
  });

  // Fetch user profiles for display
  const claimerEmails = [...new Set(projects.map(p => p.claimed_by).filter(Boolean))];
  const { data: profiles = [] } = useQuery({
    queryKey: ['claimerProfiles', claimerEmails.join(',')],
    queryFn: async () => {
      if (claimerEmails.length === 0) return [];
      const results = [];
      for (const email of claimerEmails.slice(0, 20)) {
        const profiles = await base44.entities.UserProfile.filter({ user_id: email });
        if (profiles[0]) results.push(profiles[0]);
      }
      return results;
    },
    enabled: claimerEmails.length > 0
  });

  const getClaimerProfile = (email) => profiles.find(p => p.user_id === email);

  const filteredProjects = projects.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.title?.toLowerCase().includes(q) ||
      p.claimed_by?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    );
  });

  const handleApprove = async () => {
    if (!reviewingClaim) return;
    setProcessing(true);
    try {
      await base44.entities.Project.update(reviewingClaim.id, {
        claim_status: 'approved',
        admin_review_note: adminReason,
        admin_reviewed_by: (await base44.auth.me()).email,
        admin_reviewed_at: new Date().toISOString()
      });

      // Notify the claimer
      await base44.entities.Notification.create({
        user_id: reviewingClaim.claimed_by,
        type: 'system',
        title: 'Project Claim Approved!',
        message: `Your claim for "${reviewingClaim.title}" has been approved. You can now edit and manage this project.`,
        priority: 'high'
      });

      queryClient.invalidateQueries({ queryKey: ['projectClaims'] });
      setReviewingClaim(null);
      setAdminReason('');
    } catch (error) {
      console.error('Failed to approve claim:', error);
    }
    setProcessing(false);
  };

  const handleReject = async () => {
    if (!reviewingClaim || !adminReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    setProcessing(true);
    try {
      await base44.entities.Project.update(reviewingClaim.id, {
        claim_status: 'rejected',
        claimed_by: null,
        admin_review_note: adminReason,
        admin_reviewed_by: (await base44.auth.me()).email,
        admin_reviewed_at: new Date().toISOString()
      });

      // Notify the claimer
      await base44.entities.Notification.create({
        user_id: reviewingClaim.claimed_by,
        type: 'system',
        title: 'Project Claim Rejected',
        message: `Your claim for "${reviewingClaim.title}" was not approved. Reason: ${adminReason}`,
        priority: 'normal'
      });

      queryClient.invalidateQueries({ queryKey: ['projectClaims'] });
      setReviewingClaim(null);
      setAdminReason('');
    } catch (error) {
      console.error('Failed to reject claim:', error);
    }
    setProcessing(false);
  };

  const pendingCount = projects.filter(p => p.claim_status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Folder className="w-5 h-5 text-violet-600" />
            Project Claims
            {pendingCount > 0 && (
              <Badge className="bg-amber-500 text-white ml-2">{pendingCount} pending</Badge>
            )}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Review and approve project ownership claims</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects or claimers..."
            className="pl-9"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="all">All Claims</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Claims List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <Folder className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">No claims found</h3>
          <p className="text-slate-500 dark:text-slate-400">
            {filter === 'pending' ? 'No pending claims to review' : 'No claims match your filters'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredProjects.map((project) => {
            const claimerProfile = getClaimerProfile(project.claimed_by);
            return (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={cn(
                          project.claim_status === 'pending' && "bg-amber-100 text-amber-700",
                          project.claim_status === 'approved' && "bg-emerald-100 text-emerald-700",
                          project.claim_status === 'rejected' && "bg-rose-100 text-rose-700"
                        )}>
                          {project.claim_status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                          {project.claim_status === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {project.claim_status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                          {project.claim_status || 'Unknown'}
                        </Badge>
                        {project.auto_claimed && (
                          <Badge variant="outline" className="text-xs">Auto-approved</Badge>
                        )}
                      </div>
                      
                      <h3 className="font-semibold text-slate-900 dark:text-white">{project.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">
                        {project.description}
                      </p>

                      {/* Claimer Info */}
                      <div className="mt-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center">
                            {claimerProfile?.avatar_url ? (
                              <img src={claimerProfile.avatar_url} className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <User className="w-4 h-4 text-violet-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-slate-900 dark:text-white">
                              {claimerProfile?.display_name || project.claimed_by}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {project.claimed_by}
                            </div>
                          </div>
                          <div className="text-xs text-slate-400">
                            {project.claimed_at ? new Date(project.claimed_at).toLocaleDateString() : ''}
                          </div>
                        </div>
                        
                        {project.claim_note && (
                          <div className="mt-2 p-2 rounded bg-white dark:bg-slate-700 border dark:border-slate-600">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="w-4 h-4 text-slate-400 mt-0.5" />
                              <p className="text-sm text-slate-600 dark:text-slate-300">{project.claim_note}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Admin Review Note (if exists) */}
                      {project.admin_review_note && (
                        <div className="mt-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">Admin Note:</div>
                          <p className="text-sm text-blue-700 dark:text-blue-300">{project.admin_review_note}</p>
                          {project.admin_reviewed_by && (
                            <div className="text-xs text-blue-500 mt-1">
                              Reviewed by {project.admin_reviewed_by} on {new Date(project.admin_reviewed_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {project.claim_status === 'pending' && (
                      <Button
                        onClick={() => setReviewingClaim(project)}
                        className="bg-violet-600 hover:bg-violet-700"
                      >
                        Review
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={!!reviewingClaim} onOpenChange={(open) => !open && setReviewingClaim(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Project Claim</DialogTitle>
            <DialogDescription>
              Decide whether to approve or reject this ownership claim
            </DialogDescription>
          </DialogHeader>

          {reviewingClaim && (
            <div className="space-y-4 mt-4">
              {/* Project Info */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border dark:border-slate-700">
                <h4 className="font-semibold text-slate-900 dark:text-white">{reviewingClaim.title}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{reviewingClaim.description}</p>
              </div>

              {/* Claimer Info */}
              <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-violet-600" />
                  <span className="font-medium text-violet-700 dark:text-violet-300">Claimed by:</span>
                  <span className="text-violet-600 dark:text-violet-400">{reviewingClaim.claimed_by}</span>
                </div>
                {reviewingClaim.claim_note && (
                  <div className="mt-2">
                    <div className="text-xs text-violet-600 dark:text-violet-400 font-medium mb-1">Their reason:</div>
                    <p className="text-sm text-violet-700 dark:text-violet-300 bg-white dark:bg-slate-800 p-2 rounded border dark:border-slate-700">
                      {reviewingClaim.claim_note}
                    </p>
                  </div>
                )}
              </div>

              {/* Admin Reason */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Admin Notes / Reason
                  <span className="text-rose-500 ml-1">(required for rejection)</span>
                </label>
                <Textarea
                  value={adminReason}
                  onChange={(e) => setAdminReason(e.target.value)}
                  placeholder="Enter your notes or reason for this decision..."
                  className="min-h-[100px]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setReviewingClaim(null);
                    setAdminReason('');
                  }}
                  className="flex-1"
                  disabled={processing}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={processing}
                  className="flex-1 gap-2"
                >
                  {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  Reject
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={processing}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 gap-2"
                >
                  {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}