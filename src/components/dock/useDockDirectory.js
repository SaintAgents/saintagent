import { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { escapeRegex } from '@/components/globalimpact/impactDiscovery';

const fields = ['display_name','handle','title','role','organization','company','location','region','skills','bio'];
export const matchText = (value, keys) => ({ $or: keys.map(key => ({ [key]: { $regex: escapeRegex(value), $options: 'i' } })) });
export function useDockDirectory(user, visible, contacts = false) {
  const [search, setSearch] = useState('');
  const query = useInfiniteQuery({
    queryKey: ['dock-directory', user.id, search, contacts], enabled: visible,
    initialPageParam: undefined,
    queryFn: async ({pageParam}) => {
      const options = {sort:contacts ? 'name' : 'display_name', limit:12, cursor:pageParam};
      if (contacts) return base44.entities.Contact.filter({ owner_id:user.email, ...(search && matchText(search, ['name','company','role','phone','email'])) }, options);
      return base44.entities.UserProfile.filter({ user_id:{$ne:user.email}, profile_visibility:{$ne:'private'}, ...(search && matchText(search, fields)) }, options);
    },
    getNextPageParam: page => page.has_more ? page.next_cursor : undefined,
  });
  return { query, rows: query.data?.pages.flatMap(page => page.items) ?? [], setSearch };
}
export const openMember = userId => document.dispatchEvent(new CustomEvent('openProfile', {detail:{userId}}));