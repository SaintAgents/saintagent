import React from 'react';
import ProjectPlanner from '@/components/collab/ProjectPlanner';

export default function Planner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Collaborative Planner</h1>
        <ProjectPlanner />
      </div>
    </div>
  );
}