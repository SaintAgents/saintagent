import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  BookOpen,
  Plus,
  Save,
  X,
  Trash2,
  Edit,
  Coins,
  Sparkles,
  Lock,
  Calendar,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';

const MOODS = [
  { value: 'grateful', label: '🙏 Grateful', color: 'bg-amber-100 text-amber-700' },
  { value: 'peaceful', label: '☮️ Peaceful', color: 'bg-blue-100 text-blue-700' },
  { value: 'inspired', label: '✨ Inspired', color: 'bg-purple-100 text-purple-700' },
  { value: 'reflective', label: '🌙 Reflective', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'challenged', label: '💪 Challenged', color: 'bg-rose-100 text-rose-700' },
  { value: 'growing', label: '🌱 Growing', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'neutral', label: '😐 Neutral', color: 'bg-slate-100 text-slate-700' },
];

const GGG_THRESHOLD = 33;
const GGG_REWARD = 0.030;

export default function JournalTab({ profile }) {
  const [isWriting, setIsWriting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('neutral');
  const [expandedEntries, setExpandedEntries] = useState({});
  const queryClient = useQueryClient();

  const userId = profile?.user_id;

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['journalEntries', userId],
    queryFn: () => base44.entities.JournalEntry.filter({ user_id: userId }, '-created_date', 100),
    enabled: !!userId
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const entry = await base44.entities.JournalEntry.create({
        user_id: userId,
        ...data
      });
      
      // Check if user has reached 33 entries and should earn GGG
      const currentCount = entries.length + 1;
      if (currentCount >= GGG_THRESHOLD) {
        // Award GGG for this entry
        const currentBalance = profile?.ggg_balance || 0;
        await base44.entities.UserProfile.update(profile.id, {
          ggg_balance: currentBalance + GGG_REWARD
        });
        
        // Log the transaction
        await base44.entities.GGGTransaction.create({
          user_id: userId,
          source_type: 'reward',
          source_id: entry.id,
          delta: GGG_REWARD,
          reason_code: 'journal_entry',
          description: `Journal entry reward (entry #${currentCount})`,
          balance_after: currentBalance + GGG_REWARD
        });
      }
      
      return entry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.JournalEntry.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.JournalEntry.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
    }
  });

  const resetForm = () => {
    setIsWriting(false);
    setEditingId(null);
    setTitle('');
    setContent('');
    setMood('neutral');
  };

  const handleSave = () => {
    if (!content.trim()) return;

    const data = {
      title: title.trim() || null,
      content: content.trim(),
      mood
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (entry) => {
    setEditingId(entry.id);
    setTitle(entry.title || '');
    setContent(entry.content);
    setMood(entry.mood || 'neutral');
    setIsWriting(true);
  };

  const toggleExpand = (id) => {
    setExpandedEntries(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const entryCount = entries.length;
  const progressToReward = Math.min(entryCount, GGG_THRESHOLD);
  const hasReachedThreshold = entryCount >= GGG_THRESHOLD;

  const getMoodDisplay = (moodValue) => {
    return MOODS.find(m => m.value === moodValue) || MOODS[6];
  };

  return (
    <div className="space-y-6">
      {/* Progress Card */}
      <Card className="bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Your Journal</h3>
                <p className="text-sm text-slate-600">{entryCount} entries written</p>
              </div>
            </div>
            <Button
              onClick={() => setIsWriting(true)}
              className="bg-violet-600 hover:bg-violet-700 gap-2"
              disabled={isWriting}
            >
              <Plus className="w-4 h-4" />
              New Entry
            </Button>
          </div>

          {/* GGG Progress */}
          <div className="bg-white/80 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-slate-700">GGG Reward Progress</span>
              </div>
              <span className="text-sm font-bold text-violet-600">
                {progressToReward}/{GGG_THRESHOLD}
              </span>
            </div>
            <Progress value={(progressToReward / GGG_THRESHOLD) * 100} className="h-2 mb-2" />
            {hasReachedThreshold ? (
              <div className="flex items-center gap-2 text-emerald-600">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Earning {GGG_REWARD} GGG per entry!
                </span>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Write {GGG_THRESHOLD - entryCount} more entries to start earning {GGG_REWARD} GGG per entry
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Write/Edit Form */}
      {isWriting && (
        <Card className="border-violet-200 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Edit className="w-5 h-5 text-violet-500" />
              {editingId ? 'Edit Entry' : 'New Journal Entry'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Entry title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-medium"
            />
            <Textarea
              placeholder="What's on your mind today? Reflect on your journey, gratitude, lessons learned..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px] resize-none"
            />
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm text-slate-600 mb-1 block">How are you feeling?</label>
                <Select value={mood} onValueChange={setMood}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MOODS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-slate-500">
                <Lock className="w-4 h-4" />
                <span className="text-sm">Your entries are private by default</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={resetForm}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!content.trim() || createMutation.isPending || updateMutation.isPending}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingId ? 'Update' : 'Save Entry'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Entries List */}
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-slate-400" />
          Your Entries
        </h3>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full mx-auto" />
          </div>
        ) : entries.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h4 className="font-medium text-slate-900 mb-2">No journal entries yet</h4>
              <p className="text-slate-500 text-sm mb-4">
                Start your journaling journey to reflect, grow, and earn GGG rewards
              </p>
              <Button onClick={() => setIsWriting(true)} variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Write Your First Entry
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, index) => {
              const moodDisplay = getMoodDisplay(entry.mood);
              const isExpanded = expandedEntries[entry.id];
              const isLongContent = entry.content.length > 200;
              const entryNumber = entries.length - index;

              return (
                <Card key={entry.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge className={cn("text-xs", moodDisplay.color)}>
                            {moodDisplay.label}
                          </Badge>
                          <span className="text-xs text-slate-400">
                            {format(new Date(entry.created_date), 'MMM d, yyyy • h:mm a')}
                          </span>
                          {entryNumber >= GGG_THRESHOLD && (
                            <Badge className="bg-amber-100 text-amber-700 text-xs gap-1">
                              <Coins className="w-3 h-3" />
                              +{GGG_REWARD} GGG
                            </Badge>
                          )}
                        </div>
                        {entry.title && (
                          <h4 className="font-semibold text-slate-900 mb-1">{entry.title}</h4>
                        )}
                        <p className={cn(
                          "text-slate-700 whitespace-pre-wrap",
                          !isExpanded && isLongContent && "line-clamp-3"
                        )}>
                          {entry.content}
                        </p>
                        {isLongContent && (
                          <button
                            onClick={() => toggleExpand(entry.id)}
                            className="text-violet-600 text-sm mt-2 flex items-center gap-1 hover:text-violet-700"
                          >
                            {isExpanded ? (
                              <>Show less <ChevronUp className="w-4 h-4" /></>
                            ) : (
                              <>Read more <ChevronDown className="w-4 h-4" /></>
                            )}
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-violet-600"
                          onClick={() => handleEdit(entry)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-red-600"
                          onClick={() => deleteMutation.mutate(entry.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}