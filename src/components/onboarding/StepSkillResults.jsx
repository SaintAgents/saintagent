import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Sparkles, Users, FolderKanban, Rocket, ArrowRight,
  Star, Loader2, ChevronRight, CheckCircle2
} from "lucide-react";

export default function StepSkillResults({ data, onComplete, user }) {
  const [loading, setLoading] = useState(true);
  const [suggestedProjects, setSuggestedProjects] = useState([]);
  const [suggestedCollaborators, setSuggestedCollaborators] = useState([]);
  const [projectDraft, setProjectDraft] = useState(null);
  const [wantsProject, setWantsProject] = useState(false);
  const [activeTab, setActiveTab] = useState('projects');

  // Get skills from previous step (step index 6 in the STEPS array)
  const prevStepData = data;

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    setLoading(true);

    // Fetch offered skills from the previous step's saved data
    // The parent passes prevStepData which has the skill assessment results
    const offeredSkills = prevStepData?.offered_skills || [];
    const wantedSkills = prevStepData?.wanted_skills || [];
    const experiences = prevStepData?.experiences || [];
    const skillNames = offeredSkills.map(s => s.name);
    const wantedNames = wantedSkills.map(s => s.name || s);

    // Fetch relevant projects based on skills
    try {
      const allProjects = await base44.entities.Project.filter(
        { status: 'approved' },
        '-created_date',
        20
      );

      // Also check active/funded projects
      let moreProjects = [];
      try {
        moreProjects = await base44.entities.Project.filter(
          { status: 'funded' },
          '-created_date',
          10
        );
      } catch {}

      const combined = [...(allProjects || []), ...(moreProjects || [])];
      
      // Score projects by skill overlap
      const scored = combined.map(p => {
        let score = 0;
        const text = `${p.title || ''} ${p.description || ''} ${p.problem_statement || ''} ${(p.derived_tags || []).join(' ')} ${p.sector || ''}`.toLowerCase();
        skillNames.forEach(s => {
          if (text.includes(s.toLowerCase())) score += 3;
        });
        wantedNames.forEach(s => {
          if (text.includes(s.toLowerCase())) score += 1;
        });
        // Boost if sector matches experience
        if (experiences.includes('social_impact') && ['environment', 'education', 'healing', 'water', 'food'].includes(p.sector)) score += 2;
        if (experiences.includes('technical_systems') && ['technology', 'infrastructure'].includes(p.sector)) score += 2;
        if (experiences.includes('raised_funds') && p.amount_requested > 0) score += 1;
        return { ...p, _score: score };
      })
      .filter(p => p._score > 0)
      .sort((a, b) => b._score - a._score)
      .slice(0, 5);

      setSuggestedProjects(scored);
    } catch (err) {
      console.error('Failed to load projects:', err);
    }

    // Fetch potential collaborators who seek what user offers (or offer what user seeks)
    try {
      const relevantSkills = await base44.entities.Skill.filter(
        { type: 'seek' },
        '-created_date',
        100
      );
      
      // Find users who are seeking skills the new user offers
      const matchedUserIds = new Map();
      (relevantSkills || []).forEach(sk => {
        if (sk.user_id === user?.email) return;
        if (skillNames.some(sn => sn.toLowerCase() === sk.skill_name?.toLowerCase())) {
          const existing = matchedUserIds.get(sk.user_id) || { id: sk.user_id, matchedSkills: [], score: 0 };
          existing.matchedSkills.push(sk.skill_name);
          existing.score += 1;
          matchedUserIds.set(sk.user_id, existing);
        }
      });

      // Also check users who offer what the new user wants
      const offerSkills = await base44.entities.Skill.filter(
        { type: 'offer' },
        '-created_date',
        100
      );
      (offerSkills || []).forEach(sk => {
        if (sk.user_id === user?.email) return;
        if (wantedNames.some(wn => wn.toLowerCase() === sk.skill_name?.toLowerCase())) {
          const existing = matchedUserIds.get(sk.user_id) || { id: sk.user_id, matchedSkills: [], score: 0 };
          if (!existing.matchedSkills.includes(sk.skill_name)) {
            existing.matchedSkills.push(sk.skill_name);
          }
          existing.score += 1;
          matchedUserIds.set(sk.user_id, existing);
        }
      });

      // Get top collaborators and fetch their profiles
      const topCollabs = [...matchedUserIds.values()].sort((a, b) => b.score - a.score).slice(0, 6);
      
      if (topCollabs.length > 0) {
        const profiles = await Promise.all(
          topCollabs.map(async (c) => {
            try {
              const p = await base44.entities.UserProfile.filter({ user_id: c.id });
              return p?.[0] ? { ...p[0], matchedSkills: c.matchedSkills, _score: c.score } : null;
            } catch { return null; }
          })
        );
        setSuggestedCollaborators(profiles.filter(Boolean));
      }
    } catch (err) {
      console.error('Failed to load collaborators:', err);
    }

    // Generate project draft based on top skills
    if (offeredSkills.length > 0) {
      const topSkills = offeredSkills
        .sort((a, b) => (b.proficiency || 0) - (a.proficiency || 0))
        .slice(0, 3)
        .map(s => s.name);
      
      // Determine sector from skills
      let sector = 'other';
      const skillStr = topSkills.join(' ').toLowerCase();
      if (/tech|ai|frontend|backend|devops|data|blockchain|product|ux/.test(skillStr)) sector = 'technology';
      else if (/heal|coach|breath|meditat|energy|somatic|nutrit|yoga/.test(skillStr)) sector = 'healing';
      else if (/writ|video|podcast|design|brand|photo|music/.test(skillStr)) sector = 'education';
      else if (/facilit|event|communit|mentor|teach|moderat/.test(skillStr)) sector = 'governance';
      else if (/sustain|policy|philanthrophy|social|agric|infra/.test(skillStr)) sector = 'environment';
      else if (/sales|market|finance|legal|hr|fundrais|operat/.test(skillStr)) sector = 'infrastructure';

      setProjectDraft({
        contact_name: user?.full_name || '',
        contact_email: user?.email || '',
        sector,
        readiness_items: experiences.includes('led_team') ? ['team'] : [],
        description: `Project leveraging expertise in ${topSkills.join(', ')}.`
      });
    }

    setLoading(false);
  };

  const handleContinue = () => {
    const result = {};
    if (wantsProject && projectDraft) {
      result.projectDraft = projectDraft;
      // Store in sessionStorage so ProjectIntakeWizard can pick it up
      try {
        const existing = JSON.parse(sessionStorage.getItem('projectIntakeForm') || '{}');
        sessionStorage.setItem('projectIntakeForm', JSON.stringify({ ...existing, ...projectDraft }));
      } catch {}
    }
    onComplete(result);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white animate-pulse" />
          </div>
        </div>
        <p className="text-slate-600 font-medium">Analyzing your skills and finding matches...</p>
        <Loader2 className="w-5 h-5 text-violet-600 animate-spin" />
      </div>
    );
  }

  const hasResults = suggestedProjects.length > 0 || suggestedCollaborators.length > 0;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 mb-3">
          <Sparkles className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Your Skill Matches</h2>
        <p className="text-slate-600 text-sm">Based on your assessment, here's what we found for you.</p>
      </div>

      {hasResults ? (
        <>
          {/* Tabs */}
          <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('projects')}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-colors",
                activeTab === 'projects' ? "bg-white shadow-sm text-violet-700" : "text-slate-500"
              )}
            >
              <FolderKanban className="w-4 h-4" />
              Projects ({suggestedProjects.length})
            </button>
            <button
              onClick={() => setActiveTab('collaborators')}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-colors",
                activeTab === 'collaborators' ? "bg-white shadow-sm text-violet-700" : "text-slate-500"
              )}
            >
              <Users className="w-4 h-4" />
              Collaborators ({suggestedCollaborators.length})
            </button>
          </div>

          {/* Projects tab */}
          {activeTab === 'projects' && (
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {suggestedProjects.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No matching projects found yet — but new ones appear daily!</p>
              ) : (
                suggestedProjects.map(p => (
                  <div key={p.id} className="p-3 rounded-xl border border-slate-200 hover:border-violet-200 transition-colors bg-white">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-800 text-sm truncate">{p.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{p.description || p.problem_statement || 'No description'}</p>
                      </div>
                      {p.sector && (
                        <Badge className="bg-slate-100 text-slate-600 text-[10px] shrink-0">{p.sector}</Badge>
                      )}
                    </div>
                    {p._score >= 3 && (
                      <div className="mt-2 flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500" />
                        <span className="text-[10px] text-amber-600 font-medium">Strong skill match</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Collaborators tab */}
          {activeTab === 'collaborators' && (
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {suggestedCollaborators.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No matching collaborators found yet — your network will grow fast!</p>
              ) : (
                suggestedCollaborators.map(c => (
                  <div key={c.id} className="p-3 rounded-xl border border-slate-200 hover:border-violet-200 transition-colors bg-white flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shrink-0 overflow-hidden">
                      {c.avatar_url ? (
                        <img src={c.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white font-bold text-sm">
                          {(c.display_name || '?')[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-800 text-sm truncate">{c.display_name}</h4>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {c.matchedSkills?.slice(0, 3).map(s => (
                          <Badge key={s} className="bg-violet-50 text-violet-600 text-[10px] border-violet-200">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-6 px-4 rounded-xl bg-slate-50 border border-slate-200">
          <Rocket className="w-10 h-10 text-violet-400 mx-auto mb-3" />
          <p className="text-sm text-slate-600">You're one of the first here with your skill set — that means big opportunities ahead!</p>
          <p className="text-xs text-slate-500 mt-1">We'll notify you when matching projects and collaborators appear.</p>
        </div>
      )}

      {/* Project draft offer */}
      {projectDraft && (
        <div className={cn(
          "p-4 rounded-xl border transition-all cursor-pointer",
          wantsProject
            ? "bg-violet-50 border-violet-300 shadow-sm"
            : "bg-white border-slate-200 hover:border-violet-200"
        )} onClick={() => setWantsProject(!wantsProject)}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors",
              wantsProject ? "bg-violet-600 border-violet-600" : "border-slate-300"
            )}>
              {wantsProject && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">Pre-fill a project intake form with my skills</p>
              <p className="text-xs text-slate-500 mt-0.5">
                We'll set up a draft with your contact info, sector ({projectDraft.sector}), and skill description so you can submit faster later.
              </p>
            </div>
          </div>
        </div>
      )}

      <Button onClick={handleContinue} className="w-full bg-violet-600 hover:bg-violet-700">
        Continue <ArrowRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}