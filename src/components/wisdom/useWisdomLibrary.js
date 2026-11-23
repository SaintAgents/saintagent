import { useEffect, useState } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { checkedStatuses, libraryFilter, queryKey, visibility } from '@/components/wisdom/wisdomCards';

export default function useWisdomLibrary(user) {
  const [filters,setFilters] = useState({ search:'',category:'',status:'',mine:false });
  const [search,setSearch] = useState('');
  useEffect(() => { const timer = setTimeout(() => setSearch(filters.search),250); return () => clearTimeout(timer); },[filters.search]);
  const criteria = libraryFilter(user,{ ...filters,search });
  const cards = useInfiniteQuery({ queryKey:[...queryKey,'list',user.id,criteria], initialPageParam:undefined,
    queryFn:({ pageParam }) => base44.entities.WisdomCard.filter(criteria,{ sort:'-created_date',limit:24,cursor:pageParam }),
    getNextPageParam:page => page.has_more ? page.next_cursor || undefined : undefined });
  const stats = useQuery({ queryKey:[...queryKey,'stats',user.id], queryFn:() => {
    const scope = visibility(user);
    const count = criterion => base44.entities.WisdomCard.count(criterion ? { $and:[scope,criterion] } : scope);
    return Promise.all([count(),count({status:{ $in:checkedStatuses }}),count({status:'Verified'}),count({quiz_ready:true})]);
  }});
  return { filters,setFilters, cards,stats };
}