import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useActivity } from '@/components/live/useActivity';
import LiveActivityPreferences from '@/components/live/LiveActivityPreferences';
import { toast } from '@/components/ui/use-toast';

export default function LiveActivitySettings() {
  const activity = useActivity();
  if (!activity) return null;
  return <Card data-readable-surface>
    <CardHeader><CardTitle>Live Toasts &amp; Ticker</CardTitle><CardDescription>Choose which alerts pop up and how the activity ticker appears.</CardDescription></CardHeader>
    <CardContent><LiveActivityPreferences key={activity.prefs.revision} prefs={activity.prefs} preferences={activity.preferences} onSaved={() => toast({ title: 'Activity preferences saved' })} /></CardContent>
  </Card>;
}