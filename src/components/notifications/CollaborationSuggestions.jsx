import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sparkles, 
  Users, 
  MessageCircle, 
  X,
  ChevronRight,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createPageUrl } from '@/utils';

export default function CollaborationSuggestions({ profile, compact = false }) {
  const queryClient = useQueryClient();

  // Fetch all user profiles
  const { data: allProfiles = [] } = useQuery({
    queryKey: ['collaborationProfiles'],
    queryFn: () => base44.entities.UserProfile.list('-last_seen_at', 100),
    refetchInterval: 60000, // Refresh every minute
    enabled: !!profile?.user_id
  });

  // Get user's skills
  const { data: mySkills = [] } = useQuery({
    queryKey: ['mySkills', profile?.user_id],
    queryFn: () => base44.entities.Skill.filter({ user_id: profile.user_id }),
    enabled: !!profile?.user_id
  });

  // Early return if no profile - MUST be after all hooks
  if (!profile?.user_id) {
    return null;
  }

  // Calculate collaboration suggestions
  const suggestions = React.useMemo(() => {
    if (!profile?.user_id || !allProfiles.length) return [];

    const myValues = profile.values_tags || [];
    const mySkillNames = mySkills.map(s => s.skill_name?.toLowerCase()) || [];
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return allProfiles
      .filter(p => p.user_id !== profile.user_id)
      .map(other => {
        const otherValues = other.values_tags || [];
        const otherSkills = other.skills || [];
        
        // Calculate value overlap
        const sharedValues = myValues.filter(v => 
          otherValues.some(ov => ov.toLowerCase() === v.toLowerCase())
        );
        
        // Calculate skill complementarity
        const sharedSkills = mySkillNames.filter(s => 
          otherSkills.some(os => os.toLowerCase().includes(s) || s.includes(os.toLowerCase()))
        );
        
        // Check online status
        const isOnline = other.last_seen_at && new Date(other.last_seen_at) > fiveMinutesAgo;
        const isNew = other.created_date && new Date(other.created_date) > sevenDaysAgo;
        
        // Calculate relevance score
        let score = 0;
        score += sharedValues.length * 15;
        score += sharedSkills.length * 20;
        if (isOnline) score += 25;
        if (isNew) score += 10;
        
        // Bonus for similar intentions
        const myIntentions = profile.intentions || [];
        const otherIntentions = other.intentions || [];
        const sharedIntentions = myIntentions.filter(i => 
          otherIntentions.some(oi => oi.toLowerCase() === i.toLowerCase())
        );
        score += sharedIntentions.length * 10;

        return {
          ...other,
          score,
          sharedValues,
          sharedSkills,
          sharedIntentions,
          isOnline,
          isNew
        };
      })
      .filter(p => p.score >= 20) // Minimum threshold
      .sort((a, b) => b.score - a.score)
      .slice(0, compact ? 3 : 10);
  }, [allProfiles, profile, mySkills]);

  // Create notification for collaboration suggestion
  const createNotification = useMutation({
    mutationFn: async (suggestion) => {
      await base44.entities.Notification.create({
        user_id: profile.user_id,
        type: 'collaboration',
        title: `Potential collaborator: ${suggestion.display_name}`,
        message: suggestion.sharedValues.length > 0 
          ? `Shares ${suggestion.sharedValues.slice(0, 2).join(', ')} values with you`
          : `Has complementary skills in ${suggestion.sharedSkills.slice(0, 2).join(', ')}`,
        action_url: createPageUrl('Profile') + `?view=${suggestion.user_id}`,
        priority: suggestion.isOnline ? 'high' : 'normal',
        source_user_id: suggestion.user_id,
        source_user_name: suggestion.display_name,
        source_user_avatar: suggestion.avatar_url,
        metadata: {
          sharedValues: suggestion.sharedValues,
          sharedSkills: suggestion.sharedSkills,
          score: suggestion.score
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const handleConnect = (suggestion) => {
    const event = new CustomEvent('openFloatingChat', {
      detail: {
        recipientId: suggestion.user_id,
        recipientName: suggestion.display_name,
        recipientAvatar: suggestion.avatar_url
      }
    });
    document.dispatchEvent(event);
  };

  const handleViewProfile = (userId) => {
    const event = new CustomEvent('openProfile', { detail: { userId } });
    document.dispatchEvent(event);
  };

  if (!profile?.user_id || suggestions.length === 0) return null;

  if (compact) {
    return (
      <div className="space-y-2">
        {suggestions.map((s) => (
          <button
            key={s.id}
            onClick={() => handleViewProfile(s.user_id)}
            className="w-full flex items-center gap-3 p-2 rounded-lg bg-gradient-to-r from-violet-50 to-purple-50 hover:from-violet-100 hover:to-purple-100 transition-colors text-left"
          >
            <div className="relative">
              <Avatar className="w-9 h-9">
                <AvatarImage src={s.avatar_url} />
                <AvatarFallback className="bg-violet-100 text-violet-600 text-xs">
                  {s.display_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {s.isOnline && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <p className="text-sm font-medium text-slate-900 truncate">{s.display_name}</p>
                {s.isNew && (
                  <Badge className="h-4 text-[9px] bg-emerald-100 text-emerald-700">New</Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 truncate">
                {s.sharedValues.length > 0 
                  ? `Shares: ${s.sharedValues.slice(0, 2).join(', ')}`
                  : s.sharedSkills.length > 0
                    ? `Skills: ${s.sharedSkills.slice(0, 2).join(', ')}`
                    : 'Similar interests'
                }
              </p>
            </div>
            <Badge className="h-5 text-[10px] bg-violet-100 text-violet-700">
              {s.score}%
            </Badge>
          </button>
        ))}
      </div>
    );
  }

  return (
    <Card className="border-violet-200 bg-gradient-to-br from-white to-violet-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="w-4 h-4 text-violet-500" />
          Potential Collaborators
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-auto max-h-96">
          <div className="space-y-3">
            {suggestions.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 hover:border-violet-200 transition-colors"
              >
                <div 
                  className="relative cursor-pointer"
                  onClick={() => handleViewProfile(s.user_id)}
                >
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={s.avatar_url} />
                    <AvatarFallback className="bg-violet-100 text-violet-600">
                      {s.display_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {s.isOnline && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p 
                      className="font-medium text-slate-900 truncate cursor-pointer hover:text-violet-600"
                      onClick={() => handleViewProfile(s.user_id)}
                    >
                      {s.display_name}
                    </p>
                    {s.isNew && (
                      <Badge className="h-5 text-[10px] bg-emerald-100 text-emerald-700">New member</Badge>
                    )}
                    {s.isOnline && (
                      <Badge className="h-5 text-[10px] bg-emerald-100 text-emerald-700">Online</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {s.sharedValues.slice(0, 3).map((v, i) => (
                      <Badge key={i} variant="secondary" className="h-5 text-[10px]">
                        {v}
                      </Badge>
                    ))}
                    {s.sharedSkills.slice(0, 2).map((sk, i) => (
                      <Badge key={`sk-${i}`} className="h-5 text-[10px] bg-blue-100 text-blue-700">
                        {sk}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className="bg-violet-100 text-violet-700">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {s.score}% match
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs"
                    onClick={() => handleConnect(s)}
                  >
                    <MessageCircle className="w-3 h-3 mr-1" />
                    Connect
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}