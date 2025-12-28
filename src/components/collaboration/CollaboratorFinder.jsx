import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export default function CollaboratorFinder() {
  const queryClient = useQueryClient();
  const [selectedMissionId, setSelectedMissionId] = React.useState("");
  const [skillsText, setSkillsText] = React.useState("");
  const [notes, setNotes] = React.useState("");

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
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
    queryFn: () => base44.entities.UserProfile.list("-rank_points", 200),
  });

  const selectedMission = React.useMemo(() =>
    myMissions.find((m) => m.id === selectedMissionId),
  [myMissions, selectedMissionId]);

  React.useEffect(() => {
    if (selectedMission && (selectedMission.roles_needed?.length || 0) > 0) {
      setSkillsText(selectedMission.roles_needed.join(", "));
    }
  }, [selectedMissionId]);

  const desiredSkills = React.useMemo(() =>
    skillsText
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  [skillsText]);

  const scoredProfiles = React.useMemo(() => {
    return profiles
      .filter((p) => p.user_id !== user?.email)
      .map((p) => {
        const userSkills = (p.skills || []).map((s) => (typeof s === "string" ? s.toLowerCase() : String(s).toLowerCase()));
        const matched = desiredSkills.filter((s) => userSkills.includes(s));
        const score = matched.length * 10 + (p.reach_score || 0) * 0.1 + (p.rank_points || 0) * 0.01;
        return { profile: p, matched, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);
  }, [profiles, desiredSkills, user]);

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
    window.dispatchEvent(event);
  };

  return (
    <div className="bg-white rounded-2xl border p-4 md:p-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-slate-900">Find Collaborators</h2>
        <p className="text-slate-500 text-sm">Match people to your mission or describe your project needs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="text-xs font-medium text-slate-600">Mission (optional)</label>
          <Select value={selectedMissionId} onValueChange={setSelectedMissionId}>
            <SelectTrigger className="mt-2 rounded-xl">
              <SelectValue placeholder="Select a mission" />
            </SelectTrigger>
            <SelectContent>
              {myMissions.map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2">
          <label className="text-xs font-medium text-slate-600">Skills / Roles Needed</label>
          <Input
            className="mt-2 rounded-xl"
            placeholder="e.g., react, ui design, community manager"
            value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="text-xs font-medium text-slate-600">Notes (optional)</label>
        <Textarea
          className="mt-2 rounded-xl min-h-20"
          placeholder="Add context about the project, timeline, or expectations..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <ScrollArea className="max-h-[50vh]">
        <div className="space-y-3">
          {scoredProfiles.length === 0 && (
            <p className="text-sm text-slate-500">No matches yet. Try entering some skills above.</p>
          )}
          {scoredProfiles.map(({ profile, matched, score }) => (
            <div key={profile.id} className="flex items-center gap-3 p-3 rounded-xl border hover:shadow-sm bg-white">
              <Avatar className="w-10 h-10 cursor-pointer" data-user-id={profile.user_id}>
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback>{profile.display_name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 truncate">{profile.display_name}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {matched.slice(0, 5).map((m, i) => (
                    <Badge key={i} variant="outline" className="text-[11px]">{m}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedMission && (
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => inviteToMission.mutate({ mission: selectedMission, targetUserId: profile.user_id })}
                  >
                    Invite to Mission
                  </Button>
                )}
                <Button className="rounded-xl bg-violet-600 hover:bg-violet-700" onClick={() => messageUser(profile)}>
                  Message
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}