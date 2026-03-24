import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Shield, AlertTriangle, CheckCircle, XCircle, Trash2,
  Eye, User, Clock, Filter, RefreshCw, MessageSquare, Ban
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const STATUS_CONFIG = {
  pending: { color: 'bg-amber-100 text-amber-800', icon: Clock, label: 'Pending' },
  reviewed: { color: 'bg-blue-100 text-blue-800', icon: Eye, label: 'Reviewed' },
  resolved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Resolved' },
  dismissed: { color: 'bg-slate-100 text-slate-700', icon: XCircle, label: 'Dismissed' }
};

const REASON_LABELS = {
  spam: 'Spam',
  harassment: 'Abuse / Harassment',
  misinformation: 'Misinformation',
  inappropriate: 'Inappropriate',
  off_topic: 'Off-Topic',
  other: 'Other'
};

export default function WisdomModerationQueue() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedReport, setSelectedReport] = useState(null);
  const [notes, setNotes] = useState('');
  const [action, setAction] = useState('none');

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: reports = [], isLoading, refetch } = useQuery({
    queryKey: ['wisdomReports', statusFilter],
    queryFn: async () => {
      const allReports = statusFilter === 'all'
        ? await base44.entities.ForumReport.list('-created_date', 200)
        : await base44.entities.ForumReport.filter({ status: statusFilter }, '-created_date', 200);
      return allReports.filter(r => r.target_type === 'question' || r.target_type === 'answer');
    }
  });

  const resolveMutation = useMutation({
    mutationFn: async ({ reportId, newStatus }) => {
      const updates = {
        status: newStatus,
        action_taken: action,
        reviewed_by: currentUser?.email,
        reviewed_at: new Date().toISOString(),
        resolution_notes: notes
      };

      // If removing content, update the actual entity
      if (action === 'content_removed' && selectedReport) {
        if (selectedReport.target_type === 'question') {
          await base44.entities.AdviceQuestion.update(selectedReport.target_id, { status: 'closed' });
        } else if (selectedReport.target_type === 'answer') {
          await base44.entities.AdviceAnswer.delete(selectedReport.target_id);
        }
      }

      // If warning user, send notification
      if ((action === 'user_warned' || action === 'user_blocked') && selectedReport?.target_author_id) {
        await base44.entities.Notification.create({
          user_id: selectedReport.target_author_id,
          title: action === 'user_warned' ? 'Content Warning' : 'Account Action',
          message: action === 'user_warned'
            ? 'Your content in the Wisdom Exchange was flagged and reviewed. Please ensure your contributions follow community guidelines.'
            : 'Your account has been restricted due to repeated community guideline violations.',
          type: 'system',
          action_url: ''
        });
      }

      return base44.entities.ForumReport.update(reportId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wisdomReports'] });
      toast.success('Report resolved');
      setSelectedReport(null);
      setNotes('');
      setAction('none');
    }
  });

  const pendingCount = reports.filter(r => r.status === 'pending').length;

  const getStatusBadge = (status) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    const Icon = cfg.icon;
    return (
      <Badge className={cn(cfg.color, 'gap-1')}>
        <Icon className="w-3 h-3" />
        {cfg.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <Shield className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Wisdom Exchange Moderation</h2>
            <p className="text-sm text-slate-500">Review flagged questions and answers</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <Badge className="bg-red-500 text-white">{pendingCount} Pending</Badge>
          )}
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Filter className="w-4 h-4 text-slate-500" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reports</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
        </div>
      ) : reports.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-900 mb-2">All Clear</h3>
            <p className="text-sm text-slate-500">No wisdom exchange reports match this filter.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reports.map(report => (
            <Card key={report.id} className={report.status === 'pending' ? 'border-amber-300 bg-amber-50/30' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {getStatusBadge(report.status)}
                      <Badge variant="outline" className="text-xs capitalize">{report.target_type}</Badge>
                      <Badge className="bg-red-50 text-red-700 border-red-200 text-xs">
                        {REASON_LABELS[report.reason] || report.reason}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 mb-1 text-sm">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-600">Reported user:</span>
                      <span className="font-medium text-slate-900">{report.target_author_name || report.target_author_id}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2 text-xs text-slate-500">
                      <span>Reported by {report.reporter_name || report.reporter_id}</span>
                      <span>•</span>
                      <span>{format(new Date(report.created_date), 'MMM d, yyyy h:mm a')}</span>
                    </div>

                    {report.content_preview && (
                      <div className="p-3 rounded-lg bg-slate-100 mb-2">
                        <p className="text-xs text-slate-500 mb-1">Content:</p>
                        <p className="text-sm text-slate-700 line-clamp-3">{report.content_preview}</p>
                      </div>
                    )}

                    {report.details && (
                      <p className="text-sm text-slate-600 italic">"{report.details}"</p>
                    )}

                    {report.reviewed_by && (
                      <p className="text-xs text-slate-400 mt-2">
                        Reviewed by {report.reviewed_by} on {format(new Date(report.reviewed_at), 'MMM d')}
                        {report.resolution_notes && <span> — "{report.resolution_notes}"</span>}
                      </p>
                    )}
                  </div>

                  {report.status === 'pending' && (
                    <Button size="sm" variant="outline" onClick={() => { setSelectedReport(report); setNotes(''); setAction('none'); }}>
                      <Eye className="w-4 h-4 mr-1" /> Review
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={(o) => !o && setSelectedReport(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-600" />
              Review Report
            </DialogTitle>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-slate-50">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs capitalize">{selectedReport.target_type}</Badge>
                  <Badge className="bg-red-50 text-red-700 text-xs">{REASON_LABELS[selectedReport.reason]}</Badge>
                </div>
                <p className="text-sm font-medium mt-2">Author: {selectedReport.target_author_name || selectedReport.target_author_id}</p>
                <p className="text-xs text-slate-500">Reporter: {selectedReport.reporter_name}</p>
              </div>

              {selectedReport.content_preview && (
                <ScrollArea className="h-28 p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-slate-800">{selectedReport.content_preview}</p>
                </ScrollArea>
              )}

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Action:</label>
                <Select value={action} onValueChange={setAction}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Action</SelectItem>
                    <SelectItem value="content_removed">Remove Content</SelectItem>
                    <SelectItem value="user_warned">Warn User</SelectItem>
                    <SelectItem value="user_blocked">Block User</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Notes:</label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Review notes..." className="h-20" />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelectedReport(null)}>Cancel</Button>
            <Button
              variant="secondary"
              onClick={() => resolveMutation.mutate({ reportId: selectedReport.id, newStatus: 'dismissed' })}
              disabled={resolveMutation.isPending}
            >
              <XCircle className="w-4 h-4 mr-1" /> Dismiss
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => resolveMutation.mutate({ reportId: selectedReport.id, newStatus: 'resolved' })}
              disabled={resolveMutation.isPending}
            >
              <CheckCircle className="w-4 h-4 mr-1" /> Resolve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}