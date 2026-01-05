import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Search,
  Filter,
  Sparkles,
  Clock,
  Target,
  Users,
  Send,
  MessageCircle,
  UserPlus,
  Zap,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Star,
} from "lucide-react";
import CollaborationRequestModal from "./CollaborationRequestModal";
import CollaborationRequestsPanel from "./CollaborationRequestsPanel";

const PROJECT_STAGES = [
  { value: 'all', label: 'Any Stage' },
  { value: 'ideation', label: 'Ideation' },
  { value: 'planning', label: 'Planning' },
  { value: 'early_development', label: 'Early Development' },
  { value: 'active', label: 'Active' },
  { value: 'scaling', label: 'Scaling' },
  { value: 'maintenance', label: 'Maintenance' },
];

const COMMITMENT_LEVELS = [
  { value: 'all', label: 'Any Commitment' },
  { value: 'few_hours_week', label: 'Few hours/week' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'full_time', label: 'Full-time' },
  { value: 'flexible', label: 'Flexible' },
  { value: 'one_time', label: 'One-time' },
];

const ROLE_TYPES = [
  { value: 'all', label: 'Any Role' },
  { value: 'co-founder', label: 'Co-founder' },
  { value: 'contributor', label: 'Contributor' },
  { value: 'advisor', label: 'Advisor' },
  { value: 'mentor', label: 'Mentor' },
  { value: 'learner', label: 'Learner' },
  { value: 'partner', label: 'Partner' },
];

// Sophisticated matching algorithm
function calculateMatchScore(myProfile, mySkills, otherProfile, filters) {
  let score = 0;
  const reasons = [];

  // 1. Skill match (up to 40 points)
  const mySkillNames = mySkills.map(s => s.skill_name?.toLowerCase()) || [];
  const otherSkills = (otherProfile.skills || []).map(s => s.toLowerCase());
  const filterSkills = filters.skills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  
  // Match against filter skills
  const matchedFilterSkills = filterSkills.filter(s => 
    otherSkills.some(os => os.includes(s) || s.includes(os))
  );
  score += matchedFilterSkills.length * 10;
  if (matchedFilterSkills.length > 0) {
    reasons.push(`Skills: ${matchedFilterSkills.slice(0, 3).join(', ')}`);
  }

  // Complementary skills (skills they have that I don't)
  const complementarySkills = otherSkills.filter(s => 
    !mySkillNames.some(ms => ms.includes(s) || s.includes(ms))
  );
  score += Math.min(complementarySkills.length * 2, 10);

  // 2. Values alignment (up to 25 points)
  const myValues = myProfile?.values_tags || [];
  const otherValues = otherProfile.values_tags || [];
  const sharedValues = myValues.filter(v => 
    otherValues.some(ov => ov.toLowerCase() === v.toLowerCase())
  );
  score += sharedValues.length * 5;
  if (sharedValues.length >= 2) {
    reasons.push(`Shared values: ${sharedValues.slice(0, 2).join(', ')}`);
  }

  // 3. Intentions alignment (up to 15 points)
  const myIntentions = myProfile?.intentions || [];
  const otherIntentions = otherProfile.intentions || [];
  const sharedIntentions = myIntentions.filter(i => 
    otherIntentions.some(oi => oi.toLowerCase() === i.toLowerCase())
  );
  score += sharedIntentions.length * 5;
  if (sharedIntentions.length > 0) {
    reasons.push(`Goals: ${sharedIntentions[0]}`);
  }

  // 4. Collaboration preferences match (up to 20 points)
  const collabPrefs = otherProfile.collaboration_preferences || {};
  
  // Open to collaborate bonus
  if (collabPrefs.open_to_collaborate !== false) {
    score += 5;
  }

  // Time commitment match
  if (filters.commitment !== 'all' && collabPrefs.preferred_commitment) {
    if (collabPrefs.preferred_commitment === filters.commitment || 
        collabPrefs.preferred_commitment === 'flexible' ||
        filters.commitment === 'flexible') {
      score += 5;
      reasons.push(`Available: ${collabPrefs.preferred_commitment}`);
    }
  }

  // Role preference match
  if (filters.role !== 'all' && collabPrefs.preferred_roles?.length > 0) {
    if (collabPrefs.preferred_roles.includes(filters.role)) {
      score += 5;
    }
  }

  // Project stage interest match
  if (filters.stage !== 'all' && collabPrefs.project_stages_interested?.length > 0) {
    if (collabPrefs.project_stages_interested.includes(filters.stage)) {
      score += 5;
    }
  }

  // 5. Activity & reputation (up to 15 points)
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  const isOnline = otherProfile.last_seen_at && new Date(otherProfile.last_seen_at) > fiveMinutesAgo;
  
  if (isOnline) {
    score += 5;
    reasons.push('Online now');
  }

  // Trust & reputation bonus
  score += Math.min((otherProfile.trust_score || 0) / 10, 5);
  score += Math.min((otherProfile.rank_points || 0) / 100, 5);

  // 6. Recent joiner bonus (new members, last 7 days)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const isNew = otherProfile.created_date && new Date(otherProfile.created_date) > sevenDaysAgo;
  if (isNew) {
    score += 3;
    reasons.push('New member');
  }

  // Normalize score to 0-100
  const normalizedScore = Math.min(Math.round(score), 100);

  return {
    score: normalizedScore,
    reasons,
    sharedValues,
    matchedSkills: matchedFilterSkills,
    complementarySkills: complementarySkills.slice(0, 5),
    isOnline,
    isNew,
  };
}

