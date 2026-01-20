import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { X, AlertTriangle, Info, PartyPopper, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

const ALERT_STYLES = {
  info: {
    bg: 'bg-blue-600',
    border: 'border-blue-400',
    icon: Info,
    glow: 'shadow-[0_0_60px_rgba(59,130,246,0.5)]'
  },
  warning: {
    bg: 'bg-amber-600',
    border: 'border-amber-400',
    icon: AlertTriangle,
    glow: 'shadow-[0_0_60px_rgba(245,158,11,0.5)]'
  },
  critical: {
    bg: 'bg-red-600',
    border: 'border-red-400',
    icon: AlertTriangle,
    glow: 'shadow-[0_0_60px_rgba(239,68,68,0.5)]'
  },
  celebration: {
    bg: 'bg-gradient-to-r from-violet-600 via-pink-500 to-amber-500',
    border: 'border-pink-400',
    icon: PartyPopper,
    glow: 'shadow-[0_0_60px_rgba(236,72,153,0.5)]'
  }
};

export default function GlobalAlertPopup() {
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ['platformSettings'],
    queryFn: () => base44.entities.PlatformSetting.list('-updated_date', 1),
    staleTime: 30000,
    refetchInterval: 60000
  });

  const setting = settings?.[0];
  const alertEnabled = setting?.global_alert_enabled;
  const alertTitle = setting?.global_alert_title || 'Important Notice';
  const alertMessage = setting?.global_alert_message || '';
  const alertType = setting?.global_alert_type || 'info';
  const alertFlash = setting?.global_alert_flash;
  const alertRepeat = setting?.global_alert_repeat;
  const alertDismissable = setting?.global_alert_dismissable !== false;

  useEffect(() => {
    if (!alertEnabled || !alertMessage) {
      setVisible(false);
      return;
    }

    const dismissKey = `globalAlertDismissed_${setting?.id}_${setting?.updated_date}`;
    const wasDismissed = localStorage.getItem(dismissKey) === 'true';

    if (wasDismissed && !alertRepeat) {
      setVisible(false);
    } else {
      setVisible(true);
      setDismissed(false);
    }
  }, [alertEnabled, alertMessage, alertRepeat, setting?.id, setting?.updated_date]);

  const handleDismiss = () => {
    if (alertDismissable) {
      setDismissed(true);
      setVisible(false);
      const dismissKey = `globalAlertDismissed_${setting?.id}_${setting?.updated_date}`;
      localStorage.setItem(dismissKey, 'true');
    }
  };

  if (!visible || dismissed) return null;

  const style = ALERT_STYLES[alertType] || ALERT_STYLES.info;
  const Icon = style.icon;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div 
        className={cn(
          "relative w-full max-w-2xl max-h-[75vh] overflow-hidden rounded-2xl border-2",
          style.bg,
          style.border,
          style.glow,
          alertFlash && "animate-pulse"
        )}
      >
        {/* Flash overlay for critical */}
        {alertFlash && alertType === 'critical' && (
          <div className="absolute inset-0 bg-red-500/20 animate-ping pointer-events-none" />
        )}

        {/* Close button */}
        {alertDismissable && (
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Content */}
        <div className="p-8 md:p-12 text-center text-white">
          {/* Icon */}
          <div className={cn(
            "mx-auto mb-6 w-20 h-20 rounded-full flex items-center justify-center",
            "bg-white/20 backdrop-blur-sm",
            alertFlash && "animate-bounce"
          )}>
            <Icon className="w-10 h-10" />
          </div>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-bold mb-4 drop-shadow-lg">
            {alertTitle}
          </h2>

          {/* Message */}
          <div className="text-lg md:text-xl leading-relaxed opacity-95 whitespace-pre-wrap max-h-[40vh] overflow-y-auto px-4">
            {alertMessage}
          </div>

          {/* Dismiss button */}
          {alertDismissable && (
            <Button
              onClick={handleDismiss}
              className="mt-8 bg-white/20 hover:bg-white/30 text-white border border-white/30 px-8 py-3 text-lg"
            >
              Got it
            </Button>
          )}

          {/* Non-dismissable notice */}
          {!alertDismissable && (
            <p className="mt-8 text-sm opacity-70">
              This notice cannot be dismissed. Please contact support if you have questions.
            </p>
          )}
        </div>

        {/* Decorative elements for celebration */}
        {alertType === 'celebration' && (
          <>
            <div className="absolute top-0 left-0 w-32 h-32 bg-yellow-400/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-pink-400/20 rounded-full blur-3xl" />
          </>
        )}
      </div>
    </div>
  );
}