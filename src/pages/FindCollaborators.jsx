import React from "react";
import CollaboratorFinder from "@/components/collaboration/CollaboratorFinder";

export default function FindCollaborators() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Collaborators</h1>
          <p className="text-slate-500">Discover people whose skills match your mission or project.</p>
        </div>
        <CollaboratorFinder />
      </div>
    </div>
  );
}