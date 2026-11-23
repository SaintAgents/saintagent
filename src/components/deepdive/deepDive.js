import { base44 } from '@/api/base44Client';

export const openDeepDive = (request = {}) => document.dispatchEvent(new CustomEvent('openDeepDive', { detail: request }));

export async function runDeepDive({ draft = true, ...input }) {
  const { data } = await base44.functions.invoke('saintIntelligence', { ...input, draft, mode: 'deep' });
  if (draft ? !data?.report : !data?.id) throw new Error('Research report was unavailable.');
  return draft ? data.report : data.id;
}

export async function readDeepDive(owner, id) {
  const [record] = await base44.entities.IntelligenceStudy.filter({ id, created_by_id: owner }, '-created_date', 1);
  if (!record) throw new Error('Investigation not available.');
  return record;
}