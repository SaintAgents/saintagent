import { base44 } from '@/api/base44Client';

export const categories = ['Global Impact','Capital & Funding','Climate & Environment','Health & Wellbeing','Education & Skills','Food & Water','Governance & Rights','Technology & AI','Community & Culture','Other'];
export const statuses = ['Draft','Checking','Verified','Needs Review','Disputed'];
export const checkedStatuses = ['Verified','Needs Review','Disputed'];
export const fields = { title:160, insight:4000, region:120, tags:350, learned_from:500, linked_record_type:80, linked_record_id:160, linked_record_name:160 };
export const tagsFor = card => [...new Set((card.tags || '').split(',').map(tag => tag.trim()).filter(Boolean))];
export const canManage = (card, user) => !!card && (user?.role === 'admin' || card.created_by_id === user?.id);
export const statusFor = check => !check ? 'Draft' : ['Verified','Disputed'].includes(check.verdict) ? check.verdict : 'Needs Review';
export const factKey = card => JSON.stringify([card.title,card.insight,card.category,card.region,card.tags,card.source_links]);
export const queryKey = ['wisdom-cards'];
export const callWisdom = async (action, payload) => (await base44.functions.invoke('wisdomCardActions',{ action,...payload })).data;
export const errorText = (error, fallback) => error?.response?.data?.error || fallback;
export function safeUrl(value) {
  try { const url = new URL(value); return ['https:','http:'].includes(url.protocol) && !url.username && !url.password ? url.href : ''; } catch { return ''; }
}
export const dateLabel = value => value && Number.isFinite(Date.parse(value)) ? new Intl.DateTimeFormat(undefined,{ dateStyle:'medium', timeStyle:'short' }).format(new Date(value)) : '';
export const visibility = user => ({ $or:[{ is_public:true },{ created_by_id:user.id }] });
export function libraryFilter(user, {search,category,status,mine}) {
  const clauses = [mine ? { $or:[{ owner_user_id:user.id },{ created_by_id:user.id }] } : visibility(user)];
  if (category) clauses.push({ category });
  if (status) clauses.push({ status });
  const pattern = search.trim().slice(0,160).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  if (pattern) clauses.push({ $or:['title','insight','category','region','tags','learned_from','owner_name','linked_record_name'].map(field => ({[field]:{ $regex:pattern,$options:'i' }})) });
  return clauses.length === 1 ? clauses[0] : { $and:clauses };
}