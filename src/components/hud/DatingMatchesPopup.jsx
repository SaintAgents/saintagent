import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Heart,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MapPin,
  X,
  Images,
  User,
  ChevronDown,
  ChevronUp,
  Shield,
  MessageSquare,
  TrendingUp,
  Home,
  GripHorizontal } from
"lucide-react";

import { createPageUrl } from '@/utils';
import { DEMO_AVATARS_MALE, DEMO_AVATARS_FEMALE } from '@/components/demoAvatars';
import PhotoViewer from '@/components/profile/PhotoViewer';

// Compatibility breakdown mini chart component with its own state
function CompatibilityChart({ match }) {
  const [expanded, setExpanded] = useState(true);

  // Generate compatibility scores based on dating profile data - use useMemo to stabilize random values
  const domains = React.useMemo(() => [
  { label: 'Values', icon: Heart, score: match?.core_values_ranked?.length > 0 ? 75 + Math.random() * 20 : 60 + Math.random() * 25, color: 'from-pink-500 to-rose-500' },
  { label: 'Emotional', icon: Shield, score: match?.regulation_style ? 70 + Math.random() * 25 : 55 + Math.random() * 30, color: 'from-purple-500 to-violet-500' },
  { label: 'Communication', icon: MessageSquare, score: match?.comm_depth ? 65 + Math.random() * 30 : 50 + Math.random() * 35, color: 'from-blue-500 to-cyan-500' },
  { label: 'Growth', icon: TrendingUp, score: match?.growth_orientation ? 72 + Math.random() * 23 : 58 + Math.random() * 27, color: 'from-emerald-500 to-teal-500' },
  { label: 'Lifestyle', icon: Home, score: match?.location_mobility ? 68 + Math.random() * 27 : 52 + Math.random() * 33, color: 'from-amber-500 to-orange-500' }],
  [match?.user_id]);

  const overallScore = Math.round(domains.reduce((sum, d) => sum + d.score, 0) / domains.length);

  return (
    <div className="border-t border-slate-100 dark:border-slate-700/50 pt-2">
      <button
        onClick={(e) => {e.stopPropagation();setExpanded(!expanded);}}
        className="w-full px-4 py-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">

        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-violet-500" />
          Compatibility Breakdown
        </span>
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      {expanded &&
      <div className="px-4 pb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-violet-500" />
              Compatibility
            </span>
            <span className="text-sm font-bold text-violet-600 dark:text-violet-400">{overallScore}%</span>
          </div>
          <div className="space-y-1.5">
            {domains.map((domain, idx) =>
          <div key={idx} className="flex items-center gap-2">
                <domain.icon className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
                <span className="text-[10px] text-slate-500 dark:text-slate-400 w-16 truncate">{domain.label}</span>
                <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                className={`h-full bg-gradient-to-r ${domain.color} rounded-full transition-all duration-500`}
                style={{ width: `${Math.round(domain.score)}%` }} />

                </div>
                <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300 w-6 text-right">{Math.round(domain.score)}</span>
              </div>
          )}
          </div>
        </div>
      }
    </div>);

}

