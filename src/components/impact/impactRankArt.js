import { getRPRank, RP_LADDER } from '@/components/reputation/rpUtils';

const imageRoot = 'https://media.base44.com/images/public/694f3e0401b05e6e8a042002/';
const artwork = {
  seeker: 'f1dc851dd05f5ea3d5e64999be5ae480',
  initiate: 'e38a85975fe51397ba694bf39dd1e895',
  adept: '7ed6c804a9813d712b9dc1c8b7c1391e',
  practitioner: '94bdb90bb5d0abd0e09f3c0342704549',
  master: 'a7e1b7030a28ffe24002fc971440e5cb',
  sage: '8b331c6a26390d83386fdcddcb66e22c',
  oracle: '3fa5072bd2f402f11e54c86ed14f7e8d',
  ascended: '0c54e0ba1a7003b8ecab8e185aee9e41',
  guardian: 'e85fdab757db1c76d1a346f9c7bd6d15',
};

const findRank = value => RP_LADDER.find(({ code }) => code === String(value ?? '').trim().toLowerCase());

export function resolveImpactRank(profile, points) {
  const legacy = findRank(profile?.rank_code);
  // The legacy field defaults to Seeker, even for profiles that progress by points alone.
  return findRank(profile?.rp_rank_code) || (legacy?.code !== 'seeker' && legacy) || getRPRank(points);
}

export function impactRankBackground(code) {
  return Object.hasOwn(artwork, code) ? `url('${imageRoot}${artwork[code]}_generated_image.png')` : 'none';
}