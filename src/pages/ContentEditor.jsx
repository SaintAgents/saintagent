import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Save, Undo, Redo, Eye, Settings, Users, History, 
  MessageSquare, Sparkles, Upload, Image, Video, Music,
  Bold, Italic, Underline, List, ListOrdered, Link,
  AlignLeft, AlignCenter, AlignRight, Quote, Code,
  ChevronLeft, MoreVertical, Send, Check, X, Loader2,
  Wand2, FileText, Download, Share2
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
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
  const [rightPanel, setRightPanel] = useState('ai'); // ai, comments, collaborators, history
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

  const { data: versions = [] } = useQuery({
    queryKey: ['contentVersions', projectId],
    queryFn: () => base44.entities.ContentVersion.filter({ project_id: projectId }, '-version_number', 50),
    enabled: !!projectId
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['contentComments', projectId],
    queryFn: () => base44.entities.ContentComment.filter({ project_id: projectId }, '-created_date', 100),
    enabled: !!projectId
  });

  // Initialize content from project
  useEffect(() => {
    if (project) {
      setTitle(project.title || '');
      setContent(project.content || '');
    }
  }, [project]);

  // Track changes
  useEffect(() => {
    if (project) {
      const changed = content !== (project.content || '') || title !== (project.title || '');
      setHasUnsavedChanges(changed);
    }
  }, [content, title, project]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!hasUnsavedChanges || !project) return;
    const timer = setTimeout(() => {
      handleSave(true);
    }, 30000);
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

  const handleStatusChange = async (newStatus) => {
    await base44.entities.ContentProject.update(projectId, { 
      status: newStatus,
      ...(newStatus === 'published' ? { published_at: new Date().toISOString() } : {})
    });
    queryClient.invalidateQueries({ queryKey: ['contentProject', projectId] });
  };

  const isOwner = project?.owner_id === currentUser?.email;
  const isCollaborator = project?.collaborator_ids?.includes(currentUser?.email);
  const canEdit = isOwner || isCollaborator;

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
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Project not found</h2>
          <Button onClick={() => window.location.href = createPageUrl('ContentStudio')}>
            Back to Studio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Toolbar */}
      <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => window.location.href = createPageUrl('ContentStudio')}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div className="h-6 w-px bg-slate-200" />
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border-0 text-lg font-semibold focus-visible:ring-0 w-64"
            placeholder="Untitled"
            disabled={!canEdit}
          />
          <Badge variant={hasUnsavedChanges ? 'outline' : 'secondary'}>
            {hasUnsavedChanges ? 'Unsaved changes' : 'Saved'}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {lastSaved && (
            <span className="text-xs text-slate-500">
              Last saved {format(lastSaved, 'h:mm a')}
            </span>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleSave(false)}
            disabled={!hasUnsavedChanges || isSaving || !canEdit}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1" />
            ) : (
              <Save className="w-4 h-4 mr-1" />
            )}
            Save
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
              onClick={() => handleStatusChange('published')}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Publish
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main Editor */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 max-w-4xl mx-auto w-full p-8">
            <ReactQuill
              value={content}
              onChange={setContent}
              theme="snow"
              readOnly={!canEdit}
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, 3, false] }],
                  ['bold',