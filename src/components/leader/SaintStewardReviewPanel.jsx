import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Crown, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Award
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SaintStewardReviewPanel({ currentUser }) {
  const [selectedNomination, setSelectedNomination] = useState(null);
  const [endorsementComment, setEndorsementComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionType, setActionType] = useState(null);

  const queryClient = useQueryClient();

  const { data: nominations = [] } = useQuery({
    queryKey: ['saintStewardNominations'],
    queryFn: () => base44.entities.SaintStewardNomination.list('-created_date', 100)
  });

  const endorseMutation = useMutation({
    mutationFn: async ({ nominationId, comment }) => {
      const nomination = nominations.find(n => n.id === nominationId);
      const newEndorsement = {
        endorser_id: currentUser.user_id,
        endorser_name: currentUser.display_name,
        endorser_avatar: currentUser.avatar_url,
        comment,
        endorsed_at: new Date().toISOString()
      };

      const updatedEndorsements = [...(nomination.endorsements || []), newEndorsement];
      const endorsementCount = updatedEndorsements.length;

      // Auto-approve if reached required endorsements
      const newStatus = endorsementCount >= nomination.required_endorsements ? 'approved' : 'under_review';

      await base44.entities.SaintStewardNomination.update(nominationId, {
        endorsements: updatedEndorsements,
        endorsement_count: endorsementCount,
        status: newStatus,
        reviewed_at: newStatus === 'approved' ? new Date().toISOString() : null
      });

      // If approved, grant the badge
      if (newStatus === 'approved') {
        await base44.entities.Badge.create({
          user_id: nomination.nominee_id,
          badge_code: 'saint_steward',
          badge_name: 'Saint Steward',
          category: 'mission',
          status: 'active'
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saintStewardNominations'] });
      setSelectedNomination(null);
      setEndorsementComment('');
      setActionType(null);
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ nominationId, reason }) => {
      const nomination = nominations.find(n => n.id === nominationId);
      const newRejection = {
        rejector_id: currentUser.user_id,
        rejector_name: currentUser.display_name,
        reason,
        rejected_at: new Date().toISOString()
      };

      const updatedRejections = [...(nomination.rejections || []), newRejection];

      await base44.entities.SaintStewardNomination.update(nominationId, {
        rejections: updatedRejections,
        rejection_count: updatedRejections.length,
        status: 'rejected',
        reviewed_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saintStewardNominations'] });
      setSelectedNomination(null);
      setRejectionReason('');
      setActionType(null);
    }
  });

  const handleEndorse = () => {
    if (selectedNomination) {
      endorseMutation.mutate({
        nominationId: selectedNomination.id,
        comment: endorsementComment
      });
    }
  };

  const handleReject = () => {
    if (selectedNomination && rejectionReason) {
      rejectMutation.mutate({
        nominationId: selectedNomination.id,
        reason: rejectionReason
      });
    }
  };

  const hasUserVoted = (nomination) => {
    const endorsed = nomination.endorsements?.some(e => e.endorser_id === currentUser.user_id);
    const rejected = nomination.rejections?.some(r => r.rejector_id === currentUser.user_id);
    return endorsed || rejected;
  };

  const pendingNominations = nominations.filter(n => n.status === 'pending' || n.status === 'under_review');
  const approvedNominations = nominations.filter(n => n.status === 'approved');
  const rejectedNominations = nominations.filter(n => n.status === 'rejected');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Crown className="w-6 h-6 text-amber-500" />
          Saint Steward Peer Review
        </h2>
        <p className="text-slate-500 mt-1">Review and endorse nominations for the highest leadership badge</p>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="pending">
            Pending ({pendingNominations.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedNominations.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedNominations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingNominations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No pending nominations</p>
              </CardContent>
            </Card>
          ) : (
            pendingNominations.map(nomination => (
              <NominationCard
                key={nomination.id}
                nomination={nomination}
                currentUser={currentUser}
                hasVoted={hasUserVoted(nomination)}
                onView={() => setSelectedNomination(nomination)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedNominations.map(nomination => (
            <NominationCard
              key={nomination.id}
              nomination={nomination}
              currentUser={currentUser}
              hasVoted={hasUserVoted(nomination)}
              onView={() => setSelectedNomination(nomination)}
            />
          ))}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedNominations.map(nomination => (
            <NominationCard
              key={nomination.id}
              nomination={nomination}
              currentUser={currentUser}
              hasVoted={hasUserVoted(nomination)}
              onView={() => setSelectedNomination(nomination)}
            />
          ))}
        </TabsContent>
      </Tabs>

      {/* Detail Modal */}
      <Dialog open={!!selectedNomination} onOpenChange={() => setSelectedNomination(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedNomination && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-500" />
                  Saint Steward Nomination Review
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Nominee Info */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-violet-50 border border-violet-200">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={selectedNomination.nominee_avatar} />
                    <AvatarFallback>{selectedNomination.nominee_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{selectedNomination.nominee_name}</h3>
                    <p className="text-sm text-slate-600">Nominated by {selectedNomination.nominator_name}</p>
                  </div>
                  <Badge className={cn(
                    selectedNomination.status === 'approved' && "bg-green-100 text-green-700",
                    selectedNomination.status === 'rejected' && "bg-red-100 text-red-700",
                    selectedNomination.status === 'pending' && "bg-amber-100 text-amber-700",
                    selectedNomination.status === 'under_review' && "bg-blue-100 text-blue-700"
                  )}>
                    {selectedNomination.status.replace('_', ' ')}
                  </Badge>
                </div>

                {/* Progress */}
                <div className="p-4 rounded-xl bg-slate-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Peer Endorsements</span>
                    <span className="text-sm font-bold text-violet-600">
                      {selectedNomination.endorsement_count} / {selectedNomination.required_endorsements}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-violet-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((selectedNomination.endorsement_count / selectedNomination.required_endorsements) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Testimonial */}
                <div>
                  <h4 className="font-semibold mb-2">Leadership Testimonial</h4>
                  <p className="text-slate-700 bg-slate-50 p-4 rounded-xl">{selectedNomination.testimonial}</p>
                </div>

                {/* Evidence */}
                <div>
                  <h4 className="font-semibold mb-2">Evidence of Leadership</h4>
                  <p className="text-slate-700 bg-slate-50 p-4 rounded-xl">{selectedNomination.evidence_of_leadership}</p>
                </div>

                {/* Missions Led */}
                {selectedNomination.missions_led?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Missions Led</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedNomination.missions_led.map((mission, i) => (
                        <Badge key={i} variant="outline">{mission}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Community Impact */}
                <div>
                  <h4 className="font-semibold mb-2">Community Impact</h4>
                  <p className="text-slate-700 bg-slate-50 p-4 rounded-xl">{selectedNomination.community_impact}</p>
                </div>

                {/* Endorsements */}
                {selectedNomination.endorsements?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <ThumbsUp className="w-4 h-4 text-green-500" />
                      Endorsements ({selectedNomination.endorsements.length})
                    </h4>
                    <ScrollArea className="h-48">
                      <div className="space-y-3">
                        {selectedNomination.endorsements.map((endorsement, i) => (
                          <div key={i} className="p-3 rounded-xl bg-green-50 border border-green-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={endorsement.endorser_avatar} />
                                <AvatarFallback className="text-xs">{endorsement.endorser_name?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium">{endorsement.endorser_name}</span>
                            </div>
                            <p className="text-sm text-slate-700">{endorsement.comment}</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                {/* Actions */}
                {!hasUserVoted(selectedNomination) && selectedNomination.status !== 'approved' && selectedNomination.status !== 'rejected' && (
                  <div className="flex gap-3 pt-4 border-t">
                    {actionType === 'endorse' ? (
                      <div className="flex-1 space-y-3">
                        <Textarea
                          value={endorsementComment}
                          onChange={(e) => setEndorsementComment(e.target.value)}
                          placeholder="Add your endorsement (optional)..."
                          className="min-h-20"
                        />
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => setActionType(null)}>Cancel</Button>
                          <Button 
                            onClick={handleEndorse}
                            className="bg-green-600 hover:bg-green-700"
                            disabled={endorseMutation.isPending}
                          >
                            <ThumbsUp className="w-4 h-4 mr-2" />
                            Submit Endorsement
                          </Button>
                        </div>
                      </div>
                    ) : actionType === 'reject' ? (
                      <div className="flex-1 space-y-3">
                        <Textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Explain why you're rejecting this nomination..."
                          className="min-h-20"
                          required
                        />
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => setActionType(null)}>Cancel</Button>
                          <Button 
                            onClick={handleReject}
                            variant="destructive"
                            disabled={!rejectionReason || rejectMutation.isPending}
                          >
                            <ThumbsDown className="w-4 h-4 mr-2" />
                            Submit Rejection
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Button 
                          onClick={() => setActionType('endorse')}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <ThumbsUp className="w-4 h-4 mr-2" />
                          Endorse
                        </Button>
                        <Button 
                          onClick={() => setActionType('reject')}
                          variant="outline"
                          className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                        >
                          <ThumbsDown className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NominationCard({ nomination, currentUser, hasVoted, onView }) {
  return (
    <Card className="hover:shadow-lg transition-all cursor-pointer" onClick={onView}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Avatar className="w-12 h-12">
              <AvatarImage src={nomination.nominee_avatar} />
              <AvatarFallback>{nomination.nominee_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900">{nomination.nominee_name}</h4>
              <p className="text-sm text-slate-500">Nominated by {nomination.nominator_name}</p>
              <div className="flex items-center gap-3 mt-2 text-sm">
                <span className="flex items-center gap-1 text-green-600">
                  <ThumbsUp className="w-4 h-4" />
                  {nomination.endorsement_count}/{nomination.required_endorsements}
                </span>
                {nomination.missions_led?.length > 0 && (
                  <span className="flex items-center gap-1 text-violet-600">
                    <Award className="w-4 h-4" />
                    {nomination.missions_led.length} missions
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={cn(
              nomination.status === 'approved' && "bg-green-100 text-green-700",
              nomination.status === 'rejected' && "bg-red-100 text-red-700",
              nomination.status === 'pending' && "bg-amber-100 text-amber-700",
              nomination.status === 'under_review' && "bg-blue-100 text-blue-700"
            )}>
              {nomination.status === 'approved' && <CheckCircle2 className="w-3 h-3 mr-1" />}
              {nomination.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
              {nomination.status.replace('_', ' ')}
            </Badge>
            {hasVoted && (
              <Badge variant="outline" className="text-xs">
                You voted
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}