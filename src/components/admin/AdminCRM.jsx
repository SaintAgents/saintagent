import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, Search, Trash2, Eye, Globe, Lock, 
  Share2, TrendingUp, ArrowRight, CheckCircle, XCircle,
  Clock, User, Building, Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export default function AdminCRM() {
  const [tab, setTab] = useState('contacts');
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  // Fetch all contacts
  const { data: allContacts = [], isLoading: loadingContacts } = useQuery({
    queryKey: ['adminContacts'],
    queryFn: () => base44.entities.Contact.list('-created_date', 500)
  });

  // Fetch all introductions
  const { data: allIntroductions = [], isLoading: loadingIntros } = useQuery({
    queryKey: ['adminIntroductions'],
    queryFn: () => base44.entities.Introduction.list('-created_date', 500)
  });

  // Fetch all access requests
  const { data: allAccessRequests = [] } = useQuery({
    queryKey: ['adminAccessRequests'],
    queryFn: () => base44.entities.ContactAccessRequest.list('-created_date', 200)
  });

  // Fetch CRM contributions
  const { data: allContributions = [] } = useQuery({
    queryKey: ['adminCRMContributions'],
    queryFn: () => base44.entities.CRMContribution.list('-ggg_earned_crm', 100)
  });

  // Delete contact mutation
  const deleteContactMutation = useMutation({
    mutationFn: (id) => base44.entities.Contact.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminContacts'] })
  });

  // Delete introduction mutation
  const deleteIntroMutation = useMutation({
    mutationFn: (id) => base44.entities.Introduction.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminIntroductions'] })
  });

  // Filter contacts
  const filteredContacts = allContacts.filter(c => {
    const q = search.toLowerCase();
    return !q || 
      c.name?.toLowerCase().includes(q) ||
      c.company?.toLowerCase().includes(q) ||
      c.owner_id?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q);
  });

  // Filter introductions
  const filteredIntros = allIntroductions.filter(i => {
    const q = search.toLowerCase();
    return !q ||
      i.contact_name?.toLowerCase().includes(q) ||
      i.introducer_id?.toLowerCase().includes(q) ||
      i.recipient_id?.toLowerCase().includes(q);
  });

  // Stats
  const totalContacts = allContacts.length;
  const federatedContacts = allContacts.filter(c => c.is_federated).length;
  const totalIntros = allIntroductions.length;
  const successfulIntros = allIntroductions.filter(i => i.status === 'connected').length;
  const pendingRequests = allAccessRequests.filter(r => r.status === 'pending').length;
  const topContributor = allContributions[0];

  const PERMISSION_STYLES = {
    private: { icon: Lock, color: 'text-slate-500', bg: 'bg-slate-100' },
    signal_only: { icon: Eye, color: 'text-blue-500', bg: 'bg-blue-100' },
    masked: { icon: User, color: 'text-amber-500', bg: 'bg-amber-100' },
    shared: { icon: Globe, color: 'text-emerald-500', bg: 'bg-emerald-100' }
  };

  const INTRO_STATUS_STYLES = {
    pending: { color: 'bg-slate-100 text-slate-700', icon: Clock },
    sent: { color: 'bg-blue-100 text-blue-700', icon: ArrowRight },
    connected: { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
    declined: { color: 'bg-rose-100 text-rose-700', icon: XCircle },
    no_response: { color: 'bg-amber-100 text-amber-700', icon: Clock }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-slate-900">{totalContacts}</div>
            <div className="text-sm text-slate-500">Total Contacts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-emerald-600">{federatedContacts}</div>
            <div className="text-sm text-slate-500">Federated</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-violet-600">{totalIntros}</div>
            <div className="text-sm text-slate-500">Introductions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">{successfulIntros}</div>
            <div className="text-sm text-slate-500">Connected</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-amber-600">{pendingRequests}</div>
            <div className="text-sm text-slate-500">Pending Requests</div>
          </CardContent>
        </Card>
      </div>

      {/* Top Contributor */}
      {topContributor && (
        <Card className="bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-100">
                  <TrendingUp className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Top CRM Contributor</div>
                  <div className="text-sm text-slate-600">{topContributor.user_id}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-violet-600">{topContributor.ggg_earned_crm || 0} GGG</div>
                <div className="text-xs text-slate-500">{topContributor.successful_connections || 0} connections</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search contacts, introductions..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="contacts" className="gap-2">
            <Users className="w-4 h-4" />
            Contacts ({filteredContacts.length})
          </TabsTrigger>
          <TabsTrigger value="introductions" className="gap-2">
            <Share2 className="w-4 h-4" />
            Introductions ({filteredIntros.length})
          </TabsTrigger>
          <TabsTrigger value="contributions" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Contributions ({allContributions.length})
          </TabsTrigger>
        </TabsList>

        {/* Contacts Tab */}
        <TabsContent value="contacts" className="mt-4">
          {loadingContacts ? (
            <div className="space-y-2">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-16 bg-white rounded-lg border animate-pulse" />
              ))}
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No contacts found</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Contact</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Owner</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Domain</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Permission</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Strength</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredContacts.slice(0, 50).map(contact => {
                    const perm = PERMISSION_STYLES[contact.permission_level] || PERMISSION_STYLES.private;
                    const PermIcon = perm.icon;
                    return (
                      <tr key={contact.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium">
                              {contact.name?.charAt(0) || '?'}
                            </div>
                            <div>
                              <div className="font-medium text-slate-900">{contact.name}</div>
                              {contact.company && (
                                <div className="text-xs text-slate-500 flex items-center gap-1">
                                  <Building className="w-3 h-3" />
                                  {contact.company}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-slate-600">{contact.owner_id}</div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="capitalize text-xs">
                            {contact.domain || 'other'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={cn("text-xs", perm.bg, perm.color)}>
                            <PermIcon className="w-3 h-3 mr-1" />
                            {contact.permission_level || 'private'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {[1,2,3,4,5].map(s => (
                              <div 
                                key={s} 
                                className={cn(
                                  "w-2 h-2 rounded-full",
                                  s <= (contact.relationship_strength || 3) ? "bg-violet-500" : "bg-slate-200"
                                )}
                              />
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                            onClick={() => deleteContactMutation.mutate(contact.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredContacts.length > 50 && (
                <div className="px-4 py-3 bg-slate-50 border-t text-center text-sm text-slate-500">
                  Showing 50 of {filteredContacts.length} contacts
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Introductions Tab */}
        <TabsContent value="introductions" className="mt-4">
          {loadingIntros ? (
            <div className="space-y-2">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-16 bg-white rounded-lg border animate-pulse" />
              ))}
            </div>
          ) : filteredIntros.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border">
              <Share2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No introductions found</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Contact</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Introducer</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Recipient</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">GGG</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Created</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredIntros.slice(0, 50).map(intro => {
                    const statusStyle = INTRO_STATUS_STYLES[intro.status] || INTRO_STATUS_STYLES.pending;
                    const StatusIcon = statusStyle.icon;
                    return (
                      <tr key={intro.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{intro.contact_name || 'Unknown'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-slate-600">{intro.introducer_id}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-slate-600">{intro.recipient_id}</div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={cn("text-xs", statusStyle.color)}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {intro.status || 'pending'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-amber-600">
                            {intro.ggg_awarded || 0}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-slate-500">
                            {intro.created_date ? formatDistanceToNow(new Date(intro.created_date), { addSuffix: true }) : '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                            onClick={() => deleteIntroMutation.mutate(intro.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredIntros.length > 50 && (
                <div className="px-4 py-3 bg-slate-50 border-t text-center text-sm text-slate-500">
                  Showing 50 of {filteredIntros.length} introductions
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Contributions Tab */}
        <TabsContent value="contributions" className="mt-4">
          {allContributions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border">
              <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No CRM contributions yet</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">User</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Contacts</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Federated</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Intros Made</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Connections</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Avg Rating</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">GGG Earned</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {allContributions.map(contrib => (
                    <tr key={contrib.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{contrib.user_id}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">{contrib.total_contacts || 0}</td>
                      <td className="px-4 py-3 text-sm">{contrib.federated_contacts || 0}</td>
                      <td className="px-4 py-3 text-sm">{contrib.introductions_made || 0}</td>
                      <td className="px-4 py-3 text-sm text-emerald-600 font-medium">{contrib.successful_connections || 0}</td>
                      <td className="px-4 py-3 text-sm">
                        {contrib.avg_intro_rating ? contrib.avg_intro_rating.toFixed(1) : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-amber-600">{contrib.ggg_earned_crm || 0}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="capitalize text-xs">
                          {contrib.contribution_tier || 'observer'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}