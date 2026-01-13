import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, Brain, Sparkles, Search, Target, Heart, Star,
  Loader2, ChevronRight, MessageSquare, Calendar, Zap,
  Briefcase, Code, Palette, BookOpen, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";
import { createPageUrl } from '@/utils';

// Skill categories for matching
const SKILL_CATEGORIES = {
  technical: { icon: Code, color: 'blue', label: 'Technical' },
  creative: { icon: Palette, color: 'pink', label: 'Creative' },
  leadership: { icon: Shield, color: 'amber', label: 'Leadership' },
  teaching: { icon: BookOpen, color: 'emerald', label: 'Teaching' },
  healing: { icon: Heart, color: 'rose', label: 'Healing' },
  business: { icon: Briefcase, color: 'violet', label: 'Business' }
};

export default function AICollaboratorHub({ userId, profile }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('suggestions');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  // Fetch user's projects
  const { data: projects = [] } = useQuery({
    queryKey: ['userProjects', userId],
    queryFn: () => base44.entities.Project.filter({ creator_id: userId }),
    enabled: !!userId
  });

  // Fetch user's missions
  const { data: missions = [] } = useQuery({
    queryKey: ['userMissions', userId],
    queryFn: () => base44.entities.Mission.filter({ creator_id: userId, status: 'active' }),
    enabled: !!userId
  });

  // Fetch all profiles for matching
  const { data: allProfiles = [] } = useQuery({
    queryKey: ['allProfiles'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 100)
  });

  // Generate AI collaborator suggestions
  const generateSuggestions = useMutation({
    mutationFn: async (context) => {
      setGenerating(true);

      const projectContext = context.type === 'project' && context.item 
        ? `Project: ${context.item.title}\nDescription: ${context.item.description}\nSkills Needed: ${context.item.skills_needed?.join(', ') || 'Not specified'}`
        : '';

      const missionContext = context.type === 'mission' && context.item
        ? `Mission: ${context.item.title}\nObjective: ${context.item.objective}\nRoles Needed: ${context.item.roles_needed?.join(', ') || 'Not specified'}`
        : '';

      const prompt = `Analyze these user profiles and suggest the top 5 collaborators for the following context:

User's Profile:
- Skills: ${profile?.skills?.join(', ') || 'Not specified'}
- Values: ${profile?.values_tags?.join(', ') || 'Not specified'}
- Intentions: ${profile?.intentions?.join(', ') || 'Not specified'}

${projectContext}
${missionContext}

Available Collaborators (analyze these profiles):
${allProfiles.slice(0, 30).map(p => `
- ${p.display_name} (${p.user_id})
  Skills: ${p.skills?.join(', ') || 'None listed'}
  Values: ${p.values_tags?.join(', ') || 'None listed'}
  Intentions: ${p.intentions?.join(', ') || 'None listed'}
  Rank: ${p.rp_rank_code || 'seeker'}
`).join('')}

For each suggested collaborator, provide:
1. Why they're a good fit (specific reasons based on profile data)
2. Skill complementarity score (0-100)
3. Value alignment score (0-100)
4. Collaboration potential areas
5. Suggested ice-breaker or conversation starter`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            collaborators: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  user_id: { type: "string" },
                  display_name: { type: "string" },
                  fit_reason: { type: "string" },
                  skill_score: { type: "number" },
                  value_score: { type: "number" },
                  collaboration_areas: { type: "array", items: { type: "string" } },
                  ice_breaker: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Enrich with full profile data
      const enriched = (response.collaborators || []).map(collab => {
        const fullProfile = allProfiles.find(p => p.user_id === collab.user_id);
        return { ...collab, profile: fullProfile };
      }).filter(c => c.profile);

      return enriched;
    },
    onSuccess: (data) => {
      setSuggestions(data);
      setGenerating(false);
    },
    onError: () => {
      setGenerating(false);
    }
  });

  // Handle opening profile
  const openProfile = (userId) => {
    document.dispatchEvent(new CustomEvent('openProfile', { detail: { userId } }));
  };

  // Handle opening chat
  const openChat = (collaborator) => {
    document.dispatchEvent(new CustomEvent('openFloatingChat', {
      detail: {
        recipientId: collaborator.user_id,
        recipientName: collaborator.display_name,
        recipientAvatar: collaborator.profile?.avatar_url
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-br from-violet-600 to-purple-700 text-white border-0">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <CardTitle>Collaboration Hub</CardTitle>
              <CardDescription className="text-violet-200">
                AI-powered collaborator discovery for your projects and missions
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="suggestions" className="gap-2">
            <Brain className="w-4 h-4" />
            AI Suggestions
          </TabsTrigger>
          <TabsTrigger value="projects" className="gap-2">
            <Briefcase className="w-4 h-4" />
            For Projects
          </TabsTrigger>
          <TabsTrigger value="missions" className="gap-2">
            <Target className="w-4 h-4" />
            For Missions
          </TabsTrigger>
        </TabsList>

        {/* AI Suggestions Tab */}
        <TabsContent value="suggestions" className="space-y-4">
          <Button
            onClick={() => generateSuggestions.mutate({ type: 'general' })}
            disabled={generating}
            className="w-full bg-gradient-to-r from-violet-600 to-purple-600"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            Generate Collaborator Suggestions
          </Button>

          {suggestions.length > 0 && (
            <ScrollArea className="h-96">
              <div className="space-y-3 pr-4">
                {suggestions.map((collab, idx) => (
                  <CollaboratorCard
                    key={collab.user_id}
                    collaborator={collab}
                    onViewProfile={() => openProfile(collab.user_id)}
                    onStartChat={() => openChat(collab)}
                    rank={idx + 1}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-4">
          {projects.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No projects yet</p>
              <Button variant="outline" className="mt-3" asChild>
                <a href={createPageUrl('Projects')}>Create a Project</a>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.slice(0, 5).map(project => (
                <div
                  key={project.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-violet-300 transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedProject(project);
                    generateSuggestions.mutate({ type: 'project', item: project });
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-900">{project.title}</h4>
                      <p className="text-sm text-slate-500 line-clamp-1">{project.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Missions Tab */}
        <TabsContent value="missions" className="space-y-4">
          {missions.length === 0 ? (
            <div className="text-center py-8">
              <Target className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No active missions</p>
              <Button variant="outline" className="mt-3" asChild>
                <a href={createPageUrl('Missions')}>Create a Mission</a>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {missions.slice(0, 5).map(mission => (
                <div
                  key={mission.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-violet-300 transition-all cursor-pointer"
                  onClick={() => generateSuggestions.mutate({ type: 'mission', item: mission })}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-900">{mission.title}</h4>
                      <p className="text-sm text-slate-500 line-clamp-1">{mission.objective}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CollaboratorCard({ collaborator, onViewProfile, onStartChat, rank }) {
  const [expanded, setExpanded] = useState(false);
  const overallScore = Math.round((collaborator.skill_score + collaborator.value_score) / 2);

  return (
    <motion.div
      layout
      className="p-4 rounded-xl border border-slate-200 bg-white hover:shadow-md transition-all"
    >
      <div className="flex items-start gap-3">
        {/* Rank Badge */}
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
          rank === 1 && "bg-amber-100 text-amber-700",
          rank === 2 && "bg-slate-200 text-slate-700",
          rank === 3 && "bg-orange-100 text-orange-700",
          rank > 3 && "bg-slate-100 text-slate-600"
        )}>
          {rank}
        </div>

        {/* Avatar */}
        <Avatar className="w-12 h-12 shrink-0 cursor-pointer" onClick={onViewProfile}>
          <AvatarImage src={collaborator.profile?.avatar_url} />
          <AvatarFallback>{collaborator.display_name?.charAt(0)}</AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 
              className="font-semibold text-slate-900 hover:text-violet-600 cursor-pointer"
              onClick={onViewProfile}
            >
              {collaborator.display_name}
            </h4>
            <Badge className={cn(
              "text-xs",
              overallScore >= 80 && "bg-emerald-100 text-emerald-700",
              overallScore >= 60 && overallScore < 80 && "bg-blue-100 text-blue-700",
              overallScore < 60 && "bg-slate-100 text-slate-700"
            )}>
              {overallScore}% Match
            </Badge>
          </div>

          {/* Scores */}
          <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Code className="w-3 h-3" />
              Skills: {collaborator.skill_score}%
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              Values: {collaborator.value_score}%
            </span>
          </div>

          {/* Fit Reason Preview */}
          <p className="text-sm text-slate-600 mt-2 line-clamp-2">{collaborator.fit_reason}</p>

          {/* Expand/Collapse */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="mt-2 text-violet-600 p-0 h-auto"
          >
            {expanded ? 'Show less' : 'Show more'}
            <ChevronRight className={cn("w-4 h-4 ml-1 transition-transform", expanded && "rotate-90")} />
          </Button>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-4 border-t border-slate-100 space-y-4">
              {/* Collaboration Areas */}
              {collaborator.collaboration_areas?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-2">Collaboration Potential</p>
                  <div className="flex flex-wrap gap-2">
                    {collaborator.collaboration_areas.map((area, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Ice Breaker */}
              {collaborator.ice_breaker && (
                <div className="p-3 rounded-lg bg-violet-50 border border-violet-100">
                  <p className="text-xs font-medium text-violet-700 mb-1">💡 Conversation Starter</p>
                  <p className="text-sm text-violet-800 italic">"{collaborator.ice_breaker}"</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={onViewProfile}
                >
                  View Profile
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-violet-600 hover:bg-violet-700"
                  onClick={onStartChat}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}