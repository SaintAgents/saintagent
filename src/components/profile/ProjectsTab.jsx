import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Folder, Search, Plus, Calendar, DollarSign, TrendingUp, Users } from 'lucide-react';
import ProjectTrackingModal from '@/components/projects/ProjectTrackingModal';

const STAGES = [
  { id: 'idea', label: 'Idea', color: 'bg-slate-100 text-slate-700' },
  { id: 'prototype', label: 'Prototype', color: 'bg-blue-100 text-blue-700' },
  { id: 'pilot', label: 'Pilot', color: 'bg-purple-100 text-purple-700' },
  { id: 'scaling', label: 'Scaling', color: 'bg-amber-100 text-amber-700' },
  { id: 'mature_ops', label: 'Mature Ops', color: 'bg-emerald-100 text-emerald-700' }
];

const PROJECT_STATUSES = [
  { id: 'planned', label: 'Planned', color: 'bg-slate-100 text-slate-700' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  { id: 'completed', label: 'Completed', color: 'bg-emerald-100 text-emerald-700' },
  { id: 'on_hold', label: 'On Hold', color: 'bg-amber-100 text-amber-700' },
  { id: 'cancelled', label: 'Cancelled', color: 'bg-rose-100 text-rose-700' }
];

export default function ProjectsTab({ profile, currentUser }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterStage, setFilterStage] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedProject, setSelectedProject] = useState(null);

  const userIdentifier = profile?.sa_number || currentUser?.email;

  // Fetch user's funded projects
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['myFundedProjects', userIdentifier],
    queryFn: () => base44.entities.Project.filter({ 
      status: 'funded',
      owner_id: userIdentifier 
    }, '-created_date', 100),
    enabled: !!userIdentifier
  });

  // Filter projects
  const filteredProjects = projects.filter((p) => {
    const stageMatch = filterStage === 'all' || p.stage === filterStage;
    const statusMatch = filterStatus === 'all' || p.project_status === filterStatus;
    const searchMatch = !search || 
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    return stageMatch && statusMatch && searchMatch;
  });

  const formatCurrency = (amount) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount}`;
  };

  // Stats
  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const avgProgress = projects.length > 0 
    ? projects.reduce((sum, p) => sum + (p.progress_percent || 0), 0) / projects.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Folder className="w-8 h-8 text-violet-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-slate-900">{projects.length}</div>
            <div className="text-xs text-slate-500">Total Projects</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <DollarSign className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-slate-900">{formatCurrency(totalBudget)}</div>
            <div className="text-xs text-slate-500">Total Budget</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-slate-900">{avgProgress.toFixed(0)}%</div>
            <div className="text-xs text-slate-500">Avg Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-slate-900">
              {projects.reduce((sum, p) => sum + (p.team_member_ids?.length || 0), 0)}
            </div>
            <div className="text-xs text-slate-500">Team Members</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterStage} onValueChange={setFilterStage}>
              <SelectTrigger>
                <SelectValue placeholder="All Stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {STAGES.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {PROJECT_STATUSES.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Projects List */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="pt-8 pb-8 text-center">
            <Folder className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Projects Found</h3>
            <p className="text-slate-500 mb-4">
              {search || filterStage !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your filters'
                : 'You don\'t have any funded projects yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProjects.map((project) => {
            const stageConfig = STAGES.find((s) => s.id === project.stage);
            const statusConfig = PROJECT_STATUSES.find((s) => s.id === project.project_status);
            
            return (
              <Card 
                key={project.id} 
                className="hover:shadow-lg transition-all cursor-pointer"
                onClick={() => setSelectedProject(project)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{project.title}</CardTitle>
                    <Badge className={stageConfig?.color || 'bg-slate-100'}>
                      {stageConfig?.label || project.stage}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                    {project.description || 'No description'}
                  </p>
                  
                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-500">Progress</span>
                      <span className="text-xs font-semibold text-slate-700">
                        {project.progress_percent || 0}%
                      </span>
                    </div>
                    <Progress value={project.progress_percent || 0} className="h-2" />
                  </div>

                  {/* Status & Budget */}
                  <div className="flex items-center justify-between">
                    <Badge className={statusConfig?.color || 'bg-slate-100'} variant="outline">
                      {statusConfig?.label || project.project_status}
                    </Badge>
                    <span className="text-sm font-semibold text-emerald-600">
                      {formatCurrency(project.budget || 0)}
                    </span>
                  </div>

                  {/* Dates */}
                  {(project.start_date || project.end_date) && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="w-3 h-3" />
                      {project.start_date && new Date(project.start_date).toLocaleDateString()}
                      {project.start_date && project.end_date && ' - '}
                      {project.end_date && new Date(project.end_date).toLocaleDateString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Project Tracking Modal */}
      {selectedProject && (
        <ProjectTrackingModal
          project={selectedProject}
          open={!!selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}