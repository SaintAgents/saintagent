import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { Sparkles, Plus, Heart, Eye, Zap, Clock, Hash, MapPin, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  { value: 'numbers', label: 'Numbers', icon: Hash, color: 'bg-violet-100 text-violet-700' },
  { value: 'dreams', label: 'Dreams', icon: Eye, color: 'bg-indigo-100 text-indigo-700' },
  { value: 'encounters', label: 'Encounters', icon: Zap, color: 'bg-amber-100 text-amber-700' },
  { value: 'signs', label: 'Signs', icon: Sparkles, color: 'bg-emerald-100 text-emerald-700' },
  { value: 'timing', label: 'Timing', icon: Clock, color: 'bg-blue-100 text-blue-700' },
  { value: 'patterns', label: 'Patterns', icon: TrendingUp, color: 'bg-rose-100 text-rose-700' },
  { value: 'messages', label: 'Messages', icon: Sparkles, color: 'bg-purple-100 text-purple-700' },
  { value: 'other', label: 'Other', icon: Sparkles, color: 'bg-slate-100 text-slate-700' },
];

function SynchronicityItem({ item, onLike, onResonate, currentUserId }) {
  const category = CATEGORIES.find(c => c.value === item.category) || CATEGORIES[7];
  const CategoryIcon = category.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:border-violet-200 dark:hover:border-violet-700 transition-all"
    >
      <div className="flex items-start gap-3">
        <Avatar className="w-8 h-8 cursor-pointer" data-user-id={item.user_id}>
          <AvatarImage src={item.user_avatar} />
          <AvatarFallback className="text-xs">{item.user_name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-slate-900 dark:text-white truncate">{item.user_name}</span>
            <Badge className={`${category.color} text-[10px] px-1.5 py-0`}>
              <CategoryIcon className="w-2.5 h-2.5 mr-0.5" />
              {category.label}
            </Badge>
          </div>
          {item.title && (
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1">{item.title}</p>
          )}
          <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{item.description}</p>
          
          {item.symbols?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {item.symbols.slice(0, 3).map((symbol, i) => (
                <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300">
                  {symbol}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 mt-2">
            <button 
              onClick={() => onLike(item)}
              className="flex items-center gap-1 text-slate-400 hover:text-rose-500 transition-colors"
            >
              <Heart className={`w-3.5 h-3.5 ${item.userLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span className="text-xs">{item.likes_count || 0}</span>
            </button>
            <button 
              onClick={() => onResonate(item)}
              className="flex items-center gap-1 text-slate-400 hover:text-violet-500 transition-colors"
            >
              <Sparkles className={`w-3.5 h-3.5 ${item.userResonated ? 'text-violet-500' : ''}`} />
              <span className="text-xs">{item.resonance_count || 0} resonated</span>
            </button>
            <span className="text-[10px] text-slate-400 ml-auto">
              {formatDistanceToNow(new Date(item.created_date), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function SynchronicityFeedCard({ className = "" }) {
  const [submitOpen, setSubmitOpen] = useState(false);
  const [newSync, setNewSync] = useState({ title: '', description: '', category: 'other', symbols: '' });
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: profile } = useQuery({
    queryKey: ['userProfile', currentUser?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_id: currentUser.email });
      return profiles?.[0];
    },
    enabled: !!currentUser?.email
  });

  const { data: synchronicities = [], isLoading } = useQuery({
    queryKey: ['synchronicities'],
    queryFn: () => base44.entities.Synchronicity.filter({ status: 'active', visibility: 'public' }, '-created_date', 20),
    refetchInterval: 30000
  });

  const submitMutation = useMutation({
    mutationFn: async (data) => {
      return base44.entities.Synchronicity.create({
        ...data,
        user_id: currentUser.email,
        user_name: profile?.display_name || currentUser.full_name,
        user_avatar: profile?.avatar_url,
        symbols: data.symbols ? data.symbols.split(',').map(s => s.trim()).filter(Boolean) : [],
        occurred_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['synchronicities'] });
      setSubmitOpen(false);
      setNewSync({ title: '', description: '', category: 'other', symbols: '' });
    }
  });

  const likeMutation = useMutation({
    mutationFn: async (item) => {
      await base44.entities.Synchronicity.update(item.id, {
        likes_count: (item.likes_count || 0) + 1
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['synchronicities'] })
  });

  const resonateMutation = useMutation({
    mutationFn: async (item) => {
      await base44.entities.Synchronicity.update(item.id, {
        resonance_count: (item.resonance_count || 0) + 1
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['synchronicities'] })
  });

  // Pattern detection - find trending symbols
  const trendingPatterns = React.useMemo(() => {
    const symbolCounts = {};
    synchronicities.forEach(s => {
      s.symbols?.forEach(sym => {
        symbolCounts[sym] = (symbolCounts[sym] || 0) + 1;
      });
    });
    return Object.entries(symbolCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([symbol, count]) => ({ symbol, count }));
  }, [synchronicities]);

  return (
    <Card className={`${className} dark:bg-[#050505] dark:border-[#00ff88]/30`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-violet-100 dark:bg-violet-900/50">
              <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            </div>
            Synchronicity Feed
          </CardTitle>
          <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 rounded-lg bg-violet-600 hover:bg-violet-700 gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Share
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-violet-500" />
                  Share a Synchronicity
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Brief title (optional)"
                  value={newSync.title}
                  onChange={(e) => setNewSync(p => ({ ...p, title: e.target.value }))}
                />
                <Textarea
                  placeholder="Describe what happened... What signs, numbers, or meaningful coincidences did you experience?"
                  value={newSync.description}
                  onChange={(e) => setNewSync(p => ({ ...p, description: e.target.value }))}
                  rows={4}
                />
                <Select value={newSync.category} onValueChange={(v) => setNewSync(p => ({ ...p, category: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center gap-2">
                          <cat.icon className="w-4 h-4" />
                          {cat.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Symbols/patterns (comma-separated): 11:11, butterfly, etc."
                  value={newSync.symbols}
                  onChange={(e) => setNewSync(p => ({ ...p, symbols: e.target.value }))}
                />
                <Button 
                  onClick={() => submitMutation.mutate(newSync)}
                  disabled={!newSync.description || submitMutation.isPending}
                  className="w-full bg-violet-600 hover:bg-violet-700"
                >
                  {submitMutation.isPending ? 'Sharing...' : 'Share with Community'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Trending patterns */}
        {trendingPatterns.length > 0 && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-xs text-slate-500 dark:text-slate-400">Trending:</span>
            {trendingPatterns.map(({ symbol, count }) => (
              <Badge key={symbol} variant="outline" className="text-xs bg-violet-50 dark:bg-violet-900/30 border-violet-200 dark:border-violet-700 text-violet-700 dark:text-violet-300">
                {symbol} <span className="ml-1 text-violet-400">×{count}</span>
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        <ScrollArea className="h-72">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Sparkles className="w-6 h-6 text-violet-400 animate-pulse" />
            </div>
          ) : synchronicities.length === 0 ? (
            <div className="text-center py-8">
              <Sparkles className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-500 dark:text-slate-400">No synchronicities shared yet</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Be the first to share a meaningful coincidence</p>
            </div>
          ) : (
            <AnimatePresence>
              <div className="space-y-3">
                {synchronicities.map(item => (
                  <SynchronicityItem
                    key={item.id}
                    item={item}
                    currentUserId={currentUser?.email}
                    onLike={(i) => likeMutation.mutate(i)}
                    onResonate={(i) => resonateMutation.mutate(i)}
                  />
                ))}
              </div>
            </AnimatePresence>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}