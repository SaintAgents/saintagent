import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * Hook to fetch missions and projects for the dashboard,
 * scoped to the current user's involvement.
 */
export function useDashboardMissions({ currentUser, queryStage }) {
  return useQuery({
    queryKey: ['dashboardMissions', currentUser?.email],
    queryFn: async () => {
      const allMissions = await base44.entities.Mission.filter({ status: 'active' }, '-created_date', 50);
      return allMissions.filter(m =>
        m.creator_id === currentUser?.email ||
        (m.participant_ids || []).includes(currentUser?.email)
      );
    },
    enabled: queryStage >= 2 && !!currentUser?.email,
    staleTime: 300000,
    refetchOnWindowFocus: false,
  });
}

export function useDashboardProjects({ currentUser, queryStage }) {
  return useQuery({
    queryKey: ['dashboardProjects', currentUser?.email],
    queryFn: async () => {
      const allProjects = await base44.entities.Project.list('-created_date', 100);
      return allProjects.filter(p =>
        p.owner_id === currentUser?.email ||
        p.claimed_by === currentUser?.email ||
        (p.team_member_ids || []).includes(currentUser?.email)
      );
    },
    enabled: queryStage >= 2 && !!currentUser?.email,
    staleTime: 300000,
    refetchOnWindowFocus: false,
  });
}