import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  MessageSquare, Bug, Lightbulb, HelpCircle, Search,
  Clock, CheckCircle2, XCircle, Loader2, Eye, Trash2, ExternalLink,
  Wand2, Bot, Copy, Wrench, ShieldCheck
} from "lucide-react";
import { format } from 'date-fns';
import { toast } from 'sonner';
import BugRepairChecklist from './BugRepairChecklist';

const TYPE_CONFIG = {
  bug: { icon: Bug, color: 'bg-red-100 text-red-700', label: 'Bug' },
  suggestion: { icon: Lightbulb, color: 'bg-amber-100 text-amber-700', label: 'Suggestion' },
  comment: { icon: MessageSquare, color: 'bg-blue-100 text-blue-700', label: 'Comment' },
  other: { icon: HelpCircle, color: 'bg-slate-100 text-slate-700', label: 'Other' }
};

const STATUS_CONFIG = {
  pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-700', label: 'Pending' },
  reviewed: { icon: Eye, color: 'bg-blue-100 text-blue-700', label: 'Reviewed' },
  in_progress: { icon: Loader2, color: 'bg-purple-100 text-purple-700', label: 'In Progress' },
  resolved: { icon: CheckCircle2, color: 'bg-green-100 text-green-700', label: 'Resolved' },
  dismissed: { icon: XCircle, color: 'bg-slate-100 text-slate-700', label: 'Dismissed' }
};

const SEVERITY_CONFIG = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700'
};

