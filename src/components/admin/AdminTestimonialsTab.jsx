import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Star, Search, Edit, Trash2, CheckCircle, XCircle, Sparkles, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { DEMO_TESTIMONIALS } from '@/components/testimonials/TestimonialsMarquee';

export default function AdminTestimonialsTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [showFeatured, setShowFeatured] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState({
    from_user_id: '',
    from_name: '',
    to_user_id: '',
    text: '',
    rating: 5
  });
  const queryClient = useQueryClient();

  // Fetch all testimonials
  const { data: allTestimonials = [], isLoading } = useQuery({
    queryKey: ['adminTestimonials'],
    queryFn: () => base44.entities.Testimonial.list('-created_date', 500)
  });

  const deleteTestimonialMutation = useMutation({
    mutationFn: (id) => base44.entities.Testimonial.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTestimonials'] });
    }
  });

  const updateTestimonialMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Testimonial.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTestimonials'] });
      setEditingTestimonial(null);
    }
  });

  const createTestimonialMutation = useMutation({
    mutationFn: (data) => base44.entities.Testimonial.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTestimonials'] });
      setAddDialogOpen(false);
      setNewTestimonial({ from_user_id: '', from_name: '', to_user_id: '', text: '', rating: 5 });
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500" />
          Testimonials Management
          <Badge variant="outline" className="ml-2">{allTestimonials.length} total</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search and Actions */}
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search testimonials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            variant={showFeatured ? "default" : "outline"}
            onClick={() => setShowFeatured(!showFeatured)}
            className="gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Featured ({DEMO_TESTIMONIALS.length})
          </Button>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Testimonial
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Testimonial</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>From User Email</Label>
                  <Input
                    placeholder="user@example.com"
                    value={newTestimonial.from_user_id}
                    onChange={(e) => setNewTestimonial({ ...newTestimonial, from_user_id: e.target.value })}
                  />
                </div>
                <div>
                  <Label>From Name</Label>
                  <Input
                    placeholder="John Doe"
                    value={newTestimonial.from_name}
                    onChange={(e) => setNewTestimonial({ ...newTestimonial, from_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>To User Email</Label>
                  <Input
                    placeholder="recipient@example.com"
                    value={newTestimonial.to_user_id}
                    onChange={(e) => setNewTestimonial({ ...newTestimonial, to_user_id: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Rating</Label>
                  <Select
                    value={String(newTestimonial.rating)}
                    onValueChange={(v) => setNewTestimonial({ ...newTestimonial, rating: Number(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(r => (
                        <SelectItem key={r} value={String(r)}>
                          {r} Star{r > 1 ? 's' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Testimonial Text</Label>
                  <textarea
                    className="w-full p-2 border rounded-lg text-sm"
                    rows={4}
                    placeholder="Write the testimonial..."
                    value={newTestimonial.text}
                    onChange={(e) => setNewTestimonial({ ...newTestimonial, text: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
                  <Button 
                    onClick={() => createTestimonialMutation.mutate(newTestimonial)}
                    disabled={!newTestimonial.from_user_id || !newTestimonial.to_user_id || !newTestimonial.text}
                  >
                    Create Testimonial
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Featured Testimonials Section */}
        {showFeatured && (
          <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-violet-50 to-amber-50 border border-violet-200">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-500" />
              Featured Testimonials (Join Page)
            </h3>
            <div className="grid gap-3">
              {DEMO_TESTIMONIALS.map(t => (
                <div key={t.id} className="p-3 rounded-lg bg-white border border-slate-200">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={t.avatar} />
                      <AvatarFallback>{t.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-slate-900">{t.name}</span>
                        <span className="text-xs text-slate-500">{t.role}</span>
                        <Badge variant="outline" className="text-xs">{t.rank}</Badge>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(t.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{t.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Testimonials */}
        <ScrollArea className="h-[500px]">
          {isLoading ? (
            <div className="text-center py-8 text-slate-500">Loading...</div>
          ) : filteredTestimonials.length === 0 ? (
            <div className="text-center py-8 text-slate-500">No testimonials found</div>
          ) : (
            <div className="space-y-3">
              {filteredTestimonials.map(t => (
                <div key={t.id} className="p-4 rounded-lg border border-slate-200 bg-white">
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
                          {t.created_date ? format(new Date(t.created_date), 'MMM d, yyyy HH:mm') : ''}
                        </p>
                        {!editingTestimonial && (
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
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}