import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Radar, Heart, Users, Bell, Activity } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

const FREQ_MARKS = [
  { value: 6, label: '6h' },
  { value: 12, label: '12h' },
  { value: 24, label: '1d' },
  { value: 48, label: '2d' },
  { value: 72, label: '3d' },
  { value: 168, label: '7d' },
];

export default function AutoScanSettings({ prefs, onChange }) {
  const scanPrefs = {
    enabled: false,
    scan_relationships: true,
    scan_connections: true,
    frequency_hours: 24,
    notify_mode: 'pulse',
    ...prefs,
  };

  const update = (key, value) => {
    onChange({ ...scanPrefs, [key]: value });
  };

  const freqLabel = (h) => {
    if (h < 24) return `${h} hours`;
    if (h === 24) return '1 day';
    if (h < 168) return `${Math.round(h / 24)} days`;
    return '1 week';
  };

  return (
    <Card className="bg-violet-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Radar className="w-5 h-5 text-violet-600" />
          Auto Match Scanner
        </CardTitle>
        <CardDescription>
          Automatically scan for new matches on a schedule and get notified
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Master toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Enable Auto Scan</p>
            <p className="text-sm text-slate-500">Periodically find new matches for you</p>
          </div>
          <Switch
            checked={scanPrefs.enabled}
            onCheckedChange={(v) => update('enabled', v)}
            className="data-[state=checked]:bg-violet-600 data-[state=unchecked]:bg-slate-300"
          />
        </div>

        {scanPrefs.enabled && (
          <>
            {/* Scan types */}
            <div className="space-y-3 p-4 rounded-xl bg-white border border-slate-200">
              <p className="text-sm font-semibold text-slate-700 mb-2">What to scan for:</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-500" />
                  <div>
                    <p className="font-medium text-sm">Relationships</p>
                    <p className="text-xs text-slate-500">Dating & deeper connections</p>
                  </div>
                </div>
                <Switch
                  checked={scanPrefs.scan_relationships}
                  onCheckedChange={(v) => update('scan_relationships', v)}
                  className="data-[state=checked]:bg-pink-500 data-[state=unchecked]:bg-slate-300"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="font-medium text-sm">General Connections</p>
                    <p className="text-xs text-slate-500">Collaborators, mentors & community</p>
                  </div>
                </div>
                <Switch
                  checked={scanPrefs.scan_connections}
                  onCheckedChange={(v) => update('scan_connections', v)}
                  className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-slate-300"
                />
              </div>
            </div>

            {/* Frequency slider */}
            <div className="space-y-3 p-4 rounded-xl bg-white border border-slate-200">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">Scan Frequency</p>
                <Badge variant="outline" className="text-violet-700 bg-violet-50">
                  Every {freqLabel(scanPrefs.frequency_hours)}
                </Badge>
              </div>
              <Slider
                value={[scanPrefs.frequency_hours]}
                onValueChange={([v]) => update('frequency_hours', v)}
                min={6}
                max={168}
                step={6}
                className="mt-2"
              />
              <div className="flex justify-between text-[10px] text-slate-400 px-1">
                {FREQ_MARKS.map(m => (
                  <span key={m.value}>{m.label}</span>
                ))}
              </div>
            </div>

            {/* Notification mode */}
            <div className="space-y-3 p-4 rounded-xl bg-white border border-slate-200">
              <p className="text-sm font-semibold text-slate-700 mb-2">How to notify you:</p>
              <Select
                value={scanPrefs.notify_mode}
                onValueChange={(v) => update('notify_mode', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="notification">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-500" />
                      <div>
                        <span className="font-medium">Full Notification</span>
                        <span className="text-xs text-slate-500 ml-2">Bell alert + count badge</span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="pulse">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-violet-500" />
                      <div>
                        <span className="font-medium">Subtle Pulse</span>
                        <span className="text-xs text-slate-500 ml-2">Glowing icon only</span>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                {scanPrefs.notify_mode === 'notification'
                  ? 'New matches appear in your notification bell and as a popup toast.'
                  : 'The matches icon in the top bar and on the Command Deck card will glow when new matches are found.'}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}