import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Wand2, 
  Target, 
  Users, 
  Loader2, 
  Plus, 
  RefreshCw,
  Rocket,
  Check,
  Edit3,
  X
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function AIMissionBoard({ onMissionCreated }) {
  const queryClient = useQueryClient();
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedMissions, setGeneratedMissions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedMission, setEditedMission] = useState(null);

  // Fetch current user and profile
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: profiles } = useQuery({
    queryKey: ['userProfile', currentUser?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: currentUser.email }),
    enabled: !!currentUser?.email
  });
  const profile = profiles?.[0];

  // Fetch user skills
  const { data: skills = [] } = useQuery({
    queryKey: ['userSkills', currentUser?.email],
    queryFn: () => base44.entities.Skill.filter({ user_id: currentUser.email }),
    enabled: !!currentUser?.email
  });

  const generateMissions = async () => {
    setIsGenerating(true);
    try {
      const userSkills = skills.filter(s => s.type === 'offer').map(s => s.skill_name).join(', ') || 'general skills';
      const userInterests = profile?.values_tags?.join(', ') || profile?.intentions?.join(', ') || 'community building';
      
      const prompt = `You are a mission designer for a conscious community platform called Saint Agents. 
Generate 3 unique mission ideas based on the following:

User Skills: ${userSkills}
User Interests: ${userInterests}
${customPrompt ? `Additional Context: ${customPrompt}` : ''}

Each mission should:
- Have a compelling title (max 60 chars)
- Have a clear description (2-3 sentences)
- Have a specific objective
- List 2-4 collaborator roles needed
- Suggest GGG reward (10-100)
- Suggest rank points reward (5-50)

Return as JSON array with this structure:
[{
  "title": "string",
  "description": "string", 
  "objective": "string",
  "roles_needed": ["string"],
  "reward_ggg": number,
  "reward_rank_points": number,
  "mission_type": "platform" | "circle" | "personal"
}]`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            missions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  objective: { type: "string" },
                  roles_needed: { type: "array", items: { type: "string" } },
                  reward_ggg: { type: "number" },
                  reward_rank_points: { type: "number" },
                  mission_type: { type: "string" }
                }
              }
            }
          }
        }
      });

      setGeneratedMissions(response.missions || []);
    } catch (error) {
      console.error('Failed to generate missions:', error);
      toast.error('Failed to generate mission ideas');
    } finally {
      setIsGenerating(false);
    }
  };

  const postMission = async (mission) => {
    try {
      await base44.entities.Mission.create({
        title: mission.title,
        description: mission.description,
        objective: mission.objective,
        roles_needed: mission.roles_needed,
        reward_ggg: mission.reward_ggg,
        reward_rank_points: mission.reward_rank_points,
        mission_type: mission.mission_type || 'platform',
        creator_id: currentUser.email,
        creator_name: profile?.display_name || currentUser.full_name,
        status: 'active',
        participant_count: 0,
        participant_ids: []
      });
      
      toast.success('Mission posted successfully!');
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      
      // Remove from generated list
      setGeneratedMissions(prev => prev.filter(m => m.title !== mission.title));
      
      onMissionCreated?.();
    } catch (error) {
      console.error('Failed to post mission:', error);
      toast.error('Failed to post mission');
    }
  };

  const startEditing = (index, mission) => {
    setEditingIndex(index);
    setEditedMission({ ...mission });
  };

  const saveEdit = (index) => {
    setGeneratedMissions(prev => {
      const updated = [...prev];
      updated[index] = editedMission;
      return updated;
    });
    setEditingIndex(null);
    setEditedMission(null);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditedMission(null);
  };

  return (
    <Card className="bg-gradient-to-br from-violet-950/50 to-purple-950/50 border-violet-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Wand2 className="w-5 h-5 text-amber-400" />
          AI Mission Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Section */}
        <div className="space-y-3">
          <p className="text-sm text-slate-300">
            Generate mission ideas based on your skills and interests. Add optional context to customize suggestions.
          </p>
          <Textarea
            placeholder="Optional: Describe what kind of mission you're looking for... (e.g., 'community healing event', 'tech project for good', 'educational workshop')"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 min-h-20"
          />
          <Button
            onClick={generateMissions}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Ideas...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Mission Ideas
              </>
            )}
          </Button>
        </div>

        {/* Generated Missions */}
        {generatedMissions.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Generated Missions</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={generateMissions}
                disabled={isGenerating}
                className="text-violet-400 hover:text-violet-300"
              >
                <RefreshCw className={cn("w-4 h-4 mr-1", isGenerating && "animate-spin")} />
                Regenerate
              </Button>
            </div>

            <div className="space-y-4">
              {generatedMissions.map((mission, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-700 hover:border-violet-500/50 transition-all"
                >
                  {editingIndex === index ? (
                    // Edit Mode
                    <div className="space-y-3">
                      <Input
                        value={editedMission.title}
                        onChange={(e) => setEditedMission({ ...editedMission, title: e.target.value })}
                        className="bg-slate-800 border-slate-600 text-white font-semibold"
                        placeholder="Mission Title"
                      />
                      <Textarea
                        value={editedMission.description}
                        onChange={(e) => setEditedMission({ ...editedMission, description: e.target.value })}
                        className="bg-slate-800 border-slate-600 text-white min-h-16"
                        placeholder="Description"
                      />
                      <Input
                        value={editedMission.objective}
                        onChange={(e) => setEditedMission({ ...editedMission, objective: e.target.value })}
                        className="bg-slate-800 border-slate-600 text-white"
                        placeholder="Objective"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => saveEdit(index)} className="bg-emerald-600 hover:bg-emerald-700">
                          <Check className="w-4 h-4 mr-1" /> Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={cancelEdit} className="text-slate-400">
                          <X className="w-4 h-4 mr-1" /> Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Target className="w-5 h-5 text-amber-400" />
                          <h4 className="font-semibold text-white">{mission.title}</h4>
                        </div>
                        <Badge variant="outline" className="text-violet-400 border-violet-400/50">
                          {mission.mission_type || 'platform'}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-slate-300 mb-3">{mission.description}</p>
                      
                      <div className="text-xs text-slate-400 mb-3">
                        <strong>Objective:</strong> {mission.objective}
                      </div>

                      {/* Collaborators Needed */}
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="text-xs text-slate-400">Roles needed:</span>
                        {mission.roles_needed?.map((role, i) => (
                          <Badge key={i} variant="secondary" className="text-xs bg-slate-700 text-slate-300">
                            {role}
                          </Badge>
                        ))}
                      </div>

                      {/* Rewards */}
                      <div className="flex items-center gap-4 mb-4 text-sm">
                        <span className="text-amber-400">
                          <Sparkles className="w-4 h-4 inline mr-1" />
                          {mission.reward_ggg} GGG
                        </span>
                        <span className="text-violet-400">
                          +{mission.reward_rank_points} RP
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => postMission(mission)}
                          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                        >
                          <Rocket className="w-4 h-4 mr-1" />
                          Post Mission
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEditing(index, mission)}
                          className="border-slate-600 text-slate-300 hover:bg-slate-800"
                        >
                          <Edit3 className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isGenerating && generatedMissions.length === 0 && (
          <div className="text-center py-8">
            <Wand2 className="w-12 h-12 text-violet-400/50 mx-auto mb-3" />
            <p className="text-slate-400">
              Click "Generate Mission Ideas" to get AI-powered suggestions based on your profile.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}