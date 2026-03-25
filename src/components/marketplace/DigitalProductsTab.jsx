import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Download, FileText, Package, Star, Search, Plus, ShoppingCart,
  BookOpen, Wrench, Music, Video, Layers, Tag, Upload, Coins, Eye
} from "lucide-react";

const PRODUCT_ICONS = {
  course: BookOpen, template: FileText, ebook: BookOpen, guide: FileText,
  toolkit: Wrench, audio: Music, video: Video, bundle: Layers, other: Package
};

const CATEGORY_LABELS = {
  spiritual: 'Spiritual', business: 'Business', creative: 'Creative',
  wellness: 'Wellness', technology: 'Technology',
  personal_development: 'Personal Development', other: 'Other'
};

function ProductCard({ product, currentUser, onPurchase }) {
  const Icon = PRODUCT_ICONS[product.product_type] || Package;
  const isOwner = currentUser?.email === product.creator_id;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all group">
      <div className="relative h-40 bg-gradient-to-br from-violet-100 to-purple-100 overflow-hidden">
        {product.cover_image_url ? (
          <img src={product.cover_image_url} alt={product.title} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Icon className="w-16 h-16 text-violet-300" />
          </div>
        )}
        <Badge className="absolute top-2 left-2 bg-white/90 text-slate-700 capitalize text-xs">
          {product.product_type}
        </Badge>
        {product.compare_at_price_ggg > product.price_ggg && (
          <Badge className="absolute top-2 right-2 bg-rose-500 text-white text-xs">
            {Math.round((1 - product.price_ggg / product.compare_at_price_ggg) * 100)}% OFF
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-slate-900 mb-1 line-clamp-1">{product.title}</h3>
        <p className="text-xs text-slate-500 mb-2 line-clamp-2">{product.description}</p>
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className="text-xs capitalize">{CATEGORY_LABELS[product.category] || product.category}</Badge>
          {product.rating && (
            <div className="flex items-center gap-0.5 text-amber-500">
              <Star className="w-3 h-3 fill-current" />
              <span className="text-xs">{product.rating.toFixed(1)}</span>
            </div>
          )}
          <span className="text-xs text-slate-400 ml-auto flex items-center gap-1">
            <Download className="w-3 h-3" />{product.sales_count || 0}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-slate-900">{product.price_ggg} GGG</span>
            {product.compare_at_price_ggg > product.price_ggg && (
              <span className="text-xs text-slate-400 line-through">{product.compare_at_price_ggg}</span>
            )}
          </div>
          {isOwner ? (
            <Badge variant="outline" className="text-xs">Your Product</Badge>
          ) : (
            <Button size="sm" className="rounded-lg bg-violet-600 hover:bg-violet-700 gap-1.5 h-8" onClick={() => onPurchase(product)}>
              <ShoppingCart className="w-3.5 h-3.5" />
              Get
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DigitalProductsTab() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [productType, setProductType] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ title: '', description: '', product_type: 'template', category: 'business', price_ggg: 10, features: '' });
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me(), staleTime: 300000 });
  const { data: profiles = [] } = useQuery({
    queryKey: ['myProfile', currentUser?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_id: currentUser.email }, '-updated_date', 1),
    enabled: !!currentUser?.email, staleTime: 1800000
  });
  const profile = profiles?.[0];

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['digitalProducts'],
    queryFn: () => base44.entities.DigitalProduct.filter({ status: 'active' }, '-created_date', 50),
    staleTime: 120000
  });

  const filtered = products.filter(p => {
    const searchMatch = !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase());
    const catMatch = category === 'all' || p.category === category;
    const typeMatch = productType === 'all' || p.product_type === productType;
    return searchMatch && catMatch && typeMatch;
  });

  const handleCreate = async () => {
    if (!currentUser || !newProduct.title) return;
    await base44.entities.DigitalProduct.create({
      creator_id: currentUser.email,
      creator_name: profile?.display_name || currentUser.full_name,
      creator_avatar: profile?.avatar_url,
      title: newProduct.title,
      description: newProduct.description,
      product_type: newProduct.product_type,
      category: newProduct.category,
      price_ggg: Number(newProduct.price_ggg) || 10,
      features: newProduct.features ? newProduct.features.split('\n').filter(Boolean) : [],
      status: 'active',
      visibility: 'public'
    });
    queryClient.invalidateQueries({ queryKey: ['digitalProducts'] });
    setCreateOpen(false);
    setNewProduct({ title: '', description: '', product_type: 'template', category: 'business', price_ggg: 10, features: '' });
  };

  const handlePurchase = async (product) => {
    if (!currentUser) return;
    await base44.entities.ProductPurchase.create({
      product_id: product.id,
      buyer_id: currentUser.email,
      buyer_name: profile?.display_name || currentUser.full_name,
      seller_id: product.creator_id,
      price_ggg: product.price_ggg,
      status: 'completed'
    });
    await base44.entities.DigitalProduct.update(product.id, {
      sales_count: (product.sales_count || 0) + 1,
      total_revenue_ggg: (product.total_revenue_ggg || 0) + product.price_ggg
    });
    // Notify seller
    await base44.entities.Notification.create({
      user_id: product.creator_id,
      type: 'digital_product',
      title: `New sale: ${product.title}`,
      message: `${profile?.display_name || 'Someone'} purchased your product for ${product.price_ggg} GGG`,
      source_user_id: currentUser.email,
      source_user_name: profile?.display_name,
      source_user_avatar: profile?.avatar_url
    });
    queryClient.invalidateQueries({ queryKey: ['digitalProducts'] });
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search digital products..." className="pl-9 rounded-xl bg-white" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-40 rounded-xl bg-white"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={productType} onValueChange={setProductType}>
          <SelectTrigger className="w-36 rounded-xl bg-white"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="template">Templates</SelectItem>
            <SelectItem value="ebook">eBooks</SelectItem>
            <SelectItem value="guide">Guides</SelectItem>
            <SelectItem value="toolkit">Toolkits</SelectItem>
            <SelectItem value="course">Courses</SelectItem>
            <SelectItem value="audio">Audio</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="bundle">Bundles</SelectItem>
          </SelectContent>
        </Select>
        <Button className="rounded-xl bg-violet-600 hover:bg-violet-700 gap-2" onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4" />
          Sell Product
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-64 bg-white rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No digital products yet</h3>
          <p className="text-slate-500 mb-4">Be the first to sell templates, guides, or toolkits</p>
          <Button className="rounded-xl bg-violet-600 hover:bg-violet-700" onClick={() => setCreateOpen(true)}>Create Product</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => <ProductCard key={p.id} product={p} currentUser={currentUser} onPurchase={handlePurchase} />)}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Sell a Digital Product</DialogTitle>
            <DialogDescription>Upload templates, guides, toolkits, or courses for the community.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Product title" value={newProduct.title} onChange={e => setNewProduct({...newProduct, title: e.target.value})} />
            <Textarea placeholder="Description..." rows={3} value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
            <div className="grid grid-cols-2 gap-3">
              <Select value={newProduct.product_type} onValueChange={v => setNewProduct({...newProduct, product_type: v})}>
                <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="template">Template</SelectItem>
                  <SelectItem value="ebook">eBook</SelectItem>
                  <SelectItem value="guide">Guide</SelectItem>
                  <SelectItem value="toolkit">Toolkit</SelectItem>
                  <SelectItem value="course">Course</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="bundle">Bundle</SelectItem>
                </SelectContent>
              </Select>
              <Select value={newProduct.category} onValueChange={v => setNewProduct({...newProduct, category: v})}>
                <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([k,v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-500" />
              <Input type="number" placeholder="Price (GGG)" value={newProduct.price_ggg} onChange={e => setNewProduct({...newProduct, price_ggg: e.target.value})} className="w-32" />
              <span className="text-sm text-slate-500">GGG</span>
            </div>
            <Textarea placeholder="Features (one per line)..." rows={3} value={newProduct.features} onChange={e => setNewProduct({...newProduct, features: e.target.value})} />
            <Button className="w-full rounded-xl bg-violet-600 hover:bg-violet-700" onClick={handleCreate} disabled={!newProduct.title}>
              <Upload className="w-4 h-4 mr-2" />
              Publish Product
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}