import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowLeft, Shield, History, FileText, Clock, MapPin, 
  Fingerprint, ExternalLink, CheckCircle, AlertTriangle,
  Upload, Download, Eye, Lock, Unlock, Globe, Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import ProvenanceTimeline from '@/components/provenance/ProvenanceTimeline';
import DocumentVerification from '@/components/provenance/DocumentVerification';
import AuditTrailLog from '@/components/provenance/AuditTrailLog';
import NeoNFTSummaryCard from '@/components/provenance/NeoNFTSummaryCard';

export default function NeoNFTProvenance() {
  const [activeTab, setActiveTab] = useState('timeline');
  
  // Get NFT ID from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const nftId = urlParams.get('id');

  // Fetch Neo-NFT data
  const { data: neoNfts, isLoading: nftLoading } = useQuery({
    queryKey: ['neoNft', nftId],
    queryFn: () => base44.entities.NeoNFT.filter({ id: nftId }),
    enabled: !!nftId
  });
  const neoNft = neoNfts?.[0];

  // Fetch audit logs
  const { data: auditLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['neoNftAuditLogs', nftId],
    queryFn: () => base44.entities.NeoNFTAuditLog.filter({ neo_nft_id: nftId }, '-created_date'),
    enabled: !!nftId
  });

  // Fetch documents
  const { data: documents = [], isLoading: docsLoading } = useQuery({
    queryKey: ['neoNftDocuments', nftId],
    queryFn: () => base44.entities.NeoNFTDocument.filter({ neo_nft_id: nftId }, '-created_date'),
    enabled: !!nftId
  });

  if (!nftId) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
        <Card className="bg-black/40 border border-red-500/30 p-8 text-center max-w-md mx-auto mt-20">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No Neo-NFT Selected</h2>
          <p className="text-gray-400 mb-4">Please select a Neo-NFT from the marketplace to view its provenance.</p>
          <Link to={createPageUrl('G3Dex')}>
            <Button className="bg-lime-500 text-black hover:bg-lime-400">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to G3Dex
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (nftLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-400" />
      </div>
    );
  }

  // Calculate stats
  const verifiedDocs = documents.filter(d => d.verification_status === 'verified').length;
  const complianceEvents = auditLogs.filter(l => l.compliance_relevant).length;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(0,255,100,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,100,0.03) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-lime-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-lime-500/20 bg-black/60 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('G3Dex')}>
              <Button variant="ghost" size="icon" className="text-lime-400 hover:bg-lime-500/10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-lime-400" />
                Provenance & Audit Trail
              </h1>
              <p className="text-xs text-gray-400">Complete history and verification for Neo-NFT assets</p>
            </div>
          </div>
          <Badge className="bg-lime-500/20 text-lime-400 border-lime-500/40">
            <Shield className="w-3 h-3 mr-1" />
            StarChain Verified
          </Badge>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* NFT Summary */}
        <NeoNFTSummaryCard nft={neoNft} />

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-black/40 border border-lime-500/20 p-4">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <Activity className="w-3 h-3" />
              Total Events
            </div>
            <div className="text-2xl font-bold text-lime-400">{auditLogs.length}</div>
          </Card>
          <Card className="bg-black/40 border border-lime-500/20 p-4">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <FileText className="w-3 h-3" />
              Documents
            </div>
            <div className="text-2xl font-bold text-blue-400">{documents.length}</div>
          </Card>
          <Card className="bg-black/40 border border-lime-500/20 p-4">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <CheckCircle className="w-3 h-3" />
              Verified Docs
            </div>
            <div className="text-2xl font-bold text-emerald-400">{verifiedDocs}</div>
          </Card>
          <Card className="bg-black/40 border border-lime-500/20 p-4">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <Shield className="w-3 h-3" />
              Compliance Events
            </div>
            <div className="text-2xl font-bold text-purple-400">{complianceEvents}</div>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-black/60 border border-lime-500/20">
            <TabsTrigger value="timeline" className="data-[state=active]:bg-lime-500/20 data-[state=active]:text-lime-400">
              <History className="w-4 h-4 mr-2" />
              Provenance Timeline
            </TabsTrigger>
            <TabsTrigger value="documents" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
              <FileText className="w-4 h-4 mr-2" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="audit" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
              <Shield className="w-4 h-4 mr-2" />
              Audit Trail
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="mt-6">
            <ProvenanceTimeline nft={neoNft} auditLogs={auditLogs} />
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <DocumentVerification nftId={nftId} documents={documents} />
          </TabsContent>

          <TabsContent value="audit" className="mt-6">
            <AuditTrailLog auditLogs={auditLogs} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}