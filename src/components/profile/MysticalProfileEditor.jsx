import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { base44 } from '@/api/base44Client';
import { RefreshCw, Loader2 } from 'lucide-react';

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
    birthday: profile?.birthday || '',
    astrological_sign: profile?.astrological_sign || '',
    rising_sign: profile?.rising_sign || '',
    moon_sign: profile?.moon_sign || '',
    numerology_life_path: profile?.numerology_life_path != null ? String(profile?.numerology_life_path) : '',
    numerology_destiny: profile?.numerology_destiny != null ? String(profile?.numerology_destiny) : '',
    numerology_soul_urge: profile?.numerology_soul_urge != null ? String(profile?.numerology_soul_urge) : '',
    numerology_personality: profile?.numerology_personality != null ? String(profile?.numerology_personality) : '',
    birth_card: profile?.birth_card || '',
    planetary_ruling_card: profile?.planetary_ruling_card || '',
    sun_card: profile?.sun_card || ''
  });
  const [isRecalculating, setIsRecalculating] = useState(false);

  const handleSave = () => {
    const payload = {
      ...formData,
      numerology_life_path: formData.numerology_life_path ? Number(formData.numerology_life_path) : null,
      numerology_destiny: formData.numerology_destiny ? Number(formData.numerology_destiny) : null,
      numerology_soul_urge: formData.numerology_soul_urge ? Number(formData.numerology_soul_urge) : null,
      numerology_personality: formData.numerology_personality ? Number(formData.numerology_personality) : null,
    };
    onSave(payload);
  };

  const handleRecalculate = async () => {
    if (!formData.birthday && !profile?.display_name) return;
    setIsRecalculating(true);
    
    const prompt = `Calculate mystical profile data based on the following information:
${formData.birthday ? `Birthday: ${formData.birthday}` : ''}
${profile?.display_name ? `Full Name: ${profile.display_name}` : ''}

Please calculate:
1. Sun sign (zodiac) from the birthday
2. Life Path number - reduce the full birth date (MM+DD+YYYY) to single digit or master number (11, 22, 33)
3. Destiny/Expression number - using Pythagorean numerology (A=1...I=9, J=1...R=9, S=1...Z=8), sum all letters of full name, reduce to single digit or master number
4. Soul Urge/Heart's Desire number - sum only VOWELS (A, E, I, O, U) in the name using same system
5. Personality number - sum only CONSONANTS in the name using same system
6. Birth card - the playing card associated with their birthday in the Destiny Cards system
7. Planetary ruling card - the secondary/planetary card in the Destiny Cards system

Return exact values. For cards use format like "King of Spades", "Seven of Hearts", etc.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          sun_sign: { type: "string" },
          life_path: { type: "number" },
          destiny_number: { type: "number" },
          soul_urge_number: { type: "number" },
          personality_number: { type: "number" },
          birth_card: { type: "string" },
          planetary_ruling_card: { type: "string" }
        }
      }
    });

    if (result) {
      setFormData(prev => ({
        ...prev,
        astrological_sign: result.sun_sign || prev.astrological_sign,
        numerology_life_path: result.life_path ? String(result.life_path) : prev.numerology_life_path,
        numerology_destiny: result.destiny_number ? String(result.destiny_number) : prev.numerology_destiny,
        numerology_soul_urge: result.soul_urge_number ? String(result.soul_urge_number) : prev.numerology_soul_urge,
        numerology_personality: result.personality_number ? String(result.personality_number) : prev.numerology_personality,
        birth_card: result.birth_card || prev.birth_card,
        planetary_ruling_card: result.planetary_ruling_card || prev.planetary_ruling_card
      }));
    }
    setIsRecalculating(false);
  };

  return (
    <Card className="border-violet-200">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Edit Mystical Profile</CardTitle>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRecalculate}
            disabled={isRecalculating || (!formData.birthday && !profile?.display_name)}
            className="gap-2"
          >
            {isRecalculating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Recalculate
          </Button>
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
            <Label>Birthday</Label>
            <Input
              type="date"
              className="mt-2"
              value={formData.birthday}
              onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
            />
            <p className="text-xs text-slate-500 mt-1">Used for mystical calculations</p>
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
            <Label>Destiny (Expression)</Label>
            <Select
              value={formData.numerology_destiny || ''}
              onValueChange={(v) => setFormData({ ...formData, numerology_destiny: v })}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select number" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>None</SelectItem>
                {LIFE_PATH_OPTIONS.map((n) => (
                  <SelectItem key={n} value={n}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Soul Urge (Heart's Desire)</Label>
            <Select
              value={formData.numerology_soul_urge || ''}
              onValueChange={(v) => setFormData({ ...formData, numerology_soul_urge: v })}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select number" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>None</SelectItem>
                {LIFE_PATH_OPTIONS.map((n) => (
                  <SelectItem key={n} value={n}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Personality (Consonants)</Label>
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
            <Label>Planetary Ruling Card</Label>
            <Select
              value={formData.planetary_ruling_card}
              onValueChange={(v) => setFormData({ ...formData, planetary_ruling_card: v })}
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