import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Target, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

function IntentionCard({ profile, currentUserEmail }) {
  const [cheered, setCheered] = useState(false);
  const [cheerCount, setCheerCount] = useState(0);

  const handleCheer = (e) => {
    e.stopPropagation();
    if (cheered) return;
    setCheered(true);
    setCheerCount((c) => c + 1);
    // Fire-and-forget notification
    base44.entities.Notification.create({
      user_id: profile.user_id,
      type: 'system',
      title: '🎉 Someone cheered your intentions!',
      message: `A community member is supporting your goals and intentions.`,
      action_url: '/Profile',
      priority: 'normal'
    }).catch(() => {});
  };

  const intentions = profile.intentions || [];
  const goals = (profile.personal_goals || []).filter(g => g.title);
  if (intentions.length === 0 && goals.length === 0) return null;

  const isMe = profile.user_id === currentUserEmail;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center cursor-pointer shrink-0 overflow-hidden"
          data-user-id={profile.user_id}
        >
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
          ) : (
            <span className="text-sm font-bold text-violet-600">
              {(profile.display_name || '?')[0].toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate cursor-pointer" data-user-id={profile.user_id}>
            {profile.display_name || profile.handle || 'Member'}
          </p>
          {profile.rank_code && (
            <Badge variant="outline" className="text-xs capitalize">{profile.rank_code}</Badge>
          )}
        </div>
        {!isMe && (
          <Button
            variant={cheered ? 'default' : 'outline'}
            size="sm"
            className={cheered ? 'bg-pink-500 hover:bg-pink-600 text-white gap-1' : 'gap-1 border-pink-200 text-pink-600 hover:bg-pink-50'}
            onClick={handleCheer}
          >
            <Heart className={`w-3.5 h-3.5 ${cheered ? 'fill-white' : ''}`} />
            {cheered ? 'Cheered!' : 'Cheer'}
            {cheerCount > 0 && <span className="text-xs">+{cheerCount}</span>}
          </Button>
        )}
      </div>

      {/* Intentions */}
      {intentions.length > 0 && (
        <div className="mb-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Intentions</p>
          <div className="flex flex-wrap gap-1.5">
            {intentions.map((intent, i) => (
              <Badge key={i} className="bg-violet-100 text-violet-700 text-xs">{intent}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Goals */}
      {goals.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Goals</p>
          <div className="space-y-1.5">
            {goals.slice(0, 3).map((goal, i) => {
              const pct = goal.target > 0 ? Math.min(100, Math.round((goal.current || 0) / goal.target * 100)) : 0;
              return (
                <div key={goal.id || i} className="flex items-center gap-2">
                  <Target className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="text-sm text-slate-700 flex-1 truncate">{goal.title}</span>
                  {goal.target > 0 && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-slate-500">{pct}%</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CommunityIntentionsPanel() {
  const [expanded, setExpanded] = useState(true);
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 300000
  });

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['communityIntentions'],
    queryFn: async () => {
      const all = await base44.entities.UserProfile.list('-updated_date', 20);
      return all.filter(p =>
        (p.intentions && p.intentions.length > 0) ||
        (p.personal_goals && p.personal_goals.some(g => g.title))
      );
    },
    staleTime: 600000,
    gcTime: 900000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="h-6 w-48 bg-slate-200 rounded animate-pulse mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map(i => <div key={i} className="h-32 bg-slate-100 rounded-lg animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (profiles.length === 0) return null;

  return (
    <div className="mb-8">
      <button
        className="flex items-center gap-2 mb-4 group"
        onClick={() => setExpanded(!expanded)}
      >
        <Sparkles className="w-5 h-5 text-pink-500" />
        <h2 className="text-xl font-bold text-[#051C2C]">Community Intentions & Goals</h2>
        <Badge variant="outline" className="ml-1 text-xs">{profiles.length}</Badge>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      <p className="text-sm text-slate-500 mb-4 -mt-2">
        Support fellow members by cheering their intentions and goals
      </p>

      {expanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profiles.map((p) => (
            <IntentionCard key={p.id} profile={p} currentUserEmail={currentUser?.email} />
          ))}
        </div>
      )}
    </div>
  );
}