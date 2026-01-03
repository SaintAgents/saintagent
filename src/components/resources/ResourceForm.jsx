import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ResourceForm({ onSubmit, submitting }) {
  const [form, setForm] = React.useState({
    type: 'article',
    title: '',
    description: '',
    content_url: '',
    platform: '',
    categories: '',
    tags: ''
  });

  const handle = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      categories: form.categories.split(',').map(s => s.trim()).filter(Boolean),
      tags: form.tags.split(',').map(s => s.trim()).filter(Boolean)
    };
    onSubmit(payload);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contribute a Resource</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-600">Type</label>
              <Select value={form.type} onValueChange={(v) => handle('type', v)}>
                <SelectTrigger className="w-full mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="guide">Guide</SelectItem>
                  <SelectItem value="best_practice">Best Practice</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="external_link">External Link</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-slate-600">Platform (optional)</label>
              <Input value={form.platform} onChange={(e) => handle('platform', e.target.value)} placeholder="YouTube, Coursera, Dev.to, etc." className="mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-600">Title</label>
              <Input value={form.title} onChange={(e) => handle('title', e.target.value)} className="mt-1" required />
            </div>
            <div>
              <label className="text-sm text-slate-600">Link</label>
              <Input value={form.content_url} onChange={(e) => handle('content_url', e.target.value)} placeholder="https://..." className="mt-1" required />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-600">Description</label>
            <Textarea value={form.description} onChange={(e) => handle('description', e.target.value)} rows={3} className="mt-1" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-600">Categories (comma separated)</label>
              <Input value={form.categories} onChange={(e) => handle('categories', e.target.value)} placeholder="Mentorship, Leadership, React" className="mt-1" />
            </div>
            <div>
              <label className="text-sm text-slate-600">Tags (comma separated)</label>
              <Input value={form.tags} onChange={(e) => handle('tags', e.target.value)} placeholder="communication, pairing" className="mt-1" />
            </div>
          </div>

          <div className="text-right">
            <Button type="submit" className="bg-violet-600 hover:bg-violet-700" disabled={submitting}>Submit for Review</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}