// RP ladder utilities for SaintAgent

export const RP_LADDER = [
  { level: 1, code: 'seeker', title: 'Seeker', min: 200, nextMin: 500 },
  { level: 2, code: 'initiate', title: 'Initiate', min: 500, nextMin: 800 },
  { level: 3, code: 'adept', title: 'Adept', min: 800, nextMin: 1200 },
  { level: 4, code: 'practitioner', title: 'Practitioner', min: 1200, nextMin: 1800 },
  { level: 5, code: 'master', title: 'Master', min: 1800, nextMin: 2600 },
  { level: 6, code: 'sage', title: 'Sage', min: 2600, nextMin: 3600 },
  { level: 7, code: 'oracle', title: 'Oracle', min: 3600, nextMin: 5200 },
  { level: 8, code: 'ascended', title: 'Ascended', min: 5200, nextMin: 7200 },
  { level: 9, code: 'guardian', title: 'Guardian', min: 7200, nextMin: 10000 },
];

export function getRPRank(points = 0) {
  if (points < RP_LADDER[0].min) {
    const next = RP_LADDER[0];
    return {
      ...next,
      currentMin: next.min,
      nextTitle: RP_LADDER[1]?.title || null,
    };
  }
  const tier = RP_LADDER.find((t) => (t.nextMin ?? Infinity) > points && t.min <= points) || RP_LADDER[RP_LADDER.length - 1];
  const nextIndex = RP_LADDER.findIndex((t) => t.code === tier.code) + 1;
  return {
    ...tier,
    currentMin: tier.min,
    nextTitle: RP_LADDER[nextIndex]?.title || null,
  };
}