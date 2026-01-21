import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Zap, Fuel } from 'lucide-react';

export default function GasCostComparison({ ethGwei = 45, silenceCost = 0.03 }) {
  // Calculate ETH gas cost in USD (assuming average tx of 21000 gas and ETH at ~$3200)
  const ethPriceUsd = 3200;
  const avgGasUnits = 21000;
  const gweiToEth = ethGwei / 1000000000;
  const ethGasCostUsd = gweiToEth * avgGasUnits * ethPriceUsd;
  
  // Calculate savings percentage
  const savingsPercent = ((ethGasCostUsd - silenceCost) / ethGasCostUsd * 100).toFixed(0);

  return (
    <div className="flex items-center gap-3 text-xs">
      {/* ETH Gas */}
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-orange-500/10 border border-orange-500/30">
        <Fuel className="w-3 h-3 text-orange-400" />
        <span className="text-orange-400 font-medium">ETH Gas:</span>
        <span className="text-white font-mono">{ethGwei} Gwei</span>
        <span className="text-orange-300">(${ethGasCostUsd.toFixed(2)})</span>
      </div>

      {/* VS Divider */}
      <span className="text-gray-500 font-bold">vs</span>

      {/* $SILENCE */}
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-lime-500/10 border border-lime-500/30">
        <Zap className="w-3 h-3 text-lime-400" />
        <span className="text-lime-400 font-medium">$SILENCE:</span>
        <span className="text-white font-mono">~${silenceCost.toFixed(2)}</span>
        <Badge className="bg-lime-500/20 text-lime-300 border-lime-500/40 text-[9px] px-1 py-0">
          {savingsPercent}% LESS
        </Badge>
      </div>
    </div>
  );
}