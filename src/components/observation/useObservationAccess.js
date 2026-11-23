import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { canObserve, destinations } from '@/components/observation/observationPages';
export default function useObservationAccess(user, checkLeader = true) {
  const { data:profiles } = useQuery({ queryKey:['observation-leader',user?.email], enabled:!!user?.email && checkLeader, staleTime:0, queryFn:() => base44.entities.UserProfile.filter({user_id:user.email}) });
  const leader = ['verified144k','candidate'].includes(profiles?.[0]?.leader_tier);
  return destinations.filter(page => canObserve(page,user,leader));
}