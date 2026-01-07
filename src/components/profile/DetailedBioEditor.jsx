import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FileText, Save, X } from 'lucide-react';

export default function DetailedBioEditor({ profile, onSave, onCancel }) {
  const [data, setData] = useState({
    tagline: '',
    bio: '',
    detailed_bio: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setData({
        tagline: profile.tagline || '',
        bio: profile.bio || '',
        detailed_bio: profile.detailed_bio || ''
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    await onSave(data);
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-violet-500" />
          Bio & Tagline
        </CardTitle>
        <div className="flex gap-2">
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="w-4 h-4 mr-1" /> Cancel
            </Button>
          )}
          <Button size="sm" onClick={handleSave} disabled={saving} className="bg-violet-600 hover:bg-violet-700">
            <Save className="w-4 h-4 mr-1" /> {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm">Tagline / Headline</Label>
          <Input
            value={data.tagline}
            onChange={(e) => setData({ ...data, tagline: e.target.value })}
            placeholder="e.g., Spiritual Guide & Wellness Coach"
            maxLength={100}
            className="mt-1.5"
          />
          <p className="text-xs text-slate-400 mt-1">{data.tagline.length}/100 characters</p>
        </div>

        <div>
          <Label className="text-sm">Short Bio</Label>
          <Textarea
            value={data.bio}
            onChange={(e) => setData({ ...data, bio: e.target.value })}
            placeholder="A brief introduction (shown in previews and cards)"
            maxLength={500}
            className="mt-1.5 min-h-[80px]"
          />
          <p className="text-xs text-slate-400 mt-1">{data.bio.length}/500 characters</p>
        </div>

        <div>
          <Label className="text-sm">Detailed About Me</Label>
          <Textarea
            value={data.detailed_bio}
            onChange={(e) => setData({ ...data, detailed_bio: e.target.value })}
            placeholder="Tell your full story, share your journey, experiences, and what you're passionate about..."
            maxLength={2000}
            className="mt-1.5 min-h-[160px]"
          />
          <p className="text-xs text-slate-400 mt-1">{data.detailed_bio.length}/2000 characters</p>
        </div>
      </CardContent>
    </Card>
  );
}