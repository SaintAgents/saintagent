import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { base44 } from '@/api/base44Client';
import {
  X, Plus, ChevronRight, Sparkles, Star,
  Briefcase, Code, Palette, Heart, Users, Lightbulb
} from "lucide-react";

const SKILL_CATEGORIES = [
  {
    id: 'business',
    label: 'Business & Strategy',
    icon: Briefcase,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    activeColor: 'bg-blue-600 text-white',
    skills: ['Sales', 'Marketing', 'Operations', 'Finance', 'Legal', 'HR', 'Project Management', 'Fundraising']
  },
  {
    id: 'tech',
    label: 'Technology',
    icon: Code,
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    activeColor: 'bg-emerald-600 text-white',
    skills: ['Product', 'UX/UI', 'Frontend', 'Backend', 'AI', 'DevOps', 'Data Science', 'Blockchain']
  },
  {
    id: 'creative',
    label: 'Creative & Media',
    icon: Palette,
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    activeColor: 'bg-purple-600 text-white',
    skills: ['Writing', 'Video', 'Podcasting', 'Design', 'Branding', 'Photography', 'Music']
  },
  {
    id: 'healing',
    label: 'Healing & Wellness',
    icon: Heart,
    color: 'bg-rose-100 text-rose-700 border-rose-200',
    activeColor: 'bg-rose-600 text-white',
    skills: ['Coaching', 'Breathwork', 'Meditation', 'Energy Work', 'Somatics', 'Nutrition', 'Yoga']
  },
  {
    id: 'community',
    label: 'Community & Leadership',
    icon: Users,
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    activeColor: 'bg-amber-600 text-white',
    skills: ['Facilitation', 'Event Hosting', 'Conflict Resolution', 'Moderation', 'Teaching', 'Mentorship']
  },
  {
    id: 'impact',
    label: 'Impact & Governance',
    icon: Lightbulb,
    color: 'bg-teal-100 text-teal-700 border-teal-200',
    activeColor: 'bg-teal-600 text-white',
    skills: ['Sustainability', 'Policy', 'Philanthropy', 'Social Enterprise', 'Agriculture', 'Infrastructure']
  }
];

const PROFICIENCY_LEVELS = [
  { value: 1, label: 'Beginner', desc: 'Learning the basics' },
  { value: 2, label: 'Intermediate', desc: 'Can work independently' },
  { value: 3, label: 'Advanced', desc: 'Strong practical experience' },
  { value: 4, label: 'Expert', desc: 'Deep expertise, can teach others' },
  { value: 5, label: 'Master', desc: 'Industry-recognized authority' }
];

const EXPERIENCE_SCENARIOS = [
  { id: 'led_team', label: 'Led a team or project', category: 'leadership' },
  { id: 'built_product', label: 'Built a product or service from scratch', category: 'creation' },
  { id: 'raised_funds', label: 'Raised funding or managed budgets', category: 'finance' },
  { id: 'taught_mentored', label: 'Taught, coached, or mentored others', category: 'education' },
  { id: 'published_content', label: 'Published content or media', category: 'creative' },
  { id: 'community_organized', label: 'Organized events or communities', category: 'community' },
  { id: 'social_impact', label: 'Worked on social impact projects', category: 'impact' },
  { id: 'technical_systems', label: 'Built or maintained technical systems', category: 'tech' }
];

