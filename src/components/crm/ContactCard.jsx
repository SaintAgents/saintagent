import React from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuSeparator, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  MoreVertical, Edit, Trash2, Globe, Lock, Eye, EyeOff,
  Building2, MapPin, Star, Calendar, ExternalLink, MessageCircle, Phone
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

export default function ContactCard({ contact, viewMode = 'grid', isOwner = false, onEdit, onRequestAccess, onClick }) {
  const queryClient = useQueryClient();
  const permConfig = PERMISSION_CONFIG[contact.permission_level] || PERMISSION_CONFIG.private;
  const PermIcon = permConfig.icon;

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.Contact.delete(contact.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myContacts'] })
  });

  const toggleFederatedMutation = useMutation({
    mutationFn: () => base44.entities.Contact.update(contact.id, { 
      is_federated: !contact.is_federated,
      permission_level: !contact.is_federated ? 'signal_only' : 'private'
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myContacts'] })
  });

  if (viewMode === 'list') {
    return (
      <div 
        className="bg-white rounded-lg border p-3 flex items-center gap-4 hover:shadow-sm transition-shadow cursor-pointer"
        onClick={onClick}
      >
        <Avatar className="w-10 h-10">
          <AvatarImage src={contact.avatar_url} />
          <AvatarFallback className="bg-violet-100 text-violet-600">
            {contact.name?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-900 truncate">{contact.name}</span>
            {contact.domain && (
              <Badge className={cn("text-xs", DOMAIN_COLORS[contact.domain])}>
                {contact.domain}
              </Badge>
            )}
          </div>
          <div className="text-sm text-slate-500 truncate">
            {contact.role} {contact.company && `at ${contact.company}`}
          </div>
          {contact.phone && (
            <div className="text-xs text-slate-400 truncate flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {contact.phone}
            </div>
          )}
          </div>

          <div className="flex items-center gap-2">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={cn(
                "w-3 h-3",
                i < (contact.relationship_strength || 0) 
                  ? "fill-amber-400 text-amber-400" 
                  : "text-slate-200"
              )} 
            />
          ))}
        </div>

        <Badge className={cn("text-xs", permConfig.color)}>
          <PermIcon className="w-3 h-3 mr-1" />
          {permConfig.label}
        </Badge>

        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleFederatedMutation.mutate()}>
                <Globe className="w-4 h-4 mr-2" />
                {contact.is_federated ? 'Remove from Network' : 'Share to Network'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-rose-600"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteMutation.mutate();
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    );
  }

  return (
    <div 
      className="bg-white rounded-xl border p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={contact.avatar_url} />
            <AvatarFallback className="bg-violet-100 text-violet-600 text-lg">
              {contact.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-slate-900">{contact.name}</h3>
            {contact.role && (
              <p className="text-sm text-slate-500">{contact.role}</p>
            )}
          </div>
        </div>
        
        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleFederatedMutation.mutate()}>
                <Globe className="w-4 h-4 mr-2" />
                {contact.is_federated ? 'Remove from Network' : 'Share to Network'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-rose-600"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteMutation.mutate();
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="space-y-2 mb-3">
        {contact.phone && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Phone className="w-4 h-4 text-slate-400" />
            {contact.phone}
          </div>
        )}
        {contact.company && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Building2 className="w-4 h-4 text-slate-400" />
            {contact.company}
          </div>
        )}
        {contact.location && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin className="w-4 h-4 text-slate-400" />
            {contact.location}
          </div>
        )}
        {contact.last_contact_date && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Calendar className="w-4 h-4 text-slate-400" />
            Last contact: {format(new Date(contact.last_contact_date), 'MMM d, yyyy')}
          </div>
        )}
      </div>

      {/* Relationship Strength */}
      <div className="flex items-center gap-1 mb-3">
        <span className="text-xs text-slate-500 mr-2">Strength:</span>
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={cn(
              "w-4 h-4",
              i < (contact.relationship_strength || 0) 
                ? "fill-amber-400 text-amber-400" 
                : "text-slate-200"
            )} 
          />
        ))}
      </div>

      {/* Tags & Domain */}
      <div className="flex flex-wrap gap-2 mb-3">
        {contact.domain && (
          <Badge className={cn("text-xs", DOMAIN_COLORS[contact.domain])}>
            {contact.domain}
          </Badge>
        )}
        {contact.tags?.slice(0, 3).map((tag, i) => (
          <Badge key={i} variant="outline" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>

      {/* Permission Badge & Federated Status */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <Badge className={cn("text-xs", permConfig.color)}>
          <PermIcon className="w-3 h-3 mr-1" />
          {permConfig.label}
        </Badge>
        
        {contact.is_federated && (
          <Badge className="bg-violet-100 text-violet-700 text-xs">
            <Globe className="w-3 h-3 mr-1" />
            Federated
          </Badge>
        )}

        {!isOwner && onRequestAccess && (
          <Button size="sm" variant="outline" onClick={onRequestAccess}>
            <MessageCircle className="w-3 h-3 mr-1" />
            Request Intro
          </Button>
        )}
      </div>
    </div>
  );
}