import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertTriangle, Copy, UserX, Clock, Star, AlertCircle,
  Trash2, Merge, CheckCircle, Loader2, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { differenceInDays } from 'date-fns';

const CATEGORY_CONFIG = {
  duplicates: { 
    label: 'Duplicates', 
    icon: Copy, 
    color: 'bg-amber-100 text-amber-700',
    description: 'Contacts with similar names or emails'
  },
  incomplete: { 
    label: 'Incomplete', 
    icon: AlertCircle, 
    color: 'bg-rose-100 text-rose-700',
    description: 'Missing email or phone number'
  },
  inactive: { 
    label: 'Inactive (6mo+)', 
    icon: Clock, 
    color: 'bg-slate-100 text-slate-600',
    description: 'No contact in over 6 months'
  },
  needsAttention: { 
    label: 'Needs Attention', 
    icon: AlertTriangle, 
    color: 'bg-orange-100 text-orange-700',
    description: 'Low relationship strength (≤2)'
  },
  highValue: { 
    label: 'High Value', 
    icon: Star, 
    color: 'bg-emerald-100 text-emerald-700',
    description: 'Strong relationships (4-5 stars)'
  }
};

export default function ContactCleanupModal({ open, onClose, contacts }) {
  const [activeCategory, setActiveCategory] = useState('duplicates');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [processing, setProcessing] = useState(false);
  const queryClient = useQueryClient();

  // Organize contacts into categories
  const categories = useMemo(() => {
    if (!contacts?.length) return {};

    // Find duplicates (similar names or same email)
    const duplicates = [];
    const seen = new Map();
    contacts.forEach(c => {
      const nameKey = c.name?.toLowerCase().trim();
      const emailKey = c.email?.toLowerCase().trim();
      
      if (nameKey && seen.has(nameKey)) {
        duplicates.push(c);
        if (!duplicates.includes(seen.get(nameKey))) {
          duplicates.push(seen.get(nameKey));
        }
      } else if (nameKey) {
        seen.set(nameKey, c);
      }
      
      if (emailKey && seen.has(emailKey)) {
        duplicates.push(c);
        if (!duplicates.includes(seen.get(emailKey))) {
          duplicates.push(seen.get(emailKey));
        }
      } else if (emailKey) {
        seen.set(emailKey, c);
      }
    });

    // Incomplete contacts
    const incomplete = contacts.filter(c => !c.email || !c.phone);

    // Inactive contacts (no contact in 180+ days)
    const inactive = contacts.filter(c => {
      if (!c.last_contact_date) return true;
      return differenceInDays(new Date(), new Date(c.last_contact_date)) > 180;
    });

    // Needs attention (low strength)
    const needsAttention = contacts.filter(c => (c.relationship_strength || 0) <= 2);

    // High value contacts
    const highValue = contacts.filter(c => (c.relationship_strength || 0) >= 4);

    return {
      duplicates: [...new Set(duplicates)],
      incomplete,
      inactive,
      needsAttention,
      highValue
    };
  }, [contacts]);

  const currentContacts = categories[activeCategory] || [];

  const deleteMutation = useMutation({
    mutationFn: async (ids) => {
      for (const id of ids) {
        await base44.entities.Contact.delete(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myContacts'] });
      setSelectedIds(new Set());
    }
  });

  const handleSelectAll = () => {
    if (selectedIds.size === currentContacts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(currentContacts.map(c => c.id)));
    }
  };

  const handleToggle = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    setProcessing(true);
    await deleteMutation.mutateAsync([...selectedIds]);
    setProcessing(false);
  };

  const isDark = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col" style={isDark ? { backgroundColor: '#0f172a', borderColor: '#334155', color: '#e5e7eb' } : {}}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={isDark ? { color: '#f1f5f9' } : {}}>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Contact Cleanup & Organization
          </DialogTitle>
          <DialogDescription style={isDark ? { color: '#94a3b8' } : {}}>
            Review and clean up your contact list
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 flex-1 overflow-hidden">
          {/* Category Sidebar */}
          <div className="w-56 space-y-2 flex-shrink-0">
            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
              const Icon = config.icon;
              const count = categories[key]?.length || 0;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setActiveCategory(key);
                    setSelectedIds(new Set());
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                    activeCategory === key 
                      ? "bg-violet-100 text-violet-900" 
                      : isDark ? "hover:bg-slate-800" : "hover:bg-slate-50"
                  )}
                  style={isDark && activeCategory !== key ? { color: '#e5e7eb' } : {}}
                >
                  <Icon className="w-4 h-4" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{config.label}</div>
                    <div className="text-xs opacity-60">{count} contacts</div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-40" />
                </button>
              );
            })}
          </div>

          {/* Contact List */}
          <div className="flex-1 flex flex-col overflow-hidden border rounded-lg" style={isDark ? { borderColor: '#334155' } : {}}>
            {/* Category Header */}
            <div className="p-4 border-b flex items-center justify-between" style={isDark ? { backgroundColor: '#1e293b', borderColor: '#334155' } : { backgroundColor: '#f8fafc' }}>
              <div>
                <div className="font-medium" style={isDark ? { color: '#f1f5f9' } : {}}>
                  {CATEGORY_CONFIG[activeCategory]?.label}
                </div>
                <div className="text-xs" style={isDark ? { color: '#94a3b8' } : { color: '#64748b' }}>
                  {CATEGORY_CONFIG[activeCategory]?.description}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {currentContacts.length > 0 && (
                  <>
                    <Button variant="outline" size="sm" onClick={handleSelectAll}>
                      {selectedIds.size === currentContacts.length ? 'Deselect All' : 'Select All'}
                    </Button>
                    {selectedIds.size > 0 && activeCategory !== 'highValue' && (
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={handleDeleteSelected}
                        disabled={processing}
                      >
                        {processing ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 mr-2" />
                        )}
                        Delete ({selectedIds.size})
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Contact List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {currentContacts.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                  <div className="font-medium" style={isDark ? { color: '#f1f5f9' } : {}}>All clear!</div>
                  <div className="text-sm" style={isDark ? { color: '#94a3b8' } : { color: '#64748b' }}>
                    No contacts in this category
                  </div>
                </div>
              ) : (
                currentContacts.map(contact => (
                  <div 
                    key={contact.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg transition-colors",
                      selectedIds.has(contact.id) 
                        ? "bg-violet-50 border border-violet-200" 
                        : isDark ? "hover:bg-slate-800" : "hover:bg-slate-50"
                    )}
                    style={isDark && !selectedIds.has(contact.id) ? { borderColor: 'transparent' } : {}}
                  >
                    <Checkbox
                      checked={selectedIds.has(contact.id)}
                      onCheckedChange={() => handleToggle(contact.id)}
                    />
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={contact.avatar_url} />
                      <AvatarFallback className="bg-violet-100 text-violet-600">
                        {contact.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate" style={isDark ? { color: '#f1f5f9' } : {}}>
                        {contact.name}
                      </div>
                      <div className="text-sm truncate" style={isDark ? { color: '#94a3b8' } : { color: '#64748b' }}>
                        {contact.email || 'No email'} • {contact.phone || 'No phone'}
                      </div>
                    </div>
                    {activeCategory === 'needsAttention' && (
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={cn(
                              "w-3 h-3",
                              i < (contact.relationship_strength || 0) 
                                ? "fill-amber-400 text-amber-400" 
                                : "text-slate-200"
                            )} 
                          />
                        ))}
                      </div>
                    )}
                    {contact.domain && (
                      <Badge variant="outline" className="text-xs">
                        {contact.domain}
                      </Badge>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}