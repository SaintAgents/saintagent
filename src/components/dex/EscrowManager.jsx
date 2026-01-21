import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  Lock, Unlock, Package, Truck, CheckCircle, AlertTriangle,
  Shield, Fingerprint, MapPin, Clock, ArrowRight, Eye,
  Thermometer, Scale, Camera, Wifi, XCircle, RefreshCw
} from 'lucide-react';

// Escrow states following the whitepaper state machine
const ESCROW_STATES = {
  pending: { label: 'Pending', color: 'gray', icon: Clock },
  locked: { label: 'Locked', color: 'amber', icon: Lock },
  proof_collecting: { label: 'Collecting Proofs', color: 'blue', icon: Eye },
  verified: { label: 'Verified', color: 'emerald', icon: CheckCircle },
  released: { label: 'Released', color: 'lime', icon: Unlock },
  reverted: { label: 'Reverted', color: 'red', icon: XCircle },
  disputed: { label: 'Disputed', color: 'orange', icon: AlertTriangle },
};

// Demo escrows
const DEMO_ESCROWS = [
  {
    id: 'ESC-001',
    neo_nft_id: '4',
    neo_nft_title: 'Diamond Escrow Certificate',
    seller_id: 'crownvault@gaia.io',
    seller_name: 'CrownVault.io',
    buyer_id: 'dave@gaia.io',
    buyer_name: 'Dave.eth',
    escrow_amount_ggg: 100,
    status: 'proof_collecting',
    escrow_type: 'delivery',
    physical_verification_required: true,
    verification_proofs: [
      { type: 'weight', status: 'verified', verified_at: '2025-01-18' },
      { type: 'tamper_seal', status: 'verified', verified_at: '2025-01-18' },
      { type: 'location', status: 'pending' },
      { type: 'dna_authority', status: 'pending' }
    ],
    sensor_data: {
      weight_verified: true,
      tamper_seal_intact: true,
      temperature_ok: true,
      location_confirmed: false
    },
    delivery_zone: 'United States',
    expiry_date: '2025-02-15',
    progress: 50
  },
  {
    id: 'ESC-002',
    neo_nft_id: '7',
    neo_nft_title: 'Organic Coffee Harvest 2025',
    seller_id: 'gaiafarms@gaia.io',
    seller_name: 'GaiaFarms.coop',
    buyer_id: 'grace@gaia.io',
    buyer_name: 'Grace.eth',
    escrow_amount_ggg: 25,
    status: 'locked',
    escrow_type: 'delivery',
    physical_verification_required: true,
    verification_proofs: [],
    sensor_data: {
      weight_verified: false,
      tamper_seal_intact: true,
      temperature_ok: true,
      location_confirmed: false
    },
    delivery_zone: 'Costa Rica',
    expiry_date: '2025-03-01',
    progress: 25
  },
  {
    id: 'ESC-003',
    neo_nft_id: '8',
    neo_nft_title: '1kg Gold Bar - Perth Mint',
    seller_id: 'perthmint@gaia.io',
    seller_name: 'PerthMint.gov.au',
    buyer_id: 'henry@gaia.io',
    buyer_name: 'Henry.eth',
    escrow_amount_ggg: 1000,
    status: 'verified',
    escrow_type: 'sale',
    physical_verification_required: true,
    verification_proofs: [
      { type: 'weight', status: 'verified', verified_at: '2025-01-15' },
      { type: 'tamper_seal', status: 'verified', verified_at: '2025-01-15' },
      { type: 'location', status: 'verified', verified_at: '2025-01-16' },
      { type: 'dna_authority', status: 'verified', verified_at: '2025-01-17' }
    ],
    sensor_data: {
      weight_verified: true,
      tamper_seal_intact: true,
      temperature_ok: true,
      location_confirmed: true
    },
    delivery_zone: 'Australia',
    expiry_date: '2025-01-30',
    progress: 100
  }
];

