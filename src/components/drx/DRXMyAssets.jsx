import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Plus, FileText, Music, Video, Image as ImageIcon, BookOpen, Brain, Mic, 
  Upload, Eye, Share2, Trash2, MoreHorizontal, Lock, Globe, Sparkles, Loader2
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ASSET_TYPES = [
  { value: 'document', label: 'Document', icon: FileText },
  { value: 'audio', label: 'Audio', icon: Music },
  { value: 'video', label: 'Video', icon: Video },
  { value: 'image', label: 'Image', icon: ImageIcon },
  { value: 'course', label: 'Course', icon: BookOpen },
  { value: 'prompt_pack', label: 'AI Prompt Pack', icon: Brain },
  { value: 'advisory', label: 'Advisory Session', icon: Mic },
  { value: 'research', label: 'Research Paper', icon: FileText },
  { value: 'knowledge_vault', label: 'Knowledge Vault', icon: Lock }
];

const LICENSE_TYPES = [
  { value: 'all_rights_reserved', label: 'All Rights Reserved' },
  { value: 'copy_left', label: 'Copy-Left' },
  { value: 'creative_commons', label: 'Creative Commons' },
  { value: 'custom', label: 'Custom License' }
];

export default function DRXMyAssets({ assets, profile, currentUser, onCreateGrant }) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    asset_type: 'document',
    base_license: 'all_rights_reserved',
    is_public: false,
    tags: ''
  });
  const [pendingFile, setPendingFile] = useState(null);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const handleAISuggest = async () => {
    if (!formData.title) {
      toast.error('Please enter a title first');
      return;
    }
    setAiGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are helping a user describe a digital asset they want to upload and license.

Asset title: "${formData.title}"
${pendingFile ? `File name: "${pendingFile.name}"` : ''}

Based on the title${pendingFile ? ' and file name' : ''}, generate:
1. A compelling description (2-3 sentences, professional tone, highlight value/uniqueness)
2. Suggest the best asset type from: document, audio, video, image, course, prompt_pack, advisory, research, knowledge_vault
3. Suggest relevant tags (3-5 keywords)
4. Suggest the best license: all_rights_reserved (for premium/restricted), copy_left (for open sharing), creative_commons (for attribution), custom (for specific terms)`,
        response_json_schema: {
          type: 'object',
          properties: {
            description: { type: 'string' },
            asset_type: { type: 'string' },
            tags: { type: 'string' },
            license: { type: 'string' }
          }
        }
      });
      
      const validTypes = ASSET_TYPES.map(t => t.value);
      const validLicenses = LICENSE_TYPES.map(l => l.value);
      
      setFormData(prev => ({
        ...prev,
        description: result.description || prev.description,
        asset_type: validTypes.includes(result.asset_type) ? result.asset_type : prev.asset_type,
        tags: result.tags || prev.tags,
        base_license: validLicenses.includes(result.license) ? result.license : prev.base_license
      }));
      toast.success('AI suggestions applied');
    } catch (e) {
      console.error('AI suggestion failed:', e);
      toast.error('AI suggestion failed');
    }
    setAiGenerating(false);
  };

  const createAssetMutation = useMutation({
    mutationFn: async (data) => {
      let file_url = null;
      if (pendingFile) {
        setUploading(true);
        const { file_url: url } = await base44.integrations.Core.UploadFile({ file: pendingFile });
        file_url = url;
      }
      
      await base44.entities.DRXAsset.create({
        ...data,
        file_url,
        owner_id: currentUser.email,
        owner_name: profile?.display_name,
        owner_avatar: profile?.avatar_url,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()) : []
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drxAssets'] });
      setUploadOpen(false);
      setFormData({ title: '', description: '', asset_type: 'document', base_license: 'all_rights_reserved', is_public: false, tags: '' });
      setPendingFile(null);
      setUploading(false);
      toast.success('Asset uploaded successfully');
    },
    onError: () => {
      setUploading(false);
      toast.error('Failed to upload asset');
    }
  });

  const deleteAssetMutation = useMutation({
    mutationFn: (id) => base44.entities.DRXAsset.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drxAssets'] });
      toast.success('Asset deleted');
    }
  });

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPendingFile(file);
    }
  };

  const getAssetIcon = (type) => {
    const config = ASSET_TYPES.find(t => t.value === type);
    return config?.icon || FileText;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">My Assets</h2>
          <p className="text-slate-400">Digital content you own and can grant access to</p>
        </div>
        <Button 
          className="bg-emerald-600 hover:bg-emerald-700 gap-2"
          onClick={() => setUploadOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Upload Asset
        </Button>
      </div>

      {assets.length === 0 ? (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="py-16 text-center">
            <Upload className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No assets yet</h3>
            <p className="text-slate-400 mb-6">Upload your first digital asset to start granting controlled access</p>
            <Button 
              className="bg-emerald-600 hover:bg-emerald-700 gap-2"
              onClick={() => setUploadOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Upload Your First Asset
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((asset) => {
            const Icon = getAssetIcon(asset.asset_type);
            return (
              <Card key={asset.id} className="bg-white/5 border-white/10 hover:border-emerald-500/30 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-emerald-400" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onCreateGrant?.(asset)}>
                          <Share2 className="w-4 h-4 mr-2" /> Grant Access
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deleteAssetMutation.mutate(asset.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <h3 className="font-semibold text-white mb-1 line-clamp-1">{asset.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">{asset.description || 'No description'}</p>

                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <Badge className="bg-indigo-500/20 text-indigo-300 text-xs">
                      {ASSET_TYPES.find(t => t.value === asset.asset_type)?.label}
                    </Badge>
                    {asset.is_public ? (
                      <Badge className="bg-emerald-500/20 text-emerald-300 text-xs">
                        <Globe className="w-3 h-3 mr-1" /> Public
                      </Badge>
                    ) : (
                      <Badge className="bg-slate-500/20 text-slate-300 text-xs">
                        <Lock className="w-3 h-3 mr-1" /> Private
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{asset.total_grants || 0} grants</span>
                    <span>{format(new Date(asset.created_date), 'MMM d, yyyy')}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload New Asset</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-slate-300">Title</Label>
              <Input 
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Asset title..."
                className="bg-slate-800 border-slate-600 text-white mt-1"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <Label className="text-slate-300">Description</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 gap-1 h-7"
                  onClick={handleAISuggest}
                  disabled={!formData.title || aiGenerating}
                >
                  {aiGenerating ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3" />
                  )}
                  AI Assist
                </Button>
              </div>
              <Textarea 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your asset..."
                className="bg-slate-800 border-slate-600 text-white"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Asset Type</Label>
                <Select value={formData.asset_type} onValueChange={(v) => setFormData({ ...formData, asset_type: v })}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSET_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300">License</Label>
                <Select value={formData.base_license} onValueChange={(v) => setFormData({ ...formData, base_license: v })}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LICENSE_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-slate-300">Tags (comma separated)</Label>
              <Input 
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="strategy, business, premium..."
                className="bg-slate-800 border-slate-600 text-white mt-1"
              />
            </div>

            <div>
              <Label className="text-slate-300">File</Label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "mt-1 border-2 border-dashed border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:border-emerald-500/50 transition-colors",
                  pendingFile && "border-emerald-500 bg-emerald-500/10"
                )}
              >
                <input 
                  ref={fileInputRef}
                  type="file" 
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {pendingFile ? (
                  <div>
                    <FileText className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    <p className="text-emerald-300 text-sm">{pendingFile.name}</p>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">Click to select file</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setUploadOpen(false)} className="border-slate-600 text-slate-300">
                Cancel
              </Button>
              <Button 
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => createAssetMutation.mutate(formData)}
                disabled={!formData.title || uploading || createAssetMutation.isPending}
              >
                {uploading ? 'Uploading...' : 'Upload Asset'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}