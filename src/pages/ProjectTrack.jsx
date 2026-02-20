import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Settings, Folder, Building2, TrendingUp, CheckCircle2, 
  Target, Upload, Plus, DollarSign, Lock, Calendar,
  Users, Filter, ChevronDown, BarChart3, UserPlus, MessageSquarePlus
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ProjectTrackingModal from '@/components/projects/ProjectTrackingModal.jsx';
import AddTeamMemberModal from '@/components/deals/AddTeamMemberModal.jsx';
import AddNoteModal from '@/components/deals/AddNoteModal.jsx';

// Stage configuration matching the image
const STAGES = [
  { id: 'idea', label: 'INITIATION', color: 'from-cyan-500 to-cyan-600' },
  { id: 'prototype', label: 'PLANNING', color: 'from-blue-500 to-blue-600' },
  { id: 'scaling', label: 'EXECUTION', color: 'from-emerald-500 to-emerald-600' },
  { id: 'pilot', label: 'MONITORING', color: 'from-violet-500 to-violet-600' },
  { id: 'mature_ops', label: 'CLOSURE', color: 'from-green-500 to-green-600' }
];

const CONFIDENCE_BADGES = {
  low: { label: 'CONF: LOW', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  medium: { label: 'CONF: MEDIUM', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  high: { label: 'CONF: HIGH', color: 'bg-red-500/20 text-red-400 border-red-500/30' }
};

export default function ProjectTrackPage() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeView, setActiveView] = useState('projects'); // 'pipeline' or 'projects'
  const [jurisdictionFilter, setJurisdictionFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('90');
  const [teamMemberModal, setTeamMemberModal] = useState({ open: false, projectId: null, teamIds: [] });
  const [noteModal, setNoteModal] = useState({ open: false, projectId: null });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: myProfile } = useQuery({
    queryKey: ['myProfile', currentUser?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: currentUser.email }),
    enabled: !!currentUser?.email
  });
  const profile = myProfile?.[0];

  // Get funded projects for current user
  const { data: fundedProjects = [], isLoading } = useQuery({
    queryKey: ['fundedProjects', currentUser?.email],
    queryFn: () => base44.entities.Project.filter({ 
      status: 'funded',
      owner_id: currentUser?.email 
    }, '-created_date', 500),
    enabled: !!currentUser?.email
  });

  // Calculate metrics
  const totalProjects = fundedProjects.length;
  const totalBudget = fundedProjects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const avgProgress = fundedProjects.length > 0 
    ? Math.round(fundedProjects.reduce((sum, p) => sum + (p.progress_percent || 0), 0) / fundedProjects.length)
    : 0;

  // Count by stage
  const stageCounts = {
    idea: fundedProjects.filter(p => p.stage === 'idea').length,
    prototype: fundedProjects.filter(p => p.stage === 'prototype').length,
    scaling: fundedProjects.filter(p => p.stage === 'scaling').length,
    pilot: fundedProjects.filter(p => p.stage === 'pilot').length,
    mature_ops: fundedProjects.filter(p => p.stage === 'mature_ops').length
  };

  // Group projects by stage for Kanban view
  const projectsByStage = STAGES.reduce((acc, stage) => {
    acc[stage.id] = fundedProjects.filter(p => p.stage === stage.id);
    return acc;
  }, {});

  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    if (amount >= 1000000000) return `$${(amount / 1000000000).toFixed(1)}B`;
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount.toLocaleString()}`;
  };

  const getConfidenceLevel = (project) => {
    const progress = project.progress_percent || 0;
    if (progress < 25) return 'low';
    if (progress < 60) return 'medium';
    return 'high';
  };

  const getRandomAvatars = (count) => {
    const colors = ['bg-emerald-500', 'bg-violet-500', 'bg-rose-500', 'bg-amber-500', 'bg-cyan-500', 'bg-blue-500'];
    const initials = ['M', 'S', 'R', 'T', 'J', 'K', 'A', 'B'];
    return Array.from({ length: count }, (_, i) => ({
      color: colors[i % colors.length],
      initial: initials[i % initials.length]
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1a]">
      {/* Active Filters Bar */}
      <div className="bg-white dark:bg-[#0d1321] border-b border-slate-200 dark:border-slate-700/50 px-6 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">ACTIVE FILTERS:</span>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 gap-2">
              <Building2 className="w-4 h-4" />
              Global Jurisdiction (All)
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <DropdownMenuItem className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">All Jurisdictions</DropdownMenuItem>
            <DropdownMenuItem className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">North America</DropdownMenuItem>
            <DropdownMenuItem className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">Europe</DropdownMenuItem>
            <DropdownMenuItem className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">Asia Pacific</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 gap-2">
              <Calendar className="w-4 h-4" />
              Rolling {timeFilter} Days
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <DropdownMenuItem onClick={() => setTimeFilter('30')} className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">Rolling 30 Days</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTimeFilter('90')} className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">Rolling 90 Days</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTimeFilter('180')} className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">Rolling 180 Days</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTimeFilter('365')} className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">Rolling 365 Days</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="ml-auto">
          <Button variant="ghost" className="h-8 text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 gap-2">
            <Upload className="w-4 h-4" />
            Export Audit Pack
          </Button>
        </div>
      </div>

      <div className="p-6">
        {/* Header Card */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-700/50 p-6 mb-6 shadow-sm">
          {/* Title Row */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">GGT Command</h1>
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                onClick={() => setActiveView('pipeline')}
                className={`h-9 gap-2 ${activeView === 'pipeline' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <Settings className="w-4 h-4" />
                Pipeline
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setActiveView('projects')}
                className={`h-9 gap-2 ${activeView === 'projects' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <Folder className="w-4 h-4" />
                Projects
              </Button>
              <Button variant="ghost" className="h-9 text-slate-400 hover:text-white gap-2">
                <Upload className="w-4 h-4" />
                Upload
              </Button>
              <Button className="h-9 bg-cyan-600 hover:bg-cyan-700 text-white gap-2">
                <Plus className="w-4 h-4" />
                New Deal
              </Button>
              <Button className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                <Plus className="w-4 h-4" />
                Project
              </Button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-7 gap-4 mb-6">
            {/* Total Projects */}
            <div className="bg-slate-50 dark:bg-[#1a2234] rounded-xl p-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-3">
                <Folder className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">TOTAL PROJECTS</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalProjects}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">active initiatives</p>
            </div>

            {/* Initiation */}
            <div className="bg-slate-50 dark:bg-[#1a2234] rounded-xl p-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center mb-3">
                <Building2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">INITIATION</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stageCounts.idea}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Initiation phase</p>
            </div>

            {/* Planning */}
            <div className="bg-slate-50 dark:bg-[#1a2234] rounded-xl p-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mb-3">
                <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">PLANNING</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stageCounts.prototype}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Planning phase</p>
            </div>

            {/* Execution */}
            <div className="bg-slate-50 dark:bg-[#1a2234] rounded-xl p-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">EXECUTION</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stageCounts.scaling}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Execution phase</p>
            </div>

            {/* Monitoring */}
            <div className="bg-slate-50 dark:bg-[#1a2234] rounded-xl p-4">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center mb-3">
                <Target className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">MONITORING</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stageCounts.pilot}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Monitoring phase</p>
            </div>

            {/* Closure */}
            <div className="bg-slate-50 dark:bg-[#1a2234] rounded-xl p-4">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">CLOSURE</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stageCounts.mature_ops}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Closure phase</p>
            </div>

            {/* Avg Progress */}
            <div className="bg-slate-50 dark:bg-[#1a2234] rounded-xl p-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-3">
                <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">AVG PROGRESS</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{avgProgress}%</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">completion rate</p>
            </div>
          </div>

          {/* Funding Secured Card */}
          <div className="bg-slate-50 dark:bg-[#1a2234] rounded-xl p-4 inline-block">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700/50 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">FUNDING SECURED</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalBudget)}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">capital deployed</p>
          </div>
        </div>

        {/* Kanban Pipeline View */}
        <div className="grid grid-cols-5 gap-4">
          {STAGES.map((stage) => (
            <div key={stage.id} className="flex flex-col">
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  {stage.label}
                </h3>
                <Badge variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400">
                  {projectsByStage[stage.id]?.length || 0}
                </Badge>
              </div>

              {/* Projects Column */}
              <ScrollArea className="flex-1">
                <div className="space-y-3 pr-2">
                  {projectsByStage[stage.id]?.length === 0 ? (
                    <div className="bg-white dark:bg-[#111827] rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center">
                      <p className="text-slate-400 dark:text-slate-500 text-sm">No Projects</p>
                    </div>
                  ) : (
                    projectsByStage[stage.id]?.map((project) => {
                      const confidence = getConfidenceLevel(project);
                      const avatars = getRandomAvatars(Math.floor(Math.random() * 3) + 1);
                      const stageLabel = stage.label.split(' ')[0].toUpperCase();
                      
                      return (
                        <div 
                          key={project.id}
                          onClick={() => setSelectedProject(project)}
                          className="bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-700/50 p-4 cursor-pointer hover:border-cyan-500/50 dark:hover:border-slate-600 transition-colors shadow-sm"
                        >
                          {/* Stage & Confidence Badges */}
                          <div className="flex items-center gap-2 mb-3">
                            <Badge className={`text-[10px] font-bold ${
                              stage.id === 'idea' ? 'bg-cyan-500/20 text-cyan-400' :
                              stage.id === 'prototype' ? 'bg-blue-500/20 text-blue-400' :
                              stage.id === 'scaling' ? 'bg-emerald-500/20 text-emerald-400' :
                              stage.id === 'pilot' ? 'bg-violet-500/20 text-violet-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {stageLabel}
                            </Badge>
                            <Badge className={`text-[10px] font-bold ${CONFIDENCE_BADGES[confidence].color}`}>
                              {CONFIDENCE_BADGES[confidence].label}
                            </Badge>
                            <Lock className="w-3 h-3 text-slate-500 ml-auto" />
                          </div>

                          {/* Title */}
                          <h4 className="text-slate-900 dark:text-white font-semibold text-sm mb-1 truncate">
                            {project.title}
                          </h4>
                          
                          {/* Description */}
                          <p className="text-slate-500 dark:text-slate-400 text-xs mb-3 line-clamp-2">
                            {project.description}
                          </p>

                          {/* Progress */}
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-slate-400 dark:text-slate-500">Progress</span>
                              <span className={`font-medium ${
                                (project.progress_percent || 0) >= 50 ? 'text-emerald-600 dark:text-emerald-400' : 'text-cyan-600 dark:text-cyan-400'
                              }`}>
                                {project.progress_percent || 0}%
                              </span>
                            </div>
                            <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  stage.id === 'idea' ? 'bg-cyan-500' :
                                  stage.id === 'prototype' ? 'bg-blue-500' :
                                  stage.id === 'scaling' ? 'bg-emerald-500' :
                                  stage.id === 'pilot' ? 'bg-violet-500' :
                                  'bg-green-500'
                                }`}
                                style={{ width: `${project.progress_percent || 0}%` }}
                              />
                            </div>
                          </div>

                          {/* Budget & Date Row */}
                          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-3">
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              <span>{formatCurrency(project.budget)}</span>
                            </div>
                            {project.end_date && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>Due {new Date(project.end_date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}</span>
                              </div>
                            )}
                          </div>

                          {/* Action Icons */}
                          <div className="flex items-center gap-1 mb-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setTeamMemberModal({ open: true, projectId: project.id, teamIds: project.team_member_ids || [] });
                              }}
                              className="p-1.5 rounded-md hover:bg-cyan-500/20 text-slate-500 hover:text-cyan-400 transition-colors"
                              title="Add team member"
                            >
                              <UserPlus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setNoteModal({ open: true, projectId: project.id });
                              }}
                              className="p-1.5 rounded-md hover:bg-amber-500/20 text-slate-500 hover:text-amber-400 transition-colors"
                              title="Add note"
                            >
                              <MessageSquarePlus className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Team Avatars */}
                          <div className="flex items-center -space-x-2">
                            {avatars.map((avatar, i) => (
                              <div 
                                key={i}
                                className={`w-8 h-8 rounded-full ${avatar.color} flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-[#111827]`}
                              >
                                {avatar.initial}
                              </div>
                            ))}
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
      </div>

      {/* Project Tracking Modal */}
      {selectedProject && (
        <ProjectTrackingModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          currentUser={currentUser}
          profile={profile}
        />
      )}

      {/* Add Team Member Modal */}
      <AddTeamMemberModal
        open={teamMemberModal.open}
        onClose={() => setTeamMemberModal({ open: false, projectId: null, teamIds: [] })}
        entityType="project"
        entityId={teamMemberModal.projectId}
        currentTeamIds={teamMemberModal.teamIds}
      />

      {/* Add Note Modal */}
      <AddNoteModal
        open={noteModal.open}
        onClose={() => setNoteModal({ open: false, projectId: null })}
        entityType="project"
        entityId={noteModal.projectId}
      />
    </div>
  );
}