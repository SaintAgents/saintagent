import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CheckCircle2, Calendar, User, Paperclip, MessageSquare, 
  Send, X, Upload, Download, Trash2, Edit, Save, Link2, Clock
} from 'lucide-react';

const DEPENDENCY_TYPE_LABELS = {
  FS: 'Finish→Start',
  SS: 'Start→Start',
  FF: 'Finish→Finish',
  SF: 'Start→Finish'
};
import { formatDistanceToNow } from 'date-fns';

export default function TaskDetailModal({ task, open, onClose, currentUser, profile, allTasks = [] }) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [newComment, setNewComment] = useState('');

  // Fetch comments for this task
  const { data: comments = [] } = useQuery({
    queryKey: ['taskComments', task?.id],
    queryFn: () => base44.entities.ProjectComment.filter({ task_id: task.id }, '-created_date', 50),
    enabled: !!task?.id
  });

  // Fetch attachments for this task
  const { data: attachments = [] } = useQuery({
    queryKey: ['taskAttachments', task?.id],
    queryFn: () => base44.entities.ProjectAttachment.filter({ task_id: task.id }, '-created_date', 20),
    enabled: !!task?.id
  });

  // Update task mutation
  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.ProjectTask.update(task.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectTasks'] });
      setIsEditing(false);
    }
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: (content) => base44.entities.ProjectComment.create({
      project_id: task.project_id,
      task_id: task.id,
      content,
      author_id: currentUser?.email,
      author_name: profile?.display_name || currentUser?.full_name,
      author_avatar: profile?.avatar_url
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskComments'] });
      setNewComment('');
    }
  });

  // Upload attachment mutation
  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      return base44.entities.ProjectAttachment.create({
        project_id: task.project_id,
        task_id: task.id,
        file_url,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        uploaded_by_id: currentUser?.email,
        uploaded_by_name: profile?.display_name || currentUser?.full_name
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskAttachments'] });
    }
  });

  // Delete attachment
  const deleteAttachmentMutation = useMutation({
    mutationFn: (id) => base44.entities.ProjectAttachment.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskAttachments'] });
    }
  });

  const handleEdit = () => {
    setEditData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      due_date: task.due_date || ''
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    updateMutation.mutate(editData);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      addCommentMutation.mutate(newComment);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              Task Details
            </span>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                    <X className="w-4 h-4 mr-1" /> Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}>
                    <Save className="w-4 h-4 mr-1" /> Save
                  </Button>
                </>
              ) : (
                <Button variant="ghost" size="sm" onClick={handleEdit}>
                  <Edit className="w-4 h-4 mr-1" /> Edit
                </Button>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Task Info */}
            <div className="space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={editData.title}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={editData.description}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      className="mt-1 min-h-24"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Status</Label>
                      <Select value={editData.status} onValueChange={(v) => setEditData({ ...editData, status: v })}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todo">To Do</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="review">Review</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="blocked">Blocked</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Priority</Label>
                      <Select value={editData.priority} onValueChange={(v) => setEditData({ ...editData, priority: v })}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Due Date</Label>
                      <Input
                        type="date"
                        value={editData.due_date}
                        onChange={(e) => setEditData({ ...editData, due_date: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{task.title}</h3>
                  {task.description && (
                    <p className="text-slate-600 dark:text-slate-400">{task.description}</p>
                  )}
                  <div className="flex items-center gap-4 flex-wrap">
                    <Badge className={
                      task.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                      task.status === 'in_progress' ? 'bg-blue-100 text-blue-600' :
                      task.status === 'blocked' ? 'bg-red-100 text-red-600' :
                      'bg-slate-100 text-slate-600'
                    }>
                      {task.status?.replace('_', ' ')}
                    </Badge>
                    <Badge className={
                      task.priority === 'urgent' ? 'bg-red-100 text-red-600' :
                      task.priority === 'high' ? 'bg-amber-100 text-amber-600' :
                      'bg-slate-100 text-slate-600'
                    }>
                      {task.priority} priority
                    </Badge>
                    {task.due_date && (
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        <Calendar className="w-4 h-4" />
                        Due {new Date(task.due_date).toLocaleDateString()}
                      </div>
                    )}
                    {task.assignee_name && (
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={task.assignee_avatar} />
                          <AvatarFallback className="text-[10px]">{task.assignee_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-slate-600">{task.assignee_name}</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Attachments */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                  <Paperclip className="w-4 h-4" />
                  Attachments ({attachments.length})
                </h4>
                <label>
                  <input type="file" className="hidden" onChange={handleFileUpload} />
                  <Button variant="outline" size="sm" className="cursor-pointer" asChild>
                    <span><Upload className="w-4 h-4 mr-1" /> Upload</span>
                  </Button>
                </label>
              </div>
              {attachments.length > 0 ? (
                <div className="space-y-2">
                  {attachments.map((att) => (
                    <div key={att.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Paperclip className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{att.file_name}</p>
                          <p className="text-xs text-slate-500">{formatFileSize(att.file_size || 0)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a href={att.file_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Download className="w-4 h-4" />
                          </Button>
                        </a>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-500"
                          onClick={() => deleteAttachmentMutation.mutate(att.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-4">No attachments yet</p>
              )}
            </div>

            {/* Comments */}
            <div className="border-t pt-4">
              <h4 className="font-medium text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4" />
                Comments ({comments.length})
              </h4>
              
              {/* Add Comment */}
              <div className="flex gap-2 mb-4">
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback>{currentUser?.full_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                  />
                  <Button 
                    onClick={handleAddComment} 
                    disabled={!newComment.trim() || addCommentMutation.isPending}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarImage src={comment.author_avatar} />
                      <AvatarFallback>{comment.author_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm text-slate-900 dark:text-white">
                          {comment.author_name}
                        </span>
                        <span className="text-xs text-slate-400">
                          {comment.created_date && formatDistanceToNow(new Date(comment.created_date), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{comment.content}</p>
                    </div>
                  </div>
                ))}
                {comments.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-4">No comments yet</p>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}