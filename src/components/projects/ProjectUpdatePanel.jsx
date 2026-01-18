import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Megaphone, Plus, TrendingUp, Flag, Users, Rocket, 
  AlertCircle, Heart, MessageCircle, Share2, Image
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

const UPDATE_TYPE_CONFIG = {
  progress: { label: 'Progress', icon: TrendingUp, color: 'bg-blue-100 text-blue-700' },
  milestone: { label: 'Milestone', icon: Flag, color: 'bg-emerald-100 text-emerald-700' },
  announcement: { label: 'Announcement', icon: Megaphone, color: 'bg-violet-100 text-violet-700' },
  blocker_resolved: { label: 'Blocker Resolved', icon: AlertCircle, color: 'bg-amber-100 text-amber-700' },
  team_change: { label: 'Team Update', icon: Users, color: 'bg-pink-100 text-pink-700' },
  launch: { label: 'Launch', icon: Rocket, color: 'bg-gradient-to-r from-violet-500 to-pink-500 text-white' },
};

function UpdateCard({ update }) {
  const typeConfig = UPDATE_TYPE_CONFIG[update.update_type] || UPDATE_TYPE_CONFIG.progress;
  const TypeIcon = typeConfig.icon;

  return (
    <div className="p-4 rounded-xl bg-white border border-slate-200 hover:border-violet-200 transition-colors">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Avatar className="w-10 h-10" data-user-id={update.author_id}>
          <AvatarImage src={update.author_avatar} />
          <AvatarFallback>{update.author_name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-slate-900">{update.author_name}</span>
            <Badge className={cn("text-[10px] h-5", typeConfig.color)}>
              <TypeIcon className="w-3 h-3 mr-1" />
              {typeConfig.label}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {format(parseISO(update.created_date), 'MMM d, h:mm a')}
            {update.project_title && <span> • {update.project_title}</span>}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mt-3">
        <h4 className="text-sm font-semibold text-slate-900">{update.title}</h4>
        {update.content && (
          <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{update.content}</p>
        )}
      </div>

      {/* Progress Bar */}
      {update.progress_percentage != null && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-500">Progress</span>
            <span className="font-medium text-violet-600">{update.progress_percentage}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-violet-500 to-violet-600 rounded-full transition-all"
              style={{ width: `${update.progress_percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Milestone Badge */}
      {update.milestone_name && (
        <div className="mt-3 p-2 rounded-lg bg-emerald-50 border border-emerald-200">
          <div className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">{update.milestone_name}</span>
          </div>
        </div>
      )}

      {/* Image */}
      {update.image_url && (
        <img src={update.image_url} alt="" className="mt-3 rounded-lg w-full max-h-64 object-cover" />
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t">
        <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-600 transition-colors">
          <Heart className="w-4 h-4" />
          <span>{update.likes_count || 0}</span>
        </button>
        <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-violet-600 transition-colors">
          <MessageCircle className="w-4 h-4" />
          <span>{update.comments_count || 0}</span>
        </button>
        <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors">
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function ProjectUpdatePanel({ projectId, projectTitle, isTeamMember = false }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [updateType, setUpdateType] = useState('progress');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [progress, setProgress] = useState([50]);
  const [milestoneName, setMilestoneName] = useState('');
  const [shareToFeed, setShareToFeed] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: profiles } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.UserProfile.filter({ user_id: user.email });
    },
    enabled: !!currentUser
  });
  const profile = profiles?.[0];

  const { data: updates = [], isLoading } = useQuery({
    queryKey: ['projectUpdates', projectId],
    queryFn: () => base44.entities.ProjectUpdate.filter({ project_id: projectId }, '-created_date'),
    enabled: !!projectId
  });

  // Get team members to notify
  const { data: teamMembers = [] } = useQuery({
    queryKey: ['projectTeamMembers', projectId],
    queryFn: () => base44.entities.ProjectTeamMember.filter({ project_id: projectId, status: 'active' }),
    enabled: !!projectId
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const result = await base44.integrations.Core.UploadFile({ file });
    setImageUrl(result.file_url);
    setUploading(false);
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      // Create the update
      await base44.entities.ProjectUpdate.create({
        project_id: projectId,
        project_title: projectTitle,
        author_id: currentUser.email,
        author_name: profile?.display_name || currentUser.full_name,
        author_avatar: profile?.avatar_url,
        update_type: updateType,
        title,
        content,
        progress_percentage: updateType === 'progress' ? progress[0] : undefined,
        milestone_name: updateType === 'milestone' ? milestoneName : undefined,
        image_url: imageUrl || undefined,
        shared_to_feed: shareToFeed,
        notified_users: teamMembers.map(m => m.user_id)
      });

      // Notify team members
      if (teamMembers.length > 0) {
        const notifications = teamMembers
          .filter(m => m.user_id !== currentUser.email)
          .map(m => ({
            user_id: m.user_id,
            type: 'project',
            title: `Project Update: ${projectTitle}`,
            message: title,
            action_url: `/Projects?id=${projectId}`
          }));
        
        if (notifications.length > 0) {
          await base44.entities.Notification.bulkCreate(notifications);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectUpdates', projectId] });
      setCreateOpen(false);
      setTitle('');
      setContent('');
      setProgress([50]);
      setMilestoneName('');
      setImageUrl('');
    }
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-violet-600" />
          <h3 className="font-semibold text-slate-900">Updates</h3>
          <Badge variant="secondary" className="text-xs">{updates.length}</Badge>
        </div>
        {isTeamMember && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 bg-violet-600 hover:bg-violet-700">
                <Plus className="w-4 h-4" />
                Post Update
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Share Project Update</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <Select value={updateType} onValueChange={setUpdateType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Update type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(UPDATE_TYPE_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <config.icon className="w-4 h-4" />
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input 
                  placeholder="Update title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />

                <Textarea 
                  placeholder="Share details about this update..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={3}
                />

                {updateType === 'progress' && (
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-600">Progress</span>
                      <span className="font-medium text-violet-600">{progress[0]}%</span>
                    </div>
                    <Slider
                      value={progress}
                      onValueChange={setProgress}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>
                )}

                {updateType === 'milestone' && (
                  <Input 
                    placeholder="Milestone name..."
                    value={milestoneName}
                    onChange={(e) => setMilestoneName(e.target.value)}
                  />
                )}

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-sm text-slate-600">
                      <Image className="w-4 h-4" />
                      {uploading ? 'Uploading...' : 'Add Image'}
                    </div>
                  </label>
                  {imageUrl && (
                    <img src={imageUrl} alt="" className="mt-2 rounded-lg max-h-32 object-cover" />
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="shareToFeed" 
                    checked={shareToFeed} 
                    onCheckedChange={setShareToFeed}
                  />
                  <label htmlFor="shareToFeed" className="text-sm text-slate-600 cursor-pointer">
                    Share to community feed
                  </label>
                </div>

                {teamMembers.length > 1 && (
                  <p className="text-xs text-slate-500">
                    {teamMembers.length - 1} team member(s) will be notified
                  </p>
                )}

                <Button 
                  className="w-full bg-violet-600 hover:bg-violet-700"
                  onClick={() => createMutation.mutate()}
                  disabled={!title.trim() || createMutation.isPending}
                >
                  Post Update
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Updates List */}
      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-slate-100 rounded-xl" />)}
        </div>
      ) : updates.length === 0 ? (
        <div className="text-center py-8">
          <Megaphone className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No updates yet</p>
          <p className="text-xs text-slate-400 mt-1">Share progress with your team and community</p>
        </div>
      ) : (
        <div className="space-y-4">
          {updates.map((update) => (
            <UpdateCard key={update.id} update={update} />
          ))}
        </div>
      )}
    </div>
  );
}