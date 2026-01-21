import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Image, Landmark, Zap, FileText, Droplet, Diamond, 
  Shield, Lock, TrendingUp, Search, Filter, Star,
  Coins, MapPin, Calendar, CheckCircle, ArrowRight, Sparkles,
  Grid3X3, List, Globe, SortAsc, Package, History
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import NeoNFTDetailModal from './NeoNFTDetailModal';
import NeoNFTListView from './NeoNFTListView';

const NEO_NFT_CATEGORIES = [
  { id: 'all', label: 'All Assets', icon: Sparkles },
  { id: 'art', label: 'Art & Culture', icon: Image },
  { id: 'land', label: 'Land & Real Estate', icon: Landmark },
  { id: 'energy', label: 'Energy Credits', icon: Zap },
  { id: 'commodities', label: 'Commodities', icon: Diamond },
  { id: 'agriculture', label: 'Agriculture', icon: Package },
  { id: 'sovereign', label: 'Sovereign Instruments', icon: Shield },
];

// 1 GGG = 1 gram of gold @ USD 145.00 per gram
const GOLD_PRICE_USD = 145.00;

// Enhanced mock Neo-NFTs with full metadata
const MOCK_NEO_NFTS = [
  {
    id: 1,
    title: 'Sacred Geometry #001',
    category: 'art',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400',
    image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400',
    gold_backing_grams: 1.5,
    goldBacking: 1.5,
    price_ggg: 1.5,
    price: 1.5,
    creator_id: 'starartist@gaia.io',
    creator_name: 'StarArtist.eth',
    owner_id: 'alice@gaia.io',
    verified: true,
    rarity: 'legendary',
    description: 'Divine mandala with 1.5g gold certificate. Hand-crafted sacred geometry representing cosmic harmony.',
    ucc_filing: 'UCC-2024-ART-001234',
    serial_number: 'SG-001-2024',
    custody_state: 'vault_secured',
    custody_location: 'Zurich Sovereign Vault',
    geo_fence_zones: ['Switzerland', 'European Union', 'United States', 'Singapore'],
    geo_fence_restricted: ['OFAC Sanctioned Nations'],
    dna_gating_required: false,
    asset_type: 'Digital Art with Gold Certificate',
    status: 'listed',
    listing_type: 'sale',
    ownership_history: [
      { owner_id: 'starartist@gaia.io', from_date: '2024-01-15', to_date: '2024-06-01', transfer_type: 'mint' },
      { owner_id: 'alice@gaia.io', from_date: '2024-06-01', to_date: null, transfer_type: 'purchase' }
    ],
    proof_of_reserve: 'https://vault.gaia.io/reserve/SG-001-2024',
    starchain_tx_hash: '0x1a2b3c4d5e6f...'
  },
  {
    id: 2,
    title: 'Arizona Land Parcel #42',
    category: 'land',
    image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400',
    image_url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400',
    gold_backing_grams: 50,
    goldBacking: 50,
    price_ggg: 50,
    price: 50,
    creator_id: 'sovereignland@gaia.io',
    creator_name: 'SovereignLand.dao',
    owner_id: 'bob@gaia.io',
    verified: true,
    rarity: 'rare',
    description: '5-acre desert parcel with full mineral rights. Includes water rights and development permits.',
    location: 'Sedona, AZ, United States',
    ucc_filing: 'UCC-2024-LAND-008821',
    serial_number: 'AZ-P42-2024',
    custody_state: 'vault_secured',
    custody_location: 'Phoenix Title Office',
    geo_fence_zones: ['United States'],
    geo_fence_restricted: ['Foreign Nationals without CFIUS Approval'],
    dna_gating_required: true,
    dna_authority_ids: ['bob@gaia.io'],
    asset_type: 'Land Parcel',
    asset_weight: '5 acres',
    programmable_restrictions: {
      min_hold_days: 90,
      max_transfers_per_year: 2,
      requires_kyc: true,
      jurisdiction_whitelist: ['United States']
    },
    status: 'listed',
    listing_type: 'sale'
  },
  {
    id: 3,
    title: 'Solar Credit Package',
    category: 'energy',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400',
    image_url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400',
    gold_backing_grams: 10,
    goldBacking: 10,
    price_ggg: 10,
    price: 10,
    creator_id: 'gaiaenergy@gaia.io',
    creator_name: 'GaiaEnergy.org',
    owner_id: 'carol@gaia.io',
    verified: true,
    rarity: 'common',
    description: '1000 kWh renewable energy credits from certified solar farms. Tradeable and redeemable.',
    ucc_filing: 'UCC-2025-ENERGY-002451',
    serial_number: 'SEC-1000-2025',
    custody_state: 'vault_secured',
    geo_fence_zones: ['Global'],
    geo_fence_restricted: [],
    dna_gating_required: false,
    asset_type: 'Energy Credits',
    asset_weight: '1000 kWh',
    status: 'listed',
    listing_type: 'sale'
  },
  {
    id: 4,
    title: 'Diamond Escrow Certificate',
    category: 'commodities',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
    image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
    gold_backing_grams: 100,
    goldBacking: 100,
    price_ggg: 100,
    price: 100,
    creator_id: 'crownvault@gaia.io',
    creator_name: 'CrownVault.io',
    owner_id: 'dave@gaia.io',
    verified: true,
    rarity: 'epic',
    description: '2.5 carat certified diamond in escrow. GIA certified, D color, VVS1 clarity.',
    escrow: true,
    escrowExpiry: '2026-03-15',
    ucc_filing: 'UCC-2025-DIAMOND-009912',
    serial_number: 'DIA-25-2025',
    custody_state: 'in_transit',
    custody_location: 'Antwerp Diamond Vault',
    geo_fence_zones: ['Belgium', 'Switzerland', 'United Arab Emirates', 'United States'],
    geo_fence_restricted: ['Conflict Zones'],
    dna_gating_required: true,
    dna_authority_ids: ['dave@gaia.io', 'crownvault@gaia.io'],
    asset_type: 'Diamond',
    asset_weight: '2.5 carats',
    asset_purity: 'GIA D/VVS1',
    certification_proofs: ['https://gia.edu/cert/12345', 'https://vault.gaia.io/diamond/DIA-25'],
    status: 'in_escrow',
    listing_type: 'sale'
  },
  {
    id: 5,
    title: 'Crude Oil Futures Title',
    category: 'commodities',
    image: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=400',
    image_url: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=400',
    gold_backing_grams: 250,
    goldBacking: 250,
    price_ggg: 250,
    price: 250,
    creator_id: 'energytrust@gaia.io',
    creator_name: 'EnergyTrust.sov',
    owner_id: 'eve@gaia.io',
    verified: true,
    rarity: 'legendary',
    description: '1000 barrels West Texas Intermediate crude, physically stored and vault-secured.',
    escrow: true,
    escrowExpiry: '2026-06-30',
    ucc_filing: 'UCC-2025-OIL-011203',
    serial_number: 'WTI-1000-2025',
    custody_state: 'vault_secured',
    custody_location: 'Cushing, Oklahoma Storage Facility',
    geo_fence_zones: ['United States', 'Canada', 'European Union'],
    geo_fence_restricted: ['OPEC+ Nations'],
    dna_gating_required: false,
    asset_type: 'Crude Oil Futures',
    asset_weight: '1000 barrels',
    status: 'in_escrow',
    listing_type: 'sale'
  },
  {
    id: 6,
    title: 'Debt Forgiveness Package',
    category: 'sovereign',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400',
    image_url: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400',
    gold_backing_grams: 500,
    goldBacking: 500,
    price_ggg: 500,
    price: 500,
    creator_id: 'crownflame@gaia.io',
    creator_name: 'CrownFlame.office',
    owner_id: 'frank@gaia.io',
    verified: true,
    rarity: 'mythic',
    description: 'Sovereign-backed debt relief instrument. Redeemable against qualifying debt obligations.',
    ucc_filing: 'UCC-2025-SOV-000144',
    serial_number: 'DFP-144-2025',
    custody_state: 'vault_secured',
    custody_location: 'Global Sovereign Treasury',
    geo_fence_zones: ['Treaty Nations'],
    geo_fence_restricted: ['Non-Signatory Nations'],
    dna_gating_required: true,
    dna_authority_ids: ['frank@gaia.io'],
    asset_type: 'Sovereign Instrument',
    programmable_restrictions: {
      min_hold_days: 180,
      requires_kyc: true
    },
    status: 'listed',
    listing_type: 'sale'
  },
  {
    id: 7,
    title: 'Organic Coffee Harvest 2025',
    category: 'agriculture',
    image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400',
    image_url: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400',
    gold_backing_grams: 25,
    goldBacking: 25,
    price_ggg: 25,
    price: 25,
    creator_id: 'gaiafarms@gaia.io',
    creator_name: 'GaiaFarms.coop',
    owner_id: 'grace@gaia.io',
    verified: true,
    rarity: 'rare',
    description: '500kg organic Arabica coffee beans from Costa Rica highlands. Fair trade certified.',
    ucc_filing: 'UCC-2025-AGRI-003321',
    serial_number: 'COF-500-2025',
    custody_state: 'vault_secured',
    custody_location: 'San Jose Bonded Warehouse',
    location: 'Costa Rica',
    geo_fence_zones: ['Americas', 'European Union', 'Asia Pacific'],
    geo_fence_restricted: [],
    dna_gating_required: false,
    asset_type: 'Agricultural Commodity',
    asset_weight: '500 kg',
    asset_purity: 'Organic Certified',
    status: 'listed',
    listing_type: 'barter',
    barter_accepted_assets: ['GGG', 'Gold Bars', 'Other Agricultural']
  },
  {
    id: 8,
    title: '1kg Gold Bar - Perth Mint',
    category: 'commodities',
    image: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=400',
    image_url: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=400',
    gold_backing_grams: 1000,
    goldBacking: 1000,
    price_ggg: 1000,
    price: 1000,
    creator_id: 'perthmint@gaia.io',
    creator_name: 'PerthMint.gov.au',
    owner_id: 'henry@gaia.io',
    verified: true,
    rarity: 'legendary',
    description: '1 kilogram gold bar, Perth Mint certified. 99.99% purity with serial number.',
    ucc_filing: 'UCC-2025-GOLD-000001',
    serial_number: 'PM-1KG-2025-0001',
    custody_state: 'vault_secured',
    custody_location: 'Perth Mint Vault, Australia',
    location: 'Perth, Australia',
    geo_fence_zones: ['Australia', 'Singapore', 'Switzerland', 'United States', 'United Kingdom'],
    geo_fence_restricted: ['OFAC Sanctioned Nations'],
    dna_gating_required: true,
    dna_authority_ids: ['henry@gaia.io'],
    asset_type: 'Gold Bullion',
    asset_weight: '1000 grams',
    asset_purity: '99.99%',
    certification_proofs: ['https://perthmint.com/verify/PM-1KG-2025-0001'],
    proof_of_reserve: 'https://vault.gaia.io/gold/PM-1KG-2025-0001',
    status: 'listed',
    listing_type: 'sale'
  },
];

