import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  BookOpen, 
  FileText,
  Video,
  Headphones,
  Layers,
  Upload,
  Image,
  DollarSign,
  Eye,
  ShoppingCart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const PRODUCT_TYPES = [
  { value: 'course', label: 'Course', icon: BookOpen },
  { value: 'template', label: 'Template', icon: FileText },
  { value: 'ebook', label: 'E-Book', icon: BookOpen },
  { value: 'guide', label: 'Guide', icon: FileText },
  { value: 'toolkit', label: 'Toolkit', icon: Package },
  { value: 'audio', label: 'Audio', icon: Headphones },
  { value: 'video', label: 'Video', icon: Video },
  { value: 'bundle', label: 'Bundle', icon: Layers },
];

const CATEGORIES = [
  'spiritual', 'business', 'creative', 'wellness', 
  'technology', 'personal_development', 'other'
];

export default function DigitalProductManager({ profile }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const queryClient = useQueryClient();

  const { data: products = [] } = useQuery({
    queryKey: ['digitalProducts', profile?.user_id],
    queryFn: () => base44.entities.DigitalProduct.filter({ creator_id: profile?.user_id }),
    enabled: !!profile?.user_id
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.DigitalProduct.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digitalProducts'] });
      setModalOpen(false);
      setEditingProduct(null);
      toast.success('Product created!');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.DigitalProduct.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digitalProducts'] });
      setModalOpen(false);
      setEditingProduct(null);
      toast.success('Product updated!');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.DigitalProduct.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digitalProducts'] });
      toast.success('Product deleted');
    }
  });

  const handleCreate = () => {
    setEditingProduct({
      title: '',
      description: '',
      product_type: 'guide',
      price_ggg: 0,
      category: 'personal_development',
      features: [],
      tags: [],
      status: 'draft'
    });
    setModalOpen(true);
  };

  const getTypeIcon = (type) => {
    const t = PRODUCT_TYPES.find(p => p.value === type);
    return t ? t.icon : Package;
  };

  const totalRevenue = products.reduce((sum, p) => sum + (p.total_revenue_ggg || 0), 0);
  const totalSales = products.reduce((sum, p) => sum + (p.sales_count || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Digital Products</h2>
          <p className="text-slate-500 mt-1">Sell courses, templates, and more</p>
        </div>
        <Button onClick={handleCreate} className="bg-violet-600 hover:bg-violet-700 gap-2">
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <Package className="w-8 h-8 text-violet-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{products.length}</p>
              <p className="text-sm text-slate-500">Products</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <ShoppingCart className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{totalSales}</p>
              <p className="text-sm text-slate-500">Total Sales</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <DollarSign className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-2xl font-bold">{totalRevenue.toFixed(1)}</p>
              <p className="text-sm text-slate-500">GGG Earned</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">No digital products yet</p>
            <Button onClick={handleCreate} variant="outline">Create Your First Product</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {products.map((product) => {
            const TypeIcon = getTypeIcon(product.product_type);
            return (
              <Card key={product.id} className="overflow-hidden">
                <div className="flex">
                  {product.cover_image_url ? (
                    <img 
                      src={product.cover_image_url} 
                      alt={product.title}
                      className="w-32 h-32 object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                      <TypeIcon className="w-10 h-10 text-violet-400" />
                    </div>
                  )}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900">{product.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="capitalize">
                            {product.product_type}
                          </Badge>
                          <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                            {product.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => {
                            setEditingProduct(product);
                            setModalOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => deleteMutation.mutate(product.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-lg font-bold text-violet-600">
                        {product.price_ggg} GGG
                      </span>
                      <span className="text-sm text-slate-500">
                        {product.sales_count || 0} sales
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ProductEditModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
        profile={profile}
        onSave={(data) => {
          if (editingProduct?.id) {
            updateMutation.mutate({ id: editingProduct.id, data });
          } else {
            createMutation.mutate(data);
          }
        }}
      />
    </div>
  );
}

function ProductEditModal({ open, onClose, product, profile, onSave }) {
  const [formData, setFormData] = useState(product || {});
  const [newFeature, setNewFeature] = useState('');
  const [uploading, setUploading] = useState(false);

  React.useEffect(() => {
    if (product) setFormData(product);
  }, [product]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFormData({ ...formData, cover_image_url: file_url });
    setUploading(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFormData({ ...formData, file_url });
    setUploading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      creator_id: profile.user_id,
      creator_name: profile.display_name,
      creator_avatar: profile.avatar_url
    });
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...(formData.features || []), newFeature.trim()]
      });
      setNewFeature('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product?.id ? 'Edit' : 'Create'} Digital Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cover Image */}
          <div>
            <Label>Cover Image</Label>
            <div className="mt-2 flex items-center gap-4">
              {formData.cover_image_url ? (
                <img 
                  src={formData.cover_image_url} 
                  alt="Cover" 
                  className="w-24 h-24 object-cover rounded-lg"
                />
              ) : (
                <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Image className="w-8 h-8 text-slate-400" />
                </div>
              )}
              <label className="cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                <Button type="button" variant="outline" disabled={uploading}>
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </Button>
              </label>
            </div>
          </div>

          <div>
            <Label>Title</Label>
            <Input
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Complete Meditation Course"
              required
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What will buyers learn or receive..."
              className="min-h-24"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Product Type</Label>
              <Select
                value={formData.product_type}
                onValueChange={(v) => setFormData({ ...formData, product_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c} className="capitalize">
                      {c.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Price (GGG)</Label>
              <Input
                type="number"
                min="0"
                step="0.1"
                value={formData.price_ggg || ''}
                onChange={(e) => setFormData({ ...formData, price_ggg: parseFloat(e.target.value) })}
                required
              />
            </div>
            <div>
              <Label>Compare at Price (optional)</Label>
              <Input
                type="number"
                min="0"
                step="0.1"
                value={formData.compare_at_price_ggg || ''}
                onChange={(e) => setFormData({ ...formData, compare_at_price_ggg: parseFloat(e.target.value) })}
                placeholder="Original price for discount display"
              />
            </div>
          </div>

          {/* File Upload */}
          <div>
            <Label>Product File</Label>
            <div className="mt-2">
              <label className="cursor-pointer">
                <input type="file" className="hidden" onChange={handleFileUpload} />
                <Button type="button" variant="outline" disabled={uploading}>
                  <Upload className="w-4 h-4 mr-2" />
                  {formData.file_url ? 'Replace File' : 'Upload File'}
                </Button>
              </label>
              {formData.file_url && (
                <p className="text-xs text-emerald-600 mt-1">✓ File uploaded</p>
              )}
            </div>
          </div>

          {/* Features */}
          <div>
            <Label>What's Included</Label>
            <div className="space-y-2 mt-2">
              <div className="flex gap-2">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add a feature..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                />
                <Button type="button" onClick={addFeature} variant="outline">Add</Button>
              </div>
              <div className="space-y-1">
                {formData.features?.map((feature, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-50">
                    <span className="text-sm">{feature}</span>
                    <button
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        features: formData.features.filter((_, idx) => idx !== i)
                      })}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(v) => setFormData({ ...formData, status: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active (Published)</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-violet-600 hover:bg-violet-700">
              {product?.id ? 'Update' : 'Create'} Product
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}