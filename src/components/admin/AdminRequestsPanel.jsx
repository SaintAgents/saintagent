import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Inbox, Check, X, Clock, AlertCircle, MessageSquare, Target, 
  Award, Shield, Loader2, ExternalLink, Filter, Search, Coins
} from "lucide-react";
import { format } from "date-fns";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const REQUEST_TYPE_CONFIG = {
  mission_ggg_approval: {
    label: 'Mission GGG Approval',
    icon: Coins,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100'
  },
  badge_request: {
    label: 'Badge Request',
    icon: Award,
    color: 'text-violet-600',
    bgColor: 'bg-violet-100'
  },
  role_request: {
    label: 'Role Request',
    icon: Shield,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  feature_request: {
    label: 'Feature Request',
    icon: MessageSquare,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100'
  },
  deal_approval: {
    label: 'Deal Approval',
    icon: Target,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100'
  },
  other: {
    label: 'Other',
    icon: Inbox,
    color: 'text-slate-600',
    bgColor: 'bg-slate-100'
  }
};

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Approved', color: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
  needs_info: { label: 'Needs Info', color: 'bg-blue-100 text-blue-700' }
};

function RequestCard({ request, onAction }) {
  const config = REQUEST_TYPE_CONFIG[request.request_type] || REQUEST_TYPE_CONFIG.other;
  const Icon = config.icon;
  const statusConfig = STATUS_CONFIG[request.status];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={`p-2 rounded-lg ${config.bgColor}`}>
            <Icon className={`w-5 h-5 ${config.color}`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-medium text-slate-900">{request.title}</h3>
                <p className="text-sm text-slate-500 mt-0.5">{request.description}</p>
              </div>
              <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
            </div>

            <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <Avatar className="w-5 h-5">
                  <AvatarImage src={request.requester_avatar} />
                  <AvatarFallback className="text-[10px]">
                    {request.requester_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span>{request.requester_name}</span>
              </div>
              <span>•</span>
              <span>{format(new Date(request.created_date), 'MMM d, yyyy')}</span>
              {request.priority === 'urgent' && (
                <>
                  <span>•</span>
                  <Badge variant="destructive" className="text-[10px]">URGENT</Badge>
                </>
              )}
            </div>

            {/* Requested Values */}
            {request.requested_value && (
              <div className="mt-3 p-2 bg-slate-50 rounded-lg">
                <p className="text-xs font-medium text-slate-500 mb-1">Requested:</p>
                <div className="flex flex-wrap gap-2">
                  {request.requested_value.ggg && (
                    <Badge variant="secondary" className="gap-1">
                      <Coins className="w-3 h-3" />
                      {request.requested_value.ggg} GGG
                    </Badge>
                  )}
                  {request.requested_value.badge && (
                    <Badge variant="secondary" className="gap-1">
                      <Award className="w-3 h-3" />
                      {request.requested_value.badge}
                    </Badge>
                  )}
                  {request.requested_value.role && (
                    <Badge variant="secondary" className="gap-1">
                      <Shield className="w-3 h-3" />
                      {request.requested_value.role}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Reference Link */}
            {request.reference_type === 'mission' && request.reference_id && (
              <Link 
                to={createPageUrl('MissionDetail') + `?id=${request.reference_id}`}
                className="inline-flex items-center gap-1 mt-2 text-sm text-violet-600 hover:text-violet-700"
              >
                <Target className="w-3 h-3" />
                View Mission
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}
            {request.reference_type === 'deal' && request.reference_id && (
              <Link 
                to={createPageUrl('Deals')}
                className="inline-flex items-center gap-1 mt-2 text-sm text-cyan-600 hover:text-cyan-700"
              >
                <Target className="w-3 h-3" />
                View Deal Tracker
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}

            {/* Actions for pending requests */}
            {request.status === 'pending' && (
              <div className="flex items-center gap-2 mt-4 pt-3 border-t">
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => onAction(request, 'approved')}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onAction(request, 'rejected')}
                >
                  <X className="w-4 h-4 mr-1" />
                  Reject
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAction(request, 'needs_info')}
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Request Info
                </Button>
              </div>
            )}

            {/* Admin note if exists */}
            {request.admin_note && (
              <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs font-medium text-blue-700">Admin Note:</p>
                <p className="text-sm text-blue-600">{request.admin_note}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminRequestsPanel() {
  const [statusFilter, setStatusFilter] = useState('pending');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionDialog, setActionDialog] = useState(null);
  const [adminNote, setAdminNote] = useState('');

  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['adminRequests'],
    queryFn: () => base44.entities.AdminRequest.list('-created_date', 200)
  });

  const updateMutation = useMutation({
    mutationFn: async ({ requestId, status, note }) => {
      const updateData = {
        status,
        admin_note: note,
        reviewed_by: currentUser?.email,
        reviewed_at: new Date().toISOString()
      };

      // Update the request
      await base44.entities.AdminRequest.update(requestId, updateData);

      // If this is a mission GGG approval, also update the mission
      const request = requests.find(r => r.id === requestId);
      if (request?.request_type === 'mission_ggg_approval' && request?.reference_id) {
        await base44.entities.Mission.update(request.reference_id, {
          ggg_approval_status: status,
          ggg_approval_note: note,
          status: status === 'approved' ? 'active' : 'pending_approval'
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminRequests'] });
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      setActionDialog(null);
      setAdminNote('');
    }
  });

  const handleAction = (request, action) => {
    if (action === 'approved') {
      // Quick approve without dialog
      updateMutation.mutate({ requestId: request.id, status: 'approved', note: '' });
    } else {
      // Show dialog for reject/needs_info
      setActionDialog({ request, action });
    }
  };

  const confirmAction = () => {
    if (!actionDialog) return;
    updateMutation.mutate({
      requestId: actionDialog.request.id,
      status: actionDialog.action,
      note: adminNote
    });
  };

  // Filter requests
  const filteredRequests = requests.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (typeFilter !== 'all' && r.request_type !== typeFilter) return false;
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      return r.title?.toLowerCase().includes(search) ||
             r.description?.toLowerCase().includes(search) ||
             r.requester_name?.toLowerCase().includes(search);
    }
    return true;
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Inbox className="w-5 h-5 text-violet-600" />
                Admin Requests
                {pendingCount > 0 && (
                  <Badge variant="destructive">{pendingCount} pending</Badge>
                )}
              </CardTitle>
              <CardDescription>Review and manage user requests</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="needs_info">Needs Info</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="mission_ggg_approval">Mission GGG</SelectItem>
                <SelectItem value="badge_request">Badge</SelectItem>
                <SelectItem value="role_request">Role</SelectItem>
                <SelectItem value="feature_request">Feature</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {Object.entries(STATUS_CONFIG).map(([status, config]) => {
              const count = requests.filter(r => r.status === status).length;
              return (
                <Card key={status} className="cursor-pointer hover:shadow-sm" onClick={() => setStatusFilter(status)}>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-sm text-slate-500">{config.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Requests List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No requests found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map(request => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onAction={handleAction}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={!!actionDialog} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog?.action === 'rejected' ? 'Reject Request' : 'Request More Information'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-slate-600">
              {actionDialog?.action === 'rejected'
                ? 'Please provide a reason for rejecting this request:'
                : 'What additional information do you need?'}
            </p>
            <Textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder={actionDialog?.action === 'rejected' 
                ? 'Reason for rejection...'
                : 'What information is needed...'}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>
              Cancel
            </Button>
            <Button
              onClick={confirmAction}
              disabled={updateMutation.isPending}
              className={actionDialog?.action === 'rejected' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {actionDialog?.action === 'rejected' ? 'Reject' : 'Send'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}