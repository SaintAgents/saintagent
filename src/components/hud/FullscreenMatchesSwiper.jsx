import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { X, Heart, MessageSquare, ChevronLeft, ChevronRight, Sparkles, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { createPageUrl } from '@/utils';

export default function FullscreenMatchesSwiper({ open, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const containerRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Fetch matches
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['matches', currentUser?.email],
    queryFn: () => base44.entities.Match.filter({ user_id: currentUser.email, status: 'active' }, '-match_score', 20),
    enabled: !!currentUser?.email && open
  });

  // Fetch profiles for matches
  const { data: profiles = [] } = useQuery({
    queryKey: ['matchProfiles', matches],
    queryFn: async () => {
      const targetIds = matches.map(m => m.target_id).filter(Boolean);
      if (targetIds.length === 0) return [];
      const allProfiles = await base44.entities.UserProfile.list();
      return allProfiles.filter(p => targetIds.includes(p.user_id));
    },
    enabled: matches.length > 0 && open
  });

  const getProfileForMatch = (match) => {
    return profiles.find(p => p.user_id === match.target_id);
  };

  const handleNext = () => {
    if (currentIndex < matches.length - 1) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Touch handlers for swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;
    
    if (diff > threshold) {
      handleNext();
    } else if (diff < -threshold) {
      handlePrev();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') onClose();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, currentIndex, matches.length]);

  const handleOpenChat = (match) => {
    const profile = getProfileForMatch(match);
    if (profile) {
      document.dispatchEvent(new CustomEvent('openFloatingChat', {
        detail: {
          recipientId: profile.user_id,
          recipientName: profile.display_name,
          recipientAvatar: profile.avatar_url
        }
      }));
      onClose();
    }
  };

  const handleViewProfile = (match) => {
    document.dispatchEvent(new CustomEvent('openProfile', {
      detail: { userId: match.target_id }
    }));
    onClose();
  };

  if (!open) return null;

  const currentMatch = matches[currentIndex];
  const currentProfile = currentMatch ? getProfileForMatch(currentMatch) : null;

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
      >
        <X className="w-6 h-6" />
      </Button>

      {/* Match counter */}
      <div className="absolute top-4 left-4 z-10 text-white/80 text-sm font-medium">
        {matches.length > 0 ? `${currentIndex + 1} / ${matches.length}` : 'No matches'}
      </div>

      {/* Main content */}
      <div 
        ref={containerRef}
        className="h-full w-full flex items-center justify-center"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {isLoading ? (
          <div className="text-white">Loading matches...</div>
        ) : matches.length === 0 ? (
          <div className="text-center text-white p-8">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-violet-400" />
            <h2 className="text-2xl font-bold mb-2">No matches yet</h2>
            <p className="text-white/70 mb-6">Complete your profile to get matched with others</p>
            <Button onClick={() => { window.location.href = createPageUrl('Matches'); onClose(); }}>
              Go to Matches
            </Button>
          </div>
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentIndex}
              initial={{ x: direction * 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction * -300, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="w-full h-full flex flex-col"
            >
              {/* Profile Image */}
              <div className="flex-1 relative">
                {currentProfile?.avatar_url ? (
                  <img
                    src={currentProfile.avatar_url}
                    alt={currentProfile.display_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center">
                    <span className="text-8xl text-white/30">
                      {currentProfile?.display_name?.[0] || '?'}
                    </span>
                  </div>
                )}
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                
                {/* Profile info overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h2 className="text-3xl font-bold mb-1">
                    {currentProfile?.display_name || currentMatch?.target_name || 'Unknown'}
                  </h2>
                  
                  {currentProfile?.tagline && (
                    <p className="text-white/80 text-lg mb-3">{currentProfile.tagline}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-white/70 text-sm mb-4">
                    {currentProfile?.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {currentProfile.location}
                      </span>
                    )}
                    {currentMatch?.match_score && (
                      <span className="flex items-center gap-1 text-violet-400">
                        <Heart className="w-4 h-4 fill-current" />
                        {currentMatch.match_score}% match
                      </span>
                    )}
                  </div>
                  
                  {/* Shared values */}
                  {currentMatch?.shared_values?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {currentMatch.shared_values.slice(0, 4).map((value, i) => (
                        <span key={i} className="px-3 py-1 bg-white/20 rounded-full text-sm">
                          {value}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Action buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleOpenChat(currentMatch)}
                      className="flex-1 bg-violet-600 hover:bg-violet-700"
                    >
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Message
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleViewProfile(currentMatch)}
                      className="flex-1 border-white/30 text-white hover:bg-white/10"
                    >
                      View Profile
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Navigation arrows - desktop */}
      {matches.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 disabled:opacity-30 hidden md:flex"
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            disabled={currentIndex === matches.length - 1}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 disabled:opacity-30 hidden md:flex"
          >
            <ChevronRight className="w-8 h-8" />
          </Button>
        </>
      )}

      {/* Swipe indicator - mobile */}
      {matches.length > 1 && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden">
          {matches.slice(0, Math.min(matches.length, 10)).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                i === currentIndex ? "bg-white" : "bg-white/30"
              )}
            />
          ))}
          {matches.length > 10 && <span className="text-white/50 text-xs ml-1">+{matches.length - 10}</span>}
        </div>
      )}
    </div>
  );
}