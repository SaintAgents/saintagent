export const categories = ['mentorship','course','session','consulting','healing','mutual_aid','collaboration','strategy','legal','ai_prompts','web_dev','design','governance','finance','digital_rights','writing'];
export const titleCase = value => (value || '').replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
export const opportunityPath = id => `/ListingDetail?id=${encodeURIComponent(id)}`;
export const researchPath = objective => `/Intelligence?objective=${encodeURIComponent(objective.trim().slice(0, 400))}`;
export const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export const openGuide = draft => document.dispatchEvent(new CustomEvent('openMyAssistant', { detail:{ draft } }));
export const matchReasons = (row, tags) => tags.filter(tag => [row.category, ...(row.skills || []), ...(row.skills_required || [])].some(label => typeof label === 'string' && titleCase(label).toLowerCase() === titleCase(tag).toLowerCase()));