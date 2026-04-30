import React from 'react';
import { cn } from "@/lib/utils";
import { Heart, Wind, Flame, Sparkles, Sun, Users, BookOpen } from "lucide-react";

const ACTIVITIES = [
  { id: 'meditation', label: 'Meditation', icon: Sparkles, color: 'bg-purple-100 text-purple-700 border-purple-300' },
  { id: 'breathwork', label: 'Breathwork', icon: Wind, color: 'bg-sky-100 text-sky-700 border-sky-300' },
  { id: 'prayer', label: 'Prayer', icon: Sun, color: 'bg-amber-100 text-amber-700 border-amber-300' },
  { id: 'energy_work', label: 'Energy Work', icon: Flame, color: 'bg-rose-100 text-rose-700 border-rose-300' },
  { id: 'gratitude', label: 'Gratitude', icon: Heart, color: 'bg-pink-100 text-pink-700 border-pink-300' },
  { id: 'service', label: 'Service', icon: Users, color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  { id: 'study', label: 'Sacred Study', icon: BookOpen, color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
];

export default function AlignmentActivityPicker({ selected = [], onChange }) {
  const toggle = (id) => {
    onChange(selected.includes(id) ? selected.filter(a => a !== id) : [...selected, id]);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {ACTIVITIES.map(({ id, label, icon: Icon, color }) => {
        const active = selected.includes(id);
        return (
          <button
            key={id}
            type="button"
            onClick={() => toggle(id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all",
              active ? color + " ring-2 ring-offset-1 ring-violet-400 font-medium" : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        );
      })}
    </div>
  );
}

export { ACTIVITIES };