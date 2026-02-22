import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, Target, TrendingUp, DollarSign, ExternalLink, 
  Globe, Building, Mail, Phone, Star, ArrowRight
} from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function MyContactsTab({ currentUser, profile }) {
  const [showContactNetwork, setShowContactNetwork] = useState(true);
  const [showDealTracking, setShowDealTracking] = useState(true);

  // Fetch user's contacts
  const { data: contacts = [] } = useQuery({
    queryKey: ['myContacts', currentUser?.email],
    queryFn: () => base44.entities.Contact.filter({ owner_id: currentUser.email }, '-created_date', 100),
    enabled: !!currentUser?.email
  });

  // Fetch user's deals
  const { data: deals = [] } = useQuery({
    queryKey: ['myDeals', currentUser?.email],
    queryFn: () => base44.entities.Deal.filter({ owner_id: currentUser.email }, '-created_date', 100),
    enabled: !!currentUser?.email
  });

  // Calculate contact metrics
  const contactMetrics = {
    total: contacts.length,
    federated: contacts.filter(c => c.is_federated).length,
    highQuality: contacts.filter(c => (c.quality_score || 0) >= 70).length,
    recentlyAdded: contacts.filter(c => {
      if (!c.created_date) return false;
      const dayAgo = new Date();
      dayAgo.setDate(dayAgo.getDate() - 7);
      return new Date(c.created_date) > dayAgo;
    }).length
  };

  // Calculate deal metrics
  const dealMetrics = {
    total: deals.length,
    active: deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage)).length,
    won: deals.filter(d => d.stage === 'closed_won').length,
    pipelineValue: deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage))
      .reduce((sum, d) => sum + (d.amount || 0), 0),
    wonValue: deals.filter(d => d.stage === 'closed_won')
      .reduce((sum, d) => sum + (d.amount || 0), 0)
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  return (
    <div className="space-y-6">
      {/* Section Toggles */}
      <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="w-4 h-4 text-violet-600" />
            CRM Dashboard Sections
          </CardTitle>
          <CardDescription>
            Toggle which CRM sections to display on your profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <Label htmlFor="contact-network">Contact Network</Label>
                <p className="text-xs text-slate-500">Display your contact network summary</p>
              </div>
            </div>
            <Switch
              id="contact-network"
              checked={showContactNetwork}
              onCheckedChange={setShowContactNetwork}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <div>
                <Label htmlFor="deal-tracking">Deal Tracking</Label>
                <p className="text-xs text-slate-500">Track personal deals (no admin approval required)</p>
              </div>
            </div>
            <Switch
              id="deal-tracking"
              checked={showDealTracking}
              onCheckedChange={setShowDealTracking}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Network Section */}
      {showContactNetwork && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                My Contact Network
              </CardTitle>
              <CardDescription>Your personal CRM contacts</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = createPageUrl('CRM')}
              className="gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Open CRM
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-700">{contactMetrics.total}</p>
                <p className="text-xs text-blue-600">Total Contacts</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-emerald-700">{contactMetrics.highQuality}</p>
                <p className="text-xs text-emerald-600">High Quality</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-amber-700">{contactMetrics.federated}</p>
                <p className="text-xs text-amber-600">Federated</p>
              </div>
              <div className="p-4 bg-violet-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-violet-700">+{contactMetrics.recentlyAdded}</p>
                <p className="text-xs text-violet-600">This Week</p>
              </div>
            </div>

            {/* Recent Contacts Preview */}
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-3">Recent Contacts</h4>
              <div className="space-y-2">
                {contacts.slice(0, 5).map(contact => (
                  <div key={contact.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-700">
                          {contact.name?.[0]?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{contact.name}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          {contact.company && <span>{contact.company}</span>}
                          {contact.domain && (
                            <Badge variant="outline" className="text-xs py-0">
                              {contact.domain}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {contact.quality_score >= 70 && (
                        <Star className="w-4 h-4 text-amber-500" />
                      )}
                      {contact.is_federated && (
                        <Globe className="w-4 h-4 text-emerald-500" />
                      )}
                    </div>
                  </div>
                ))}
                {contacts.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-4">No contacts yet</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deal Tracking Section */}
      {showDealTracking && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                My Deal Pipeline
              </CardTitle>
              <CardDescription>
                Personal deal tracking - no approval needed
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = createPageUrl('Deals')}
              className="gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Full View
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-violet-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-violet-700">{dealMetrics.total}</p>
                <p className="text-xs text-violet-600">Total Deals</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-700">{dealMetrics.active}</p>
                <p className="text-xs text-blue-600">Active</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-emerald-700">{formatCurrency(dealMetrics.pipelineValue)}</p>
                <p className="text-xs text-emerald-600">Pipeline</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-amber-700">{formatCurrency(dealMetrics.wonValue)}</p>
                <p className="text-xs text-amber-600">Won</p>
              </div>
            </div>

            {/* Recent Deals Preview */}
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-3">Recent Deals</h4>
              <div className="space-y-2">
                {deals.slice(0, 5).map(deal => (
                  <div key={deal.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{deal.title}</p>
                      <p className="text-xs text-slate-500">{deal.company_name || 'No company'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-700">{formatCurrency(deal.amount)}</span>
                      <Badge 
                        className={
                          deal.stage === 'closed_won' ? 'bg-emerald-100 text-emerald-700' :
                          deal.stage === 'closed_lost' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }
                      >
                        {deal.stage?.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
                {deals.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-4">No deals yet</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}