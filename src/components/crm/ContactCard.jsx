import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuSeparator, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { 
  MoreVertical, Edit, Trash2, Globe, Lock, Eye, EyeOff,
  Building2, MapPin, Star, Calendar, ExternalLink, MessageCircle, Phone,
  Target, TrendingUp, Sparkles, Signal, Mail, Tag, Send, StickyNote, Telescope
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import EmailOutreachModal from './EmailOutreachModal';
import ContactNotesPopover from './ContactNotesPopover';
import DeepDiveAIModal from './DeepDiveAIModal';

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

export default function ContactCard({ contact, viewMode = 'grid', compact = false, isOwner = false, onEdit, onRequestAccess, onClick }) {
  const queryClient = useQueryClient();
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [deepDiveOpen, setDeepDiveOpen] = useState(false);
  const permConfig = PERMISSION_CONFIG[contact.permission_level] || PERMISSION_CONFIG.private;
  const PermIcon = permConfig.icon;

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 300000,
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.Contact.delete(contact.id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['myContacts'] });
      queryClient.setQueriesData({ queryKey: ['myContacts'] }, (old) =>
        old ? old.filter(c => c.id !== contact.id) : old
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['myContacts'] })
  });

  const toggleFederatedMutation = useMutation({
    mutationFn: async () => {
      const newFederated = !contact.is_federated;
      await base44.entities.Contact.update(contact.id, { 
        is_federated: newFederated,
        permission_level: newFederated ? 'signal_only' : 'private'
      });
      // Award GGG when federating for the first time
      if (newFederated && !contact.ggg_federated_awarded) {
        await base44.entities.Contact.update(contact.id, { ggg_federated_awarded: true });
        const ownerEmail = contact.owner_id;
        if (!ownerEmail) return;
        // Update contribution record
        const contribRecords = await base44.entities.CRMContribution.filter({ user_id: ownerEmail });
        let contribution = contribRecords?.[0];
        if (!contribution) {
          contribution = await base44.entities.CRMContribution.create({
            user_id: ownerEmail, federated_contacts: 1, total_ggg_earned: 0.0154
          });
        } else {
          await base44.entities.CRMContribution.update(contribution.id, {
            federated_contacts: (contribution.federated_contacts || 0) + 1,
            total_ggg_earned: (contribution.total_ggg_earned || 0) + 0.0154
          });
        }
        // Award GGG to user profile
        const userProfiles = await base44.entities.UserProfile.filter({ user_id: ownerEmail });
        const userProfile = userProfiles?.[0];
        if (userProfile) {
          const newBalance = (userProfile.ggg_balance || 0) + 0.0154;
          await base44.entities.UserProfile.update(userProfile.id, { ggg_balance: newBalance });
          await base44.entities.GGGTransaction.create({
            user_id: ownerEmail, source_type: 'reward', source_id: contact.id,
            delta: 0.0154, reason_code: 'crm_federated',
            description: 'Contact shared to federated network', balance_after: newBalance
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myContacts'] });
      queryClient.invalidateQueries({ queryKey: ['myContribution'] });
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    }
  });

  const updateFieldMutation = useMutation({
    mutationFn: ({ field, value }) => base44.entities.Contact.update(contact.id, { [field]: value }),
    onMutate: async ({ field, value }) => {
      await queryClient.cancelQueries({ queryKey: ['myContacts'] });
      queryClient.setQueriesData({ queryKey: ['myContacts'] }, (old) =>
        old ? old.map(c => c.id === contact.id ? { ...c, [field]: value } : c) : old
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['myContacts'] })
  });

  if (viewMode === 'list') {
    return (
      <div 
        className="bg-white rounded-lg border p-3 flex items-center gap-3 hover:shadow-sm transition-shadow cursor-pointer"
        onClick={onClick}
      >
        <Avatar className="w-10 h-10 shrink-0">
          <AvatarImage src={contact.avatar_url} />
          <AvatarFallback className="bg-violet-100 text-violet-600">
            {contact.name?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-900 truncate">{contact.name}</span>
            {contact.domain && <Badge className={cn("text-[10px]", DOMAIN_COLORS[contact.domain])}>{contact.domain}</Badge>}
            {contact.lead_status && <Badge variant="outline" className="text-[10px]">{contact.lead_status}</Badge>}
            {contact.priority_tier && (
              <Badge className={cn("text-[10px]", {
                'bg-red-100 text-red-700': contact.priority_tier === 'critical',
                'bg-orange-100 text-orange-700': contact.priority_tier === 'high',
                'bg-blue-100 text-blue-700': contact.priority_tier === 'medium',
                'bg-slate-100 text-slate-600': contact.priority_tier === 'low',
              })}>{contact.priority_tier}</Badge>
            )}
          </div>
          <div className="text-sm text-slate-500 truncate">
            {contact.role} {contact.company && `at ${contact.company}`}
            {contact.email && ` • ${contact.email}`}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={cn("w-3 h-3", i < (contact.relationship_strength || 0) ? "fill-amber-400 text-amber-400" : "text-slate-200")} />
          ))}
        </div>

        {contact.sentiment_label && (
          <Badge className={cn("text-[10px] shrink-0", {
            'bg-red-100 text-red-700': contact.sentiment_label === 'frustrated',
            'bg-blue-100 text-blue-700': contact.sentiment_label === 'cold',
            'bg-slate-100 text-slate-600': contact.sentiment_label === 'neutral',
            'bg-amber-100 text-amber-700': contact.sentiment_label === 'warm',
            'bg-emerald-100 text-emerald-700': contact.sentiment_label === 'hot',
          })}>{contact.sentiment_label}</Badge>
        )}

        <Badge className={cn("text-[10px] shrink-0", permConfig.color)}>
          <PermIcon className="w-3 h-3 mr-0.5" />{permConfig.label}
        </Badge>

        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {contact.email && (
                <DropdownMenuItem onClick={() => setEmailModalOpen(true)}>
                  <Send className="w-4 h-4 mr-2" /> Send Email
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={onEdit}><Edit className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleFederatedMutation.mutate()}>
                <Globe className="w-4 h-4 mr-2" />{contact.is_federated ? 'Remove from Network' : 'Share to Network'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-rose-600" onClick={e => { e.stopPropagation(); deleteMutation.mutate(); }}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <EmailOutreachModal
          open={emailModalOpen}
          onClose={() => setEmailModalOpen(false)}
          contact={contact}
          currentUser={currentUser}
        />
      </div>
    );
  }

  const InlineSelect = ({ field, value, options, icon: Icon, placeholder }) => (
    <div onClick={e => e.stopPropagation()}>
      <Select value={value || 'none'} onValueChange={v => updateFieldMutation.mutate({ field, value: v === 'none' ? null : v })}>
        <SelectTrigger className="h-7 text-xs border-dashed gap-1 px-2 min-w-0">
          {Icon && <Icon className="w-3 h-3 shrink-0 text-slate-400" />}
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">— None —</SelectItem>
          {options.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div 
      className="bg-white rounded-xl border p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={contact.avatar_url} />
            <AvatarFallback className="bg-violet-100 text-violet-600 text-lg">
              {contact.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-900 truncate">{contact.name}</h3>
            {contact.role && <p className="text-sm text-slate-500 truncate">{contact.role}</p>}
          </div>
        </div>
        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}><Edit className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleFederatedMutation.mutate()}>
                <Globe className="w-4 h-4 mr-2" />{contact.is_federated ? 'Remove from Network' : 'Share to Network'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-rose-600" onClick={e => { e.stopPropagation(); deleteMutation.mutate(); }}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Contact Info */}
      <div className="space-y-1 mb-3 text-sm">
        {contact.email && (
          <div className="flex items-center gap-2 text-slate-600 truncate">
            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" /><span className="truncate">{contact.email}</span>
          </div>
        )}
        {contact.phone && (
          <div className="flex items-center gap-2 text-slate-600">
            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />{contact.phone}
          </div>
        )}
        {contact.company && (
          <div className="flex items-center gap-2 text-slate-600 truncate">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" /><span className="truncate">{contact.company}</span>
          </div>
        )}
        {contact.location && (
          <div className="flex items-center gap-2 text-slate-600 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /><span className="truncate">{contact.location}</span>
          </div>
        )}
        {contact.last_contact_date && (
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            Last: {format(new Date(contact.last_contact_date), 'MMM d, yyyy')}
          </div>
        )}
      </div>

      {/* Quick Actions Row */}
      {isOwner && contact.email && (
        <div className="flex items-center gap-1.5 mb-2" onClick={e => e.stopPropagation()}>
          <Button
            variant="outline" size="sm"
            className="h-7 text-xs gap-1 flex-1"
            onClick={() => setEmailModalOpen(true)}
          >
            <Send className="w-3 h-3" /> Send Email
          </Button>
          {contact.email_outreach_count > 0 && (
            <Badge variant="outline" className="text-[10px] h-7 px-2 shrink-0">
              {contact.email_outreach_count} sent
            </Badge>
          )}
        </div>
      )}

      {/* Relationship Strength - clickable stars */}
      <div className="flex items-center gap-1 mb-3" onClick={e => e.stopPropagation()}>
        <span className="text-[10px] text-slate-500 mr-1">Strength:</span>
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i}
            onClick={() => updateFieldMutation.mutate({ field: 'relationship_strength', value: i + 1 })}
            className={cn(
              "w-4 h-4 cursor-pointer hover:scale-110 transition-transform",
              i < (contact.relationship_strength || 0) ? "fill-amber-400 text-amber-400" : "text-slate-200 hover:text-amber-300"
            )} 
          />
        ))}
      </div>

      {/* Inline Editable Dropdowns - 2 columns */}
      {isOwner && !compact && (
        <div className="grid grid-cols-2 gap-1.5 mb-3">
          <InlineSelect field="lead_status" value={contact.lead_status} icon={TrendingUp} placeholder="Status"
            options={[
              { value: 'new', label: 'New' }, { value: 'contacted', label: 'Contacted' },
              { value: 'qualified', label: 'Qualified' }, { value: 'proposal', label: 'Proposal' },
              { value: 'negotiation', label: 'Negotiation' }, { value: 'won', label: 'Won' },
              { value: 'lost', label: 'Lost' }, { value: 'nurturing', label: 'Nurturing' },
            ]}
          />
          <InlineSelect field="lead_source" value={contact.lead_source} icon={Signal} placeholder="Source"
            options={[
              { value: 'referral', label: 'Referral' }, { value: 'website', label: 'Website' },
              { value: 'social_media', label: 'Social Media' }, { value: 'event', label: 'Event' },
              { value: 'cold_outreach', label: 'Cold Outreach' }, { value: 'inbound', label: 'Inbound' },
              { value: 'partner', label: 'Partner' }, { value: 'advertisement', label: 'Advertisement' },
              { value: 'content', label: 'Content' },
              { value: 'friend', label: 'Friend' }, { value: 'family', label: 'Family' },
              { value: 'soul_fam', label: 'Soul-Fam' },
              { value: 'other', label: 'Other' },
            ]}
          />
          <InlineSelect field="priority_tier" value={contact.priority_tier} icon={Target} placeholder="Priority"
            options={[
              { value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' }, { value: 'critical', label: 'Critical' },
            ]}
          />
          <InlineSelect field="domain" value={contact.domain} icon={Tag} placeholder="Domain"
            options={[
              { value: 'finance', label: 'Finance' }, { value: 'tech', label: 'Tech' },
              { value: 'governance', label: 'Governance' }, { value: 'health', label: 'Health' },
              { value: 'education', label: 'Education' }, { value: 'media', label: 'Media' },
              { value: 'legal', label: 'Legal' }, { value: 'spiritual', label: 'Spiritual' },
              { value: 'creative', label: 'Creative' }, { value: 'nonprofit', label: 'Nonprofit' },
              { value: 'other', label: 'Other' },
            ]}
          />
          <InlineSelect field="sentiment_label" value={contact.sentiment_label} icon={Sparkles} placeholder="Sentiment"
            options={[
              { value: 'frustrated', label: 'Frustrated' }, { value: 'cold', label: 'Cold' },
              { value: 'neutral', label: 'Neutral' }, { value: 'warm', label: 'Warm' },
              { value: 'hot', label: 'Hot' },
            ]}
          />
          <InlineSelect field="permission_level" value={contact.permission_level} icon={Lock} placeholder="Access"
            options={[
              { value: 'private', label: 'Private' }, { value: 'signal_only', label: 'Signal Only' },
              { value: 'masked', label: 'Masked' }, { value: 'shared', label: 'Shared' },
            ]}
          />
        </div>
      )}

      {/* Notes - clickable popover for view/edit */}
      {!compact && (contact.notes || isOwner) && (
        contact.notes ? (
          <div onClick={e => e.stopPropagation()}>
            <ContactNotesPopover
              notes={contact.notes}
              isOwner={isOwner}
              onSave={(val) => updateFieldMutation.mutate({ field: 'notes', value: val })}
            />
          </div>
        ) : isOwner ? (
          <div onClick={e => e.stopPropagation()}>
            <ContactNotesPopover
              notes=""
              isOwner={true}
              onSave={(val) => updateFieldMutation.mutate({ field: 'notes', value: val })}
            />
          </div>
        ) : null
      )}

      {/* Tags */}
      <div className={cn("flex flex-wrap gap-1 mb-3", compact && "hidden")}>
        {contact.domain && (
          <Badge className={cn("text-[10px] px-1.5 py-0", DOMAIN_COLORS[contact.domain])}>
            {contact.domain}
          </Badge>
        )}
        {contact.lead_status && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">{contact.lead_status}</Badge>
        )}
        {contact.tags?.slice(0, 3).map((tag, i) => (
          <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0">{tag}</Badge>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <Badge className={cn("text-[10px]", permConfig.color)}>
            <PermIcon className="w-3 h-3 mr-0.5" />{permConfig.label}
          </Badge>
          {contact.is_federated && (
            <Badge className="bg-violet-100 text-violet-700 text-[10px]">
              <Globe className="w-3 h-3 mr-0.5" />Fed
            </Badge>
          )}
        </div>
        {contact.priority_tier && (
          <Badge className={cn("text-[10px]", {
            'bg-red-100 text-red-700': contact.priority_tier === 'critical',
            'bg-orange-100 text-orange-700': contact.priority_tier === 'high',
            'bg-blue-100 text-blue-700': contact.priority_tier === 'medium',
            'bg-slate-100 text-slate-600': contact.priority_tier === 'low',
          })}>{contact.priority_tier}</Badge>
        )}
        {!isOwner && onRequestAccess && (
          <Button size="sm" variant="outline" onClick={onRequestAccess}>
            <MessageCircle className="w-3 h-3 mr-1" />Request Intro
          </Button>
        )}
      </div>

      {/* Email Modal */}
      <EmailOutreachModal
        open={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        contact={contact}
        currentUser={currentUser}
      />
    </div>
  );
}