import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Shield, MapPin, Calendar, FileText, Coins, Lock, CheckCircle, 
  AlertTriangle, Globe, Fingerprint, History, Package, Scale,
  ExternalLink, Copy, ArrowRight, X
} from 'lucide-react';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

const RARITY_STYLES = {
  common: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
  rare: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  epic: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  legendary: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  mythic: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
};

export default function NeoNFTDetailModal({ nft, open, onClose, theme = 'lime' }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!nft) return null;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-[#0a0a0f] border-lime-500/20 text-white p-0 overflow-hidden">
        <div className="flex flex-col lg:flex-row h-full">
          {/* Left: Image */}
          <div className="lg:w-2/5 relative">
            <img 
              src={nft.image_url || nft.image} 
              alt={nft.title} 
              className="w-full h-64 lg:h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            
            {/* Badges on image */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <Badge className={RARITY_STYLES[nft.rarity]}>
                {nft.rarity}
              </Badge>
              {nft.status === 'in_escrow' && (
                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/40">
                  <Lock className="w-3 h-3 mr-1" />
                  In Escrow
                </Badge>
              )}
              {nft.verified && (
                <Badge className={`bg-${theme}-500/20 text-${theme}-400 border-${theme}-500/40`}>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>

            {/* Gold backing */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center gap-2 bg-amber-500/90 text-black px-3 py-2 rounded-lg">
                <Coins className="w-4 h-4" />
                <span className="font-bold">{nft.gold_backing_grams || nft.goldBacking}g Au</span>
                <span className="text-amber-900">≈ ${((nft.gold_backing_grams || nft.goldBacking) * 145).toLocaleString()} USD</span>
              </div>
            </div>
          </div>

          {/* Right: Details */}
          <div className="lg:w-3/5 flex flex-col">
            <DialogHeader className="p-4 border-b border-gray-800">
              <div className="flex items-start justify-between">
                <div>
                  <DialogTitle className="text-xl font-bold text-white">{nft.title}</DialogTitle>
                  <p className="text-sm text-gray-400 mt-1">{nft.description}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="mx-4 mt-2 bg-black/40 border border-gray-800">
                <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                <TabsTrigger value="geofence" className="text-xs">Geo-Fencing</TabsTrigger>
                <TabsTrigger value="verification" className="text-xs">Verification</TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1 p-4">
                <TabsContent value="overview" className="mt-0 space-y-4">
                  {/* Price & Trade */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-lime-500/10 to-emerald-500/10 border border-lime-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-xs text-gray-400">Current Price</div>
                        <div className={`text-2xl font-bold text-${theme}-400 font-mono`}>
                          {(nft.price_ggg || nft.price).toLocaleString()} GGG
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link to={createPageUrl('NeoNFTProvenance') + `?id=${nft.id}`}>
                          <Button variant="outline" className="border-purple-500/40 text-purple-400">
                            <History className="w-4 h-4 mr-2" />
                            Full Provenance
                          </Button>
                        </Link>
                        <Button className={`bg-gradient-to-r from-${theme}-500 to-emerald-500 text-black font-semibold`}>
                          Trade Now
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                    {nft.listing_type === 'barter' && (
                      <div className="text-xs text-amber-400">
                        <Package className="w-3 h-3 inline mr-1" />
                        Also accepts barter: {nft.barter_accepted_assets?.join(', ') || 'Various assets'}
                      </div>
                    )}
                  </div>

                  {/* Asset Details */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      Asset Details
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="p-3 rounded-lg bg-black/40 border border-gray-800">
                        <div className="text-xs text-gray-500">Asset Type</div>
                        <div className="text-white">{nft.asset_type || nft.category}</div>
                      </div>
                      {nft.asset_weight && (
                        <div className="p-3 rounded-lg bg-black/40 border border-gray-800">
                          <div className="text-xs text-gray-500">Weight/Size</div>
                          <div className="text-white">{nft.asset_weight}</div>
                        </div>
                      )}
                      {nft.asset_purity && (
                        <div className="p-3 rounded-lg bg-black/40 border border-gray-800">
                          <div className="text-xs text-gray-500">Purity</div>
                          <div className="text-white">{nft.asset_purity}</div>
                        </div>
                      )}
                      <div className="p-3 rounded-lg bg-black/40 border border-gray-800">
                        <div className="text-xs text-gray-500">Custody State</div>
                        <div className="text-white capitalize">{nft.custody_state?.replace(/_/g, ' ') || 'Vault Secured'}</div>
                      </div>
                    </div>
                  </div>

                  {/* UCC Filing */}
                  <div className="p-3 rounded-lg bg-black/40 border border-gray-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          UCC Filing Reference
                        </div>
                        <div className="text-white font-mono text-sm">{nft.ucc_filing}</div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(nft.ucc_filing)}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Location */}
                  {(nft.location || nft.custody_location) && (
                    <div className="p-3 rounded-lg bg-black/40 border border-gray-800">
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Location
                      </div>
                      <div className="text-white">{nft.location || nft.custody_location}</div>
                    </div>
                  )}
                </TabsContent>



                <TabsContent value="geofence" className="mt-0 space-y-4">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-400" />
                    Geographic Restrictions
                  </h3>

                  {/* Permitted Zones */}
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                    <div className="text-xs text-green-400 font-medium mb-2 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Permitted Trading Zones
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(nft.geo_fence_zones || ['United States', 'European Union', 'Switzerland', 'Singapore']).map((zone, idx) => (
                        <Badge key={idx} className="bg-green-500/20 text-green-300 border-green-500/40">
                          {zone}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Restricted Zones */}
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                    <div className="text-xs text-red-400 font-medium mb-2 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Restricted Jurisdictions
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(nft.geo_fence_restricted || ['OFAC Sanctioned', 'North Korea', 'Iran']).map((zone, idx) => (
                        <Badge key={idx} className="bg-red-500/20 text-red-300 border-red-500/40">
                          {zone}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Programmable Restrictions */}
                  {nft.programmable_restrictions && (
                    <div className="p-4 rounded-lg bg-black/40 border border-gray-800">
                      <div className="text-xs text-gray-400 font-medium mb-2">Programmable Restrictions</div>
                      <div className="space-y-2 text-sm">
                        {nft.programmable_restrictions.min_hold_days && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Minimum Hold Period</span>
                            <span className="text-white">{nft.programmable_restrictions.min_hold_days} days</span>
                          </div>
                        )}
                        {nft.programmable_restrictions.max_transfers_per_year && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Max Transfers/Year</span>
                            <span className="text-white">{nft.programmable_restrictions.max_transfers_per_year}</span>
                          </div>
                        )}
                        {nft.programmable_restrictions.requires_kyc && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">KYC Required</span>
                            <span className="text-amber-400">Yes</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="verification" className="mt-0 space-y-4">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gray-400" />
                    Verification & Proofs
                  </h3>

                  {/* DNA Gating */}
                  <div className={`p-4 rounded-lg border ${nft.dna_gating_required ? 'bg-purple-500/10 border-purple-500/30' : 'bg-black/40 border-gray-800'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Fingerprint className={`w-4 h-4 ${nft.dna_gating_required ? 'text-purple-400' : 'text-gray-500'}`} />
                      <span className={`text-sm font-medium ${nft.dna_gating_required ? 'text-purple-300' : 'text-gray-400'}`}>
                        DNA Gating
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {nft.dna_gating_required 
                        ? 'Biometric verification required for transfers'
                        : 'No biometric verification required'
                      }
                    </div>
                  </div>

                  {/* Certification Proofs */}
                  {nft.certification_proofs?.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs text-gray-400">Certification Documents</div>
                      {nft.certification_proofs.map((proof, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-black/40 border border-gray-800 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-white">Certificate #{idx + 1}</span>
                          </div>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Proof of Reserve */}
                  {nft.proof_of_reserve && (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Scale className="w-4 h-4 text-amber-400" />
                          <span className="text-sm text-amber-300">Proof of Reserve</span>
                        </div>
                        <Button variant="ghost" size="sm" className="text-amber-400">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Verify
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}