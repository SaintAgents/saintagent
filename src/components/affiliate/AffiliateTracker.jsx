import { useEffect } from 'react';

// This component handles affiliate tracking on app load
// It ONLY stores the ref code in localStorage - no API calls on public pages
export default function AffiliateTracker() {
  useEffect(() => {
    // Check URL for affiliate code
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    
    if (refCode) {
      // Store in localStorage with expiry - this is all we do on public pages
      const attribution = {
        code: refCode,
        timestamp: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      };
      try {
        localStorage.setItem('affiliate_attribution', JSON.stringify(attribution));
        console.log('Affiliate code stored:', refCode);
      } catch (e) {
        console.error('Failed to store affiliate code:', e);
      }
    }
  }, []);

  return null;
}

// Helper function to attach referral to user after signup
// Call this from onboarding completion or after user signs up
export async function attachAffiliateToUser(userId, base44) {
  const attributionStr = localStorage.getItem('affiliate_attribution');
  if (!attributionStr) return;

  try {
    const attribution = JSON.parse(attributionStr);
    const expiresAt = new Date(attribution.expiresAt);
    
    // Check if attribution is still valid
    if (new Date() > expiresAt) {
      localStorage.removeItem('affiliate_attribution');
      return;
    }

    // Find affiliate user
    const codes = await base44.entities.AffiliateCode.filter({ code: attribution.code });
    if (codes.length === 0) return;

    const affiliateCode = codes[0];

    // Prevent self-referral
    if (affiliateCode.user_id === userId) {
      localStorage.removeItem('affiliate_attribution');
      return;
    }

    // Create referral record
    await base44.entities.Referral.create({
      affiliate_user_id: affiliateCode.user_id,
      referred_user_id: userId,
      affiliate_code: attribution.code,
      status: 'pending',
      click_timestamp: attribution.timestamp,
      signup_timestamp: new Date().toISOString(),
      attribution_expires_at: attribution.expiresAt
    });

    // Update signup count
    await base44.entities.AffiliateCode.update(affiliateCode.id, {
      total_signups: (affiliateCode.total_signups || 0) + 1
    });

    // Clear attribution
    localStorage.removeItem('affiliate_attribution');
  } catch (error) {
    console.error('Error attaching affiliate:', error);
  }
}

// Helper to mark referral as activated after onboarding
export async function activateReferral(userId) {
  try {
    const referrals = await base44.entities.Referral.filter({ 
      referred_user_id: userId, 
      status: 'pending' 
    });

    if (referrals.length > 0) {
      const referral = referrals[0];
      await base44.entities.Referral.update(referral.id, {
        status: 'activated',
        activated_timestamp: new Date().toISOString()
      });

      // Update activated count
      const codes = await base44.entities.AffiliateCode.filter({ 
        user_id: referral.affiliate_user_id 
      });
      if (codes.length > 0) {
        await base44.entities.AffiliateCode.update(codes[0].id, {
          total_activated: (codes[0].total_activated || 0) + 1
        });
      }
    }
  } catch (error) {
    console.error('Error activating referral:', error);
  }
}

// Helper to mark referral as paid after qualifying action
export async function payoutReferral(userId, qualifyingAction, qualifyingActionId) {
  try {
    const referrals = await base44.entities.Referral.filter({ 
      referred_user_id: userId, 
      status: 'activated' 
    });

    if (referrals.length > 0) {
      const referral = referrals[0];
      const gggAmount = 0.25;
      const unitValue = 145.00;
      const creditedValue = 36.25;

      // Update referral status
      await base44.entities.Referral.update(referral.id, {
        status: 'paid',
        paid_timestamp: new Date().toISOString(),
        qualifying_action: qualifyingAction,
        qualifying_action_id: qualifyingActionId
      });

      // Create GGG transaction
      await base44.entities.GGGTransaction.create({
        user_id: referral.affiliate_user_id,
        source_type: 'referral',
        source_id: referral.id,
        delta: gggAmount,
        reason_code: 'referral_payout',
        description: `Referral payout for ${userId}`,
        balance_after: 0 // Would need to calculate actual balance
      });

      // Update affiliate code stats
      const codes = await base44.entities.AffiliateCode.filter({ 
        user_id: referral.affiliate_user_id 
      });
      if (codes.length > 0) {
        await base44.entities.AffiliateCode.update(codes[0].id, {
          total_paid: (codes[0].total_paid || 0) + 1,
          total_ggg_earned: (codes[0].total_ggg_earned || 0) + gggAmount
        });
      }

      // Update affiliate user's GGG balance
      const profiles = await base44.entities.UserProfile.filter({ 
        user_id: referral.affiliate_user_id 
      });
      if (profiles.length > 0) {
        await base44.entities.UserProfile.update(profiles[0].id, {
          ggg_balance: (profiles[0].ggg_balance || 0) + gggAmount
        });
      }
    }
  } catch (error) {
    console.error('Error paying referral:', error);
  }
}