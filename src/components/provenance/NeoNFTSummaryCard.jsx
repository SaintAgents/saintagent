import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Coins, MapPin, Shield, Fingerprint, Globe, Lock, CheckCircle 
} from 'lucide-react';

const RARITY_STYLES = {
  common: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
  rare: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  epic: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  legendary: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  mythic: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
};

export default function NeoNFTSummaryCard({ nft }) {
  if (!nft) {
    return (
      <Card className="bg-black/40 border border-gray-800 p-6">
        <div className="text-center text-gray-400">Loading Neo-NFT data...</div>
      </Card>
    );
  }

  return (
    <Card className="bg-black/40 border border-lime-500/20 overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Image */}
        <div className="md:w-64 h-48 md:h-auto relative">
          <img 
            src={nft.image_url} 
            alt={nft.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/80 hidden md:block" />
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className={RARITY_STYLES[nft.rarity]}>
              {nft.rarity}
            </Badge>
            {nft.verified && (
              <Badge className="bg-lime-500/20 text-lime-400 border-lime-500/40">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white">{nft.title}</h2>
              <p className="text-sm text-gray-400 mt-1">{nft.description}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-amber-400">
                <Coins className="w-4 h-4" />
                <span className="font-bold">{nft.gold_backing_grams}g Au</span>
              </div>
              <div className="text-xs text-gray-500">
                ${(nft.gold_backing_grams * 145).toLocaleString()} USD
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-xs text-gray-500 mb-1">Serial Number</div>
              <div className="text-white font-mono text-xs">{nft.serial_number || 'N/A'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">UCC Filing</div>
              <div className="text-white font-mono text-xs">{nft.ucc_filing || 'N/A'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Custody</div>
              <div className="text-white capitalize text-xs">{nft.custody_state?.replace(/_/g, ' ')}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Location</div>
              <div className="text-white text-xs flex items-center gap-1">
                <MapPin className="w-3 h-3 text-gray-400" />
                {nft.custody_location || nft.location || 'N/A'}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {nft.dna_gating_required && (
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/40">
                <Fingerprint className="w-3 h-3 mr-1" />
                DNA Gating
              </Badge>
            )}
            {nft.geo_fence_zones?.length > 0 && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/40">
                <Globe className="w-3 h-3 mr-1" />
                {nft.geo_fence_zones.length} Zones
              </Badge>
            )}
            {nft.status === 'in_escrow' && (
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/40">
                <Lock className="w-3 h-3 mr-1" />
                In Escrow
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}