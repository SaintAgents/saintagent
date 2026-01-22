import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  StickyNote, Plus, Pin, Trash2, Save, Tag, Search, 
  Archive, ArchiveRestore, Grid3X3, List, Filter
} from 'lucide-react';
import { toast } from 'sonner';

const COLORS = {
  default: { bg: 'bg-slate-100 dark:bg-slate-800', border: 'border-slate-200 dark:border-slate-700', text: 'text-slate-900 dark:text-white' },
  yellow: { bg: 'bg-yellow-50 dark:bg-yellow-900/30', border: 'border-yellow-200 dark:border-yellow-600/50', text: 'text-yellow-900 dark:text-yellow-100' },
  green: { bg: 'bg-emerald-50 dark:bg-emerald-900/30', border: 'border-emerald-200 dark:border-emerald-600/50', text: 'text-emerald-900 dark:text-emerald-100' },
  blue: { bg: 'bg-blue-50 dark:bg-blue-900/30', border: 'border-blue-200 dark:border-blue-600/50', text: 'text-blue-900 dark:text-blue-100' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-900/30', border: 'border-purple-200 dark:border-purple-600/50', text: 'text-purple-900 dark:text-purple-100' },
  pink: { bg: 'bg-pink-50 dark:bg-pink-900/30', border: 'border-pink-200 dark:border-pink-600/50', text: 'text-pink-900 dark:text-pink-100' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-900/30', border: 'border-orange-200 dark:border-orange-600/50', text: 'text-orange-900 dark:text-orange-100' },
};

export default function Notes() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const queryClient = useQueryClient();

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['allNotes'],
    queryFn: () => base44.entities.Note.list('-updated_date')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Note.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allNotes'] });
      setEditModalOpen(false);
      setEditingNote(null);
      toast.success('Note created');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Note.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allNotes'] });
      setEditModalOpen(false);
      setEditingNote(null);
      toast.success('Note updated');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Note.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allNotes'] });
      toast.success('Note deleted');
    }
  });

  const handleSave = () => {
    if (!editingNote?.title?.trim() && !editingNote?.content?.trim()) return;
    const data = {
      title: editingNote.title || 'Untitled',
      content: editingNote.content || '',
      tags: editingNote.tags || [],
      color: editingNote.color || 'default',
      is_pinned: editingNote.is_pinned || false,
      is_archived: editingNote.is_archived || false
    };
    if (editingNote.id) {
      updateMutation.mutate({ id: editingNote.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !editingNote?.tags?.includes(tagInput.trim())) {
      setEditingNote({ ...editingNote, tags: [...(editingNote?.tags || []), tagInput.trim()] });
      setTagInput('');
    }
  };

  // Get all unique tags
  const allTags = [...new Set(notes.flatMap(n => n.tags || []))];

  // Filter notes
  const filteredNotes = notes.filter(note => {
    const matchesSearch = !searchQuery || 
      note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || note.tags?.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const activeNotes = filteredNotes.filter(n => !n.is_archived);
  const archivedNotes = filteredNotes.filter(n => n.is_archived);
  const pinnedNotes = activeNotes.filter(n => n.is_pinned);
  const regularNotes = activeNotes.filter(n => !n.is_pinned);

  const openNewNote = () => {
    setEditingNote({ title: '', content: '', tags: [], color: 'default' });
    setEditModalOpen(true);
  };

  const openEditNote = (note) => {
    setEditingNote({ ...note });
    setEditModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-orange-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <StickyNote className="w-8 h-8 text-amber-500" />
              Notes
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Capture and organize your thoughts</p>
          </div>
          <Button onClick={openNewNote} className="bg-amber-500 hover:bg-amber-400 text-black">
            <Plus className="w-4 h-4 mr-2" />
            New Note
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur border-slate-200 dark:border-slate-700">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes..."
                className="pl-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
                className="h-9 w-9"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
                className="h-9 w-9"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Tags filter */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
              <Button
                variant={!selectedTag ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTag(null)}
                className="h-7 text-xs"
              >
                All
              </Button>
              {allTags.map(tag => (
                <Button
                  key={tag}
                  variant={selectedTag === tag ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className="h-7 text-xs"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Button>
              ))}
            </div>
          )}
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="active">
          <TabsList className="bg-white/80 dark:bg-slate-800/80">
            <TabsTrigger value="active">Active ({activeNotes.length})</TabsTrigger>
            <TabsTrigger value="archived">Archived ({archivedNotes.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-4">
            {pinnedNotes.length > 0 && (
              <div className="mb-6">
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                  <Pin className="w-4 h-4" /> Pinned
                </div>
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-3'}>
                  {pinnedNotes.map(note => (
                    <NoteCard 
                      key={note.id} 
                      note={note} 
                      viewMode={viewMode}
                      onEdit={() => openEditNote(note)}
                      onPin={() => updateMutation.mutate({ id: note.id, data: { is_pinned: false }})}
                      onArchive={() => updateMutation.mutate({ id: note.id, data: { is_archived: true }})}
                      onDelete={() => deleteMutation.mutate(note.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {regularNotes.length > 0 && (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-3'}>
                {regularNotes.map(note => (
                  <NoteCard 
                    key={note.id} 
                    note={note} 
                    viewMode={viewMode}
                    onEdit={() => openEditNote(note)}
                    onPin={() => updateMutation.mutate({ id: note.id, data: { is_pinned: true }})}
                    onArchive={() => updateMutation.mutate({ id: note.id, data: { is_archived: true }})}
                    onDelete={() => deleteMutation.mutate(note.id)}
                  />
                ))}
              </div>
            )}

            {activeNotes.length === 0 && (
              <Card className="p-12 text-center bg-white/80 dark:bg-slate-800/80">
                <StickyNote className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500">No notes yet. Create your first one!</p>
                <Button onClick={openNewNote} className="mt-4 bg-amber-500 hover:bg-amber-400 text-black">
                  <Plus className="w-4 h-4 mr-2" />
                  New Note
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="archived" className="mt-4">
            {archivedNotes.length > 0 ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-3'}>
                {archivedNotes.map(note => (
                  <NoteCard 
                    key={note.id} 
                    note={note} 
                    viewMode={viewMode}
                    isArchived
                    onEdit={() => openEditNote(note)}
                    onRestore={() => updateMutation.mutate({ id: note.id, data: { is_archived: false }})}
                    onDelete={() => deleteMutation.mutate(note.id)}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center bg-white/80 dark:bg-slate-800/80">
                <Archive className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500">No archived notes</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-lg bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <StickyNote className="w-5 h-5 text-amber-500" />
              {editingNote?.id ? 'Edit Note' : 'New Note'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              value={editingNote?.title || ''}
              onChange={(e) => setEditingNote({...editingNote, title: e.target.value})}
              placeholder="Note title..."
              className="text-lg font-medium"
            />
            
            <Textarea
              value={editingNote?.content || ''}
              onChange={(e) => setEditingNote({...editingNote, content: e.target.value})}
              placeholder="Write your note..."
              className="min-h-[200px]"
            />

            {/* Tags */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add tag..."
                  className="flex-1"
                />
                <Button variant="outline" onClick={addTag}>
                  <Tag className="w-4 h-4" />
                </Button>
              </div>
              {editingNote?.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {editingNote.tags.map(tag => (
                    <Badge 
                      key={tag} 
                      className="cursor-pointer hover:bg-red-500"
                      onClick={() => setEditingNote({...editingNote, tags: editingNote.tags.filter(t => t !== tag)})}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Color picker */}
            <div className="flex gap-2">
              <span className="text-sm text-slate-500 mr-2">Color:</span>
              {Object.keys(COLORS).map(color => (
                <button
                  key={color}
                  onClick={() => setEditingNote({...editingNote, color})}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    editingNote?.color === color ? 'border-amber-500 scale-110' : 'border-transparent'
                  } ${COLORS[color].bg}`}
                />
              ))}
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} className="flex-1 bg-amber-500 hover:bg-amber-400 text-black">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NoteCard({ note, viewMode, isArchived, onEdit, onPin, onArchive, onRestore, onDelete }) {
  const colorStyle = COLORS[note.color || 'default'];
  
  if (viewMode === 'list') {
    return (
      <Card 
        className={`p-4 cursor-pointer hover:shadow-md transition-all border ${colorStyle.bg} ${colorStyle.border}`}
        onClick={onEdit}
      >
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className={`font-medium ${colorStyle.text}`}>{note.title || 'Untitled'}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400 truncate">{note.content}</div>
          </div>
          {note.tags?.length > 0 && (
            <div className="hidden sm:flex gap-1">
              {note.tags.slice(0, 2).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
              ))}
            </div>
          )}
          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
            {!isArchived && (
              <>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onPin}>
                  <Pin className={`w-4 h-4 ${note.is_pinned ? 'text-amber-500' : ''}`} />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onArchive}>
                  <Archive className="w-4 h-4" />
                </Button>
              </>
            )}
            {isArchived && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRestore}>
                <ArchiveRestore className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-500" onClick={onDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className={`p-4 cursor-pointer hover:shadow-lg transition-all border h-[180px] flex flex-col ${colorStyle.bg} ${colorStyle.border}`}
      onClick={onEdit}
    >
      <div className="flex items-start justify-between mb-2">
        <div className={`font-medium truncate flex-1 ${colorStyle.text}`}>{note.title || 'Untitled'}</div>
        <div className="flex items-center gap-1 shrink-0 -mr-2" onClick={e => e.stopPropagation()}>
          {!isArchived && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onPin}>
              <Pin className={`w-3 h-3 ${note.is_pinned ? 'text-amber-500' : ''}`} />
            </Button>
          )}
        </div>
      </div>
      <div className="text-sm text-slate-600 dark:text-slate-400 line-clamp-4 flex-1">{note.content}</div>
      {note.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {note.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
          ))}
          {note.tags.length > 3 && (
            <Badge variant="outline" className="text-[10px]">+{note.tags.length - 3}</Badge>
          )}
        </div>
      )}
    </Card>
  );
}