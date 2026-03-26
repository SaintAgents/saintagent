import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Folder, Search, ArrowRight, Plus } from 'lucide-react';
import ProjectMiniCard from '@/components/projects/ProjectMiniCard';
import CreateProjectModal from '@/components/projects/CreateProjectModal';
import { createPageUrl } from '@/utils';

export default function BusinessProjectsTab({ entity, isOwner, isTeamMember, currentUser }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);

  const { data: myProfile } = useQuery({
    queryKey: ['myProfile', currentUser?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: currentUser.email }),
    enabled: !!currentUser?.email
  });
  const profile = myProfile?.[0];

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['bizProjects', entity.id],
    queryFn: async () => {
      // Get projects owned by the entity owner AND projects that reference this entity
      const ownerProjects = await base44.entities.Project.filter({ owner_id: entity.owner_id }, '-created_date', 50);
      return ownerProjects;
    },
    enabled: !!entity.owner_id,
    staleTime: 300000
  });

  const filtered = projects.filter(p => {
    const statusOk = statusFilter === 'all' || p.status === statusFilter;
    const q = search.toLowerCase();
    const textOk = !q || (p.title || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q);
    return statusOk && textOk;
  });

  const totalCount = projects.length;
  const approvedCount = projects.filter(p => p.status === 'approved' || p.status === 'funded').length;
  const pendingCount = projects.filter(p => p.status === 'pending_review').length;
  const inProgressCount = projects.filter(p => p.project_status === 'in_progress').length;

  const canCreate = isOwner || isTeamMember;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Create button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Projects</h3>
        {canCreate && (
          <Button className="bg-violet-600 hover:bg-violet-700 gap-2 rounded-xl" onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4" /> New Project
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-50 border text-center">
          <p className="text-2xl font-bold text-slate-900">{totalCount}</p>
          <p className="text-xs text-slate-500">Total Projects</p>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-50 border text-center">
          <p className="text-2xl font-bold text-emerald-700">{approvedCount}</p>
          <p className="text-xs text-emerald-600">Approved / Funded</p>
        </div>
        <div className="p-4 rounded-2xl bg-amber-50 border text-center">
          <p className="text-2xl font-bold text-amber-700">{pendingCount}</p>
          <p className="text-xs text-amber-600">Pending Review</p>
        </div>
        <div className="p-4 rounded-2xl bg-blue-50 border text-center">
          <p className="text-2xl font-bold text-blue-700">{inProgressCount}</p>
          <p className="text-xs text-blue-600">In Progress</p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <Input placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending_review">Pending Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="funded">Funded</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Project list */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border">
          <Folder className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No projects found</p>
          <p className="text-xs text-slate-400 mt-1">
            {canCreate ? 'Create a project to get started' : 'Projects owned by this entity will appear here'}
          </p>
          {canCreate && (
            <Button className="mt-4 bg-violet-600 hover:bg-violet-700 gap-2 rounded-xl" onClick={() => setCreateOpen(true)}>
              <Plus className="w-4 h-4" /> Create First Project
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(p => (
            <ProjectMiniCard key={p.id} project={p} onClick={() => window.location.href = createPageUrl('ProjectTrack') + `?id=${p.id}`} />
          ))}
        </div>
      )}

      {projects.length > 0 && (
        <div className="text-center">
          <Button variant="outline" className="rounded-xl gap-2" onClick={() => window.location.href = createPageUrl('Projects')}>
            View All in Projects Hub <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        currentUser={currentUser}
        profile={profile}
      />
    </div>
  );
}