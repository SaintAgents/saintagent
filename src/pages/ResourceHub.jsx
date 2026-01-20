import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ResourceForm from '@/components/resources/ResourceForm';
import ResourceCard from '@/components/resources/ResourceCard';
import ResourceFilters from '@/components/resources/ResourceFilters';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function ResourceHub() {
  const qc = useQueryClient();
  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const { data: all = [] } = useQuery({
    queryKey: ['resources'],
    queryFn: () => base44.entities.Resource.list('-updated_date', 300),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1
  });

  const isAdmin = user?.role === 'admin';
  const approved = (all || []).filter(r => r.status === 'approved');
  const mine = (all || []).filter(r => r.user_id === user?.email);
  const pending = (all || []).filter(r => r.status === 'pending');

  const categories = Array.from(new Set((approved || []).flatMap(r => (r.categories || []))).values());

  const [query, setQuery] = React.useState('');
  const [type, setType] = React.useState('all');
  const [category, setCategory] = React.useState('all');

  const filtered = approved.filter(r => {
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || [r.title, r.description, ...(r.tags || [])].join(' ').toLowerCase().includes(q);
    const matchesType = type === 'all' || r.type === type;
    const matchesCat = category === 'all' || (r.categories || []).includes(category);
    return matchesQuery && matchesType && matchesCat;
  });

  const addRes = useMutation({
    mutationFn: async (payload) => {
      const me = await base44.auth.me();
      return base44.entities.Resource.create({
        ...payload,
        user_id: me.email,
        author_name: me.full_name,
        status: 'pending'
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resources'] })
  });

  const moderate = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Resource.update(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resources'] })
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Resource Hub</h1>
      </div>

      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="browse">Browse</TabsTrigger>
          <TabsTrigger value="contribute">Contribute</TabsTrigger>
          {isAdmin && <TabsTrigger value="moderate">Moderate</TabsTrigger>}
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          <ResourceFilters
            query={query} setQuery={setQuery}
            type={type} setType={setType}
            category={category} setCategory={setCategory}
            categories={categories}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.length === 0 && <p className="text-sm text-slate-500">No resources found</p>}
            {filtered.map((r) => (
              <ResourceCard key={r.id} resource={r} isAdmin={false} onModerate={() => {}} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="contribute" className="space-y-4">
          <ResourceForm onSubmit={(payload) => addRes.mutate(payload)} submitting={addRes.isPending} />
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-2">My Submissions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mine.length === 0 && <p className="text-sm text-slate-500">No submissions yet</p>}
              {mine.map((r) => (
                <ResourceCard key={r.id} resource={r} isAdmin={false} onModerate={() => {}} />
              ))}
            </div>
          </div>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="moderate" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pending.length === 0 && <p className="text-sm text-slate-500">No pending resources</p>}
              {pending.map((r) => (
                <ResourceCard key={r.id} resource={r} isAdmin onModerate={(res, status) => moderate.mutate({ id: res.id, status })} />
              ))}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}