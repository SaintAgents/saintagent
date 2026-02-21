import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Bookmark, BookmarkPlus, Trash2, Star, StarOff, Check 
} from "lucide-react";

export default function SavedFiltersPanel({ 
  currentFilters, 
  onApplyFilter, 
  entityType = 'all',
  currentUser 
}) {
  const queryClient = useQueryClient();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [filterName, setFilterName] = useState('');

  const { data: savedFilters = [] } = useQuery({
    queryKey: ['savedFilters', currentUser?.email],
    queryFn: () => base44.entities.SavedFilter.filter({ user_id: currentUser?.email }),
    enabled: !!currentUser?.email,
    staleTime: 60000
  });

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.SavedFilter.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedFilters'] });
      setSaveDialogOpen(false);
      setFilterName('');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SavedFilter.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['savedFilters'] })
  });

  const toggleDefaultMutation = useMutation({
    mutationFn: async ({ id, isDefault }) => {
      // First, unset any existing default
      if (isDefault) {
        const existing = savedFilters.find(f => f.is_default && f.entity_type === entityType);
        if (existing) {
          await base44.entities.SavedFilter.update(existing.id, { is_default: false });
        }
      }
      return base44.entities.SavedFilter.update(id, { is_default: isDefault });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['savedFilters'] })
  });

  const incrementUseMutation = useMutation({
    mutationFn: ({ id, currentCount }) => 
      base44.entities.SavedFilter.update(id, { use_count: (currentCount || 0) + 1 }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['savedFilters'] })
  });

  const handleSaveFilter = () => {
    if (!filterName.trim() || !currentUser) return;
    saveMutation.mutate({
      user_id: currentUser.email,
      name: filterName.trim(),
      entity_type: entityType,
      filters: currentFilters,
      is_default: false,
      use_count: 0
    });
  };

  const handleApply = (filter) => {
    onApplyFilter(filter.filters);
    incrementUseMutation.mutate({ id: filter.id, currentCount: filter.use_count });
  };

  const filteredSaved = savedFilters.filter(f => 
    f.entity_type === entityType || f.entity_type === 'all'
  );

  const hasActiveFilters = Object.keys(currentFilters || {}).some(key => {
    const val = currentFilters[key];
    if (Array.isArray(val)) return val.length > 0;
    if (typeof val === 'boolean') return val;
    if (val === 'any') return false;
    return !!val;
  });

  return (
    <div className="border-t pt-3 mt-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-violet-500" />
          <span className="text-sm font-medium">Saved Filters</span>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs gap-1 h-7"
            onClick={() => setSaveDialogOpen(true)}
          >
            <BookmarkPlus className="w-3 h-3" />
            Save Current
          </Button>
        )}
      </div>

      {filteredSaved.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-3">
          No saved filters yet
        </p>
      ) : (
        <ScrollArea className="max-h-32">
          <div className="space-y-1">
            {filteredSaved.map(filter => (
              <div
                key={filter.id}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 group"
              >
                <button
                  onClick={() => handleApply(filter)}
                  className="flex-1 text-left text-sm truncate"
                >
                  {filter.name}
                </button>
                {filter.is_default && (
                  <Badge variant="secondary" className="text-[10px]">Default</Badge>
                )}
                <button
                  onClick={() => toggleDefaultMutation.mutate({ 
                    id: filter.id, 
                    isDefault: !filter.is_default 
                  })}
                  className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  title={filter.is_default ? "Remove default" : "Set as default"}
                >
                  {filter.is_default ? (
                    <StarOff className="w-3 h-3 text-amber-500" />
                  ) : (
                    <Star className="w-3 h-3 text-slate-400" />
                  )}
                </button>
                <button
                  onClick={() => deleteMutation.mutate(filter.id)}
                  className="p-1 opacity-0 group-hover:opacity-100 transition-opacity text-rose-500"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Filter</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Filter name..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveFilter} disabled={!filterName.trim()}>
              <Check className="w-4 h-4 mr-2" />
              Save Filter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}