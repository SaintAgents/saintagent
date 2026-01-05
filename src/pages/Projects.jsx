import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Folder, Search, Plus, Filter, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ProjectMiniCard from '@/components/projects/ProjectMiniCard';
import ProjectDetailCard from '@/components/projects/ProjectDetailCard';
import FloatingPanel from '@/components/hud/FloatingPanel';
import HelpHint from '@/components/hud/HelpHint';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

const ITEMS_PER_PAGE = 12;

export default function Projects() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [selected, setSelected] = useState(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: onboardingRecords } = useQuery({
    queryKey: ['onboardingProgress', currentUser?.email],
    queryFn: () => base44.entities.OnboardingProgress.filter({ user_id: currentUser.email }),
    enabled: !!currentUser?.email
  });
  const onboardingComplete = onboardingRecords?.[0]?.status === 'complete';

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects_all'],
    queryFn: () => base44.entities.Project.list('-created_date', 500),
  });

  const filtered = (projects || []).filter((p) => {
    const okStatus = status === 'all' || p.status === status;
    const qq = q.trim().toLowerCase();
    const okQ = !qq || (p.title || '').toLowerCase().includes(qq) || (p.description || '').toLowerCase().includes(qq);
    return okStatus && okQ;
  });

  const total = projects.length;
  const approved = projects.filter((p) => p.status === 'approved').length;
  const pending = projects.filter((p) => p.status === 'pending_review').length;
  const drafts = projects.filter((p) => p.status === 'draft').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Folder className="w-6 h-6 text-violet-600" />
              Projects
              <HelpHint content="Every project undergoes a 4-phase AI audit designed to be hard to game and anti-grift. Phase 1 (Ethical Firewall): Screens for fraud, coercion, and 'Anti-Cult' indicators. Phase 2 (Quantitative Scoring): 0-100 score based on Planetary Well-being (20%), Human Well-being (20%), and Feasibility. Phase 3 (Risk Model): Calculates Execution Multiplier (0.6x-1.0x) and checks Harm Gates. Phase 4 (Decision Tiers): Routes to Approve, Incubate, Review, or Decline. Click any project to see full evaluation details." />
            </h1>
            <p className="text-slate-500 mt-1">Browse, filter, and manage all projects</p>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button 
                      className="rounded-xl bg-violet-600 hover:bg-violet-700 gap-2 disabled:opacity-50 disabled:cursor-not-allowed" 
                      onClick={() => (window.location.href = createPageUrl('ProjectCreate'))}
                      disabled={!onboardingComplete}
                    >
                      <Plus className="w-4 h-4" />
                      Add Project
                    </Button>
                  </span>
                </TooltipTrigger>
                {!onboardingComplete && (
                  <TooltipContent side="bottom" className="max-w-[200px]">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      <span>Complete onboarding first to create projects</span>
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="p-3 rounded-xl bg-slate-50 border"><div className="text-xs text-slate-500">Total</div><div className="text-xl font-bold">{total}</div></div>
          <div className="p-3 rounded-xl bg-emerald-50 border"><div className="text-xs text-emerald-700">Approved</div><div className="text-xl font-bold text-emerald-700">{approved}</div></div>
          <div className="p-3 rounded-xl bg-amber-50 border"><div className="text-xs text-amber-700">Pending</div><div className="text-xl font-bold text-amber-700">{pending}</div></div>
          <div className="p-3 rounded-xl bg-slate-100 border"><div className="text-xs text-slate-700">Drafts</div><div className="text-xl font-bold text-slate-800">{drafts}</div></div>
        </div>

        {/* Filters */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search projects..." className="pl-9" />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending_review">Pending Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <div className="mb-4 text-sm text-slate-500">
          Showing {Math.min(visibleCount, filtered.length)} of {filtered.length} projects
        </div>

        {/* List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="h-36 bg-white rounded-xl border animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Folder className="w-14 h-14 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {projects.length === 0 ? 'No projects yet' : 'No projects match your filters'}
            </h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              {projects.length === 0 
                ? 'Create your first project to start collaborating with others and tracking your work.'
                : 'Try adjusting your search or filter criteria.'}
            </p>
            {projects.length === 0 && (
              onboardingComplete ? (
                <Button 
                  className="rounded-xl bg-violet-600 hover:bg-violet-700 gap-2"
                  onClick={() => (window.location.href = createPageUrl('ProjectCreate'))}
                >
                  <Plus className="w-4 h-4" />
                  Create Your First Project
                </Button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-amber-600 flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Complete onboarding to create projects
                  </p>
                  <Link to={createPageUrl('Onboarding')}>
                    <Button className="rounded-xl bg-violet-600 hover:bg-violet-700">
                      Complete Onboarding
                    </Button>
                  </Link>
                </div>
              )
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.slice(0, visibleCount).map((p) => (
                <ProjectMiniCard key={p.id} project={p} onClick={() => setSelected(p)} />
              ))}
            </div>
            {visibleCount < filtered.length && (
              <div className="mt-6 text-center">
                <Button 
                  variant="outline" 
                  className="rounded-xl px-8"
                  onClick={() => setVisibleCount((v) => v + ITEMS_PER_PAGE)}
                >
                  Load More ({filtered.length - visibleCount} remaining)
                </Button>
              </div>
            )}
          </>
        )}

        {/* Detail Popout */}
        {selected && (
          <FloatingPanel title={selected.title || 'Project Details'} onClose={() => setSelected(null)}>
            <ProjectDetailCard project={selected} />
          </FloatingPanel>
        )}
      </div>
    </div>
  );
}