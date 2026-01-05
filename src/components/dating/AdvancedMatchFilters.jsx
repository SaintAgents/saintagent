import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  SlidersHorizontal, 
  ChevronDown, 
  ChevronUp,
  X,
  Plus,
  Heart,
  Target,
  TrendingUp,
  MessageCircle,
  Sun,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CORE_VALUES_OPTIONS = [
  'integrity', 'honesty', 'compassion', 'growth', 'authenticity', 
  'spirituality', 'creativity', 'service', 'freedom', 'connection',
  'wisdom', 'love', 'peace', 'adventure', 'stability'
];

const RELATIONSHIP_INTENT_OPTIONS = [
  { value: 'companionship', label: 'Companionship' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'co_creation', label: 'Co-creation' },
  { value: 'undecided', label: 'Undecided' }
];

const GROWTH_ORIENTATION_OPTIONS = [
  { value: 'steady', label: 'Steady' },
  { value: 'accelerated', label: 'Accelerated' },
  { value: 'seasonal', label: 'Seasonal' }
];

const COMM_DEPTH_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'deep', label: 'Deep' }
];

const DAILY_RHYTHM_OPTIONS = [
  { value: 'introvert', label: 'Introvert' },
  { value: 'ambivert', label: 'Ambivert' },
  { value: 'extrovert', label: 'Extrovert' }
];

const DEFAULT_FILTERS = {
  minScore: 0,
  maxScore: 100,
  relationshipIntent: [],
  growthOrientation: [],
  commDepth: [],
  dailyRhythm: [],
  requiredValues: [],
  excludedValues: [],
  prioritizeValues: [],
  showOnlyBoosted: false,
  hideNoPhoto: false
};

