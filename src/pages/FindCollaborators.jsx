import React from 'react';
import CollaboratorFinder from '@/components/collab/CollaboratorFinder';

export default function FindCollaborators() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Find Collaborators</h1>
          <p className="text-slate-500 mt-1">Discover people whose skills match your mission or project needs.</p>
        </div>
        <CollaboratorFinder />
      </div>
    </div>
  );
}