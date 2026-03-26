import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, Users, Eye, Heart, Award, Target, Sparkles, BarChart3,
  Plus, Briefcase, Folder, ArrowRight, DollarSign, Clock
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import CreateProjectModal from '@/components/projects/CreateProjectModal';
import DealFormModal from '@/components/deals/DealFormModal';

export default function BusinessDashboardTab({ entity, isOwner, isTeamMember, currentUser }) {
  const impact = entity.impact_metrics || {};
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [createDealOpen, setCreateDealOpen] = useState(false);

  const { data: myProfile } = useQuery({
    queryKey: ['myProfile', currentUser?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: currentUser.email }),
    enabled: !!currentUser?.email
  });
  const profile = myProfile?.[0];

  const { data: allProfiles = [] } = useQuery({
    queryKey: ['allProfiles'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 100),
    enabled: !!(isOwner || isTeamMember)
  });

  // Fetch recent projects
  const { data: recentProjects = [] } = useQuery({
    queryKey: ['bizDashProjects', entity.owner_id],
    queryFn: () => base44.entities.Project.filter({ owner_id: entity.owner_id }, '-created_date', 5),
    enabled: !!entity.owner_id,
    staleTime: 300000
  });

  // Fetch recent deals
  const { data: recentDeals = [] } = useQuery({
    queryKey: ['bizDashDeals', entity.owner_id],
    queryFn: () => base44.entities.Deal.filter({ owner_id: entity.owner_id }, '-created_date', 5),
    enabled: !!entity.owner_id,
    staleTime: 300000
  });

  const canCreate = isOwner || isTeamMember;
  const activeDeals = recentDeals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage));
  const pipelineValue = activeDeals.reduce((s, d) => s + (d.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Eye} label="Total Views" value={entity.view_count || 0} color="blue" />
        <StatCard icon={Heart} label="Followers" value={entity.follower_count || 0} color="rose" />
        <StatCard icon={Users} label="People Served" value={impact.people_served || 0} color="emerald" />
        <StatCard icon={Award} label="Community Rating" value={impact.community_rating ? `${impact.community_rating}/5` : 'N/A'} color="amber" />
      </div>

      {/* Quick Actions - only for owners/team */}
      {canCreate && (
        <div className="bg-white rounded-2xl border p-6">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-600" /> Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2 rounded-xl hover:bg-violet-50 hover:border-violet-300" onClick={() => setCreateProjectOpen(true)}>
              <Folder className="w-5 h-5 text-violet-600" />
              <span className="text-xs font-medium">New Project</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2 rounded-xl hover:bg-emerald-50 hover:border-emerald-300" onClick={() => setCreateDealOpen(true)}>
              <Briefcase className="w-5 h-5 text-emerald-600" />
              <span className="text-xs font-medium">New Deal</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2 rounded-xl hover:bg-blue-50 hover:border-blue-300" onClick={() => window.location.href = createPageUrl('Marketplace')}>
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-medium">Marketplace</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2 rounded-xl hover:bg-amber-50 hover:border-amber-300" onClick={() => window.location.href = createPageUrl('Deals')}>
              <DollarSign className="w-5 h-5 text-amber-600" />
              <span className="text-xs font-medium">Deal Maker</span>
            </Button>
          </div>
        </div>
      )}

      {/* Impact Overview */}
      <div className="bg-white rounded-2xl border p-6">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-violet-600" /> Impact Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200">
            <p className="text-3xl font-bold text-violet-700">{impact.projects_completed || 0}</p>
            <p className="text-sm text-violet-600">Projects Completed</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200">
            <p className="text-3xl font-bold text-emerald-700">{impact.ggg_earned || 0}</p>
            <p className="text-sm text-emerald-600">GGG Earned</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
            <p className="text-3xl font-bold text-amber-700">{entity.testimonials_count || 0}</p>
            <p className="text-sm text-amber-600">Testimonials</p>
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="bg-white rounded-2xl border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <Folder className="w-5 h-5 text-violet-600" /> Recent Projects
          </h3>
          {recentProjects.length > 0 && (
            <Button variant="ghost" size="sm" className="gap-1 text-violet-600" onClick={() => window.location.href = createPageUrl('Projects')}>
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
        {recentProjects.length === 0 ? (
          <div className="text-center py-6">
            <Folder className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No projects yet</p>
            {canCreate && (
              <Button size="sm" className="mt-3 bg-violet-600 hover:bg-violet-700 gap-1 rounded-lg" onClick={() => setCreateProjectOpen(true)}>
                <Plus className="w-3.5 h-3.5" /> Create Project
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {recentProjects.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-violet-50 transition-colors cursor-pointer"
                   onClick={() => window.location.href = createPageUrl('ProjectTrack') + `?id=${p.id}`}>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{p.title}</p>
                  <p className="text-xs text-slate-500">{p.status?.replace(/_/g, ' ')}</p>
                </div>
                <Badge variant="outline" className="shrink-0 ml-2">{p.project_status || p.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Deals */}
      <div className="bg-white rounded-2xl border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-emerald-600" /> Recent Deals
          </h3>
          {recentDeals.length > 0 && (
            <Button variant="ghost" size="sm" className="gap-1 text-emerald-600" onClick={() => window.location.href = createPageUrl('Deals')}>
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
        {recentDeals.length === 0 ? (
          <div className="text-center py-6">
            <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No deals yet</p>
            {canCreate && (
              <Button size="sm" className="mt-3 bg-emerald-600 hover:bg-emerald-700 gap-1 rounded-lg" onClick={() => setCreateDealOpen(true)}>
                <Plus className="w-3.5 h-3.5" /> Create Deal
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {recentDeals.map(d => {
              const stageColors = {
                prospecting: 'bg-slate-100 text-slate-700',
                qualification: 'bg-blue-100 text-blue-700',
                proposal: 'bg-violet-100 text-violet-700',
                negotiation: 'bg-amber-100 text-amber-700',
                closed_won: 'bg-emerald-100 text-emerald-700',
                closed_lost: 'bg-red-100 text-red-700',
              };
              return (
                <div key={d.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 transition-colors cursor-pointer"
                     onClick={() => window.location.href = createPageUrl('Deals') + `?id=${d.id}`}>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{d.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-semibold text-emerald-600">${(d.amount || 0).toLocaleString()}</span>
                      {d.company_name && <span className="text-xs text-slate-500">• {d.company_name}</span>}
                    </div>
                  </div>
                  <Badge className={`shrink-0 ml-2 ${stageColors[d.stage] || stageColors.prospecting}`}>
                    {d.stage?.replace(/_/g, ' ')}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}

        {/* Pipeline summary */}
        {activeDeals.length > 0 && (
          <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-sm font-medium text-emerald-800">Active Pipeline: ${pipelineValue.toLocaleString()}</p>
              <p className="text-xs text-emerald-600">{activeDeals.length} active deal{activeDeals.length > 1 ? 's' : ''}</p>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateProjectModal
        open={createProjectOpen}
        onClose={() => setCreateProjectOpen(false)}
        currentUser={currentUser}
        profile={profile}
      />
      <DealFormModal
        open={createDealOpen}
        onClose={() => setCreateDealOpen(false)}
        currentUser={currentUser}
        profile={profile}
        allProfiles={allProfiles}
        skipApproval={true}
      />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    rose: 'bg-rose-50 text-rose-600 border-rose-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
  };
  
  return (
    <div className={`p-4 rounded-2xl border ${colors[color]}`}>
      <Icon className="w-5 h-5 mb-2" />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs opacity-80">{label}</p>
    </div>
  );
}