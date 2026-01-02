import React from "react";
import { base44 } from "@/api/base44Client";
import ProjectCSVImport from "../components/projects/ProjectCSVImport";
import ProjectCSVExport from "../components/projects/ProjectCSVExport";

export default function ProjectOnboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Project Onboard</h1>
          <p className="text-slate-600 mt-1">Bulk import and export of projects with CSV.</p>
        </div>
        <ProjectCSVImport />
        <ProjectCSVExport />
      </div>
    </div>
  );
}