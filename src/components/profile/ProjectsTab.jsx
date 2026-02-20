import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Folder, 
  Building2, 
  TrendingUp, 
  CheckCircle2, 
  Eye,
  DollarSign,
  Calendar,
  Users,
  Lock,
  Plus,
  Upload,
  BarChart3
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ProjectTrackingModal from '@/components/projects/ProjectTrackingModal';

const PIPELINE_STAGES = [
  { id: 'initiation', label: 'INITIATION', icon: Folder, color: 'bg-blue-500' },
  { id: 'planning', label: 'PLANNING', icon: Building2, color: 'bg-purple-500' },
  { id: 'execution', label: 'EXECUTION', icon: TrendingUp, color: 'bg-amber-500' },
  { id: 'monitoring', label: 'MONITORING', icon: Eye, color: 'bg-cyan-500' },
  { id: 'closure', label: 'CLOSURE', icon: CheckCircle2, color: 'bg-emerald-500' }
];

const CONFIDENCE_COLORS = {
  low: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  medium: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  high: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
};

const STAGE_MAP = {
  'idea': 'initiation',
  'prototype': 'initiation', 
  'pilot': 'planning',
  'scaling': 'execution',
  'mature_ops': 'closure',
  'planned': 'initiation',
  'in_progress': 'execution',
  'completed': 'closure',
  'on_hold': 'monitoring'
};

