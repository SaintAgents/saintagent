import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Folder, Search, Target, CheckCircle2, Clock, Play, Pause,
  DollarSign, Users, Calendar, TrendingUp, AlertCircle
} from 'lucide-react';
import BackButton from '@/components/hud/BackButton.jsx';
import FundedProjectCard from '@/components/projects/FundedProjectCard.jsx';
import ProjectTrackingModal from '@/components/projects/ProjectTrackingModal.jsx';
import FundingReviewSection from '@/components/projects/FundingReviewSection.jsx';

const STATUS_CONFIG = {
  planned: { label: 'Planned', color: 'bg-slate-500', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-blue-500', icon: Play },
  completed: { label: 'Completed', color: 'bg-green-500', icon: CheckCircle2 },
  on_hold: { label: 'On Hold', color: 'bg-amber-500', icon: Pause },
  cancelled: { label: 'Cancelled', color: 'bg-red-500', icon: AlertCircle }
};

export default function ProjectTrackPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState(null);

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
  const isAdmin = currentUser?.role === 'admin';

  // Get funded projects
  const { data: fundedProjects = [], isLoading } = useQuery({
    queryKey: ['fundedProjects'],
    queryFn: () => base44.entities.Project.filter({ status: 'funded' }, '-created_date', 500)
  });

  // Get my projects (either owner or team member)
  const myProjects = fundedProjects.filter(p => 
    p.owner_id === currentUser?.email || 
    p.team_member_ids?.includes(currentUser?.email)
  );

  // Filter projects
  const filteredProjects = fundedProjects.filter(p => {
    const matchesSearch = !searchQuery || 
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.organization_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || p.project_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate metrics
  const totalBudget = fundedProjects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const avgProgress = fundedProjects.length > 0 
    ? Math.round(fundedProjects.reduce((sum, p) => sum + (p.progress_percent || 0), 0) / fundedProjects.length)
    : 0;
  const completedCount = fundedProjects.filter(p => p.project_status === 'completed').length;
  const inProgressCount = fundedProjects.filter(p => p.project_status === 'in_progress').length;

  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    if (amount >= 1000000000) return `$${(amount / 1000000000).toFixed(1)}B`;
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(0)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount.toLocaleString()}`;
  };

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <Card className="bg-white dark:bg-slate-900/50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1a]">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-6 h-6 text-violet-600" />
                Project Track
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Funded projects under active management
              </p>
            </div>
          </div>
        </div>

        {/* Funding Review Section (for admins) */}
        <FundingReviewSection 
          currentUser={currentUser} 
          profile={profile} 
          isAdmin={isAdmin} 
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard 
            icon={Folder} 
            label="FUNDED PROJECTS" 
            value={fundedProjects.length}
            color="bg-violet-600"
          />
          <StatCard 
            icon={DollarSign} 
            label="TOTAL BUDGET" 
            value={formatCurrency(totalBudget)}
            color="bg-cyan-600"
          />
          <StatCard 
            icon={TrendingUp} 
            label="AVG PROGRESS" 
            value={`${avgProgress}%`}
            color="bg-emerald-600"
          />
          <StatCard 
            icon={CheckCircle2} 
            label="COMPLETED" 
            value={completedCount}
            color="bg-green-600"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>{config.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-slate-100 dark:bg-slate-800 mb-4">
            <TabsTrigger value="all">All Projects ({filteredProjects.length})</TabsTrigger>
            <TabsTrigger value="my">My Projects ({myProjects.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({inProgressCount})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1,2,3,4,5,6].map((i) => (
                  <div key={i} className="h-40 bg-white dark:bg-slate-800 rounded-xl border animate-pulse" />
                ))}
              </div>
            ) : filteredProjects.length === 0 ? (
              <Card className="bg-white dark:bg-slate-900/50">
                <CardContent className="py-12 text-center">
                  <Folder className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">No funded projects yet</h3>
                  <p className="text-slate-500">Projects will appear here after deals are approved for funding.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProjects.map((project) => (
                  <FundedProjectCard 
                    key={project.id} 
                    project={project} 
                    onClick={() => setSelectedProject(project)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my">
            {myProjects.length === 0 ? (
              <Card className="bg-white dark:bg-slate-900/50">
                <CardContent className="py-12 text-center">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">No projects assigned</h3>
                  <p className="text-slate-500">You're not currently assigned to any projects.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myProjects.map((project) => (
                  <FundedProjectCard 
                    key={project.id} 
                    project={project} 
                    onClick={() => setSelectedProject(project)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="active">
            {fundedProjects.filter(p => p.project_status === 'in_progress').length === 0 ? (
              <Card className="bg-white dark:bg-slate-900/50">
                <CardContent className="py-12 text-center">
                  <Play className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">No active projects</h3>
                  <p className="text-slate-500">No projects are currently in progress.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fundedProjects
                  .filter(p => p.project_status === 'in_progress')
                  .map((project) => (
                    <FundedProjectCard 
                      key={project.id} 
                      project={project} 
                      onClick={() => setSelectedProject(project)}
                    />
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
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
    </div>
  );
}