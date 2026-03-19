import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { subDays } from 'date-fns';
import DashboardStatsBar from '@/components/dashboard/DashboardStatsBar';
import MyTasksSummary from '@/components/dashboard/MyTasksSummary';
import TimeLoggedChart from '@/components/dashboard/TimeLoggedChart';
import RecentActivityFeed from '@/components/dashboard/RecentActivityFeed';
import MissionProjectSummary from '@/components/dashboard/MissionProjectSummary';
import { LayoutDashboard } from 'lucide-react';

export default function MyDashboard() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    staleTime: 300000,
  });

  const email = user?.email;

  // My missions (where I'm a participant or creator)
  const { data: allMissions = [] } = useQuery({
    queryKey: ['dashMissions', email],
    queryFn: () => base44.entities.Mission.list('-updated_date', 100),
    enabled: !!email,
    staleTime: 60000,
  });
  const myMissions = allMissions.filter(m =>
    m.creator_id === email || (m.participant_ids || []).includes(email)
  );

  // My projects (where I'm owner or team member)
  const { data: allProjects = [] } = useQuery({
    queryKey: ['dashProjects', email],
    queryFn: () => base44.entities.Project.list('-updated_date', 100),
    enabled: !!email,
    staleTime: 60000,
  });
  const myProjects = allProjects.filter(p =>
    p.owner_id === email || p.created_by === email || (p.team_member_ids || []).includes(email)
  );

  // My tasks
  const { data: myTasks = [] } = useQuery({
    queryKey: ['dashTasks', email],
    queryFn: () => base44.entities.ProjectTask.filter({ assignee_id: email }, '-updated_date', 100),
    enabled: !!email,
    staleTime: 60000,
  });

  // Time entries (last 7 days)
  const sevenDaysAgo = subDays(new Date(), 7).toISOString();
  const { data: timeEntries = [] } = useQuery({
    queryKey: ['dashTimeEntries', email],
    queryFn: () => base44.entities.TaskTimeEntry.filter({ user_id: email }, '-created_date', 200),
    enabled: !!email,
    staleTime: 30000,
  });
  const recentEntries = timeEntries.filter(e => e.start_time >= sevenDaysAgo);

  // Notifications as activity feed
  const { data: notifications = [] } = useQuery({
    queryKey: ['dashNotifications', email],
    queryFn: () => base44.entities.Notification.filter({ user_id: email }, '-created_date', 30),
    enabled: !!email,
    staleTime: 60000,
  });

  const totalMinutes = recentEntries.reduce((sum, e) => sum + (e.duration_minutes || 0), 0);

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
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Dashboard</h1>
            <p className="text-sm text-slate-500">Welcome back, {user.full_name?.split(' ')[0] || 'Agent'}</p>
          </div>
        </div>

        {/* Stats Bar */}
        <DashboardStatsBar
          missions={myMissions}
          projects={myProjects}
          tasks={myTasks}
          timeLoggedMinutes={totalMinutes}
        />

        {/* Main Grid: Tasks + Time Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MyTasksSummary tasks={myTasks} projects={allProjects} />
          <TimeLoggedChart timeEntries={recentEntries} />
        </div>

        {/* Missions & Projects Summary */}
        <MissionProjectSummary missions={myMissions} projects={myProjects} />

        {/* Activity Feed */}
        <RecentActivityFeed notifications={notifications} />
      </div>
    </div>
  );
}