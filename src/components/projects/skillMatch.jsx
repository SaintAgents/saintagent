/**
 * Computes a match score (0-100) between a member's skills and a task's required skill_tags.
 *
 * Algorithm:
 * - Normalizes both skill names and task tags to lowercase tokens
 * - For each task tag, finds the best matching skill using substring/word overlap
 * - Weights matches by the skill proficiency (1-5 → 0.2-1.0)
 * - Returns weighted percentage of tags matched
 *
 * @param {Array} memberSkills - Array of Skill entities {skill_name, proficiency}
 * @param {Array} taskTags - Array of skill tag strings required by the task
 * @returns {{ score: number, matchedTags: string[], unmatchedTags: string[] }}
 */
export function computeSkillMatch(memberSkills = [], taskTags = []) {
  if (!taskTags.length) return { score: 0, matchedTags: [], unmatchedTags: [] };
  if (!memberSkills.length) return { score: 0, matchedTags: [], unmatchedTags: [...taskTags] };

  const normalize = (s) => (s || '').toLowerCase().trim();
  const tokenize = (s) => normalize(s).split(/[\s,\-_/]+/).filter(Boolean);

  const matchedTags = [];
  const unmatchedTags = [];
  let totalWeight = 0;

  for (const tag of taskTags) {
    const tagNorm = normalize(tag);
    const tagTokens = tokenize(tag);

    let bestProficiency = 0;
    let matched = false;

    for (const skill of memberSkills) {
      const skillNorm = normalize(skill.skill_name);
      const skillTokens = tokenize(skill.skill_name);
      const prof = skill.proficiency || 3;

      // Exact match
      if (skillNorm === tagNorm) {
        bestProficiency = Math.max(bestProficiency, prof);
        matched = true;
        continue;
      }

      // Substring match (skill contains tag or tag contains skill)
      if (skillNorm.includes(tagNorm) || tagNorm.includes(skillNorm)) {
        bestProficiency = Math.max(bestProficiency, prof * 0.9);
        matched = true;
        continue;
      }

      // Token overlap — at least one significant token matches
      const overlap = tagTokens.filter(t => t.length > 2 && skillTokens.some(s => s.includes(t) || t.includes(s)));
      if (overlap.length > 0) {
        const overlapRatio = overlap.length / Math.max(tagTokens.length, 1);
        bestProficiency = Math.max(bestProficiency, prof * overlapRatio * 0.8);
        matched = true;
      }
    }

    if (matched && bestProficiency > 0) {
      matchedTags.push(tag);
      totalWeight += bestProficiency / 5; // normalize proficiency to 0-1
    } else {
      unmatchedTags.push(tag);
    }
  }

  const score = Math.round((totalWeight / taskTags.length) * 100);
  return { score: Math.min(score, 100), matchedTags, unmatchedTags };
}

/**
 * Returns a color class string based on the match score
 */
export function getMatchScoreColor(score) {
  if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
  if (score > 0) return 'text-orange-600 bg-orange-50 border-orange-200';
  return 'text-slate-400 bg-slate-50 border-slate-200';
}