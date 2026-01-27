import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { QrCode, Smartphone, CheckCircle2, XCircle, RefreshCw, Loader2, Shield } from 'lucide-react';
import { cn } from "@/lib/utils";

// Simple QR Code generator using canvas
function generateQRCode(text, size = 200) {
  // This creates a simple QR-like pattern. For production, use a proper QR library.
  // We'll use a data URL approach with an external API
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&format=svg`;
}

export default function QRCodeLogin({ open, onOpenChange, onLoginSuccess }) {
  const [sessionToken, setSessionToken] = useState(null);
  const [status, setStatus] = useState('generating'); // generating, pending, scanned, approved, expired, error
  const [expiresAt, setExpiresAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300);
  const [error, setError] = useState(null);
  const pollInterval = useRef(null);
  const countdownInterval = useRef(null);

  // Generate new session when modal opens
  useEffect(() => {
    if (open) {
      createSession();
    } else {
      cleanup();
    }
    return cleanup;
  }, [open]);

  // Countdown timer
  useEffect(() => {
    if (expiresAt && status === 'pending') {
      countdownInterval.current = setInterval(() => {
        const remaining = Math.max(0, Math.floor((new Date(expiresAt) - new Date()) / 1000));
        setTimeLeft(remaining);
        if (remaining <= 0) {
          setStatus('expired');
          cleanup();
        }
      }, 1000);
    }
    return () => {
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    };
  }, [expiresAt, status]);

  const cleanup = () => {
    if (pollInterval.current) clearInterval(pollInterval.current);
    if (countdownInterval.current) clearInterval(countdownInterval.current);
  };

  const createSession = async () => {
    try {
      setStatus('generating');
      setError(null);
      
      const deviceInfo = `${navigator.userAgent.slice(0, 100)}`;
      const response = await base44.functions.invoke('qrLogin', {
        action: 'create',
        device_info: deviceInfo
      });

      if (response.data?.success) {
        setSessionToken(response.data.session_token);
        setExpiresAt(response.data.expires_at);
        setTimeLeft(300);
        setStatus('pending');
        startPolling(response.data.session_token);
      } else {
        throw new Error(response.data?.error || 'Failed to create session');
      }
    } catch (err) {
      setStatus('error');
      setError(err.message);
    }
  };

  const startPolling = (token) => {
    pollInterval.current = setInterval(async () => {
      try {
        const response = await base44.functions.invoke('qrLogin', {
          action: 'check',
          session_token: token
        });

        const newStatus = response.data?.status;
        if (newStatus) {
          setStatus(newStatus);
          
          if (newStatus === 'approved') {
            cleanup();
            // In a real implementation, you'd receive an auth token here
            // For now, we'll just notify parent
            onLoginSuccess?.(response.data.user_id);
            setTimeout(() => onOpenChange(false), 2000);
          } else if (newStatus === 'expired' || newStatus === 'rejected') {
            cleanup();
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const qrUrl = sessionToken ? 
    `${window.location.origin}/qr-login?token=${sessionToken}` : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-violet-600" />
            QR Code Login
          </DialogTitle>
          <DialogDescription>
            Scan with your phone to log in on this device
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center py-6">
          {status === 'generating' && (
            <div className="w-[200px] h-[200px] flex items-center justify-center bg-slate-100 rounded-xl">
              <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
            </div>
          )}

          {status === 'pending' && sessionToken && (
            <>
              <div className="relative p-4 bg-white rounded-2xl shadow-lg border-2 border-violet-100">
                <img 
                  src={generateQRCode(qrUrl, 180)} 
                  alt="QR Code"
                  className="w-[180px] h-[180px]"
                />
                <div className="absolute -bottom-2 -right-2 bg-violet-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Secure
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-slate-600 mb-1">
                  Expires in <span className="font-mono font-semibold text-violet-600">{formatTime(timeLeft)}</span>
                </p>
                <p className="text-xs text-slate-400">
                  Scan with your phone's camera
                </p>
              </div>

              <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
                <Smartphone className="w-4 h-4" />
                Waiting for scan...
              </div>
            </>
          )}

          {status === 'scanned' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">QR Code Scanned!</h3>
              <p className="text-sm text-slate-500">
                Confirm the login on your phone
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
                <span className="text-sm text-amber-600">Waiting for confirmation...</span>
              </div>
            </div>
          )}

          {status === 'approved' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-emerald-700 mb-2">Login Approved!</h3>
              <p className="text-sm text-slate-500">
                You're now logged in
              </p>
            </div>
          )}

          {status === 'rejected' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="font-semibold text-red-700 mb-2">Login Rejected</h3>
              <p className="text-sm text-slate-500 mb-4">
                The login was denied from your phone
              </p>
              <Button onClick={createSession} variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
            </div>
          )}

          {status === 'expired' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="font-semibold text-slate-700 mb-2">QR Code Expired</h3>
              <p className="text-sm text-slate-500 mb-4">
                Generate a new code to try again
              </p>
              <Button onClick={createSession} className="gap-2 bg-violet-600 hover:bg-violet-700">
                <RefreshCw className="w-4 h-4" />
                Generate New Code
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="font-semibold text-red-700 mb-2">Error</h3>
              <p className="text-sm text-slate-500 mb-4">{error}</p>
              <Button onClick={createSession} variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
            </div>
          )}
        </div>

        {/* Instructions */}
        {(status === 'pending' || status === 'generating') && (
          <div className="border-t pt-4 space-y-2">
            <p className="text-xs font-medium text-slate-700">How to use:</p>
            <ol className="text-xs text-slate-500 space-y-1 list-decimal list-inside">
              <li>Open Saint Agents on your phone (must be logged in)</li>
              <li>Scan this QR code with your phone's camera</li>
              <li>Tap "Approve" to log in on this device</li>
            </ol>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Mobile-side approval component
export function QRLoginApproval({ token, onClose }) {
  const [status, setStatus] = useState('loading');
  const [deviceInfo, setDeviceInfo] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    checkSession();
  }, [token]);

  const checkSession = async () => {
    try {
      const response = await base44.functions.invoke('qrLogin', {
        action: 'scan',
        session_token: token
      });

      if (response.data?.success) {
        setDeviceInfo(response.data.device_info);
        setStatus('confirm');
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  const handleApprove = async () => {
    setProcessing(true);
    try {
      await base44.functions.invoke('qrLogin', {
        action: 'approve',
        session_token: token
      });
      setStatus('approved');
      setTimeout(onClose, 2000);
    } catch (err) {
      setStatus('error');
    }
    setProcessing(false);
  };

  const handleReject = async () => {
    setProcessing(true);
    try {
      await base44.functions.invoke('qrLogin', {
        action: 'reject',
        session_token: token
      });
      onClose();
    } catch (err) {
      onClose();
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center py-8">
        <Loader2 className="w-8 h-8 text-violet-600 animate-spin mb-4" />
        <p className="text-sm text-slate-600">Verifying QR code...</p>
      </div>
    );
  }

  if (status === 'approved') {
    return (
      <div className="flex flex-col items-center py-8">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="font-semibold text-emerald-700">Login Approved!</h3>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center py-8">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <XCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="font-semibold text-red-700 mb-2">Invalid or Expired</h3>
        <p className="text-sm text-slate-500">This QR code is no longer valid</p>
        <Button onClick={onClose} className="mt-4">Close</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-6">
      <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center mb-4">
        <Shield className="w-8 h-8 text-violet-600" />
      </div>
      <h3 className="font-semibold text-slate-900 mb-2">Confirm Login</h3>
      <p className="text-sm text-slate-500 text-center mb-4">
        A device is requesting to log in to your account
      </p>
      
      {deviceInfo && (
        <div className="bg-slate-100 rounded-lg px-4 py-2 mb-6 max-w-full overflow-hidden">
          <p className="text-xs text-slate-500 truncate">{deviceInfo}</p>
        </div>
      )}

      <div className="flex gap-3 w-full">
        <Button 
          variant="outline" 
          onClick={handleReject}
          disabled={processing}
          className="flex-1"
        >
          Deny
        </Button>
        <Button 
          onClick={handleApprove}
          disabled={processing}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700"
        >
          {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Approve'}
        </Button>
      </div>
    </div>
  );
}