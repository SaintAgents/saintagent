import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Coins, Lock, CheckCircle, MapPin, Eye, ArrowUpDown,
  ChevronUp, ChevronDown
} from 'lucide-react';

const RARITY_STYLES = {
  common: 'bg-slate-500/20 text-slate-300',
  rare: 'bg-blue-500/20 text-blue-300',
  epic: 'bg-purple-500/20 text-purple-300',
  legendary: 'bg-amber-500/20 text-amber-300',
  mythic: 'bg-rose-500/20 text-rose-300',
};

export default function NeoNFTListView({ 
  nfts, 
  onSelect, 
  sortField, 
  sortDirection, 
  onSort,
  theme = 'lime' 
}) {
  const handleSort = (field) => {
    if (sortField === field) {
      onSort(field, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(field, 'desc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-gray-600" />;
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-3 h-3 text-lime-400" />
      : <ChevronDown className="w-3 h-3 text-lime-400" />;
  };

  return (
    <div className="rounded-xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="bg-black/60 border-b border-gray-800 px-4 py-3 grid grid-cols-12 gap-4 text-xs font-medium text-gray-400">
        <div className="col-span-4 flex items-center gap-1 cursor-pointer hover:text-white" onClick={() => handleSort('title')}>
          Asset <SortIcon field="title" />
        </div>
        <div className="col-span-2 flex items-center gap-1 cursor-pointer hover:text-white" onClick={() => handleSort('gold_backing_grams')}>
          Gold <SortIcon field="gold_backing_grams" />
        </div>
        <div className="col-span-2 flex items-center gap-1 cursor-pointer hover:text-white" onClick={() => handleSort('price_ggg')}>
          Price <SortIcon field="price_ggg" />
        </div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2 text-right">Action</div>
      </div>

      {/* List */}
      <ScrollArea className="h-[400px]">
        {nfts.map((nft) => (
          <div 
            key={nft.id}
            className="px-4 py-3 grid grid-cols-12 gap-4 items-center border-b border-gray-800/50 hover:bg-black/40 transition-colors cursor-pointer"
            onClick={() => onSelect(nft)}
          >
            {/* Asset */}
            <div className="col-span-4 flex items-center gap-3">
              <img 
                src={nft.image_url || nft.image} 
                alt={nft.title}
                className="w-10 h-10 rounded-lg object-cover"
              />
              <div className="min-w-0">
                <div className="text-sm font-medium text-white truncate">{nft.title}</div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Badge className={`${RARITY_STYLES[nft.rarity]} text-[10px] px-1.5 py-0`}>
                    {nft.rarity}
                  </Badge>
                  {nft.location && (
                    <span className="flex items-center gap-0.5">
                      <MapPin className="w-2.5 h-2.5" />
                      {nft.location?.split(',')[0]}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Gold Backing */}
            <div className="col-span-2">
              <div className="flex items-center gap-1 text-amber-400">
                <Coins className="w-3 h-3" />
                <span className="font-mono text-sm">{nft.gold_backing_grams || nft.goldBacking}g</span>
              </div>
              <div className="text-xs text-gray-500">
                ${((nft.gold_backing_grams || nft.goldBacking) * 145).toLocaleString()}
              </div>
            </div>

            {/* Price */}
            <div className="col-span-2">
              <div className={`font-mono text-sm text-${theme}-400`}>
                {(nft.price_ggg || nft.price).toLocaleString()} GGG
              </div>
              <div className="text-xs text-gray-500">
                ${((nft.price_ggg || nft.price) * 145).toLocaleString()}
              </div>
            </div>

            {/* Status */}
            <div className="col-span-2 flex flex-wrap gap-1">
              {nft.verified && (
                <Badge className={`bg-${theme}-500/20 text-${theme}-400 text-[10px] px-1.5 py-0`}>
                  <CheckCircle className="w-2.5 h-2.5 mr-0.5" />
                  Verified
                </Badge>
              )}
              {(nft.status === 'in_escrow' || nft.escrow) && (
                <Badge className="bg-orange-500/20 text-orange-400 text-[10px] px-1.5 py-0">
                  <Lock className="w-2.5 h-2.5 mr-0.5" />
                  Escrow
                </Badge>
              )}
              {nft.listing_type === 'barter' && (
                <Badge className="bg-purple-500/20 text-purple-400 text-[10px] px-1.5 py-0">
                  Barter
                </Badge>
              )}
            </div>

            {/* Action */}
            <div className="col-span-2 text-right">
              <Button 
                size="sm" 
                variant="ghost"
                className={`text-${theme}-400 hover:bg-${theme}-500/10`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(nft);
                }}
              >
                <Eye className="w-3 h-3 mr-1" />
                View
              </Button>
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
}