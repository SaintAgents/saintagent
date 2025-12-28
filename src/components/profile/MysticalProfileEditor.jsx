import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ZODIAC_SIGNS = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'
];

const LIFE_PATH_OPTIONS = ['1','2','3','4','5','6','7','8','9','11','22','33'];

const RANKS = ['Ace','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Jack','Queen','King'];
const SUITS = ['Clubs','Diamonds','Hearts','Spades'];
const PLAYING_CARDS = RANKS.flatMap(r => SUITS.map(s => `${r} of ${s}`));

export default function MysticalProfileEditor({ profile, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    mystical_identifier: profile?.mystical_identifier || '',
    astrological_sign: profile?.astrological_sign || '',
    rising_sign: profile?.rising_sign || '',
    moon_sign: profile?.moon_sign || '',
    numerology_life_path: profile?.numerology_life_path != null ? String(profile?.numerology_life_path) : '',
    numerology_personality: profile?.numerology_personality != null ? String(profile?.numerology_personality) : '',
    birth_card: profile?.birth_card || '',
    sun_card: profile?.sun_card || ''
  });

  const handleSave = () => {
    const payload = {
      ...formData,
      numerology_life_path: formData.numerology_life_path ? Number(formData.numerology_life_path) : null,
      numerology_personality: formData.numerology_personality ? Number(formData.numerology_personality) : null,
    };
    onSave(payload);
  };

  return (
    <Card className="border-violet-200">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Edit Mystical Profile</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button className="bg-violet-600 hover:bg-violet-700" onClick={handleSave}>Save</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Mystical ID</Label>
            <Input
              className="mt-2"
              placeholder="e.g., Golden Phoenix Rising"
              value={formData.mystical_identifier}
              onChange={(e) => setFormData({ ...formData, mystical_identifier: e.target.value })}
            />
          </div>

          <div>
            <Label>Sun</Label>
            <Select
              value={formData.astrological_sign}
              onValueChange={(v) => setFormData({ ...formData, astrological_sign: v })}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select sign" />
              </SelectTrigger>
              <SelectContent>
                {ZODIAC_SIGNS.map((z) => (
                  <SelectItem key={z} value={z}>{z}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Rising</Label>
            <Select
              value={formData.rising_sign}
              onValueChange={(v) => setFormData({ ...formData, rising_sign: v })}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select sign" />
              </SelectTrigger>
              <SelectContent>
                {ZODIAC_SIGNS.map((z) => (
                  <SelectItem key={z} value={z}>{z}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Moon</Label>
            <Select
              value={formData.moon_sign}
              onValueChange={(v) => setFormData({ ...formData, moon_sign: v })}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select sign" />
              </SelectTrigger>
              <SelectContent>
                {ZODIAC_SIGNS.map((z) => (
                  <SelectItem key={z} value={z}>{z}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Life Path</Label>
            <Select
              value={formData.numerology_life_path}
              onValueChange={(v) => setFormData({ ...formData, numerology_life_path: v })}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select number" />
              </SelectTrigger>
              <SelectContent>
                {LIFE_PATH_OPTIONS.map((n) => (
                  <SelectItem key={n} value={n}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Personality</Label>
            <Select
              value={formData.numerology_personality}
              onValueChange={(v) => setFormData({ ...formData, numerology_personality: v })}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select number" />
              </SelectTrigger>
              <SelectContent>
                {LIFE_PATH_OPTIONS.map((n) => (
                  <SelectItem key={n} value={n}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Birth Card</Label>
            <Select
              value={formData.birth_card}
              onValueChange={(v) => setFormData({ ...formData, birth_card: v })}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select card" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {PLAYING_CARDS.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Sun Card</Label>
            <Select
              value={formData.sun_card}
              onValueChange={(v) => setFormData({ ...formData, sun_card: v })}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select card" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {PLAYING_CARDS.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}