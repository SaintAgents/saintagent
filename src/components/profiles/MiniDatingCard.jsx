import React from 'react';
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, MapPin, Sparkles, X } from "lucide-react";

export default function MiniDatingCard({ profile, datingProfile, onLike, onPass, onMessage, onViewProfile }) {
  const handleLike = (e) => {
    e.stopPropagation();
    onLike?.(profile);
  };

  const handlePass = (e) => {
    e.stopPropagation();
    onPass?.(profile);
  };

  const handleMessage = (e) => {
    e.stopPropagation();
    onMessage?.(profile);
  };

  return (
    <div 
      onClick={() => onViewProfile?.(profile)}
      className={cn(
        "group relative bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20",
        "rounded-xl border border-rose-200 dark:border-rose-800/50 overflow-hidden cursor-pointer",
        "hover:shadow-lg hover:shadow-rose-200/50 dark:hover:shadow-rose-900/30 transition-all duration-300",
        "hover:-translate-y-1"
      )}
    >
      {/* Top gradient bar */}
      <div className="h-1 bg-gradient-to-r from-rose-400 via-pink-500 to-rose-400" />
      
      <div className="p-4">
        {/* Avatar and basic info */}
        <div className="flex items-start gap-3 mb-3">
          <div className="relative">
            <Avatar className="w-14 h-14 border-2 border-rose-300 dark:border-rose-700">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-rose-100 to-pink-100 text-rose-700 font-semibold">
                {profile.display_name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            {/* Online indicator */}
            {profile.status === 'online' && (
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-[#0a0a0a] animate-pulse" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 dark:text-white truncate">
              {profile.display_name || 'Anonymous'}
            </h3>
            {profile.location && (
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {profile.location}
              </p>
            )}
            {datingProfile?.seeking && (
              <Badge variant="outline" className="mt-1 text-[10px] border-rose-300 text-rose-600 dark:text-rose-400">
                {datingProfile.seeking}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Bio snippet */}
        {(datingProfile?.bio || profile.bio) && (
          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-3">
            {datingProfile?.bio || profile.bio}
          </p>
        )}
        
        {/* Qualities seeking */}
        {profile.qualities_seeking?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {profile.qualities_seeking.slice(0, 3).map((q, i) => (
              <Badge key={i} className="text-[9px] px-1.5 py-0 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300">
                {q}
              </Badge>
            ))}
          </div>
        )}
        
        {/* Synergy indicator */}
        {datingProfile?.synchronicity_note && (
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 mb-3">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <p className="text-[10px] text-amber-700 dark:text-amber-300 line-clamp-1">
              {datingProfile.synchronicity_note}
            </p>
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-8 text-xs border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={handlePass}
          >
            <X className="w-3 h-3 mr-1" />
            Pass
          </Button>
          <Button
            size="sm"
            className="flex-1 h-8 text-xs bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white"
            onClick={handleLike}
          >
            <Heart className="w-3 h-3 mr-1" />
            Like
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20"
            onClick={handleMessage}
          >
            <MessageCircle className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}