// Copy button with visual feedback
function CopyButton({ feedback, typeConfig, statusConfig }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = (e) => {
    e.stopPropagation();
    const copyText = `**${typeConfig.label}** (${statusConfig.label}) - ${feedback.severity || 'N/A'} severity\n\n**Reporter:** ${feedback.reporter_name || feedback.reporter_id}\n**Date:** ${format(new Date(feedback.created_date), 'MMM d, yyyy h:mm a')}\n**Page:** ${feedback.page_url || 'N/A'}\n\n**Description:**\n${feedback.description}${feedback.screenshot_url ? `\n\n**Screenshot:** ${feedback.screenshot_url}` : ''}`;
    navigator.clipboard.writeText(copyText);
    setCopied(true);
    toast.success('Copied feedback to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <Button
      variant="outline"
      size="sm"
      className={`shrink-0 transition-all ${copied ? 'bg-green-100 border-green-500 text-green-700' : ''}`}
      onClick={handleCopy}
    >
      {copied ? (
        <>
          <CheckCircle2 className="w-4 h-4 mr-1" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="w-4 h-4 mr-1" />
          Copy
        </>
      )}
    </Button>
  );
}

export default function AdminBetaFeedback() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: feedbackList = [], isLoading } = useQuery({
    queryKey: ['betaFeedback'],
    queryFn: () => base44.entities.BetaFeedback.list('-created_date', 500)
  });

  // Helper to log admin actions to the audit log
  const logAdminAction = async (actionDetail, feedbackId, metadata = {}) => {
    try {
      await base44.entities.UserAuditLog.create({
        user_id: currentUser?.email || 'admin',
        action_type: 'update',
        action_detail: actionDetail,
        entity_type: 'BetaFeedback',
        entity_id: feedbackId,
        page_name: 'Admin - Beta Feedback',
        metadata
      });
    } catch (e) {
      console.error('Failed to log audit action:', e);
    }
  };

  const updateMutation = useMutation({
    mutationFn: ({ id, data, logMessage, logMeta }) => 
      base44.entities.BetaFeedback.update(id, data).then(() => ({ id, logMessage, logMeta })),
    onSuccess: ({ id, logMessage, logMeta }) => {
      queryClient.invalidateQueries({ queryKey: ['betaFeedback'] });
      if (logMessage) {
        logAdminAction(logMessage, id, logMeta);
      }
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BetaFeedback.delete(id).then(() => id),
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['betaFeedback'] });
      logAdminAction('Deleted beta feedback entry', id, { action: 'delete' });
      setSelectedFeedback(null);
    }
  });

  const [isAutoRepairing, setIsAutoRepairing] = useState(false);

  const handleAutoRepair = async () => {
    setIsAutoRepairing(true);
    try {
      const response = await base44.functions.invoke('autoBugRepair', {});
      const result = response.data;
      
      if (result.processed > 0) {
        toast.success(`Analyzed ${result.processed} bug reports`);
        queryClient.invalidateQueries({ queryKey: ['betaFeedback'] });
      } else {
        toast.info(result.message || 'No pending bugs to process');
      }
    } catch (error) {
      toast.error('Failed to run auto-repair: ' + (error.message || 'Unknown error'));
    } finally {
      setIsAutoRepairing(false);
    }
  };

  const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

  const filtered = feedbackList.filter(f => {
    const matchesSearch = !search || 
      f.description?.toLowerCase().includes(search.toLowerCase()) ||
      f.reporter_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || f.status === filterStatus;
    const matchesType = filterType === 'all' || f.feedback_type === filterType;
    const matchesSeverity = filterSeverity === 'all' || f.severity === filterSeverity;
    return matchesSearch && matchesStatus && matchesType && matchesSeverity;
  }).sort((a, b) => {
    if (sortBy === 'severity') {
      const sa = SEVERITY_ORDER[a.severity] ?? 4;
      const sb = SEVERITY_ORDER[b.severity] ?? 4;
      if (sa !== sb) return sa - sb;
    }
    return new Date(b.created_date) - new Date(a.created_date);
  });

  const handleStatusChange = async (id, newStatus, oldStatus) => {
    const statusLabel = STATUS_CONFIG[newStatus]?.label || newStatus;
    const oldStatusLabel = STATUS_CONFIG[oldStatus]?.label || oldStatus;
    
    // Find the feedback to get reporter info
    const feedback = feedbackList.find(f => f.id === id);
    
    updateMutation.mutate({ 
      id, 
      data: { status: newStatus },
      logMessage: `Changed feedback status from "${oldStatusLabel}" to "${statusLabel}"`,
      logMeta: { old_status: oldStatus, new_status: newStatus }
    });
    
    // Award GGG when resolved (0.03 bonus, multiplied if bonus active)
    if (newStatus === 'resolved' && oldStatus !== 'resolved' && feedback?.reporter_id) {
      try {
        const profiles = await base44.entities.UserProfile.filter({ user_id: feedback.reporter_id });
        const profile = profiles?.[0];
        const platformSettings = await base44.entities.PlatformSetting.list();
        const settings = platformSettings?.[0] || {};
        const bonusActive = settings.beta_bonus_active;
        const multiplier = bonusActive ? (settings.beta_bonus_multiplier || 2) : 1;
        const reward = 0.03 * multiplier;
        
        if (profile) {
          const newBalance = (profile.ggg_balance || 0) + reward;
          await base44.entities.UserProfile.update(profile.id, { ggg_balance: newBalance });
          await base44.entities.GGGTransaction.create({
            user_id: feedback.reporter_id,
            delta: reward,
            reason_code: 'feedback_resolved',
            description: `Feedback resolved bonus${bonusActive ? ' (bonus period)' : ''}`,
            balance_after: newBalance,
            source_type: 'reward'
          });
          toast.success(`Awarded ${reward.toFixed(2)} GGG to ${feedback.reporter_name || feedback.reporter_id} for resolved feedback${bonusActive ? ' (bonus!)' : ''}`);
        }
      } catch (e) {
        console.error('Failed to award resolved feedback GGG:', e);
      }
    }
    
    // Update local state for the modal
    if (selectedFeedback?.id === id) {
      setSelectedFeedback(prev => ({ ...prev, status: newStatus }));
    }
  };

  const handleSaveNotes = () => {
    if (selectedFeedback) {
      updateMutation.mutate({ 
        id: selectedFeedback.id, 
        data: { admin_notes: adminNotes },
        logMessage: 'Updated admin notes on feedback',
        logMeta: { notes_length: adminNotes?.length || 0 }
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Auto-Repair Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Beta Feedback</h3>
        <Button
          onClick={handleAutoRepair}
          disabled={isAutoRepairing}
          className="bg-violet-600 hover:bg-violet-700"
        >
          {isAutoRepairing ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Bot className="w-4 h-4 mr-2" />
          )}
          {isAutoRepairing ? 'Analyzing...' : 'Auto-Analyze Bugs'}
        </Button>
      </div>

      {/* Summary Cards — click to filter */}
      {(() => {
        const total = feedbackList.length;
        const pending = feedbackList.filter(f => f.status === 'pending').length;
        const inProgress = feedbackList.filter(f => f.status === 'in_progress').length;
        const resolved = feedbackList.filter(f => f.status === 'resolved').length;
        const fixed = feedbackList.filter(f => f.is_fixed).length;
        const tested = feedbackList.filter(f => f.coordinator_tested).length;
        const bugs = feedbackList.filter(f => f.feedback_type === 'bug').length;

        const cards = [
          { label: 'Total', count: total, filter: () => { setFilterStatus('all'); setFilterType('all'); }, color: 'bg-slate-50 border-slate-200 text-slate-700', active: filterStatus === 'all' && filterType === 'all' },
          { label: 'Pending', count: pending, filter: () => { setFilterStatus('pending'); setFilterType('all'); }, color: 'bg-yellow-50 border-yellow-200 text-yellow-700', active: filterStatus === 'pending' },
          { label: 'In Progress', count: inProgress, filter: () => { setFilterStatus('in_progress'); setFilterType('all'); }, color: 'bg-purple-50 border-purple-200 text-purple-700', active: filterStatus === 'in_progress' },
          { label: 'Resolved', count: resolved, filter: () => { setFilterStatus('resolved'); setFilterType('all'); }, color: 'bg-green-50 border-green-200 text-green-700', active: filterStatus === 'resolved' },
          { label: 'Bugs', count: bugs, filter: () => { setFilterType('bug'); setFilterStatus('all'); }, color: 'bg-red-50 border-red-200 text-red-700', active: filterType === 'bug' },
          { label: 'Fixed', count: fixed, filter: () => { setFilterStatus('all'); setFilterType('all'); }, color: 'bg-emerald-50 border-emerald-200 text-emerald-700', icon: Wrench },
          { label: 'Tested', count: tested, filter: () => { setFilterStatus('all'); setFilterType('all'); }, color: 'bg-blue-50 border-blue-200 text-blue-700', icon: ShieldCheck },
        ];

        return (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {cards.map(card => (
              <button
                key={card.label}
                onClick={card.filter}
                className={`p-3 rounded-xl border text-center transition-all hover:shadow-md ${card.color} ${card.active ? 'ring-2 ring-violet-400 shadow-md' : ''}`}
              >
                <div className="text-2xl font-bold">{card.count}</div>
                <div className="text-xs font-medium mt-0.5">{card.label}</div>
              </button>
            ))}
          </div>
        );
      })()}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search feedback..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(TYPE_CONFIG).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterSeverity} onValueChange={setFilterSeverity}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Sort: Newest</SelectItem>
            <SelectItem value="severity">Sort: Severity ↑</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Feedback List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No feedback found</h3>
            <p className="text-slate-500">No feedback matches your filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filtered.map((feedback) => {
            const typeConfig = TYPE_CONFIG[feedback.feedback_type] || TYPE_CONFIG.other;
            const statusConfig = STATUS_CONFIG[feedback.status] || STATUS_CONFIG.pending;
            const TypeIcon = typeConfig.icon;
            const StatusIcon = statusConfig.icon;

            return (
              <Card 
                key={feedback.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  setSelectedFeedback(feedback);
                  setAdminNotes(feedback.admin_notes || '');
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${typeConfig.color}`}>
                      <TypeIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge className={typeConfig.color}>{typeConfig.label}</Badge>
                        <Badge className={statusConfig.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                        {feedback.severity && (
                          <Badge className={SEVERITY_CONFIG[feedback.severity]}>
                            {feedback.severity}
                          </Badge>
                        )}
                      </div>
                      <p className="text-slate-900 line-clamp-2">{feedback.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                        <span>{feedback.reporter_name || feedback.reporter_id}</span>
                        <span>{format(new Date(feedback.created_date), 'MMM d, yyyy h:mm a')}</span>
                        {feedback.screenshot_url && (
                          <span className="text-violet-600">📷 Has screenshot</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0 items-end">
                      <CopyButton feedback={feedback} typeConfig={typeConfig} statusConfig={statusConfig} />
                      <div className="flex items-center gap-3">
                        <label
                          className="flex items-center gap-1.5 cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={!!feedback.is_fixed}
                            onCheckedChange={(checked) => {
                              updateMutation.mutate({
                                id: feedback.id,
                                data: { is_fixed: !!checked },
                                logMessage: checked ? 'Marked feedback as fixed' : 'Unmarked feedback as fixed',
                                logMeta: { is_fixed: !!checked }
                              });
                            }}
                          />
                          <span className="text-xs text-slate-600">Fixed</span>
                        </label>
                        <label
                          className="flex items-center gap-1.5 cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={!!feedback.coordinator_tested}
                            onCheckedChange={(checked) => {
                              updateMutation.mutate({
                                id: feedback.id,
                                data: {
                                  coordinator_tested: !!checked,
                                  coordinator_tested_by: checked ? currentUser?.email : null,
                                  coordinator_tested_at: checked ? new Date().toISOString() : null
                                },
                                logMessage: checked ? 'Coordinator confirmed tested' : 'Coordinator removed tested confirmation',
                                logMeta: { coordinator_tested: !!checked, tester: currentUser?.email }
                              });
                            }}
                          />
                          <span className="text-xs text-slate-600">Tested</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={!!selectedFeedback} onOpenChange={(open) => !open && setSelectedFeedback(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedFeedback && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {(() => {
                    const TypeIcon = TYPE_CONFIG[selectedFeedback.feedback_type]?.icon || HelpCircle;
                    return <TypeIcon className="w-5 h-5 text-violet-600" />;
                  })()}
                  Feedback Details
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Meta */}
                <div className="flex flex-wrap gap-2">
                  <Badge className={TYPE_CONFIG[selectedFeedback.feedback_type]?.color}>
                    {TYPE_CONFIG[selectedFeedback.feedback_type]?.label}
                  </Badge>
                  <Badge className={STATUS_CONFIG[selectedFeedback.status]?.color}>
                    {STATUS_CONFIG[selectedFeedback.status]?.label}
                  </Badge>
                  {selectedFeedback.severity && (
                    <Badge className={SEVERITY_CONFIG[selectedFeedback.severity]}>
                      {selectedFeedback.severity}
                    </Badge>
                  )}
                </div>

                {/* Reporter Info */}
                <div className="text-sm text-slate-600">
                  <strong>From:</strong> {selectedFeedback.reporter_name || selectedFeedback.reporter_id}
                  <br />
                  <strong>Date:</strong> {format(new Date(selectedFeedback.created_date), 'PPpp')}
                  <br />
                  <strong>Page:</strong>{' '}
                  <a href={selectedFeedback.page_url} target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline inline-flex items-center gap-1">
                    {selectedFeedback.page_url?.split('?')[0]}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-medium text-slate-900 mb-1">Description</h4>
                  <p className="text-slate-700 whitespace-pre-wrap bg-slate-50 p-3 rounded-lg">
                    {selectedFeedback.description}
                  </p>
                </div>

                {/* Images */}
                {(selectedFeedback.image_urls?.length > 0 || selectedFeedback.screenshot_url) && (
                  <div>
                    <h4 className="font-medium text-slate-900 mb-1">
                      Images ({(selectedFeedback.image_urls?.length || 1)})
                    </h4>
                    <div className="flex gap-2 flex-wrap">
                      {(selectedFeedback.image_urls?.length > 0 
                        ? selectedFeedback.image_urls 
                        : [selectedFeedback.screenshot_url]
                      ).map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                          <img 
                            src={url} 
                            alt={`Image ${i + 1}`} 
                            className="h-48 rounded-lg border object-cover hover:opacity-90 transition-opacity"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status Update */}
                <div>
                  <h4 className="font-medium text-slate-900 mb-1">Update Status</h4>
                  <Select 
                    value={selectedFeedback.status} 
                    onValueChange={(value) => handleStatusChange(selectedFeedback.id, value, selectedFeedback.status)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Fixed & Tested Checkboxes */}
                <div className="flex items-center gap-6 p-3 rounded-lg bg-slate-50 border">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={!!selectedFeedback.is_fixed}
                      onCheckedChange={(checked) => {
                        updateMutation.mutate({
                          id: selectedFeedback.id,
                          data: { is_fixed: !!checked },
                          logMessage: checked ? 'Marked feedback as fixed' : 'Unmarked feedback as fixed',
                          logMeta: { is_fixed: !!checked }
                        });
                        setSelectedFeedback(prev => ({ ...prev, is_fixed: !!checked }));
                      }}
                    />
                    <Wrench className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium text-slate-700">Fixed</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={!!selectedFeedback.coordinator_tested}
                      onCheckedChange={(checked) => {
                        updateMutation.mutate({
                          id: selectedFeedback.id,
                          data: {
                            coordinator_tested: !!checked,
                            coordinator_tested_by: checked ? currentUser?.email : null,
                            coordinator_tested_at: checked ? new Date().toISOString() : null
                          },
                          logMessage: checked ? 'Coordinator confirmed tested' : 'Coordinator removed tested confirmation',
                          logMeta: { coordinator_tested: !!checked, tester: currentUser?.email }
                        });
                        setSelectedFeedback(prev => ({
                          ...prev,
                          coordinator_tested: !!checked,
                          coordinator_tested_by: checked ? currentUser?.email : null,
                          coordinator_tested_at: checked ? new Date().toISOString() : null
                        }));
                      }}
                    />
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-slate-700">Tested by Coordinator</span>
                  </label>
                  {selectedFeedback.coordinator_tested_by && (
                    <span className="text-xs text-slate-500 ml-auto">
                      by {selectedFeedback.coordinator_tested_by}
                    </span>
                  )}
                </div>

                {/* Bug Repair Checklist - only for bugs */}
                {selectedFeedback.feedback_type === 'bug' && (
                  <BugRepairChecklist
                    feedback={selectedFeedback}
                    currentUser={currentUser}
                    onUpdate={(data) => {
                      updateMutation.mutate({
                        id: selectedFeedback.id,
                        data,
                        logMessage: 'Updated bug repair checklist',
                        logMeta: data
                      });
                      setSelectedFeedback(prev => ({ ...prev, ...data }));
                    }}
                  />
                )}

                {/* Admin Notes */}
                <div>
                  <h4 className="font-medium text-slate-900 mb-1">Admin Notes</h4>
                  <Textarea
                    placeholder="Add internal notes..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="min-h-20"
                  />
                  <Button 
                    size="sm" 
                    className="mt-2 bg-violet-600 hover:bg-violet-700 text-white"
                    onClick={handleSaveNotes}
                    disabled={updateMutation.isPending}
                  >
                    Save Notes
                  </Button>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteMutation.mutate(selectedFeedback.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}