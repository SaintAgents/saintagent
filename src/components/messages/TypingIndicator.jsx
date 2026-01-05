import React from 'react';
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function TypingIndicator({ users = [], profiles = [] }) {
  if (users.length === 0) return null;

  const getProfile = (userId) => profiles.find(p => p.user_id === userId);

  const displayNames = users.map(u => {
    const profile = getProfile(u.user_id);
    return profile?.display_name?.split(' ')[0] || 'Someone';
  });

  const text = displayNames.length === 1
    ? `${displayNames[0]} is typing...`
    : displayNames.length === 2
      ? `${displayNames[0]} and ${displayNames[1]} are typing...`
      : `${displayNames[0]} and ${displayNames.length - 1} others are typing...`;

  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <div className="flex -space-x-2">
        {users.slice(0, 3).map((u, idx) => {
          const profile = getProfile(u.user_id);
          return (
            <Avatar key={u.user_id || idx} className="w-6 h-6 border-2 border-white">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="text-xs">
                {profile?.display_name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
          );
        })}
      </div>
      <div className="flex items-center gap-1">
        <span className="text-xs text-slate-500">{text}</span>
        <div className="flex gap-0.5 ml-1">
          <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}