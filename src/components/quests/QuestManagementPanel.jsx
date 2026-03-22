import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Coins, Trophy, Target, Sparkles, ListChecks } from 'lucide-react';
import QuestCreateModal from './QuestCreateModal';
import QuestManagementCard from './QuestManagementCard';

export default function QuestManagementPanel({ userId, profile }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: quests = [], isLoading } = useQuery({
    queryKey: ['managedQuests', userId],
    queryFn: () => base44.entities.Quest.filter({ user_id: userId }, '-created_date', 100),
    enabled: !!userId,
  });

  const filtered = useMemo(() => {
    return quests.filter(q => {
      if (statusFilter !== 'all' && q.status !== statusFilter) return false;
      if (search && !q.title?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [quests, statusFilter, search]);

  const stats = useMemo(() => {
    const active = quests.filter(q => q.status === 'active').length;
    const completed = quests.filter(q => q.status === 'completed' || q.status === 'claimed').length;
    const totalGGG = quests.reduce((s, q) => s + (q.reward_ggg || 0), 0);
    const earnedGGG = quests.filter(q => q.status === 'completed' || q.status === 'claimed')
      .reduce((s, q) => s + (q.reward_ggg || 0), 0);
    return { active, completed, totalGGG, earnedGGG };
  }, [quests]);

  return (
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-100">
              <ListChecks className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.active}</p>
              <p className="text-xs text-slate-500">Active Quests</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100">
              <Trophy className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.completed}</p>
              <p className="text-xs text-slate-500">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100">
              <Coins className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.totalGGG}</p>
              <p className="text-xs text-slate-500">Total GGG Rewards</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.earnedGGG}</p>
              <p className="text-xs text-slate-500">GGG Earned</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search quests..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="claimed">Claimed</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setCreateOpen(true)} className="bg-violet-600 hover:bg-violet-700 gap-2">
          <Plus className="w-4 h-4" />
          New Quest
        </Button>
      </div>

      {/* Quest List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Sparkles className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No quests found</p>
            <p className="text-xs text-slate-400 mt-1">Create your first quest to start earning rewards!</p>
            <Button onClick={() => setCreateOpen(true)} variant="outline" className="mt-4 gap-2">
              <Plus className="w-4 h-4" /> Create Quest
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(q => (
            <QuestManagementCard key={q.id} quest={q} profile={profile} />
          ))}
        </div>
      )}

      <QuestCreateModal open={createOpen} onClose={() => setCreateOpen(false)} userId={userId} />
    </div>
  );
}