export default function Step3SkillAssessment({ data, onComplete, user }) {
  const [phase, setPhase] = useState(data?.phase || 'categories'); // categories -> rate -> scenarios -> wants
  const [selectedSkills, setSelectedSkills] = useState(data?.offered_skills || []);
  const [wantedSkills, setWantedSkills] = useState(data?.wanted_skills || []);
  const [experiences, setExperiences] = useState(data?.experiences || []);
  const [customSkill, setCustomSkill] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);

  const toggleSkill = (skillName) => {
    const exists = selectedSkills.find(s => s.name === skillName);
    if (exists) {
      setSelectedSkills(selectedSkills.filter(s => s.name !== skillName));
    } else {
      setSelectedSkills([...selectedSkills, { name: skillName, proficiency: 2 }]);
    }
  };

  const updateProficiency = (skillName, proficiency) => {
    setSelectedSkills(selectedSkills.map(s =>
      s.name === skillName ? { ...s, proficiency } : s
    ));
  };

  const toggleWanted = (skillName) => {
    if (wantedSkills.includes(skillName)) {
      setWantedSkills(wantedSkills.filter(s => s !== skillName));
    } else {
      setWantedSkills([...wantedSkills, skillName]);
    }
  };

  const toggleExperience = (id) => {
    setExperiences(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const addCustomSkill = () => {
    if (!customSkill.trim()) return;
    if (!selectedSkills.find(s => s.name === customSkill.trim())) {
      setSelectedSkills([...selectedSkills, { name: customSkill.trim(), proficiency: 2 }]);
    }
    setCustomSkill('');
  };

  const handleSubmit = async () => {
    // Save skills to database
    for (const skill of selectedSkills) {
      await base44.entities.Skill.create({
        user_id: user.email,
        skill_name: skill.name,
        proficiency: skill.proficiency,
        type: 'offer'
      });
    }
    for (const skillName of wantedSkills) {
      await base44.entities.Skill.create({
        user_id: user.email,
        skill_name: skillName,
        type: 'seek'
      });
    }
    onComplete({
      offered_skills: selectedSkills,
      wanted_skills: wantedSkills.map(n => ({ name: n })),
      experiences,
      phase: 'categories'
    });
  };

  const phaseProgress = { categories: 25, rate: 50, scenarios: 75, wants: 100 };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Skill Assessment</h2>
        <p className="text-slate-600 text-sm">Help us understand your strengths so we can match you with the right projects and collaborators.</p>
      </div>

      {/* Mini progress */}
      <div className="flex items-center gap-3">
        {['Select Skills', 'Rate Level', 'Experience', 'Want to Learn'].map((label, i) => {
          const phases = ['categories', 'rate', 'scenarios', 'wants'];
          const isActive = phases.indexOf(phase) >= i;
          return (
            <div key={label} className="flex-1">
              <div className={cn("h-1.5 rounded-full transition-colors", isActive ? "bg-violet-500" : "bg-slate-200")} />
              <p className={cn("text-[10px] mt-1 text-center", isActive ? "text-violet-600 font-medium" : "text-slate-400")}>{label}</p>
            </div>
          );
        })}
      </div>

      {/* Phase 1: Select skills from categories */}
      {phase === 'categories' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-700 font-medium">Tap skills you can offer. Select as many as apply.</p>
          
          {SKILL_CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isExpanded = activeCategory === cat.id;
            const catSelectedCount = cat.skills.filter(s => selectedSkills.find(ss => ss.name === s)).length;
            return (
              <div key={cat.id} className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setActiveCategory(isExpanded ? null : cat.id)}
                  className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={cn("p-1.5 rounded-lg", cat.color.split(' ')[0])}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-slate-800 text-sm">{cat.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {catSelectedCount > 0 && (
                      <Badge className="bg-violet-100 text-violet-700 text-xs">{catSelectedCount}</Badge>
                    )}
                    <ChevronRight className={cn("w-4 h-4 text-slate-400 transition-transform", isExpanded && "rotate-90")} />
                  </div>
                </button>
                {isExpanded && (
                  <div className="px-3 pb-3 flex flex-wrap gap-2">
                    {cat.skills.map(skill => {
                      const isSelected = selectedSkills.find(s => s.name === skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-sm font-medium transition-all border",
                            isSelected ? cat.activeColor + " border-transparent shadow-sm" : cat.color + " hover:opacity-80"
                          )}
                        >
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Custom skill */}
          <div className="flex gap-2">
            <Input
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              placeholder="Add a custom skill..."
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomSkill(); } }}
              className="text-sm"
            />
            <Button type="button" variant="outline" size="sm" onClick={addCustomSkill} className="shrink-0">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {selectedSkills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selectedSkills.map(s => (
                <Badge key={s.name} className="bg-violet-50 text-violet-700 border border-violet-200 gap-1 pr-1">
                  {s.name}
                  <button type="button" onClick={() => toggleSkill(s.name)} className="hover:text-rose-600 ml-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          <Button
            onClick={() => setPhase('rate')}
            disabled={selectedSkills.length === 0}
            className="w-full bg-violet-600 hover:bg-violet-700"
          >
            Rate Your Skills <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Phase 2: Rate proficiency */}
      {phase === 'rate' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-700 font-medium">How would you rate your level in each skill?</p>
          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {selectedSkills.map(skill => (
              <div key={skill.name} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-800 text-sm">{skill.name}</span>
                  <span className="text-xs text-violet-600 font-medium">
                    {PROFICIENCY_LEVELS[skill.proficiency - 1]?.label}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  {PROFICIENCY_LEVELS.map(level => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => updateProficiency(skill.name, level.value)}
                      title={`${level.label}: ${level.desc}`}
                      className={cn(
                        "flex-1 h-8 rounded-lg flex items-center justify-center transition-all text-xs",
                        skill.proficiency >= level.value
                          ? "bg-violet-500 text-white shadow-sm"
                          : "bg-white border border-slate-200 text-slate-400 hover:border-violet-300"
                      )}
                    >
                      <Star className="w-3.5 h-3.5" />
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">{PROFICIENCY_LEVELS[skill.proficiency - 1]?.desc}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPhase('categories')} className="flex-1">Back</Button>
            <Button onClick={() => setPhase('scenarios')} className="flex-1 bg-violet-600 hover:bg-violet-700">
              Continue <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Phase 3: Experience scenarios */}
      {phase === 'scenarios' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-700 font-medium">Which of these have you done? This helps us suggest the right missions.</p>
          <div className="space-y-2">
            {EXPERIENCE_SCENARIOS.map(scenario => {
              const isChecked = experiences.includes(scenario.id);
              return (
                <button
                  key={scenario.id}
                  type="button"
                  onClick={() => toggleExperience(scenario.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3",
                    isChecked
                      ? "bg-violet-50 border-violet-300 shadow-sm"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors",
                    isChecked ? "bg-violet-600 border-violet-600" : "border-slate-300"
                  )}>
                    {isChecked && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <span className={cn("text-sm", isChecked ? "text-violet-800 font-medium" : "text-slate-700")}>
                    {scenario.label}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPhase('rate')} className="flex-1">Back</Button>
            <Button onClick={() => setPhase('wants')} className="flex-1 bg-violet-600 hover:bg-violet-700">
              Continue <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Phase 4: What do you want to learn */}
      {phase === 'wants' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-700 font-medium">What skills do you want to learn or find collaborators for?</p>
          <div className="space-y-3">
            {SKILL_CATEGORIES.map(cat => {
              const availableSkills = cat.skills.filter(s => !selectedSkills.find(ss => ss.name === s));
              if (availableSkills.length === 0) return null;
              return (
                <div key={cat.id}>
                  <p className="text-xs font-semibold text-slate-500 mb-1.5">{cat.label}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {availableSkills.map(skill => {
                      const isWanted = wantedSkills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleWanted(skill)}
                          className={cn(
                            "px-2.5 py-1 rounded-full text-xs font-medium border transition-all",
                            isWanted
                              ? "bg-blue-600 text-white border-transparent"
                              : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                          )}
                        >
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {wantedSkills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {wantedSkills.map(s => (
                <Badge key={s} className="bg-blue-50 text-blue-700 border border-blue-200 gap-1 pr-1 text-xs">
                  {s}
                  <button type="button" onClick={() => toggleWanted(s)}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPhase('scenarios')} className="flex-1">Back</Button>
            <Button
              onClick={handleSubmit}
              disabled={selectedSkills.length === 0}
              className="flex-1 bg-violet-600 hover:bg-violet-700"
            >
              <Sparkles className="w-4 h-4 mr-1" /> See My Matches
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}