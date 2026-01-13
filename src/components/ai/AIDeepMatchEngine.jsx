import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { 
  Brain, Sparkles, Settings2, Star, Zap, Heart, Users,
  Loader2, ChevronDown, Target, Compass, MessageSquare,
  ThumbsUp, ThumbsDown, Sliders, Save, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";

export default function AIDeepMatchEngine({ userId, profile }) {
  const queryClient = useQueryClient();
  const [showSettings, setShowSettings] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [deepMatches, setDeepMatches] = useState([]);
  const [feedbackModal, setFeedbackModal] = useState(null);

  // Fetch engine preferences
  const { data: preferences } = useQuery({
    queryKey: ['enginePreferences', userId],
    queryFn: async () => {
      const prefs = await base44.entities.EnginePreference.filter({ user_id: userId });
      return prefs?.[0];
    },
    enabled: !!userId
  });

  // Local settings state
  const [settings, setSettings] = useState({
    serendipity_level: preferences?.deep_match_preferences?.serendipity_level || 'balanced',
    collaboration_weight: preferences?.deep_match_preferences?.collaboration_weight || 5,
    mission_alignment_weight: preferences?.deep_match_preferences?.mission_alignment_weight || 5,
    skill_complement_weight: preferences?.deep_match_preferences?.skill_complement_weight || 5,
    value_resonance_weight: preferences?.deep_match_preferences?.value_resonance_weight || 7,
    analyze_past_interactions: preferences?.deep_match_preferences?.analyze_past_interactions ?? true,
    include_declared_intentions: preferences?.deep_match_preferences?.include_declared_intentions ?? true,
    desired_skills_filter: preferences?.deep_match_preferences?.desired_skills_filter || [],
    shared_values_filter: preferences?.deep_match_preferences?.shared_values_filter || [],
    mission_interests_filter: preferences?.deep_match_preferences?.mission_interests_filter || []
  });

  // Update preferences when loaded
  React.useEffect(() => {
    if (preferences?.deep_match_preferences) {
      setSettings(prev => ({
        ...prev,
        ...preferences.deep_match_preferences
      }));
    }
  }, [preferences]);

  // Fetch all profiles for matching
  const { data: allProfiles = [] } = useQuery({
    queryKey: ['allProfiles'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 100)
  });

  // Fetch user's past interactions (meetings, messages)
  const { data: pastMeetings = [] } = useQuery({
    queryKey: ['pastMeetings', userId],
    queryFn: () => base44.entities.Meeting.filter({ 
      host_id: userId, 
      status: 'completed' 
    }, '-scheduled_time', 20),
    enabled: !!userId && settings.analyze_past_interactions
  });

  // Save preferences
  const savePreferences = useMutation({
    mutationFn: async () => {
      const prefData = {
        user_id: userId,
        deep_match_enabled: true,
        deep_match_preferences: settings
      };

      if (preferences?.id) {
        await base44.entities.EnginePreference.update(preferences.id, prefData);
      } else {
        await base44.entities.EnginePreference.create(prefData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enginePreferences'] });
      setShowSettings(false);
    }
  });

  // Generate deep matches
  const generateDeepMatches = useMutation({
    mutationFn: async () => {
      setGenerating(true);

      // Analyze past interaction patterns
      const interactionPatterns = settings.analyze_past_interactions
        ? pastMeetings.map(m => ({
            type: m.meeting_type,
            with: m.guest_id,
            outcome: m.status
          }))
        : [];

      const prompt = `Perform deep AI analysis to find highly compatible matches for this user:

User Profile:
- Display Name: ${profile?.display_name}
- Skills: ${profile?.skills?.join(', ') || 'Not specified'}
- Values: ${profile?.values_tags?.join(', ') || 'Not specified'}
- Intentions: ${profile?.intentions?.join(', ') || 'Not specified'}
- Spiritual Practices: ${profile?.spiritual_practices?.join(', ') || 'Not specified'}
- Seeking Support In: ${profile?.seeking_support_in?.join(', ') || 'Not specified'}
- Can Offer Support In: ${profile?.can_offer_support_in?.join(', ') || 'Not specified'}

Matching Preferences (weights 0-10):
- Collaboration Importance: ${settings.collaboration_weight}/10
- Mission Alignment Importance: ${settings.mission_alignment_weight}/10
- Skill Complementarity Importance: ${settings.skill_complement_weight}/10
- Value Resonance Importance: ${settings.value_resonance_weight}/10
- Serendipity Level: ${settings.serendipity_level}

${settings.desired_skills_filter.length > 0 ? `Desired Skills: ${settings.desired_skills_filter.join(', ')}` : ''}
${settings.shared_values_filter.length > 0 ? `Must Share Values: ${settings.shared_values_filter.join(', ')}` : ''}
${settings.mission_interests_filter.length > 0 ? `Mission Interests: ${settings.mission_interests_filter.join(', ')}` : ''}

${settings.analyze_past_interactions ? `Past Interaction Patterns: ${JSON.stringify(interactionPatterns.slice(0, 5))}` : ''}

Available Profiles to Match:
${allProfiles.filter(p => p.user_id !== userId).slice(0, 30).map(p => `
- ${p.display_name} (${p.user_id})
  Skills: ${p.skills?.join(', ') || 'None'}
  Values: ${p.values_tags?.join(', ') || 'None'}
  Intentions: ${p.intentions?.join(', ') || 'None'}
  Practices: ${p.spiritual_practices?.join(', ') || 'None'}
`).join('')}

Based on ${settings.serendipity_level} serendipity level:
- conservative: Focus on clear, obvious matches with high compatibility
- balanced: Mix of compatible matches and some interesting unexpected connections
- adventurous: Prioritize serendipitous, unexpected connections that could spark innovation

Provide 5 deep matches with:
1. Overall compatibility score (weighted by preferences)
2. Detailed reasoning for why this is a meaningful match
3. Specific synergies and collaboration opportunities
4. Potential challenges and how to navigate them
5. Serendipity factor (how unexpected/interesting this match is)`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            matches: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  user_id: { type: "string" },
                  display_name: { type: "string" },
                  overall_score: { type: "number" },
                  collaboration_score: { type: "number" },
                  value_alignment_score: { type: "number" },
                  skill_complement_score: { type: "number" },
                  spiritual_resonance_score: { type: "number" },
                  serendipity_factor: { type: "number" },
                  match_reasoning: { type: "string" },
                  synergies: { type: "array", items: { type: "string" } },
                  collaboration_opportunities: { type: "array", items: { type: "string" } },
                  potential_challenges: { type: "string" },
                  recommended_approach: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Enrich with profile data
      const enriched = (response.matches || []).map(match => {
        const fullProfile = allProfiles.find(p => p.user_id === match.user_id);
        return { ...match, profile: fullProfile };
      }).filter(m => m.profile);

      return enriched;
    },
    onSuccess: (data) => {
      setDeepMatches(data);
      setGenerating(false);
    },
    onError: () => {
      setGenerating(false);
    }
  });

  // Submit match feedback
  const submitFeedback = useMutation({
    mutationFn: async (feedback) => {
      const currentFeedback = preferences?.match_feedback || [];
      const newFeedback = [
        ...currentFeedback,
        {
          match_id: feedback.match_id,
          rating: feedback.rating,
          feedback_type: feedback.type,
          comment: feedback.comment,
          submitted_at: new Date().toISOString()
        }
      ];

      await base44.entities.EnginePreference.update(preferences.id, {
        match_feedback: newFeedback
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enginePreferences'] });
      setFeedbackModal(null);
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <CardTitle>Deep Match Engine</CardTitle>
                <CardDescription className="text-indigo-200">
                  Advanced AI analysis for meaningful connections
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(true)}
              className="text-white hover:bg-white/20"
            >
              <Settings2 className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge className="bg-white/20 text-white">
              Serendipity: {settings.serendipity_level}
            </Badge>
            <Badge className="bg-white/20 text-white">
              Values Weight: {settings.value_resonance_weight}/10
            </Badge>
            <Badge className="bg-white/20 text-white">
              Skills Weight: {settings.skill_complement_weight}/10
            </Badge>
          </div>

          <Button
            onClick={() => generateDeepMatches.mutate()}
            disabled={generating}
            className="w-full bg-white text-indigo-700 hover:bg-indigo-50"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            Generate Deep Matches
          </Button>
        </CardContent>
      </Card>

      {/* Deep Matches Results */}
      {deepMatches.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-600" />
            Deep Match Results
          </h3>

          <ScrollArea className="h-[500px]">
            <div className="space-y-4 pr-4">
              {deepMatches.map((match, idx) => (
                <DeepMatchCard
                  key={match.user_id}
                  match={match}
                  rank={idx + 1}
                  onFeedback={() => setFeedbackModal(match)}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-600" />
              Deep Match Preferences
            </DialogTitle>
            <DialogDescription>
              Fine-tune how the AI finds your ideal connections
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Serendipity Level */}
            <div>
              <Label className="text-sm font-medium">Serendipity Level</Label>
              <p className="text-xs text-slate-500 mb-3">
                How adventurous should your matches be?
              </p>
              <div className="grid grid-cols-3 gap-2">
                {['conservative', 'balanced', 'adventurous'].map(level => (
                  <Button
                    key={level}
                    variant={settings.serendipity_level === level ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSettings(s => ({ ...s, serendipity_level: level }))}
                    className={cn(
                      settings.serendipity_level === level && "bg-indigo-600"
                    )}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Weight Sliders */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <Label className="text-sm">Value Resonance</Label>
                  <span className="text-sm text-slate-500">{settings.value_resonance_weight}/10</span>
                </div>
                <Slider
                  value={[settings.value_resonance_weight]}
                  onValueChange={([v]) => setSettings(s => ({ ...s, value_resonance_weight: v }))}
                  max={10}
                  step={1}
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <Label className="text-sm">Skill Complementarity</Label>
                  <span className="text-sm text-slate-500">{settings.skill_complement_weight}/10</span>
                </div>
                <Slider
                  value={[settings.skill_complement_weight]}
                  onValueChange={([v]) => setSettings(s => ({ ...s, skill_complement_weight: v }))}
                  max={10}
                  step={1}
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <Label className="text-sm">Collaboration Potential</Label>
                  <span className="text-sm text-slate-500">{settings.collaboration_weight}/10</span>
                </div>
                <Slider
                  value={[settings.collaboration_weight]}
                  onValueChange={([v]) => setSettings(s => ({ ...s, collaboration_weight: v }))}
                  max={10}
                  step={1}
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <Label className="text-sm">Mission Alignment</Label>
                  <span className="text-sm text-slate-500">{settings.mission_alignment_weight}/10</span>
                </div>
                <Slider
                  value={[settings.mission_alignment_weight]}
                  onValueChange={([v]) => setSettings(s => ({ ...s, mission_alignment_weight: v }))}
                  max={10}
                  step={1}
                />
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Analyze Past Interactions</Label>
                <Switch
                  checked={settings.analyze_past_interactions}
                  onCheckedChange={(v) => setSettings(s => ({ ...s, analyze_past_interactions: v }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Include Declared Intentions</Label>
                <Switch
                  checked={settings.include_declared_intentions}
                  onCheckedChange={(v) => setSettings(s => ({ ...s, include_declared_intentions: v }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => savePreferences.mutate()}
              disabled={savePreferences.isPending}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {savePreferences.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Save Preferences
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={!!feedbackModal} onOpenChange={() => setFeedbackModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate This Match</DialogTitle>
            <DialogDescription>
              Your feedback helps improve future suggestions
            </DialogDescription>
          </DialogHeader>
          {feedbackModal && (
            <FeedbackForm
              match={feedbackModal}
              onSubmit={(feedback) => submitFeedback.mutate({
                match_id: feedbackModal.user_id,
                ...feedback
              })}
              isPending={submitFeedback.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DeepMatchCard({ match, rank, onFeedback }) {
  const [expanded, setExpanded] = useState(false);

  const openProfile = () => {
    document.dispatchEvent(new CustomEvent('openProfile', { detail: { userId: match.user_id } }));
  };

  const openChat = () => {
    document.dispatchEvent(new CustomEvent('openFloatingChat', {
      detail: {
        recipientId: match.user_id,
        recipientName: match.display_name,
        recipientAvatar: match.profile?.avatar_url
      }
    }));
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
            rank === 1 && "bg-amber-100 text-amber-700",
            rank === 2 && "bg-slate-200 text-slate-700",
            rank === 3 && "bg-orange-100 text-orange-700",
            rank > 3 && "bg-slate-100 text-slate-600"
          )}>
            {rank}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-900 cursor-pointer hover:text-indigo-600" onClick={openProfile}>
                {match.display_name}
              </h4>
              <Badge className="bg-indigo-100 text-indigo-700">
                {match.overall_score}% Match
              </Badge>
            </div>
            
            {/* Score Breakdown */}
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                <Heart className="w-3 h-3 mr-1" />
                Values: {match.value_alignment_score}%
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Zap className="w-3 h-3 mr-1" />
                Skills: {match.skill_complement_score}%
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                Serendipity: {match.serendipity_factor}%
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Match Reasoning */}
        <p className="text-sm text-slate-600 mb-3">{match.match_reasoning}</p>

        <Collapsible open={expanded} onOpenChange={setExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full text-indigo-600">
              {expanded ? 'Show Less' : 'Show Details'}
              <ChevronDown className={cn("w-4 h-4 ml-1 transition-transform", expanded && "rotate-180")} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            {/* Synergies */}
            {match.synergies?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-2">Key Synergies</p>
                <div className="flex flex-wrap gap-2">
                  {match.synergies.map((s, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Collaboration Opportunities */}
            {match.collaboration_opportunities?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-2">Collaboration Opportunities</p>
                <ul className="text-sm text-slate-600 space-y-1">
                  {match.collaboration_opportunities.map((opp, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Target className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                      {opp}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Potential Challenges */}
            {match.potential_challenges && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-xs font-medium text-amber-700 mb-1">Potential Challenges</p>
                <p className="text-sm text-amber-800">{match.potential_challenges}</p>
              </div>
            )}

            {/* Recommended Approach */}
            {match.recommended_approach && (
              <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200">
                <p className="text-xs font-medium text-indigo-700 mb-1">💡 Recommended Approach</p>
                <p className="text-sm text-indigo-800">{match.recommended_approach}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={openProfile}>
                View Profile
              </Button>
              <Button size="sm" className="flex-1 bg-indigo-600 hover:bg-indigo-700" onClick={openChat}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Message
              </Button>
              <Button variant="ghost" size="icon" onClick={onFeedback}>
                <Star className="w-4 h-4 text-amber-500" />
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

function FeedbackForm({ match, onSubmit, isPending }) {
  const [rating, setRating] = useState(0);
  const [feedbackType, setFeedbackType] = useState('');
  const [comment, setComment] = useState('');

  return (
    <div className="space-y-4">
      {/* Star Rating */}
      <div>
        <Label className="text-sm">How relevant was this match?</Label>
        <div className="flex gap-1 mt-2">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className="p-1"
            >
              <Star className={cn(
                "w-6 h-6 transition-colors",
                star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"
              )} />
            </button>
          ))}
        </div>
      </div>

      {/* Feedback Type */}
      <div>
        <Label className="text-sm">Feedback Type</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {[
            { value: 'helpful', label: 'Helpful Match' },
            { value: 'not_relevant', label: 'Not Relevant' },
            { value: 'already_connected', label: 'Already Connected' },
            { value: 'timing_wrong', label: 'Wrong Timing' }
          ].map(opt => (
            <Button
              key={opt.value}
              variant={feedbackType === opt.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFeedbackType(opt.value)}
              className={cn(feedbackType === opt.value && "bg-indigo-600")}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Comment */}
      <div>
        <Label className="text-sm">Additional Comments (Optional)</Label>
        <Input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Any additional feedback..."
          className="mt-2"
        />
      </div>

      <Button
        onClick={() => onSubmit({ rating, type: feedbackType, comment })}
        disabled={!rating || !feedbackType || isPending}
        className="w-full bg-indigo-600 hover:bg-indigo-700"
      >
        {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
        Submit Feedback
      </Button>
    </div>
  );
}