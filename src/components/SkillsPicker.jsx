import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, X, Star } from "lucide-react";

const SKILL_SUGGESTIONS = [
  'Meditation', 'Coaching', 'Reiki', 'Yoga', 'Breathwork',
  'Energy Healing', 'Tarot', 'Astrology', 'Sound Healing',
  'Life Coaching', 'Mentorship', 'Teaching', 'Facilitation',
  'Community Building', 'Event Planning', 'Writing', 'Design'
];

export default function SkillsPicker({ open, onClose, userId }) {
  const [newSkill, setNewSkill] = useState('');
  const [skillType, setSkillType] = useState('offer');
  const [proficiency, setProficiency] = useState(3);
  const queryClient = useQueryClient();

  const { data: skills = [] } = useQuery({
    queryKey: ['skills', userId],
    queryFn: () => base44.entities.Skill.filter({ user_id: userId }),
    enabled: !!userId
  });

  const addSkillMutation = useMutation({
    mutationFn: (data) => base44.entities.Skill.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills', userId] });
      setNewSkill('');
      setProficiency(3);
    }
  });

  const removeSkillMutation = useMutation({
    mutationFn: (id) => base44.entities.Skill.delete({ id }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['skills', userId] })
  });

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    addSkillMutation.mutate({
      user_id: userId,
      skill_name: newSkill,
      type: skillType,
      proficiency
    });
  };

  const offeredSkills = skills.filter(s => s.type === 'offer');
  const seekingSkills = skills.filter(s => s.type === 'seek');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Skills</DialogTitle>
        </DialogHeader>

        <Tabs value={skillType} onValueChange={setSkillType} className="mt-4">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="offer">I Offer</TabsTrigger>
            <TabsTrigger value="seek">I Seek</TabsTrigger>
          </TabsList>

          <TabsContent value="offer" className="space-y-4 mt-4">
            {/* Add new */}
            <div className="space-y-3">
              <div>
                <Label>Add Skill</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="e.g., Meditation"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                  />
                  <Button onClick={handleAddSkill} className="shrink-0 rounded-xl">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label>Proficiency</Label>
                <div className="flex items-center gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map(level => (
                    <button
                      key={level}
                      onClick={() => setProficiency(level)}
                      className={cn(
                        "p-2 rounded-lg border transition-colors",
                        proficiency >= level 
                          ? "bg-amber-100 border-amber-300 text-amber-700" 
                          : "bg-slate-50 border-slate-200 text-slate-400"
                      )}
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Suggestions */}
            <div>
              <Label>Suggestions</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {SKILL_SUGGESTIONS.map(skill => (
                  <Button
                    key={skill}
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => setNewSkill(skill)}
                  >
                    {skill}
                  </Button>
                ))}
              </div>
            </div>

            {/* Current skills */}
            <div>
              <Label>Your Skills ({offeredSkills.length})</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {offeredSkills.map(skill => (
                  <Badge key={skill.id} className="bg-violet-100 text-violet-700 gap-2 pr-1">
                    {skill.skill_name}
                    <button
                      onClick={() => removeSkillMutation.mutate(skill.id)}
                      className="hover:bg-violet-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="seek" className="space-y-4 mt-4">
            {/* Same structure for seeking skills */}
            <div>
              <Label>Skills You're Looking For</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="e.g., Yoga instruction"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                />
                <Button onClick={handleAddSkill} className="shrink-0 rounded-xl">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label>Seeking ({seekingSkills.length})</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {seekingSkills.map(skill => (
                  <Badge key={skill.id} className="bg-blue-100 text-blue-700 gap-2 pr-1">
                    {skill.skill_name}
                    <button
                      onClick={() => removeSkillMutation.mutate(skill.id)}
                      className="hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}