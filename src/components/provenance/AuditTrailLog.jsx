import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Shield, Search, Filter, Download, ExternalLink, 
  Clock, User, MapPin, Hash, AlertTriangle, CheckCircle,
  Lock, Unlock, Globe, Fingerprint, FileText, Coins, ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';

const ACTION_TYPES = [
  { value: 'all', label: 'All Events' },
  { value: 'mint', label: 'Mint' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'custody_change', label: 'Custody Change' },
  { value: 'geo_fence_update', label: 'Geo-Fence Update' },
  { value: 'dna_gate_activation', label: 'DNA Gate Activation' },
  { value: 'escrow_created', label: 'Escrow Created' },
  { value: 'escrow_released', label: 'Escrow Released' },
  { value: 'document_added', label: 'Document Added' },
  { value: 'document_verified', label: 'Document Verified' },
];

const ACTION_CONFIG = {
  mint: { icon: Coins, color: 'lime', label: 'MINT' },
  transfer: { icon: ArrowRight, color: 'blue', label: 'TRANSFER' },
  custody_change: { icon: Lock, color: 'amber', label: 'CUSTODY' },
  geo_fence_update: { icon: Globe, color: 'green', label: 'GEO-FENCE' },
  dna_gate_activation: { icon: Fingerprint, color: 'purple', label: 'DNA-GATE' },
  dna_gate_deactivation: { icon: Fingerprint, color: 'gray', label: 'DNA-GATE' },
  escrow_created: { icon: Lock, color: 'orange', label: 'ESCROW' },
  escrow_released: { icon: Unlock, color: 'emerald', label: 'ESCROW' },
  escrow_reverted: { icon: AlertTriangle, color: 'red', label: 'ESCROW' },
  document_added: { icon: FileText, color: 'blue', label: 'DOCUMENT' },
  document_verified: { icon: CheckCircle, color: 'emerald', label: 'VERIFIED' },
  verification_status_change: { icon: Shield, color: 'purple', label: 'STATUS' },
  default: { icon: Clock, color: 'gray', label: 'EVENT' }
};

// Comprehensive demo audit log
const DEMO_AUDIT_LOG = [
  {
    id: '1',
    action_type: 'mint',
    actor_id: 'starartist@gaia.io',
    actor_name: 'StarArtist.eth',
    description: 'Neo-NFT minted with 1.5g gold backing',
    created_date: '2024-01-15T10:30:00Z',
    starchain_tx_hash: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef12',
    block_number: 28100000,
    is_immutable: true,
    compliance_relevant: true,
    metadata: { initial_price: '1.5 GGG', gold_backing: '1.5g' }
  },
  {
    id: '2',
    action_type: 'document_added',
    actor_id: 'starartist@gaia.io',
    actor_name: 'StarArtist.eth',
    description: 'Gold Certificate of Authenticity uploaded',
    created_date: '2024-01-15T10:35:00Z',
    starchain_tx_hash: '0x2b3c4d5e6f7890abcdef1234567890abcdef123a',
    block_number: 28100012,
    is_immutable: true,
    compliance_relevant: false,
    metadata: { document_type: 'certification', file_hash: 'SHA256:a1b2c3...' }
  },
  {
    id: '3',
    action_type: 'document_verified',
    actor_id: 'auditor@gaiavault.io',
    actor_name: 'GaiaVault.io',
    description: 'Gold certificate verified by authorized auditor',
    created_date: '2024-01-20T14:00:00Z',
    starchain_tx_hash: '0x3c4d5e6f7890abcdef1234567890abcdef123ab4',
    block_number: 28150000,
    is_immutable: true,
    compliance_relevant: true,
    metadata: { verifier_license: 'GV-AUD-2024-001' }
  },
  {
    id: '4',
    action_type: 'geo_fence_update',
    actor_id: 'system@starchain.io',
    actor_name: 'System',
    description: 'Trading zone added: Singapore',
    previous_value: 'Switzerland, EU, US',
    new_value: 'Switzerland, EU, US, Singapore',
    created_date: '2024-02-01T09:00:00Z',
    starchain_tx_hash: '0x4d5e6f7890abcdef1234567890abcdef123abc56',
    block_number: 28200000,
    is_immutable: true,
    compliance_relevant: true,
    geo_location: 'Singapore'
  },
  {
    id: '5',
    action_type: 'dna_gate_activation',
    actor_id: 'alice@gaia.io',
    actor_name: 'Alice.eth',
    description: 'DNA gating enabled for high-value transfer protection',
    created_date: '2024-05-15T11:30:00Z',
    starchain_tx_hash: '0x5e6f7890abcdef1234567890abcdef123abcd678',
    block_number: 28350000,
    is_immutable: true,
    compliance_relevant: true,
    metadata: { authorized_dna_ids: ['alice@gaia.io'] }
  },
  {
    id: '6',
    action_type: 'transfer',
    actor_id: 'starartist@gaia.io',
    actor_name: 'StarArtist.eth',
    description: 'Ownership transferred to Alice.eth',
    previous_value: 'starartist@gaia.io',
    new_value: 'alice@gaia.io',
    created_date: '2024-06-01T16:45:00Z',
    starchain_tx_hash: '0x6f7890abcdef1234567890abcdef123abcde7890',
    block_number: 28400000,
    is_immutable: true,
    compliance_relevant: true,
    metadata: { price_ggg: 1.5, transaction_type: 'purchase' }
  },
  {
    id: '7',
    action_type: 'custody_change',
    actor_id: 'vault@zurich.ch',
    actor_name: 'ZurichVault.ch',
    description: 'Physical asset relocated to Zurich Sovereign Vault',
    previous_value: 'Geneva Depot',
    new_value: 'Zurich Sovereign Vault',
    created_date: '2024-06-05T11:00:00Z',
    starchain_tx_hash: '0x7890abcdef1234567890abcdef123abcdef901234',
    block_number: 28420000,
    is_immutable: true,
    compliance_relevant: true,
    geo_location: 'Zurich, Switzerland'
  }
];

