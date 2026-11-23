import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useActivity } from '@/components/live/useActivity';
import LiveActivityPreferences from '@/components/live/LiveActivityPreferences';
import { toast } from '@/components/ui/use-toast';
import { prefDefaults } from '@/components/live/activity';
import { isTourPreview } from '@/components/tour/tourPreviewTargets';

export default function LiveActivitySettings() {
  const activity = useActivity();
  const preview = isTourPreview();
  if (!activity && !preview) return null;
  const prefs = preview ? prefDefaults : activity.prefs;
  const preferences = preview ? { mutate: () => {} } : activity.preferences;
  return <Card data-readable-surface>
    <CardHeader><CardTitle>Live Toasts &amp; Ticker</CardTitle><CardDescription>Choose which alerts pop up and how the activity ticker appears.</CardDescription></CardHeader>
    <CardContent><LiveActivityPreferences key={prefs.revision} prefs={prefs} preferences={preferences} preview={preview} onSaved={() => toast({ title: 'Activity preferences saved' })} /></CardContent>
  </Card>;
}