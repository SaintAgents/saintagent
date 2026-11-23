import { useEffect, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { escapeRegex } from '@/components/globalimpact/impactDiscovery';

export default function useImpactOpportunities(user, filters, mode, tags) {
  const [applied, setApplied] = useState(filters);
  useEffect(() => { const timeout = setTimeout(() => setApplied(filters), 250); return () => clearTimeout(timeout); }, [filters]);
  const { search, category, format, duration, region, skill } = applied;
  const query = { status:'active' }, conditions = [];
  const contains = text => ({ $regex:escapeRegex(text.trim()), $options:'i' });
  if (search.trim()) conditions.push({ $or:['title','description','entity_name','owner_name'].map(field => ({ [field]:contains(search) })) });
  if (category) query.category = category;
  if (format) query.delivery_mode = format;
  if (duration) query.duration_minutes = duration === 'short' ? { $gt:0,$lte:60 } : { $gt:60 };
  if (region.trim()) query.region = contains(region);
  if (skill.trim()) query.skills_required = { $in:[skill.trim().toLowerCase()] };
  if (mode === 'forYou' && tags.length) {
    const labels = [...new Set(tags.flatMap(tag => [tag,tag.toLowerCase(),tag.toLowerCase().replace(/[ -]+/g,'_')]))];
    conditions.push({ $or:['category','skills','skills_required'].map(field => ({ [field]:{ $in:labels } })) });
  }
  if (conditions.length) query.$and = conditions;
  return useInfiniteQuery({ queryKey:['global-opportunities',user?.id,query], enabled:!!user?.id && (mode !== 'forYou' || !!tags.length), initialPageParam:undefined,
    queryFn:({pageParam}) => base44.entities.Listing.filter(query, { sort:'-created_date', limit:6, cursor:pageParam }),
    getNextPageParam:page => page.has_more ? page.next_cursor : undefined });
}