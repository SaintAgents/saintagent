import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Upload, File, Image, FileText, Film, Music, Archive, 
  Trash2, Share2, Download, Eye, EyeOff, Copy, Check,
  Inbox, Send, Clock, User, X, Loader2, FolderOpen, ChevronDown, Search
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const FILE_ICONS = {
  'image': Image,
  'video': Film,
  'audio': Music,
  'application/pdf': FileText,
  'application/zip': Archive,
  'default': File
};

const getFileIcon = (mimeType) => {
  if (mimeType?.startsWith('image')) return FILE_ICONS.image;
  if (mimeType?.startsWith('video')) return FILE_ICONS.video;
  if (mimeType?.startsWith('audio')) return FILE_ICONS.audio;
  if (mimeType === 'application/pdf') return FILE_ICONS['application/pdf'];
  if (mimeType?.includes('zip') || mimeType?.includes('archive')) return FILE_ICONS['application/zip'];
  return FILE_ICONS.default;
};

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export default function FileStorageSection({ userId, isOwnProfile }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [shareRecipient, setShareRecipient] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [uploadAsPrivate, setUploadAsPrivate] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [isOpen, setIsOpen] = useState(true);
  const [recipientSearch, setRecipientSearch] = useState('');
  const [showRecipientDropdown, setShowRecipientDropdown] = useState(false);

  // Fetch all user profiles for recipient search
  const { data: allProfiles = [] } = useQuery({
    queryKey: ['allProfiles'],
    queryFn: () => base44.entities.UserProfile.list('-updated_date', 100),
    enabled: shareModalOpen
  });

  // Fetch user's files
  const { data: myFiles = [], isLoading: filesLoading } = useQuery({
    queryKey: ['userFiles', userId],
    queryFn: () => base44.entities.UserFile.filter({ user_id: userId }, '-created_date'),
    enabled: !!userId
  });

  // Fetch files shared with me (inbox)
  const { data: sharedWithMe = [], isLoading: inboxLoading } = useQuery({
    queryKey: ['sharedFilesInbox', userId],
    queryFn: () => base44.entities.SharedFile.filter({ recipient_user_id: userId }, '-created_date'),
    enabled: !!userId && isOwnProfile
  });

  // Fetch files I've shared
  const { data: sharedByMe = [], isLoading: sentLoading } = useQuery({
    queryKey: ['sharedFilesSent', userId],
    queryFn: () => base44.entities.SharedFile.filter({ sender_user_id: userId }, '-created_date'),
    enabled: !!userId && isOwnProfile
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      let result;
      if (uploadAsPrivate) {
        result = await base44.integrations.Core.UploadPrivateFile({ file });
        return { ...result, isPrivate: true };
      } else {
        result = await base44.integrations.Core.UploadFile({ file });
        return { ...result, isPrivate: false };
      }
    },
    onSuccess: async (result, file) => {
      await base44.entities.UserFile.create({
        user_id: userId,
        file_url: result.file_url || null,
        file_uri: result.file_uri || null,
        file_name: file.name,
        mime_type: file.type,
        size_bytes: file.size,
        is_public: false,
        is_private_storage: result.isPrivate
      });
      queryClient.invalidateQueries({ queryKey: ['userFiles', userId] });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (fileId) => base44.entities.UserFile.delete(fileId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userFiles', userId] })
  });

  // Toggle public mutation
  const togglePublicMutation = useMutation({
    mutationFn: ({ fileId, isPublic }) => base44.entities.UserFile.update(fileId, { is_public: isPublic }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userFiles', userId] })
  });

  // Share mutation
  const shareMutation = useMutation({
    mutationFn: async ({ file, recipientId, message }) => {
      const me = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ user_id: me.email });
      const myProfile = profiles?.[0];
      
      const sharedFile = await base44.entities.SharedFile.create({
        user_file_id: file.id,
        sender_user_id: userId,
        sender_name: myProfile?.display_name || me.full_name,
        sender_avatar: myProfile?.avatar_url,
        recipient_user_id: recipientId,
        file_name: file.file_name,
        file_size: file.size_bytes,
        mime_type: file.mime_type,
        message: message || null
      });
      
      // Create notification for recipient
      await base44.entities.Notification.create({
        user_id: recipientId,
        type: 'message',
        title: 'New File Shared',
        message: `${myProfile?.display_name || me.full_name} shared a file with you: ${file.file_name}`,
        source_user_id: me.email,
        source_user_name: myProfile?.display_name || me.full_name,
        source_user_avatar: myProfile?.avatar_url,
        action_url: '/Profile',
        action_label: 'View File'
      });
      
      return sharedFile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sharedFilesSent', userId] });
      setShareModalOpen(false);
      setShareRecipient('');
      setShareMessage('');
      setSelectedFile(null);
    }
  });

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setUploading(true);
    for (const file of files) {
      await uploadMutation.mutateAsync(file);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleShare = (file) => {
    setSelectedFile(file);
    setShareRecipient('');
    setRecipientSearch('');
    setShareModalOpen(true);
  };

  // Filter profiles based on search (display_name, handle, SA#, user_id)
  const filteredProfiles = allProfiles.filter(p => {
    if (p.user_id === userId) return false;
    const search = recipientSearch.toLowerCase();
    return (
      p.display_name?.toLowerCase().includes(search) ||
      p.handle?.toLowerCase().includes(search) ||
      p.user_id?.toLowerCase().includes(search) ||
      p.sa_number?.toLowerCase().includes(search)
    );
  }).slice(0, 10);

  const selectRecipient = (profile) => {
    setShareRecipient(profile.user_id);
    setRecipientSearch(profile.display_name || profile.handle || profile.user_id);
    setShowRecipientDropdown(false);
  };

  const handleCopyLink = async (file) => {
    let url = file.file_url;
    if (file.is_private_storage && file.file_uri) {
      const result = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: file.file_uri });
      url = result.signed_url;
    }
    if (url) {
      navigator.clipboard.writeText(url);
      setCopiedId(file.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleDownloadShared = async (sharedFile) => {
    const userFile = await base44.entities.UserFile.filter({ id: sharedFile.user_file_id });
    const file = userFile?.[0];
    if (!file) return;
    
    let url = file.file_url;
    if (file.is_private_storage && file.file_uri) {
      const result = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: file.file_uri });
      url = result.signed_url;
    }
    if (url) {
      window.open(url, '_blank');
      if (sharedFile.status === 'pending') {
        await base44.entities.SharedFile.update(sharedFile.id, { status: 'downloaded' });
        queryClient.invalidateQueries({ queryKey: ['sharedFilesInbox', userId] });
      }
    }
  };

  const FileCard = ({ file, showActions = true }) => {
    const IconComponent = getFileIcon(file.mime_type);
    return (
      <div className="flex flex-col gap-2 p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
            <IconComponent className="h-5 w-5 text-violet-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{file.file_name}</p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{formatFileSize(file.size_bytes)}</span>
              {file.is_public && <Badge variant="secondary" className="text-xs py-0">Public</Badge>}
              {file.is_private_storage && <Badge variant="outline" className="text-xs py-0">Private</Badge>}
            </div>
          </div>
        </div>
        {showActions && isOwnProfile && (
          <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-slate-100">
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => handleCopyLink(file)}>
              {copiedId === file.id ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
              Copy Link
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => togglePublicMutation.mutate({ fileId: file.id, isPublic: !file.is_public })}>
              {file.is_public ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              {file.is_public ? 'Public' : 'Private'}
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => handleShare(file)}>
              <Share2 className="h-3 w-3" />
              Share
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-red-500 hover:text-red-600" onClick={() => deleteMutation.mutate(file.id)}>
              <Trash2 className="h-3 w-3" />
              Delete
            </Button>
          </div>
        )}
      </div>
    );
  };

  const SharedFileCard = ({ sharedFile, type }) => {
    const IconComponent = getFileIcon(sharedFile.mime_type);
    const isPending = sharedFile.status === 'pending';
    
    return (
      <div className={`flex items-center gap-3 p-3 rounded-lg border ${isPending ? 'border-violet-200 bg-violet-50' : 'border-slate-200 bg-white'}`}>
        <div className="h-10 w-10 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
          <IconComponent className="h-5 w-5 text-violet-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 truncate">{sharedFile.file_name}</p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{formatFileSize(sharedFile.file_size)}</span>
            {type === 'inbox' && <span>from {sharedFile.sender_name}</span>}
            {type === 'sent' && <span>to {sharedFile.recipient_user_id}</span>}
            {isPending && <Badge className="bg-violet-500 text-xs py-0">New</Badge>}
          </div>
          {sharedFile.message && <p className="text-xs text-slate-500 mt-1 truncate">"{sharedFile.message}"</p>}
        </div>
        {type === 'inbox' && (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownloadShared(sharedFile)}>
            <Download className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  };

  if (!isOwnProfile) {
    const publicFiles = myFiles.filter(f => f.is_public);
    if (publicFiles.length === 0) return null;
    
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FolderOpen className="h-5 w-5" /> Public Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {publicFiles.map(file => <FileCard key={file.id} file={file} showActions={false} />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-900">
                  <FolderOpen className="h-5 w-5" /> File Storage
                </CardTitle>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
                  </Button>
                </CollapsibleTrigger>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2" title="Private files require a signed URL to access">
                  <Switch id="private-upload" checked={uploadAsPrivate} onCheckedChange={setUploadAsPrivate} />
                  <Label htmlFor="private-upload" className="text-sm font-medium text-slate-700">Private</Label>
                </div>
                <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white" onClick={() => fileInputRef.current?.click()} disabled={uploading} title="Upload files to your storage">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                  Upload
                </Button>
                <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />
              </div>
            </div>
          </CardHeader>
          <CollapsibleContent>
            <CardContent>
              <Tabs defaultValue="files">
                <TabsList className="mb-4 flex flex-wrap h-auto gap-1 p-1">
                  <TabsTrigger value="files" className="gap-2 text-slate-700 data-[state=active]:text-slate-900" title="Your uploaded files">
                    <File className="h-4 w-4" /> My Files
                  </TabsTrigger>
                  <TabsTrigger value="inbox" className="gap-2 text-slate-700 data-[state=active]:text-slate-900" title="Files shared with you by others">
                    <Inbox className="h-4 w-4" /> Inbox
                    {sharedWithMe.filter(f => f.status === 'pending').length > 0 && (
                      <Badge className="bg-violet-500 ml-1">{sharedWithMe.filter(f => f.status === 'pending').length}</Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="sent" className="gap-2 text-slate-700 data-[state=active]:text-slate-900" title="Files you've shared with others">
                    <Send className="h-4 w-4" /> Sent
                  </TabsTrigger>
                </TabsList>

          <TabsContent value="files">
            {filesLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : myFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-slate-400">
                <FolderOpen className="h-8 w-8 mb-2" />
                <p className="text-sm">No files uploaded yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {myFiles.map(file => <FileCard key={file.id} file={file} />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="inbox">
            {inboxLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : sharedWithMe.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-slate-400">
                <Inbox className="h-8 w-8 mb-2" />
                <p className="text-sm">No files shared with you</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sharedWithMe.map(sf => <SharedFileCard key={sf.id} sharedFile={sf} type="inbox" />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sent">
            {sentLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : sharedByMe.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-slate-400">
                <Send className="h-8 w-8 mb-2" />
                <p className="text-sm">No files shared yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sharedByMe.map(sf => <SharedFileCard key={sf.id} sharedFile={sf} type="sent" />)}
              </div>
            )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </CollapsibleContent>

        {/* Share Modal */}
      <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share File</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedFile && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                {React.createElement(getFileIcon(selectedFile.mime_type), { className: "h-5 w-5 text-violet-600" })}
                <div>
                  <p className="text-sm font-medium">{selectedFile.file_name}</p>
                  <p className="text-xs text-slate-500">{formatFileSize(selectedFile.size_bytes)}</p>
                </div>
              </div>
            )}
            <div className="relative">
              <Label>Recipient</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search by name or email..." 
                  value={recipientSearch} 
                  onChange={(e) => {
                    setRecipientSearch(e.target.value);
                    setShareRecipient('');
                    setShowRecipientDropdown(true);
                  }}
                  onFocus={() => setShowRecipientDropdown(true)}
                  className="pl-9"
                />
              </div>
              {showRecipientDropdown && recipientSearch.length >= 2 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg">
                  <ScrollArea className="max-h-48">
                    {filteredProfiles.length > 0 ? (
                      filteredProfiles.map(profile => (
                        <button
                          key={profile.id}
                          type="button"
                          className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 text-left"
                          onClick={() => selectRecipient(profile)}
                        >
                          {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-violet-100 flex items-center justify-center">
                              <User className="h-4 w-4 text-violet-600" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{profile.display_name || profile.handle}</p>
                            <p className="text-xs text-slate-500 truncate">
                              {profile.handle && <span className="mr-2">@{profile.handle}</span>}
                              {profile.sa_number && <span className="mr-2">SA#{profile.sa_number}</span>}
                              <span>{profile.user_id}</span>
                            </p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-3 text-sm text-slate-500 text-center">No users found</div>
                    )}
                  </ScrollArea>
                </div>
              )}
              {shareRecipient && (
                <p className="text-xs text-green-600 mt-1">Selected: {shareRecipient}</p>
              )}
            </div>
            <div>
              <Label>Message (optional)</Label>
              <Textarea 
                placeholder="Add a note..." 
                value={shareMessage} 
                onChange={(e) => setShareMessage(e.target.value)} 
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => {
                shareMutation.mutate({ file: selectedFile, recipientId: shareRecipient, message: shareMessage });
              }}
              disabled={!shareRecipient || shareMutation.isPending}
            >
              {shareMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Share2 className="h-4 w-4 mr-2" />}
              Share
            </Button>
          </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </Collapsible>
  );
}