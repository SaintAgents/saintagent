// Affiliate tier badge image URLs
export const AFFILIATE_BADGE_IMAGES = {
  bronze: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/9619602d5_bronzecopy.png',
  silver: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/5b5001bc3_silver.png',
  gold: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694f3e0401b05e6e8a042002/66b865998_goldcopy.png',
};

// Get affiliate tier from paid referrals count
export function getAffiliateTier(paidReferrals = 0) {
  if (paidReferrals >= 20) return 'gold';
  if (paidReferrals >= 5) return 'silver';
  return 'bronze';
}

// Affiliate Badge component
export function AffiliateBadge({ tier = 'bronze', size = 32, className = '' }) {
  const imgUrl = AFFILIATE_BADGE_IMAGES[tier] || AFFILIATE_BADGE_IMAGES.bronze;
  return (
    <img 
      src={imgUrl} 
      alt={`${tier} affiliate`} 
      className={`object-contain ${className}`}
      style={{ width: size, height: size }}
      data-no-filter="true"
    />
  );
}

export default AffiliateBadge;