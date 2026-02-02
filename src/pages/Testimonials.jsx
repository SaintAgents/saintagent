import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Search, Edit, Trash2, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';

export default function Testimonials() {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const isAdmin = currentUser?.role === 'admin';

  // Fetch all testimonials
  const { data: allTestimonials = [], isLoading } = useQuery({
    queryKey: ['allTestimonials'],
    queryFn: () => base44.entities.Testimonial.list('-created_date', 500)
  });

  // Fetch current user's profile for their testimonials
  const { data: myProfile } = useQuery({
    queryKey: ['myProfile', currentUser?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_id: currentUser.email });
      return profiles?.[0];
    },
    enabled: !!currentUser?.email
  });

  const deleteTestimonialMutation = useMutation({
    mutationFn: (id) => base44.entities.Testimonial.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allTestimonials'] });
    }
  });

  const updateTestimonialMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Testimonial.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allTestimonials'] });
      setEditingTestimonial(null);
    }
  });

  // Filter testimonials based on search
  const filteredTestimonials = allTestimonials.filter(t => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.from_name?.toLowerCase().includes(q) ||
      t.to_user_id?.toLowerCase().includes(q) ||
      t.text?.toLowerCase().includes(q)
    );
  });

  // Separate into received and given for current user
  const myReceived = allTestimonials.filter(t => t.to_user_id === currentUser?.email);
  const myGiven = allTestimonials.filter(t => t.from_user_id === currentUser?.email);

  const renderTestimonialCard = (t, showActions = false) => (
    <Card key={t.id} className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar 
            className="w-10 h-10 cursor-pointer" 
            data-user-id={t.from_user_id}
          >
            <AvatarImage src={t.from_avatar} />
            <AvatarFallback>{t.from_name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-medium text-slate-900">{t.from_name || 'Anonymous'}</p>
                <p className="text-xs text-slate-500">To: {t.to_user_id}</p>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={cn("w-4 h-4", i < t.rating ? "fill-amber-400 text-amber-400" : "text-slate-200")} />
                ))}
              </div>
            </div>
            
            {editingTestimonial?.id === t.id ? (
              <div className="mt-2">
                <textarea
                  value={editingTestimonial.text}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, text: e.target.value })}
                  className="w-full text-sm p-2 border rounded-lg"
                  rows={3}
                />
                <div className="flex gap-2 mt-2">
                  <Button 
                    size="sm" 
                    onClick={() => updateTestimonialMutation.mutate({ id: t.id, data: { text: editingTestimonial.text } })}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" /> Save
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setEditingTestimonial(null)}
                  >
                    <XCircle className="w-4 h-4 mr-1" /> Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-slate-600">{t.text}</p>
            )}
            
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-slate-400">
                {t.created_date ? format(new Date(t.created_date), 'MMM d, yyyy') : ''}
              </p>
              {showActions && !editingTestimonial && (
                <div className="flex gap-1">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-7 w-7"
                    onClick={() => setEditingTestimonial({ id: t.id, text: t.text })}
                  >
                    <Edit className="w-3.5 h-3.5 text-slate-400" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-7 w-7"
                    onClick={() => {
                      if (confirm('Delete this testimonial?')) {
                        deleteTestimonialMutation.mutate(t.id);
                      }
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-violet-50/20 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to={createPageUrl('CommandDeck')}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Star className="w-6 h-6 text-amber-500" />
              Testimonials
            </h1>
            <p className="text-sm text-slate-500">Community reviews and endorsements</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search testimonials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All ({allTestimonials.length})</TabsTrigger>
            <TabsTrigger value="received">Received ({myReceived.length})</TabsTrigger>
            <TabsTrigger value="given">Given ({myGiven.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {isLoading ? (
              <div className="text-center py-8 text-slate-500">Loading...</div>
            ) : filteredTestimonials.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No testimonials found</div>
            ) : (
              <ScrollArea className="h-[calc(100vh-280px)]">
                {filteredTestimonials.map(t => renderTestimonialCard(t, isAdmin))}
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="received">
            {myReceived.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No testimonials received yet</div>
            ) : (
              <ScrollArea className="h-[calc(100vh-280px)]">
                {myReceived.map(t => renderTestimonialCard(t, false))}
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="given">
            {myGiven.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No testimonials given yet</div>
            ) : (
              <ScrollArea className="h-[calc(100vh-280px)]">
                {myGiven.map(t => renderTestimonialCard(t, true))}
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}