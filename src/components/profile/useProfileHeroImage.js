import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const privatePrefix = 'private:';
export const privateProfileHero = uri => `${privatePrefix}${uri}`;

export default function useProfileHeroImage(reference, enabled = true) {
  const uri = reference?.startsWith(privatePrefix) ? reference.slice(privatePrefix.length) : null;
  const { data } = useQuery({
    queryKey: ['profile-hero-image', uri],
    queryFn: () => base44.integrations.Core.CreateFileSignedUrl({ file_uri: uri }),
    enabled: enabled && !!uri,
    staleTime: 240_000,
    gcTime: 240_000,
    retry: false,
  });
  return uri ? data?.signed_url : reference;
}