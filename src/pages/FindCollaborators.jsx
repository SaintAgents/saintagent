import React from "react";
import CollaboratorFinder from "@/components/collaboration/CollaboratorFinder";
import { Users, Sparkles } from "lucide-react";
import BackButton from '@/components/hud/BackButton';

export default function FindCollaborators() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:from-[#050505] dark:via-[#050505] dark:to-[#050505]">
      {/* Hero Section */}
      <div className="relative h-48 md:h-56 overflow-hidden">
        <img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/3ba1dc1c5_22.png"
          alt="Find Collaborators"
          className="w-full h-full object-cover hero-image"
          data-no-filter="true"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/30 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
          <div className="flex items-center gap-3">
            <BackButton className="text-white hover:bg-white/20" />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg flex items-center gap-3">
                <Users className="w-8 h-8 text-violet-300" />
                Find Collaborators
                <Sparkles className="w-6 h-6 text-amber-400" />
              </h1>
              <p className="text-violet-100 mt-1 text-sm md:text-base">
                AI-powered matching based on skills, values, availability, and collaboration goals
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <CollaboratorFinder />
      </div>
    </div>
  );
}