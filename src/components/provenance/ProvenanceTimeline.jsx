import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Clock, ArrowRight, ExternalLink, User, MapPin, 
  Coins, Shield, Fingerprint, Globe, Lock, Unlock,
  FileText, AlertTriangle, CheckCircle, Package
} from 'lucide-react';
import { format } from 'date-fns';

const ACTION_ICONS = {
  mint: { icon: Coins, color: 'lime' },
  transfer: { icon: ArrowRight, color: 'blue' },
  custody_change: { icon: Package, color: 'amber' },
  geo_fence_update: { icon: Globe, color: 'green' },
  dna_gate_activation: { icon: Fingerprint, color: 'purple' },
  dna_gate_deactivation: { icon: Fingerprint, color: 'gray' },
  escrow_created: { icon: Lock, color: 'orange' },
  escrow_released: { icon: Unlock, color: 'emerald' },
  escrow_reverted: { icon: AlertTriangle, color: 'red' },
  document_added: { icon: FileText, color: 'blue' },
  document_verified: { icon: CheckCircle, color: 'emerald' },
  verification_status_change: { icon: Shield, color: 'purple' },
  default: { icon: Clock, color: 'gray' }
};

// Demo timeline data for visualization
const DEMO_TIMELINE = [
  {
    id: '1',
    action_type: 'mint',
    actor_name: 'StarArtist.eth',
    description: 'Neo-NFT minted and registered on StarChain',
    created_date: '2024-01-15T10:30:00Z',
    starchain_tx_hash: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef12',
    block_number: 28100000,
    metadata: { initial_gold_backing: '1.5g' }
  },
  {
    id: '2',
    action_type: 'document_added',
    actor_name: 'StarArtist.eth',
    description: 'Gold certificate uploaded and linked',
    created_date: '2024-01-15T10:35:00Z',
    starchain_tx_hash: '0x2b3c4d5e6f7890abcdef1234567890abcdef123a',
    block_number: 28100012
  },
  {
    id: '3',
    action_type: 'document_verified',
    actor_name: 'GaiaVault.io',
    description: 'Gold certificate verified by authorized auditor',
    created_date: '2024-01-20T14:00:00Z',
    starchain_tx_hash: '0x3c4d5e6f7890abcdef1234567890abcdef123ab4',
    block_number: 28150000,
    compliance_relevant: true
  },
  {
    id: '4',
    action_type: 'geo_fence_update',
    actor_name: 'System',
    description: 'Trading zones updated: Added Singapore',
    created_date: '2024-02-01T09:00:00Z',
    previous_value: 'Switzerland, EU, US',
    new_value: 'Switzerland, EU, US, Singapore',
    starchain_tx_hash: '0x4d5e6f7890abcdef1234567890abcdef123abc56',
    block_number: 28200000,
    compliance_relevant: true
  },
  {
    id: '5',
    action_type: 'transfer',
    actor_name: 'StarArtist.eth',
    description: 'Ownership transferred to Alice.eth',
    created_date: '2024-06-01T16:45:00Z',
    previous_value: 'starartist@gaia.io',
    new_value: 'alice@gaia.io',
    starchain_tx_hash: '0x5e6f7890abcdef1234567890abcdef123abcd678',
    block_number: 28400000,
    metadata: { price_ggg: 1.5, transaction_type: 'purchase' }
  },
  {
    id: '6',
    action_type: 'custody_change',
    actor_name: 'ZurichVault.ch',
    description: 'Physical asset moved to Zurich Sovereign Vault',
    created_date: '2024-06-05T11:00:00Z',
    previous_value: 'Geneva Depot',
    new_value: 'Zurich Sovereign Vault',
    starchain_tx_hash: '0x6f7890abcdef1234567890abcdef123abcde7890',
    block_number: 28420000,
    geo_location: 'Zurich, Switzerland'
  }
];

