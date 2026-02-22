import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, Eye, EyeOff, Trash2, Plus, Search, Settings, 
  LayoutGrid, Users, DollarSign, Shield, Wrench, MoreVertical,
  Power, PowerOff, AlertTriangle, Save, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// All available pages in the app
const ALL_PAGES = [
  { name: 'CommandDeck', display: 'Command Deck', category: 'core', icon: 'LayoutDashboard' },
  { name: 'Matches', display: 'Matches', category: 'community', icon: 'Users' },
  { name: 'Meetings', display: 'Meetings', category: 'community', icon: 'Calendar' },
  { name: 'Missions', display: 'Missions', category: 'community', icon: 'Target' },
  { name: 'Projects', display: 'Projects', category: 'tools', icon: 'FolderKanban' },
  { name: 'Marketplace', display: 'Marketplace', category: 'finance', icon: 'Store' },
  { name: 'CommunityFeed', display: 'Community Feed', category: 'community', icon: 'MessageSquare' },
  { name: 'ActivityFeed', display: 'Activity Feed', category: 'community', icon: 'Activity' },
  { name: 'Messages', display: 'Messages', category: 'community', icon: 'Mail' },
  { name: 'Circles', display: 'Circles', category: 'community', icon: 'Circle' },
  { name: 'Events', display: 'Events', category: 'community', icon: 'CalendarDays' },
  { name: 'Leaderboards', display: 'Leaderboards', category: 'community', icon: 'Trophy' },
  { name: 'Profile', display: 'Profile', category: 'core', icon: 'User' },
  { name: 'Settings', display: 'Settings', category: 'core', icon: 'Settings' },
  { name: 'CRM', display: 'CRM', category: 'tools', icon: 'Contact' },
  { name: 'Deals', display: 'Deals', category: 'finance', icon: 'Handshake' },
  { name: 'DigitalRightsExchange', display: 'Digital Rights Exchange', category: 'finance', icon: 'Key' },
  { name: 'GaiaGlobalTreasury', display: 'Gaia Global Treasury', category: 'finance', icon: 'Landmark' },
  { name: 'G3Dex', display: 'G3 DEX', category: 'finance', icon: 'ArrowLeftRight' },
  { name: 'GGGCrypto', display: 'GGG Crypto', category: 'finance', icon: 'Coins' },
  { name: 'Advice', display: 'Wisdom Exchange', category: 'community', icon: 'Lightbulb' },
  { name: 'Notes', display: 'Notes', category: 'tools', icon: 'StickyNote' },
  { name: 'DailyOps', display: 'Daily Ops', category: 'tools', icon: 'ListChecks' },
  { name: 'Schedule', display: 'Schedule', category: 'tools', icon: 'Clock' },
  { name: 'SpiritTube', display: 'Spirit Tube', category: 'community', icon: 'Play' },
  { name: 'Videos', display: 'Videos', category: 'community', icon: 'Video' },
  { name: 'News', display: 'News', category: 'community', icon: 'Newspaper' },
  { name: 'Forum', display: 'Forum', category: 'community', icon: 'MessagesSquare' },
  { name: 'Teams', display: 'Teams', category: 'community', icon: 'UsersRound' },
  { name: 'Quests', display: 'Quests', category: 'community', icon: 'Compass' },
  { name: 'Gamification', display: 'Gamification', category: 'community', icon: 'Gamepad2' },
  { name: 'SynchronicityEngine', display: 'Synchronicity Engine', category: 'tools', icon: 'Sparkles' },
  { name: 'DatingMatches', display: 'Dating Matches', category: 'community', icon: 'Heart' },
  { name: 'LeaderChannel', display: 'Leader Channel', category: 'admin', icon: 'Crown' },
  { name: 'Admin', display: 'Admin', category: 'admin', icon: 'Shield' },
  { name: 'Mentorship', display: 'Mentorship', category: 'community', icon: 'GraduationCap' },
  { name: 'ResourceHub', display: 'Resource Hub', category: 'tools', icon: 'BookOpen' },
  { name: 'LearningHub', display: 'Learning Hub', category: 'tools', icon: 'School' },
  { name: 'ContentStudio', display: 'Content Studio', category: 'tools', icon: 'PenTool' },
  { name: 'AffiliateCenter', display: 'Affiliate Center', category: 'finance', icon: 'Link' },
  { name: 'Testimonials', display: 'Testimonials', category: 'community', icon: 'Quote' },
  { name: 'FindCollaborators', display: 'Find Collaborators', category: 'community', icon: 'UserPlus' },
  { name: 'Lottery', display: 'Lottery', category: 'finance', icon: 'Ticket' },
];

