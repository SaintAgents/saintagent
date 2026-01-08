import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Send, Check, X, Loader2, ShieldOff, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function ShareContentModal({ open, onClose, content }) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['allProfiles'],
    queryFn: () => base44.entities.UserProfile.list('-updated_date', 200),
    enabled: open
  });

  const { data: myProfile } = useQuery({
    queryKey: ['myProfile', user?.email],
    queryFn: async () => {
      const res = await base44.entities.UserProfile.filter({ user_id: user.email });
      return res?.[0];
    },
    enabled: !!user?.email && open
  });

  // Filter out self and users who have block_shares enabled
  const availableProfiles = useMemo(() => {
    return profiles.filter(p => {
      if (p.user_id === user?.email) return false;
      if (p.block_shares === true) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          p.display_name?.toLowerCase().includes(q) ||
          p.handle?.toLowerCase().includes(q) ||
          p.user_id?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [profiles, user?.email, search]);

  const toggleSelect = (userId) => {
    setSelected(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAll = () => {
    const allIds = availableProfiles.map(p => p.user_id);
    setSelected(allIds);
  };

  const clearAll = () => {
    setSelected([]);
  };

  const handleShare = async () => {
    if (selected.length === 0) return;
    setSending(true);
    
    try {
      // Send as a message to each selected user
      const shareContent = `📤 **Shared Content**\n\n**${content.title}**\n${content.description || ''}\n\n${message ? `💬 ${message}` : ''}`;
      
      await Promise.all(selected.map(recipientId => {
        const recipientProfile = profiles.find(p => p.user_id === recipientId);
        return base44.entities.Message.create({
          from_user_id: user.email,
          to_user_id: recipientId,
          from_name: myProfile?.display_name || user.full_name,
          from_avatar: myProfile?.avatar_url,
          to_name: recipientProfile?.display_name,
          content: shareContent,
          message_type: 'text'
        });
      }));

      // Create notifications for recipients
      await Promise.all(selected.map(recipientId =>
        base44.entities.Notification.create({
          user_id: recipientId,
          type: 'message',
          title: `${myProfile?.display_name || user.full_name} shared something with you`,
          message: content.title,
          source_user_id: user.email,
          source_user_name: myProfile?.display_name || user.full_name,
          source_user_avatar: myProfile?.avatar_url
        })
      ));

      toast.success(`Shared with ${selected.length} user${selected.length > 1 ? 's' : ''}`);
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      onClose();
      setSelected([]);
      setMessage('');
      setSearch('');
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share content');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-violet-600" />
            Share Content
          </DialogTitle>
        </DialogHeader>

        {/* Content preview */}
        <div className="p-3 bg-slate-50 rounded-lg border">
          <div className="font-medium text-sm text-slate-900">{content?.title}</div>
          {content?.description && (
            <div className="text-xs text-slate-500 mt-1 line-clamp-2">{content.description}</div>
          )}
          <Badge variant="outline" className="mt-2 text-xs">{content?.type}</Badge>
        </div>

        {/* Optional message */}
        <Textarea
          placeholder="Add a message (optional)..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="h-16 text-sm"
        />

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Quick actions */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">{selected.length} selected</span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={selectAll} className="h-7 text-xs">
              <Users className="w-3 h-3 mr-1" /> Select All
            </Button>
            {selected.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAll} className="h-7 text-xs text-rose-600">
                <X className="w-3 h-3 mr-1" /> Clear
              </Button>
            )}
          </div>
        </div>

        {/* User list */}
        <ScrollArea className="h-64 border rounded-lg">
          <div className="p-2 space-y-1">
            {availableProfiles.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                No users available to share with
              </div>
            ) : (
              availableProfiles.map(profile => {
                const isSelected = selected.includes(profile.user_id);
                return (
                  <div
                    key={profile.user_id}
                    onClick={() => toggleSelect(profile.user_id)}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                      isSelected 
                        ? "bg-violet-50 border border-violet-200" 
                        : "hover:bg-slate-50"
                    )}
                  >
                    <Checkbox checked={isSelected} />
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={profile.avatar_url} />
                      <AvatarFallback>{profile.display_name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{profile.display_name}</div>
                      <div className="text-xs text-slate-500 truncate">@{profile.handle}</div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-violet-600" />}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        {/* Note about blocked users */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldOff className="w-3 h-3" />
          Users who have blocked shares are not shown
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleShare}
            disabled={selected.length === 0 || sending}
            className="bg-violet-600 hover:bg-violet-700 gap-2"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Share to {selected.length || '...'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}