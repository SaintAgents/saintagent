import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  Plus, Pencil, Trash2, Eye, EyeOff, Star, 
  BookOpen, Video, Link2, Upload, Save, Sparkles, Loader2
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import AIWritingAssistant from '@/components/ai/AIWritingAssistant';

const CATEGORIES = ['announcements', 'updates', 'community', 'missions', 'events', 'tech', 'spiritual'];
const TYPES = ['article', 'video', 'link'];

function InsightForm({ article, onSave, onCancel, isSaving }) {
  const [form, setForm] = useState({
    title: article?.title || '',
    summary: article?.summary || '',
    content: article?.content || '',
    type: article?.type || 'article',
    category: article?.category || 'announcements',
    image_url: article?.image_url || '',
    video_url: article?.video_url || '',
    external_link: article?.external_link || '',
    tags: article?.tags?.join(', ') || '',
    is_featured: article?.is_featured || false,
    is_published: article?.is_published || false,
  });
  const [aiGenerating, setAiGenerating] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const handleSubmit = () => {
    onSave({
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      published_date: form.is_published && !article?.published_date ? new Date().toISOString() : article?.published_date,
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm({ ...form, image_url: file_url });
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setImageUploading(false);
    }
  };

  const generateWithAI = async () => {
    if (!form.title?.trim()) return;
    setAiGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a professional business analyst and thought leadership writer. Write an insightful analysis article for the following topic:

"${form.title}"

Category: ${form.category}

Write a compelling insight piece with:
1. An executive summary that captures the key insight
2. Deep analysis with data-driven observations
3. Strategic implications and recommendations
4. A forward-looking conclusion

Use a professional, authoritative tone similar to McKinsey or Harvard Business Review.
Return ONLY the article content, no additional commentary.`,
      });
      setForm(prev => ({ ...prev, content: result }));
      
      if (!form.summary?.trim()) {
        const summaryResult = await base44.integrations.Core.InvokeLLM({
          prompt: `Summarize this insight in 1-2 sentences for a preview card:\n\n${result}\n\nReturn ONLY the summary.`,
        });
        setForm(prev => ({ ...prev, summary: summaryResult }));
      }
    } catch (err) {
      console.error('AI generation failed:', err);
    } finally {
      setAiGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label>Title *</Label>
          <Input 
            value={form.title} 
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Insight headline"
          />
        </div>
        
        <div>
          <Label>Type</Label>
          <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {TYPES.map(t => (
                <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Category</Label>
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => (
                <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="col-span-2">
          <div className="flex items-center justify-between">
            <Label>Summary</Label>
            <AIWritingAssistant 
              text={form.summary} 
              onApply={(enhanced) => setForm({ ...form, summary: enhanced })} 
              disabled={!form.summary?.trim()}
            />
          </div>
          <Textarea 
            value={form.summary} 
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
            placeholder="Short description for preview cards"
            rows={2}
          />
        </div>
        
        <div className="col-span-2">
          <div className="flex items-center justify-between">
            <Label>Content (Markdown supported)</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={generateWithAI}
                disabled={!form.title?.trim() || aiGenerating}
                className="text-violet-600 hover:text-violet-700 hover:bg-violet-50 gap-1.5"
              >
                {aiGenerating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span className="text-xs">Generate with AI</span>
              </Button>
              <AIWritingAssistant 
                text={form.content} 
                onApply={(enhanced) => setForm({ ...form, content: enhanced })} 
                disabled={!form.content?.trim()}
              />
            </div>
          </div>
          <Textarea 
            value={form.content} 
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="Full insight content..."
            rows={10}
          />
        </div>
        
        <div className="col-span-2">
          <Label>Featured Image</Label>
          <div className="flex gap-2">
            <Input 
              value={form.image_url} 
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              placeholder="Image URL"
              className="flex-1"
            />
            <Button variant="outline" asChild className="shrink-0">
              <label className="cursor-pointer gap-2">
                {imageUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                Upload
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={imageUploading} />
              </label>
            </Button>
          </div>
          {form.image_url && (
            <img src={form.image_url} alt="Preview" className="mt-2 h-32 rounded-lg object-cover" />
          )}
        </div>
        
        {form.type === 'video' && (
          <div className="col-span-2">
            <Label>Video Embed URL</Label>
            <Input 
              value={form.video_url} 
              onChange={(e) => setForm({ ...form, video_url: e.target.value })}
              placeholder="YouTube/Vimeo embed URL"
            />
          </div>
        )}
        
        {form.type === 'link' && (
          <div className="col-span-2">
            <Label>External Link</Label>
            <Input 
              value={form.external_link} 
              onChange={(e) => setForm({ ...form, external_link: e.target.value })}
              placeholder="https://..."
            />
          </div>
        )}
        
        <div className="col-span-2">
          <Label>Tags (comma separated)</Label>
          <Input 
            value={form.tags} 
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="strategy, analysis, market trends"
          />
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Switch 
              checked={form.is_featured} 
              onCheckedChange={(v) => setForm({ ...form, is_featured: v })}
            />
            <Label>Featured</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch 
              checked={form.is_published} 
              onCheckedChange={(v) => setForm({ ...form, is_published: v })}
            />
            <Label>Published</Label>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={!form.title || isSaving} className="gap-2 bg-[#051C2C] hover:bg-blue-900 text-white">
          <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Insight'}
        </Button>
      </div>
    </div>
  );
}

export default function InsightsAdminPanel() {
  const queryClient = useQueryClient();
  const [editingArticle, setEditingArticle] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['allNewsArticles'],
    queryFn: () => base44.entities.NewsArticle.list('-created_date', 200)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.NewsArticle.create({
      ...data,
      author_id: currentUser?.email,
      author_name: currentUser?.full_name,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allNewsArticles'] });
      setShowForm(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.NewsArticle.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allNewsArticles'] });
      setEditingArticle(null);
      setShowForm(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.NewsArticle.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allNewsArticles'] });
      setDeleteConfirm(null);
    }
  });

  const handleSave = (data) => {
    if (editingArticle) {
      updateMutation.mutate({ id: editingArticle.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (article) => {
    setEditingArticle(article);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingArticle(null);
    setShowForm(true);
  };

  const togglePublish = async (article) => {
    await base44.entities.NewsArticle.update(article.id, { 
      is_published: !article.is_published,
      published_date: !article.is_published ? new Date().toISOString() : article.published_date
    });
    queryClient.invalidateQueries({ queryKey: ['allNewsArticles'] });
  };

  const toggleFeatured = async (article) => {
    await base44.entities.NewsArticle.update(article.id, { is_featured: !article.is_featured });
    queryClient.invalidateQueries({ queryKey: ['allNewsArticles'] });
  };

  const TypeIcon = { article: BookOpen, video: Video, link: Link2 };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Insights Management</h2>
          <p className="text-slate-600 mt-1">Create and manage insight articles for the Insights page.</p>
        </div>
        <Button onClick={handleNew} className="gap-2 bg-violet-600 hover:bg-violet-700">
          <Plus className="w-4 h-4" /> New Insight
        </Button>
      </div>

      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>{editingArticle ? 'Edit Insight' : 'New Insight'}</CardTitle>
          </CardHeader>
          <CardContent>
            <InsightForm 
              article={editingArticle}
              onSave={handleSave}
              onCancel={() => { setShowForm(false); setEditingArticle(null); }}
              isSaving={createMutation.isPending || updateMutation.isPending}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-slate-500">Loading...</div>
            ) : articles.length === 0 ? (
              <div className="p-8 text-center">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No insights yet. Create your first one!</p>
              </div>
            ) : (
              <div className="divide-y">
                {articles.map(article => {
                  const Icon = TypeIcon[article.type] || BookOpen;
                  return (
                    <div key={article.id} className="p-4 flex items-center gap-4 hover:bg-slate-50">
                      <Icon className="w-5 h-5 text-slate-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900 truncate">
                            {article.title}
                          </span>
                          {article.is_featured && (
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <Badge variant="outline" className="text-xs capitalize">{article.category}</Badge>
                          <span>•</span>
                          <span>{article.view_count || 0} views</span>
                          {article.published_date && (
                            <>
                              <span>•</span>
                              <span>{format(parseISO(article.published_date), 'MMM d, yyyy')}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleFeatured(article)}
                          className={article.is_featured ? 'text-amber-500' : 'text-slate-400'}
                        >
                          <Star className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => togglePublish(article)}
                          className={article.is_published ? 'text-emerald-500' : 'text-slate-400'}
                        >
                          {article.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(article)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setDeleteConfirm(article)}
                          className="text-rose-500 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Insight</DialogTitle>
          </DialogHeader>
          <p className="text-slate-600">
            Are you sure you want to delete "{deleteConfirm?.title}"? This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteMutation.mutate(deleteConfirm.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}