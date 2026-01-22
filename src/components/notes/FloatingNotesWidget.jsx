import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  StickyNote, X, Plus, Pin, Trash2, Save, Tag,
  ChevronDown, ChevronUp, Search, Archive, Download, GripHorizontal
} from 'lucide-react';
import { toast } from 'sonner';

const COLORS = {
  default: 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600',
  yellow: 'bg-amber-200 dark:bg-yellow-800/50 border-amber-400 dark:border-yellow-500',
  green: 'bg-emerald-200 dark:bg-emerald-800/50 border-emerald-400 dark:border-emerald-500',
  blue: 'bg-blue-200 dark:bg-blue-800/50 border-blue-400 dark:border-blue-500',
  purple: 'bg-purple-200 dark:bg-purple-800/50 border-purple-400 dark:border-purple-500',
  pink: 'bg-pink-200 dark:bg-pink-800/50 border-pink-400 dark:border-pink-500',
  orange: 'bg-orange-200 dark:bg-orange-800/50 border-orange-400 dark:border-orange-500',
};

export default function FloatingNotesWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [newNote, setNewNote] = useState({ title: '', content: '', tags: [], color: 'default' });
  const [tagInput, setTagInput] = useState('');
  const [position, setPosition] = useState({ x: null, y: null });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const queryClient = useQueryClient();

  // Dragging logic
  const handleMouseDown = (e) => {
    if (e.target.closest('button, input, textarea')) return;
    setIsDragging(true);
    const rect = dragRef.current.getBoundingClientRect();
    offsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e) => {
      const newX = e.clientX - offsetRef.current.x;
      const newY = e.clientY - offsetRef.current.y;
      setPosition({ x: newX, y: newY });
    };
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Export all notes
  const handleExportNotes = () => {
    if (notes.length === 0) {
      toast.error('No notes to export');
      return;
    }
    const exportData = notes.map(note => ({
      title: note.title || 'Untitled',
      content: note.content || '',
      tags: note.tags?.join(', ') || '',
      color: note.color || 'default',
      pinned: note.is_pinned ? 'Yes' : 'No',
      created: note.created_date,
      updated: note.updated_date
    }));
    
    let text = 'NOTES EXPORT\n' + '='.repeat(50) + '\n\n';
    exportData.forEach((note, i) => {
      text += `[${i + 1}] ${note.title}\n`;
      text += '-'.repeat(30) + '\n';
      text += `${note.content}\n\n`;
      if (note.tags) text += `Tags: ${note.tags}\n`;
      text += `Pinned: ${note.pinned}\n`;
      text += `Created: ${new Date(note.created).toLocaleString()}\n`;
      text += '\n' + '='.repeat(50) + '\n\n';
    });

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notes-export-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${notes.length} notes`);
  };

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

  const positionStyle = position.x !== null 
    ? { left: Math.max(8, Math.min(position.x, window.innerWidth - 340)), top: Math.max(8, Math.min(position.y, window.innerHeight - 520)), right: 'auto', bottom: 'auto' }
    : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

  return (
    <div 
      ref={dragRef}
      style={positionStyle}
      className={`fixed z-[100] bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl shadow-2xl transition-all duration-300 flex flex-col ${
        isExpanded 
          ? 'w-[min(450px,calc(100vw-32px))] h-[min(600px,calc(100vh-32px))]' 
          : 'w-[min(320px,calc(100vw-32px))] h-[min(450px,calc(100vh-100px))]'
      } ${isDragging ? 'cursor-grabbing' : ''}`}
    >
      {/* Drag Handle */}
      <div 
        onMouseDown={handleMouseDown}
        className="flex items-center justify-center py-1 cursor-grab active:cursor-grabbing border-b border-slate-300 dark:border-slate-600 bg-slate-200 dark:bg-slate-800 rounded-t-xl"
      >
        <GripHorizontal className="w-5 h-5 text-slate-500" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-300 dark:border-slate-600">
        <div className="flex items-center gap-2">
          <StickyNote className="w-4 h-4 text-amber-600" />
          <span className="font-semibold text-slate-800 dark:text-white text-sm">Notes</span>
          <Badge className="bg-amber-600/30 text-amber-700 dark:text-amber-300 text-[10px]">{notes.length}</Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleExportNotes} title="Export all notes">
            <Download className="w-4 h-4 text-slate-600" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsOpen(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search & Add */}
      <div className="p-2 border-b border-slate-300 dark:border-slate-600 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            className="h-8 pl-7 text-xs bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white"
          />
        </div>
        <Button 
          size="sm" 
          className="h-8 bg-amber-600 hover:bg-amber-500 text-white"
          onClick={() => { setIsEditing(true); setEditingNote(null); }}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        {isEditing || editingNote ? (
          <div className="p-3 flex flex-col h-full">
            <div className="space-y-3 flex-1">
              <Input
                value={editingNote?.title ?? newNote.title}
                onChange={(e) => editingNote 
                  ? setEditingNote({...editingNote, title: e.target.value})
                  : setNewNote({...newNote, title: e.target.value})
                }
                placeholder="Note title..."
                className="text-sm bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white"
              />
              <Textarea
                value={editingNote?.content ?? newNote.content}
                onChange={(e) => editingNote
                  ? setEditingNote({...editingNote, content: e.target.value})
                  : setNewNote({...newNote, content: e.target.value})
                }
                placeholder="Write your note..."
                className="min-h-[150px] text-sm bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white"
              />
              
              {/* Tags */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTag(editingNote || newNote, editingNote ? setEditingNote : setNewNote)}
                    placeholder="Add tag..."
                    className="h-7 text-xs bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-white"
                  />
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-7 border-slate-300 dark:border-slate-600"
                    onClick={() => addTag(editingNote || newNote, editingNote ? setEditingNote : setNewNote)}
                  >
                    <Tag className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(editingNote?.tags || newNote.tags).map(tag => (
                    <Badge 
                      key={tag} 
                      className="bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs cursor-pointer hover:bg-red-500/50"
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
                      (editingNote?.color || newNote.color) === color ? 'border-slate-800 dark:border-white' : 'border-transparent'
                    } ${COLORS[color]}`}
                  />
                ))}
              </div>
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

      {/* Bottom Actions - Always visible when editing */}
      {(isEditing || editingNote) && (
        <div className="p-3 border-t border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 rounded-b-xl">
          <div className="flex gap-2">
            <Button 
              size="sm" 
              className="flex-1 bg-amber-600 hover:bg-amber-500 text-white"
              onClick={editingNote ? handleUpdate : handleSave}
            >
              <Save className="w-3 h-3 mr-1" />
              Save
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="border-slate-300 dark:border-slate-600"
              onClick={() => { setIsEditing(false); setEditingNote(null); }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function NoteCard({ note, onEdit, onPin, onDelete }) {
  return (
    <div 
      className={`p-3 rounded-lg border-2 cursor-pointer hover:border-amber-600 transition-colors overflow-hidden ${COLORS[note.color || 'default']}`}
      onClick={onEdit}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-medium text-slate-800 dark:text-white text-sm truncate">{note.title || 'Untitled'}</div>
          <div className="text-xs text-slate-600 dark:text-gray-300 line-clamp-2 mt-1 break-words">{note.content}</div>
        </div>
        <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onPin}>
            <Pin className={`w-3 h-3 ${note.is_pinned ? 'text-amber-600' : 'text-slate-500'}`} />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 hover:text-red-500" onClick={onDelete}>
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
      {note.tags?.length > 0 && (
        <div className="flex gap-1 mt-2 flex-wrap">
          {note.tags.map(tag => (
            <Badge key={tag} className="bg-slate-400/50 dark:bg-black/40 text-slate-700 dark:text-slate-200 text-[10px]">{tag}</Badge>
          ))}
        </div>
      )}
    </div>
  );
}