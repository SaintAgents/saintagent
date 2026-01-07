import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Users, Plus, Search, Globe, Lock, Eye, Share2, 
  TrendingUp, Award, Filter, LayoutGrid, List, Upload, HelpCircle, Sparkles
} from 'lucide-react';
import ContactCard from '@/components/crm/ContactCard';
import ContactFormModal from '@/components/crm/ContactFormModal';
import FederatedGraphView from '@/components/crm/FederatedGraphView';
import AccessRequestsPanel from '@/components/crm/AccessRequestsPanel';
import CRMStatsBar from '@/components/crm/CRMStatsBar';
import ContactImportModal from '@/components/crm/ContactImportModal';
import NetworkHelpModal from '@/components/crm/NetworkHelpModal';
import ContactDetailModal from '@/components/crm/ContactDetailModal';
import ContactSummaryHeader from '@/components/crm/ContactSummaryHeader';
import ContactCleanupModal from '@/components/crm/ContactCleanupModal';
import ContactEnrichModal from '@/components/crm/ContactEnrichModal';
import { cn } from '@/lib/utils';

export default function CRM() {
  const [tab, setTab] = useState('my-contacts');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [formOpen, setFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [domainFilter, setDomainFilter] = useState('all');
  const [importOpen, setImportOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [cleanupOpen, setCleanupOpen] = useState(false);
  const [enrichOpen, setEnrichOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const queryClient = useQueryClient();

  // Check for ?help in URL
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('help')) {
      setHelpOpen(true);
    }
  }, []);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: myContacts = [], isLoading: loadingContacts } = useQuery({
    queryKey: ['myContacts', currentUser?.email],
    queryFn: () => base44.entities.Contact.filter({ owner_id: currentUser.email }, '-created_date'),
    enabled: !!currentUser?.email
  });

  const { data: federatedContacts = [] } = useQuery({
    queryKey: ['federatedContacts'],
    queryFn: () => base44.entities.Contact.filter({ is_federated: true, permission_level: { $ne: 'private' } }, '-quality_score', 100),
    enabled: tab === 'network'
  });

  const { data: accessRequests = [] } = useQuery({
    queryKey: ['accessRequests', currentUser?.email],
    queryFn: () => base44.entities.ContactAccessRequest.filter({ owner_id: currentUser.email, status: 'pending' }),
    enabled: !!currentUser?.email
  });

  const { data: myContribution } = useQuery({
    queryKey: ['myContribution', currentUser?.email],
    queryFn: async () => {
      const records = await base44.entities.CRMContribution.filter({ user_id: currentUser.email });
      return records[0];
    },
    enabled: !!currentUser?.email
  });

  const filteredContacts = (tab === 'my-contacts' ? myContacts : federatedContacts).filter(c => {
    const matchesSearch = !search || 
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.company?.toLowerCase().includes(search.toLowerCase()) ||
      c.domain?.toLowerCase().includes(search.toLowerCase());
    const matchesDomain = domainFilter === 'all' || c.domain === domainFilter;
    return matchesSearch && matchesDomain;
  });

  const handleEdit = (contact) => {
    setEditingContact(contact);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingContact(null);
  };

  const domains = ['all', 'finance', 'tech', 'governance', 'health', 'education', 'media', 'legal', 'spiritual', 'creative', 'nonprofit', 'other'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
      <style>{`
        [data-theme='dark'] .crm-import-btn {
          background-color: #1e293b !important;
          border-color: #475569 !important;
          color: #e5e7eb !important;
        }
        [data-theme='dark'] .crm-import-btn:hover {
          background-color: #334155 !important;
        }
        [data-theme='dark'] .crm-stats-bar {
          background-color: #1e293b !important;
          border-color: #334155 !important;
        }
      `}</style>

      {/* Hero Section */}
      <div className="relative h-48 md:h-56 overflow-hidden">
        <img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/f192709b6_Screenshot2026-01-06215230.png"
          alt="Contact Network"
          className="w-full h-full object-cover hero-image"
          data-no-filter="true"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/30 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg flex items-center gap-3">
            <Users className="w-8 h-8 text-violet-300" />
            Contact Network
            <button 
              onClick={() => setHelpOpen(true)}
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              title="Learn how it works"
            >
              <HelpCircle className="w-5 h-5 text-white" />
            </button>
          </h1>
          <p className="text-violet-100 mt-2 text-sm md:text-base">
            Your private CRM with optional federated sharing
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6 p-6">
        {/* Header Actions */}
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-3">
            {accessRequests.length > 0 && (
              <Badge className="bg-amber-100 text-amber-700">
                {accessRequests.length} pending request{accessRequests.length > 1 ? 's' : ''}
              </Badge>
            )}
            <Button variant="outline" onClick={() => setImportOpen(true)} className="gap-2 crm-import-btn">
              <Upload className="w-4 h-4" />
              Import CSV
            </Button>
            <Button onClick={() => setFormOpen(true)} className="bg-violet-600 hover:bg-violet-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Contact
            </Button>
          </div>
        </div>

        {/* Stats Bar */}
        <CRMStatsBar 
          totalContacts={myContacts.length}
          federatedCount={myContacts.filter(c => c.is_federated).length}
          contribution={myContribution}
        />

        {/* Summary Header with Cleanup & Enrich */}
        {tab === 'my-contacts' && myContacts.length > 0 && (
          <ContactSummaryHeader 
            contacts={myContacts}
            onOpenCleanup={() => setCleanupOpen(true)}
            onOpenEnrich={() => setEnrichOpen(true)}
            onFilterByCategory={(cat) => setCategoryFilter(cat)}
          />
        )}

        {/* Main Content */}
        <Tabs value={tab} onValueChange={setTab}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="my-contacts" className="gap-2">
                <Lock className="w-4 h-4" />
                My Contacts
              </TabsTrigger>
              <TabsTrigger value="network" className="gap-2">
                <Globe className="w-4 h-4" />
                Federated Network
              </TabsTrigger>
              <TabsTrigger value="requests" className="gap-2">
                <Share2 className="w-4 h-4" />
                Access Requests
                {accessRequests.length > 0 && (
                  <Badge className="ml-1 bg-rose-500 text-white text-xs">{accessRequests.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Search contacts..." 
                  className="pl-9 w-64"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select 
                className="h-9 px-3 rounded-md border border-slate-200 text-sm"
                value={domainFilter}
                onChange={(e) => setDomainFilter(e.target.value)}
              >
                {domains.map(d => (
                  <option key={d} value={d}>{d === 'all' ? 'All Domains' : d.charAt(0).toUpperCase() + d.slice(1)}</option>
                ))}
              </select>
              <div className="flex items-center border rounded-md">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn("h-9 w-9 rounded-r-none", viewMode === 'grid' && "bg-slate-100")}
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn("h-9 w-9 rounded-l-none", viewMode === 'list' && "bg-slate-100")}
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <TabsContent value="my-contacts">
            {loadingContacts ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="bg-white rounded-xl border p-4 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-200 rounded-full" />
                      <div className="flex-1">
                        <div className="h-4 w-32 bg-slate-200 rounded mb-2" />
                        <div className="h-3 w-24 bg-slate-100 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="font-semibold text-slate-900 mb-2">
                  {search ? 'No contacts found' : 'Start building your network'}
                </h3>
                <p className="text-sm text-slate-500 mb-4 max-w-md mx-auto">
                  {search 
                    ? 'Try adjusting your search or filters' 
                    : 'Add contacts to your private CRM. You control what gets shared.'}
                </p>
                {!search && (
                  <Button onClick={() => setFormOpen(true)} className="bg-violet-600 hover:bg-violet-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Contact
                  </Button>
                )}
              </div>
            ) : (
              <div className={cn(
                viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  : "space-y-2"
              )}>
                {filteredContacts.map(contact => (
                                        <ContactCard 
                                          key={contact.id} 
                                          contact={contact} 
                                          viewMode={viewMode}
                                          isOwner={true}
                                          onEdit={() => handleEdit(contact)}
                                          onClick={() => setSelectedContact(contact)}
                                        />
                                      ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="network">
            <FederatedGraphView 
              contacts={filteredContacts} 
              currentUserId={currentUser?.email}
              viewMode={viewMode}
            />
          </TabsContent>

          <TabsContent value="requests">
            <AccessRequestsPanel 
              requests={accessRequests}
              currentUserId={currentUser?.email}
            />
          </TabsContent>
        </Tabs>
      </div>

      <ContactFormModal 
        open={formOpen}
        onClose={handleCloseForm}
        contact={editingContact}
        currentUserId={currentUser?.email}
      />

      <ContactImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        currentUserId={currentUser?.email}
      />

      <NetworkHelpModal
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
      />

      <ContactDetailModal
        open={!!selectedContact}
        onClose={() => setSelectedContact(null)}
        contact={selectedContact}
        onEdit={handleEdit}
      />

      <ContactCleanupModal
        open={cleanupOpen}
        onClose={() => setCleanupOpen(false)}
        contacts={myContacts}
      />

      <ContactEnrichModal
        open={enrichOpen}
        onClose={() => setEnrichOpen(false)}
        contacts={myContacts}
      />
    </div>
  );
}