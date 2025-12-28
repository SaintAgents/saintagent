import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { base44 } from '@/api/base44Client';

const DESIRES = [
  { code: "find_mentor", label: "Find a mentor" },
  { code: "find_students", label: "Find students/clients" },
  { code: "build_team", label: "Build a team" },
  { code: "find_investors", label: "Find investors/partners" },
  { code: "launch_product", label: "Launch a product" },
  { code: "grow_audience", label: "Grow audience" },
  { code: "speak_teach", label: "Speak/teach publicly" },
  { code: "join_mission", label: "Join a mission" },
  { code: "create_mission", label: "Create a mission" },
  { code: "host_meetups", label: "Host local meetups" },
  { code: "collaborate_content", label: "Collaborate on content" },
  { code: "deepen_practice", label: "Deepen spiritual practice" },
  { code: "heal_integrate", label: "Heal / integrate / transform" },
  { code: "build_community", label: "Build a local community node" }
];

export default function Step4Desires({ data, onComplete, user }) {
  const [selected, setSelected] = useState(data.desires || []);

  const toggleDesire = (code) => {
    if (selected.includes(code)) {
      setSelected(selected.filter(c => c !== code));
    } else if (selected.length < 7) {
      setSelected([...selected, code]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Save desires to database
    for (const code of selected) {
      await base44.entities.UserDesire.create({
        user_id: user.email,
        desire_code: code,
        priority: 'medium'
      });
    }
    
    onComplete({ desires: selected });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Desires & Intentions</h2>
        <p className="text-slate-600">Select up to 7 goals that drive you</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {DESIRES.map((desire) => {
          const isSelected = selected.includes(desire.code);
          
          return (
            <button
              key={desire.code}
              type="button"
              onClick={() => toggleDesire(desire.code)}
              disabled={!isSelected && selected.length >= 7}
              className={cn(
                "p-4 rounded-xl border-2 text-left transition-all",
                "hover:border-violet-300 hover:shadow-md",
                isSelected 
                  ? "border-violet-500 bg-violet-50 shadow-md" 
                  : "border-slate-200 bg-white",
                !isSelected && selected.length >= 5 && "opacity-50 cursor-not-allowed"
              )}
            >
              <p className={cn(
                "text-sm font-medium",
                isSelected ? "text-violet-900" : "text-slate-700"
              )}>
                {desire.label}
              </p>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-4">
        <p className="text-sm text-slate-500">
          {selected.length}/7 selected
        </p>
        <Button
          type="submit"
          disabled={selected.length === 0}
          className="bg-violet-600 hover:bg-violet-700"
        >
          Continue
        </Button>
      </div>
    </form>
  );
}