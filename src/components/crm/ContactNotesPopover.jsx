import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { StickyNote, Pencil, Check, X } from 'lucide-react';

export default function ContactNotesPopover({ notes, onSave, isOwner }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(notes || '');

  useEffect(() => {
    setDraft(notes || '');
  }, [notes]);

  const handleSave = () => {
    onSave(draft);
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(notes || '');
    setEditing(false);
  };

  const handleOpen = (isOpen) => {
    setOpen(isOpen);
    if (isOpen && !notes && isOwner) {
      setEditing(true);
    }
    if (!isOpen) {
      setEditing(false);
      setDraft(notes || '');
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        {notes ? (
          <div
            className="mb-3 p-2 bg-amber-50 rounded-lg border border-amber-100 cursor-pointer hover:bg-amber-100/60 transition-colors group"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <StickyNote className="w-3 h-3 text-amber-600" />
                <span className="text-[10px] font-medium text-amber-700">Notes</span>
              </div>
              {isOwner && (
                <Pencil className="w-3 h-3 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
            <p className="text-xs text-amber-900 line-clamp-2">{notes}</p>
          </div>
        ) : (
          <button
            className="mb-3 w-full p-2 bg-slate-50 rounded-lg border border-dashed border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors flex items-center gap-1.5 justify-center"
            onClick={e => e.stopPropagation()}
          >
            <StickyNote className="w-3 h-3 text-slate-400" />
            <span className="text-[10px] text-slate-400">Add notes...</span>
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-3"
        align="start"
        side="bottom"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <StickyNote className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-slate-900">Notes</span>
          </div>
          {isOwner && !editing && (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={() => setEditing(true)}>
              <Pencil className="w-3 h-3" /> Edit
            </Button>
          )}
        </div>

        {editing ? (
          <div className="space-y-2">
            <Textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder="Add notes about this contact..."
              className="min-h-32 text-sm"
              autoFocus
            />
            <div className="flex justify-end gap-1.5">
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={handleCancel}>
                <X className="w-3 h-3" /> Cancel
              </Button>
              <Button size="sm" className="h-7 text-xs gap-1 bg-violet-600 hover:bg-violet-700" onClick={handleSave}>
                <Check className="w-3 h-3" /> Save
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-700 whitespace-pre-wrap max-h-60 overflow-y-auto">
            {notes || <span className="text-slate-400 italic">No notes yet.</span>}
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}