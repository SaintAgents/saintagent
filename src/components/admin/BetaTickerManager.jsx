import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Save, Eye, EyeOff, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function BetaTickerManager() {
  const queryClient = useQueryClient();
  
  const { data: settings = [] } = useQuery({
    queryKey: ['platformSettings'],
    queryFn: () => base44.entities.PlatformSetting.list()
  });
  
  const setting = settings[0] || {};
  
  const [tickerText, setTickerText] = useState(setting.announcement_banner || '');
  const [tickerEnabled, setTickerEnabled] = useState(setting.beta_bonus_active || false);
  const [tickerVisible, setTickerVisible] = useState(!(setting.beta_bonus_active === false));
  
  const updateMutation = useMutation({
    mutationFn: async (updates) => {
      if (setting.id) {
        await base44.entities.PlatformSetting.update(setting.id, updates);
      } else {
        await base44.entities.PlatformSetting.create(updates);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platformSettings'] });
      toast.success('Beta ticker updated');
    }
  });
  
  const handleSave = () => {
    updateMutation.mutate({
      announcement_banner: tickerText,
      beta_bonus_active: tickerEnabled
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-amber-500" />
          Beta Ticker Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Ticker Message</Label>
          <Input
            value={tickerText}
            onChange={(e) => setTickerText(e.target.value)}
            placeholder="Beta test active! Earn 2x GGG for feedback submissions..."
            className="font-mono text-sm"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-500" />
            <Label>Enable Beta Ticker</Label>
          </div>
          <Switch
            checked={tickerEnabled}
            onCheckedChange={setTickerEnabled}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {tickerVisible ? <Eye className="w-4 h-4 text-slate-500" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
            <Label>Ticker Visibility</Label>
          </div>
          <Switch
            checked={tickerVisible}
            onCheckedChange={setTickerVisible}
          />
        </div>
        
        {/* Preview */}
        {tickerEnabled && tickerVisible && (
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
            <p className="text-xs font-medium text-amber-700">Preview:</p>
            <div className="mt-2 bg-amber-100 border border-amber-300 p-2 rounded overflow-hidden">
              <p className="text-xs text-amber-900 animate-pulse">{tickerText || 'Your message here...'}</p>
            </div>
          </div>
        )}
        
        <Button 
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="w-full gap-2 bg-violet-600 hover:bg-violet-700 text-white"
        >
          <Save className="w-4 h-4" />
          Save Ticker Settings
        </Button>
      </CardContent>
    </Card>
  );
}