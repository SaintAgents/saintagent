import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function MentorCard({ profile, userProfile, score, onRequest }) {
  const initials = (userProfile?.display_name || 'U').slice(0,1).toUpperCase();
  const skills = (profile.skills_offering || []).slice(0,6);
  return (
    <Card className="hover:shadow-md transition">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={userProfile?.avatar_url} />
            <AvatarFallback className="bg-violet-100 text-violet-700 font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold truncate">{userProfile?.display_name || profile.user_id}</p>
                <p className="text-xs text-slate-500 truncate">@{userProfile?.handle}</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500">Match</div>
                <div className="text-violet-700 font-bold">{Math.round(score)}%</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {skills.map((s, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px]">{s}</span>
              ))}
            </div>
            <div className="mt-3 text-right">
              <Button size="sm" className="rounded-lg bg-violet-600 hover:bg-violet-700" onClick={onRequest}>Request Session</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}