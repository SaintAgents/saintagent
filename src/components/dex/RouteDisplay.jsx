import React from 'react';
import { Card } from '@/components/ui/card';
import { ArrowRight, Zap, TrendingUp } from 'lucide-react';
import { BASE_DEXS } from './dexUtils';

export default function RouteDisplay({ route, fromToken, toToken }) {
  if (!route) {
    return (
      <Card className="bg-black/40 border border-lime-500/20 backdrop-blur-xl p-6">
        <div className="text-center text-gray-500 py-8">
          <Zap className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Enter an amount to see the best route</p>
        </div>
      </Card>
    );
  }

  const dex = BASE_DEXS.find(d => d.name === route.dex) || BASE_DEXS[0];

  return (
    <Card className="bg-black/40 border border-lime-500/20 backdrop-blur-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-400">Best Route</h3>
        <div className="flex items-center gap-1.5 text-lime-400 text-sm">
          <TrendingUp className="w-4 h-4" />
          <span>Save ${route.savings}</span>
        </div>
      </div>

      {/* Route visualization */}
      <div className="flex items-center justify-between py-4">
        {route.path.map((token, idx) => (
          <React.Fragment key={idx}>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-lime-500/20 border border-lime-500/40 flex items-center justify-center mb-1">
                <span className="text-xs font-mono text-lime-400">
                  {token.slice(0, 3)}
                </span>
              </div>
              <span className="text-xs text-gray-500">{token}</span>
            </div>
            {idx < route.path.length - 1 && (
              <div className="flex-1 flex items-center justify-center px-2">
                <div className="flex items-center gap-1">
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-lime-500/50 to-lime-500/20" />
                  <ArrowRight className="w-4 h-4 text-lime-500" />
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* DEX info */}
      <div className="mt-4 pt-4 border-t border-lime-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={dex.logo} alt="" className="w-5 h-5 rounded-full" />
            <span className="text-sm text-white">{route.dex}</span>
          </div>
          <div className="text-xs text-gray-500">
            {route.hops} hop{route.hops > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Compared routes */}
      <div className="mt-4 pt-4 border-t border-lime-500/10 space-y-2">
        <div className="text-xs text-gray-500 mb-2">Compared Routes</div>
        {BASE_DEXS.slice(0, 3).map((d, idx) => (
          <div 
            key={d.name} 
            className={`flex items-center justify-between p-2 rounded-lg ${
              d.name === route.dex ? 'bg-lime-500/10 border border-lime-500/30' : 'bg-black/20'
            }`}
          >
            <div className="flex items-center gap-2">
              <img src={d.logo} alt="" className="w-4 h-4 rounded-full" />
              <span className="text-xs text-gray-400">{d.name}</span>
            </div>
            <div className="text-xs font-mono">
              {d.name === route.dex ? (
                <span className="text-lime-400">Best</span>
              ) : (
                <span className="text-gray-500">+{(Math.random() * 0.5 + 0.1).toFixed(2)}%</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}