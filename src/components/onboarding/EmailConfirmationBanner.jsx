import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Mail, CheckCircle2, AlertCircle, RefreshCw, X } from "lucide-react";
import { base44 } from '@/api/base44Client';

export default function EmailConfirmationBanner({ user, onDismiss }) {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // If user email is already verified or banner dismissed, don't show
  if (dismissed || !user?.email) return null;

  const handleResend = async () => {
    setResending(true);
    try {
      // Send confirmation email
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: 'Confirm Your Saint Agents Account',
        body: `Hi ${user.full_name?.split(' ')?.[0] || 'there'},

Welcome to Saint Agents! Please confirm your email address to unlock all platform features.

Your account details:
- Email: ${user.email}
- Name: ${user.full_name || 'Not set'}

If you did not create this account, please ignore this email.

Thank you for joining the Saint Agents community!

Best regards,
The Saint Agents Team`
      });
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    } catch (err) {
      console.error('Failed to resend confirmation:', err);
    } finally {
      setResending(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div className={cn(
      "relative px-4 py-3 rounded-xl border mb-4 transition-all",
      resent 
        ? "bg-green-50 border-green-200" 
        : "bg-amber-50 border-amber-200"
    )}>
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 rounded-lg hover:bg-white/50 transition-colors"
      >
        <X className="w-4 h-4 text-slate-400" />
      </button>

      <div className="flex items-start gap-3">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
          resent ? "bg-green-100" : "bg-amber-100"
        )}>
          {resent ? (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          ) : (
            <Mail className="w-5 h-5 text-amber-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          {resent ? (
            <>
              <h4 className="font-semibold text-green-800">Confirmation Email Sent!</h4>
              <p className="text-sm text-green-700">
                Check your inbox at <strong>{user.email}</strong> for the confirmation link.
              </p>
            </>
          ) : (
            <>
              <h4 className="font-semibold text-amber-800">Confirm Your Email</h4>
              <p className="text-sm text-amber-700 mb-2">
                We sent a confirmation email to <strong>{user.email}</strong>. Please verify to unlock all features.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={handleResend}
                disabled={resending}
                className="h-7 text-xs border-amber-300 text-amber-700 hover:bg-amber-100"
              >
                {resending ? (
                  <>
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-3 h-3 mr-1" />
                    Resend Confirmation
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}