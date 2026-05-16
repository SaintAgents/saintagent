import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Vote, CheckCircle, XCircle, Trash2, Pencil, Clock, ThumbsUp, ThumbsDown, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";

function EditProposalModal({ proposal, open, onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    required_votes: proposal?.required_votes || 50,
    pass_threshold: proposal?.pass_threshold || 60,
    ends_at: proposal?.ends_at ? proposal.ends_at.slice(0, 16) : '',
    status: proposal?.status || 'active',
  });

  const updateMutation = useMutation({
    mutationFn: () => base44.entities.Proposal.update(proposal.id, {
      required_votes: form.required_votes,
      pass_threshold: form.pass_threshold,
      ends_at: new Date(form.ends_at).toISOString(),
      status: form.status,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProposals'] });
      toast.success('Proposal updated');
      onClose();
    },
  });

  if (!proposal) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Proposal</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <p className="text-sm font-medium text-slate-700">{proposal.title}</p>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="passed">Passed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Quorum (min votes)</Label>
              <Input type="number" min={1} value={form.required_votes}
                onChange={(e) => setForm({ ...form, required_votes: parseInt(e.target.value) || 50 })} />
            </div>
            <div>
              <Label>Pass Threshold (%)</Label>
              <Input type="number" min={50} max={100} value={form.pass_threshold}
                onChange={(e) => setForm({ ...form, pass_threshold: parseInt(e.target.value) || 60 })} />
            </div>
          </div>
          <div>
            <Label>End Date/Time</Label>
            <Input type="datetime-local" value={form.ends_at}
              onChange={(e) => setForm({ ...form, ends_at: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}
              className="bg-violet-600 hover:bg-violet-700">
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminProposalsPanel() {
  const queryClient = useQueryClient();
  const [editProposal, setEditProposal] = useState(null);
  const [filter, setFilter] = useState('all');

  const { data: proposals = [], isLoading } = useQuery({
    queryKey: ['adminProposals'],
    queryFn: () => base44.entities.Proposal.list('-created_date', 100),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      // Delete votes too
      const votes = await base44.entities.ProposalVote.filter({ proposal_id: id });
      await Promise.all(votes.map(v => base44.entities.ProposalVote.delete(v.id)));
      await base44.entities.Proposal.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProposals'] });
      toast.success('Proposal deleted');
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Proposal.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProposals'] });
      toast.success('Status updated');
    },
  });

  const filtered = filter === 'all' ? proposals : proposals.filter(p => p.status === filter);

  const statusIcon = (status) => {
    if (status === 'active') return <Clock className="w-3.5 h-3.5 text-blue-500" />;
    if (status === 'passed') return <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />;
    if (status === 'rejected') return <XCircle className="w-3.5 h-3.5 text-rose-500" />;
    return <AlertCircle className="w-3.5 h-3.5 text-slate-400" />;
  };

  const statusColor = (status) => {
    if (status === 'active') return 'bg-blue-100 text-blue-700';
    if (status === 'passed') return 'bg-emerald-100 text-emerald-700';
    if (status === 'rejected') return 'bg-rose-100 text-rose-700';
    return 'bg-slate-100 text-slate-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Proposals Management</h2>
          <p className="text-sm text-slate-500">{proposals.length} total proposals</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All ({proposals.length})</SelectItem>
            <SelectItem value="active">Active ({proposals.filter(p => p.status === 'active').length})</SelectItem>
            <SelectItem value="passed">Passed ({proposals.filter(p => p.status === 'passed').length})</SelectItem>
            <SelectItem value="rejected">Rejected ({proposals.filter(p => p.status === 'rejected').length})</SelectItem>
            <SelectItem value="cancelled">Cancelled ({proposals.filter(p => p.status === 'cancelled').length})</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Active', count: proposals.filter(p => p.status === 'active').length, icon: Clock, color: 'blue' },
          { label: 'Passed', count: proposals.filter(p => p.status === 'passed').length, icon: CheckCircle, color: 'emerald' },
          { label: 'Rejected', count: proposals.filter(p => p.status === 'rejected').length, icon: XCircle, color: 'rose' },
          { label: 'Total Votes', count: proposals.reduce((sum, p) => sum + (p.total_votes || 0), 0), icon: Vote, color: 'violet' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-${s.color}-100`}>
                <s.icon className={`w-5 h-5 text-${s.color}-600`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{s.count}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Vote className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No proposals found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((proposal) => {
            const total = proposal.total_votes || 0;
            const percentFor = total > 0 ? ((proposal.votes_for || 0) / total * 100).toFixed(1) : '0';
            const isExpired = proposal.ends_at && new Date(proposal.ends_at) < new Date();

            return (
              <Card key={proposal.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-semibold text-slate-900 truncate">{proposal.title}</h4>
                        <Badge className={`text-xs ${statusColor(proposal.status)}`}>
                          <span className="flex items-center gap-1">
                            {statusIcon(proposal.status)}
                            {proposal.status}
                          </span>
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">{proposal.category}</Badge>
                        {isExpired && proposal.status === 'active' && (
                          <Badge variant="destructive" className="text-xs">Expired</Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mb-2 line-clamp-1">{proposal.description}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3 text-emerald-500" /> {proposal.votes_for || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsDown className="w-3 h-3 text-rose-500" /> {proposal.votes_against || 0}
                        </span>
                        <span>{percentFor}% support</span>
                        <span>Quorum: {total}/{proposal.required_votes || 50}</span>
                        {proposal.creator_name && <span>by {proposal.creator_name}</span>}
                        {proposal.ends_at && (
                          <span>{isExpired ? 'Ended' : 'Ends'} {formatDistanceToNow(new Date(proposal.ends_at), { addSuffix: true })}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {proposal.status === 'active' && (
                        <>
                          <Button size="icon" variant="ghost" title="Approve"
                            onClick={() => statusMutation.mutate({ id: proposal.id, status: 'passed' })}>
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                          </Button>
                          <Button size="icon" variant="ghost" title="Reject"
                            onClick={() => statusMutation.mutate({ id: proposal.id, status: 'rejected' })}>
                            <XCircle className="w-4 h-4 text-rose-600" />
                          </Button>
                        </>
                      )}
                      <Button size="icon" variant="ghost" title="Edit"
                        onClick={() => setEditProposal(proposal)}>
                        <Pencil className="w-4 h-4 text-slate-500" />
                      </Button>
                      <Button size="icon" variant="ghost" title="Delete"
                        onClick={() => {
                          if (confirm('Delete this proposal and all its votes?')) {
                            deleteMutation.mutate(proposal.id);
                          }
                        }}>
                        <Trash2 className="w-4 h-4 text-rose-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {editProposal && (
        <EditProposalModal
          proposal={editProposal}
          open={!!editProposal}
          onClose={() => setEditProposal(null)}
        />
      )}
    </div>
  );
}