export default function CollaboratorFinder() {
  const queryClient = useQueryClient();
  const [selectedMissionId, setSelectedMissionId] = useState("");
  const [filters, setFilters] = useState({
    skills: "",
    stage: "all",
    commitment: "all",
    role: "all",
    minScore: 20,
  });
  const [notes, setNotes] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedCollaborator, setSelectedCollaborator] = useState(null);
  const [activeTab, setActiveTab] = useState("discover");

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const { data: myProfile } = useQuery({
    queryKey: ["myProfile", user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_id: user.email });
      return profiles?.[0];
    },
    enabled: !!user?.email,
  });

  const { data: mySkills = [] } = useQuery({
    queryKey: ["mySkillsList", user?.email],
    queryFn: () => base44.entities.Skill.filter({ user_id: user.email }),
    enabled: !!user?.email,
  });

  const { data: myMissions = [] } = useQuery({
    queryKey: ["myMissions"],
    queryFn: async () => {
      const u = await base44.auth.me();
      return base44.entities.Mission.filter({ creator_id: u.email, status: "active" }, "-updated_date", 50);
    },
    enabled: true,
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["allProfiles"],
    queryFn: () => base44.entities.UserProfile.list("-last_seen_at", 200),
  });

  const selectedMission = useMemo(() =>
    myMissions.find((m) => m.id === selectedMissionId),
  [myMissions, selectedMissionId]);

  React.useEffect(() => {
    if (selectedMission && (selectedMission.roles_needed?.length || 0) > 0) {
      setFilters(prev => ({ ...prev, skills: selectedMission.roles_needed.join(", ") }));
    }
  }, [selectedMissionId]);

  // Calculate scores for all profiles
  const scoredProfiles = useMemo(() => {
    if (!myProfile) return [];
    
    return profiles
      .filter((p) => p.user_id !== user?.email)
      .map((p) => {
        const matchData = calculateMatchScore(myProfile, mySkills, p, filters);
        return { profile: p, ...matchData };
      })
      .filter((p) => p.score >= filters.minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, 30);
  }, [profiles, myProfile, mySkills, filters, user]);

  const inviteToMission = useMutation({
    mutationFn: async ({ mission, targetUserId }) => {
      const current = mission.participant_ids || [];
      if (current.includes(targetUserId)) return mission;
      return base44.entities.Mission.update(mission.id, {
        participant_ids: [...current, targetUserId],
        participant_count: (mission.participant_count || 0) + 1,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["myMissions"] }),
  });

  const messageUser = (p) => {
    const event = new CustomEvent("openFloatingChat", {
      detail: {
        recipientId: p.user_id,
        recipientName: p.display_name,
        recipientAvatar: p.avatar_url,
      },
    });
    document.dispatchEvent(event);
  };

  const openRequestModal = (profile) => {
    setSelectedCollaborator(profile);
    setRequestModalOpen(true);
  };

  const getScoreColor = (score) => {
    if (score >= 70) return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (score >= 50) return "bg-violet-100 text-violet-700 border-violet-200";
    if (score >= 30) return "bg-blue-100 text-blue-700 border-blue-200";
    return "bg-slate-100 text-slate-600 border-slate-200";
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full max-w-md">
          <TabsTrigger value="discover" className="flex-1">
            <Search className="w-4 h-4 mr-1.5" />
            Discover
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex-1">
            <Users className="w-4 h-4 mr-1.5" />
            Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="mt-6">
          <div className="bg-white rounded-2xl border p-4 md:p-6">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-500" />
                Find Collaborators
              </h2>
              <p className="text-slate-500 text-sm">
                AI-powered matching based on skills, values, availability, and goals
              </p>
            </div>

            {/* Filters */}
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-slate-600 mb-1 block">
                    <Search className="w-3 h-3 inline mr-1" />
                    Skills / Roles Needed
                  </label>
                  <Input
                    className="rounded-xl"
                    placeholder="e.g., react, ui design, community manager"
                    value={filters.skills}
                    onChange={(e) => setFilters(prev => ({ ...prev, skills: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Mission</label>
                  <Select value={selectedMissionId} onValueChange={setSelectedMissionId}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select mission" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>No mission</SelectItem>
                      {myMissions.map((m) => (
                        <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Min Score</label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[filters.minScore]}
                      onValueChange={([v]) => setFilters(prev => ({ ...prev, minScore: v }))}
                      min={0}
                      max={80}
                      step={5}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium text-slate-600 w-8">{filters.minScore}%</span>
                  </div>
                </div>
              </div>

              {/* Advanced filters toggle */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700"
              >
                <Filter className="w-4 h-4" />
                Advanced Filters
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showAdvanced && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50">
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Project Stage</label>
                    <Select value={filters.stage} onValueChange={(v) => setFilters(prev => ({ ...prev, stage: v }))}>
                      <SelectTrigger className="rounded-xl bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROJECT_STAGES.map(s => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Availability</label>
                    <Select value={filters.commitment} onValueChange={(v) => setFilters(prev => ({ ...prev, commitment: v }))}>
                      <SelectTrigger className="rounded-xl bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COMMITMENT_LEVELS.map(c => (
                          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Role Type</label>
                    <Select value={filters.role} onValueChange={(v) => setFilters(prev => ({ ...prev, role: v }))}>
                      <SelectTrigger className="rounded-xl bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLE_TYPES.map(r => (
                          <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            {/* Results */}
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-3">
                {scoredProfiles.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">No matches found. Try adjusting your filters.</p>
                  </div>
                )}
                {scoredProfiles.map(({ profile, score, reasons, sharedValues, matchedSkills, complementarySkills, isOnline, isNew }) => (
                  <div 
                    key={profile.id} 
                    className="flex items-start gap-4 p-4 rounded-xl border hover:shadow-md transition-shadow bg-white"
                  >
                    <div className="relative">
                      <Avatar className="w-12 h-12 cursor-pointer" data-user-id={profile.user_id}>
                        <AvatarImage src={profile.avatar_url} />
                        <AvatarFallback className="bg-violet-100 text-violet-600">
                          {profile.display_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {isOnline && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-slate-900">{profile.display_name}</p>
                        {isNew && (
                          <Badge className="h-5 text-[10px] bg-emerald-100 text-emerald-700">New</Badge>
                        )}
                        {profile.rank_code && profile.rank_code !== 'seeker' && (
                          <Badge variant="outline" className="h-5 text-[10px] capitalize">
                            {profile.rank_code}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Match reasons */}
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {reasons.slice(0, 3).map((r, i) => (
                          <span key={i} className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            {r}
                          </span>
                        ))}
                      </div>

                      {/* Matched skills */}
                      {matchedSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {matchedSkills.map((s, i) => (
                            <Badge key={i} className="text-[10px] bg-violet-100 text-violet-700">{s}</Badge>
                          ))}
                        </div>
                      )}

                      {/* Complementary skills */}
                      {complementarySkills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {complementarySkills.slice(0, 3).map((s, i) => (
                            <Badge key={i} variant="outline" className="text-[10px]">{s}</Badge>
                          ))}
                          {complementarySkills.length > 3 && (
                            <span className="text-[10px] text-slate-400">+{complementarySkills.length - 3} more</span>
                          )}
                        </div>
                      )}

                      {/* Shared values */}
                      {sharedValues.length > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          <Star className="w-3 h-3 text-amber-500" />
                          <span className="text-xs text-slate-500">
                            Values: {sharedValues.slice(0, 2).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Badge className={cn("text-sm font-bold border", getScoreColor(score))}>
                        {score}%
                      </Badge>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-lg h-8"
                          onClick={() => messageUser(profile)}
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          className="rounded-lg h-8 bg-violet-600 hover:bg-violet-700"
                          onClick={() => openRequestModal(profile)}
                        >
                          <Send className="w-3.5 h-3.5 mr-1" />
                          Request
                        </Button>
                      </div>

                      {selectedMission && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="rounded-lg h-7 text-xs"
                          onClick={() => inviteToMission.mutate({ mission: selectedMission, targetUserId: profile.user_id })}
                        >
                          <UserPlus className="w-3 h-3 mr-1" />
                          Add to Mission
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          <CollaborationRequestsPanel userId={user?.email} />
        </TabsContent>
      </Tabs>

      {/* Collaboration Request Modal */}
      {selectedCollaborator && (
        <CollaborationRequestModal
          open={requestModalOpen}
          onClose={() => {
            setRequestModalOpen(false);
            setSelectedCollaborator(null);
          }}
          targetUser={selectedCollaborator}
          myProfile={myProfile}
          prefilledMission={selectedMission}
        />
      )}
    </div>
  );
}