function TimelineEvent({ event, isLast }) {
  const [expanded, setExpanded] = useState(false);
  const actionConfig = ACTION_ICONS[event.action_type] || ACTION_ICONS.default;
  const Icon = actionConfig.icon;

  return (
    <div className="flex gap-4">
      {/* Timeline Line */}
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-full bg-${actionConfig.color}-500/20 border border-${actionConfig.color}-500/40 flex items-center justify-center`}>
          <Icon className={`w-5 h-5 text-${actionConfig.color}-400`} />
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-gray-800 my-2" />}
      </div>

      {/* Event Content */}
      <Card className={`flex-1 mb-4 bg-black/40 border border-${actionConfig.color}-500/20 overflow-hidden`}>
        <div 
          className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className={`bg-${actionConfig.color}-500/20 text-${actionConfig.color}-400 border-${actionConfig.color}-500/40 text-[10px]`}>
                  {event.action_type.replace(/_/g, ' ')}
                </Badge>
                {event.compliance_relevant && (
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/40 text-[10px]">
                    <Shield className="w-2.5 h-2.5 mr-0.5" />
                    Compliance
                  </Badge>
                )}
              </div>
              <p className="text-sm text-white font-medium">{event.description}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {event.actor_name}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {format(new Date(event.created_date), 'MMM d, yyyy HH:mm')}
                </span>
                {event.geo_location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {event.geo_location}
                  </span>
                )}
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-gray-400 text-xs">
              {expanded ? 'Less' : 'More'}
            </Button>
          </div>

          {expanded && (
            <div className="mt-4 pt-4 border-t border-gray-800 space-y-3">
              {/* Value Change */}
              {(event.previous_value || event.new_value) && (
                <div className="flex items-center gap-2 text-xs">
                  {event.previous_value && (
                    <span className="px-2 py-1 rounded bg-red-500/10 text-red-400 font-mono">
                      {event.previous_value}
                    </span>
                  )}
                  <ArrowRight className="w-4 h-4 text-gray-500" />
                  {event.new_value && (
                    <span className="px-2 py-1 rounded bg-green-500/10 text-green-400 font-mono">
                      {event.new_value}
                    </span>
                  )}
                </div>
              )}

              {/* StarChain Details */}
              {event.starchain_tx_hash && (
                <div className="p-3 rounded-lg bg-black/40 border border-gray-800">
                  <div className="text-xs text-gray-500 mb-2">StarChain Transaction</div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">TX Hash:</span>
                        <span className="text-xs text-lime-400 font-mono truncate max-w-[200px]">
                          {event.starchain_tx_hash}
                        </span>
                      </div>
                      {event.block_number && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">Block:</span>
                          <span className="text-xs text-white font-mono">#{event.block_number.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" className="text-lime-400 text-xs">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              )}

              {/* Metadata */}
              {event.metadata && Object.keys(event.metadata).length > 0 && (
                <div className="p-3 rounded-lg bg-black/40 border border-gray-800">
                  <div className="text-xs text-gray-500 mb-2">Additional Data</div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(event.metadata).map(([key, value]) => (
                      <div key={key} className="text-xs">
                        <span className="text-gray-400">{key.replace(/_/g, ' ')}: </span>
                        <span className="text-white">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default function ProvenanceTimeline({ nft, auditLogs = [] }) {
  // Use demo data if no real audit logs
  const timelineData = auditLogs.length > 0 ? auditLogs : DEMO_TIMELINE;

  return (
    <div className="space-y-4">
      <Card className="bg-black/40 border border-lime-500/20 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-lime-400" />
            Ownership & Event Timeline
          </h3>
          <Badge className="bg-lime-500/20 text-lime-400 border-lime-500/40">
            {timelineData.length} Events
          </Badge>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          Complete chronological history of ownership transfers, custody changes, and significant events recorded on StarChain.
        </p>
      </Card>

      <ScrollArea className="h-[600px] pr-4">
        {timelineData.map((event, idx) => (
          <TimelineEvent 
            key={event.id} 
            event={event} 
            isLast={idx === timelineData.length - 1}
          />
        ))}
      </ScrollArea>
    </div>
  );
}