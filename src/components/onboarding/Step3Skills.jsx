import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus } from "lucide-react";
import { base44 } from '@/api/base44Client';

const SKILL_CATEGORIES = {
  "Business": ["Sales", "Marketing", "Operations", "Finance", "Legal", "HR"],
  "Tech": ["Product", "UX/UI", "Frontend", "Backend", "AI", "DevOps"],
  "Media": ["Writing", "Video", "Podcasting", "Design", "Branding"],
  "Healing": ["Coaching", "Breathwork", "Meditation", "Energy work", "Somatics"],
  "Community": ["Facilitation", "Event hosting", "Conflict resolution", "Moderation"]
};

export default function Step3Skills({ data, onComplete, user }) {
  const [offeredSkills, setOfferedSkills] = useState(data.offered_skills || []);
  const [wantedSkills, setWantedSkills] = useState(data.wanted_skills || []);
  const [customSkill, setCustomSkill] = useState('');
  const [activeTab, setActiveTab] = useState('offer');

  const addSkill = (skillName, type) => {
    const skill = {
      name: skillName,
      proficiency: 'intermediate'
    };

    if (type === 'offer') {
      if (!offeredSkills.find(s => s.name === skillName)) {
        setOfferedSkills([...offeredSkills, skill]);
      }
    } else {
      if (!wantedSkills.find(s => s.name === skillName)) {
        setWantedSkills([...wantedSkills, { name: skillName }]);
      }
    }
  };

  const removeSkill = (skillName, type) => {
    if (type === 'offer') {
      setOfferedSkills(offeredSkills.filter(s => s.name !== skillName));
    } else {
      setWantedSkills(wantedSkills.filter(s => s.name !== skillName));
    }
  };

  const updateProficiency = (skillName, proficiency) => {
    setOfferedSkills(offeredSkills.map(s => 
      s.name === skillName ? { ...s, proficiency } : s
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Save skills to database
    for (const skill of offeredSkills) {
      await base44.entities.Skill.create({
        user_id: user.email,
        skill_name: skill.name,
        proficiency: ['beginner', 'intermediate', 'advanced', 'expert', 'master'].indexOf(skill.proficiency) + 1,
        type: 'offer'
      });
    }
    
    for (const skill of wantedSkills) {
      await base44.entities.Skill.create({
        user_id: user.email,
        skill_name: skill.name,
        type: 'seek'
      });
    }
    
    onComplete({ offered_skills: offeredSkills, wanted_skills: wantedSkills });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Skills</h2>
        <p className="text-slate-600">What can you offer? What do you want to learn?</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('offer')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'offer'
              ? 'border-violet-600 text-violet-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          I Can Offer ({offeredSkills.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('want')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'want'
              ? 'border-violet-600 text-violet-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          I Want to Learn ({wantedSkills.length})
        </button>
      </div>

      {/* Add Custom Skill */}
      <div className="flex gap-2">
        <Input
          value={customSkill}
          onChange={(e) => setCustomSkill(e.target.value)}
          placeholder="Type a skill..."
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (customSkill.trim()) {
                addSkill(customSkill.trim(), activeTab);
                setCustomSkill('');
              }
            }
          }}
        />
        <Button
          type="button"
          onClick={() => {
            if (customSkill.trim()) {
              addSkill(customSkill.trim(), activeTab);
              setCustomSkill('');
            }
          }}
          variant="outline"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Skill Categories */}
      <div className="space-y-4">
        {Object.entries(SKILL_CATEGORIES).map(([category, skills]) => (
          <div key={category}>
            <h4 className="text-sm font-medium text-slate-700 mb-2">{category}</h4>
            <div className="flex flex-wrap gap-2">
              {skills.map(skill => {
                const isAdded = activeTab === 'offer'
                  ? offeredSkills.find(s => s.name === skill)
                  : wantedSkills.find(s => s.name === skill);
                
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => addSkill(skill, activeTab)}
                    disabled={!!isAdded}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      isAdded
                        ? 'bg-violet-100 text-violet-700 cursor-default'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Skills */}
      {activeTab === 'offer' && offeredSkills.length > 0 && (
        <div className="p-4 rounded-xl bg-violet-50 border border-violet-200">
          <h4 className="font-medium text-violet-900 mb-3">Skills You Offer</h4>
          <div className="space-y-3">
            {offeredSkills.map(skill => (
              <div key={skill.name} className="flex items-center gap-3 bg-white p-3 rounded-lg">
                <span className="flex-1 font-medium text-slate-900">{skill.name}</span>
                <Select
                  value={skill.proficiency}
                  onValueChange={(value) => updateProficiency(skill.name, value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                    <SelectItem value="master">Master</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSkill(skill.name, 'offer')}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'want' && wantedSkills.length > 0 && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-3">Skills You Want to Learn</h4>
          <div className="flex flex-wrap gap-2">
            {wantedSkills.map(skill => (
              <Badge key={skill.name} variant="secondary" className="gap-2">
                {skill.name}
                <button
                  type="button"
                  onClick={() => removeSkill(skill.name, 'want')}
                  className="hover:text-rose-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      <Button
        type="submit"
        disabled={offeredSkills.length === 0}
        className="w-full bg-violet-600 hover:bg-violet-700"
      >
        Continue
      </Button>
    </form>
  );
}