function EscrowCard({ escrow, onViewDetails, theme = 'lime' }) {
  const stateConfig = ESCROW_STATES[escrow.status];
  const StateIcon = stateConfig.icon;

  return (
    <Card className={`bg-black/40 border border-${theme}-500/20 p-4`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-sm font-semibold text-white">{escrow.neo_nft_title}</div>
          <div className="text-xs text-gray-400">ID: {escrow.id}</div>
        </div>
        <Badge className={`bg-${stateConfig.color}-500/20 text-${stateConfig.color}-400 border-${stateConfig.color}-500/40`}>
          <StateIcon className="w-3 h-3 mr-1" />
          {stateConfig.label}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
        <div>
          <div className="text-gray-500">Seller</div>
          <div className="text-white">{escrow.seller_name}</div>
        </div>
        <div>
          <div className="text-gray-500">Buyer</div>
          <div className="text-white">{escrow.buyer_name}</div>
        </div>
        <div>
          <div className="text-gray-500">Amount</div>
          <div className={`text-${theme}-400 font-mono`}>{escrow.escrow_amount_ggg.toLocaleString()} GGG</div>
        </div>
        <div>
          <div className="text-gray-500">Expires</div>
          <div className="text-white">{escrow.expiry_date}</div>
        </div>
      </div>

      {/* Verification Progress */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-400">Verification Progress</span>
          <span className="text-white">{escrow.progress}%</span>
        </div>
        <Progress value={escrow.progress} className="h-2" />
      </div>

      {/* Sensor Status Icons */}
      {escrow.physical_verification_required && (
        <div className="flex items-center gap-2 mb-3">
          <div className={`p-1.5 rounded ${escrow.sensor_data.weight_verified ? 'bg-green-500/20' : 'bg-gray-800'}`}>
            <Scale className={`w-3 h-3 ${escrow.sensor_data.weight_verified ? 'text-green-400' : 'text-gray-500'}`} />
          </div>
          <div className={`p-1.5 rounded ${escrow.sensor_data.tamper_seal_intact ? 'bg-green-500/20' : 'bg-gray-800'}`}>
            <Shield className={`w-3 h-3 ${escrow.sensor_data.tamper_seal_intact ? 'text-green-400' : 'text-gray-500'}`} />
          </div>
          <div className={`p-1.5 rounded ${escrow.sensor_data.temperature_ok ? 'bg-green-500/20' : 'bg-gray-800'}`}>
            <Thermometer className={`w-3 h-3 ${escrow.sensor_data.temperature_ok ? 'text-green-400' : 'text-gray-500'}`} />
          </div>
          <div className={`p-1.5 rounded ${escrow.sensor_data.location_confirmed ? 'bg-green-500/20' : 'bg-gray-800'}`}>
            <MapPin className={`w-3 h-3 ${escrow.sensor_data.location_confirmed ? 'text-green-400' : 'text-gray-500'}`} />
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button 
          size="sm" 
          variant="outline" 
          className="flex-1 border-gray-700 text-gray-400"
          onClick={() => onViewDetails(escrow)}
        >
          <Eye className="w-3 h-3 mr-1" />
          Details
        </Button>
        {escrow.status === 'verified' && (
          <Button 
            size="sm" 
            className={`flex-1 bg-gradient-to-r from-${theme}-500 to-emerald-500 text-black`}
          >
            <Unlock className="w-3 h-3 mr-1" />
            Release
          </Button>
        )}
      </div>
    </Card>
  );
}

export default function EscrowManager({ theme = 'lime' }) {
  const [activeTab, setActiveTab] = useState('active');
  const [selectedEscrow, setSelectedEscrow] = useState(null);

  const activeEscrows = DEMO_ESCROWS.filter(e => !['released', 'reverted'].includes(e.status));
  const completedEscrows = DEMO_ESCROWS.filter(e => ['released', 'reverted'].includes(e.status));

  // Stats
  const totalInEscrow = DEMO_ESCROWS
    .filter(e => !['released', 'reverted'].includes(e.status))
    .reduce((sum, e) => sum + e.escrow_amount_ggg, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className={`bg-black/40 border border-${theme}-500/20 p-4`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Lock className={`w-6 h-6 text-orange-400`} />
              Escrow Manager
            </h2>
            <p className="text-xs text-gray-400 mt-1">Secure physical asset delivery • Sensor verification • DNA gating</p>
          </div>
          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
            <Package className="w-3 h-3 mr-1" />
            {activeEscrows.length} Active
          </Badge>
        </div>

        {/* State Machine Visualization */}
        <div className="flex items-center justify-center gap-2 p-3 bg-black/40 rounded-lg overflow-x-auto">
          {Object.entries(ESCROW_STATES).map(([key, config], idx) => {
            const Icon = config.icon;
            return (
              <React.Fragment key={key}>
                <div className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg ${
                  key === 'verified' ? `bg-${config.color}-500/20 border border-${config.color}-500/40` : ''
                }`}>
                  <Icon className={`w-4 h-4 text-${config.color}-400`} />
                  <span className={`text-[9px] text-${config.color}-400 whitespace-nowrap`}>{config.label}</span>
                </div>
                {idx < Object.keys(ESCROW_STATES).length - 1 && (
                  <ArrowRight className="w-3 h-3 text-gray-600 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className={`bg-black/40 border border-${theme}-500/20 p-3`}>
          <div className="text-xs text-gray-400">Total in Escrow</div>
          <div className={`text-xl font-bold text-${theme}-400 font-mono`}>{totalInEscrow.toLocaleString()} GGG</div>
        </Card>
        <Card className={`bg-black/40 border border-${theme}-500/20 p-3`}>
          <div className="text-xs text-gray-400">Active Escrows</div>
          <div className="text-xl font-bold text-orange-400">{activeEscrows.length}</div>
        </Card>
        <Card className={`bg-black/40 border border-${theme}-500/20 p-3`}>
          <div className="text-xs text-gray-400">Pending Verification</div>
          <div className="text-xl font-bold text-blue-400">
            {DEMO_ESCROWS.filter(e => e.status === 'proof_collecting').length}
          </div>
        </Card>
        <Card className={`bg-black/40 border border-${theme}-500/20 p-3`}>
          <div className="text-xs text-gray-400">Ready to Release</div>
          <div className="text-xl font-bold text-emerald-400">
            {DEMO_ESCROWS.filter(e => e.status === 'verified').length}
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className={`bg-black/60 border border-${theme}-500/20`}>
          <TabsTrigger value="active" className="text-xs">Active Escrows</TabsTrigger>
          <TabsTrigger value="create" className="text-xs">Create New</TabsTrigger>
          <TabsTrigger value="history" className="text-xs">History</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeEscrows.map(escrow => (
              <EscrowCard 
                key={escrow.id} 
                escrow={escrow} 
                onViewDetails={setSelectedEscrow}
                theme={theme}
              />
            ))}
          </div>
          {activeEscrows.length === 0 && (
            <Card className={`bg-black/40 border border-${theme}-500/20 p-8 text-center`}>
              <Lock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <div className="text-gray-400">No active escrows</div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="create" className="mt-4">
          <Card className={`bg-black/40 border border-${theme}-500/20 p-6`}>
            <h3 className="font-semibold text-white mb-4">Create New Escrow</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Neo-NFT ID</label>
                <Input placeholder="Enter Neo-NFT ID..." className="bg-black/60 border-gray-700" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Buyer Address</label>
                <Input placeholder="buyer@gaia.io" className="bg-black/60 border-gray-700" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Escrow Amount (GGG)</label>
                <Input type="number" placeholder="0.00" className="bg-black/60 border-gray-700" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Delivery Zone</label>
                <Input placeholder="e.g., United States" className="bg-black/60 border-gray-700" />
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <Fingerprint className="w-5 h-5 text-purple-400" />
                <div>
                  <div className="text-sm text-purple-300">DNA Gating</div>
                  <div className="text-xs text-gray-400">Require biometric verification for release</div>
                </div>
              </div>
              <Button className={`w-full bg-gradient-to-r from-orange-500 to-amber-500 text-black font-semibold`}>
                <Lock className="w-4 h-4 mr-2" />
                Create Escrow
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card className={`bg-black/40 border border-${theme}-500/20 p-4 text-center`}>
            <RefreshCw className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <div className="text-gray-400">Transaction history coming soon</div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Info Card */}
      <Card className={`bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20 p-4`}>
        <div className="flex items-start gap-3">
          <Package className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-white mb-1">How Escrow Works</h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              <span className="text-amber-400 font-medium">PENDING → LOCKED:</span> Both parties sign, assets locked. 
              <span className="text-blue-400 font-medium"> PROOF-COLLECTING:</span> 6G sensors verify weight, tamper seals, temperature, and location. 
              <span className="text-purple-400 font-medium">DNA GATING:</span> Biometric authority confirms physical custody. 
              <span className="text-emerald-400 font-medium"> VERIFIED → RELEASE:</span> Atomic swap executes, titles transfer instantly.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}