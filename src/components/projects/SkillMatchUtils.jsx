/**
 * Compute a skill match score between a task's required skill_tags
 * and a member's Skill records.
 *
 * Algorithm:
 * - Normalize all strings to lowercase
 * - For each task skill tag, find the best matching member skill using:
 *   1. Exact match → full weight (proficiency / 5)
 *   2. Substring/partial match → 60% weight
 *   3. No match → 0
 * - Score = average of best-match weights across all task tags × 100
 *
 * Returns { score: 0-100, matchedSkills: [...], missingSkills: [...] }
 */

export function computeSkillMatch(taskSkillTags = [], memberSkills = []) {
  if (!taskSkillTags.length) return { score: -1, matchedSkills: [], missingSkills: [] };
  if (!memberSkills.length) return { score: 0, matchedSkills: [], missingSkills: [...taskSkillTags] };

  const normalizedMemberSkills = memberSkills.map(s => ({
    name: (s.skill_name || '').toLowerCase().trim(),
    proficiency: s.proficiency || 3,
  }));

  const matchedSkills = [];
  const missingSkills = [];
  let totalWeight = 0;

  for (const tag of taskSkillTags) {
    const normalTag = tag.toLowerCase().trim();
    
    // Try exact match first
    const exact = normalizedMemberSkills.find(s => s.name === normalTag);
    if (exact) {
      matchedSkills.push({ tag, proficiency: exact.proficiency, type: 'exact' });
      totalWeight += exact.proficiency / 5;
      continue;
    }

    // Try partial match (substring in either direction)
    const partial = normalizedMemberSkills.find(
      s => s.name.includes(normalTag) || normalTag.includes(s.name)
    );
    if (partial) {
      matchedSkills.push({ tag, proficiency: partial.proficiency, type: 'partial' });
      totalWeight += (partial.proficiency / 5) * 0.6;
      continue;
    }

    missingSkills.push(tag);
  }

  const score = Math.round((totalWeight / taskSkillTags.length) * 100);
  return { score, matchedSkills, missingSkills };
}

/**
 * Returns a color + label for a given match score.
 */
export function getMatchScoreStyle(score) {
  if (score < 0) return null; // no tags on task
  if (score >= 80) return { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Strong' };
  if (score >= 50) return { color: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Partial' };
  if (score >= 1) return { color: 'bg-red-100 text-red-700 border-red-200', label: 'Weak' };
  return { color: 'bg-slate-100 text-slate-500 border-slate-200', label: 'None' };
}