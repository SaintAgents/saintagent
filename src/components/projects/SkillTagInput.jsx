import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { X, Tag } from 'lucide-react';

/**
 * Simple tag input for adding skill keywords to a task.
 */
export default function SkillTagInput({ tags = [], onChange }) {
  const [input, setInput] = useState('');

  const addTag = (value) => {
    const trimmed = value.trim();
    if (trimmed && !tags.some(t => t.toLowerCase() === trimmed.toLowerCase())) {
      onChange([...tags, trimmed]);
    }
    setInput('');
  };

  const removeTag = (index) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5 text-xs text-slate-500">
        <Tag className="w-3 h-3" />
        Required Skills
      </div>
      <div className="flex flex-wrap gap-1.5 p-2 border rounded-md min-h-[38px] bg-white focus-within:ring-1 focus-within:ring-ring">
        {tags.map((tag, i) => (
          <Badge key={i} variant="secondary" className="gap-1 pr-1 text-xs bg-violet-100 text-violet-700">
            {tag}
            <button onClick={() => removeTag(i)} className="hover:bg-violet-200 rounded-full p-0.5">
              <X className="w-2.5 h-2.5" />
            </button>
          </Badge>
        ))}
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => input.trim() && addTag(input)}
          placeholder={tags.length === 0 ? "Type skill & press Enter (e.g. React, Design)" : "Add more..."}
          className="border-0 shadow-none p-0 h-6 text-xs flex-1 min-w-[100px] focus-visible:ring-0"
        />
      </div>
    </div>
  );
}