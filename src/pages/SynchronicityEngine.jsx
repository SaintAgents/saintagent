import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sparkles, Heart, MessageCircle, Plus, TrendingUp, 
  Hash, Eye, Users, Filter, Search, Clock, Flame, Orbit, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDistanceToNow } from 'date-fns';
import ForwardButton, { LoopStartIndicator } from '@/components/hud/ForwardButton';
import BadgeProgressPanel from '@/components/badges/BadgeProgressPanel';
import SynchronicityHelpHint from '@/components/hud/SynchronicityHelpHint';
import { HeroGalleryTrigger } from '@/components/hud/HeroGalleryViewer';

const HERO_IMAGE = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/52771e0da_gemini-25-flash-image_change_the_letters_to_words_-_Synchronicity_is_MetaV_at_work-0.jpg";

const CATEGORY_CONFIG = {
  numbers: { label: 'Numbers', icon: Hash, color: 'bg-violet-500/20 text-violet-400 border-violet-500/30', hint: 'Repeated numbers like 11:11, 222, 333 appearing meaningfully' },
  dreams: { label: 'Dreams', icon: Eye, color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30', hint: 'Prophetic dreams or dream symbols that manifest in waking life' },
  encounters: { label: 'Encounters', icon: Users, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', hint: 'Meeting the right person at the right time unexpectedly' },
  signs: { label: 'Signs', icon: Sparkles, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', hint: 'Animals, objects, or symbols appearing as messages' },
  timing: { label: 'Timing', icon: Clock, color: 'bg-rose-500/20 text-rose-400 border-rose-500/30', hint: 'Perfect timing of events, doors opening at the exact moment needed' },
  patterns: { label: 'Patterns', icon: TrendingUp, color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30', hint: 'Recurring themes or patterns across different areas of life' },
  messages: { label: 'Messages', icon: MessageCircle, color: 'bg-pink-500/20 text-pink-400 border-pink-500/30', hint: 'Songs, words, or phrases that answer questions or confirm guidance' },
  other: { label: 'Other', icon: Flame, color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', hint: 'Other meaningful coincidences that don\'t fit categories above' },
};

function HelpTooltip({ children }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors">
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs bg-white text-slate-700 border border-slate-200 shadow-lg">
          <p className="text-sm">{children}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function SynchronicityCard({ sync, onLike, onResonate }) {
  const config = CATEGORY_CONFIG[sync.category] || CATEGORY_CONFIG.other;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 rounded-xl border border-violet-500/20 p-4 hover:border-violet-500/40 transition-all"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="w-10 h-10 border border-violet-500/30" data-user-id={sync.user_id}>
          <AvatarImage src={sync.user_avatar} />
          <AvatarFallback className="bg-violet-900/50 text-violet-200 text-sm">
            {sync.user_name?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-white truncate">{sync.user_name}</p>
          <p className="text-xs text-slate-400">
            {sync.created_date ? formatDistanceToNow(new Date(sync.created_date), { addSuffix: true }) : 'Recently'}
          </p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge className={`${config.color} border text-xs cursor-help`}>
                <Icon className="w-3 h-3 mr-1" />
                {config.label}
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs bg-white text-slate-700 border border-slate-200 shadow-lg">
              <p className="text-sm">{config.hint}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Content */}
      {sync.title && (
        <h3 className="font-semibold text-violet-200 mb-2">{sync.title}</h3>
      )}
      <p className="text-slate-300 text-sm leading-relaxed mb-3">{sync.description}</p>

      {/* Symbols */}
      {sync.symbols?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {sync.symbols.map((symbol, i) => (
            <span key={i} className="px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs">
              {symbol}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-3 border-t border-slate-700/50">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={() => onLike?.(sync)}
                className="flex items-center gap-1.5 text-slate-400 hover:text-rose-400 transition-colors group"
              >
                <Heart className="w-4 h-4 group-hover:fill-rose-400" />
                <span className="text-sm">{sync.likes_count || 0}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-white text-slate-700 border border-slate-200 shadow-lg">
              <p className="text-sm">Like this synchronicity</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={() => onResonate?.(sync)}
                className="flex items-center gap-1.5 text-slate-400 hover:text-violet-400 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-sm">{sync.resonance_count || 0} resonated</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-white text-slate-700 border border-slate-200 shadow-lg">
              <p className="text-sm">I've experienced something similar</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </motion.div>
  );
}

function SubmitSynchronicityDialog({ open, onOpenChange, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    symbols: ''
  });

  const handleSubmit = () => {
    if (!formData.description.trim()) return;
    onSubmit({
      ...formData,
      symbols: formData.symbols.split(',').map(s => s.trim()).filter(Boolean)
    });
    setFormData({ title: '', description: '', category: 'other', symbols: '' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-b from-slate-900 to-slate-800 border-violet-500/30 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-400" />
            Share Your Synchronicity
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div>
            <label className="text-sm text-slate-300 mb-1.5 block">Title (optional)</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Give it a name..."
              className="bg-slate-800/50 border-slate-700 text-white"
            />
          </div>
          
          <div>
            <label className="text-sm text-slate-300 mb-1.5 block">What happened?</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your synchronicity experience..."
              className="bg-slate-800/50 border-slate-700 text-white min-h-[100px]"
            />
          </div>
          
          <div>
            <label className="text-sm text-slate-300 mb-1.5 block">Category</label>
            <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
              <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key} className="text-white">
                    <div className="flex items-center gap-2">
                      <config.icon className="w-4 h-4" />
                      {config.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm text-slate-300 mb-1.5 block">Symbols/Patterns (comma-separated)</label>
            <Input
              value={formData.symbols}
              onChange={(e) => setFormData({ ...formData, symbols: e.target.value })}
              placeholder="11:11, butterfly, golden light..."
              className="bg-slate-800/50 border-slate-700 text-white"
            />
          </div>
          
          <Button 
            onClick={handleSubmit}
            disabled={!formData.description.trim()}
            className="w-full bg-violet-600 hover:bg-violet-500 text-white"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Share Synchronicity
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function SynchronicityEngine() {
  const queryClient = useQueryClient();
  const [submitOpen, setSubmitOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: profile } = useQuery({
    queryKey: ['myProfile', currentUser?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_id: currentUser.email });
      return profiles?.[0];
    },
    enabled: !!currentUser?.email
  });

  const { data: userBadges = [] } = useQuery({
    queryKey: ['userBadges', currentUser?.email],
    queryFn: () => base44.entities.Badge.filter({ user_id: currentUser.email }),
    enabled: !!currentUser?.email
  });

  const { data: synchronicities = [], isLoading } = useQuery({
    queryKey: ['synchronicities'],
    queryFn: () => base44.entities.Synchronicity.filter({ status: 'active' }, '-created_date', 50)
  });

  const submitMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.Synchronicity.create({
        ...data,
        user_id: currentUser.email,
        user_name: profile?.display_name || currentUser?.full_name,
        user_avatar: profile?.avatar_url,
        status: 'active',
        likes_count: 0,
        resonance_count: 0
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['synchronicities'] })
  });

  const likeMutation = useMutation({
    mutationFn: async (sync) => {
      await base44.entities.Synchronicity.update(sync.id, {
        likes_count: (sync.likes_count || 0) + 1
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['synchronicities'] })
  });

  const resonateMutation = useMutation({
    mutationFn: async (sync) => {
      await base44.entities.Synchronicity.update(sync.id, {
        resonance_count: (sync.resonance_count || 0) + 1
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['synchronicities'] })
  });

  // Filter synchronicities
  const filteredSyncs = synchronicities.filter(sync => {
    if (categoryFilter !== 'all' && sync.category !== categoryFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return sync.title?.toLowerCase().includes(q) || 
             sync.description?.toLowerCase().includes(q) ||
             sync.symbols?.some(s => s.toLowerCase().includes(q));
    }
    return true;
  });

  // Trending symbols
  const trendingSymbols = React.useMemo(() => {
    const symbolCounts = {};
    synchronicities.forEach(sync => {
      sync.symbols?.forEach(symbol => {
        symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
      });
    });
    return Object.entries(symbolCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([symbol, count]) => ({ symbol, count }));
  }, [synchronicities]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950/20 to-slate-950" style={{ background: 'transparent' }}>
      {/* Hero Section */}
      <div className="page-hero relative h-64 md:h-72 overflow-hidden">
        <img
          src={HERO_IMAGE}
          alt="Synchronicity Board"
          className="hero-image w-full h-full object-cover"
          style={{ filter: 'none', WebkitFilter: 'none', opacity: 1, display: 'block', visibility: 'visible' }}
          data-no-filter="true"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent" />
        <HeroGalleryTrigger startIndex={2} className="absolute bottom-4 left-4 text-white/80 !p-1 [&_svg]:w-3 [&_svg]:h-3 z-10" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <div className="flex items-center gap-3 mb-2">
            <LoopStartIndicator currentPage="SynchronicityEngine" className="text-white/80 hover:text-emerald-300" />
            <Orbit className="w-8 h-8 text-violet-400" />
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg flex items-center gap-2">
              Synchronicity Engine <SynchronicityHelpHint className="text-white/70 hover:text-white" />
            </h1>
            <ForwardButton currentPage="SynchronicityEngine" className="text-white/80 hover:text-white" />
          </div>
          <p className="text-white/80 text-lg max-w-xl">
            Share and discover meaningful coincidences
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="border-b border-violet-500/20 bg-slate-900/50 backdrop-blur-sm sticky top-16 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search symbols, experiences..."
                className="pl-9 bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700 text-white">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all" className="text-white">All Categories</SelectItem>
                  {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key} className="text-white">
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={() => setSubmitOpen(true)}
                className="bg-violet-600 hover:bg-violet-500 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-3 space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-48 bg-slate-800/50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : filteredSyncs.length === 0 ? (
              <div className="text-center py-16">
                <Sparkles className="w-16 h-16 text-violet-500/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No synchronicities found</h3>
                <p className="text-slate-400 mb-6">Be the first to share your experience</p>
                <Button onClick={() => setSubmitOpen(true)} className="bg-violet-600 hover:bg-violet-500">
                  Share Synchronicity
                </Button>
              </div>
            ) : (
              <AnimatePresence>
                {filteredSyncs.map(sync => (
                  <SynchronicityCard 
                    key={sync.id} 
                    sync={sync}
                    onLike={() => likeMutation.mutate(sync)}
                    onResonate={() => resonateMutation.mutate(sync)}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Badge Progress Panel */}
            <BadgeProgressPanel 
              userBadges={userBadges} 
              userProgress={{}} 
              onStartQuest={(badge) => console.log('Start quest:', badge)}
            />

            {/* Trending Symbols */}
            <Card className="bg-slate-900/80 border-violet-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-violet-400" />
                  Trending Symbols
                  <HelpTooltip>Symbols and patterns most frequently appearing in recent synchronicity reports. Click any symbol to filter the feed.</HelpTooltip>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {trendingSymbols.map(({ symbol, count }) => (
                    <button
                      key={symbol}
                      onClick={() => setSearchQuery(symbol)}
                      className="px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm hover:bg-violet-500/20 transition-colors"
                    >
                      {symbol}
                      <span className="ml-1.5 text-violet-400/60">{count}</span>
                    </button>
                  ))}
                  {trendingSymbols.length === 0 && (
                    <p className="text-slate-500 text-sm">No trending symbols yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="bg-slate-900/80 border-violet-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-white flex items-center gap-2">
                  Community Stats
                  <HelpTooltip>Real-time metrics showing how the community is experiencing synchronicities together.</HelpTooltip>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm flex items-center gap-1.5">
                    Total Shared
                    <HelpTooltip>All synchronicities ever shared by the community</HelpTooltip>
                  </span>
                  <span className="text-white font-semibold">{synchronicities.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm flex items-center gap-1.5">
                    This Week
                    <HelpTooltip>Synchronicities shared in the last 7 days</HelpTooltip>
                  </span>
                  <span className="text-white font-semibold">
                    {synchronicities.filter(s => {
                      const d = new Date(s.created_date);
                      const now = new Date();
                      return (now - d) < 7 * 24 * 60 * 60 * 1000;
                    }).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm flex items-center gap-1.5">
                    Total Resonances
                    <HelpTooltip>When others click "resonate" to acknowledge experiencing similar synchronicities</HelpTooltip>
                  </span>
                  <span className="text-white font-semibold">
                    {synchronicities.reduce((acc, s) => acc + (s.resonance_count || 0), 0)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <SubmitSynchronicityDialog
        open={submitOpen}
        onOpenChange={setSubmitOpen}
        onSubmit={(data) => submitMutation.mutate(data)}
      />
    </div>
  );
}