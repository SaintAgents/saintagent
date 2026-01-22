import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Briefcase } from 'lucide-react';
import PortfolioItemCard from './PortfolioItemCard';
import CollapsibleProfileCard from './CollapsibleProfileCard';

export default function PortfolioSection({ profile, currentUser }) {
  const isOwner = currentUser?.email === profile?.user_id;
  const queryClient = useQueryClient();
  const { data: items = [] } = useQuery({
    queryKey: ['portfolio', profile?.user_id],
    queryFn: () => base44.entities.PortfolioItem.filter({ user_id: profile.user_id, status: 'active' }, '-created_date', 50),
    enabled: !!profile?.user_id,
  });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', link_url: '', image_url: '', tags: '', skills: '' });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PortfolioItem.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['portfolio', profile.user_id] }); setOpen(false); setForm({ title: '', description: '', link_url: '', image_url: '', tags: '', skills: '' }); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PortfolioItem.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portfolio', profile.user_id] })
  });

  const addItem = () => {
    if (!form.title?.trim()) return;
    createMutation.mutate({
      user_id: profile.user_id,
      title: form.title.trim(),
      description: form.description?.trim(),
      link_url: form.link_url?.trim(),
      image_url: form.image_url?.trim(),
      tags: form.tags ? form.tags.split(',').map(s => s.trim()).filter(Boolean) : [],
      skills: form.skills ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
      status: 'active'
    });
  };

  const handleDelete = (item) => deleteMutation.mutate(item.id);

  return (
    <CollapsibleProfileCard 
      title="Portfolio / Projects" 
      icon={Briefcase}
      headerContent={isOwner && (
        <Button className="rounded-xl bg-violet-600 hover:bg-violet-700" onClick={() => setOpen(!open)}>
          <Plus className="w-4 h-4 mr-2" /> Add Project
        </Button>
      )}
    >
      <div>
        <p className="text-xs text-slate-500 mb-3">Showcase past work</p>
        {open && isOwner && (
          <div className="mb-4 p-3 bg-slate-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <Input placeholder="Link URL (https://...)" value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} />
              <Input placeholder="Image URL (optional)" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
              <Input placeholder="Tags (comma separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
              <Input placeholder="Skills (comma separated)" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
              <div className="md:col-span-2">
                <Textarea placeholder="Short description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button className="bg-violet-600 hover:bg-violet-700" onClick={addItem} disabled={createMutation.isPending}>Save</Button>
            </div>
          </div>
        )}
        {items.length === 0 ? (
          <div className="text-sm text-slate-500">No projects yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {items.map((it) => (
              <PortfolioItemCard key={it.id} item={it} isOwner={isOwner} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </CollapsibleProfileCard>
  );
}