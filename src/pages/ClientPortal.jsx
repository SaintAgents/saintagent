import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Shield, FolderOpen } from 'lucide-react';
import PortalProjectCard from '@/components/portal/PortalProjectCard';
import PortalMilestoneApproval from '@/components/portal/PortalMilestoneApproval';
import PortalInvoiceTracker from '@/components/portal/PortalInvoiceTracker';
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ClientPortal() {
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 300000,
  });

  const email = user?.email;

  // Projects where user is owner, team member, or introduced_by
  const { data: allProjects = [] } = useQuery({
    queryKey: ['portalProjects', email],
    queryFn: () => base44.entities.Project.list('-updated_date', 100),
    enabled: !!email,
    staleTime: 60000,
  });
  const myProjects = allProjects.filter(p =>
    p.owner_id === email || p.created_by === email || (p.team_member_ids || []).includes(email)
  );

  // Missions tied to these projects or created by user
  const { data: allMissions = [] } = useQuery({
    queryKey: ['portalMissions', email],
    queryFn: () => base44.entities.Mission.list('-updated_date', 100),
    enabled: !!email,
    staleTime: 60000,
  });
  const myMissions = allMissions.filter(m =>
    m.creator_id === email || (m.participant_ids || []).includes(email)
  );

  // Invoices
  const { data: allInvoices = [] } = useQuery({
    queryKey: ['portalInvoices', email],
    queryFn: () => base44.entities.Invoice.list('-created_date', 200),
    enabled: !!email,
    staleTime: 60000,
  });

  const projectMap = {};
  myProjects.forEach(p => { projectMap[p.id] = p; });

  const projectIds = new Set(myProjects.map(p => p.id));
  const myInvoices = allInvoices.filter(inv => projectIds.has(inv.project_id));

  // Filter missions/invoices by selected project
  const filteredMissions = selectedProjectId
    ? myMissions.filter(m => m.project_id === selectedProjectId || m.title?.includes(myProjects.find(p => p.id === selectedProjectId)?.title || ''))
    : myMissions;

  const filteredInvoices = selectedProjectId
    ? myInvoices.filter(i => i.project_id === selectedProjectId)
    : myInvoices;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 pb-24">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Client Portal</h1>
            <p className="text-sm text-slate-500">Track project progress, approve milestones, and view invoices</p>
          </div>
        </div>

        {/* Project Selector */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FolderOpen className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-700">Your Projects</h2>
            {selectedProjectId && (
              <button
                className="text-xs text-violet-600 hover:underline ml-auto"
                onClick={() => setSelectedProjectId(null)}
              >
                Show All
              </button>
            )}
          </div>
          <ScrollArea className="w-full">
            <div className="flex gap-3 pb-2" style={{ minWidth: 'min-content' }}>
              {myProjects.length === 0 ? (
                <p className="text-sm text-slate-400 py-4">No projects associated with your account</p>
              ) : (
                myProjects.map(p => (
                  <div key={p.id} className="w-72 shrink-0">
                    <PortalProjectCard
                      project={p}
                      isSelected={selectedProjectId === p.id}
                      onClick={() => setSelectedProjectId(selectedProjectId === p.id ? null : p.id)}
                    />
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PortalMilestoneApproval missions={filteredMissions} />
          <PortalInvoiceTracker invoices={filteredInvoices} projectMap={projectMap} />
        </div>
      </div>
    </div>
  );
}