import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Vote, 
  ThumbsUp,
  ThumbsDown,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

// We'll create a simple Proposal entity for governance
export default function GovernancePortal({ profile }) {
  const queryClient = useQueryClient();

  // For now, we'll use a mock data structure
  // In production, you'd create a Proposal entity
  const [proposals] = useState([
    {
      id: '1',
      title: 'Increase GGG reward for mission completion',
      description: 'Proposal to increase the base GGG reward for completing platform missions from 0.03 to 0.05 GGG',
      status: 'active',
      votes_for: 234,
      votes_against: 45,
      total_votes: 279,
      required_votes: 500,
      created_date: new Date(Date.now() - 86400000 * 2).toISOString(),
      ends_at: new Date(Date.now() + 86400000 * 5).toISOString(),
      category: 'rewards'
    },
    {
      id: '2',
      title: 'Add new region: Southeast Asia',
      description: 'Proposal to establish Southeast Asia as an official platform region with dedicated resources',
      status: 'active',
      votes_for: 412,
      votes_against: 87,
      total_votes: 499,
      required_votes: 500,
      created_date: new Date(Date.now() - 86400000 * 4).toISOString(),
      ends_at: new Date(Date.now() + 86400000 * 3).toISOString(),
      category: 'platform'
    },
    {
      id: '3',
      title: 'Reduce leader application review time',
      description: 'Establish a 48-hour SLA for reviewing leader applications to improve onboarding speed',
      status: 'passed',
      votes_for: 567,
      votes_against: 123,
      total_votes: 690,
      required_votes: 500,
      created_date: new Date(Date.now() - 86400000 * 10).toISOString(),
      ends_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      category: 'governance'
    }
  ]);

  const [userVotes, setUserVotes] = useState({});

  const handleVote = (proposalId, voteType) => {
    setUserVotes({ ...userVotes, [proposalId]: voteType });
    toast.success(`Vote ${voteType === 'for' ? 'in favor' : 'against'} recorded`);
  };

  const activeProposals = proposals.filter(p => p.status === 'active');
  const completedProposals = proposals.filter(p => p.status === 'passed' || p.status === 'rejected');

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
                <p className="text-2xl font-bold text-slate-900">
                  {Object.keys(userVotes).length}
                </p>
                <p className="text-xs text-slate-500">Your Votes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Proposals */}
      <div>
        <h3 className="font-semibold text-slate-900 mb-4">Active Proposals</h3>
        <div className="space-y-4">
          {activeProposals.map((proposal) => {
            const percentFor = (proposal.votes_for / proposal.total_votes) * 100;
            const percentComplete = (proposal.total_votes / proposal.required_votes) * 100;
            const userVote = userVotes[proposal.id];

            return (
              <Card key={proposal.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-slate-900">{proposal.title}</h4>
                        <Badge variant="outline" className="text-xs capitalize">
                          {proposal.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{proposal.description}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Ends {formatDistanceToNow(new Date(proposal.ends_at), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Voting Progress */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500">Support</span>
                        <span className="font-medium text-slate-700">{percentFor.toFixed(1)}% in favor</span>
                      </div>
                      <div className="flex gap-1 h-2">
                        <div 
                          className="bg-emerald-500 rounded-l"
                          style={{ width: `${percentFor}%` }}
                        />
                        <div 
                          className="bg-rose-500 rounded-r flex-1"
                        />
                      </div>
                      <div className="flex justify-between text-xs mt-1 text-slate-500">
                        <span>{proposal.votes_for} for</span>
                        <span>{proposal.votes_against} against</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500">Quorum</span>
                        <span className="font-medium text-slate-700">
                          {proposal.total_votes} / {proposal.required_votes} votes
                        </span>
                      </div>
                      <Progress value={percentComplete} className="h-2" />
                    </div>
                  </div>

                  {/* Vote Buttons */}
                  <div className="flex gap-3 mt-4">
                    <Button
                      size="sm"
                      onClick={() => handleVote(proposal.id, 'for')}
                      disabled={userVote !== undefined}
                      className={`flex-1 ${
                        userVote === 'for' 
                          ? 'bg-emerald-600 hover:bg-emerald-700' 
                          : ''
                      }`}
                      variant={userVote === 'for' ? 'default' : 'outline'}
                    >
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      {userVote === 'for' ? 'Voted For' : 'Vote For'}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleVote(proposal.id, 'against')}
                      disabled={userVote !== undefined}
                      className={`flex-1 ${
                        userVote === 'against' 
                          ? 'bg-rose-600 hover:bg-rose-700' 
                          : ''
                      }`}
                      variant={userVote === 'against' ? 'default' : 'outline'}
                    >
                      <ThumbsDown className="w-4 h-4 mr-2" />
                      {userVote === 'against' ? 'Voted Against' : 'Vote Against'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Completed Proposals */}
      <div>
        <h3 className="font-semibold text-slate-900 mb-4">Completed Proposals</h3>
        <div className="space-y-3">
          {completedProposals.map((proposal) => {
            const percentFor = (proposal.votes_for / proposal.total_votes) * 100;

            return (
              <Card key={proposal.id} className="opacity-75">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm text-slate-900">{proposal.title}</h4>
                        <Badge 
                          variant={proposal.status === 'passed' ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {proposal.status === 'passed' ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Passed
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Rejected
                            </>
                          )}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500">
                        {proposal.votes_for} for, {proposal.votes_against} against ({percentFor.toFixed(1)}% support)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}