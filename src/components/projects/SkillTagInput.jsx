import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { X, Tag } from 'lucide-react';

/**
 * A simple tag input for task skill requirements.
 * Renders chips with an input to add new ones.
 */
export default function SkillTagInput({ tags = [], onChange }) {
  const [input, setInput] = useState('');

  const addTag = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (tags.some(t => t.toLowerCase() === trimmed.toLowerCase())) return;
    onChange([...tags, trimmed]);
    setInput('');
  };

  const removeTag = (index) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
        <Tag className="w-3 h-3" />
        Required Skills
      </div>
      <div className="flex flex-wrap items-center gap-1.5 p-2 border rounded-md min-h-[36px] bg-white">
        {tags.map((tag, i) => (
          <Badge key={i} variant="outline" className="text-[10px] gap-1 pr-1 bg-violet-50 border-violet-200 text-violet-700">
            {tag}
            <button onClick={() => removeTag(i)} className="hover:bg-violet-100 rounded-full p-0.5">
              <X className="w-2.5 h-2.5" />
            </button>
          </Badge>
        ))}
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addTag(input)}
          placeholder={tags.length === 0 ? "Type skill & press Enter..." : "Add more..."}
          className="flex-1 border-0 shadow-none h-6 min-w-[100px] p-0 text-xs focus-visible:ring-0"
        />
      </div>
    </div>
  );
}