const RARITY_STYLES = {
  common: 'bg-slate-100 text-slate-700 border-slate-300',
  rare: 'bg-blue-100 text-blue-700 border-blue-300',
  epic: 'bg-purple-100 text-purple-700 border-purple-300',
  legendary: 'bg-amber-100 text-amber-700 border-amber-300',
  mythic: 'bg-rose-100 text-rose-700 border-rose-300',
};

function NeoNFTCard({ nft, onClick, theme = 'lime' }) {
  const categoryIcon = NEO_NFT_CATEGORIES.find(c => c.id === nft.category)?.icon || Sparkles;
  const Icon = categoryIcon;

  return (
    <Card 
      className={`bg-black/40 border border-${theme}-500/20 backdrop-blur-xl overflow-hidden cursor-pointer hover:border-${theme}-500/50 transition-all group`}
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img src={nft.image_url || nft.image} alt={nft.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-2">
          <Badge className={RARITY_STYLES[nft.rarity]}>
            {nft.rarity}
          </Badge>
          {(nft.escrow || nft.status === 'in_escrow') && (
            <Badge className="bg-orange-100 text-orange-700 border-orange-300">
              <Lock className="w-3 h-3 mr-1" />
              Escrow
            </Badge>
          )}
          {nft.listing_type === 'barter' && (
            <Badge className="bg-purple-100 text-purple-700 border-purple-300">
              <Package className="w-3 h-3 mr-1" />
              Barter
            </Badge>
          )}
        </div>

        {nft.verified && (
          <div className="absolute top-2 right-2">
            <Badge className={`bg-${theme}-500/20 text-${theme}-400 border-${theme}-500/40`}>
              <CheckCircle className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          </div>
        )}

        {/* Gold Backing Badge */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-amber-500/90 text-black px-2 py-1 rounded-full text-xs font-bold">
          <Coins className="w-3 h-3" />
          {nft.gold_backing_grams || nft.goldBacking}g Au
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate">{nft.title}</h3>
            <p className="text-xs text-gray-400 line-clamp-2 mt-1">{nft.description}</p>
          </div>
          <Icon className={`w-5 h-5 text-${theme}-400 shrink-0`} />
        </div>

        {/* Metadata */}
        <div className="space-y-1.5 text-xs">
          {nft.location && (
            <div className="flex items-center gap-1.5 text-gray-400">
              <MapPin className="w-3 h-3" />
              {nft.location}
            </div>
          )}
          {(nft.escrow || nft.status === 'in_escrow') && nft.escrowExpiry && (
            <div className="flex items-center gap-1.5 text-orange-400">
              <Calendar className="w-3 h-3" />
              Escrow until {nft.escrowExpiry}
            </div>
          )}
          {nft.geo_fence_zones?.length > 0 && (
            <div className="flex items-center gap-1.5 text-green-400">
              <Globe className="w-3 h-3" />
              {nft.geo_fence_zones.length} trading zones
            </div>
          )}
          <div className="flex items-center gap-1.5 text-gray-500">
            <FileText className="w-3 h-3" />
            {nft.ucc_filing}
          </div>
        </div>

        {/* Price */}
        <div className="pt-3 border-t border-gray-800/50">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-400">Floor Price</div>
              <div className={`text-lg font-bold text-${theme}-400 font-mono`}>
                {(nft.price_ggg || nft.price).toLocaleString()} GGG
              </div>
              <div className="text-xs text-gray-500">
                ≈ ${((nft.price_ggg || nft.price) * 145).toLocaleString()} USD
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                className="border-purple-500/40 text-purple-400 hover:bg-purple-500/10"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  window.location.href = createPageUrl('NeoNFTProvenance') + `?id=${nft.id}`;
                }}
              >
                <History className="w-3 h-3" />
              </Button>
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-lime-500 to-emerald-500 hover:from-lime-400 hover:to-emerald-400 text-black font-semibold"
                onClick={(e) => { e.stopPropagation(); }}
              >
                Trade
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function NeoNFTMarketplace({ theme = 'lime' }) {
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortField, setSortField] = useState('price_ggg');
  const [sortDirection, setSortDirection] = useState('desc');

  const filtered = MOCK_NEO_NFTS
    .filter(nft => {
      const catMatch = category === 'all' || nft.category === category;
      const searchMatch = !search || 
        nft.title.toLowerCase().includes(search.toLowerCase()) ||
        nft.ucc_filing?.toLowerCase().includes(search.toLowerCase()) ||
        nft.description?.toLowerCase().includes(search.toLowerCase());
      return catMatch && searchMatch;
    })
    .sort((a, b) => {
      const aVal = a[sortField] || a.price || 0;
      const bVal = b[sortField] || b.price || 0;
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });

  const handleSort = (field, direction) => {
    setSortField(field);
    setSortDirection(direction);
  };

  // Calculate totals
  const totalGoldBacking = MOCK_NEO_NFTS.reduce((sum, n) => sum + (n.gold_backing_grams || n.goldBacking || 0), 0);
  const activeEscrows = MOCK_NEO_NFTS.filter(n => n.escrow || n.status === 'in_escrow').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className={`bg-black/40 border border-${theme}-500/20 backdrop-blur-xl p-4`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Shield className={`w-6 h-6 text-${theme}-400`} />
              Neo-NFT Marketplace
            </h2>
            <p className="text-xs text-gray-400 mt-1">Resource-backed digital titles • Sacred-Digital Bridge • Geo-Fenced Trading</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`bg-amber-500/20 text-amber-400 border-amber-500/30`}>
              <Coins className="w-3 h-3 mr-1" />
              Gold-Anchored
            </Badge>
            {/* View Toggle */}
            <div className={`flex items-center gap-1 p-1 rounded-lg bg-black/40 border border-${theme}-500/20`}>
              <Button
                size="sm"
                variant="ghost"
                className={`h-7 w-7 p-0 ${viewMode === 'grid' ? `bg-${theme}-500/20 text-${theme}-400` : 'text-gray-400'}`}
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className={`h-7 w-7 p-0 ${viewMode === 'list' ? `bg-${theme}-500/20 text-${theme}-400` : 'text-gray-400'}`}
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Neo-NFTs by title, category, UCC filing, or description..."
            className={`pl-9 bg-black/40 border-${theme}-500/30 text-white`}
          />
        </div>
      </Card>

      {/* Category Filter */}
      <Tabs value={category} onValueChange={setCategory}>
        <TabsList className={`bg-black/60 border border-${theme}-500/20 p-1 flex-wrap h-auto`}>
          {NEO_NFT_CATEGORIES.map(cat => {
            const Icon = cat.icon;
            return (
              <TabsTrigger 
                key={cat.id}
                value={cat.id} 
                className={`data-[state=active]:bg-${theme}-500/20 data-[state=active]:text-${theme}-400 text-xs gap-1.5`}
              >
                <Icon className="w-3 h-3" />
                {cat.label}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className={`bg-black/40 border border-${theme}-500/20 p-3`}>
          <div className="text-xs text-gray-400">Total Titles</div>
          <div className={`text-xl font-bold text-${theme}-400`}>{MOCK_NEO_NFTS.length.toLocaleString()}</div>
        </Card>
        <Card className={`bg-black/40 border border-${theme}-500/20 p-3`}>
          <div className="text-xs text-gray-400">Total Gold Backing</div>
          <div className="text-xl font-bold text-amber-400">{(totalGoldBacking / 1000).toFixed(2)} kg</div>
        </Card>
        <Card className={`bg-black/40 border border-${theme}-500/20 p-3`}>
          <div className="text-xs text-gray-400">24h Volume</div>
          <div className={`text-xl font-bold text-white`}>142M GGG</div>
        </Card>
        <Card className={`bg-black/40 border border-${theme}-500/20 p-3`}>
          <div className="text-xs text-gray-400">Active Escrows</div>
          <div className="text-xl font-bold text-orange-400">{activeEscrows}</div>
        </Card>
      </div>

      {/* Sort Controls (for list view) */}
      {viewMode === 'list' && (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <SortAsc className="w-3 h-3" />
          Sort by:
          <Button
            size="sm"
            variant="ghost"
            className={`h-6 text-xs ${sortField === 'price_ggg' ? `text-${theme}-400` : 'text-gray-400'}`}
            onClick={() => handleSort('price_ggg', sortDirection === 'asc' ? 'desc' : 'asc')}
          >
            Price
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className={`h-6 text-xs ${sortField === 'gold_backing_grams' ? `text-${theme}-400` : 'text-gray-400'}`}
            onClick={() => handleSort('gold_backing_grams', sortDirection === 'asc' ? 'desc' : 'asc')}
          >
            Gold Backing
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className={`h-6 text-xs ${sortField === 'title' ? `text-${theme}-400` : 'text-gray-400'}`}
            onClick={() => handleSort('title', sortDirection === 'asc' ? 'desc' : 'asc')}
          >
            Name
          </Button>
        </div>
      )}

      {/* NFT Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(nft => (
            <NeoNFTCard 
              key={nft.id} 
              nft={nft} 
              onClick={() => setSelectedNFT(nft)}
              theme={theme}
            />
          ))}
        </div>
      ) : (
        <NeoNFTListView
          nfts={filtered}
          onSelect={setSelectedNFT}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          theme={theme}
        />
      )}

      {filtered.length === 0 && (
        <Card className={`bg-black/40 border border-${theme}-500/20 backdrop-blur-xl p-12 text-center`}>
          <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No Neo-NFTs found</p>
        </Card>
      )}

      {/* Info Footer */}
      <Card className={`bg-gradient-to-br from-${theme}-500/10 to-purple-500/10 border border-${theme}-500/20 backdrop-blur-xl p-4`}>
        <div className="flex items-start gap-3">
          <Sparkles className={`w-5 h-5 text-${theme}-400 shrink-0 mt-0.5`} />
          <div className="flex-1">
            <h4 className="font-semibold text-white mb-1">What are Neo-NFTs?</h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              Neo-NFTs are <span className="text-amber-400 font-medium">Non-Fungible Titles</span> backed by real-world resources. 
              Each title is anchored to physical gold in the Gaia Global Treasury and perfected through UCC filings. 
              Trade art, land, commodities, and sovereign instruments with <span className={`text-${theme}-400 font-medium`}>perpetual authenticity</span> on StarChain.
              All titles feature <span className="text-green-400 font-medium">Geo-Fencing</span> for compliant cross-border trading.
            </p>
          </div>
        </div>
      </Card>

      {/* Detail Modal */}
      <NeoNFTDetailModal
        nft={selectedNFT}
        open={!!selectedNFT}
        onClose={() => setSelectedNFT(null)}
        theme={theme}
      />
    </div>
  );
}