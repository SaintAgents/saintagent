import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Vote, ThumbsUp, ThumbsDown, Clock, CheckCircle, AlertCircle, Plus, XCircle
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import CreateProposalModal from './CreateProposalModal';

function ProposalCard({ proposal, userVote, onVote, isVoting }) {
  const total = proposal.total_votes || 0;
  const percentFor = total > 0 ? (proposal.votes_for / total) * 100 : 0;
  const percentComplete = proposal.required_votes > 0 ? (total / proposal.required_votes) * 100 : 0;
  const isActive = proposal.status === 'active' && new Date(proposal.ends_at) > new Date();

  return (
    <Card className={!isActive ? 'opacity-75' : 'hover:shadow-md transition-shadow'}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h4 className="font-semibold text-slate-900">{proposal.title}</h4>
              <Badge variant="outline" className="text-xs capitalize">{proposal.category}</Badge>
              {!isActive && (
                <Badge variant={proposal.status === 'passed' ? 'default' : 'destructive'} className="text-xs">
                  {proposal.status === 'passed' ? <><CheckCircle className="w-3 h-3 mr-1" />Passed</> :
                   proposal.status === 'rejected' ? <><XCircle className="w-3 h-3 mr-1" />Rejected</> :
                   <><AlertCircle className="w-3 h-3 mr-1" />Ended</>}
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-600 mb-3">{proposal.description}</p>
            <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
              {isActive && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Ends {formatDistanceToNow(new Date(proposal.ends_at), { addSuffix: true })}
                </div>
              )}
              {proposal.creator_name && (
                <span>by {proposal.creator_name}</span>
              )}
            </div>
          </div>
        </div>

        {/* Voting Progress */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500">Support</span>
              <span className="font-medium text-slate-700">
                {total > 0 ? `${percentFor.toFixed(1)}% in favor` : 'No votes yet'}
              </span>
            </div>
            {total > 0 ? (
              <>
                <div className="flex gap-0.5 h-2">
                  <div className="bg-emerald-500 rounded-l" style={{ width: `${percentFor}%` }} />
                  <div className="bg-rose-500 rounded-r flex-1" />
                </div>
                <div className="flex justify-between text-xs mt-1 text-slate-500">
                  <span>{proposal.votes_for} for</span>
                  <span>{proposal.votes_against} against</span>
                </div>
              </>
            ) : (
              <div className="h-2 bg-slate-100 rounded" />
            )}
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500">Quorum</span>
              <span className="font-medium text-slate-700">
                {total} / {proposal.required_votes} votes
              </span>
            </div>
            <Progress value={Math.min(percentComplete, 100)} className="h-2" />
          </div>
        </div>

        {/* Vote Buttons */}
        {isActive && (
          <div className="flex gap-3 mt-4">
            <Button
              size="sm"
              onClick={() => onVote(proposal.id, 'for')}
              disabled={!!userVote || isVoting}
              className={`flex-1 ${userVote === 'for' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
              variant={userVote === 'for' ? 'default' : 'outline'}
            >
              <ThumbsUp className="w-4 h-4 mr-2" />
              {userVote === 'for' ? 'Voted For' : 'Vote For'}
            </Button>
            <Button
              size="sm"
              onClick={() => onVote(proposal.id, 'against')}
              disabled={!!userVote || isVoting}
              className={`flex-1 ${userVote === 'against' ? 'bg-rose-600 hover:bg-rose-700' : ''}`}
              variant={userVote === 'against' ? 'default' : 'outline'}
            >
              <ThumbsDown className="w-4 h-4 mr-2" />
              {userVote === 'against' ? 'Voted Against' : 'Vote Against'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function GovernancePortal({ profile }) {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);

  const { data: proposals = [] } = useQuery({
    queryKey: ['proposals'],
    queryFn: () => base44.entities.Proposal.list('-created_date', 50),
  });

  const { data: myVotes = [] } = useQuery({
    queryKey: ['myVotes', profile?.user_id],
    queryFn: () => base44.entities.ProposalVote.filter({ user_id: profile.user_id }),
    enabled: !!profile?.user_id,
  });

  // Build a map of proposal_id -> vote direction
  const voteMap = {};
  myVotes.forEach(v => { voteMap[v.proposal_id] = v.vote; });

  const voteMutation = useMutation({
    mutationFn: async ({ proposalId, vote }) => {
      // Create vote record
      await base44.entities.ProposalVote.create({
        proposal_id: proposalId,
        user_id: profile.user_id,
        vote,
      });
      // Update proposal counts
      const proposal = proposals.find(p => p.id === proposalId);
      if (proposal) {
        const updates = {
          total_votes: (proposal.total_votes || 0) + 1,
        };
        if (vote === 'for') updates.votes_for = (proposal.votes_for || 0) + 1;
        else updates.votes_against = (proposal.votes_against || 0) + 1;

        // Check if proposal should be auto-resolved
        const newTotal = updates.total_votes;
        const newFor = updates.votes_for ?? proposal.votes_for;
        const newAgainst = updates.votes_against ?? proposal.votes_against;
        const threshold = proposal.pass_threshold || 60;

        if (newTotal >= (proposal.required_votes || 50) && new Date(proposal.ends_at) <= new Date()) {
          updates.status = (newFor / newTotal * 100) >= threshold ? 'passed' : 'rejected';
        }

        await base44.entities.Proposal.update(proposalId, updates);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['myVotes'] });
      toast.success('Vote recorded!');
    },
  });

  const handleVote = (proposalId, vote) => {
    voteMutation.mutate({ proposalId, vote });
  };

  // Auto-resolve expired proposals
  const now = new Date();
  const activeProposals = proposals.filter(p => p.status === 'active' && new Date(p.ends_at) > now);
  const completedProposals = proposals.filter(p => p.status !== 'active' || new Date(p.ends_at) <= now);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Vote className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{activeProposals.length}</p>
                <p className="text-xs text-slate-500">Active Proposals</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {completedProposals.filter(p => p.status === 'passed').length}
                </p>
                <p className="text-xs text-slate-500">Passed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-100">
                <ThumbsUp className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{myVotes.length}</p>
                <p className="text-xs text-slate-500">Your Votes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Button */}
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)} className="gap-2 bg-violet-600 hover:bg-violet-700">
          <Plus className="w-4 h-4" /> New Proposal
        </Button>
      </div>

      {/* Active Proposals */}
      {activeProposals.length > 0 && (
        <div>
          <h3 className="font-semibold text-slate-900 mb-4">Active Proposals</h3>
          <div className="space-y-4">
            {activeProposals.map((proposal) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                userVote={voteMap[proposal.id]}
                onVote={handleVote}
                isVoting={voteMutation.isPending}
              />
            ))}
          </div>
        </div>
      )}

      {activeProposals.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Vote className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 mb-1">No active proposals</p>
            <p className="text-xs text-slate-400">Create one to get the community voting!</p>
          </CardContent>
        </Card>
      )}

      {/* Completed Proposals */}
      {completedProposals.length > 0 && (
        <div>
          <h3 className="font-semibold text-slate-900 mb-4">Completed Proposals</h3>
          <div className="space-y-3">
            {completedProposals.map((proposal) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                userVote={voteMap[proposal.id]}
                onVote={handleVote}
                isVoting={voteMutation.isPending}
              />
            ))}
          </div>
        </div>
      )}

      <CreateProposalModal open={createOpen} onClose={() => setCreateOpen(false)} profile={profile} />
    </div>
  );
}