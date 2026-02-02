import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, Search, FileText, Video, Music, FolderOpen, 
  Clock, Users, Eye, Edit3, Trash2, MoreVertical,
  Filter, Grid, List, Sparkles, TrendingUp
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { createPageUrl } from '@/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import CreateContentModal from '@/components/content/CreateContentModal';
import ContentProjectCard from '@/components/content/ContentProjectCard';
import BackButton from '@/components/hud/BackButton';

const CONTENT_TYPE_CONFIG = {
  article: { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100' },
  video: { icon: Video, color: 'text-purple-600', bg: 'bg-purple-100' },
  audio: { icon: Music, color: 'text-amber-600', bg: 'bg-amber-100' },
  mixed: { icon: FolderOpen, color: 'text-emerald-600', bg: 'bg-emerald-100' }
};

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-slate-100 text-slate-700' },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  review: { label: 'Review', color: 'bg-amber-100 text-amber-700' },
  published: { label: 'Published', color: 'bg-emerald-100 text-emerald-700' },
  archived: { label: 'Archived', color: 'bg-slate-100 text-slate-500' }
};

export default function ContentStudio() {
  const queryClient = useQueryClient();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [activeTab, setActiveTab] = useState('my-projects');

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: profile } = useQuery({
    queryKey: ['profile', currentUser?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_id: currentUser.email });
      return profiles[0];
    },
    enabled: !!currentUser?.email
  });

  // My projects
  const { data: myProjects = [], isLoading: loadingMy } = useQuery({
    queryKey: ['myContentProjects', currentUser?.email],
    queryFn: () => base44.entities.ContentProject.filter({ owner_id: currentUser.email }, '-updated_date', 50),
    enabled: !!currentUser?.email
  });

  // Shared with me (where I'm a collaborator)
  const { data: allProjects = [] } = useQuery({
    queryKey: ['allContentProjects'],
    queryFn: () => base44.entities.ContentProject.list('-updated_date', 100),
    enabled: !!currentUser?.email
  });

  const sharedProjects = allProjects.filter(p => 
    p.owner_id !== currentUser?.email && 
    p.collaborator_ids?.includes(currentUser?.email)
  );

  // Pending invites
  const { data: pendingInvites = [] } = useQuery({
    queryKey: ['pendingInvites', currentUser?.email],
    queryFn: () => base44.entities.CollaboratorInvite.filter({ 
      invitee_id: currentUser.email, 
      status: 'pending' 
    }),
    enabled: !!currentUser?.email
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ContentProject.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myContentProjects'] })
  });

  const acceptInviteMutation = useMutation({
    mutationFn: async (invite) => {
      await base44.entities.CollaboratorInvite.update(invite.id, { status: 'accepted' });
      const project = await base44.entities.ContentProject.filter({ id: invite.project_id });
      if (project[0]) {
        const newCollaborators = [...(project[0].collaborator_ids || []), currentUser.email];
        await base44.entities.ContentProject.update(invite.project_id, { 
          collaborator_ids: newCollaborators 
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingInvites'] });
      queryClient.invalidateQueries({ queryKey: ['allContentProjects'] });
    }
  });

  const filterProjects = (projects) => {
    return projects.filter(p => {
      const matchesSearch = !searchQuery || 
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchesType = typeFilter === 'all' || p.content_type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  };

  const displayProjects = activeTab === 'my-projects' 
    ? filterProjects(myProjects) 
    : filterProjects(sharedProjects);

  const stats = {
    total: myProjects.length,
    published: myProjects.filter(p => p.status === 'published').length,
    inProgress: myProjects.filter(p => p.status === 'in_progress').length,
    collaborations: sharedProjects.length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 pb-20">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200')] opacity-10 bg-cover bg-center" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center gap-2 mb-4">
            <BackButton />
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Content Studio</h1>
              <p className="text-violet-200 text-lg">Create, collaborate, and publish amazing content</p>
            </div>
            <Button 
              onClick={() => setCreateModalOpen(true)}
              className="bg-white text-violet-600 hover:bg-violet-50 gap-2 shadow-lg"
              size="lg"
            >
              <Plus className="w-5 h-5" />
              New Project
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-violet-200">Total Projects</p>
            </div>
            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
              <p className="text-2xl font-bold">{stats.published}</p>
              <p className="text-sm text-violet-200">Published</p>
            </div>
            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
              <p className="text-2xl font-bold">{stats.inProgress}</p>
              <p className="text-sm text-violet-200">In Progress</p>
            </div>
            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
              <p className="text-2xl font-bold">{stats.collaborations}</p>
              <p className="text-sm text-violet-200">Collaborations</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Pending Invites */}
        {pendingInvites.length > 0 && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-600" />
                Pending Invitations ({pendingInvites.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingInvites.map(invite => (
                  <div key={invite.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div>
                      <p className="font-medium text-slate-900">{invite.project_title}</p>
                      <p className="text-sm text-slate-500">
                        Invited by {invite.inviter_name} as {invite.role}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => base44.entities.CollaboratorInvite.update(invite.id, { status: 'declined' })}
                      >
                        Decline
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => acceptInviteMutation.mutate(invite)}
                      >
                        Accept
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="my-projects" className="gap-2">
                <FileText className="w-4 h-4" />
                My Projects
              </TabsTrigger>
              <TabsTrigger value="shared" className="gap-2">
                <Users className="w-4 h-4" />
                Shared with Me
                {sharedProjects.length > 0 && (
                  <Badge variant="secondary" className="ml-1">{sharedProjects.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="article">Article</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex border rounded-lg">
              <Button 
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button 
                variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {loadingMy ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
          </div>
        ) : displayProjects.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {activeTab === 'my-projects' ? 'No projects yet' : 'No shared projects'}
            </h3>
            <p className="text-slate-500 mb-6">
              {activeTab === 'my-projects' 
                ? 'Create your first content project to get started'
                : 'Projects shared with you will appear here'}
            </p>
            {activeTab === 'my-projects' && (
              <Button onClick={() => setCreateModalOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Create Project
              </Button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
          }>
            {displayProjects.map(project => (
              <ContentProjectCard 
                key={project.id} 
                project={project}
                viewMode={viewMode}
                onDelete={() => deleteMutation.mutate(project.id)}
                isOwner={project.owner_id === currentUser?.email}
              />
            ))}
          </div>
        )}
      </div>

      <CreateContentModal 
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        profile={profile}
      />
    </div>
  );
}