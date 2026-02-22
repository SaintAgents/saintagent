import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Mail, Search, Filter, Eye, MousePointer, Reply, AlertCircle,
  CheckCircle, Clock, TrendingUp, Send, Calendar, ChevronDown, ChevronUp
} from 'lucide-react';
import { format, parseISO, subDays } from 'date-fns';
import { cn } from '@/lib/utils';

const STATUS_CONFIG = {
  sent: { label: 'Sent', icon: Send, color: 'bg-blue-100 text-blue-700' },
  delivered: { label: 'Delivered', icon: CheckCircle, color: 'bg-cyan-100 text-cyan-700' },
  opened: { label: 'Opened', icon: Eye, color: 'bg-emerald-100 text-emerald-700' },
  clicked: { label: 'Clicked', icon: MousePointer, color: 'bg-violet-100 text-violet-700' },
  replied: { label: 'Replied', icon: Reply, color: 'bg-green-100 text-green-700' },
  bounced: { label: 'Bounced', icon: AlertCircle, color: 'bg-amber-100 text-amber-700' },
  failed: { label: 'Failed', icon: AlertCircle, color: 'bg-rose-100 text-rose-700' }
};

const TEMPLATE_LABELS = {
  intro: 'Introduction',
  followup: 'Follow Up',
  meeting: 'Meeting Request',
  value: 'Value Proposition',
  custom: 'Custom',
  ai_generated: 'AI Generated'
};

