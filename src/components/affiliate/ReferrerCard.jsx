import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sparkles, UserPlus } from 'lucide-react';

export default function ReferrerCard() {
  // Get referral code from URL or localStorage
  const refCode = React.useMemo(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    const urlRef = params.get('ref');
    if (urlRef) return urlRef;
    try {
      return localStorage.getItem('affiliate_ref_code');
    } catch {
      return null;
    }
  }, []);

  // Look up the affiliate by SA# or code
  const { data: affiliateCode } = useQuery({
    queryKey: ['referrerCode', refCode],
    queryFn: async () => {
      if (!refCode) return null;
      // Try SA number first
      let codes = await base44.entities.AffiliateCode.filter({ sa_number: refCode, status: 'active' });
      if (codes.length === 0) {
        // Try by code
        codes = await base44.entities.AffiliateCode.filter({ code: refCode, status: 'active' });
      }
      return codes[0] || null;
    },
    enabled: !!refCode
  });

  // Get the affiliate's profile for more details
  const { data: affiliateProfile } = useQuery({
    queryKey: ['referrerProfile', affiliateCode?.user_id],
    queryFn: async () => {
      if (!affiliateCode?.user_id) return null;
      const profiles = await base44.entities.UserProfile.filter({ user_id: affiliateCode.user_id });
      return profiles[0] || null;
    },
    enabled: !!affiliateCode?.user_id
  });

  if (!refCode || !affiliateCode) return null;

  const displayName = affiliateCode.display_name || affiliateProfile?.display_name || 'A Saint Agent';
  const avatarUrl = affiliateCode.avatar_url || affiliateProfile?.avatar_url;
  const tagline = affiliateCode.tagline || affiliateProfile?.tagline || 'Invited you to join';
  const saNumber = affiliateCode.sa_number || affiliateCode.code;

  return (
    <Card className="bg-gradient-to-br from-violet-900/60 to-purple-900/60 border-violet-500/40 backdrop-blur-sm max-w-md mx-auto mb-8">
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="w-16 h-16 border-2 border-violet-400/50">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="bg-violet-800 text-violet-200 text-xl">
                {displayName?.charAt(0) || 'S'}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center">
              <UserPlus className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-violet-300 text-sm">Referred by</span>
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
                SA#{saNumber}
              </Badge>
            </div>
            <h3 className="text-lg font-semibold text-white truncate">{displayName}</h3>
            <p className="text-sm text-violet-300/80 truncate">{tagline}</p>
          </div>
          
          <Sparkles className="w-8 h-8 text-amber-400/60 shrink-0" />
        </div>
        
        <div className="mt-4 pt-3 border-t border-violet-500/20 text-center">
          <p className="text-xs text-violet-300/70">
            Join through this referral and both of you earn bonus rewards!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}