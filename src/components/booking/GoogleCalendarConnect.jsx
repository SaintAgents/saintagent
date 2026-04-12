import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Calendar, Loader2, CheckCircle, Unlink } from "lucide-react";
import { toast } from 'sonner';

const CONNECTOR_ID = '69dbcf881caf2b2b6b9102df';

export default function GoogleCalendarConnect({ onConnectionChange }) {
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const checkConnection = async () => {
    try {
      const res = await base44.functions.invoke('getUserCalendarBusy', {
        timeMin: new Date().toISOString(),
        timeMax: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });
      const isConnected = res.data?.connected === true;
      setConnected(isConnected);
      onConnectionChange?.(isConnected);
    } catch {
      setConnected(false);
      onConnectionChange?.(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const url = await base44.connectors.connectAppUser(CONNECTOR_ID);
      const popup = window.open(url, '_blank', 'width=600,height=700');
      const timer = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(timer);
          setConnecting(false);
          checkConnection();
        }
      }, 500);
    } catch (err) {
      toast.error('Failed to start Google Calendar connection');
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await base44.connectors.disconnectAppUser(CONNECTOR_ID);
      setConnected(false);
      onConnectionChange?.(false);
      toast.success('Google Calendar disconnected');
    } catch (err) {
      toast.error('Failed to disconnect');
    } finally {
      setDisconnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <p className="text-sm text-blue-700">Checking Google Calendar connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-900">Google Calendar Sync</p>
            <p className="text-xs text-blue-600">
              {connected
                ? 'Connected — your busy times will be blocked automatically'
                : 'Connect to automatically block busy times when others book with you'}
            </p>
          </div>
        </div>
        {connected ? (
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-xs text-green-700 font-medium">Connected</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2"
            >
              {disconnecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Unlink className="w-3 h-3" />}
              Disconnect
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleConnect}
            disabled={connecting}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 gap-2"
          >
            {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
            Connect
          </Button>
        )}
      </div>
    </div>
  );
}