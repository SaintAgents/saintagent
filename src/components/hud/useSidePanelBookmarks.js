import { useIsMutating, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export const sectionLimit = 20;
export const bookmarkLimit = 30;
const safePage = path => typeof path === 'string' && path.length <= 2048 && /^\/(?![\/\\])[\w/%.-]*(?:\?[^#\s\\]*)?(?:#[^\s\\]*)?$/.test(path) && !/[\u0000-\u001f\u007f]/.test(path);
export const pagePath = (pathname, search = '', hash = '') => {
  const path = (pathname.replace(/\/+$/, '') || '/') + search + hash;
  return safePage(path) ? path : null;
};
export const pageLabel = path => (path.split(/[?#]/, 1)[0].split('/').filter(Boolean).at(-1) || 'Home')
  .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2').replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[-_]+/g, ' ');

function readSections(value) {
  if (!Array.isArray(value?.sections)) return [];
  return value.sections.filter(section => typeof section?.id === 'string' && typeof section.name === 'string')
    .slice(0, sectionLimit).map(section => ({
      id: section.id, name: section.name.slice(0, 45),
      pages: Array.isArray(section.pages) ? [...new Set(section.pages.filter(safePage))].slice(0, bookmarkLimit) : [],
    }));
}

export default function useSidePanelBookmarks(user) {
  const client = useQueryClient();
  const queryKey = ['side-panel-bookmarks', user.id];
  const query = useQuery({
    queryKey,
    queryFn: async () => readSections((await base44.auth.me()).side_panel_bookmarks),
    placeholderData: () => readSections(user.side_panel_bookmarks),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
  const saving = useIsMutating({ mutationKey: queryKey, exact: true }) > 0;
  const { mutate, isError } = useMutation({
    mutationKey: queryKey,
    onMutate: () => client.cancelQueries({ queryKey, exact: true }),
    mutationFn: next => base44.auth.updateMe({ side_panel_bookmarks: { sections: next } }),
    onSuccess: (_, next) => client.setQueryData(queryKey, next),
  });
  return {
    sections: query.data ?? [], save: mutate,
    busy: saving || query.isFetching || query.isError,
    loading: query.isFetching, saving, error: isError,
    loadError: query.isError, retry: query.refetch,
  };
}