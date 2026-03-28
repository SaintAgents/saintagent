import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Folder, CheckCircle2, Clock, XCircle, Flag, FileEdit, 
  DollarSign, Rocket, Lightbulb, FlaskConical, Gauge, Building2,
  TrendingUp, Briefcase, LayoutGrid
} from 'lucide-react';

const STAGE_CONFIG = {
  idea: { label: 'Idea', icon: Lightbulb, color: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200' },
  prototype: { label: 'Prototype', icon: FlaskConical, color: 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200' },
  pilot: { label: 'Pilot', icon: Rocket, color: 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200' },
  scaling: { label: 'Scaling', icon: TrendingUp, color: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200' },
  mature_ops: { label: 'Mature Ops', icon: Building2, color: 'bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-300' },
};

const STATUS_CHIPS = [
  { key: 'approved', label: 'Approved', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200' },
  { key: 'pending_review', label: 'Pending', icon: Clock, color: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200' },
  { key: 'declined', label: 'Rejected', icon: XCircle, color: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200' },
  { key: 'funded', label: 'Funded', icon: DollarSign, color: 'bg-violet-100 text-violet-700 border-violet-200 hover:bg-violet-200' },
  { key: 'flagged', label: 'Flagged', icon: Flag, color: 'bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200' },
  { key: 'draft', label: 'Drafts', icon: FileEdit, color: 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200' },
];

export default function ProjectSummaryBar({ projects = [], activeStatus, activeStage, onStatusClick, onStageClick }) {
  // Count by stage
  const stageCounts = {};
  for (const p of projects) {
    const s = p.stage || 'idea';
    stageCounts[s] = (stageCounts[s] || 0) + 1;
  }

  // Count by status
  const statusCounts = {};
  for (const chip of STATUS_CHIPS) {
    statusCounts[chip.key] = projects.filter(p => p.status === chip.key).length;
  }

  return (
    <div className="mb-6 space-y-3">
      {/* Status row */}
      <div>
        <div className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1.5">
          <Folder className="w-3.5 h-3.5" /> Status
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onStatusClick('all')}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer",
              activeStatus === 'all' 
                ? 'bg-violet-600 text-white border-violet-600 shadow-md' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            )}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            All ({projects.length})
          </button>
          {STATUS_CHIPS.map(chip => {
            const count = statusCounts[chip.key] || 0;
            const Icon = chip.icon;
            const isActive = activeStatus === chip.key;
            return (
              <button
                key={chip.key}
                onClick={() => onStatusClick(chip.key)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer",
                  isActive 
                    ? 'bg-violet-600 text-white border-violet-600 shadow-md' 
                    : chip.color
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {chip.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Stage/Category row */}
      <div>
        <div className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5" /> Category / Stage
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onStageClick('all')}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer",
              activeStage === 'all' 
                ? 'bg-violet-600 text-white border-violet-600 shadow-md' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            )}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            All Stages
          </button>
          {Object.entries(STAGE_CONFIG).map(([key, cfg]) => {
            const count = stageCounts[key] || 0;
            const Icon = cfg.icon;
            const isActive = activeStage === key;
            return (
              <button
                key={key}
                onClick={() => onStageClick(key)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer",
                  isActive 
                    ? 'bg-violet-600 text-white border-violet-600 shadow-md' 
                    : cfg.color
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {cfg.label} ({count})
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}