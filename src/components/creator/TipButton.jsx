import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Heart, Coins, Sparkles, Smile } from "lucide-react";
import EmojiPicker from '@/components/messages/EmojiPicker';
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const TIP_PRESETS = [0.01, 0.05, 0.10, 0.25, 0.50, 1.00];

export default function TipButton({ 
  toUserId, 
  toUserName, 
  contextType = 'profile', 
  contextId,
  variant = 'default',
  className 
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(0.05);
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ user_id: user.email });
      return profiles[0];
    }
  });

  // Wallet for authoritative GGG balance
  const { data: walletRes } = useQuery({
    queryKey: ['wallet', currentUser?.email],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('walletEngine', {
        action: 'getWallet',
        payload: { user_id: currentUser.email }
      });
      return data;
    },
    enabled: !!currentUser?.email,
    refetchInterval: 5000
  });
  const walletBalance = walletRes?.wallet?.available_balance ?? userProfile?.ggg_balance ?? 0;

  const tipMutation = useMutation({
    mutationFn: async () => {
      const tipAmount = customAmount ? parseFloat(customAmount) : amount;
      
      if (tipAmount <= 0) throw new Error('Invalid tip amount');
      if (userProfile.ggg_balance < tipAmount) throw new Error('Insufficient GGG balance');

      // Create tip record
      const tip = await base44.entities.Tip.create({
        from_user_id: currentUser.email,
        from_name: isAnonymous ? 'Anonymous' : userProfile.display_name,
        from_avatar: isAnonymous ? null : userProfile.avatar_url,
        to_user_id: toUserId,
        to_name: toUserName,
        amount_ggg: tipAmount,
        message: message || null,
        is_anonymous: isAnonymous,
        context_type: contextType,
        context_id: contextId,
        status: 'completed'
      });

      // Deduct from tipper
      await base44.entities.UserProfile.update(userProfile.id, {
        ggg_balance: userProfile.ggg_balance - tipAmount
      });

      // Add to creator (95% after 5% platform fee for tips)
      const creatorEarning = tipAmount * 0.95;
      const creatorProfiles = await base44.entities.UserProfile.filter({ user_id: toUserId });
      if (creatorProfiles[0]) {
        await base44.entities.UserProfile.update(creatorProfiles[0].id, {
          ggg_balance: (creatorProfiles[0].ggg_balance || 0) + creatorEarning,
          total_earnings: (creatorProfiles[0].total_earnings || 0) + creatorEarning
        });
      }

      // Create transaction
      await base44.entities.GGGTransaction.create({
        user_id: currentUser.email,
        source_type: 'tip',
        source_id: tip.id,
        delta: -tipAmount,
        reason_code: 'tip_sent',
        description: `Tip to ${toUserName}`,
        balance_after: userProfile.ggg_balance - tipAmount
      });

      // Create notification for creator
      await base44.entities.Notification.create({
        user_id: toUserId,
        type: 'ggg',
        title: 'New Tip Received! 💝',
        message: `${isAnonymous ? 'Someone' : userProfile.display_name} sent you ${tipAmount} GGG${message ? `: "${message}"` : ''}`,
        source_user_id: isAnonymous ? null : currentUser.email,
        source_user_name: isAnonymous ? 'Anonymous' : userProfile.display_name,
        source_user_avatar: isAnonymous ? null : userProfile.avatar_url
      });

      return tip;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['tips'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['miniProfile'] });
      toast.success(`Tip sent to ${toUserName}!`);
      setOpen(false);
      setMessage('');
      setAmount(0.05);
      setCustomAmount('');
    },
    onError: (err) => {
      toast.error(err.message);
    }
  });

  const finalAmount = customAmount ? parseFloat(customAmount) : amount;
  const canTip = walletBalance >= finalAmount && finalAmount > 0;

  if (currentUser?.email === toUserId) return null;

  return (
    <>
      <Button
        variant={variant === 'icon' ? 'ghost' : 'outline'}
        size={variant === 'icon' ? 'icon' : 'default'}
        onClick={() => setOpen(true)}
        className={cn(
          variant !== 'icon' && "gap-2",
          className
        )}
      >
        <Heart className={cn("w-4 h-4", variant === 'icon' ? "" : "text-rose-500")} />
        {variant !== 'icon' && 'Tip'}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md z-[9999]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" />
              Send a Tip to {toUserName}
            </DialogTitle>
            <DialogDescription>
              Show your appreciation with GGG
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Preset amounts */}
            <div>
              <Label className="mb-2 block">Quick amounts</Label>
              <div className="grid grid-cols-3 gap-2">
                {TIP_PRESETS.map((preset) => (
                  <Button
                    key={preset}
                    variant={amount === preset && !customAmount ? 'default' : 'outline'}
                    onClick={() => {
                      setAmount(preset);
                      setCustomAmount('');
                    }}
                    className={cn(
                      "h-12",
                      amount === preset && !customAmount && "bg-violet-600 hover:bg-violet-700"
                    )}
                  >
                    <Coins className="w-4 h-4 mr-1 text-amber-500" />
                    {preset}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom amount */}
            <div>
              <Label>Custom amount</Label>
              <div className="relative mt-1">
                <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                <Input
                  type="number"
                  min="1"
                  step="0.1"
                  placeholder="Enter custom amount"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Message */}
            <div>
              <Label>Message (optional)</Label>
              <div className="relative mt-1">
                <Textarea
                  placeholder="Add a note to your tip..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-20 pr-10"
                  maxLength={200}
                />
                <EmojiPicker
                  onSelect={(emoji) => setMessage(prev => prev + emoji)}
                  trigger={
                    <button
                      type="button"
                      className="absolute right-2 top-2 p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                    >
                      <Smile className="w-5 h-5" />
                    </button>
                  }
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">{message.length}/200</p>
            </div>

            {/* Anonymous option */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="anonymous"
                checked={isAnonymous}
                onCheckedChange={setIsAnonymous}
              />
              <label htmlFor="anonymous" className="text-sm text-slate-600">
                Send anonymously
              </label>
            </div>

            {/* Balance */}
            <div className="p-3 rounded-lg bg-slate-50 border">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Your balance</span>
                <span className="font-medium flex items-center gap-1">
                  <Coins className="w-4 h-4 text-amber-500" />
                  {walletBalance?.toFixed?.(2) || walletBalance || 0} GGG
                </span>
              </div>
              {!canTip && finalAmount > 0 && (
                <p className="text-xs text-rose-500 mt-1">Insufficient balance</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={() => tipMutation.mutate()}
                disabled={!canTip || tipMutation.isPending}
                className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Send {finalAmount || 0} GGG
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}