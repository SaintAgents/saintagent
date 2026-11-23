import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export const sectionLimit = 20;
export const bookmarkLimit = 30;
const safePage = path => typeof path === 'string' && /^\/(?!\/)[\w/-]{0,179}$/.test(path);
export const pagePath = pathname => {
  const path = pathname.replace(/\/+$/, '') || '/';
  return safePage(path) ? path : null;
};
export const pageLabel = path => (path.split('/').filter(Boolean).at(-1) || 'Home')
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
  const { data: sections } = useQuery({
    queryKey, enabled: false, staleTime: Infinity,
    initialData: () => readSections(user.side_panel_bookmarks),
  });
  const { mutate, isError, isPending } = useMutation({
    mutationFn: next => base44.auth.updateMe({ side_panel_bookmarks: { sections: next } }),
    onSuccess: (_, next) => client.setQueryData(queryKey, next),
  });
  return { sections, save: mutate, busy: isPending, error: isError };
}