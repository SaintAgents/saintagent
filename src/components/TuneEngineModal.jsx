import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sparkles, Save } from "lucide-react";

export default function TuneEngineModal({ open, onClose }) {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: prefs = [] } = useQuery({
    queryKey: ['enginePrefs'],
    queryFn: () => base44.entities.EnginePreference.filter({ user_id: user?.email }),
    enabled: !!user
  });
  const currentPref = prefs[0];

  const [settings, setSettings] = useState({
    priority: currentPref?.priority || 'balanced',
    meeting_vs_offer_slider: currentPref?.meeting_vs_offer_slider || 50,
    prefer_local: currentPref?.prefer_local !== false,
    quiet_mode: currentPref?.quiet_mode || false,
    show_leaders_only: currentPref?.show_leaders_only || false
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (currentPref) {
        return base44.entities.EnginePreference.update(currentPref.id, data);
      } else {
        return base44.entities.EnginePreference.create({
          user_id: user.email,
          ...data
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enginePrefs'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      onClose();
    }
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-500" />
            Tune Synchronicity Engine
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div>
            <Label>Priority Mode</Label>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {['earn', 'learn', 'build', 'teach', 'balanced'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setSettings({ ...settings, priority: mode })}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium capitalize transition-all",
                    settings.priority === mode
                      ? "bg-violet-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Match Type Balance</Label>
            <div className="mt-2">
              <div className="flex justify-between text-xs text-slate-500 mb-2">
                <span>More Meetings</span>
                <span>Balanced</span>
                <span>More Offers</span>
              </div>
              <Slider
                value={[settings.meeting_vs_offer_slider]}
                onValueChange={([v]) => setSettings({ ...settings, meeting_vs_offer_slider: v })}
                min={0}
                max={100}
                step={10}
              />
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Prioritize Local Matches</p>
                <p className="text-sm text-slate-500">Prefer matches in your bioregion</p>
              </div>
              <Switch
                checked={settings.prefer_local}
                onCheckedChange={(v) => setSettings({ ...settings, prefer_local: v })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Quiet Mode</p>
                <p className="text-sm text-slate-500">Limit match frequency</p>
              </div>
              <Switch
                checked={settings.quiet_mode}
                onCheckedChange={(v) => setSettings({ ...settings, quiet_mode: v })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Show Leaders Only</p>
                <p className="text-sm text-slate-500">Filter for verified leaders</p>
              </div>
              <Switch
                checked={settings.show_leaders_only}
                onCheckedChange={(v) => setSettings({ ...settings, show_leaders_only: v })}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={() => saveMutation.mutate(settings)}
              className="flex-1 rounded-xl bg-violet-600 hover:bg-violet-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Preferences
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}