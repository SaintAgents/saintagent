export const impactPillars = [
  ['Human upliftment', 20],
  ['Execution & outcomes', 20],
  ['Environmental stewardship', 15],
  ['Economic empowerment', 15],
  ['Integrity & accountability', 10],
  ['Collaboration & coherence', 10],
  ['Transformational potential', 10],
];

export const impactPresets = [
  { id: 'agriculture', name: 'Regenerative Agriculture Initiative', scores: [90, 75, 85, 70, 90, 85, 95], confidence: 85 },
  { id: 'garden', name: 'Neighborhood Food Garden', scores: [67, 43, 58, 25, 64, 76, 42], confidence: 62 },
  { id: 'watershed', name: 'Creek Restoration Crew', scores: [40, 54, 81, 28, 69, 73, 61], confidence: 73 },
];

const tiers = [
  [95, 'Planetary Catalyst'], [85, 'Global Transformer'], [70, 'Impact Leader'],
  [55, 'Impact Builder'], [40, 'Active Contributor'], [20, 'Emerging Catalyst'], [0, 'Impact Initiate'],
];

export function calculateImpactIndex(scores) {
  if (scores.length !== impactPillars.length || !impactPillars.every((_, index) => Number.isInteger(scores[index]) && scores[index] >= 0 && scores[index] <= 100)) {
    return { score: null, tier: 'Unassessed' };
  }
  const weightedPoints = impactPillars.reduce((total, [, weight], index) => total + scores[index] * weight, 0);
  return { score: weightedPoints / 100, tier: tiers.find(([min]) => weightedPoints >= min * 100)[1] };
}