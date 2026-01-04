import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Globe, Lock, Eye, EyeOff, Star, Building2, MessageCircle,
  Users, AlertCircle, Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ContactCard from './ContactCard';

const PERMISSION_DISPLAY = {
  signal_only: { show: ['domain', 'strength'], hide: ['name', 'company', 'email'] },
  masked: { show: ['domain', 'role', 'strength'], hide: ['name', 'email'] },
  shared: { show: ['all'], hide: [] }
};

export default function FederatedGraphView({ contacts = [], currentUserId, viewMode }) {
  const [requestModal, setRequestModal] = useState(null);
  const [requestContext, setRequestContext] = useState('');
  const [requestType, setRequestType] = useState('request_intro');
  const queryClient = useQueryClient();

  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 500)
  });

  const getOwnerProfile = (ownerId) => profiles.find(p => p.user_id === ownerId);

  const requestMutation = useMutation({
    mutationFn: (data) => base44.entities.ContactAccessRequest.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessRequests'] });
      setRequestModal(null);
      setRequestContext('');
    }
  });

  const handleRequestAccess = (contact) => {
    setRequestModal(contact);
  };

  const submitRequest = () => {
    if (!requestModal || !requestContext.trim()) return;
    requestMutation.mutate({
      contact_id: requestModal.id,
      requester_id: currentUserId,
      owner_id: requestModal.owner_id,
      request_type: requestType,
      context: requestContext
    });
  };

  // Filter out own contacts and apply permission masking
  const visibleContacts = contacts
    .filter(c => c.owner_id !== currentUserId)
    .map(c => {
      const perm = PERMISSION_DISPLAY[c.permission_level] || PERMISSION_DISPLAY.signal_only;
      return {
        ...c,
        displayName: perm.hide.includes('name') ? `[${c.domain || 'Contact'}]` : c.name,
        displayCompany: perm.hide.includes('company') ? null : c.company,
        displayRole: perm.show.includes('role') ? c.role : null,
        isMasked: c.permission_level !== 'shared'
      };
    });

  if (visibleContacts.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border">
        <Globe className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="font-semibold text-slate-900 mb-2">No federated contacts yet</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          When Saint Agents share contacts to the network, they'll appear here.
          Share your own contacts to contribute to the collective intelligence.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
        <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">Trust-Gated Access</p>
          <p className="text-xs text-amber-700">
            Access to contacts is permission-based. Request introductions respectfully. 
            All actions are logged and affect your GGG score.
          </p>
        </div>
      </div>

      <div className={cn(
        viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          : "space-y-2"
      )}>
        {visibleContacts.map(contact => {
          const ownerProfile = getOwnerProfile(contact.owner_id);
          
          return (
            <div key={contact.id} className="bg-white rounded-xl border p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    {contact.isMasked ? (
                      <AvatarFallback className="bg-slate-100 text-slate-400">
                        {contact.permission_level === 'signal_only' ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      </AvatarFallback>
                    ) : (
                      <>
                        <AvatarImage src={contact.avatar_url} />
                        <AvatarFallback className="bg-violet-100 text-violet-600">
                          {contact.name?.charAt(0)}
                        </AvatarFallback>
                      </>
                    )}
                  </Avatar>
                  <div>
                    <h3 className={cn(
                      "font-semibold",
                      contact.isMasked ? "text-slate-500 italic" : "text-slate-900"
                    )}>
                      {contact.displayName}
                    </h3>
                    {contact.displayRole && (
                      <p className="text-sm text-slate-500">{contact.displayRole}</p>
                    )}
                  </div>
                </div>

                <Badge className={cn(
                  "text-xs",
                  contact.permission_level === 'shared' ? "bg-emerald-100 text-emerald-700" :
                  contact.permission_level === 'masked' ? "bg-amber-100 text-amber-700" :
                  "bg-blue-100 text-blue-700"
                )}>
                  {contact.permission_level === 'shared' ? 'Full' : 
                   contact.permission_level === 'masked' ? 'Masked' : 'Signal'}
                </Badge>
              </div>

              {/* Visible Info */}
              <div className="space-y-2 mb-3">
                {contact.displayCompany && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    {contact.displayCompany}
                  </div>
                )}
                {contact.domain && (
                  <Badge variant="outline" className="capitalize text-xs">
                    {contact.domain}
                  </Badge>
                )}
              </div>

              {/* Relationship Strength (always visible) */}
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

              {/* Owner Info */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6" data-user-id={contact.owner_id}>
                    <AvatarImage src={ownerProfile?.avatar_url} />
                    <AvatarFallback className="text-xs bg-slate-100">
                      {ownerProfile?.display_name?.charAt(0) || 'S'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-slate-500">
                    via {ownerProfile?.display_name || 'SA'}
                  </span>
                </div>

                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleRequestAccess(contact)}
                  className="text-xs"
                >
                  <MessageCircle className="w-3 h-3 mr-1" />
                  Request Access
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Request Access Modal */}
      <Dialog open={!!requestModal} onOpenChange={() => setRequestModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Access</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600">
                You're requesting access to a contact from another Saint Agent. 
                Be clear about your purpose - this affects your reputation.
              </p>
            </div>

            <div>
              <Label>Request Type</Label>
              <Select value={requestType} onValueChange={setRequestType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view_metadata">View Full Details</SelectItem>
                  <SelectItem value="request_intro">Request Introduction</SelectItem>
                  <SelectItem value="warm_intro">Request Warm Intro</SelectItem>
                  <SelectItem value="direct_access">Request Direct Access</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Context & Purpose *</Label>
              <Textarea 
                value={requestContext}
                onChange={(e) => setRequestContext(e.target.value)}
                placeholder="Explain why you need access to this contact and how it aligns with your mission..."
                rows={4}
              />
              <p className="text-xs text-slate-500 mt-1">
                This will be shared with the contact owner for review.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setRequestModal(null)}>Cancel</Button>
              <Button 
                onClick={submitRequest}
                disabled={!requestContext.trim() || requestMutation.isPending}
                className="bg-violet-600 hover:bg-violet-700"
              >
                {requestMutation.isPending ? 'Sending...' : 'Send Request'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}