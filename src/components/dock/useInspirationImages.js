import { useInfiniteQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export const inspirationKey = ['inspiration-images'];

export function useInspirationImages(enabled = true) {
  return useInfiniteQuery({
    queryKey: inspirationKey,
    queryFn: ({ pageParam }) => base44.entities.InspirationImage.list({ sort: 'display_order', limit: 20, cursor: pageParam }),
    initialPageParam: undefined,
    getNextPageParam: page => page.has_more ? page.next_cursor : undefined,
    enabled,
  });
}