// Rank badge image URLs - centralized for reuse across components
export const RANK_BADGE_IMAGES = {
  seeker: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/331f33ed1_seeker.png',
  initiate: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/649c5d173_intiate.png',
  adept: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/fac9c0a99_adept.png',
  practitioner: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/192e1da75_practioner.png',
  master: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/14c3808be_master.png',
  sage: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/86aed6de0_sage.png',
  oracle: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/e671b30c3_oracle.png',
  ascended: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/9b2234640_ascended.png',
  guardian: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/7cb4f6659_guardian.png',
};

// Rank Badge component
export function RankBadge({ code = 'seeker', size = 48, className = '' }) {
  const imgUrl = RANK_BADGE_IMAGES[code] || RANK_BADGE_IMAGES.seeker;
  return (
    <img 
      src={imgUrl} 
      alt={code} 
      className={`object-contain ${className}`}
      style={{ width: size, height: size }}
      data-no-filter="true"
    />
  );
}

export default RankBadge;