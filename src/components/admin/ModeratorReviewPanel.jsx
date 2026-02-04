import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Shield, AlertTriangle, CheckCircle, XCircle, 
  Ban, Eye, MessageSquare, User, Clock, Filter,
  ChevronDown, ChevronUp, RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';

export default function ModeratorReviewPanel() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('pending_review');
  const [selectedFlag, setSelectedFlag] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionToTake, setActionToTake] = useState('none');
  const [expandedId, setExpandedId] = useState(null);

  // Fetch content flags
  const { data: flags = [], isLoading, refetch } = useQuery({
    queryKey: ['contentFlags', statusFilter],
    queryFn: async () => {
      if (statusFilter === 'all') {
        return base44.entities.ContentFlag.list('-created_date', 100);
      }
      return base44.entities.ContentFlag.filter({ status: statusFilter }, '-created_date', 100);
    }
  });

  // Fetch current user for reviewer info
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  // Update flag mutation
  const updateFlagMutation = useMutation({
    mutationFn: async ({ flagId, updates }) => {
      return base44.entities.ContentFlag.update(flagId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contentFlags'] });
      setSelectedFlag(null);
      setReviewNotes('');
      setActionToTake('none');
    }
  });

  // Block user mutation
  const blockUserMutation = useMutation({
    mutationFn: async ({ userId, flagId }) => {
      // Update user profile to blocked status
      const profiles = await base44.entities.UserProfile.filter({ user_id: userId });
      if (profiles?.[0]) {
        await base44.entities.UserProfile.update(profiles[0].id, { 
          status: 'blocked',
          block_shares: true 
        });
      }
      // Update flag
      await base44.entities.ContentFlag.update(flagId, {
        status: 'user_blocked',
        action_taken: 'user_blocked',
        reviewer_id: currentUser?.email,
        reviewer_name: currentUser?.full_name,
        reviewed_at: new Date().toISOString(),
        review_notes: reviewNotes
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contentFlags'] });
      setSelectedFlag(null);
    }
  });

  const handleReview = (flag) => {
    setSelectedFlag(flag);
    setReviewNotes(flag.review_notes || '');
    setActionToTake(flag.action_taken || 'none');
  };

  const handleSubmitReview = async (newStatus) => {
    if (!selectedFlag) return;

    await updateFlagMutation.mutateAsync({
      flagId: selectedFlag.id,
      updates: {
        status: newStatus,
        action_taken: actionToTake,
        reviewer_id: currentUser?.email,
        reviewer_name: currentUser?.full_name,
        reviewed_at: new Date().toISOString(),
        review_notes: reviewNotes
      }
    });
  };

  const handleBlockUser = async () => {
    if (!selectedFlag) return;
    await blockUserMutation.mutateAsync({
      userId: selectedFlag.flagged_user_id,
      flagId: selectedFlag.id
    });
  };

  const getStatusBadge = (status) => {
    const config = {
      pending_review: { color: 'bg-amber-100 text-amber-800', icon: Clock, label: 'Pending Review' },
      confirmed_violation: { color: 'bg-red-100 text-red-800', icon: AlertTriangle, label: 'Confirmed' },
      dismissed: { color: 'bg-gray-100 text-gray-800', icon: XCircle, label: 'Dismissed' },
      user_warned: { color: 'bg-yellow-100 text-yellow-800', icon: MessageSquare, label: 'User Warned' },
      user_blocked: { color: 'bg-red-200 text-red-900', icon: Ban, label: 'User Blocked' }
    };
    const cfg = config[status] || config.pending_review;
    const Icon = cfg.icon;
    return (
      <Badge className={`${cfg.color} gap-1`}>
        <Icon className="w-3 h-3" />
        {cfg.label}
      </Badge>
    );
  };

  const pendingCount = flags.filter(f => f.status === 'pending_review').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
            <Shield className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Content Moderation</h2>
            <p className="text-sm text-slate-500">Review flagged content for policy violations</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <Badge className="bg-red-500 text-white animate-pulse">
              {pendingCount} Pending
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Filter className="w-4 h-4 text-slate-500" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Flags</SelectItem>
            <SelectItem value="pending_review">Pending Review</SelectItem>
            <SelectItem value="confirmed_violation">Confirmed Violations</SelectItem>
            <SelectItem value="user_warned">User Warned</SelectItem>
            <SelectItem value="user_blocked">User Blocked</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Flags List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
        </div>
      ) : flags.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-900 mb-2">No Flags Found</h3>
            <p className="text-sm text-slate-500">
              {statusFilter === 'pending_review' 
                ? 'Great! No content is pending review.' 
                : 'No flags match the current filter.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {flags.map((flag) => (
            <Card key={flag.id} className={flag.status === 'pending_review' ? 'border-amber-300 bg-amber-50/50' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusBadge(flag.status)}
                      <Badge variant="outline" className="text-xs">
                        {flag.content_type}
                      </Badge>
                      {flag.auto_flagged && (
                        <Badge className="bg-blue-100 text-blue-800 text-xs">Auto-flagged</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="font-medium text-slate-900">
                        {flag.flagged_user_name || flag.flagged_user_id}
                      </span>
                      {flag.flagged_user_email && (
                        <span className="text-sm text-slate-500">({flag.flagged_user_email})</span>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 mb-2">
                      Flagged: {format(new Date(flag.created_date), 'MMM d, yyyy h:mm a')}
                    </div>

                    {/* Detected Keywords */}
                    {flag.detected_keywords?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {flag.detected_keywords.map((kw, i) => (
                          <Badge key={i} variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                            {kw}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Content Preview */}
                    <div 
                      className="p-3 rounded-lg bg-slate-100 cursor-pointer"
                      onClick={() => setExpandedId(expandedId === flag.id ? null : flag.id)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-500">Flagged Content:</span>
                        {expandedId === flag.id ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <p className={`text-sm text-slate-700 ${expandedId === flag.id ? '' : 'line-clamp-2'}`}>
                        {flag.content_text}
                      </p>
                    </div>

                    {/* Review Info */}
                    {flag.reviewer_name && (
                      <div className="mt-2 text-xs text-slate-500">
                        Reviewed by {flag.reviewer_name} on {format(new Date(flag.reviewed_at), 'MMM d, yyyy')}
                        {flag.review_notes && (
                          <p className="mt-1 italic">"{flag.review_notes}"</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleReview(flag)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Review
                    </Button>
                    {flag.status === 'pending_review' && (
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => {
                          setSelectedFlag(flag);
                          handleBlockUser();
                        }}
                      >
                        <Ban className="w-4 h-4 mr-1" />
                        Block
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={!!selectedFlag} onOpenChange={(open) => !open && setSelectedFlag(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-600" />
              Review Flagged Content
            </DialogTitle>
          </DialogHeader>

          {selectedFlag && (
            <div className="space-y-4">
              {/* User Info */}
              <div className="p-3 rounded-lg bg-slate-50">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-slate-500" />
                  <span className="font-medium">{selectedFlag.flagged_user_name || selectedFlag.flagged_user_id}</span>
                </div>
                <div className="text-sm text-slate-500">{selectedFlag.flagged_user_email}</div>
              </div>

              {/* Content */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Flagged Content:</label>
                <ScrollArea className="h-32 p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-slate-800">{selectedFlag.content_text}</p>
                </ScrollArea>
              </div>

              {/* Detected Keywords */}
              {selectedFlag.detected_keywords?.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Detected Keywords:</label>
                  <div className="flex flex-wrap gap-1">
                    {selectedFlag.detected_keywords.map((kw, i) => (
                      <Badge key={i} className="bg-red-100 text-red-800">{kw}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Selection */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Action to Take:</label>
                <Select value={actionToTake} onValueChange={setActionToTake}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Action</SelectItem>
                    <SelectItem value="content_removed">Remove Content</SelectItem>
                    <SelectItem value="user_warned">Warn User</SelectItem>
                    <SelectItem value="user_blocked">Block User</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Review Notes */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Review Notes:</label>
                <Textarea
                  placeholder="Add notes about your decision..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="h-24"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelectedFlag(null)}>
              Cancel
            </Button>
            <Button 
              variant="secondary"
              onClick={() => handleSubmitReview('dismissed')}
              disabled={updateFlagMutation.isPending}
            >
              <XCircle className="w-4 h-4 mr-1" />
              Dismiss
            </Button>
            <Button 
              className="bg-amber-600 hover:bg-amber-700"
              onClick={() => handleSubmitReview('user_warned')}
              disabled={updateFlagMutation.isPending}
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              Warn User
            </Button>
            <Button 
              variant="destructive"
              onClick={() => handleSubmitReview('user_blocked')}
              disabled={updateFlagMutation.isPending || blockUserMutation.isPending}
            >
              <Ban className="w-4 h-4 mr-1" />
              Block User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}