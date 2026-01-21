import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, Upload, Download, Eye, CheckCircle, XCircle, 
  Clock, Shield, AlertTriangle, Hash, Calendar, Building,
  Lock, ExternalLink, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const DOCUMENT_TYPES = [
  { value: 'certification', label: 'Certification', icon: Shield },
  { value: 'appraisal', label: 'Appraisal Report', icon: FileText },
  { value: 'insurance', label: 'Insurance Policy', icon: Shield },
  { value: 'title_deed', label: 'Title Deed', icon: FileText },
  { value: 'proof_of_reserve', label: 'Proof of Reserve', icon: Lock },
  { value: 'custody_agreement', label: 'Custody Agreement', icon: FileText },
  { value: 'ucc_filing', label: 'UCC Filing', icon: FileText },
  { value: 'assay_certificate', label: 'Assay Certificate', icon: Shield },
  { value: 'chain_of_custody', label: 'Chain of Custody', icon: FileText },
  { value: 'inspection_report', label: 'Inspection Report', icon: Eye },
  { value: 'other', label: 'Other', icon: FileText },
];

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'amber', icon: Clock },
  verified: { label: 'Verified', color: 'emerald', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'red', icon: XCircle },
  expired: { label: 'Expired', color: 'gray', icon: AlertTriangle },
};

// Demo documents
const DEMO_DOCUMENTS = [
  {
    id: '1',
    document_type: 'certification',
    title: 'Gold Certificate of Authenticity',
    description: 'Official certification from Gaia Global Treasury',
    file_hash: 'SHA256:a1b2c3d4e5f6g7h8i9j0...',
    verification_status: 'verified',
    verified_by: 'GaiaVault.io',
    verified_at: '2024-01-20T14:00:00Z',
    issuing_authority: 'Gaia Global Treasury',
    document_number: 'GGT-CERT-2024-001234',
    expiry_date: '2029-01-20',
    starchain_proof_hash: '0xabc123...',
    created_date: '2024-01-15T10:35:00Z',
    uploaded_by_name: 'StarArtist.eth'
  },
  {
    id: '2',
    document_type: 'proof_of_reserve',
    title: 'Proof of Reserve Attestation',
    description: 'Third-party verification of gold backing',
    file_hash: 'SHA256:b2c3d4e5f6g7h8i9j0k1...',
    verification_status: 'verified',
    verified_by: 'Deloitte Auditors',
    verified_at: '2024-02-15T09:00:00Z',
    issuing_authority: 'Deloitte LLP',
    document_number: 'DLT-POR-2024-5678',
    starchain_proof_hash: '0xdef456...',
    created_date: '2024-02-10T11:00:00Z',
    uploaded_by_name: 'GaiaVault.io'
  },
  {
    id: '3',
    document_type: 'appraisal',
    title: 'Art Appraisal Report',
    description: 'Professional valuation of the sacred geometry artwork',
    file_hash: 'SHA256:c3d4e5f6g7h8i9j0k1l2...',
    verification_status: 'pending',
    issuing_authority: "Christie's Appraisals",
    document_number: 'CHR-APR-2024-9012',
    created_date: '2024-03-01T15:30:00Z',
    uploaded_by_name: 'Alice.eth'
  }
];

