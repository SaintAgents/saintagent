import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Heart, 
  MessageCircle, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  MapPin,
  X
} from "lucide-react";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { DEMO_AVATARS_MALE, DEMO_AVATARS_FEMALE } from '@/components/demoAvatars';

export default function DatingMatchesPopup({ currentUser }) {
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef(null);

  // Fetch dating profile opt-in status
  const { data: myDatingProfile } = useQuery({
    queryKey: ['myDatingProfilePopup', currentUser?.email],
    queryFn: () => base44.entities.DatingProfile.filter({ user_id: currentUser.email }),
    enabled: !!currentUser?.email
  });
  const isDatingOptedIn = myDatingProfile?.[0]?.opt_in === true;

  // Fetch dating profiles - always call hook but conditionally enable
  const { data: datingProfiles = [] } = useQuery({
    queryKey: ['datingProfilesPopup', currentUser?.email],
    queryFn: () => base44.entities.DatingProfile.filter({ opt_in: true, visible: true }, '-updated_date', 50),
    enabled: !!currentUser?.email && isDatingOptedIn
  });

  // Fetch user profiles for additional info - always call hook but conditionally enable
  const { data: userProfiles = [] } = useQuery({
    queryKey: ['userProfilesForDating'],
    queryFn: () => base44.entities.UserProfile.list('-updated_date', 200),
    enabled: !!currentUser?.email && isDatingOptedIn && datingProfiles.length > 0
  });

  const otherProfiles = isDatingOptedIn ? datingProfiles.filter(p => p.user_id !== currentUser?.email) : [];
  
  // Enrich with user profile data and assign unique demo avatars
  const usedMaleIdx = new Set();
  const usedFemaleIdx = new Set();
  
  const enrichedMatches = otherProfiles.map((dp, idx) => {
    const userProfile = userProfiles.find(up => up.user_id === dp.user_id);
    let avatar = dp.avatar_url || userProfile?.avatar_url;
    
    // Assign unique demo avatar if no real avatar
    if (!avatar) {
      const isMale = idx % 2 === 0;
      if (isMale) {
        for (let i = 0; i < DEMO_AVATARS_MALE.length; i++) {
          if (!usedMaleIdx.has(i)) {
            usedMaleIdx.add(i);
            avatar = DEMO_AVATARS_MALE[i];
            break;
          }
        }
      } else {
        for (let i = 0; i < DEMO_AVATARS_FEMALE.length; i++) {
          if (!usedFemaleIdx.has(i)) {
            usedFemaleIdx.add(i);
            avatar = DEMO_AVATARS_FEMALE[i];
            break;
          }
        }
      }
    }
    
    return {
      ...dp,
      display_name: dp.display_name || userProfile?.display_name || 'Anonymous',
      avatar_url: avatar,
      location: dp.location || userProfile?.location,
      bio: dp.bio || userProfile?.bio,
      values_tags: userProfile?.values_tags || [],
      skills: userProfile?.skills || []
    };
  });

  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(enrichedMatches.length - 1, prev + 1));
  };

  const handleOpenChat = (match) => {
    const event = new CustomEvent('openFloatingChat', {
      detail: {
        recipientId: match.user_id,
        recipientName: match.display_name,
        recipientAvatar: match.avatar_url
      }
    });
    document.dispatchEvent(event);
    setOpen(false);
  };

  const handleViewProfile = (match) => {
    const event = new CustomEvent('openProfile', { detail: { userId: match.user_id } });
    document.dispatchEvent(event);
  };

  // Return null AFTER all hooks have been called
  if (!isDatingOptedIn) return null;

  const currentMatch = enrichedMatches[currentIndex];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-xl relative group" title="Dating Matches">
          <div 
            className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center animate-pulse"
            style={{ boxShadow: '0 0 10px rgba(236, 72, 153, 0.5)' }}
          >
            <Heart className="w-3.5 h-3.5 text-white fill-white" />
          </div>
          {enrichedMatches.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center text-[10px] font-bold text-white bg-pink-500 rounded-full">
              {enrichedMatches.length > 99 ? '99+' : enrichedMatches.length}
            </span>
          )}
          <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Dating
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 dark:bg-slate-800 dark:border-slate-700">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
            Dating Matches
          </h3>
          <Link to={createPageUrl('Matches') + '?tab=dating'}>
            <Button variant="ghost" size="sm" className="text-xs h-7 text-pink-600 hover:text-pink-700">
              View All
            </Button>
          </Link>
        </div>

        {enrichedMatches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500 px-4">
            <Heart className="w-10 h-10 mb-3 opacity-50" />
            <p className="text-sm text-center">No matches yet</p>
            <p className="text-xs text-center mt-1">Check back soon for new connections</p>
          </div>
        ) : (
          <div className="relative">
            {/* Navigation Arrows */}
            {enrichedMatches.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className={cn(
                    "absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center transition-all",
                    currentIndex === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-white hover:scale-110"
                  )}
                >
                  <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentIndex === enrichedMatches.length - 1}
                  className={cn(
                    "absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center transition-all",
                    currentIndex === enrichedMatches.length - 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-white hover:scale-110"
                  )}
                >
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                </button>
              </>
            )}

            {/* Match Card */}
            {currentMatch && (
              <div className="p-4">
                <div 
                  className="bg-gradient-to-br from-white to-pink-50 dark:from-slate-800 dark:to-pink-900/20 rounded-xl border border-pink-100 dark:border-pink-800/30 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleViewProfile(currentMatch)}
                >
                  {/* Avatar & Name */}
                  <div className="p-4 text-center">
                    <Avatar className="w-20 h-20 mx-auto mb-3 ring-4 ring-pink-200 dark:ring-pink-800">
                      <AvatarImage src={currentMatch.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-pink-400 to-rose-500 text-white text-2xl">
                        {currentMatch.display_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-lg">
                      {currentMatch.display_name}
                    </h4>
                    {currentMatch.location && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {currentMatch.location}
                      </p>
                    )}
                  </div>

                  {/* Bio */}
                  {currentMatch.bio && (
                    <div className="px-4 pb-3">
                      <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 text-center">
                        {currentMatch.bio}
                      </p>
                    </div>
                  )}

                  {/* Values Tags */}
                  {currentMatch.values_tags?.length > 0 && (
                    <div className="px-4 pb-3">
                      <div className="flex flex-wrap justify-center gap-1">
                        {currentMatch.values_tags.slice(0, 3).map((tag, i) => (
                          <span 
                            key={i} 
                            className="px-2 py-0.5 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {currentMatch.values_tags.length > 3 && (
                          <span className="text-xs text-slate-400">+{currentMatch.values_tags.length - 3}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Seeking */}
                  {currentMatch.seeking && (
                    <div className="px-4 pb-3 text-center">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Seeking: {currentMatch.seeking}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-3">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl gap-2 border-pink-200 hover:bg-pink-50 hover:border-pink-300"
                    onClick={() => handleViewProfile(currentMatch)}
                  >
                    <Sparkles className="w-4 h-4 text-pink-500" />
                    View
                  </Button>
                  <Button
                    className="flex-1 rounded-xl gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                    onClick={() => handleOpenChat(currentMatch)}
                  >
                    <MessageCircle className="w-4 h-4" />
                    Message
                  </Button>
                </div>

                {/* Pagination Dots */}
                {enrichedMatches.length > 1 && (
                  <div className="flex justify-center gap-1.5 mt-4">
                    {enrichedMatches.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={cn(
                          "w-2 h-2 rounded-full transition-all",
                          i === currentIndex 
                            ? "bg-pink-500 w-4" 
                            : "bg-slate-300 hover:bg-slate-400"
                        )}
                      />
                    ))}
                  </div>
                )}

                {/* Counter */}
                <p className="text-center text-xs text-slate-400 mt-2">
                  {currentIndex + 1} of {enrichedMatches.length}
                </p>
              </div>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}