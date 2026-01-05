import React from "react";
import CollaboratorFinder from "@/components/collaboration/CollaboratorFinder";
import { Users, Sparkles } from "lucide-react";

export default function FindCollaborators() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-violet-100">
            <Users className="w-6 h-6 text-violet-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              Find Collaborators
              <Sparkles className="w-5 h-5 text-amber-500" />
            </h1>
            <p className="text-slate-500">AI-powered matching based on skills, values, availability, and collaboration goals</p>
          </div>
        </div>
        <CollaboratorFinder />
      </div>
    </div>
  );
}