function AuditRow({ log }) {
  const [expanded, setExpanded] = useState(false);
  const config = ACTION_CONFIG[log.action_type] || ACTION_CONFIG.default;
  const Icon = config.icon;

  return (
    <div 
      className={`border-b border-gray-800/50 hover:bg-white/5 transition-colors cursor-pointer`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-4">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className={`w-8 h-8 rounded-lg bg-${config.color}-500/20 flex items-center justify-center shrink-0`}>
            <Icon className={`w-4 h-4 text-${config.color}-400`} />
          </div>

          {/* Main Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={`bg-${config.color}-500/20 text-${config.color}-400 border-${config.color}-500/40 text-[9px] font-mono`}>
                {config.label}
              </Badge>
              {log.compliance_relevant && (
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/40 text-[9px]">
                  <Shield className="w-2.5 h-2.5 mr-0.5" />
                  COMPLIANCE
                </Badge>
              )}
              {log.is_immutable && (
                <Badge className="bg-lime-500/20 text-lime-400 border-lime-500/40 text-[9px]">
                  <Lock className="w-2.5 h-2.5 mr-0.5" />
                  IMMUTABLE
                </Badge>
              )}
            </div>
            <p className="text-sm text-white truncate">{log.description}</p>
          </div>

          {/* Timestamp & Actor */}
          <div className="text-right shrink-0 hidden md:block">
            <div className="text-xs text-white">{format(new Date(log.created_date), 'MMM d, yyyy')}</div>
            <div className="text-xs text-gray-500">{format(new Date(log.created_date), 'HH:mm:ss')}</div>
          </div>

          {/* Actor */}
          <div className="text-right shrink-0 hidden lg:block">
            <div className="text-xs text-gray-400 flex items-center gap-1 justify-end">
              <User className="w-3 h-3" />
              {log.actor_name}
            </div>
          </div>

          {/* Block */}
          <div className="text-right shrink-0 hidden xl:block">
            <div className="text-xs text-lime-400 font-mono">
              #{log.block_number?.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-800 space-y-3">
            {/* Value Change */}
            {(log.previous_value || log.new_value) && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Change:</span>
                {log.previous_value && (
                  <span className="px-2 py-1 rounded text-xs bg-red-500/10 text-red-400 font-mono">
                    {log.previous_value}
                  </span>
                )}
                <ArrowRight className="w-4 h-4 text-gray-500" />
                {log.new_value && (
                  <span className="px-2 py-1 rounded text-xs bg-green-500/10 text-green-400 font-mono">
                    {log.new_value}
                  </span>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <div className="text-gray-500 mb-1">Actor</div>
                <div className="text-white">{log.actor_name}</div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Timestamp</div>
                <div className="text-white">{format(new Date(log.created_date), 'PPpp')}</div>
              </div>
              {log.geo_location && (
                <div>
                  <div className="text-gray-500 mb-1">Location</div>
                  <div className="text-white flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {log.geo_location}
                  </div>
                </div>
              )}
              <div>
                <div className="text-gray-500 mb-1">Block</div>
                <div className="text-lime-400 font-mono">#{log.block_number?.toLocaleString()}</div>
              </div>
            </div>

            {/* TX Hash */}
            {log.starchain_tx_hash && (
              <div className="p-3 rounded-lg bg-black/40 border border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-gray-500 mb-1">StarChain Transaction Hash</div>
                    <div className="text-xs text-lime-400 font-mono">{log.starchain_tx_hash}</div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-lime-400">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Explorer
                  </Button>
                </div>
              </div>
            )}

            {/* Metadata */}
            {log.metadata && Object.keys(log.metadata).length > 0 && (
              <div className="p-3 rounded-lg bg-black/40 border border-gray-800">
                <div className="text-[10px] text-gray-500 mb-2">Event Metadata</div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(log.metadata).map(([key, value]) => (
                    <Badge key={key} variant="outline" className="text-xs border-gray-700">
                      <span className="text-gray-400">{key.replace(/_/g, ' ')}:</span>
                      <span className="text-white ml-1">{String(value)}</span>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuditTrailLog({ auditLogs = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [complianceOnly, setComplianceOnly] = useState(false);

  // Use demo data if no real logs
  const displayLogs = auditLogs.length > 0 ? auditLogs : DEMO_AUDIT_LOG;

  const filteredLogs = displayLogs.filter(log => {
    const typeMatch = filterType === 'all' || log.action_type === filterType;
    const searchMatch = !searchQuery || 
      log.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actor_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const complianceMatch = !complianceOnly || log.compliance_relevant;
    return typeMatch && searchMatch && complianceMatch;
  });

  const complianceCount = displayLogs.filter(l => l.compliance_relevant).length;

  return (
    <div className="space-y-4">
      <Card className="bg-black/40 border border-purple-500/20 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              Immutable Audit Trail
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              All Neo-NFT state changes and actions recorded on StarChain
            </p>
          </div>
          <Button variant="outline" className="border-gray-700 text-gray-400">
            <Download className="w-4 h-4 mr-2" />
            Export Log
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events..."
                className="pl-9 bg-black/60 border-gray-700"
              />
            </div>
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px] bg-black/60 border-gray-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACTION_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant={complianceOnly ? "default" : "outline"}
            onClick={() => setComplianceOnly(!complianceOnly)}
            className={complianceOnly ? "bg-purple-500/20 text-purple-400" : "border-gray-700 text-gray-400"}
          >
            <Shield className="w-4 h-4 mr-2" />
            Compliance ({complianceCount})
          </Button>
        </div>
      </Card>

      {/* Log Table */}
      <Card className="bg-black/40 border border-gray-800 overflow-hidden">
        <ScrollArea className="h-[500px]">
          {filteredLogs.map(log => (
            <AuditRow key={log.id} log={log} />
          ))}
          {filteredLogs.length === 0 && (
            <div className="p-8 text-center">
              <Shield className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No audit events match your filters</p>
            </div>
          )}
        </ScrollArea>
      </Card>

      {/* Legend */}
      <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 p-4">
        <div className="text-xs text-gray-400">
          <span className="text-purple-400 font-medium">Audit Trail Guarantee:</span> All events are cryptographically signed, timestamped, and recorded on StarChain. 
          Records marked as <Badge className="bg-lime-500/20 text-lime-400 text-[9px] mx-1">IMMUTABLE</Badge> cannot be modified or deleted. 
          <Badge className="bg-purple-500/20 text-purple-400 text-[9px] mx-1">COMPLIANCE</Badge> events are flagged for regulatory reporting.
        </div>
      </Card>
    </div>
  );
}