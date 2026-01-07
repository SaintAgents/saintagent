import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Share2, Link2, Copy, Check, Sparkles, TrendingUp } from 'lucide-react';
import { AFFILIATE_BADGE_IMAGES } from '@/components/reputation/affiliateBadges';

export default function ShareAffiliateLinkButton({ onInsertMessage, className }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: affiliateCodes = [] } = useQuery({
    queryKey: ['affiliateCodes', currentUser?.email],
    queryFn: () => base44.entities.AffiliateCode.filter({ user_id: currentUser.email }),
    enabled: !!currentUser?.email
  });

  const { data: referrals = [] } = useQuery({
    queryKey: ['referrals', currentUser?.email],
    queryFn: () => base44.entities.Referral.filter({ referrer_id: currentUser.email }),
    enabled: !!currentUser?.email
  });

  const activeCode = affiliateCodes.find(c => c.status === 'active');
  const paidReferrals = referrals.filter(r => r.status === 'paid').length;
  
  // Determine tier
  const getTier = () => {
    if (paidReferrals >= 50) return { name: 'Gold', color: 'text-amber-600', badge: AFFILIATE_BADGE_IMAGES.gold };
    if (paidReferrals >= 10) return { name: 'Silver', color: 'text-slate-500', badge: AFFILIATE_BADGE_IMAGES.silver };
    return { name: 'Bronze', color: 'text-orange-600', badge: AFFILIATE_BADGE_IMAGES.bronze };
  };
  
  const tier = getTier();
  const referralLink = activeCode 
    ? `${window.location.origin}/Join?ref=${activeCode.code}`
    : `${window.location.origin}/Join`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsert = () => {
    const message = customMessage || 
      `🌟 Join me on Saint Agents! Use my referral link to get started: ${referralLink}`;
    onInsertMessage(message);
    setOpen(false);
    setCustomMessage('');
  };

  const presetMessages = [
    `🌟 Join me on Saint Agents! We're building something amazing together. ${referralLink}`,
    `🚀 Ready to level up? Join Saint Agents with my link and let's collaborate! ${referralLink}`,
    `💫 I've been loving Saint Agents - check it out! ${referralLink}`,
  ];

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className={className}
        onClick={() => setOpen(true)}
        title="Share affiliate link"
      >
        <Share2 className="w-4 h-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-violet-600" />
              Share Your Affiliate Link
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Affiliate Stats */}
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-100">
              <div className="flex items-center gap-3">
                <img src={tier.badge} alt={tier.name} className="w-10 h-10" />
                <div>
                  <p className={`font-semibold ${tier.color}`}>{tier.name} Affiliate</p>
                  <p className="text-xs text-slate-500">{paidReferrals} successful referrals</p>
                </div>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700">
                <TrendingUp className="w-3 h-3 mr-1" />
                Active
              </Badge>
            </div>

            {/* Referral Link */}
            <div>
              <label className="text-sm font-medium text-slate-700">Your Referral Link</label>
              <div className="flex items-center gap-2 mt-1">
                <Input 
                  value={referralLink} 
                  readOnly 
                  className="text-sm font-mono bg-slate-50"
                />
                <Button variant="outline" size="icon" onClick={handleCopy}>
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Quick Messages */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Quick Messages</label>
              <div className="space-y-2">
                {presetMessages.map((msg, i) => (
                  <button
                    key={i}
                    onClick={() => setCustomMessage(msg)}
                    className="w-full text-left p-3 text-sm rounded-lg border border-slate-200 hover:border-violet-300 hover:bg-violet-50 transition-colors"
                  >
                    {msg}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Message */}
            <div>
              <label className="text-sm font-medium text-slate-700">Custom Message</label>
              <Textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Write your own message to share..."
                className="mt-1 min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleInsert}
              className="bg-violet-600 hover:bg-violet-700 gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Insert Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}