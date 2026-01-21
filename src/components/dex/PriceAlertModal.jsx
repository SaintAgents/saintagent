import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, TrendingUp, TrendingDown, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function PriceAlertModal({ open, onClose, pair, currentPrice, theme = 'lime' }) {
  const [alerts, setAlerts] = useState([
    { id: 1, price: 3300, type: 'above', active: true },
    { id: 2, price: 3100, type: 'below', active: true }
  ]);
  const [newAlertPrice, setNewAlertPrice] = useState('');
  const [newAlertType, setNewAlertType] = useState('above');

  const addAlert = () => {
    if (!newAlertPrice) return;
    const price = parseFloat(newAlertPrice);
    if (isNaN(price)) return;
    
    setAlerts(prev => [...prev, {
      id: Date.now(),
      price,
      type: newAlertType,
      active: true
    }]);
    setNewAlertPrice('');
    toast.success(`Alert set for ${pair?.from || 'ETH'} ${newAlertType === 'above' ? 'above' : 'below'} $${price}`);
  };

  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    toast.success('Alert removed');
  };

  const toggleAlert = (id) => {
    setAlerts(prev => prev.map(a => 
      a.id === id ? { ...a, active: !a.active } : a
    ));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-black/95 border-gray-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className={`w-5 h-5 text-${theme}-400`} />
            Price Alerts - {pair?.from || 'ETH'}/{pair?.to || 'USDC'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Price */}
          <div className="p-3 rounded-lg bg-gray-900 border border-gray-800">
            <div className="text-xs text-gray-500 mb-1">Current Price</div>
            <div className="text-xl font-mono text-white">${currentPrice?.toFixed(2) || '3247.82'}</div>
          </div>

          {/* Add New Alert */}
          <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-800 space-y-3">
            <div className="text-sm font-medium text-gray-300">Create Alert</div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={newAlertType === 'above' ? 'default' : 'outline'}
                className={newAlertType === 'above' ? `bg-${theme}-500 text-black` : 'border-gray-700'}
                onClick={() => setNewAlertType('above')}
              >
                <TrendingUp className="w-3 h-3 mr-1" />
                Above
              </Button>
              <Button
                size="sm"
                variant={newAlertType === 'below' ? 'default' : 'outline'}
                className={newAlertType === 'below' ? 'bg-red-500 text-white' : 'border-gray-700'}
                onClick={() => setNewAlertType('below')}
              >
                <TrendingDown className="w-3 h-3 mr-1" />
                Below
              </Button>
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Enter price..."
                value={newAlertPrice}
                onChange={(e) => setNewAlertPrice(e.target.value)}
                className="bg-black border-gray-700 text-white"
              />
              <Button 
                onClick={addAlert}
                className={`bg-${theme}-500 hover:bg-${theme}-600 text-black`}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Active Alerts */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-300">Active Alerts ({alerts.filter(a => a.active).length})</div>
            {alerts.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm">
                No alerts set. Create one above.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {alerts.map((alert) => (
                  <div 
                    key={alert.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      alert.active 
                        ? alert.type === 'above' 
                          ? `bg-${theme}-500/10 border-${theme}-500/30` 
                          : 'bg-red-500/10 border-red-500/30'
                        : 'bg-gray-900 border-gray-800 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {alert.type === 'above' ? (
                        <TrendingUp className={`w-4 h-4 text-${theme}-400`} />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                      <div>
                        <div className="text-sm font-mono text-white">${alert.price.toFixed(2)}</div>
                        <div className="text-[10px] text-gray-500">
                          {alert.type === 'above' ? 'Above' : 'Below'} current price
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => toggleAlert(alert.id)}
                      >
                        {alert.active ? (
                          <Bell className="w-3.5 h-3.5 text-gray-400" />
                        ) : (
                          <BellOff className="w-3.5 h-3.5 text-gray-600" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-400 hover:text-red-300"
                        onClick={() => removeAlert(alert.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="text-[10px] text-gray-500 text-center">
            Alerts are simulated for demo. Real alerts require wallet connection.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}