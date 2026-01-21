import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Coins, 
  Search,
  RefreshCw,
  Gift,
  User,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";

const ONBOARDING_GGG_REWARD = 100;

export default function OnboardingRewardsManager() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, complete, incomplete, missing_reward
  const queryClient = useQueryClient();

  // Fetch all onboarding progress
  const { data: onboardingRecords = [], isLoading: loadingOnboarding } = useQuery({
    queryKey: ['adminOnboardingProgress'],
    queryFn: () => base44.entities.OnboardingProgress.list('-created_date', 500)
  });

  // Fetch all GGG transactions for onboarding
  const { data: gggTransactions = [], isLoading: loadingTx } = useQuery({
    queryKey: ['adminOnboardingGGGTransactions'],
    queryFn: () => base44.entities.GGGTransaction.filter({ reason_code: 'onboarding_completion' }, '-created_date', 500)
  });

  // Fetch user profiles for display names
  const { data: userProfiles = [] } = useQuery({
    queryKey: ['adminUserProfiles'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 500)
  });

  // Create a map of user_id -> profile
  const profileMap = userProfiles.reduce((acc, p) => {
    acc[p.user_id] = p;
    return acc;
  }, {});

  // Create a set of user_ids who have received onboarding GGG
  const awardedUserIds = new Set(gggTransactions.map(tx => tx.user_id));

  // Mutation to award GGG to a user
  const awardMutation = useMutation({
    mutationFn: async (userId) => {
      // Create GGG transaction
      await base44.entities.GGGTransaction.create({
        user_id: userId,
        delta: ONBOARDING_GGG_REWARD,
        reason_code: 'onboarding_completion',
        description: 'GGG awarded for completing onboarding (manual)',
        source_type: 'reward'
      });

      // Update user profile balance
      const profiles = await base44.entities.UserProfile.filter({ user_id: userId });
      if (profiles.length > 0) {
        const profile = profiles[0];
        await base44.entities.UserProfile.update(profile.id, {
          ggg_balance: (profile.ggg_balance || 0) + ONBOARDING_GGG_REWARD
        });
      }

      return userId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOnboardingGGGTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['adminUserProfiles'] });
    }
  });

  // Process records with reward status
  const processedRecords = onboardingRecords.map(record => {
    const hasReward = awardedUserIds.has(record.user_id);
    const profile = profileMap[record.user_id];
    return {
      ...record,
      hasReward,
      displayName: profile?.display_name || record.user_id,
      handle: profile?.handle,
      gggBalance: profile?.ggg_balance || 0
    };
  });

  // Filter records
  const filteredRecords = processedRecords.filter(record => {
    const matchesSearch = search === '' || 
      record.user_id.toLowerCase().includes(search.toLowerCase()) ||
      record.displayName?.toLowerCase().includes(search.toLowerCase()) ||
      record.handle?.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'complete') return record.status === 'complete';
    if (filter === 'incomplete') return record.status !== 'complete';
    if (filter === 'missing_reward') return record.status === 'complete' && !record.hasReward;
    return true;
  });

  // Stats
  const totalComplete = processedRecords.filter(r => r.status === 'complete').length;
  const totalIncomplete = processedRecords.filter(r => r.status !== 'complete').length;
  const missingRewards = processedRecords.filter(r => r.status === 'complete' && !r.hasReward).length;
  const awarded = processedRecords.filter(r => r.hasReward).length;

  const isLoading = loadingOnboarding || loadingTx;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-amber-500" />
          Onboarding Rewards Manager
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-emerald-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-emerald-600">{totalComplete}</div>
            <div className="text-xs text-emerald-700">Completed</div>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-amber-600">{totalIncomplete}</div>
            <div className="text-xs text-amber-700">In Progress</div>
          </div>
          <div className="p-3 bg-violet-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-violet-600">{awarded}</div>
            <div className="text-xs text-violet-700">GGG Awarded</div>
          </div>
          <div className="p-3 bg-rose-50 rounded-lg text-center">
            <div className="text-2xl font-bold text-rose-600">{missingRewards}</div>
            <div className="text-xs text-rose-700">Missing Rewards</div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by email, name, or handle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-1">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'complete' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('complete')}
            >
              Complete
            </Button>
            <Button
              variant={filter === 'missing_reward' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('missing_reward')}
              className={missingRewards > 0 ? 'border-rose-300 text-rose-600' : ''}
            >
              <AlertTriangle className="w-3 h-3 mr-1" />
              Missing ({missingRewards})
            </Button>
          </div>
        </div>

        {/* Records List */}
        <ScrollArea className="h-[400px] border rounded-lg">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="w-5 h-5 animate-spin text-slate-400" />
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-slate-400">
              <User className="w-8 h-8 mb-2" />
              <p>No records found</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredRecords.map(record => (
                <div key={record.id} className="p-3 hover:bg-slate-50 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{record.displayName}</span>
                      {record.handle && (
                        <span className="text-xs text-slate-400">@{record.handle}</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 truncate">{record.user_id}</div>
                    <div className="flex items-center gap-2 mt-1">
                      {record.status === 'complete' ? (
                        <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Complete
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-700 text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          Step {record.current_step || 0}
                        </Badge>
                      )}
                      {record.hasReward ? (
                        <Badge className="bg-violet-100 text-violet-700 text-xs">
                          <Coins className="w-3 h-3 mr-1" />
                          +{ONBOARDING_GGG_REWARD} GGG
                        </Badge>
                      ) : record.status === 'complete' ? (
                        <Badge className="bg-rose-100 text-rose-700 text-xs">
                          <XCircle className="w-3 h-3 mr-1" />
                          No Reward
                        </Badge>
                      ) : null}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Started: {format(new Date(record.created_date), 'MMM d, yyyy h:mm a')}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="text-sm font-medium text-amber-600">
                      {record.gggBalance.toLocaleString()} GGG
                    </div>
                    {record.status === 'complete' && !record.hasReward && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                        onClick={() => awardMutation.mutate(record.user_id)}
                        disabled={awardMutation.isPending}
                      >
                        <Gift className="w-3 h-3 mr-1" />
                        Award {ONBOARDING_GGG_REWARD} GGG
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}