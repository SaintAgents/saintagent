import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { HERO_IMAGES } from '@/components/hud/HeroImageData';
import BackButton from '@/components/hud/BackButton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Target, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import PortfolioGantt from '@/components/missions/PortfolioGantt';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'draft', label: 'Draft' },
];

const TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'platform', label: 'Platform' },
  { value: 'circle', label: 'Circle' },
  { value: 'region', label: 'Region' },
  { value: 'leader', label: 'Leader' },
  { value: 'personal', label: 'Personal' },
];

export default function MissionTimeline() {
  const [statusFilter, setStatusFilter] = useState('active');
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');

  const { data: missions = [], isLoading } = useQuery({
    queryKey: ['allMissions'],
    queryFn: () => base44.entities.Mission.list('-created_date', 200),
  });

  // Filter missions
  const filtered = missions.filter(m => {
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    if (typeFilter !== 'all' && m.mission_type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!m.title?.toLowerCase().includes(q) && !m.objective?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Stats
  const active = missions.filter(m => m.status === 'active').length;
  const completed = missions.filter(m => m.status === 'completed').length;
  const overdue = missions.filter(m => m.status === 'active' && m.end_time && new Date(m.end_time) < new Date()).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
      {/* Hero */}
      <div className="page-hero relative w-full overflow-hidden bg-slate-900">
        <img
          src={HERO_IMAGES.find(h => h.id === 'missions')?.url || HERO_IMAGES[0]?.url}
          alt="Mission Timeline"
          data-no-filter="true"
          className="w-full h-full object-cover object-center hero-image"
          style={{ opacity: 1, filter: 'none' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/30 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 -mt-[100px] relative z-10 pb-24">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <BackButton />
            <div className="p-3 rounded-xl bg-violet-100">
              <Target className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Mission Timeline</h1>
              <p className="text-slate-500 mt-0.5">Portfolio Gantt view of all missions, milestones & deadlines</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-4 flex-wrap">
            <StatPill icon={<Target className="w-3.5 h-3.5" />} label="Active" value={active} color="violet" />
            <StatPill icon={<CheckCircle2 className="w-3.5 h-3.5" />} label="Completed" value={completed} color="emerald" />
            <StatPill icon={<AlertTriangle className="w-3.5 h-3.5" />} label="Overdue" value={overdue} color="red" />
            <StatPill icon={<Clock className="w-3.5 h-3.5" />} label="Total" value={missions.length} color="slate" />
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search missions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Badge variant="outline" className="text-xs">{filtered.length} mission{filtered.length !== 1 ? 's' : ''}</Badge>
        </div>

        {/* Gantt Chart */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No missions match your filters</p>
          </div>
        ) : (
          <PortfolioGantt missions={filtered} />
        )}
      </div>
    </div>
  );
}

function StatPill({ icon, label, value, color }) {
  const colors = {
    violet: 'bg-violet-50 text-violet-700 border-violet-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    slate: 'bg-slate-50 text-slate-700 border-slate-200',
  };
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${colors[color]}`}>
      {icon}
      <span>{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}