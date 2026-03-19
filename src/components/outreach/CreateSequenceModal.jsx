import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, X, Layers, Users, Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import SequenceStepEditor from './SequenceStepEditor';

export default function CreateSequenceModal({ open, onClose, sequence, currentUserId }) {
  const queryClient = useQueryClient();
  const isEdit = !!sequence?.id;

  const [form, setForm] = useState({
    title: '', description: '', steps: [], contact_ids: [], tags: [],
  });
  const [tab, setTab] = useState('steps');
  const [contactSearch, setContactSearch] = useState('');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (sequence) {
      setForm({
        title: sequence.title || '',
        description: sequence.description || '',
        steps: sequence.steps || [],
        contact_ids: sequence.contact_ids || [],
        tags: sequence.tags || [],
      });
    } else {
      setForm({ title: '', description: '', steps: [], contact_ids: [], tags: [] });
    }
    setTab('steps');
  }, [sequence, open]);

  const { data: contacts = [] } = useQuery({
    queryKey: ['outreachContacts', currentUserId],
    queryFn: () => base44.entities.Contact.filter({ owner_id: currentUserId }, 'name', 200),
    enabled: !!currentUserId && open,
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['outreachTemplates', currentUserId],
    queryFn: () => base44.entities.OutreachTemplate.filter({ owner_id: currentUserId }),
    enabled: !!currentUserId && open,
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        ...data,
        owner_id: currentUserId,
        total_enrolled: data.contact_ids.length,
      };
      if (isEdit) {
        return base44.entities.OutreachSequence.update(sequence.id, payload);
      }
      return base44.entities.OutreachSequence.create({ ...payload, status: 'draft' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outreachSequences'] });
      onClose();
    },
  });

  const filteredContacts = contacts.filter(c => {
    if (!contactSearch) return true;
    const q = contactSearch.toLowerCase();
    return c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.company?.toLowerCase().includes(q);
  });

  const toggleContact = (contactId) => {
    setForm(prev => ({
      ...prev,
      contact_ids: prev.contact_ids.includes(contactId)
        ? prev.contact_ids.filter(id => id !== contactId)
        : [...prev.contact_ids, contactId],
    }));
  };

  const selectAll = () => {
    const allIds = filteredContacts.map(c => c.id);
    setForm(prev => ({ ...prev, contact_ids: allIds }));
  };

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    saveMutation.mutate(form);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Sequence' : 'Create Outreach Sequence'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Sequence Name *</label>
              <Input
                placeholder="e.g. New Lead Introduction"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Description</label>
              <Input
                placeholder="Brief description..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Tags</label>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Add tag..."
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 h-8"
              />
              <Button variant="outline" size="sm" onClick={addTag}>Add</Button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {form.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1 text-xs">
                    {tag}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))} />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="flex-1 min-h-0 flex flex-col">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="steps" className="gap-1.5">
              <Layers className="w-4 h-4" />
              Steps ({form.steps.length})
            </TabsTrigger>
            <TabsTrigger value="contacts" className="gap-1.5">
              <Users className="w-4 h-4" />
              Contacts ({form.contact_ids.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="steps" className="flex-1 min-h-0">
            <ScrollArea className="h-[400px] pr-2">
              <SequenceStepEditor
                steps={form.steps}
                onChange={steps => setForm({ ...form, steps })}
                templates={templates}
              />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="contacts" className="flex-1 min-h-0">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search contacts..."
                    className="pl-9 h-9"
                    value={contactSearch}
                    onChange={e => setContactSearch(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="sm" onClick={selectAll}>Select All</Button>
                <Button variant="outline" size="sm" onClick={() => setForm(prev => ({ ...prev, contact_ids: [] }))}>Clear</Button>
              </div>
              <ScrollArea className="h-[350px]">
                <div className="space-y-1">
                  {filteredContacts.map(contact => (
                    <div
                      key={contact.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                      onClick={() => toggleContact(contact.id)}
                    >
                      <Checkbox checked={form.contact_ids.includes(contact.id)} />
                      <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-700">
                        {(contact.name || '?')[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-900 truncate">{contact.name}</div>
                        <div className="text-xs text-slate-500 truncate">
                          {contact.email || contact.company || contact.domain || 'No details'}
                        </div>
                      </div>
                      {contact.lead_status && (
                        <Badge variant="outline" className="text-[10px]">{contact.lead_status}</Badge>
                      )}
                    </div>
                  ))}
                  {filteredContacts.length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-8">No contacts found</p>
                  )}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between pt-3 border-t">
          <p className="text-xs text-slate-500">
            {form.steps.length} step{form.steps.length !== 1 ? 's' : ''} • {form.contact_ids.length} contact{form.contact_ids.length !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button 
              onClick={handleSave} 
              disabled={!form.title.trim() || saveMutation.isPending}
              className="bg-violet-600 hover:bg-violet-700 gap-2"
            >
              <Save className="w-4 h-4" />
              {saveMutation.isPending ? 'Saving...' : isEdit ? 'Update' : 'Create Sequence'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}