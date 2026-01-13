import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Globe, Twitter, Instagram, Linkedin, Youtube, Send, MessageCircle, Save, X, Link2, Plus, Facebook } from 'lucide-react';

const SOCIAL_PLATFORMS = [
  { key: 'website', label: 'Website', icon: Globe, placeholder: 'https://yoursite.com' },
  { key: 'twitter', label: 'X / Twitter', icon: Twitter, placeholder: '@username or full URL' },
  { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: '@username or full URL' },
  { key: 'facebook', label: 'Facebook', icon: Facebook, placeholder: 'Profile or Page URL' },
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'Profile URL' },
  { key: 'youtube', label: 'YouTube', icon: Youtube, placeholder: 'Channel URL' },
  { key: 'tiktok', label: 'TikTok', icon: () => <span className="font-bold text-xs">TT</span>, placeholder: '@username' },
  { key: 'telegram', label: 'Telegram', icon: Send, placeholder: '@username or t.me link' },
  { key: 'discord', label: 'Discord', icon: MessageCircle, placeholder: 'Username or server invite' },
  { key: 'substack', label: 'Substack', icon: () => <span className="font-bold text-xs">S</span>, placeholder: 'yourname.substack.com' },
];

export default function SocialLinksEditor({ profile, onSave, onCancel }) {
  const [links, setLinks] = useState({});
  const [customLink1, setCustomLink1] = useState({ url: '', label: '' });
  const [customLink2, setCustomLink2] = useState({ url: '', label: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.social_links) {
      setLinks(profile.social_links);
      setCustomLink1({
        url: profile.social_links.custom_link_1 || '',
        label: profile.social_links.custom_link_1_label || ''
      });
      setCustomLink2({
        url: profile.social_links.custom_link_2 || '',
        label: profile.social_links.custom_link_2_label || ''
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      social_links: {
        ...links,
        custom_link_1: customLink1.url,
        custom_link_1_label: customLink1.label,
        custom_link_2: customLink2.url,
        custom_link_2_label: customLink2.label
      }
    });
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-violet-500" />
          Social Links & Website
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SOCIAL_PLATFORMS.map(({ key, label, icon: Icon, placeholder }) => (
            <div key={key}>
              <Label className="flex items-center gap-2 text-sm mb-1.5">
                <Icon className="w-4 h-4 text-slate-500" />
                {label}
              </Label>
              <Input
                value={links[key] || ''}
                onChange={(e) => setLinks({ ...links, [key]: e.target.value })}
                placeholder={placeholder}
                className="h-9"
              />
            </div>
          ))}
        </div>

        {/* Custom Links */}
        <div className="border-t pt-4 mt-4">
          <Label className="flex items-center gap-2 text-sm font-medium mb-3">
            <Plus className="w-4 h-4 text-slate-500" />
            Custom Links
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Input
                value={customLink1.label}
                onChange={(e) => setCustomLink1({ ...customLink1, label: e.target.value })}
                placeholder="Link Label (e.g., Portfolio)"
                className="h-9"
              />
              <Input
                value={customLink1.url}
                onChange={(e) => setCustomLink1({ ...customLink1, url: e.target.value })}
                placeholder="https://..."
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Input
                value={customLink2.label}
                onChange={(e) => setCustomLink2({ ...customLink2, label: e.target.value })}
                placeholder="Link Label (e.g., Book a Call)"
                className="h-9"
              />
              <Input
                value={customLink2.url}
                onChange={(e) => setCustomLink2({ ...customLink2, url: e.target.value })}
                placeholder="https://..."
                className="h-9"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}