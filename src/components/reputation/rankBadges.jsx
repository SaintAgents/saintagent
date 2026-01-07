// Rank badge image URLs - centralized for reuse across components (black & white transparent PNGs)
export const RANK_BADGE_IMAGES = {
  seeker: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/ca144ec05_Screenshot2026-01-07063246.png',
  initiate: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/827a58594_intiate-Picsart-BackgroundRemover.png',
  adept: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/7625a41f0_adept-Picsart-BackgroundRemover.png',
  practitioner: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/48ccb9301_practioner-Picsart-BackgroundRemover.png',
  master: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/55437ee3d_master-Picsart-BackgroundRemover.png',
  sage: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/0f68882e2_sage-Picsart-BackgroundRemover.png',
  oracle: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/d3f6ba23f_oracle-Picsart-BackgroundRemover.png',
  ascended: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/c3caf20f6_Screenshot2026-01-07044338-Picsart-BackgroundRemover.png',
  guardian: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/f37bf041e_Screenshot2026-01-07044414-Picsart-BackgroundRemover.png',
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