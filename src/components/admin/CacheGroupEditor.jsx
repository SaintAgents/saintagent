import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Clock } from 'lucide-react';

export default function CacheGroupEditor({ groupKey, group, onUpdate }) {
  return (
    <Card className="border-slate-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-violet-500" />
          <h3 className="font-semibold text-sm text-slate-900">{group.label}</h3>
          <span className="ml-auto text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{groupKey}</span>
        </div>

        <div className="space-y-3">
          {/* Stale Time */}
          <div>
            <Label className="text-xs text-slate-600">Stale Time (minutes)</Label>
            <Input
              type="number"
              min={1}
              max={1440}
              value={group.staleMinutes}
              onChange={(e) => onUpdate(groupKey, 'staleMinutes', parseInt(e.target.value) || 5)}
              className="mt-1 h-8 text-sm"
            />
          </div>

          {/* Toggles */}
          <div className="flex items-center justify-between">
            <Label className="text-xs text-slate-600">Refetch on Window Focus</Label>
            <Switch
              checked={group.refetchOnFocus}
              onCheckedChange={(v) => onUpdate(groupKey, 'refetchOnFocus', v)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs text-slate-600">Refetch on Mount</Label>
            <Switch
              checked={group.refetchOnMount}
              onCheckedChange={(v) => onUpdate(groupKey, 'refetchOnMount', v)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}