export default function EmailCampaignHistory({ currentUserId, contacts = [] }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [templateFilter, setTemplateFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['emailCampaigns', currentUserId],
    queryFn: () => base44.entities.EmailCampaign.filter({ owner_id: currentUserId }, '-sent_at', 200),
    enabled: !!currentUserId
  });

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!campaigns.length) return { total: 0, opened: 0, clicked: 0, replied: 0, openRate: 0, clickRate: 0, replyRate: 0 };
    
    const total = campaigns.length;
    const opened = campaigns.filter(c => c.status === 'opened' || c.status === 'clicked' || c.status === 'replied').length;
    const clicked = campaigns.filter(c => c.status === 'clicked' || c.status === 'replied').length;
    const replied = campaigns.filter(c => c.status === 'replied').length;
    
    return {
      total,
      opened,
      clicked,
      replied,
      openRate: Math.round((opened / total) * 100),
      clickRate: Math.round((clicked / total) * 100),
      replyRate: Math.round((replied / total) * 100)
    };
  }, [campaigns]);

  // Filter campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(campaign => {
      const matchesSearch = !search || 
        campaign.contact_name?.toLowerCase().includes(search.toLowerCase()) ||
        campaign.subject?.toLowerCase().includes(search.toLowerCase()) ||
        campaign.contact_email?.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
      const matchesTemplate = templateFilter === 'all' || campaign.template_used === templateFilter;
      
      let matchesDate = true;
      if (dateFilter !== 'all' && campaign.sent_at) {
        const sentDate = parseISO(campaign.sent_at);
        const daysAgo = parseInt(dateFilter);
        matchesDate = sentDate >= subDays(new Date(), daysAgo);
      }
      
      return matchesSearch && matchesStatus && matchesTemplate && matchesDate;
    });
  }, [campaigns, search, statusFilter, templateFilter, dateFilter]);

  // Get contact details
  const getContact = (contactId) => contacts.find(c => c.id === contactId);

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Sent</p>
                <p className="text-2xl font-bold text-blue-900">{metrics.total}</p>
              </div>
              <Send className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600 font-medium">Open Rate</p>
                <p className="text-2xl font-bold text-emerald-900">{metrics.openRate}%</p>
              </div>
              <Eye className="w-8 h-8 text-emerald-400" />
            </div>
            <p className="text-xs text-emerald-600 mt-1">{metrics.opened} opened</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-violet-600 font-medium">Click Rate</p>
                <p className="text-2xl font-bold text-violet-900">{metrics.clickRate}%</p>
              </div>
              <MousePointer className="w-8 h-8 text-violet-400" />
            </div>
            <p className="text-xs text-violet-600 mt-1">{metrics.clicked} clicked</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600 font-medium">Reply Rate</p>
                <p className="text-2xl font-bold text-amber-900">{metrics.replyRate}%</p>
              </div>
              <Reply className="w-8 h-8 text-amber-400" />
            </div>
            <p className="text-xs text-amber-600 mt-1">{metrics.replied} replies</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="w-4 h-4 text-violet-500" />
            Email Campaign History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by name, email, or subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="opened">Opened</SelectItem>
                <SelectItem value="clicked">Clicked</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
                <SelectItem value="bounced">Bounced</SelectItem>
              </SelectContent>
            </Select>
            <Select value={templateFilter} onValueChange={setTemplateFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Templates</SelectItem>
                <SelectItem value="intro">Introduction</SelectItem>
                <SelectItem value="followup">Follow Up</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="value">Value Prop</SelectItem>
                <SelectItem value="ai_generated">AI Generated</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Campaign List */}
          {isLoading ? (
            <div className="py-8 text-center text-slate-400">Loading campaigns...</div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              <Mail className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No email campaigns found</p>
              <p className="text-sm mt-1">Send emails to contacts to see them here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredCampaigns.map(campaign => {
                const StatusIcon = STATUS_CONFIG[campaign.status]?.icon || Send;
                const statusConfig = STATUS_CONFIG[campaign.status] || STATUS_CONFIG.sent;
                const isExpanded = expandedId === campaign.id;
                const contact = getContact(campaign.contact_id);

                return (
                  <div 
                    key={campaign.id}
                    className={cn(
                      "border rounded-lg transition-all",
                      isExpanded ? "border-violet-200 bg-violet-50/30" : "border-slate-200 hover:border-slate-300"
                    )}
                  >
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : campaign.id)}
                      className="w-full p-4 flex items-center gap-4 text-left"
                    >
                      <Avatar className="w-10 h-10 shrink-0">
                        <AvatarImage src={contact?.avatar_url} />
                        <AvatarFallback className="bg-violet-100 text-violet-600">
                          {campaign.contact_name?.charAt(0) || 'E'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900 truncate">{campaign.contact_name}</p>
                          <Badge className={cn("text-xs shrink-0", statusConfig.color)}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 truncate">{campaign.subject}</p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <Badge variant="outline" className="text-xs">
                          {TEMPLATE_LABELS[campaign.template_used] || 'Custom'}
                        </Badge>
                        <span className="text-xs text-slate-400">
                          {campaign.sent_at && format(parseISO(campaign.sent_at), 'MMM d, h:mm a')}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-2 border-t border-slate-100">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-slate-500">Sent</p>
                            <p className="text-sm font-medium">
                              {campaign.sent_at ? format(parseISO(campaign.sent_at), 'MMM d, yyyy h:mm a') : 'N/A'}
                            </p>
                          </div>
                          {campaign.opened_at && (
                            <div>
                              <p className="text-xs text-slate-500">Opened</p>
                              <p className="text-sm font-medium">
                                {format(parseISO(campaign.opened_at), 'MMM d, h:mm a')}
                              </p>
                            </div>
                          )}
                          {campaign.clicked_at && (
                            <div>
                              <p className="text-xs text-slate-500">Clicked</p>
                              <p className="text-sm font-medium">
                                {format(parseISO(campaign.clicked_at), 'MMM d, h:mm a')}
                              </p>
                            </div>
                          )}
                          {campaign.replied_at && (
                            <div>
                              <p className="text-xs text-slate-500">Replied</p>
                              <p className="text-sm font-medium">
                                {format(parseISO(campaign.replied_at), 'MMM d, h:mm a')}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="bg-white border rounded-lg p-3">
                          <p className="text-xs text-slate-500 mb-1">Email Content:</p>
                          <p className="text-sm text-slate-700 whitespace-pre-wrap line-clamp-4">
                            {campaign.body}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 mt-3">
                          {campaign.lead_source && (
                            <Badge variant="outline" className="text-xs">
                              Source: {campaign.lead_source}
                            </Badge>
                          )}
                          {campaign.domain && (
                            <Badge variant="outline" className="text-xs">
                              {campaign.domain}
                            </Badge>
                          )}
                          {campaign.deal_value > 0 && (
                            <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                              Deal: ${campaign.deal_value.toLocaleString()}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}