import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const TIMES = ["morning", "afternoon", "evening"];

export default function Step2Region({ data, onComplete, user }) {
  const [formData, setFormData] = useState({
    region: data.region || '',
    meeting_format: data.meeting_format || 'online',
    days_of_week: data.days_of_week || [],
    time_windows: data.time_windows || [],
    travel_radius_miles: data.travel_radius_miles || 25
  });

  const toggleDay = (day) => {
    const days = formData.days_of_week.includes(day)
      ? formData.days_of_week.filter(d => d !== day)
      : [...formData.days_of_week, day];
    setFormData({ ...formData, days_of_week: days });
  };

  const toggleTime = (time) => {
    const times = formData.time_windows.includes(time)
      ? formData.time_windows.filter(t => t !== time)
      : [...formData.time_windows, time];
    setFormData({ ...formData, time_windows: times });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Save availability preferences
    const existing = await base44.entities.AvailabilityPreference.filter({ user_id: user.email });
    if (existing.length > 0) {
      await base44.entities.AvailabilityPreference.update(existing[0].id, formData);
    } else {
      await base44.entities.AvailabilityPreference.create({
        user_id: user.email,
        ...formData
      });
    }
    
    onComplete(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Region & Availability</h2>
        <p className="text-slate-600">Help us connect you with nearby opportunities</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="region">Your Region / City</Label>
          <Input
            id="region"
            value={formData.region}
            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
            placeholder="e.g. San Francisco, CA"
          />
        </div>

        <div>
          <Label>Preferred Meeting Format</Label>
          <RadioGroup
            value={formData.meeting_format}
            onValueChange={(value) => setFormData({ ...formData, meeting_format: value })}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="online" id="online" />
              <Label htmlFor="online" className="font-normal">Online</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="in_person" id="in_person" />
              <Label htmlFor="in_person" className="font-normal">In-person</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hybrid" id="hybrid" />
              <Label htmlFor="hybrid" className="font-normal">Hybrid (both)</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label>Available Days</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {DAYS.map(day => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                  formData.days_of_week.includes(day)
                    ? 'border-violet-500 bg-violet-50 text-violet-700'
                    : 'border-slate-200 text-slate-600 hover:border-violet-200'
                }`}
              >
                {day.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label>Preferred Times</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {TIMES.map(time => (
              <button
                key={time}
                type="button"
                onClick={() => toggleTime(time)}
                className={`px-4 py-2 rounded-lg border-2 text-sm font-medium capitalize transition-all ${
                  formData.time_windows.includes(time)
                    ? 'border-violet-500 bg-violet-50 text-violet-700'
                    : 'border-slate-200 text-slate-600 hover:border-violet-200'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {formData.meeting_format !== 'online' && (
          <div>
            <Label htmlFor="travel_radius">Travel Radius (miles)</Label>
            <Select
              value={formData.travel_radius_miles.toString()}
              onValueChange={(value) => setFormData({ ...formData, travel_radius_miles: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 miles</SelectItem>
                <SelectItem value="10">10 miles</SelectItem>
                <SelectItem value="25">25 miles</SelectItem>
                <SelectItem value="50">50 miles</SelectItem>
                <SelectItem value="100">100 miles</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700">
        Continue
      </Button>
    </form>
  );
}