import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createPageUrl } from '@/utils';
import AIFieldAssistant from './AIFieldAssistant';

const SUGGESTED_VALUES = [
  'compassion', 'integrity', 'authenticity', 'growth', 'service', 'community',
  'creativity', 'wisdom', 'love', 'freedom', 'joy', 'peace', 'harmony', 'purpose'
];

const SUGGESTED_PRACTICES = [
  'meditation', 'yoga', 'breathwork', 'prayer', 'journaling', 'mindfulness',
  'energy_work', 'sound_healing', 'tarot', 'astrology', 'qigong', 'tai_chi'
];

const SUGGESTED_SKILLS = [
  'coaching', 'writing', 'design', 'programming', 'marketing', 'teaching',
  'healing', 'consulting', 'facilitation', 'speaking', 'art', 'music'
];

export default function ProfileFieldEditDialog({
  activeField,
  onClose,
  fieldConfig,
  profile,
  formData,
  setFormData,
  toggleArrayItem,
  onSave,
  isSaving
}) {
  if (!activeField || !fieldConfig) return null;

  const config = fieldConfig[activeField];
  if (!config) return null;

  return (
    <Dialog open={!!activeField} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {React.createElement(config.icon, { className: cn("w-5 h-5", config.color) })}
            Add {config.label}
          </DialogTitle>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Bio field */}
          {activeField === 'bio' && (
            <div className="space-y-3">
              <Textarea
                placeholder="Tell others about yourself, your journey, and what you're passionate about..."
                value={formData.bio || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                className="min-h-[120px]"
              />
              <AIFieldAssistant
                field="bio"
                profile={profile}
                onApplySuggestion={(text) => setFormData(prev => ({ ...prev, bio: text }))}
              />
            </div>
          )}

          {/* Location field */}
          {activeField === 'location' && (
            <div className="space-y-3">
              <Input
                placeholder="City, Country"
                value={formData.location || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              />
              <AIFieldAssistant
                field="location"
                profile={profile}
                onApplySuggestion={(text) => setFormData(prev => ({ ...prev, location: text }))}
              />
            </div>
          )}

          {/* Skills field */}
          {activeField === 'skills' && (
            <ArrayFieldEditor
              field="skills"
              profile={profile}
              formData={formData}
              setFormData={setFormData}
              toggleArrayItem={toggleArrayItem}
              suggestions={SUGGESTED_SKILLS}
              activeColor="bg-amber-500"
              hoverColor="hover:bg-amber-50"
              label="Select or add your skills:"
            />
          )}

          {/* Core Values field */}
          {activeField === 'core_values' && (
            <ArrayFieldEditor
              field="core_values"
              profile={profile}
              formData={formData}
              setFormData={setFormData}
              toggleArrayItem={toggleArrayItem}
              suggestions={SUGGESTED_VALUES}
              activeColor="bg-emerald-500"
              hoverColor="hover:bg-emerald-50"
              label="What principles guide your life?"
            />
          )}

          {/* Spiritual Practices field */}
          {activeField === 'spiritual_practices' && (
            <ArrayFieldEditor
              field="spiritual_practices"
              profile={profile}
              formData={formData}
              setFormData={setFormData}
              toggleArrayItem={toggleArrayItem}
              suggestions={SUGGESTED_PRACTICES}
              activeColor="bg-violet-500"
              hoverColor="hover:bg-violet-50"
              label="Select your practices:"
              formatLabel={(s) => s.replace(/_/g, ' ')}
            />
          )}

          {/* Interests field */}
          {activeField === 'interests' && (
            <div className="space-y-3">
              <Textarea
                placeholder="What topics excite you? (comma separated)"
                value={Array.isArray(formData.interests) ? formData.interests.join(', ') : formData.interests || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, interests: e.target.value }))}
              />
              <AIFieldAssistant
                field="interests"
                profile={profile}
                onApplySuggestion={(item) => {
                  const current = Array.isArray(formData.interests)
                    ? formData.interests
                    : (formData.interests || '').split(',').map(s => s.trim()).filter(Boolean);
                  const updated = [...new Set([...current, item])];
                  setFormData(prev => ({ ...prev, interests: updated }));
                }}
              />
            </div>
          )}

          {/* Avatar hint */}
          {activeField === 'avatar_url' && (
            <div className="text-center py-4">
              <User className="w-16 h-16 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-600 mb-4">
                Add a profile photo to help others recognize and connect with you.
              </p>
              <Button onClick={() => window.location.href = createPageUrl('Profile') + '?edit=true'}>
                Go to Profile Settings
              </Button>
            </div>
          )}
        </div>

        {activeField !== 'avatar_url' && (
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={onSave} disabled={isSaving} className="gap-2 bg-violet-600 hover:bg-violet-700 text-white">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Save
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ArrayFieldEditor({ field, profile, formData, setFormData, toggleArrayItem, suggestions, activeColor, hoverColor, label, formatLabel }) {
  const selected = formData[field] || profile?.[field] || [];
  const fmt = formatLabel || ((s) => s);

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500">{label}</p>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((item) => (
            <Badge key={item} className={cn(activeColor, "cursor-pointer capitalize")} onClick={() => toggleArrayItem(field, item)}>
              {fmt(item)} ×
            </Badge>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {suggestions.filter(s => !selected.includes(s)).map((item) => (
          <Badge
            key={item}
            variant="outline"
            className={cn("cursor-pointer capitalize", hoverColor)}
            onClick={() => toggleArrayItem(field, item)}
          >
            + {fmt(item)}
          </Badge>
        ))}
      </div>
      {(field === 'skills') && (
        <Input
          placeholder="Add custom (press Enter)"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const newItems = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
              setFormData(prev => ({
                ...prev,
                [field]: [...new Set([...(prev[field] || profile?.[field] || []), ...newItems])]
              }));
              e.target.value = '';
            }
          }}
        />
      )}
      <AIFieldAssistant
        field={field}
        profile={profile}
        onApplySuggestion={(item) => {
          setFormData(prev => ({
            ...prev,
            [field]: [...new Set([...(prev[field] || profile?.[field] || []), item])]
          }));
        }}
      />
    </div>
  );
}