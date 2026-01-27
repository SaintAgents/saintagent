import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  MessageSquare, 
  Pin, 
  Heart, 
  Reply, 
  Send, 
  Megaphone, 
  HelpCircle, 
  CheckCircle, 
  Link2,
  MoreVertical,
  Trash2,
  ListTodo,
  Upload,
  FileText,
  Image as ImageIcon,
  File,
  Download,
  Users,
  Clock,
  CheckSquare,
  Square,
  UserPlus,
  Loader2
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const TYPE_CONFIG = {
  discussion: { label: 'Discussion', icon: MessageSquare, color: 'bg-slate-100 text-slate-700' },
  update: { label: 'Update', icon: CheckCircle, color: 'bg-emerald-100 text-emerald-700' },
  question: { label: 'Question', icon: HelpCircle, color: 'bg-blue-100 text-blue-700' },
  task_update: { label: 'Task Update', icon: CheckCircle, color: 'bg-violet-100 text-violet-700' },
  announcement: { label: 'Announcement', icon: Megaphone, color: 'bg-amber-100 text-amber-700' },
  resource: { label: 'Resource', icon: Link2, color: 'bg-rose-100 text-rose-700' }
};

// Task Assignment Component
function TaskAssignment({ mission, missionId, participants, currentUser, userProfile }) {
  const queryClient = useQueryClient();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');

  const updateTasksMutation = useMutation({
    mutationFn: async (tasks) => {
      await base44.entities.Mission.update(missionId, { tasks });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['missions'] })
  });

  const tasks = mission?.tasks || [];

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask = {
      id: Date.now().toString(),
      title: newTaskTitle,
      completed: false,
      assignee_id: newTaskAssignee || null,
      assignee_name: participants?.find(p => p.user_id === newTaskAssignee)?.display_name || null,
      created_at: new Date().toISOString(),
      created_by: currentUser?.email
    };
    updateTasksMutation.mutate([...tasks, newTask]);
    setNewTaskTitle('');
    setNewTaskAssignee('');
  };

  const toggleTask = (taskId) => {
    const updated = tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
    updateTasksMutation.mutate(updated);
  };

  const assignTask = (taskId, assigneeId) => {
    const assignee = participants?.find(p => p.user_id === assigneeId);
    const updated = tasks.map(t => t.id === taskId ? { 
      ...t, 
      assignee_id: assigneeId,
      assignee_name: assignee?.display_name || null
    } : t);
    updateTasksMutation.mutate(updated);
  };

  const deleteTask = (taskId) => {
    updateTasksMutation.mutate(tasks.filter(t => t.id !== taskId));
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <Progress value={progressPercent} className="flex-1 h-2" />
        <span className="text-sm font-medium text-slate-600">{completedCount}/{tasks.length}</span>
      </div>

      {/* Add Task */}
      <div className="flex gap-2">
        <Input
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Add a task..."
          className="flex-1"
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
        />
        <Select value={newTaskAssignee} onValueChange={setNewTaskAssignee}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Assign to..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>Unassigned</SelectItem>
            {participants?.map(p => (
              <SelectItem key={p.user_id} value={p.user_id}>
                {p.display_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={addTask} disabled={!newTaskTitle.trim()} className="bg-violet-600 hover:bg-violet-700">
          Add
        </Button>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {tasks.map(task => (
          <div key={task.id} className={cn(
            "flex items-center gap-3 p-3 rounded-lg border transition-all",
            task.completed ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-200"
          )}>
            <button onClick={() => toggleTask(task.id)} className="shrink-0">
              {task.completed ? (
                <CheckSquare className="w-5 h-5 text-emerald-600" />
              ) : (
                <Square className="w-5 h-5 text-slate-400 hover:text-violet-600" />
              )}
            </button>
            <span className={cn("flex-1 text-sm", task.completed && "line-through text-slate-500")}>
              {task.title}
            </span>
            {task.assignee_name ? (
              <Badge variant="secondary" className="text-xs">
                <Users className="w-3 h-3 mr-1" />
                {task.assignee_name}
              </Badge>
            ) : (
              <Select value={task.assignee_id || ''} onValueChange={(v) => assignTask(task.id, v)}>
                <SelectTrigger className="w-32 h-7 text-xs">
                  <SelectValue placeholder="Assign" />
                </SelectTrigger>
                <SelectContent>
                  {participants?.map(p => (
                    <SelectItem key={p.user_id} value={p.user_id}>
                      {p.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <button onClick={() => deleteTask(task.id)} className="text-slate-400 hover:text-rose-500">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {tasks.length === 0 && (
          <p className="text-center text-slate-500 text-sm py-4">No tasks yet. Add one above!</p>
        )}
      </div>
    </div>
  );
}

// Real-time Chat Component
function MissionChat({ missionId, currentUser, userProfile }) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const scrollRef = useRef(null);
  const conversationId = `mission_${missionId}`;

  const { data: messages = [] } = useQuery({
    queryKey: ['missionChat', missionId],
    queryFn: () => base44.entities.Message.filter({ conversation_id: conversationId }, 'created_date', 100),
    enabled: !!missionId,
    refetchInterval: 3000 // Poll every 3 seconds for real-time feel
  });

  // Subscribe to real-time updates
  useEffect(() => {
    if (!missionId) return;
    const unsubscribe = base44.entities.Message.subscribe((event) => {
      if (event.data?.conversation_id === conversationId) {
        queryClient.invalidateQueries({ queryKey: ['missionChat', missionId] });
      }
    });
    return unsubscribe;
  }, [missionId, conversationId, queryClient]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: (content) => base44.entities.Message.create({
      conversation_id: conversationId,
      from_user_id: currentUser.email,
      to_user_id: 'mission_group',
      from_name: currentUser.full_name,
      from_avatar: userProfile?.avatar_url,
      content,
      message_type: 'text'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missionChat', missionId] });
      setMessage('');
    }
  });

  const handleSend = () => {
    if (!message.trim()) return;
    sendMutation.mutate(message.trim());
  };

  return (
    <div className="flex flex-col h-[400px]">
      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 p-3">
        <div className="space-y-3">
          {messages.map(msg => {
            const isOwn = msg.from_user_id === currentUser?.email;
            return (
              <div key={msg.id} className={cn("flex gap-2", isOwn && "flex-row-reverse")}>
                {!isOwn && (
                  <Avatar className="w-7 h-7">
                    <AvatarImage src={msg.from_avatar} />
                    <AvatarFallback className="text-xs">{msg.from_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                <div className={cn(
                  "max-w-[70%] rounded-2xl px-3 py-2",
                  isOwn ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-900"
                )}>
                  {!isOwn && <p className="text-xs font-medium mb-0.5">{msg.from_name}</p>}
                  <p className="text-sm">{msg.content}</p>
                  <p className={cn("text-xs mt-1", isOwn ? "text-violet-200" : "text-slate-400")}>
                    {format(new Date(msg.created_date), 'h:mm a')}
                  </p>
                </div>
              </div>
            );
          })}
          {messages.length === 0 && (
            <p className="text-center text-slate-500 text-sm py-8">No messages yet. Start the conversation!</p>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
        />
        <Button 
          onClick={handleSend} 
          disabled={!message.trim() || sendMutation.isPending}
          className="bg-violet-600 hover:bg-violet-700"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// File Sharing Component
function MissionFiles({ missionId, currentUser, userProfile }) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const { data: files = [] } = useQuery({
    queryKey: ['missionFiles', missionId],
    queryFn: () => base44.entities.SharedFile.filter({ entity_type: 'mission', entity_id: missionId }, '-created_date', 50),
    enabled: !!missionId
  });

  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      setUploading(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.SharedFile.create({
        entity_type: 'mission',
        entity_id: missionId,
        file_url,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        uploaded_by: currentUser.email,
        uploader_name: currentUser.full_name,
        uploader_avatar: userProfile?.avatar_url
      });
      setUploading(false);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['missionFiles', missionId] }),
    onError: () => setUploading(false)
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SharedFile.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['missionFiles', missionId] })
  });

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) uploadMutation.mutate(file);
  };

  const getFileIcon = (type) => {
    if (type?.startsWith('image/')) return ImageIcon;
    if (type?.includes('pdf')) return FileText;
    return File;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div className="flex justify-center">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          variant="outline"
          className="gap-2"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {uploading ? 'Uploading...' : 'Upload File'}
        </Button>
      </div>

      {/* Files Grid */}
      <div className="grid grid-cols-2 gap-3">
        {files.map(file => {
          const FileIcon = getFileIcon(file.file_type);
          return (
            <div key={file.id} className="bg-white border rounded-lg p-3 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <FileIcon className="w-5 h-5 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{file.file_name}</p>
                  <p className="text-xs text-slate-500">{formatFileSize(file.file_size)}</p>
                  <p className="text-xs text-slate-400 mt-1">by {file.uploader_name}</p>
                </div>
                <div className="flex gap-1">
                  <a
                    href={file.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 hover:bg-slate-100 rounded"
                  >
                    <Download className="w-4 h-4 text-slate-500" />
                  </a>
                  {file.uploaded_by === currentUser?.email && (
                    <button
                      onClick={() => deleteMutation.mutate(file.id)}
                      className="p-1.5 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {files.length === 0 && (
        <p className="text-center text-slate-500 text-sm py-8">No files shared yet. Upload one to get started!</p>
      )}
    </div>
  );
}

function BoardPost({ post, onReply, onLike, onDelete, isOwn, profiles }) {
  const [showReplies, setShowReplies] = useState(false);
  const config = TYPE_CONFIG[post.content_type] || TYPE_CONFIG.discussion;
  const Icon = config.icon;
  const authorProfile = profiles?.find(p => p.user_id === post.author_id);

  return (
    <div className={cn(
      "bg-white dark:bg-[#0a0a0a] rounded-xl border p-4",
      post.is_pinned && "border-amber-300 bg-amber-50/50 dark:bg-amber-900/10"
    )}>
      {post.is_pinned && (
        <div className="flex items-center gap-1.5 text-amber-600 text-xs font-medium mb-2">
          <Pin className="w-3.5 h-3.5" />
          Pinned
        </div>
      )}

      <div className="flex items-start gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={post.author_avatar || authorProfile?.avatar_url} />
          <AvatarFallback>{post.author_name?.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-slate-900 dark:text-white">{post.author_name}</span>
            <Badge className={cn("text-xs", config.color)}>
              <Icon className="w-3 h-3 mr-1" />
              {config.label}
            </Badge>
            <span className="text-xs text-slate-400">
              {format(parseISO(post.created_date), 'MMM d, h:mm a')}
            </span>
          </div>

          {post.title && (
            <h4 className="font-semibold text-slate-900 dark:text-white mt-1">{post.title}</h4>
          )}

          <p className="text-slate-600 dark:text-slate-300 mt-1 whitespace-pre-wrap">{post.content}</p>

          {post.attachments?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {post.attachments.map((att, i) => (
                <a
                  key={i}
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                >
                  <Link2 className="w-3 h-3" />
                  {att.name || 'Attachment'}
                </a>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 mt-3">
            <button
              onClick={() => onLike?.(post)}
              className="flex items-center gap-1.5 text-slate-500 hover:text-rose-500 transition-colors text-sm"
            >
              <Heart className={cn("w-4 h-4", post.likes_count > 0 && "fill-rose-500 text-rose-500")} />
              {post.likes_count || 0}
            </button>
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center gap-1.5 text-slate-500 hover:text-violet-500 transition-colors text-sm"
            >
              <Reply className="w-4 h-4" />
              {post.replies_count || 0} replies
            </button>
            {isOwn && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-slate-400 hover:text-slate-600">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => onDelete?.(post)} className="text-rose-600">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MissionCollaborationBoard({ missionId, mission }) {
  const queryClient = useQueryClient();
  const [newPost, setNewPost] = useState({ content: '', content_type: 'discussion', title: '' });
  const [filter, setFilter] = useState('all');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: userProfile } = useQuery({
    queryKey: ['myProfile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_id: user.email });
      return profiles?.[0];
    },
    enabled: !!user?.email
  });

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['missionBoard', missionId],
    queryFn: () => base44.entities.MissionBoard.filter({ mission_id: missionId }, '-created_date', 100),
    enabled: !!missionId,
    refetchInterval: 10000
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => base44.entities.UserProfile.list('-updated_date', 100)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.MissionBoard.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missionBoard', missionId] });
      setNewPost({ content: '', content_type: 'discussion', title: '' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.MissionBoard.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['missionBoard', missionId] })
  });

  const handlePost = () => {
    if (!newPost.content.trim()) return;
    createMutation.mutate({
      mission_id: missionId,
      author_id: user?.email,
      author_name: user?.full_name,
      author_avatar: userProfile?.avatar_url,
      content_type: newPost.content_type,
      title: newPost.title,
      content: newPost.content
    });
  };

  const filteredPosts = filter === 'all' 
    ? posts 
    : posts.filter(p => p.content_type === filter);

  const pinnedPosts = filteredPosts.filter(p => p.is_pinned);
  const regularPosts = filteredPosts.filter(p => !p.is_pinned);

  return (
    <div className="space-y-4">
      {/* New Post */}
      <div className="bg-white dark:bg-[#0a0a0a] rounded-xl border p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={userProfile?.avatar_url} />
            <AvatarFallback>{user?.full_name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <Select value={newPost.content_type} onValueChange={(v) => setNewPost({ ...newPost, content_type: v })}>
            <SelectTrigger className="w-40 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TYPE_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <config.icon className="w-3.5 h-3.5" />
                    {config.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {(newPost.content_type === 'announcement' || newPost.content_type === 'resource') && (
          <Input
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            placeholder="Title (optional)"
            className="mb-2"
          />
        )}

        <Textarea
          value={newPost.content}
          onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
          placeholder="Share an update, ask a question, or start a discussion..."
          rows={3}
        />

        <div className="flex justify-end mt-2">
          <Button
            onClick={handlePost}
            disabled={!newPost.content.trim() || createMutation.isPending}
            className="bg-violet-600 hover:bg-violet-700"
          >
            <Send className="w-4 h-4 mr-1.5" />
            Post
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All
        </Button>
        {Object.entries(TYPE_CONFIG).map(([key, config]) => (
          <Button
            key={key}
            variant={filter === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(key)}
            className="gap-1.5"
          >
            <config.icon className="w-3.5 h-3.5" />
            {config.label}
          </Button>
        ))}
      </div>

      {/* Posts */}
      <ScrollArea className="h-[500px]">
        <div className="space-y-3">
          {/* Pinned posts first */}
          {pinnedPosts.map(post => (
            <BoardPost
              key={post.id}
              post={post}
              isOwn={post.author_id === user?.email}
              onDelete={(p) => deleteMutation.mutate(p.id)}
              profiles={profiles}
            />
          ))}

          {/* Regular posts */}
          {regularPosts.map(post => (
            <BoardPost
              key={post.id}
              post={post}
              isOwn={post.author_id === user?.email}
              onDelete={(p) => deleteMutation.mutate(p.id)}
              profiles={profiles}
            />
          ))}

          {filteredPosts.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500">No posts yet. Start the conversation!</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}