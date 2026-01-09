import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { base44 } from '@/api/base44Client';

// Zodiac sign calculation
const getZodiacSign = (month, day) => {
  const signs = [
    { sign: 'Capricorn', start: [12, 22], end: [1, 19] },
    { sign: 'Aquarius', start: [1, 20], end: [2, 18] },
    { sign: 'Pisces', start: [2, 19], end: [3, 20] },
    { sign: 'Aries', start: [3, 21], end: [4, 19] },
    { sign: 'Taurus', start: [4, 20], end: [5, 20] },
    { sign: 'Gemini', start: [5, 21], end: [6, 20] },
    { sign: 'Cancer', start: [6, 21], end: [7, 22] },
    { sign: 'Leo', start: [7, 23], end: [8, 22] },
    { sign: 'Virgo', start: [8, 23], end: [9, 22] },
    { sign: 'Libra', start: [9, 23], end: [10, 22] },
    { sign: 'Scorpio', start: [10, 23], end: [11, 21] },
    { sign: 'Sagittarius', start: [11, 22], end: [12, 21] }
  ];
  
  for (const { sign, start, end } of signs) {
    if (start[0] === 12 && end[0] === 1) {
      // Capricorn spans year boundary
      if ((month === 12 && day >= start[1]) || (month === 1 && day <= end[1])) return sign;
    } else {
      if ((month === start[0] && day >= start[1]) || (month === end[0] && day <= end[1])) return sign;
    }
  }
  return 'Unknown';
};

// Numerology life path calculation
const calculateLifePath = (dateStr) => {
  if (!dateStr) return null;
  const digits = dateStr.replace(/-/g, '').split('').map(Number);
  let sum = digits.reduce((a, b) => a + b, 0);
  
  // Reduce to single digit or master number (11, 22, 33)
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = String(sum).split('').map(Number).reduce((a, b) => a + b, 0);
  }
  return sum;
};

// Numerology personality number from full name (consonants only)
const calculatePersonalityNumber = (name) => {
  if (!name) return null;
  const consonants = name.toLowerCase().replace(/[aeiou\s\W\d]/g, '');
  const letterValues = { b: 2, c: 3, d: 4, f: 6, g: 7, h: 8, j: 1, k: 2, l: 3, m: 4, n: 5, p: 7, q: 8, r: 9, s: 1, t: 2, v: 4, w: 5, x: 6, y: 7, z: 8 };
  
  let sum = consonants.split('').reduce((acc, c) => acc + (letterValues[c] || 0), 0);
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = String(sum).split('').map(Number).reduce((a, b) => a + b, 0);
  }
  return sum;
};

export default function Step1Identity({ data, onComplete, user }) {
  const [formData, setFormData] = useState({
    display_name: data.display_name || user?.full_name || '',
    handle: data.handle || '',
    birth_date: data.birth_date || '',
    timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    public_profile: data.public_profile !== false
  });

  const [calculatedZodiac, setCalculatedZodiac] = useState(null);
  const [calculatedLifePath, setCalculatedLifePath] = useState(null);
  const [calculatedPersonality, setCalculatedPersonality] = useState(null);

  // Auto-calculate zodiac and numerology when birth_date or name changes
  useEffect(() => {
    if (formData.birth_date) {
      const [year, month, day] = formData.birth_date.split('-').map(Number);
      setCalculatedZodiac(getZodiacSign(month, day));
      setCalculatedLifePath(calculateLifePath(formData.birth_date));
    }
    if (formData.display_name) {
      setCalculatedPersonality(calculatePersonalityNumber(formData.display_name));
    }
  }, [formData.birth_date, formData.display_name]);

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
    
    // Prepare profile data with calculated mystical values
    const profileData = {
      ...formData,
      astrological_sign: calculatedZodiac,
      numerology_life_path: calculatedLifePath,
      numerology_personality: calculatedPersonality
    };
    
    // Update user profile
    const profiles = await base44.entities.UserProfile.filter({ user_id: user.email });
    if (profiles.length > 0) {
      await base44.entities.UserProfile.update(profiles[0].id, profileData);
    } else {
      await base44.entities.UserProfile.create({
        user_id: user.email,
        ...profileData
      });
    }
    
    onComplete(profileData);
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
          <Label htmlFor="birth_date">Birth Date *</Label>
          <Input
            id="birth_date"
            type="date"
            value={formData.birth_date}
            onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
            required
            max={new Date().toISOString().split('T')[0]}
          />
          {calculatedZodiac && calculatedLifePath && (
            <div className="mt-2 p-3 rounded-lg bg-violet-50 border border-violet-100">
              <p className="text-sm text-violet-700">
                ✨ <span className="font-medium">{calculatedZodiac}</span> • Life Path <span className="font-medium">{calculatedLifePath}</span>
                {calculatedPersonality && <> • Personality <span className="font-medium">{calculatedPersonality}</span></>}
              </p>
            </div>
          )}
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
        disabled={!formData.display_name || !formData.handle || !formData.birth_date || handleAvailable === false}
        className="w-full bg-violet-600 hover:bg-violet-700"
      >
        Continue
      </Button>
    </form>
  );
}