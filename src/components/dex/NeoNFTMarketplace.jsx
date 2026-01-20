import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Image, Landmark, Zap, FileText, Droplet, Diamond, 
  Shield, Lock, TrendingUp, Search, Filter, Star,
  Coins, MapPin, Calendar, CheckCircle, ArrowRight, Sparkles
} from 'lucide-react';

const NEO_NFT_CATEGORIES = [
  { id: 'all', label: 'All Assets', icon: Sparkles },
  { id: 'art', label: 'Art & Culture', icon: Image },
  { id: 'land', label: 'Land & Real Estate', icon: Landmark },
  { id: 'energy', label: 'Energy Credits', icon: Zap },
  { id: 'commodities', label: 'Commodities', icon: Diamond },
  { id: 'sovereign', label: 'Sovereign Instruments', icon: Shield },
];

const MOCK_NEO_NFTS = [
  {
    id: 1,
    title: 'Sacred Geometry #001',
    category: 'art',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400',
    goldBacking: 1.5,
    price: 4875.30,
    creator: 'StarArtist.eth',
    verified: true,
    rarity: 'legendary',
    description: 'Divine mandala with 1.5g gold certificate',
    ucc_filing: 'UCC-2024-ART-001234',
  },
  {
    id: 2,
    title: 'Arizona Land Parcel #42',
    category: 'land',
    image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400',
    goldBacking: 50,
    price: 162510,
    creator: 'SovereignLand.dao',
    verified: true,
    rarity: 'rare',
    description: '5-acre desert parcel with mineral rights',
    location: 'Sedona, AZ',
    ucc_filing: 'UCC-2024-LAND-008821',
  },
  {
    id: 3,
    title: 'Solar Credit Package',
    category: 'energy',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400',
    goldBacking: 10,
    price: 32502,
    creator: 'GaiaEnergy.org',
    verified: true,
    rarity: 'common',
    description: '1000 kWh renewable energy credits',
    ucc_filing: 'UCC-2025-ENERGY-002451',
  },
  {
    id: 4,
    title: 'Diamond Escrow Certificate',
    category: 'commodities',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
    goldBacking: 100,
    price: 325020,
    creator: 'CrownVault.io',
    verified: true,
    rarity: 'epic',
    description: '2.5 carat certified diamond in escrow',
    escrow: true,
    escrowExpiry: '2026-03-15',
    ucc_filing: 'UCC-2025-DIAMOND-009912',
  },
  {
    id: 5,
    title: 'Crude Oil Futures Title',
    category: 'commodities',
    image: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=400',
    goldBacking: 250,
    price: 812550,
    creator: 'EnergyTrust.sov',
    verified: true,
    rarity: 'legendary',
    description: '1000 barrels West Texas crude, vault-secured',
    escrow: true,
    escrowExpiry: '2026-06-30',
    ucc_filing: 'UCC-2025-OIL-011203',
  },
  {
    id: 6,
    title: 'Debt Forgiveness Package',
    category: 'sovereign',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400',
    goldBacking: 500,
    price: 1625100,
    creator: 'CrownFlame.office',
    verified: true,
    rarity: 'mythic',
    description: 'Sovereign-backed debt relief instrument',
    ucc_filing: 'UCC-2025-SOV-000144',
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
        <img src={nft.image} alt={nft.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-2">
          <Badge className={RARITY_STYLES[nft.rarity]}>
            {nft.rarity}
          </Badge>
          {nft.escrow && (
            <Badge className="bg-orange-100 text-orange-700 border-orange-300">
              <Lock className="w-3 h-3 mr-1" />
              Escrow
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
          {nft.goldBacking}g Au
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
          {nft.escrow && nft.escrowExpiry && (
            <div className="flex items-center gap-1.5 text-orange-400">
              <Calendar className="w-3 h-3" />
              Escrow until {nft.escrowExpiry}
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
                {nft.price.toLocaleString()} GGG
              </div>
            </div>
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
    </Card>
  );
}

export default function NeoNFTMarketplace({ theme = 'lime' }) {
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedNFT, setSelectedNFT] = useState(null);

  const filtered = MOCK_NEO_NFTS.filter(nft => {
    const catMatch = category === 'all' || nft.category === category;
    const searchMatch = !search || nft.title.toLowerCase().includes(search.toLowerCase());
    return catMatch && searchMatch;
  });

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
            <p className="text-xs text-gray-400 mt-1">Resource-backed digital titles • Sacred-Digital Bridge</p>
          </div>
          <Badge className={`bg-amber-500/20 text-amber-400 border-amber-500/30`}>
            <Coins className="w-3 h-3 mr-1" />
            Gold-Anchored
          </Badge>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Neo-NFTs by title, category, or UCC filing..."
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
          <div className={`text-xl font-bold text-${theme}-400`}>1,247</div>
        </Card>
        <Card className={`bg-black/40 border border-${theme}-500/20 p-3`}>
          <div className="text-xs text-gray-400">Total Gold Backing</div>
          <div className="text-xl font-bold text-amber-400">12.4 kg</div>
        </Card>
        <Card className={`bg-black/40 border border-${theme}-500/20 p-3`}>
          <div className="text-xs text-gray-400">24h Volume</div>
          <div className={`text-xl font-bold text-white`}>142M GGG</div>
        </Card>
        <Card className={`bg-black/40 border border-${theme}-500/20 p-3`}>
          <div className="text-xs text-gray-400">Active Escrows</div>
          <div className="text-xl font-bold text-orange-400">23</div>
        </Card>
      </div>

      {/* NFT Grid */}
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
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}