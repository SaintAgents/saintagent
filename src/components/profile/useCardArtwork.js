import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function useCardArtwork(userId, profileId, enabled = true) {
  const queryKey = ['profile-digital-art', userId, profileId];
  const record = useQuery({ queryKey, enabled: enabled && !!userId && !!profileId, queryFn: async () => (await base44.entities.ProfileDigitalArt.filter({ created_by_id: userId, profile_id: profileId }, '-updated_date', 1))[0] || null });
  const uri = record.data?.digital_art_uri;
  const signed = useQuery({ queryKey: ['profile-card-art-url', userId, uri], enabled: enabled && !!uri, staleTime: 240000, gcTime: 240000,
    queryFn: () => base44.integrations.Core.CreateFileSignedUrl({ file_uri: uri, expires_in: 300 }), refetchInterval: 240000 });
  return { record, queryKey, url: uri ? signed.data?.signed_url : record.data?.digital_art_url, isPending: record.isPending || (!!uri && signed.isPending), isError: record.isError || signed.isError, refetch: record.isError ? record.refetch : signed.refetch };
}