export default function DatingMatchesPopup({ currentUser }) {
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const scrollRef = useRef(null);
  
  // Draggable state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  
  // Listen for global open event from TopBar
  useEffect(() => {
    const handleOpenDatingPopup = () => {
      setOpen(true);
    };
    document.addEventListener('openDatingPopup', handleOpenDatingPopup);
    return () => document.removeEventListener('openDatingPopup', handleOpenDatingPopup);
  }, []);
  
  // Reset position when popup closes
  useEffect(() => {
    if (!open) {
      setPosition({ x: 0, y: 0 });
    }
  }, [open]);
  
  const handleDragStart = (e) => {
    if (e.target.closest('button') || e.target.closest('a')) return;
    setIsDragging(true);
    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
    dragStartPos.current = { x: clientX - position.x, y: clientY - position.y };
  };
  
  const handleDrag = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
    setPosition({
      x: clientX - dragStartPos.current.x,
      y: clientY - dragStartPos.current.y
    });
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
  };
  
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDrag);
      document.addEventListener('mouseup', handleDragEnd);
      document.addEventListener('touchmove', handleDrag);
      document.addEventListener('touchend', handleDragEnd);
    }
    return () => {
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', handleDrag);
      document.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging]);

  // Fetch dating profile opt-in status - refetch frequently to catch updates
  const { data: myDatingProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['myDatingProfilePopup', currentUser?.email],
    queryFn: () => base44.entities.DatingProfile.filter({ user_id: currentUser.email }),
    enabled: !!currentUser?.email,
    staleTime: 0, // Always refetch
    refetchOnWindowFocus: true
  });
  // Check ANY of the returned profiles for opt_in (in case of duplicates)
  const isDatingOptedIn = myDatingProfile?.some(p => p.opt_in === true) ?? false;
  const profileLoaded = !isLoadingProfile && myDatingProfile !== undefined;

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

  // Get my dating profile preferences
  const myProfile = myDatingProfile?.[0];
  const myInterestedIn = myProfile?.interested_in || [];
  const myGender = myProfile?.gender;

  // Filter matches based on gender preferences (both ways)
  const otherProfiles = isDatingOptedIn ? datingProfiles.filter((p) => {
    if (p.user_id === currentUser?.email) return false;
    
    // Check if I'm interested in their gender
    const theirGender = p.gender;
    const theyMatch = !theirGender || myInterestedIn.length === 0 || myInterestedIn.includes('all') ||
      (theirGender === 'woman' && myInterestedIn.includes('women')) ||
      (theirGender === 'man' && myInterestedIn.includes('men')) ||
      (theirGender === 'non_binary' && myInterestedIn.includes('non_binary'));
    
    // Check if they're interested in my gender
    const theirInterestedIn = p.interested_in || [];
    const iMatch = !myGender || theirInterestedIn.length === 0 || theirInterestedIn.includes('all') ||
      (myGender === 'woman' && theirInterestedIn.includes('women')) ||
      (myGender === 'man' && theirInterestedIn.includes('men')) ||
      (myGender === 'non_binary' && theirInterestedIn.includes('non_binary'));
    
    return theyMatch && iMatch;
  }) : [];

  // Enrich with user profile data and assign unique demo avatars
  const usedMaleIdx = new Set();
  const usedFemaleIdx = new Set();

  const enrichedMatches = otherProfiles.map((dp, idx) => {
    const userProfile = userProfiles.find((up) => up.user_id === dp.user_id);
    let avatar = dp.avatar_url || userProfile?.avatar_url;

    // Assign unique demo avatar based on their ACTUAL gender, not arbitrary alternation
    if (!avatar || avatar.includes('undefined') || avatar.includes('null')) {
      const isMale = dp.gender === 'man';
      const isFemale = dp.gender === 'woman';
      if (isMale) {
        for (let i = 0; i < DEMO_AVATARS_MALE.length; i++) {
          if (!usedMaleIdx.has(i)) {
            usedMaleIdx.add(i);
            avatar = DEMO_AVATARS_MALE[i];
            break;
          }
        }
        if (!avatar) avatar = DEMO_AVATARS_MALE[idx % DEMO_AVATARS_MALE.length];
      } else if (isFemale) {
        for (let i = 0; i < DEMO_AVATARS_FEMALE.length; i++) {
          if (!usedFemaleIdx.has(i)) {
            usedFemaleIdx.add(i);
            avatar = DEMO_AVATARS_FEMALE[i];
            break;
          }
        }
        if (!avatar) avatar = DEMO_AVATARS_FEMALE[idx % DEMO_AVATARS_FEMALE.length];
      } else {
        // Non-binary or other - pick from either pool
        avatar = idx % 2 === 0 ? DEMO_AVATARS_MALE[idx % DEMO_AVATARS_MALE.length] : DEMO_AVATARS_FEMALE[idx % DEMO_AVATARS_FEMALE.length];
      }
    }

    // Collect all available images for gallery
    const galleryImages = userProfile?.gallery_images || [];
    const allImages = [avatar, ...galleryImages].filter(Boolean);

    // Generate demo name if no real name exists
    let displayName = dp.display_name || userProfile?.display_name;
    if (!displayName || displayName === 'Anonymous') {
      // Use demo names based on gender
      const femaleNames = ['Sophia', 'Luna', 'Maya', 'Aria', 'Elena', 'Nova', 'Zara', 'Ivy', 'Jade', 'Willow'];
      const maleNames = ['Ethan', 'Kai', 'Leo', 'Finn', 'Jasper', 'River', 'Ash', 'Theo', 'Noah', 'Ezra'];
      if (dp.gender === 'woman') {
        displayName = femaleNames[idx % femaleNames.length];
      } else if (dp.gender === 'man') {
        displayName = maleNames[idx % maleNames.length];
      } else {
        displayName = [...femaleNames, ...maleNames][idx % 20];
      }
    }
    
    return {
      ...dp,
      display_name: displayName,
      avatar_url: avatar,
      location: dp.location || userProfile?.location,
      bio: dp.bio || userProfile?.bio,
      values_tags: userProfile?.values_tags || [],
      skills: userProfile?.skills || [],
      all_images: allImages,
      is_demo: dp.is_demo === true || !userProfile
    };
  });

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(enrichedMatches.length - 1, prev + 1));
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
    // Navigate to profile page for all profiles
    window.location.href = createPageUrl('Profile') + `?id=${encodeURIComponent(match.user_id)}`;
    setOpen(false);
  };

  // Swipe handlers for photo gallery
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e, images) => {
    if (!touchStart) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0 && photoIndex < images.length - 1) {
        setPhotoIndex((prev) => prev + 1);
      } else if (diff < 0 && photoIndex > 0) {
        setPhotoIndex((prev) => prev - 1);
      }
    }
    setTouchStart(null);
  };

  const handlePhotoClick = (e, images) => {
    e.stopPropagation();
    if (images.length > 0) {
      setPhotoViewerOpen(true);
    }
  };

  // Reset photo index when match changes
  React.useEffect(() => {
    setPhotoIndex(0);
  }, [currentIndex]);

  // Always render the heart button, but only show matches popup content if opted in
  // This ensures the heart icon is always visible for opted-in users

  const currentMatch = enrichedMatches[currentIndex];

  // Don't render anything if not open
  if (!open) return null;

  // If not opted in, redirect to dating page
  if (profileLoaded && !isDatingOptedIn) {
    window.location.href = createPageUrl('DatingMatches');
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9998]" 
        onClick={() => setOpen(false)}
      />
      
      {/* Centered Draggable Popup */}
      <div 
        ref={dragRef}
        className="fixed z-[9999] w-96 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
        style={{ 
          top: `calc(50% + ${position.y}px)`,
          left: `calc(50% + ${position.x}px)`,
          transform: 'translate(-50%, -50%)',
          cursor: isDragging ? 'grabbing' : 'auto',
          maxHeight: 'calc(100vh - 100px)',
          overflowY: 'auto'
        }}
      >
          {/* Draggable Header */}
          <div 
            className="bg-slate-950 px-4 py-3 flex items-center justify-between border-b border-slate-100 dark:border-[rgba(0,255,136,0.15)] cursor-grab active:cursor-grabbing"
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
          >
            <div className="flex items-center gap-2">
              <GripHorizontal className="w-4 h-4 text-slate-400" />
              <h3 className="text-slate-50 font-semibold dark:text-slate-100">Dating Matches</h3>
            </div>
            <div className="flex items-center gap-1">
              <a href={createPageUrl('DatingMatches')} onClick={() => setOpen(false)}>
                <Button variant="ghost" size="sm" className="text-xs h-7 text-pink-400 hover:text-pink-300">
                  View All
                </Button>
              </a>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-white" onClick={() => setOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

        {enrichedMatches.length === 0 ?
        <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500 px-4">
            <Heart className="w-10 h-10 mb-3 opacity-50" />
            <p className="text-sm text-center">No matches yet</p>
            <p className="text-xs text-center mt-1">Check back soon for new connections</p>
          </div> :

        <div className="relative">
            {/* Navigation Arrows */}
            {enrichedMatches.length > 1 &&
          <>
                <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={cn(
                "absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center transition-all",
                currentIndex === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-white hover:scale-110"
              )}>

                  <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
                <button
              onClick={handleNext}
              disabled={currentIndex === enrichedMatches.length - 1}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center transition-all",
                currentIndex === enrichedMatches.length - 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-white hover:scale-110"
              )}>

                  <ChevronRight className="w-5 h-5 text-slate-600" />
                </button>
              </>
          }

            {/* Match Card */}
            {currentMatch &&
          <div className="p-4">
                <div
              className={cn(
                "rounded-xl border overflow-hidden cursor-pointer hover:shadow-lg transition-shadow",
                "bg-gradient-to-br from-white to-pink-50 dark:from-slate-800 dark:to-pink-900/20 border-pink-100 dark:border-pink-800/30",
                "[data-theme='hacker']_&:bg-[#0a0a0a] [data-theme='hacker']_&:from-[#0a0a0a] [data-theme='hacker']_&:to-[#001a00] [data-theme='hacker']_&:border-[#00ff00] [data-theme='hacker']_&:shadow-[0_0_8px_rgba(0,255,0,0.3)]"
              )}>

                  {/* Photo Gallery with Swipe */}
                  <div
                className="relative"
                onTouchStart={handleTouchStart}
                onTouchEnd={(e) => handleTouchEnd(e, currentMatch.all_images)}>

                    <div className="w-full h-48 overflow-hidden">
                      <img
                    src={currentMatch.all_images[photoIndex] || currentMatch.avatar_url}
                    alt={currentMatch.display_name}
                    className="w-full h-full object-cover transition-transform duration-300" />

                    </div>
                    
                    {/* Photo Gallery Icon */}
                    {currentMatch.all_images.length > 0 &&
                <button
                  onClick={(e) => handlePhotoClick(e, currentMatch.all_images)}
                  className={cn(
                    "absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all",
                    "bg-black/50 hover:bg-black/70 backdrop-blur-sm",
                    "[data-theme='hacker']_&:bg-[#001a00] [data-theme='hacker']_&:border [data-theme='hacker']_&:border-[#00ff00] [data-theme='hacker']_&:hover:shadow-[0_0_10px_#00ff00]"
                  )}
                  title="View all photos">

                        <Images className="w-4 h-4 text-white [data-theme='hacker']_&:text-[#00ff00]" />
                        {currentMatch.all_images.length > 1 &&
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-pink-500 [data-theme='hacker']_&:bg-[#00ff00] text-white [data-theme='hacker']_&:text-black text-[10px] rounded-full flex items-center justify-center font-bold">
                            {currentMatch.all_images.length}
                          </span>
                  }
                      </button>
                }
                    
                    {/* Photo Navigation Dots */}
                    {currentMatch.all_images.length > 1 &&
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        {currentMatch.all_images.map((_, i) =>
                  <button
                    key={i}
                    onClick={(e) => {e.stopPropagation();setPhotoIndex(i);}}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      i === photoIndex ?
                      "bg-white w-4 [data-theme='hacker']_&:bg-[#00ff00]" :
                      "bg-white/50 hover:bg-white/80 [data-theme='hacker']_&:bg-[#00ff00]/50"
                    )} />

                  )}
                      </div>
                }
                    
                    {/* Inline Photo Nav Arrows */}
                    {currentMatch.all_images.length > 1 &&
                <>
                        <button
                    onClick={(e) => {e.stopPropagation();if (photoIndex > 0) setPhotoIndex((prev) => prev - 1);}}
                    className={cn(
                      "absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center",
                      photoIndex === 0 && "opacity-30 cursor-not-allowed"
                    )}>

                          <ChevronLeft className="w-4 h-4 text-white" />
                        </button>
                        <button
                    onClick={(e) => {e.stopPropagation();if (photoIndex < currentMatch.all_images.length - 1) setPhotoIndex((prev) => prev + 1);}}
                    className={cn(
                      "absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center",
                      photoIndex === currentMatch.all_images.length - 1 && "opacity-30 cursor-not-allowed"
                    )}>

                          <ChevronRight className="w-4 h-4 text-white" />
                        </button>
                      </>
                }
                  </div>
                  
                  {/* Name & Location */}
                  <div className="p-4 text-center" onClick={() => handleViewProfile(currentMatch)}>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-lg [data-theme='hacker']_&:text-[#00ff00]">
                      {currentMatch.display_name}
                    </h4>
                    {currentMatch.location &&
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1 mt-1 [data-theme='hacker']_&:text-[#00cc00]">
                        <MapPin className="w-3 h-3" />
                        {currentMatch.location}
                      </p>
                }
                  </div>

                  {/* Bio */}
                  {currentMatch.bio &&
              <div className="px-4 pb-3">
                      <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 text-center">
                        {currentMatch.bio}
                      </p>
                    </div>
              }

                  {/* Values Tags */}
                  {currentMatch.values_tags?.length > 0 &&
              <div className="px-4 pb-3">
                      <div className="flex flex-wrap justify-center gap-1">
                        {currentMatch.values_tags.slice(0, 3).map((tag, i) =>
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 text-xs rounded-full">

                            {tag}
                          </span>
                  )}
                        {currentMatch.values_tags.length > 3 &&
                  <span className="text-xs text-slate-400">+{currentMatch.values_tags.length - 3}</span>
                  }
                      </div>
                    </div>
              }

                  {/* Seeking */}
                  {currentMatch.seeking &&
              <div className="px-4 pb-3 text-center">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Seeking: {currentMatch.seeking}
                      </span>
                    </div>
              }

                  {/* Compatibility Breakdown */}
                  <CompatibilityChart match={currentMatch} />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-3">
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1 rounded-xl gap-2",
                      "border-pink-200 hover:bg-pink-50 hover:border-pink-300",
                      "[data-theme='hacker']_&:bg-[#001a00] [data-theme='hacker']_&:border-[#00ff00] [data-theme='hacker']_&:text-[#00ff00] [data-theme='hacker']_&:hover:bg-[#002200] [data-theme='hacker']_&:hover:shadow-[0_0_8px_#00ff00]"
                    )}
                    onClick={() => handleViewProfile(currentMatch)}>
                    <User className="w-4 h-4 text-pink-500 [data-theme='hacker']_&:text-[#00ff00]" />
                    View Profile
                  </Button>
                  <Button
                    className={cn(
                      "flex-1 rounded-xl gap-2",
                      "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600",
                      "[data-theme='hacker']_&:from-[#00cc00] [data-theme='hacker']_&:to-[#00ff00] [data-theme='hacker']_&:text-black [data-theme='hacker']_&:hover:shadow-[0_0_12px_#00ff00]"
                    )}
                    onClick={() => handleOpenChat(currentMatch)}>
                    <MessageCircle className="w-4 h-4" />
                    Message
                  </Button>
                </div>
                
                {/* Photo Viewer Modal */}
                <PhotoViewer
              open={photoViewerOpen}
              images={currentMatch.all_images}
              startIndex={photoIndex}
              onClose={() => setPhotoViewerOpen(false)} />


                {/* Pagination Dots */}
                {enrichedMatches.length > 1 &&
            <div className="flex justify-center gap-1.5 mt-4">
                    {enrichedMatches.map((_, i) =>
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  i === currentIndex ?
                  "bg-pink-500 w-4" :
                  "bg-slate-300 hover:bg-slate-400"
                )} />

              )}
                  </div>
            }

                {/* Counter */}
                <p className="text-center text-xs text-slate-400 mt-2">
                  {currentIndex + 1} of {enrichedMatches.length}
                </p>
              </div>
          }
          </div>
        }
        </div>
    </>);

}