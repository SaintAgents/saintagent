import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  StickyNote, X, Plus, Pin, Trash2, Save, Tag,
  ChevronDown, ChevronUp, Search, Archive
} from 'lucide-react';
import { toast } from 'sonner';

const COLORS = {
  default: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700',
  yellow: 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-600/50',
  green: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-600/50',
  blue: 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600/50',
  purple: 'bg-purple-50 dark:bg-purple-900/30 border-purple-300 dark:border-purple-600/50',
  pink: 'bg-pink-50 dark:bg-pink-900/30 border-pink-300 dark:border-pink-600/50',
  orange: 'bg-orange-50 dark:bg-orange-900/30 border-orange-300 dark:border-orange-600/50',
};

export default function FloatingNotesWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [newNote, setNewNote] = useState({ title: '', content: '', tags: [], color: 'default' });
  const [tagInput, setTagInput] = useState('');
  const queryClient = useQueryClient();

  const { data: notes = [] } = useQuery({
    queryKey: ['notes'],
    queryFn: () => base44.entities.Note.filter({ is_archived: false }, '-updated_date'),
    enabled: isOpen
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Note.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setNewNote({ title: '', content: '', tags: [], color: 'default' });
      setIsEditing(false);
      toast.success('Note saved');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Note.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setEditingNote(null);
      toast.success('Note updated');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Note.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Note deleted');
    }
  });

  const handleSave = () => {
    if (!newNote.title.trim() && !newNote.content.trim()) return;
    createMutation.mutate({
      title: newNote.title || 'Untitled',
      content: newNote.content,
      tags: newNote.tags,
      color: newNote.color
    });
  };

  const handleUpdate = () => {
    if (!editingNote) return;
    updateMutation.mutate({ id: editingNote.id, data: editingNote });
  };

  const addTag = (note, setNote) => {
    if (tagInput.trim() && !note.tags.includes(tagInput.trim())) {
      setNote({ ...note, tags: [...note.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (note, setNote, tag) => {
    setNote({ ...note, tags: note.tags.filter(t => t !== tag) });
  };

  const filteredNotes = notes.filter(note => 
    note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const pinnedNotes = filteredNotes.filter(n => n.is_pinned);
  const regularNotes = filteredNotes.filter(n => !n.is_pinned);

  // Keyboard shortcut to toggle
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'n') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-[140px] right-0 z-[100] w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/30"
        title="Notes (Ctrl+Shift+N)"
      >
        <StickyNote className="w-5 h-5" />
      </Button>
    );
  }

  return (
    <div 
      className={`fixed z-[100] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl transition-all duration-300 ${
        isExpanded 
          ? 'bottom-4 right-4 w-[500px] h-[600px]' 
          : 'bottom-24 right-4 w-80 h-96'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <StickyNote className="w-4 h-4 text-amber-500" />
          <span className="font-semibold text-slate-900 dark:text-white text-sm">Notes</span>
          <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px]">{notes.length}</Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsOpen(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search & Add */}
      <div className="p-2 border-b border-slate-200 dark:border-slate-700 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            className="h-8 pl-7 text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          />
        </div>
        <Button 
          size="sm" 
          className="h-8 bg-amber-500 hover:bg-amber-400 text-black"
          onClick={() => { setIsEditing(true); setEditingNote(null); }}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className={isExpanded ? 'h-[480px]' : 'h-[250px]'}>
        {isEditing || editingNote ? (
          <div className="p-3 space-y-3">
            <Input
              value={editingNote?.title ?? newNote.title}
              onChange={(e) => editingNote 
                ? setEditingNote({...editingNote, title: e.target.value})
                : setNewNote({...newNote, title: e.target.value})
              }
              placeholder="Note title..."
              className="text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
            <Textarea
              value={editingNote?.content ?? newNote.content}
              onChange={(e) => editingNote
                ? setEditingNote({...editingNote, content: e.target.value})
                : setNewNote({...newNote, content: e.target.value})
              }
              placeholder="Write your note..."
              className="min-h-[120px] text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
            
            {/* Tags */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTag(editingNote || newNote, editingNote ? setEditingNote : setNewNote)}
                  placeholder="Add tag..."
                  className="h-7 text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-7 border-slate-200 dark:border-slate-700"
                  onClick={() => addTag(editingNote || newNote, editingNote ? setEditingNote : setNewNote)}
                >
                  <Tag className="w-3 h-3" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {(editingNote?.tags || newNote.tags).map(tag => (
                  <Badge 
                    key={tag} 
                    className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs cursor-pointer hover:bg-red-500/50"
                    onClick={() => removeTag(editingNote || newNote, editingNote ? setEditingNote : setNewNote, tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            </div>

            {/* Color picker */}
            <div className="flex gap-1">
              {Object.keys(COLORS).map(color => (
                <button
                  key={color}
                  onClick={() => editingNote 
                    ? setEditingNote({...editingNote, color})
                    : setNewNote({...newNote, color})
                  }
                  className={`w-6 h-6 rounded-full border-2 ${
                    (editingNote?.color || newNote.color) === color ? 'border-white' : 'border-transparent'
                  } ${COLORS[color]}`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-black"
                onClick={editingNote ? handleUpdate : handleSave}
              >
                <Save className="w-3 h-3 mr-1" />
                Save
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="border-slate-200 dark:border-slate-700"
                onClick={() => { setIsEditing(false); setEditingNote(null); }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {pinnedNotes.length > 0 && (
              <>
                <div className="text-[10px] text-gray-500 px-1 flex items-center gap-1">
                  <Pin className="w-3 h-3" /> Pinned
                </div>
                {pinnedNotes.map(note => (
                  <NoteCard 
                    key={note.id} 
                    note={note} 
                    onEdit={() => setEditingNote(note)}
                    onPin={() => updateMutation.mutate({ id: note.id, data: { is_pinned: !note.is_pinned }})}
                    onDelete={() => deleteMutation.mutate(note.id)}
                  />
                ))}
              </>
            )}
            {regularNotes.length > 0 && (
              <>
                {pinnedNotes.length > 0 && <div className="text-[10px] text-gray-500 px-1">Other</div>}
                {regularNotes.map(note => (
                  <NoteCard 
                    key={note.id} 
                    note={note} 
                    onEdit={() => setEditingNote(note)}
                    onPin={() => updateMutation.mutate({ id: note.id, data: { is_pinned: !note.is_pinned }})}
                    onDelete={() => deleteMutation.mutate(note.id)}
                  />
                ))}
              </>
            )}
            {filteredNotes.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-sm">
                {searchQuery ? 'No notes found' : 'No notes yet. Create one!'}
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

function NoteCard({ note, onEdit, onPin, onDelete }) {
  return (
    <div 
      className={`p-3 rounded-lg border cursor-pointer hover:border-amber-500/50 transition-colors ${COLORS[note.color || 'default']}`}
      onClick={onEdit}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-medium text-slate-900 dark:text-white text-sm truncate">{note.title || 'Untitled'}</div>
          <div className="text-xs text-slate-500 dark:text-gray-400 line-clamp-2 mt-1">{note.content}</div>
        </div>
        <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onPin}>
            <Pin className={`w-3 h-3 ${note.is_pinned ? 'text-amber-500' : 'text-slate-400'}`} />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 hover:text-red-400" onClick={onDelete}>
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
      {note.tags?.length > 0 && (
        <div className="flex gap-1 mt-2 flex-wrap">
          {note.tags.map(tag => (
            <Badge key={tag} className="bg-slate-200/50 dark:bg-black/30 text-slate-600 dark:text-slate-300 text-[10px]">{tag}</Badge>
          ))}
        </div>
      )}
    </div>
  );
}