import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  Package, 
  BookOpen, 
  FileText,
  Video,
  Headphones,
  Layers,
  Check,
  Coins,
  Star,
  Download,
  ShoppingCart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const PRODUCT_ICONS = {
  course: BookOpen,
  template: FileText,
  ebook: BookOpen,
  guide: FileText,
  toolkit: Package,
  audio: Headphones,
  video: Video,
  bundle: Layers,
  other: Package
};

export default function DigitalProductCard({ product, showPurchase = true }) {
  const [modalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ user_id: user.email });
      return profiles[0];
    }
  });

  const { data: purchases = [] } = useQuery({
    queryKey: ['myPurchases', currentUser?.email, product?.id],
    queryFn: () => base44.entities.ProductPurchase.filter({
      buyer_id: currentUser.email,
      product_id: product.id
    }),
    enabled: !!currentUser?.email && !!product?.id
  });

  const hasPurchased = purchases.some(p => p.status === 'completed');

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      if (userProfile.ggg_balance < product.price_ggg) {
        throw new Error('Insufficient GGG balance');
      }

      // Create purchase record
      const purchase = await base44.entities.ProductPurchase.create({
        buyer_id: currentUser.email,
        buyer_name: userProfile.display_name,
        buyer_avatar: userProfile.avatar_url,
        creator_id: product.creator_id,
        creator_name: product.creator_name,
        product_id: product.id,
        product_title: product.title,
        product_type: product.product_type,
        price_paid_ggg: product.price_ggg,
        status: 'completed',
        access_granted: true
      });

      // Deduct from buyer
      await base44.entities.UserProfile.update(userProfile.id, {
        ggg_balance: userProfile.ggg_balance - product.price_ggg
      });

      // Add to creator (85% after 15% platform fee)
      const creatorEarning = product.price_ggg * 0.85;
      const creatorProfiles = await base44.entities.UserProfile.filter({ user_id: product.creator_id });
      if (creatorProfiles[0]) {
        await base44.entities.UserProfile.update(creatorProfiles[0].id, {
          ggg_balance: (creatorProfiles[0].ggg_balance || 0) + creatorEarning,
          total_earnings: (creatorProfiles[0].total_earnings || 0) + creatorEarning
        });
      }

      // Update product stats
      await base44.entities.DigitalProduct.update(product.id, {
        sales_count: (product.sales_count || 0) + 1,
        total_revenue_ggg: (product.total_revenue_ggg || 0) + product.price_ggg
      });

      // Create transaction
      await base44.entities.GGGTransaction.create({
        user_id: currentUser.email,
        source_type: 'purchase',
        source_id: purchase.id,
        delta: -product.price_ggg,
        reason_code: 'product_purchase',
        description: `Purchased "${product.title}"`,
        balance_after: userProfile.ggg_balance - product.price_ggg
      });

      // Notify creator
      await base44.entities.Notification.create({
        user_id: product.creator_id,
        type: 'ggg',
        title: 'New Product Sale! 🎉',
        message: `${userProfile.display_name} purchased "${product.title}" for ${product.price_ggg} GGG`,
        source_user_id: currentUser.email,
        source_user_name: userProfile.display_name,
        source_user_avatar: userProfile.avatar_url
      });

      return purchase;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['myPurchases'] });
      queryClient.invalidateQueries({ queryKey: ['digitalProducts'] });
      toast.success('Purchase successful! You now have access.');
      setModalOpen(false);
    },
    onError: (err) => {
      toast.error(err.message);
    }
  });

  const Icon = PRODUCT_ICONS[product.product_type] || Package;
  const canPurchase = userProfile?.ggg_balance >= product.price_ggg;
  const isOwnProduct = currentUser?.email === product.creator_id;

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative">
          {product.cover_image_url ? (
            <img 
              src={product.cover_image_url} 
              alt={product.title}
              className="w-full h-40 object-cover"
            />
          ) : (
            <div className="w-full h-40 bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
              <Icon className="w-16 h-16 text-violet-400" />
            </div>
          )}
          {product.compare_at_price_ggg > product.price_ggg && (
            <Badge className="absolute top-2 right-2 bg-rose-500">
              {Math.round((1 - product.price_ggg / product.compare_at_price_ggg) * 100)}% OFF
            </Badge>
          )}
          <Badge className="absolute top-2 left-2 capitalize" variant="secondary">
            {product.product_type}
          </Badge>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-slate-900 line-clamp-2">{product.title}</h3>
          <p className="text-sm text-slate-500 mt-1 line-clamp-2">{product.description}</p>
          
          <div className="flex items-center gap-2 mt-3">
            {product.rating && (
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
              </div>
            )}
            <span className="text-xs text-slate-400">{product.sales_count || 0} sales</span>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-violet-600">{product.price_ggg} GGG</span>
              {product.compare_at_price_ggg > product.price_ggg && (
                <span className="text-sm text-slate-400 line-through">{product.compare_at_price_ggg}</span>
              )}
            </div>
            {showPurchase && !isOwnProduct && (
              hasPurchased ? (
                <Button variant="outline" className="gap-2" onClick={() => setModalOpen(true)}>
                  <Download className="w-4 h-4" />
                  Access
                </Button>
              ) : (
                <Button 
                  className="bg-violet-600 hover:bg-violet-700 gap-2"
                  onClick={() => setModalOpen(true)}
                >
                  <ShoppingCart className="w-4 h-4" />
                  Buy
                </Button>
              )
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {hasPurchased ? 'Access Product' : `Purchase "${product.title}"`}
            </DialogTitle>
            <DialogDescription>
              {hasPurchased ? 'You own this product' : 'Complete your purchase to get instant access'}
            </DialogDescription>
          </DialogHeader>

          {hasPurchased ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                <div className="flex items-center gap-2 text-emerald-700">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">You have access to this product</span>
                </div>
              </div>
              {product.file_url && (
                <Button asChild className="w-full bg-violet-600 hover:bg-violet-700 gap-2">
                  <a href={product.file_url} target="_blank" rel="noopener noreferrer">
                    <Download className="w-4 h-4" />
                    Download Files
                  </a>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Product Info */}
              <div className="flex gap-4">
                {product.cover_image_url ? (
                  <img 
                    src={product.cover_image_url} 
                    alt={product.title}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-20 h-20 bg-violet-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-8 h-8 text-violet-400" />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-medium">{product.title}</h4>
                  <p className="text-sm text-slate-500">{product.creator_name}</p>
                </div>
              </div>

              {/* Features */}
              {product.features?.length > 0 && (
                <div className="p-3 rounded-lg bg-slate-50">
                  <p className="text-xs font-medium text-slate-500 mb-2">What's Included:</p>
                  <div className="space-y-1">
                    {product.features.slice(0, 4).map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-emerald-500" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Balance */}
              <div className="p-3 rounded-lg bg-slate-50 border">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600">Your balance</span>
                  <span className="font-medium flex items-center gap-1">
                    <Coins className="w-4 h-4 text-amber-500" />
                    {userProfile?.ggg_balance?.toFixed(2) || 0} GGG
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Product price</span>
                  <span className="font-medium text-violet-600">{product.price_ggg} GGG</span>
                </div>
                {!canPurchase && (
                  <p className="text-xs text-rose-500 mt-2">Insufficient balance</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={() => purchaseMutation.mutate()}
                  disabled={!canPurchase || purchaseMutation.isPending}
                  className="flex-1 bg-violet-600 hover:bg-violet-700"
                >
                  {purchaseMutation.isPending ? 'Processing...' : `Buy for ${product.price_ggg} GGG`}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}