import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Save, Settings, Users, History, MessageSquare, 
  Sparkles, ChevronLeft, Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { createPageUrl } from '@/utils';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import CollaboratorPanel from '@/components/content/CollaboratorPanel';
import VersionHistoryPanel from '@/components/content/VersionHistoryPanel';
import CommentsPanel from '@/components/content/CommentsPanel';
import AIWritingAssistant from '@/components/content/AIWritingAssistant';
import ContentSettingsModal from '@/components/content/ContentSettingsModal';

export default function ContentEditor() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');

  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [rightPanel, setRightPanel] = useState('ai');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

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

  const { data: project, isLoading } = useQuery({
    queryKey: ['contentProject', projectId],
    queryFn: async () => {
      const projects = await base44.entities.ContentProject.filter({ id: projectId });
      return projects[0];
    },
    enabled: !!projectId
  });

  useEffect(() => {
    if (project) {
      setTitle(project.title || '');
      setContent(project.content || '');
    }
  }, [project]);

  useEffect(() => {
    if (project) {
      const changed = content !== (project.content || '') || title !== (project.title || '');
      setHasUnsavedChanges(changed);
    }
  }, [content, title, project]);

  useEffect(() => {
    if (!hasUnsavedChanges || !project) return;
    const timer = setTimeout(() => handleSave(true), 30000);
    return () => clearTimeout(timer);
  }, [content, title, hasUnsavedChanges]);

  const saveMutation = useMutation({
    mutationFn: async ({ createVersion = false }) => {
      const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w).length;
      const readTime = Math.ceil(wordCount / 200);

      await base44.entities.ContentProject.update(projectId, {
        title,
        content,
        word_count: wordCount,
        read_time_minutes: readTime,
        current_version: createVersion ? (project.current_version || 1) + 1 : project.current_version
      });

      if (createVersion) {
        await base44.entities.ContentVersion.create({
          project_id: projectId,
          version_number: (project.current_version || 1) + 1,
          content,
          author_id: currentUser.email,
          author_name: profile?.display_name,
          change_summary: 'Manual save',
          change_type: 'edit',
          word_count: wordCount
        });
      }
    },
    onSuccess: () => {
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      queryClient.invalidateQueries({ queryKey: ['contentProject', projectId] });
      queryClient.invalidateQueries({ queryKey: ['contentVersions', projectId] });
    }
  });

  const handleSave = async (autoSave = false) => {
    setIsSaving(true);
    try {
      await saveMutation.mutateAsync({ createVersion: !autoSave });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    await handleSave(true);
    await base44.entities.ContentProject.update(projectId, { 
      status: 'published',
      published_at: new Date().toISOString()
    });
    queryClient.invalidateQueries({ queryKey: ['contentProject', projectId] });
  };

  const isOwner = project?.owner_id === currentUser?.email;
  const canEdit = isOwner || project?.collaborator_ids?.includes(currentUser?.email);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Project not found</h2>
          <Button onClick={() => window.location.href = createPageUrl('ContentStudio')}>
            Back to Studio
          </Button>
        </div>
      </div>
    );
  }

  const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col h-screen overflow-hidden">
      <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => window.location.href = createPageUrl('ContentStudio')}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Studio
          </Button>
          <div className="h-6 w-px bg-slate-200" />
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border-0 text-lg font-semibold focus-visible:ring-0 w-96"
            placeholder="Untitled Project"
            disabled={!canEdit}
          />
          <Badge className={hasUnsavedChanges ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}>
            {hasUnsavedChanges ? 'Unsaved' : 'Saved'}
          </Badge>
          <Badge className="text-xs">{wordCount} words</Badge>
        </div>

        <div className="flex items-center gap-2">
          {lastSaved && (
            <span className="text-xs text-slate-500">
              {format(lastSaved, 'h:mm a')}
            </span>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleSave(false)}
            disabled={!hasUnsavedChanges || isSaving || !canEdit}
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="w-4 h-4" />
          </Button>
          {project.status === 'draft' && isOwner && (
            <Button 
              size="sm"
              onClick={handlePublish}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Publish
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-8">
            <ReactQuill
              value={content}
              onChange={setContent}
              theme="snow"
              readOnly={!canEdit}
              className="bg-white rounded-lg shadow-sm"
              style={{ minHeight: '500px' }}
            />
          </div>
        </div>

        <div className="w-80 border-l border-slate-200 bg-white flex flex-col shrink-0">
          <Tabs value={rightPanel} onValueChange={setRightPanel} className="flex-1 flex flex-col">
            <TabsList className="w-full grid grid-cols-4 rounded-none border-b">
              <TabsTrigger value="ai"><Sparkles className="w-4 h-4" /></TabsTrigger>
              <TabsTrigger value="comments"><MessageSquare className="w-4 h-4" /></TabsTrigger>
              <TabsTrigger value="team"><Users className="w-4 h-4" /></TabsTrigger>
              <TabsTrigger value="history"><History className="w-4 h-4" /></TabsTrigger>
            </TabsList>

            <TabsContent value="ai" className="flex-1 m-0 p-4 overflow-auto">
              <AIWritingAssistant 
                projectId={projectId}
                content={content}
                onApplySuggestion={(newContent) => setContent(newContent)}
              />
            </TabsContent>

            <TabsContent value="comments" className="flex-1 m-0 overflow-hidden">
              <CommentsPanel projectId={projectId} profile={profile} />
            </TabsContent>

            <TabsContent value="team" className="flex-1 m-0 overflow-hidden">
              <CollaboratorPanel project={project} profile={profile} />
            </TabsContent>

            <TabsContent value="history" className="flex-1 m-0 overflow-hidden">
              <VersionHistoryPanel 
                projectId={projectId}
                onRestore={(version) => {
                  setContent(version.content);
                  setHasUnsavedChanges(true);
                }}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <ContentSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        project={project}
      />
    </div>
  );
}