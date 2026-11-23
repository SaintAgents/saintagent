import React, { useEffect } from 'react';
import { Toast, ToastClose, ToastDescription, ToastTitle } from '@/components/ui/toast';

export default function ActionToast({ item, dismiss }) {
  const { id, title, description, action, duration, variant } = item;
  useEffect(() => {
    const timer = window.setTimeout(() => dismiss(id), Number.isFinite(duration) ? Math.max(0, duration) : 3000);
    return () => window.clearTimeout(timer);
  }, [duration, id, dismiss]);
  return <Toast variant={variant} role={variant === 'destructive' ? 'alert' : 'status'}>
    <div className="grid gap-1">
      {title && <ToastTitle>{title}</ToastTitle>}
      {description && <ToastDescription>{description}</ToastDescription>}
    </div>
    {action}
    <ToastClose type="button" className="opacity-100" aria-label="Dismiss toast" onClick={() => dismiss(id)} />
  </Toast>;
}