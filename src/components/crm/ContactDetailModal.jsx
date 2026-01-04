import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { 
  Building2, MapPin, Star, Calendar, Mail, Phone, Globe, 
  Linkedin, Twitter, ExternalLink, FileText, Tag, Lock, Eye, EyeOff,
  Edit, Trash2, Plus, Save, X, Sparkles, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const PERMISSION_CONFIG = {
  private: { label: 'Private', icon: Lock, color: 'bg-slate-100 text-slate-600' },
  signal_only: { label: 'Signal Only', icon: Eye, color: 'bg-blue-100 text-blue-600' },
  masked: { label: 'Masked', icon: EyeOff, color: 'bg-amber-100 text-amber-600' },
  shared: { label: 'Shared', icon: Globe, color: 'bg-emerald-100 text-emerald-600' }
};

const DOMAIN_COLORS = {
  finance: 'bg-emerald-100 text-emerald-700',
  tech: 'bg-blue-100 text-blue-700',
  governance: 'bg-purple-100 text-purple-700',
  health: 'bg-rose-100 text-rose-700',
  education: 'bg-amber-100 text-amber-700',
  media: 'bg-pink-100 text-pink-700',
  legal: 'bg-slate-100 text-slate-700',
  spiritual: 'bg-violet-100 text-violet-700',
  creative: 'bg-orange-100 text-orange-700',
  nonprofit: 'bg-teal-100 text-teal-700',
  other: 'bg-gray-100 text-gray-700'
};

export default function ContactDetailModal({ open, onClose, contact, onEdit, onDelete }) {
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isGeneratingNote, setIsGeneratingNote] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const queryClient = useQueryClient();

  if (!contact) return null;
  
  const isDark = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark';
  const permConfig = PERMISSION_CONFIG[contact.permission_level] || PERMISSION_CONFIG.private;
  const PermIcon = permConfig.icon;

  const updateNotesMutation = useMutation({
    mutationFn: (notes) => base44.entities.Contact.update(contact.id, { notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myContacts'] });
      setIsAddingNote(false);
      setNewNote('');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.Contact.delete(contact.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myContacts'] });
      onClose();
    }
  });

  const handleAddNote = () => {
    const existingNotes = contact.notes || '';
    const timestamp = format(new Date(), 'MMM d, yyyy');
    const updatedNotes = existingNotes 
      ? `${existingNotes}\n\n[${timestamp}]\n${newNote}`
      : `[${timestamp}]\n${newNote}`;
    updateNotesMutation.mutate(updatedNotes);
  };

  const handleGenerateAINote = async () => {
    setIsGeneratingNote(true);
    try {
      const prompt = `Based on this contact information, generate a brief professional note with potential talking points or follow-up suggestions:
Name: ${contact.name}
Role: ${contact.role || 'Unknown'}
Company: ${contact.company || 'Unknown'}
Domain: ${contact.domain || 'Unknown'}
Location: ${contact.location || 'Unknown'}
Tags: ${contact.tags?.join(', ') || 'None'}
Existing notes: ${contact.notes || 'None'}

Generate 2-3 bullet points for potential conversation starters or follow-up actions. Keep it brief and actionable.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: { type: "array", items: { type: "string" } }
          }
        }
      });
      
      if (result.suggestions) {
        setNewNote(result.suggestions.map(s => `• ${s}`).join('\n'));
      }
    } catch (err) {
      console.error('AI note generation failed:', err);
    }
    setIsGeneratingNote(false);
  };

  const handleDelete = () => {
    if (confirmDelete) {
      deleteMutation.mutate();
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto" style={isDark ? { backgroundColor: '#0f172a', borderColor: '#334155', color: '#e5e7eb' } : {}}>
        <style>{`
          [data-theme='dark'] .contact-detail-section {
            background-color: #1e293b !important;
            border-color: #334155 !important;
          }
          [data-theme='dark'] .contact-detail-label {
            color: #94a3b8 !important;
          }
          [data-theme='dark'] .contact-detail-value {
            color: #f1f5f9 !important;
          }
          [data-theme='dark'] .contact-detail-notes {
            background-color: #1e293b !important;
            color: #cbd5e1 !important;
          }
        `}</style>
        <DialogHeader>
          <DialogTitle style={isDark ? { color: '#f1f5f9' } : {}}>Contact Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Header with Avatar */}
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16 flex-shrink-0">
              <AvatarImage src={contact.avatar_url} />
              <AvatarFallback className="bg-violet-100 text-violet-600 text-xl">
                {contact.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-semibold truncate" style={isDark ? { color: '#f1f5f9' } : { color: '#0f172a' }}>
                {contact.name}
              </h2>
              {contact.role && (
                <p className="text-sm truncate" style={isDark ? { color: '#94a3b8' } : { color: '#64748b' }}>
                  {contact.role} {contact.company && `at ${contact.company}`}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {contact.domain && (
                  <Badge className={cn("text-xs", DOMAIN_COLORS[contact.domain])}>
                    {contact.domain}
                  </Badge>
                )}
                <Badge className={cn("text-xs", permConfig.color)}>
                  <PermIcon className="w-3 h-3 mr-1" />
                  {permConfig.label}
                </Badge>
              </div>
            </div>
          </div>

          {/* Relationship Strength */}
          <div className="flex items-center gap-2">
            <span className="text-sm contact-detail-label" style={isDark ? { color: '#94a3b8' } : { color: '#64748b' }}>
              Relationship:
            </span>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={cn(
                    "w-4 h-4",
                    i < (contact.relationship_strength || 0) 
                      ? "fill-amber-400 text-amber-400" 
                      : "text-slate-300"
                  )} 
                />
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-3 p-4 rounded-lg border contact-detail-section" style={isDark ? { backgroundColor: '#1e293b', borderColor: '#334155' } : { backgroundColor: '#f8fafc' }}>
            {contact.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4" style={isDark ? { color: '#64748b' } : { color: '#94a3b8' }} />
                <a href={`mailto:${contact.email}`} className="text-sm hover:underline contact-detail-value" style={isDark ? { color: '#f1f5f9' } : { color: '#0f172a' }}>
                  {contact.email}
                </a>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4" style={isDark ? { color: '#64748b' } : { color: '#94a3b8' }} />
                <a href={`tel:${contact.phone}`} className="text-sm hover:underline contact-detail-value" style={isDark ? { color: '#f1f5f9' } : { color: '#0f172a' }}>
                  {contact.phone}
                </a>
              </div>
            )}
            {contact.company && (
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4" style={isDark ? { color: '#64748b' } : { color: '#94a3b8' }} />
                <span className="text-sm contact-detail-value" style={isDark ? { color: '#f1f5f9' } : { color: '#0f172a' }}>{contact.company}</span>
              </div>
            )}
            {contact.location && (
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4" style={isDark ? { color: '#64748b' } : { color: '#94a3b8' }} />
                <span className="text-sm contact-detail-value" style={isDark ? { color: '#f1f5f9' } : { color: '#0f172a' }}>{contact.location}</span>
              </div>
            )}
          </div>

          {/* Social Links */}
          {(contact.social_links?.linkedin || contact.social_links?.twitter || contact.social_links?.website) && (
            <div className="flex flex-wrap gap-2">
              {contact.social_links?.linkedin && (
                <Button variant="outline" size="sm" asChild className="gap-2" style={isDark ? { backgroundColor: '#1e293b', borderColor: '#475569', color: '#e5e7eb' } : {}}>
                  <a href={contact.social_links.linkedin} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="w-4 h-4" /> LinkedIn
                  </a>
                </Button>
              )}
              {contact.social_links?.twitter && (
                <Button variant="outline" size="sm" asChild className="gap-2" style={isDark ? { backgroundColor: '#1e293b', borderColor: '#475569', color: '#e5e7eb' } : {}}>
                  <a href={contact.social_links.twitter} target="_blank" rel="noopener noreferrer">
                    <Twitter className="w-4 h-4" /> Twitter
                  </a>
                </Button>
              )}
              {contact.social_links?.website && (
                <Button variant="outline" size="sm" asChild className="gap-2" style={isDark ? { backgroundColor: '#1e293b', borderColor: '#475569', color: '#e5e7eb' } : {}}>
                  <a href={contact.social_links.website} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" /> Website
                  </a>
                </Button>
              )}
            </div>
          )}

          {/* Tags */}
          {contact.tags?.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4" style={isDark ? { color: '#64748b' } : { color: '#94a3b8' }} />
                <span className="text-sm contact-detail-label" style={isDark ? { color: '#94a3b8' } : { color: '#64748b' }}>Tags</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {contact.tags.map((tag, i) => (
                  <Badge key={i} variant="outline" className="text-xs" style={isDark ? { backgroundColor: '#334155', borderColor: '#475569', color: '#e5e7eb' } : {}}>
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Notes Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" style={isDark ? { color: '#64748b' } : { color: '#94a3b8' }} />
                <span className="text-sm contact-detail-label" style={isDark ? { color: '#94a3b8' } : { color: '#64748b' }}>Notes</span>
              </div>
              {!isAddingNote && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsAddingNote(true)}
                  className="h-7 text-xs gap-1"
                  style={isDark ? { color: '#e5e7eb' } : {}}
                >
                  <Plus className="w-3 h-3" /> Add Note
                </Button>
              )}
            </div>
            
            {/* Existing Notes */}
            {contact.notes && (
              <div className="p-3 rounded-lg text-sm contact-detail-notes whitespace-pre-wrap mb-3" style={isDark ? { backgroundColor: '#1e293b', color: '#cbd5e1' } : { backgroundColor: '#f8fafc', color: '#475569' }}>
                {contact.notes}
              </div>
            )}

            {/* Add Note Form */}
            {isAddingNote && (
              <div className="space-y-2 p-3 rounded-lg border" style={isDark ? { backgroundColor: '#1e293b', borderColor: '#334155' } : { backgroundColor: '#f8fafc' }}>
                <Textarea
                  placeholder="Add a note about this contact..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="min-h-[80px] text-sm"
                  style={isDark ? { backgroundColor: '#0f172a', borderColor: '#475569', color: '#e5e7eb' } : {}}
                />
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateAINote}
                    disabled={isGeneratingNote}
                    className="gap-1 text-xs"
                    style={isDark ? { backgroundColor: '#334155', borderColor: '#475569', color: '#e5e7eb' } : {}}
                  >
                    {isGeneratingNote ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3 text-amber-500" />
                    )}
                    AI Suggest
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setIsAddingNote(false); setNewNote(''); }}
                      className="h-7 text-xs"
                      style={isDark ? { color: '#e5e7eb' } : {}}
                    >
                      <X className="w-3 h-3 mr-1" /> Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleAddNote}
                      disabled={!newNote.trim() || updateNotesMutation.isPending}
                      className="h-7 text-xs bg-violet-600 hover:bg-violet-700"
                    >
                      <Save className="w-3 h-3 mr-1" /> Save
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {!contact.notes && !isAddingNote && (
              <div className="p-3 rounded-lg text-sm text-center" style={isDark ? { backgroundColor: '#1e293b', color: '#64748b' } : { backgroundColor: '#f8fafc', color: '#94a3b8' }}>
                No notes yet
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs pt-3 border-t" style={isDark ? { borderColor: '#334155', color: '#64748b' } : { color: '#94a3b8' }}>
            <span>Added {contact.created_date && format(new Date(contact.created_date), 'MMM d, yyyy')}</span>
            {contact.is_federated && (
              <Badge className="bg-violet-100 text-violet-700 text-xs">
                <Globe className="w-3 h-3 mr-1" /> Federated
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-2 border-t" style={isDark ? { borderColor: '#334155' } : {}}>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleDelete}
              className={cn(
                "gap-1 text-xs",
                confirmDelete ? "text-white bg-rose-600 hover:bg-rose-700" : "text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              )}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="w-3 h-3" />
              {confirmDelete ? 'Confirm Delete' : 'Delete'}
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onClose} style={isDark ? { backgroundColor: '#1e293b', borderColor: '#475569', color: '#e5e7eb' } : {}}>
                Close
              </Button>
              {onEdit && (
                <Button 
                  size="sm"
                  onClick={() => { onClose(); onEdit(contact); }} 
                  className="bg-violet-600 hover:bg-violet-700 text-white gap-1"
                >
                  <Edit className="w-3 h-3" /> Edit
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}