import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function useImpactProfile(email) {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ['impactProfile', email],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: email }, '-updated_date', 1),
    enabled: !!email,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
  const profile = query.data?.[0];
  const profileId = profile?.id;
  useEffect(() => {
    if (!email) return;
    return base44.entities.UserProfile.subscribe(event => {
      if (event.data?.user_id === email || (profileId && event.id === profileId)) {
        client.invalidateQueries({ queryKey: ['impactProfile', email], exact: true });
      }
    });
  }, [client, email, profileId]);
  return { profile, rankReady: query.isSuccess || !!profile };
}