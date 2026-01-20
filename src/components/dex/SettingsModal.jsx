import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { AlertCircle, Zap, Gauge } from 'lucide-react';
import { GAS_PRIORITIES } from './dexUtils';

const SLIPPAGE_PRESETS = [0.1, 0.5, 1.0];

export default function SettingsModal({ open, onClose, slippage, setSlippage, gasPriority, setGasPriority }) {
  const [customSlippage, setCustomSlippage] = React.useState('');

  const handleSlippagePreset = (value) => {
    setSlippage(value);
    setCustomSlippage('');
  };

  const handleCustomSlippage = (value) => {
    setCustomSlippage(value);
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0 && num <= 50) {
      setSlippage(num);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0a0a0f] border border-lime-500/30 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lime-400 flex items-center gap-2">
            <Gauge className="w-5 h-5" />
            Transaction Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Slippage Tolerance */}
          <div>
            <Label className="text-gray-400 mb-3 block">Slippage Tolerance</Label>
            <div className="flex gap-2 mb-3">
              {SLIPPAGE_PRESETS.map(preset => (
                <Button
                  key={preset}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSlippagePreset(preset)}
                  className={`flex-1 ${
                    slippage === preset && !customSlippage
                      ? 'bg-lime-500/20 border-lime-500 text-lime-400'
                      : 'bg-black/40 border-lime-500/30 text-gray-400 hover:bg-lime-500/10'
                  }`}
                >
                  {preset}%
                </Button>
              ))}
              <div className="relative flex-1">
                <Input
                  type="number"
                  value={customSlippage}
                  onChange={(e) => handleCustomSlippage(e.target.value)}
                  placeholder="Custom"
                  className="bg-black/40 border-lime-500/30 text-white placeholder:text-gray-600 pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
              </div>
            </div>

            {slippage > 5 && (
              <div className="flex items-start gap-2 text-yellow-400 text-xs bg-yellow-500/10 p-2 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>High slippage tolerance may result in unfavorable trades</p>
              </div>
            )}

            {slippage < 0.1 && (
              <div className="flex items-start gap-2 text-yellow-400 text-xs bg-yellow-500/10 p-2 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>Very low slippage may cause transactions to fail</p>
              </div>
            )}
          </div>

          {/* Gas Priority */}
          <div>
            <Label className="text-gray-400 mb-3 block flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Transaction Speed
            </Label>
            <div className="space-y-2">
              {GAS_PRIORITIES.map(priority => (
                <button
                  key={priority.value}
                  onClick={() => setGasPriority(priority.value)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    gasPriority === priority.value
                      ? 'bg-lime-500/20 border-lime-500'
                      : 'bg-black/40 border-lime-500/20 hover:border-lime-500/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      priority.value === 'low' ? 'bg-blue-400' :
                      priority.value === 'medium' ? 'bg-lime-400' : 'bg-orange-400'
                    }`} />
                    <span className={gasPriority === priority.value ? 'text-lime-400' : 'text-white'}>
                      {priority.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono text-gray-400">{priority.gwei} Gwei</div>
                    <div className="text-xs text-gray-500">{priority.time}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="pt-4 border-t border-lime-500/20">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Current Slippage</div>
                <div className="text-lime-400 font-mono">{slippage}%</div>
              </div>
              <div>
                <div className="text-gray-500">Gas Priority</div>
                <div className="text-lime-400 capitalize">{gasPriority}</div>
              </div>
            </div>
          </div>

          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-lime-500 to-emerald-500 hover:from-lime-400 hover:to-emerald-400 text-black font-semibold"
          >
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}