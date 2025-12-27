import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Crown, CheckCircle, XCircle, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function LeaderApplications() {
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['leaderApplications'],
    queryFn: () => base44.entities.LeaderApplication.list('-created_date')
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['allProfiles'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 500)
  });

  const reviewApplicationMutation = useMutation({
    mutationFn: async ({ applicationId, status, notes }) => {
      const application = applications.find(a => a.id === applicationId);
      await base44.entities.LeaderApplication.update(applicationId, {
        status,
        review_notes: notes,
        reviewed_by: user.email,
        reviewed_at: new Date().toISOString()
      });

      // If approved, update user profile
      if (status === 'approved') {
        const profile = profiles.find(p => p.user_id === application.user_id);
        if (profile) {
          await base44.entities.UserProfile.update(profile.id, {
            leader_tier: 'verified144k'
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaderApplications'] });
      queryClient.invalidateQueries({ queryKey: ['allProfiles'] });
      setSelectedApplication(null);
      setReviewNotes('');
    }
  });

  const handleReview = (status) => {
    if (!selectedApplication) return;
    reviewApplicationMutation.mutate({
      applicationId: selectedApplication.id,
      status,
      notes: reviewNotes
    });
  };

  const pendingApps = applications.filter(a => a.status === 'pending');
  const approvedApps = applications.filter(a => a.status === 'approved');
  const rejectedApps = applications.filter(a => a.status === 'rejected');

  const renderApplication = (app) => (
    <Card key={app.id} className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => setSelectedApplication(app)}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={app.applicant_avatar} />
            <AvatarFallback>{app.applicant_name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-slate-900">{app.applicant_name}</h3>
              {app.status === 'pending' && <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pending</Badge>}
              {app.status === 'approved' && <Badge className="bg-emerald-100 text-emerald-700"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>}
              {app.status === 'rejected' && <Badge className="bg-rose-100 text-rose-700"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>}
            </div>
            <p className="text-sm text-slate-600 line-clamp-2">{app.reason}</p>
            <p className="text-xs text-slate-400 mt-2">
              Applied {format(parseISO(app.created_date), 'MMM d, yyyy')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Leader Applications</h2>
        <p className="text-slate-500 mt-1">Review and approve 144K leader requests</p>
      </div>

      {/* Applications Tabs */}
      <Tabs defaultValue="pending">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="pending">
            Pending ({pendingApps.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedApps.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedApps.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-6">
          {pendingApps.length === 0 ? (
            <div className="text-center py-12">
              <Crown className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No pending applications</p>
            </div>
          ) : (
            pendingApps.map(renderApplication)
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4 mt-6">
          {approvedApps.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">No approved applications yet</p>
            </div>
          ) : (
            approvedApps.map(renderApplication)
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4 mt-6">
          {rejectedApps.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">No rejected applications</p>
            </div>
          ) : (
            rejectedApps.map(renderApplication)
          )}
        </TabsContent>
      </Tabs>

      {/* Review Modal */}
      <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Leader Application Review</DialogTitle>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6">
              {/* Applicant Info */}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={selectedApplication.applicant_avatar} />
                  <AvatarFallback>{selectedApplication.applicant_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-slate-900">{selectedApplication.applicant_name}</h3>
                  <p className="text-sm text-slate-500">Applied {format(parseISO(selectedApplication.created_date), 'MMMM d, yyyy')}</p>
                </div>
              </div>

              {/* Application Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Why they want to be a leader</h4>
                  <p className="text-sm text-slate-600">{selectedApplication.reason}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Relevant Experience</h4>
                  <p className="text-sm text-slate-600">{selectedApplication.experience}</p>
                </div>
                {selectedApplication.contribution_plan && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Contribution Plan</h4>
                    <p className="text-sm text-slate-600">{selectedApplication.contribution_plan}</p>
                  </div>
                )}
              </div>

              {/* Review Status */}
              {selectedApplication.status !== 'pending' && (
                <div className="p-4 rounded-lg bg-slate-50">
                  <p className="text-sm font-medium text-slate-900 mb-1">
                    {selectedApplication.status === 'approved' ? 'Approved' : 'Rejected'} by {selectedApplication.reviewed_by}
                  </p>
                  <p className="text-xs text-slate-500">{format(parseISO(selectedApplication.reviewed_at), 'MMM d, yyyy h:mm a')}</p>
                  {selectedApplication.review_notes && (
                    <p className="text-sm text-slate-600 mt-2">{selectedApplication.review_notes}</p>
                  )}
                </div>
              )}

              {/* Review Actions */}
              {selectedApplication.status === 'pending' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-900 mb-2 block">Review Notes</label>
                    <Textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Add notes about your decision..."
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleReview('rejected')}
                      variant="outline"
                      className="flex-1 text-rose-600 border-rose-200 hover:bg-rose-50"
                      disabled={reviewApplicationMutation.isPending}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => handleReview('approved')}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      disabled={reviewApplicationMutation.isPending}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve as 144K Leader
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}