export default function ProjectsTab({ profile, currentUser }) {
  const [selectedProject, setSelectedProject] = useState(null);
  const [viewMode, setViewMode] = useState('projects'); // pipeline or projects

  const userIdentifier = profile?.sa_number || currentUser?.email;

  // Fetch all funded projects (for demo, show all; in production filter by owner)
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['fundedProjects'],
    queryFn: () => base44.entities.Project.filter({ 
      status: 'funded'
    }, '-created_date', 100)
  });

  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount}`;
  };

  // Calculate stats
  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const avgProgress = projects.length > 0 
    ? Math.round(projects.reduce((sum, p) => sum + (p.progress_percent || 0), 0) / projects.length)
    : 0;

  // Group projects by pipeline stage
  const projectsByStage = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage.id] = projects.filter(p => {
      const mappedStage = STAGE_MAP[p.stage] || STAGE_MAP[p.project_status] || 'initiation';
      return mappedStage === stage.id;
    });
    return acc;
  }, {});

  // Stats for each stage
  const stageCounts = PIPELINE_STAGES.map(stage => ({
    ...stage,
    count: projectsByStage[stage.id]?.length || 0
  }));

  const getConfidenceLevel = (project) => {
    const progress = project.progress_percent || 0;
    if (progress >= 70) return 'high';
    if (progress >= 30) return 'medium';
    return 'low';
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (name) => {
    const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-purple-500', 'bg-cyan-500'];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 space-y-6 min-h-[600px] border border-slate-200 dark:border-slate-700/50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">GGT Command</h2>
        <div className="flex items-center gap-2">
          <Button 
            variant={viewMode === 'pipeline' ? 'secondary' : 'ghost'}
            size="sm"
            className={viewMode === 'pipeline' ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}
            onClick={() => setViewMode('pipeline')}
          >
            <BarChart3 className="w-4 h-4 mr-1" />
            Pipeline
          </Button>
          <Button 
            variant={viewMode === 'projects' ? 'default' : 'ghost'}
            size="sm"
            className={viewMode === 'projects' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}
            onClick={() => setViewMode('projects')}
          >
            <Folder className="w-4 h-4 mr-1" />
            Projects
          </Button>
          <Button variant="ghost" size="sm" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
            <Upload className="w-4 h-4 mr-1" />
            Upload
          </Button>
          <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700 text-white">
            <Plus className="w-4 h-4 mr-1" />
            New Deal
          </Button>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="w-4 h-4 mr-1" />
            Project
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {/* Total Projects */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700/50">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3">
            <Folder className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">TOTAL PROJECTS</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{projects.length}</div>
          <div className="text-xs text-slate-500">active initiatives</div>
        </div>

        {/* Stage Stats */}
        {stageCounts.map((stage) => (
          <div key={stage.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700/50">
            <div className={`w-10 h-10 rounded-lg ${stage.color}/20 flex items-center justify-center mb-3`}>
              <stage.icon className={`w-5 h-5 ${stage.color.replace('bg-', 'text-')}`} />
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{stage.label}</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stage.count}</div>
            <div className="text-xs text-slate-500">{stage.label.toLowerCase()} phase</div>
          </div>
        ))}

        {/* Avg Progress */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700/50">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">AVG PROGRESS</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{avgProgress}%</div>
          <div className="text-xs text-slate-500">completion rate</div>
        </div>
      </div>

      {/* Funding Secured */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700/50 inline-block">
        <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700/50 flex items-center justify-center mb-3">
          <DollarSign className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">FUNDING SECURED</div>
        <div className="text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalBudget)}</div>
        <div className="text-xs text-slate-500">capital deployed</div>
      </div>

      {/* Pipeline Columns */}
      <div className="grid grid-cols-5 gap-4">
        {PIPELINE_STAGES.map((stage) => (
          <div key={stage.id} className="space-y-3">
            {/* Column Header */}
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-sm border-b border-slate-200 dark:border-slate-700/50 pb-2">
              <span className="uppercase tracking-wider font-medium">{stage.label}</span>
              <span className="text-slate-500">{projectsByStage[stage.id]?.length || 0}</span>
            </div>

            {/* Project Cards */}
            <ScrollArea className="h-[400px] pr-2">
              <div className="space-y-3">
                {projectsByStage[stage.id]?.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 dark:text-slate-600 text-sm">
                    No Projects
                  </div>
                ) : (
                  projectsByStage[stage.id]?.map((project) => {
                    const confidence = getConfidenceLevel(project);
                    return (
                      <div 
                        key={project.id}
                        className="bg-white dark:bg-slate-800/80 rounded-xl p-4 border border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer transition-all shadow-sm"
                        onClick={() => setSelectedProject(project)}
                      >
                        {/* Stage & Confidence Badges */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge className={`${stage.color}/20 ${stage.color.replace('bg-', 'text-').replace('-500', '-400')} border-0 text-[10px] uppercase`}>
                            {stage.label}
                          </Badge>
                          <Badge className={`${CONFIDENCE_COLORS[confidence]} border text-[10px] uppercase`}>
                            CONF: {confidence.toUpperCase()}
                          </Badge>
                          <Lock className="w-3 h-3 text-slate-500" />
                        </div>

                        {/* Title */}
                        <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1 line-clamp-1">
                          {project.title}
                        </h4>

                        {/* Description */}
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">
                          {project.description || 'No description available'}
                        </p>

                        {/* Progress */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-500">Progress</span>
                            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                              {project.progress_percent || 0}%
                            </span>
                          </div>
                          <Progress 
                            value={project.progress_percent || 0} 
                            className="h-1 bg-slate-200 dark:bg-slate-700"
                          />
                        </div>

                        {/* Budget & Date Row */}
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3">
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {formatCurrency(project.budget || 0)}
                          </div>
                          {project.end_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Due {new Date(project.end_date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}
                            </div>
                          )}
                        </div>

                        {/* Team Avatars */}
                        <div className="flex items-center -space-x-2">
                          {project.owner_avatar ? (
                            <Avatar className="w-8 h-8 border-2 border-white dark:border-slate-800">
                              <AvatarImage src={project.owner_avatar} />
                              <AvatarFallback className={`${getAvatarColor(project.owner_name)} text-white text-xs`}>
                                {getInitials(project.owner_name)}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <Avatar className="w-8 h-8 border-2 border-white dark:border-slate-800">
                              <AvatarFallback className={`${getAvatarColor(project.owner_name)} text-white text-xs`}>
                                {getInitials(project.owner_name)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          {project.team_member_ids?.slice(0, 2).map((_, idx) => (
                            <Avatar key={idx} className="w-8 h-8 border-2 border-white dark:border-slate-800">
                              <AvatarFallback className={`${getAvatarColor(`member${idx}`)} text-white text-xs`}>
                                {String.fromCharCode(65 + idx)}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {(project.team_member_ids?.length || 0) > 2 && (
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center text-xs text-slate-600 dark:text-slate-400">
                              +{project.team_member_ids.length - 2}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        ))}
      </div>

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