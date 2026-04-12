import React from 'react';
import { cn } from '@/lib/utils';
import { Check, Target, Users, MessageSquare, Coins, Award, Star, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AchievementsList({ profile, postCount = 0, missionCount = 0, meetingCount = 0, gggBalance = 0 }) {
  const achievements = [
    { label: 'Complete your profile', icon: Check, done: !!profile?.bio && !!profile?.avatar_url, color: 'text-emerald-500 bg-emerald-50' },
    { label: 'Set your intentions', icon: Target, done: (profile?.intentions?.length || 0) > 0, color: 'text-violet-500 bg-violet-50' },
    { label: 'Make your first post', icon: MessageSquare, done: postCount >= 1, color: 'text-blue-500 bg-blue-50' },
    { label: 'Publish 5 posts', icon: MessageSquare, done: postCount >= 5, color: 'text-blue-500 bg-blue-50' },
    { label: 'Join your first mission', icon: Target, done: missionCount >= 1, color: 'text-emerald-500 bg-emerald-50' },
    { label: 'Complete 3 missions', icon: Target, done: missionCount >= 3, color: 'text-emerald-500 bg-emerald-50' },
    { label: 'Attend your first meeting', icon: Calendar, done: meetingCount >= 1, color: 'text-pink-500 bg-pink-50' },
    { label: 'Attend 5 meetings', icon: Calendar, done: meetingCount >= 5, color: 'text-pink-500 bg-pink-50' },
    { label: 'Earn your first GGG', icon: Coins, done: gggBalance > 0, color: 'text-amber-500 bg-amber-50' },
    { label: 'Earn 10+ GGG', icon: Coins, done: gggBalance >= 10, color: 'text-amber-500 bg-amber-50' },
    { label: 'Gain 10 followers', icon: Users, done: (profile?.follower_count || 0) >= 10, color: 'text-cyan-500 bg-cyan-50' },
    { label: 'Reach Initiate rank', icon: Star, done: (profile?.rank_points || 0) >= 500, color: 'text-yellow-500 bg-yellow-50' },
    { label: 'Reach Adept rank', icon: Star, done: (profile?.rank_points || 0) >= 800, color: 'text-yellow-500 bg-yellow-50' },
    { label: 'Reach Master rank', icon: Award, done: (profile?.rank_points || 0) >= 1800, color: 'text-purple-500 bg-purple-50' },
  ];

  const completed = achievements.filter(a => a.done).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">Achievements</p>
        <p className="text-xs text-slate-500">{completed}/{achievements.length} completed</p>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-emerald-500 rounded-full transition-all"
          style={{ width: `${(completed / achievements.length) * 100}%` }}
        />
      </div>
      <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
        {achievements.map((ach, i) => {
          const Icon = ach.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg border transition-all",
                ach.done
                  ? "bg-white border-emerald-200"
                  : "bg-slate-50 border-slate-100 opacity-60"
              )}
            >
              <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", ach.color)}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className={cn("text-xs flex-1", ach.done ? "text-slate-700 font-medium" : "text-slate-400")}>
                {ach.label}
              </span>
              {ach.done && (
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}