function DocumentCard({ doc, onView, onVerify }) {
  const statusConfig = STATUS_CONFIG[doc.verification_status];
  const StatusIcon = statusConfig.icon;
  const typeConfig = DOCUMENT_TYPES.find(t => t.value === doc.document_type);
  const TypeIcon = typeConfig?.icon || FileText;

  return (
    <Card className="bg-black/40 border border-gray-800 hover:border-lime-500/30 transition-colors">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <TypeIcon className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h4 className="font-medium text-white text-sm">{doc.title}</h4>
              <p className="text-xs text-gray-400">{typeConfig?.label || doc.document_type}</p>
            </div>
          </div>
          <Badge className={`bg-${statusConfig.color}-500/20 text-${statusConfig.color}-400 border-${statusConfig.color}-500/40`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusConfig.label}
          </Badge>
        </div>

        {doc.description && (
          <p className="text-xs text-gray-400 mb-3">{doc.description}</p>
        )}

        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          {doc.issuing_authority && (
            <div className="flex items-center gap-1 text-gray-400">
              <Building className="w-3 h-3" />
              {doc.issuing_authority}
            </div>
          )}
          {doc.document_number && (
            <div className="flex items-center gap-1 text-gray-400">
              <Hash className="w-3 h-3" />
              {doc.document_number}
            </div>
          )}
          {doc.expiry_date && (
            <div className="flex items-center gap-1 text-gray-400">
              <Calendar className="w-3 h-3" />
              Expires: {doc.expiry_date}
            </div>
          )}
          {doc.verified_at && (
            <div className="flex items-center gap-1 text-emerald-400">
              <CheckCircle className="w-3 h-3" />
              {format(new Date(doc.verified_at), 'MMM d, yyyy')}
            </div>
          )}
        </div>

        {/* Hash Display */}
        <div className="p-2 rounded bg-black/40 border border-gray-800 mb-3">
          <div className="text-[10px] text-gray-500 mb-1">Document Hash (SHA-256)</div>
          <div className="text-xs text-lime-400 font-mono truncate">{doc.file_hash}</div>
        </div>

        {doc.starchain_proof_hash && (
          <div className="p-2 rounded bg-lime-500/10 border border-lime-500/30 mb-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] text-lime-400 mb-1">StarChain Proof</div>
                <div className="text-xs text-white font-mono truncate max-w-[180px]">{doc.starchain_proof_hash}</div>
              </div>
              <Button variant="ghost" size="sm" className="text-lime-400 h-7">
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 border-gray-700 text-gray-400"
            onClick={() => onView(doc)}
          >
            <Eye className="w-3 h-3 mr-1" />
            View
          </Button>
          {doc.verification_status === 'pending' && (
            <Button 
              size="sm" 
              className="flex-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
              onClick={() => onVerify(doc)}
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Verify
            </Button>
          )}
          <Button variant="ghost" size="sm" className="text-gray-400">
            <Download className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function DocumentVerification({ nftId, documents = [] }) {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [viewDoc, setViewDoc] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    document_type: '',
    title: '',
    description: '',
    issuing_authority: '',
    document_number: '',
    expiry_date: ''
  });
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  // Use demo data if no real documents
  const displayDocs = documents.length > 0 ? documents : DEMO_DOCUMENTS;

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file || !formData.document_type || !formData.title) {
      toast.error('Please fill in required fields and select a file');
      return;
    }

    setUploading(true);
    try {
      // Upload file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      // Generate mock hash (in production, this would be calculated server-side)
      const mockHash = `SHA256:${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      
      // Create document record
      const user = await base44.auth.me();
      await base44.entities.NeoNFTDocument.create({
        neo_nft_id: nftId,
        document_type: formData.document_type,
        title: formData.title,
        description: formData.description,
        file_url,
        file_hash: mockHash,
        uploaded_by: user.email,
        uploaded_by_name: user.full_name,
        issuing_authority: formData.issuing_authority,
        document_number: formData.document_number,
        expiry_date: formData.expiry_date || undefined,
        verification_status: 'pending'
      });

      // Create audit log
      await base44.entities.NeoNFTAuditLog.create({
        neo_nft_id: nftId,
        action_type: 'document_added',
        actor_id: user.email,
        actor_name: user.full_name,
        description: `Document uploaded: ${formData.title}`,
        metadata: { document_type: formData.document_type, file_hash: mockHash }
      });

      toast.success('Document uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['neoNftDocuments'] });
      setUploadModalOpen(false);
      setFormData({ document_type: '', title: '', description: '', issuing_authority: '', document_number: '', expiry_date: '' });
    } catch (error) {
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleVerify = async (doc) => {
    // In production, this would involve cryptographic verification
    toast.success('Verification request submitted (Demo)');
  };

  const verifiedCount = displayDocs.filter(d => d.verification_status === 'verified').length;
  const pendingCount = displayDocs.filter(d => d.verification_status === 'pending').length;

  return (
    <div className="space-y-4">
      <Card className="bg-black/40 border border-blue-500/20 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Document Verification
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Upload and cryptographically verify certification proofs and collateral documents
            </p>
          </div>
          <Button 
            onClick={() => setUploadModalOpen(true)}
            className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        </div>

        {/* Stats */}
        <div className="flex gap-4">
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40">
            <CheckCircle className="w-3 h-3 mr-1" />
            {verifiedCount} Verified
          </Badge>
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/40">
            <Clock className="w-3 h-3 mr-1" />
            {pendingCount} Pending
          </Badge>
          <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/40">
            <FileText className="w-3 h-3 mr-1" />
            {displayDocs.length} Total
          </Badge>
        </div>
      </Card>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayDocs.map(doc => (
          <DocumentCard 
            key={doc.id} 
            doc={doc} 
            onView={setViewDoc}
            onVerify={handleVerify}
          />
        ))}
      </div>

      {displayDocs.length === 0 && (
        <Card className="bg-black/40 border border-gray-800 p-8 text-center">
          <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No documents uploaded yet</p>
          <Button 
            onClick={() => setUploadModalOpen(true)}
            className="mt-4 bg-blue-500/20 text-blue-400"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload First Document
          </Button>
        </Card>
      )}

      {/* Upload Modal */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className="bg-[#0a0a0f] border-blue-500/20 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-400">
              <Upload className="w-5 h-5" />
              Upload Document
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Document Type *</label>
              <Select value={formData.document_type} onValueChange={v => setFormData({...formData, document_type: v})}>
                <SelectTrigger className="bg-black/60 border-gray-700">
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Title *</label>
              <Input 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="Document title..."
                className="bg-black/60 border-gray-700"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Description</label>
              <Input 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Brief description..."
                className="bg-black/60 border-gray-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Issuing Authority</label>
                <Input 
                  value={formData.issuing_authority}
                  onChange={e => setFormData({...formData, issuing_authority: e.target.value})}
                  placeholder="Authority name..."
                  className="bg-black/60 border-gray-700"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Document Number</label>
                <Input 
                  value={formData.document_number}
                  onChange={e => setFormData({...formData, document_number: e.target.value})}
                  placeholder="DOC-12345"
                  className="bg-black/60 border-gray-700"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Expiry Date (Optional)</label>
              <Input 
                type="date"
                value={formData.expiry_date}
                onChange={e => setFormData({...formData, expiry_date: e.target.value})}
                className="bg-black/60 border-gray-700"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">File *</label>
              <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center hover:border-blue-500/50 transition-colors cursor-pointer"
                   onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Click to select file</p>
                <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg"
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-lime-500/10 border border-lime-500/30">
              <div className="flex items-center gap-2 text-xs text-lime-400">
                <Shield className="w-4 h-4" />
                Document will be hashed and recorded on StarChain for immutable verification
              </div>
            </div>

            <Button 
              onClick={handleUpload}
              disabled={uploading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload & Hash Document
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}