export default function AdvancedMatchFilters({ filters, onChange, resultCount }) {
  const [isOpen, setIsOpen] = useState(false);
  const [valueInput, setValueInput] = useState('');
  
  const activeFilterCount = Object.entries(filters).filter(([key, val]) => {
    if (key === 'minScore' && val === 0) return false;
    if (key === 'maxScore' && val === 100) return false;
    if (Array.isArray(val) && val.length === 0) return false;
    if (typeof val === 'boolean' && !val) return false;
    return true;
  }).length;

  const updateFilter = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  const toggleArrayValue = (key, value) => {
    const current = filters[key] || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    updateFilter(key, updated);
  };

  const addCustomValue = (key) => {
    if (!valueInput.trim()) return;
    const current = filters[key] || [];
    if (!current.includes(valueInput.trim().toLowerCase())) {
      updateFilter(key, [...current, valueInput.trim().toLowerCase()]);
    }
    setValueInput('');
  };

  const resetFilters = () => {
    onChange(DEFAULT_FILTERS);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
            <div className="flex items-center gap-3">
              <SlidersHorizontal className="w-5 h-5 text-violet-500" />
              <span className="font-medium text-slate-900 dark:text-slate-100">Advanced Filters</span>
              {activeFilterCount > 0 && (
                <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300">
                  {activeFilterCount} active
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">{resultCount} matches</span>
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="p-4 pt-0 space-y-6 border-t dark:border-slate-700">
            {/* Score Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-slate-600 dark:text-slate-400">Min Score</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={filters.minScore}
                  onChange={(e) => updateFilter('minScore', parseInt(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-slate-600 dark:text-slate-400">Max Score</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={filters.maxScore}
                  onChange={(e) => updateFilter('maxScore', parseInt(e.target.value) || 100)}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Relationship Intent */}
            <FilterSection 
              icon={Heart} 
              iconColor="text-rose-500" 
              title="Relationship Intent"
            >
              <div className="flex flex-wrap gap-2">
                {RELATIONSHIP_INTENT_OPTIONS.map(opt => (
                  <Badge
                    key={opt.value}
                    variant="outline"
                    className={cn(
                      "cursor-pointer transition-all",
                      filters.relationshipIntent?.includes(opt.value)
                        ? "bg-rose-100 border-rose-300 text-rose-700 dark:bg-rose-900/30 dark:border-rose-700 dark:text-rose-300"
                        : "hover:bg-slate-100 dark:hover:bg-slate-700"
                    )}
                    onClick={() => toggleArrayValue('relationshipIntent', opt.value)}
                  >
                    {filters.relationshipIntent?.includes(opt.value) && <X className="w-3 h-3 mr-1" />}
                    {opt.label}
                  </Badge>
                ))}
              </div>
            </FilterSection>

            {/* Growth Orientation */}
            <FilterSection 
              icon={TrendingUp} 
              iconColor="text-emerald-500" 
              title="Growth Orientation"
            >
              <div className="flex flex-wrap gap-2">
                {GROWTH_ORIENTATION_OPTIONS.map(opt => (
                  <Badge
                    key={opt.value}
                    variant="outline"
                    className={cn(
                      "cursor-pointer transition-all",
                      filters.growthOrientation?.includes(opt.value)
                        ? "bg-emerald-100 border-emerald-300 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-700 dark:text-emerald-300"
                        : "hover:bg-slate-100 dark:hover:bg-slate-700"
                    )}
                    onClick={() => toggleArrayValue('growthOrientation', opt.value)}
                  >
                    {filters.growthOrientation?.includes(opt.value) && <X className="w-3 h-3 mr-1" />}
                    {opt.label}
                  </Badge>
                ))}
              </div>
            </FilterSection>

            {/* Communication Depth */}
            <FilterSection 
              icon={MessageCircle} 
              iconColor="text-blue-500" 
              title="Communication Depth"
            >
              <div className="flex flex-wrap gap-2">
                {COMM_DEPTH_OPTIONS.map(opt => (
                  <Badge
                    key={opt.value}
                    variant="outline"
                    className={cn(
                      "cursor-pointer transition-all",
                      filters.commDepth?.includes(opt.value)
                        ? "bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300"
                        : "hover:bg-slate-100 dark:hover:bg-slate-700"
                    )}
                    onClick={() => toggleArrayValue('commDepth', opt.value)}
                  >
                    {filters.commDepth?.includes(opt.value) && <X className="w-3 h-3 mr-1" />}
                    {opt.label}
                  </Badge>
                ))}
              </div>
            </FilterSection>

            {/* Daily Rhythm */}
            <FilterSection 
              icon={Sun} 
              iconColor="text-amber-500" 
              title="Daily Rhythm"
            >
              <div className="flex flex-wrap gap-2">
                {DAILY_RHYTHM_OPTIONS.map(opt => (
                  <Badge
                    key={opt.value}
                    variant="outline"
                    className={cn(
                      "cursor-pointer transition-all",
                      filters.dailyRhythm?.includes(opt.value)
                        ? "bg-amber-100 border-amber-300 text-amber-700 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-300"
                        : "hover:bg-slate-100 dark:hover:bg-slate-700"
                    )}
                    onClick={() => toggleArrayValue('dailyRhythm', opt.value)}
                  >
                    {filters.dailyRhythm?.includes(opt.value) && <X className="w-3 h-3 mr-1" />}
                    {opt.label}
                  </Badge>
                ))}
              </div>
            </FilterSection>

            {/* Required Values */}
            <FilterSection 
              icon={Target} 
              iconColor="text-violet-500" 
              title="Required Values (must have)"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {CORE_VALUES_OPTIONS.map(val => (
                    <Badge
                      key={val}
                      variant="outline"
                      className={cn(
                        "cursor-pointer transition-all capitalize",
                        filters.requiredValues?.includes(val)
                          ? "bg-violet-100 border-violet-300 text-violet-700 dark:bg-violet-900/30 dark:border-violet-700 dark:text-violet-300"
                          : "hover:bg-slate-100 dark:hover:bg-slate-700"
                      )}
                      onClick={() => toggleArrayValue('requiredValues', val)}
                    >
                      {filters.requiredValues?.includes(val) ? <X className="w-3 h-3 mr-1" /> : <Plus className="w-3 h-3 mr-1" />}
                      {val}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add custom value..."
                    value={valueInput}
                    onChange={(e) => setValueInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCustomValue('requiredValues')}
                    className="flex-1 h-8 text-sm"
                  />
                  <Button size="sm" variant="outline" onClick={() => addCustomValue('requiredValues')}>
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </FilterSection>

            {/* Excluded Values */}
            <FilterSection 
              icon={X} 
              iconColor="text-red-500" 
              title="Excluded Values (must not have)"
            >
              <div className="flex flex-wrap gap-2">
                {CORE_VALUES_OPTIONS.slice(0, 8).map(val => (
                  <Badge
                    key={val}
                    variant="outline"
                    className={cn(
                      "cursor-pointer transition-all capitalize",
                      filters.excludedValues?.includes(val)
                        ? "bg-red-100 border-red-300 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300"
                        : "hover:bg-slate-100 dark:hover:bg-slate-700"
                    )}
                    onClick={() => toggleArrayValue('excludedValues', val)}
                  >
                    {filters.excludedValues?.includes(val) && <X className="w-3 h-3 mr-1" />}
                    {val}
                  </Badge>
                ))}
              </div>
            </FilterSection>

            {/* Priority Values */}
            <FilterSection 
              icon={TrendingUp} 
              iconColor="text-purple-500" 
              title="Prioritize Values (boost score)"
            >
              <div className="flex flex-wrap gap-2">
                {CORE_VALUES_OPTIONS.map(val => (
                  <Badge
                    key={val}
                    variant="outline"
                    className={cn(
                      "cursor-pointer transition-all capitalize",
                      filters.prioritizeValues?.includes(val)
                        ? "bg-purple-100 border-purple-300 text-purple-700 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-300"
                        : "hover:bg-slate-100 dark:hover:bg-slate-700"
                    )}
                    onClick={() => toggleArrayValue('prioritizeValues', val)}
                  >
                    {filters.prioritizeValues?.includes(val) && <X className="w-3 h-3 mr-1" />}
                    {val}
                  </Badge>
                ))}
              </div>
            </FilterSection>

            {/* Toggle Options */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={filters.showOnlyBoosted}
                  onCheckedChange={(v) => updateFilter('showOnlyBoosted', v)}
                />
                <Label className="text-sm">Boosted profiles only</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={filters.hideNoPhoto}
                  onCheckedChange={(v) => updateFilter('hideNoPhoto', v)}
                />
                <Label className="text-sm">Hide profiles without photo</Label>
              </div>
            </div>

            {/* Reset Button */}
            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={resetFilters} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Reset Filters
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

function FilterSection({ icon: Icon, iconColor, title, children }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
        <Icon className={cn("w-4 h-4", iconColor)} />
        {title}
      </Label>
      {children}
    </div>
  );
}

export { DEFAULT_FILTERS };