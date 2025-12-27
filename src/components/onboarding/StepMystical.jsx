import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles } from "lucide-react";

const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

const DESTINY_CARDS = [
  "A♠", "2♠", "3♠", "4♠", "5♠", "6♠", "7♠", "8♠", "9♠", "10♠", "J♠", "Q♠", "K♠",
  "A♥", "2♥", "3♥", "4♥", "5♥", "6♥", "7♥", "8♥", "9♥", "10♥", "J♥", "Q♥", "K♥",
  "A♣", "2♣", "3♣", "4♣", "5♣", "6♣", "7♣", "8♣", "9♣", "10♣", "J♣", "Q♣", "K♣",
  "A♦", "2♦", "3♦", "4♦", "5♦", "6♦", "7♦", "8♦", "9♦", "10♦", "J♦", "Q♦", "K♦"
];

export default function StepMystical({ data, onComplete, user }) {
  const [formData, setFormData] = useState({
    mystical_identifier: data.mystical_identifier || '',
    astrological_sign: data.astrological_sign || '',
    rising_sign: data.rising_sign || '',
    moon_sign: data.moon_sign || '',
    numerology_life_path: data.numerology_life_path || '',
    numerology_personality: data.numerology_personality || '',
    birth_card: data.birth_card || '',
    sun_card: data.sun_card || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Update user profile with mystical data
    const profiles = await base44.entities.UserProfile.filter({ user_id: user.email });
    if (profiles.length > 0) {
      await base44.entities.UserProfile.update(profiles[0].id, {
        mystical_identifier: formData.mystical_identifier,
        astrological_sign: formData.astrological_sign,
        rising_sign: formData.rising_sign,
        moon_sign: formData.moon_sign,
        numerology_life_path: formData.numerology_life_path ? parseInt(formData.numerology_life_path) : null,
        numerology_personality: formData.numerology_personality ? parseInt(formData.numerology_personality) : null,
        birth_card: formData.birth_card,
        sun_card: formData.sun_card
      });
    }
    
    onComplete(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mb-3">
          <Sparkles className="w-6 h-6 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Mystical Profile</h2>
        <p className="text-slate-600">Add your cosmic identifiers (optional but recommended)</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="mystical_identifier">Mystical Identifier</Label>
          <Input
            id="mystical_identifier"
            value={formData.mystical_identifier}
            onChange={(e) => setFormData({ ...formData, mystical_identifier: e.target.value })}
            placeholder="e.g. Lightworker, Healer, Builder"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="astrological_sign">Sun Sign</Label>
            <Select
              value={formData.astrological_sign}
              onValueChange={(value) => setFormData({ ...formData, astrological_sign: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {ZODIAC_SIGNS.map(sign => (
                  <SelectItem key={sign} value={sign}>{sign}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="rising_sign">Rising Sign</Label>
            <Select
              value={formData.rising_sign}
              onValueChange={(value) => setFormData({ ...formData, rising_sign: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {ZODIAC_SIGNS.map(sign => (
                  <SelectItem key={sign} value={sign}>{sign}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="moon_sign">Moon Sign</Label>
            <Select
              value={formData.moon_sign}
              onValueChange={(value) => setFormData({ ...formData, moon_sign: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {ZODIAC_SIGNS.map(sign => (
                  <SelectItem key={sign} value={sign}>{sign}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="numerology_life_path">Life Path Number</Label>
            <Input
              id="numerology_life_path"
              type="number"
              min="1"
              max="33"
              value={formData.numerology_life_path}
              onChange={(e) => setFormData({ ...formData, numerology_life_path: e.target.value })}
              placeholder="1-33"
            />
          </div>
          <div>
            <Label htmlFor="numerology_personality">Personality Number</Label>
            <Input
              id="numerology_personality"
              type="number"
              min="1"
              max="33"
              value={formData.numerology_personality}
              onChange={(e) => setFormData({ ...formData, numerology_personality: e.target.value })}
              placeholder="1-33"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="birth_card">Birth Card (Destiny Cards)</Label>
            <Select
              value={formData.birth_card}
              onValueChange={(value) => setFormData({ ...formData, birth_card: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select card" />
              </SelectTrigger>
              <SelectContent>
                {DESTINY_CARDS.map(card => (
                  <SelectItem key={card} value={card}>{card}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="sun_card">Sun Card (Destiny Cards)</Label>
            <Select
              value={formData.sun_card}
              onValueChange={(value) => setFormData({ ...formData, sun_card: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select card" />
              </SelectTrigger>
              <SelectContent>
                {DESTINY_CARDS.map(card => (
                  <SelectItem key={card} value={card}>{card}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700">
        Continue
      </Button>
    </form>
  );
}