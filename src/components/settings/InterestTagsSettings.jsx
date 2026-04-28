import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tags, Plus, X, Sparkles } from "lucide-react";

const SUGGESTED_TAGS = [
  "healing", "wellness", "technology", "finance", "education",
  "sustainability", "governance", "community", "meditation",
  "leadership", "collaboration", "strategy", "design", "ai",
  "regenerative", "sacred arts", "earth stewardship", "media",
  "consulting", "mentorship", "web dev", "legal", "writing"
];

export default function InterestTagsSettings({ tags = [], alertsEnabled = true, onChange }) {
  const [inputValue, setInputValue] = useState('');

  const addTag = (tag) => {
    const normalized = tag.trim().toLowerCase();
    if (!normalized || tags.includes(normalized)) return;
    onChange({ interest_tags: [...tags, normalized] });
    setInputValue('');
  };

  const removeTag = (tag) => {
    onChange({ interest_tags: tags.filter(t => t !== tag) });
  };

  const handleKeyDown = (e) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue);
    }
  };

  const unusedSuggestions = SUGGESTED_TAGS.filter(t => !tags.includes(t));

  return (
    <Card className="bg-violet-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tags className="w-5 h-5 text-violet-600" />
          Interest Tags & Alerts
        </CardTitle>
        <CardDescription>
          Get notified when new Missions or Business Entities match your interests
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Master toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Enable interest alerts</p>
            <p className="text-sm text-slate-500">Receive pings when new content matches your tags</p>
          </div>
          <Switch
            checked={alertsEnabled}
            onCheckedChange={(checked) => onChange({ interest_alerts_enabled: checked })}
            className="data-[state=checked]:bg-violet-600 data-[state=unchecked]:bg-slate-300"
          />
        </div>

        {/* Tag input */}
        <div>
          <Label>Add interest tags</Label>
          <div className="flex gap-2 mt-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              placeholder="Type a tag and press Enter..."
              className="flex-1"
            />
            <Button
              type="button"
              size="sm"
              onClick={() => addTag(inputValue)}
              disabled={!inputValue.trim()}
              className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Current tags */}
        {tags.length > 0 && (
          <div>
            <Label className="text-xs text-slate-500 uppercase tracking-wider">Your Tags ({tags.length})</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map(tag => (
                <Badge key={tag} className="bg-violet-100 text-violet-700 border-violet-200 gap-1 px-3 py-1 text-sm">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="ml-1 hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Suggested tags */}
        {unusedSuggestions.length > 0 && (
          <div>
            <Label className="text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Suggested Tags
            </Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {unusedSuggestions.slice(0, 12).map(tag => (
                <button
                  key={tag}
                  onClick={() => addTag(tag)}
                  className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full border border-dashed border-slate-300 text-slate-600 hover:border-violet-400 hover:text-violet-700 hover:bg-violet-50 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {tags.length === 0 && (
          <p className="text-sm text-slate-400 italic">
            No tags set yet. Add tags to start receiving targeted alerts about new missions and business entities.
          </p>
        )}
      </CardContent>
    </Card>
  );
}