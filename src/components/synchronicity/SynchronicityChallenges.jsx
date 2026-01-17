import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Trophy, Plus, Users, Calendar, Target, Flame, Star,
  ChevronRight, Clock, Award, Sparkles
} from 'lucide-react';
import { formatDistanceToNow, format, isAfter, isBefore } from 'date-fns';

const THEME_CONFIG = {
  numbers: { label: '11:11 Awareness', color: 'bg-violet-500/20 text-violet-300 border-violet-500/30' },
  dreams: { label: 'Dream Journaling', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
  encounters: { label: 'Meaningful Meetings', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  signs: { label: 'Symbol Spotting', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  timing: { label: 'Divine Timing', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
  patterns: { label: 'Pattern Recognition', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
  messages: { label: 'Message Decoding', color: 'bg-pink-500/20 text-pink-300 border-pink-500/30' },
  general: { label: 'Open Challenge', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' }
};

function CreateChallengeDialog({ open, onOpenChange, profile, onCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    theme: 'general',
    goal_count: 7,
    duration_days: 7
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + data.duration_days);
      
      return base44.entities.SynchronicityChallenge.create({
        ...data,
        creator_id: profile.user_id,
        creator_name: profile.display_name,
        creator_avatar: profile.avatar_url,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        participant_ids: [profile.user_id],
        participant_count: 1,
        status: 'active'
      });
    },
    onSuccess: () => {
      onCreated?.();
      onOpenChange(false);
      setFormData({ title: '', description: '', theme: 'general', goal_count: 7, duration_days: 7 });
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-b from-slate-900 to-slate-800 border-violet-500/30 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Create Challenge
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div>
            <label className="text-sm text-slate-300 mb-1.5 block">Challenge Title</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., 7-Day 11:11 Awareness Challenge"
              className="bg-slate-800/50 border-slate-700 text-white"
            />
          </div>
          
          <div>
            <label className="text-sm text-slate-300 mb-1.5 block">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What's this challenge about?"
              className="bg-slate-800/50 border-slate-700 text-white min-h-[80px]"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-300 mb-1.5 block">Theme</label>
              <Select value={formData.theme} onValueChange={(v) => setFormData({ ...formData, theme: v })}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {Object.entries(THEME_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key} className="text-white">
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm text-slate-300 mb-1.5 block">Goal (shares)</label>
              <Select 
                value={String(formData.goal_count)} 
                onValueChange={(v) => setFormData({ ...formData, goal_count: Number(v) })}
              >
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {[3, 5, 7, 10, 14, 21, 30].map(n => (
                    <SelectItem key={n} value={String(n)} className="text-white">
                      {n} synchronicities
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <label className="text-sm text-slate-300 mb-1.5 block">Duration</label>
            <Select 
              value={String(formData.duration_days)} 
              onValueChange={(v) => setFormData({ ...formData, duration_days: Number(v) })}
            >
              <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {[3, 7, 14, 21, 30].map(n => (
                  <SelectItem key={n} value={String(n)} className="text-white">
                    {n} days
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={() => createMutation.mutate(formData)}
            disabled={!formData.title.trim() || createMutation.isPending}
            className="w-full bg-amber-600 hover:bg-amber-500 text-white"
          >
            <Trophy className="w-4 h-4 mr-2" />
            Create Challenge
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ChallengeCard({ challenge, userId, progress, onJoin }) {
  const themeConfig = THEME_CONFIG[challenge.theme] || THEME_CONFIG.general;
  const isActive = challenge.status === 'active' && isAfter(new Date(challenge.end_date), new Date());
  const isJoined = challenge.participant_ids?.includes(userId);
  const progressPct = progress ? Math.min(100, (progress.entries_count / challenge.goal_count) * 100) : 0;

  return (
    <Card className="bg-slate-800/50 border-slate-700 hover:border-violet-500/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={`${themeConfig.color} border text-xs`}>
                {themeConfig.label}
              </Badge>
              {challenge.featured && (
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-white">{challenge.title}</h3>
          </div>
          {isActive ? (
            <Badge className="bg-emerald-500/20 text-emerald-300">Active</Badge>
          ) : (
            <Badge className="bg-slate-600/50 text-slate-400">Ended</Badge>
          )}
        </div>

        {challenge.description && (
          <p className="text-sm text-slate-400 mb-3 line-clamp-2">{challenge.description}</p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {challenge.participant_count || 0} joined
          </span>
          <span className="flex items-center gap-1">
            <Target className="w-3 h-3" />
            {challenge.goal_count} to complete
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(new Date(challenge.end_date), { addSuffix: true })}
          </span>
        </div>

        {/* Progress (if joined) */}
        {isJoined && progress && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400">Your Progress</span>
              <span className="text-violet-300">{progress.entries_count}/{challenge.goal_count}</span>
            </div>
            <Progress value={progressPct} className="h-2" />
            {progress.completed && (
              <div className="flex items-center gap-1 mt-1 text-emerald-400 text-xs">
                <Award className="w-3 h-3" />
                Completed!
              </div>
            )}
          </div>
        )}

        {/* Creator */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src={challenge.creator_avatar} />
              <AvatarFallback className="text-xs">{challenge.creator_name?.[0]}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-slate-400">by {challenge.creator_name}</span>
          </div>
          
          {isActive && !isJoined && (
            <Button 
              size="sm" 
              onClick={() => onJoin?.(challenge)}
              className="bg-violet-600 hover:bg-violet-500"
            >
              Join Challenge
            </Button>
          )}
          {isJoined && !progress?.completed && (
            <Button size="sm" variant="outline" className="text-violet-300 border-violet-500/30">
              <Sparkles className="w-3 h-3 mr-1" />
              Share Entry
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function SynchronicityChallenges({ userId, profile }) {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);

  const { data: challenges = [] } = useQuery({
    queryKey: ['synchronicityChallenges'],
    queryFn: () => base44.entities.SynchronicityChallenge.filter({ status: 'active' }, '-created_date', 20)
  });

  const { data: myProgress = [] } = useQuery({
    queryKey: ['myChallengeProgress', userId],
    queryFn: () => base44.entities.ChallengeProgress.filter({ user_id: userId }),
    enabled: !!userId
  });

  const joinMutation = useMutation({
    mutationFn: async (challenge) => {
      // Update challenge
      await base44.entities.SynchronicityChallenge.update(challenge.id, {
        participant_ids: [...(challenge.participant_ids || []), userId],
        participant_count: (challenge.participant_count || 0) + 1
      });
      // Create progress record
      await base44.entities.ChallengeProgress.create({
        user_id: userId,
        challenge_id: challenge.id,
        entries_count: 0,
        completed: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['synchronicityChallenges'] });
      queryClient.invalidateQueries({ queryKey: ['myChallengeProgress'] });
    }
  });

  const getProgressForChallenge = (challengeId) => {
    return myProgress.find(p => p.challenge_id === challengeId);
  };

  // Separate active and my challenges
  const myChallenges = challenges.filter(c => c.participant_ids?.includes(userId));
  const availableChallenges = challenges.filter(c => !c.participant_ids?.includes(userId));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Community Challenges
          </h2>
          <p className="text-sm text-slate-400">Join themed challenges to deepen your awareness</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="bg-amber-600 hover:bg-amber-500">
          <Plus className="w-4 h-4 mr-2" />
          Create Challenge
        </Button>
      </div>

      {/* My Active Challenges */}
      {myChallenges.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            Your Active Challenges
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {myChallenges.map(challenge => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                userId={userId}
                progress={getProgressForChallenge(challenge.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Available Challenges */}
      <div>
        <h3 className="text-sm font-medium text-slate-300 mb-3">Available Challenges</h3>
        {availableChallenges.length === 0 ? (
          <Card className="bg-slate-800/30 border-slate-700">
            <CardContent className="py-8 text-center">
              <Trophy className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No challenges available right now</p>
              <p className="text-sm text-slate-500 mt-1">Be the first to create one!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {availableChallenges.map(challenge => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                userId={userId}
                progress={getProgressForChallenge(challenge.id)}
                onJoin={(c) => joinMutation.mutate(c)}
              />
            ))}
          </div>
        )}
      </div>

      <CreateChallengeDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        profile={profile}
        onCreated={() => queryClient.invalidateQueries({ queryKey: ['synchronicityChallenges'] })}
      />
    </div>
  );
}