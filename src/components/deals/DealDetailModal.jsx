import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DollarSign, Building2, User, Mail, Phone, Calendar, 
  MessageSquare, Paperclip, Clock, Edit2, Trash2, Send,
  Upload, FileText, Image, File, X, Loader2, Target,
  ArrowRight, TrendingUp, AlertCircle, Bot
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import DealFormModal from './DealFormModal';
import DealAIAssistant from './DealAIAssistant';

const STAGE_CONFIG = {
  prospecting: { label: 'Prospecting', color: 'bg-slate-500' },
  qualification: { label: 'Qualification', color: 'bg-blue-500' },
  proposal: { label: 'Proposal', color: 'bg-violet-500' },
  negotiation: { label: 'Negotiation', color: 'bg-amber-500' },
  closed_won: { label: 'Closed Won', color: 'bg-emerald-500' },
  closed_lost: { label: 'Closed Lost', color: 'bg-red-500' }
};

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'bg-slate-100 text-slate-700' },
  medium: { label: 'Medium', color: 'bg-amber-100 text-amber-700' },
  high: { label: 'High', color: 'bg-red-100 text-red-700' }
};

export default function DealDetailModal({ deal, onClose, currentUser, profile, allProfiles }) {
  const [activeTab, setActiveTab] = useState('notes');
  const [newNote, setNewNote] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  const queryClient = useQueryClient();
  const isOwner = deal.owner_id === currentUser?.email;
  const isAdmin = currentUser?.role === 'admin';
  const canEdit = isOwner || isAdmin;

  // Fetch notes
  const { data: notes = [] } = useQuery({
    queryKey: ['dealNotes', deal.id],
    queryFn: () => base44.entities.DealNote.filter({ deal_id: deal.id }, '-created_date')
  });

  // Fetch attachments
  const { data: attachments = [] } = useQuery({
    queryKey: ['dealAttachments', deal.id],
    queryFn: () => base44.entities.DealAttachment.filter({ deal_id: deal.id }, '-created_date')
  });

  // Fetch activities
  const { data: activities = [] } = useQuery({
    queryKey: ['dealActivities', deal.id],
    queryFn: () => base44.entities.DealActivity.filter({ deal_id: deal.id }, '-created_date')
  });

  // Add note mutation
  const addNoteMutation = useMutation({
    mutationFn: async (content) => {
      await base44.entities.DealNote.create({
        deal_id: deal.id,
        content,
        author_id: currentUser.email,
        author_name: profile?.display_name || currentUser.full_name,
        author_avatar: profile?.avatar_url
      });

      // Log activity
      await base44.entities.DealActivity.create({
        deal_id: deal.id,
        activity_type: 'note_added',
        description: 'Added a note',
        actor_id: currentUser.email,
        actor_name: profile?.display_name || currentUser.full_name
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dealNotes', deal.id] });
      queryClient.invalidateQueries({ queryKey: ['dealActivities', deal.id] });
      setNewNote('');
    }
  });

  // Upload attachment
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      await base44.entities.DealAttachment.create({
        deal_id: deal.id,
        filename: file.name,
        file_url,
        file_type: file.type,
        file_size: file.size,
        uploader_id: currentUser.email,
        uploader_name: profile?.display_name || currentUser.full_name
      });

      // Log activity
      await base44.entities.DealActivity.create({
        deal_id: deal.id,
        activity_type: 'attachment_added',
        description: `Attached "${file.name}"`,
        actor_id: currentUser.email,
        actor_name: profile?.display_name || currentUser.full_name
      });

      queryClient.invalidateQueries({ queryKey: ['dealAttachments', deal.id] });
      queryClient.invalidateQueries({ queryKey: ['dealActivities', deal.id] });
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploadingFile(false);
    }
  };

  // Delete deal mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Deal.delete(deal.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      onClose();
    }
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (fileType?.includes('pdf')) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'created': return <Target className="w-4 h-4 text-emerald-500" />;
      case 'stage_change': return <ArrowRight className="w-4 h-4 text-blue-500" />;
      case 'note_added': return <MessageSquare className="w-4 h-4 text-violet-500" />;
      case 'attachment_added': return <Paperclip className="w-4 h-4 text-amber-500" />;
      case 'owner_changed': return <User className="w-4 h-4 text-pink-500" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <>
      <Dialog open={!!deal} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="pb-4 border-b">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge className={`${STAGE_CONFIG[deal.stage]?.color} text-white`}>
                    {STAGE_CONFIG[deal.stage]?.label}
                  </Badge>
                  <Badge className={PRIORITY_CONFIG[deal.priority]?.color}>
                    {PRIORITY_CONFIG[deal.priority]?.label} Priority
                  </Badge>
                </div>
                <DialogTitle className="text-xl">{deal.title}</DialogTitle>
                {deal.company_name && (
                  <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                    <Building2 className="w-4 h-4" />
                    {deal.company_name}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(deal.amount)}</p>
                {deal.probability > 0 && (
                  <p className="text-sm text-slate-500">{deal.probability}% probability</p>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <div className="grid grid-cols-3 gap-6 h-full">
              {/* Left: Deal Info */}
              <div className="col-span-1 space-y-4 py-4 border-r pr-4">
                {/* Owner */}
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Owner</p>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={deal.owner_avatar} />
                      <AvatarFallback>{deal.owner_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{deal.owner_name}</span>
                  </div>
                </div>

                {/* Contact Info */}
                {(deal.contact_name || deal.contact_email || deal.contact_phone) && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Contact</p>
                    <div className="space-y-2">
                      {deal.contact_name && (
                        <p className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-slate-400" />
                          {deal.contact_name}
                        </p>
                      )}
                      {deal.contact_email && (
                        <p className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-slate-400" />
                          <a href={`mailto:${deal.contact_email}`} className="text-blue-600 hover:underline">
                            {deal.contact_email}
                          </a>
                        </p>
                      )}
                      {deal.contact_phone && (
                        <p className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-slate-400" />
                          {deal.contact_phone}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Close Date */}
                {deal.expected_close_date && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Expected Close</p>
                    <p className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {format(new Date(deal.expected_close_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                )}

                {/* Description */}
                {deal.description && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Description</p>
                    <p className="text-sm text-slate-700">{deal.description}</p>
                  </div>
                )}

                {/* Funding Status */}
                {deal.stage === 'closed_won' && (
                  <div className="pt-4 border-t">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Funding Status</p>
                    {deal.funding_status === 'funded' ? (
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Funded
                      </Badge>
                    ) : deal.funding_status === 'rejected' ? (
                      <Badge className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Rejected
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending Review
                      </Badge>
                    )}
                    {deal.project_id && (
                      <p className="text-xs text-slate-500 mt-2">
                        Linked to Project Track
                      </p>
                    )}
                  </div>
                )}

                {/* AI Assistant Button */}
                <div className="pt-4 border-t">
                  <Button 
                    variant="outline" 
                    className="w-full gap-2 bg-violet-50 hover:bg-violet-100 text-violet-700 border-violet-200"
                    onClick={() => setShowAIAssistant(!showAIAssistant)}
                  >
                    <Bot className="w-4 h-4" />
                    {showAIAssistant ? 'Hide AI Assistant' : 'AI Assistant'}
                  </Button>
                </div>

                {/* Actions */}
                {canEdit && (
                  <div className="pt-4 border-t space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full gap-2"
                      onClick={() => setShowEditModal(true)}
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit Deal
                    </Button>
                    {isAdmin && (
                      <Button 
                        variant="outline" 
                        className="w-full gap-2 text-red-600 hover:bg-red-50"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this deal?')) {
                            deleteMutation.mutate();
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Deal
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Right: Tabs */}
              <div className="col-span-2 py-4 flex flex-col overflow-hidden">
                {/* AI Assistant Panel */}
                {showAIAssistant && (
                  <div className="mb-4">
                    <DealAIAssistant 
                      deal={deal}
                      notes={notes}
                      activities={activities}
                      currentUser={currentUser}
                      profile={profile}
                    />
                  </div>
                )}

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                  <TabsList className="mb-4">
                    <TabsTrigger value="notes" className="gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Notes ({notes.length})
                    </TabsTrigger>
                    <TabsTrigger value="attachments" className="gap-2">
                      <Paperclip className="w-4 h-4" />
                      Files ({attachments.length})
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="gap-2">
                      <Clock className="w-4 h-4" />
                      Activity
                    </TabsTrigger>
                  </TabsList>

                  {/* Notes Tab */}
                  <TabsContent value="notes" className="flex-1 overflow-hidden flex flex-col">
                    <ScrollArea className="flex-1 pr-4">
                      <div className="space-y-4">
                        {notes.length === 0 ? (
                          <div className="text-center py-8 text-slate-400">
                            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No notes yet</p>
                          </div>
                        ) : (
                          notes.map(note => (
                            <div key={note.id} className="p-3 bg-slate-50 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarImage src={note.author_avatar} />
                                  <AvatarFallback className="text-xs">{note.author_name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium">{note.author_name}</span>
                                <span className="text-xs text-slate-400">
                                  {formatDistanceToNow(new Date(note.created_date), { addSuffix: true })}
                                </span>
                              </div>
                              <p className="text-sm text-slate-700 whitespace-pre-wrap">{note.content}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                    
                    {/* Add Note Form */}
                    <div className="pt-4 border-t mt-4">
                      <Textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Add a note..."
                        rows={2}
                        className="mb-2"
                      />
                      <Button
                        onClick={() => newNote.trim() && addNoteMutation.mutate(newNote.trim())}
                        disabled={!newNote.trim() || addNoteMutation.isPending}
                        className="bg-emerald-600 hover:bg-emerald-700 gap-2"
                      >
                        {addNoteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Add Note
                      </Button>
                    </div>
                  </TabsContent>

                  {/* Attachments Tab */}
                  <TabsContent value="attachments" className="flex-1 overflow-hidden flex flex-col">
                    <ScrollArea className="flex-1 pr-4">
                      <div className="space-y-2">
                        {attachments.length === 0 ? (
                          <div className="text-center py-8 text-slate-400">
                            <Paperclip className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No attachments yet</p>
                          </div>
                        ) : (
                          attachments.map(att => (
                            <a
                              key={att.id}
                              href={att.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                              {getFileIcon(att.file_type)}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{att.filename}</p>
                                <p className="text-xs text-slate-400">
                                  {att.uploader_name} • {formatDistanceToNow(new Date(att.created_date), { addSuffix: true })}
                                </p>
                              </div>
                            </a>
                          ))
                        )}
                      </div>
                    </ScrollArea>

                    {/* Upload Button */}
                    <div className="pt-4 border-t mt-4">
                      <label className="cursor-pointer">
                        <Button 
                          variant="outline" 
                          className="gap-2"
                          disabled={uploadingFile}
                          asChild
                        >
                          <span>
                            {uploadingFile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                            Upload File
                          </span>
                        </Button>
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleFileUpload}
                          disabled={uploadingFile}
                        />
                      </label>
                    </div>
                  </TabsContent>

                  {/* Activity Tab */}
                  <TabsContent value="activity" className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full pr-4">
                      <div className="space-y-4">
                        {activities.length === 0 ? (
                          <div className="text-center py-8 text-slate-400">
                            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No activity yet</p>
                          </div>
                        ) : (
                          activities.map(activity => (
                            <div key={activity.id} className="flex items-start gap-3">
                              <div className="mt-0.5">
                                {getActivityIcon(activity.activity_type)}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm">
                                  <span className="font-medium">{activity.actor_name}</span>
                                  {' '}
                                  <span className="text-slate-600">{activity.description}</span>
                                </p>
                                <p className="text-xs text-slate-400">
                                  {formatDistanceToNow(new Date(activity.created_date), { addSuffix: true })}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <DealFormModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        deal={deal}
        currentUser={currentUser}
        profile={profile}
        allProfiles={allProfiles}
      />
    </>
  );
}