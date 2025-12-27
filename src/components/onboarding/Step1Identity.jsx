import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { base44 } from '@/api/base44Client';

export default function Step1Identity({ data, onComplete, user }) {
  const [formData, setFormData] = useState({
    display_name: data.display_name || user?.full_name || '',
    handle: data.handle || '',
    pronouns: data.pronouns || '',
    timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    public_profile: data.public_profile !== false
  });

  const [handleAvailable, setHandleAvailable] = useState(null);
  const [checkingHandle, setCheckingHandle] = useState(false);

  const checkHandle = async (handle) => {
    if (!handle || handle.length < 3) return;
    setCheckingHandle(true);
    try {
      const existing = await base44.entities.UserProfile.filter({ handle });
      setHandleAvailable(existing.length === 0);
    } catch (error) {
      setHandleAvailable(false);
    }
    setCheckingHandle(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!handleAvailable) return;
    
    // Update user profile
    const profiles = await base44.entities.UserProfile.filter({ user_id: user.email });
    if (profiles.length > 0) {
      await base44.entities.UserProfile.update(profiles[0].id, formData);
    } else {
      await base44.entities.UserProfile.create({
        user_id: user.email,
        ...formData
      });
    }
    
    onComplete(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Tell us about yourself</h2>
        <p className="text-slate-600">This helps others find and connect with you</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="display_name">Display Name *</Label>
          <Input
            id="display_name"
            value={formData.display_name}
            onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
            placeholder="How should people call you?"
            required
          />
        </div>

        <div>
          <Label htmlFor="handle">Handle * (unique username)</Label>
          <div className="flex gap-2">
            <span className="flex items-center text-slate-500">@</span>
            <Input
              id="handle"
              value={formData.handle}
              onChange={(e) => {
                const handle = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                setFormData({ ...formData, handle });
                setHandleAvailable(null);
              }}
              onBlur={(e) => checkHandle(e.target.value)}
              placeholder="yourhandle"
              required
              className={handleAvailable === false ? 'border-rose-500' : handleAvailable ? 'border-emerald-500' : ''}
            />
          </div>
          {checkingHandle && <p className="text-xs text-slate-500 mt-1">Checking availability...</p>}
          {handleAvailable === false && <p className="text-xs text-rose-500 mt-1">Handle already taken</p>}
          {handleAvailable && <p className="text-xs text-emerald-500 mt-1">Handle available!</p>}
        </div>

        <div>
          <Label htmlFor="pronouns">Pronouns (optional)</Label>
          <Input
            id="pronouns"
            value={formData.pronouns}
            onChange={(e) => setFormData({ ...formData, pronouns: e.target.value })}
            placeholder="e.g. they/them, she/her, he/him"
          />
        </div>

        <div>
          <Label htmlFor="timezone">Time Zone</Label>
          <Input
            id="timezone"
            value={formData.timezone}
            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
            required
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
          <div>
            <p className="font-medium text-slate-900">Public Profile</p>
            <p className="text-sm text-slate-500">Allow others to discover you</p>
          </div>
          <Switch
            checked={formData.public_profile}
            onCheckedChange={(checked) => setFormData({ ...formData, public_profile: checked })}
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={!formData.display_name || !formData.handle || handleAvailable === false}
        className="w-full bg-violet-600 hover:bg-violet-700"
      >
        Continue
      </Button>
    </form>
  );
}