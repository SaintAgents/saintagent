import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { 
  Check, X, Clock, MessageCircle, Shield, Eye, Share2, 
  UserPlus, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const REQUEST_TYPE_CONFIG = {
  view_metadata: { label: 'View Details', icon: Eye, color: 'bg-blue-100 text-blue-700' },
  request_intro: { label: 'Introduction', icon: MessageCircle, color: 'bg-violet-100 text-violet-700' },
  warm_intro: { label: 'Warm Intro', icon: Share2, color: 'bg-amber-100 text-amber-700' },
  direct_access: { label: 'Direct Access', icon: UserPlus, color: 'bg-emerald-100 text-emerald-700' }
};

export default function AccessRequestsPanel({ requests = [], currentUserId }) {
  const [responseNotes, setResponseNotes] = useState({});
  const queryClient = useQueryClient();

  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 500)
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['myContacts', currentUserId],
    queryFn: () => base44.entities.Contact.filter({ owner_id: currentUserId }),
    enabled: !!currentUserId
  });

  const getRequesterProfile = (requesterId) => profiles.find(p => p.user_id === requesterId);
  const getContact = (contactId) => contacts.find(c => c.id === contactId);

  const respondMutation = useMutation({
    mutationFn: async ({ requestId, status, notes }) => {
      await base44.entities.ContactAccessRequest.update(requestId, {
        status,
        owner_notes: notes,
        expires_at: status === 'approved' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null
      });

      // If approved, create notification and potentially award GGG
      const request = requests.find(r => r.id === requestId);
      if (status === 'approved' && request) {
        await base44.entities.Notification.create({
          user_id: request.requester_id,
          type: 'system',
          title: 'Access Request Approved',
          message: `Your request to access a contact has been approved.`,
          action_url: '/CRM'
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessRequests'] });
    }
  });

  const handleRespond = (requestId, status) => {
    respondMutation.mutate({
      requestId,
      status,
      notes: responseNotes[requestId] || ''
    });
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border">
        <Shield className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="font-semibold text-slate-900 mb-2">No pending requests</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          When other Saint Agents request access to your contacts, they'll appear here for review.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-3 bg-violet-50 border border-violet-200 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-violet-800">Review Carefully</p>
          <p className="text-xs text-violet-700">
            Approving access shares contact information. Consider the requester's reputation, 
            their stated purpose, and your relationship with the contact.
          </p>
        </div>
      </div>

      {requests.map(request => {
        const requesterProfile = getRequesterProfile(request.requester_id);
        const contact = getContact(request.contact_id);
        const typeConfig = REQUEST_TYPE_CONFIG[request.request_type] || REQUEST_TYPE_CONFIG.view_metadata;

        return (
          <div key={request.id} className="bg-white rounded-xl border p-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10" data-user-id={request.requester_id}>
                  <AvatarImage src={requesterProfile?.avatar_url} />
                  <AvatarFallback className="bg-violet-100 text-violet-600">
                    {requesterProfile?.display_name?.charAt(0) || 'S'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-slate-900">
                    {requesterProfile?.display_name || 'Saint Agent'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {format(new Date(request.created_date), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>

              <Badge className={cn("text-xs", typeConfig.color)}>
                <typeConfig.icon className="w-3 h-3 mr-1" />
                {typeConfig.label}
              </Badge>
            </div>

            {/* Contact Being Requested */}
            {contact && (
              <div className="p-3 bg-slate-50 rounded-lg mb-4">
                <p className="text-xs text-slate-500 mb-1">Requesting access to:</p>
                <p className="font-medium text-slate-900">{contact.name}</p>
                {contact.company && (
                  <p className="text-sm text-slate-600">{contact.role} at {contact.company}</p>
                )}
              </div>
            )}

            {/* Request Context */}
            <div className="mb-4">
              <p className="text-xs text-slate-500 mb-1">Context provided:</p>
              <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">
                "{request.context}"
              </p>
            </div>

            {/* Requester Stats */}
            {requesterProfile && (
              <div className="flex items-center gap-4 mb-4 text-xs text-slate-500">
                <span>Trust: {requesterProfile.trust_score || 0}</span>
                <span>GGG: {requesterProfile.ggg_balance || 0}</span>
                <span>Rank: {requesterProfile.rp_rank_code || 'seeker'}</span>
              </div>
            )}

            {/* Response Notes */}
            <div className="mb-4">
              <Textarea 
                placeholder="Add a note (optional)..."
                value={responseNotes[request.id] || ''}
                onChange={(e) => setResponseNotes({ ...responseNotes, [request.id]: e.target.value })}
                rows={2}
                className="text-sm"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => handleRespond(request.id, 'declined')}
                disabled={respondMutation.isPending}
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              >
                <X className="w-4 h-4 mr-1" />
                Decline
              </Button>
              <Button 
                onClick={() => handleRespond(request.id, 'approved')}
                disabled={respondMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Check className="w-4 h-4 mr-1" />
                Approve
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}