const CATEGORY_CONFIG = {
  core: { label: 'Core', icon: LayoutGrid, color: 'bg-violet-500' },
  community: { label: 'Community', icon: Users, color: 'bg-blue-500' },
  finance: { label: 'Finance', icon: DollarSign, color: 'bg-emerald-500' },
  admin: { label: 'Admin', icon: Shield, color: 'bg-red-500' },
  tools: { label: 'Tools', icon: Wrench, color: 'bg-amber-500' },
  other: { label: 'Other', icon: FileText, color: 'bg-slate-500' },
};

const STATUS_CONFIG = {
  active: { label: 'Active', color: 'bg-emerald-500', icon: Power },
  hidden: { label: 'Hidden', color: 'bg-amber-500', icon: EyeOff },
  disabled: { label: 'Disabled', color: 'bg-slate-500', icon: PowerOff },
  deleted: { label: 'Deleted', color: 'bg-red-500', icon: Trash2 },
};

export default function PagesControlPanel() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingPage, setEditingPage] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newPage, setNewPage] = useState({ page_name: '', display_name: '', category: 'other', status: 'active' });
  const queryClient = useQueryClient();

  const { data: pageConfigs = [], isLoading } = useQuery({
    queryKey: ['pageConfigs'],
    queryFn: () => base44.entities.PageConfig.list()
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      await base44.entities.PageConfig.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pageConfigs'] });
      toast.success('Page updated');
      setEditingPage(null);
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.PageConfig.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pageConfigs'] });
      toast.success('Page configuration created');
      setCreateModalOpen(false);
      setNewPage({ page_name: '', display_name: '', category: 'other', status: 'active' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await base44.entities.PageConfig.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pageConfigs'] });
      toast.success('Page config deleted');
    }
  });

  const seedMutation = useMutation({
    mutationFn: async () => {
      const existing = pageConfigs.map(p => p.page_name);
      const toCreate = ALL_PAGES.filter(p => !existing.includes(p.name));
      for (const page of toCreate) {
        await base44.entities.PageConfig.create({
          page_name: page.name,
          display_name: page.display,
          category: page.category,
          icon: page.icon,
          status: 'active',
          sort_order: ALL_PAGES.indexOf(page) * 10
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pageConfigs'] });
      toast.success('Pages seeded');
    }
  });

  // Merge configs with all pages
  const mergedPages = ALL_PAGES.map(page => {
    const config = pageConfigs.find(c => c.page_name === page.name);
    return {
      ...page,
      id: config?.id,
      status: config?.status || 'active',
      display_name: config?.display_name || page.display,
      description: config?.description || '',
      requires_admin: config?.requires_admin || false,
      sort_order: config?.sort_order ?? 100,
      hasConfig: !!config
    };
  });

  // Filter pages
  const filteredPages = mergedPages.filter(page => {
    const matchSearch = page.display_name.toLowerCase().includes(search.toLowerCase()) ||
                        page.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'all' || page.category === categoryFilter;
    const matchStatus = statusFilter === 'all' || page.status === statusFilter;
    return matchSearch && matchCategory && matchStatus;
  });

  // Group by category
  const groupedPages = filteredPages.reduce((acc, page) => {
    const cat = page.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(page);
    return acc;
  }, {});

  const handleStatusChange = async (page, newStatus) => {
    if (page.id) {
      updateMutation.mutate({ id: page.id, data: { status: newStatus } });
    } else {
      // Create config first
      await base44.entities.PageConfig.create({
        page_name: page.name,
        display_name: page.display,
        category: page.category,
        status: newStatus
      });
      queryClient.invalidateQueries({ queryKey: ['pageConfigs'] });
      toast.success('Page status updated');
    }
  };

  const stats = {
    total: mergedPages.length,
    active: mergedPages.filter(p => p.status === 'active').length,
    hidden: mergedPages.filter(p => p.status === 'hidden').length,
    disabled: mergedPages.filter(p => p.status === 'disabled').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Pages Control</h2>
          <p className="text-slate-500">Manage page visibility and access</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending}>
            <RefreshCw className={`w-4 h-4 mr-2 ${seedMutation.isPending ? 'animate-spin' : ''}`} />
            Seed All Pages
          </Button>
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Custom Page
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-slate-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                <FileText className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-xs text-slate-500">Total Pages</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-200 flex items-center justify-center">
                <Power className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-700">{stats.active}</div>
                <div className="text-xs text-emerald-600">Active</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-200 flex items-center justify-center">
                <EyeOff className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-700">{stats.hidden}</div>
                <div className="text-xs text-amber-600">Hidden</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-300 flex items-center justify-center">
                <PowerOff className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-700">{stats.disabled}</div>
                <div className="text-xs text-slate-500">Disabled</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pages..."
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Pages List */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-6">
          {Object.entries(groupedPages).map(([category, pages]) => {
            const catConfig = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.other;
            const CatIcon = catConfig.icon;
            
            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-6 h-6 rounded ${catConfig.color} flex items-center justify-center`}>
                    <CatIcon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-900">{catConfig.label}</h3>
                  <Badge variant="secondary" className="text-xs">{pages.length}</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {pages.map((page) => {
                    const statusCfg = STATUS_CONFIG[page.status] || STATUS_CONFIG.active;
                    const StatusIcon = statusCfg.icon;
                    
                    return (
                      <Card key={page.name} className={`${page.status === 'deleted' ? 'opacity-50' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg ${statusCfg.color} flex items-center justify-center`}>
                                <StatusIcon className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <h4 className="font-medium text-slate-900">{page.display_name}</h4>
                                <p className="text-xs text-slate-500">/{page.name}</p>
                              </div>
                            </div>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleStatusChange(page, 'active')}>
                                  <Power className="w-4 h-4 mr-2 text-emerald-500" />
                                  Set Active
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(page, 'hidden')}>
                                  <EyeOff className="w-4 h-4 mr-2 text-amber-500" />
                                  Hide Page
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(page, 'disabled')}>
                                  <PowerOff className="w-4 h-4 mr-2 text-slate-500" />
                                  Disable Page
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setEditingPage(page)}>
                                  <Settings className="w-4 h-4 mr-2" />
                                  Edit Settings
                                </DropdownMenuItem>
                                {page.id && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      onClick={() => deleteMutation.mutate(page.id)}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete Config
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          
                          <div className="mt-3 flex items-center gap-2">
                            <Badge className={`${statusCfg.color} text-white text-xs`}>
                              {statusCfg.label}
                            </Badge>
                            {page.requires_admin && (
                              <Badge variant="outline" className="text-xs">
                                <Shield className="w-3 h-3 mr-1" />
                                Admin Only
                              </Badge>
                            )}
                            {!page.hasConfig && (
                              <Badge variant="outline" className="text-xs text-slate-400">
                                No Config
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Edit Modal */}
      <Dialog open={!!editingPage} onOpenChange={() => setEditingPage(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Page Settings</DialogTitle>
            <DialogDescription>Configure visibility and access for {editingPage?.display_name}</DialogDescription>
          </DialogHeader>
          
          {editingPage && (
            <div className="space-y-4 mt-4">
              <div>
                <Label>Display Name</Label>
                <Input 
                  value={editingPage.display_name}
                  onChange={(e) => setEditingPage({ ...editingPage, display_name: e.target.value })}
                />
              </div>
              
              <div>
                <Label>Description</Label>
                <Input 
                  value={editingPage.description || ''}
                  onChange={(e) => setEditingPage({ ...editingPage, description: e.target.value })}
                  placeholder="Page description..."
                />
              </div>
              
              <div>
                <Label>Status</Label>
                <Select 
                  value={editingPage.status}
                  onValueChange={(v) => setEditingPage({ ...editingPage, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                      <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Category</Label>
                <Select 
                  value={editingPage.category}
                  onValueChange={(v) => setEditingPage({ ...editingPage, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                      <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <Label>Require Admin Access</Label>
                <Switch 
                  checked={editingPage.requires_admin}
                  onCheckedChange={(v) => setEditingPage({ ...editingPage, requires_admin: v })}
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setEditingPage(null)}>Cancel</Button>
                <Button onClick={() => {
                  if (editingPage.id) {
                    updateMutation.mutate({ 
                      id: editingPage.id, 
                      data: {
                        display_name: editingPage.display_name,
                        description: editingPage.description,
                        status: editingPage.status,
                        category: editingPage.category,
                        requires_admin: editingPage.requires_admin
                      }
                    });
                  } else {
                    createMutation.mutate({
                      page_name: editingPage.name,
                      display_name: editingPage.display_name,
                      description: editingPage.description,
                      status: editingPage.status,
                      category: editingPage.category,
                      requires_admin: editingPage.requires_admin
                    });
                  }
                }}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Custom Page</DialogTitle>
            <DialogDescription>Create a configuration for a custom page</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <Label>Page Name (route)</Label>
              <Input 
                value={newPage.page_name}
                onChange={(e) => setNewPage({ ...newPage, page_name: e.target.value })}
                placeholder="MyCustomPage"
              />
            </div>
            
            <div>
              <Label>Display Name</Label>
              <Input 
                value={newPage.display_name}
                onChange={(e) => setNewPage({ ...newPage, display_name: e.target.value })}
                placeholder="My Custom Page"
              />
            </div>
            
            <div>
              <Label>Category</Label>
              <Select 
                value={newPage.category}
                onValueChange={(v) => setNewPage({ ...newPage, category: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
              <Button 
                onClick={() => createMutation.mutate(newPage)}
                disabled={!newPage.page_name || !newPage.display_name}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Page Config
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}