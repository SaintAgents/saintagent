import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Globe, Search, Filter, CheckCircle, Loader2, Coins, 
  Users, Building, Tag, Star, Shield, Eye, EyeOff
} from 'lucide-react';
import { toast } from "sonner";

const GGG_PER_FEDERATION = 0.60;

const PERMISSION_LEVELS = [
  { value: 'signal_only', label: 'Signal Only', desc: 'Only existence + strength shown', icon: Eye },
  { value: 'masked', label: 'Masked', desc: 'Role/domain only, no name', icon: EyeOff },
  { value: 'shared', label: 'Full Shared', desc: 'All details visible to network', icon: Globe },
];

export default function BatchFederationPanel({ open, onClose, contacts, currentUserId }) {
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [domainFilter, setDomainFilter] = useState('all');
  const [strengthFilter, setStrengthFilter] = useState('all');
  const [permissionLevel, setPermissionLevel] = useState('signal_only');
  const [federating, setFederating] = useState(false);

  // Filter contacts that are not yet federated
  const unfederatedContacts = useMemo(() => {
    return contacts.filter(c => !c.is_federated);
  }, [contacts]);

  // Apply filters
  const filteredContacts = useMemo(() => {
    return unfederatedContacts.filter(c => {
      const matchesSearch = !searchTerm || 
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDomain = domainFilter === 'all' || c.domain === domainFilter;
      const matchesStrength = strengthFilter === 'all' || 
        (strengthFilter === 'high' && (c.relationship_strength || 0) >= 4) ||
        (strengthFilter === 'medium' && (c.relationship_strength || 0) >= 2 && (c.relationship_strength || 0) < 4) ||
        (strengthFilter === 'low' && (c.relationship_strength || 0) < 2);
      return matchesSearch && matchesDomain && matchesStrength;
    });
  }, [unfederatedContacts, searchTerm, domainFilter, strengthFilter]);

  const toggleSelect = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const selectAll = () => {
    setSelectedIds(new Set(filteredContacts.map(c => c.id)));
  };

  const selectNone = () => {
    setSelectedIds(new Set());
  };

  const handleFederateSelected = async () => {
    if (selectedIds.size === 0) {
      toast.error('Select at least one contact');
      return;
    }

    setFederating(true);
    let successCount = 0;
    let totalGGG = 0;

    try {
      // Get current user profile for GGG balance
      const userProfiles = await base44.entities.UserProfile.filter({ user_id: currentUserId });
      const userProfile = userProfiles[0];

      for (const contactId of selectedIds) {
        const contact = contacts.find(c => c.id === contactId);
        if (!contact || contact.is_federated) continue;

        try {
          // Update contact to federated
          await base44.entities.Contact.update(contactId, {
            is_federated: true,
            permission_level: permissionLevel,
            ggg_federated_awarded: true
          });

          successCount++;
          totalGGG += GGG_PER_FEDERATION;
        } catch (error) {
          console.error(`Failed to federate contact ${contactId}:`, error);
        }
      }

      // Award GGG if any were federated
      if (successCount > 0 && userProfile) {
        const newBalance = (userProfile.ggg_balance || 0) + totalGGG;
        await base44.entities.UserProfile.update(userProfile.id, {
          ggg_balance: newBalance
        });

        // Create GGG transaction record
        await base44.entities.GGGTransaction.create({
          user_id: currentUserId,
          source_type: 'reward',
          delta: totalGGG,
          reason_code: 'contact_federation',
          description: `Federated ${successCount} contact(s) to network`,
          balance_after: newBalance
        });
      }

      queryClient.invalidateQueries({ queryKey: ['myContacts'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      
      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span>Federated {successCount} contacts</span>
          <Badge className="bg-amber-100 text-amber-700 ml-1">
            <Coins className="w-3 h-3 mr-1" />
            +{totalGGG.toFixed(2)} GGG
          </Badge>
        </div>
      );
      
      setSelectedIds(new Set());
      onClose();
    } catch (error) {
      console.error('Federation failed:', error);
      toast.error('Failed to federate contacts');
    } finally {
      setFederating(false);
    }
  };

  const domains = ['all', 'finance', 'tech', 'governance', 'health', 'education', 'media', 'legal', 'spiritual', 'creative', 'nonprofit', 'other'];
  const potentialGGG = selectedIds.size * GGG_PER_FEDERATION;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-violet-600" />
            Batch Federate Contacts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Info Banner */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
              <Coins className="w-4 h-4" />
              <span className="font-medium">Earn {GGG_PER_FEDERATION.toFixed(2)} GGG per contact federated!</span>
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              Contributing to the network helps everyone find valuable connections.
            </p>
          </div>

          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={domainFilter} onValueChange={setDomainFilter}>
              <SelectTrigger className="w-[140px]">
                <Building className="w-4 h-4 mr-2 text-slate-400" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {domains.map(d => (
                  <SelectItem key={d} value={d}>
                    {d === 'all' ? 'All Domains' : d.charAt(0).toUpperCase() + d.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={strengthFilter} onValueChange={setStrengthFilter}>
              <SelectTrigger className="w-[160px]">
                <Star className="w-4 h-4 mr-2 text-slate-400" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Strengths</SelectItem>
                <SelectItem value="high">High (4-5)</SelectItem>
                <SelectItem value="medium">Medium (2-3)</SelectItem>
                <SelectItem value="low">Low (1)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Permission Level */}
          <div>
            <Label className="text-xs mb-2 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Permission Level for All Selected
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {PERMISSION_LEVELS.map(level => {
                const Icon = level.icon;
                return (
                  <button
                    key={level.value}
                    onClick={() => setPermissionLevel(level.value)}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      permissionLevel === level.value
                        ? 'bg-violet-50 border-violet-300 dark:bg-violet-900/30 dark:border-violet-700'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{level.label}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{level.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selection Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                Select All ({filteredContacts.length})
              </Button>
              <Button variant="outline" size="sm" onClick={selectNone}>
                Clear Selection
              </Button>
            </div>
            <Badge variant="secondary">
              {selectedIds.size} selected
            </Badge>
          </div>

          {/* Contact List */}
          <ScrollArea className="flex-1 border rounded-lg">
            <div className="p-2 space-y-1">
              {filteredContacts.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No unfederated contacts match your filters</p>
                </div>
              ) : (
                filteredContacts.map(contact => (
                  <div
                    key={contact.id}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedIds.has(contact.id)
                        ? 'bg-violet-50 dark:bg-violet-900/20'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                    onClick={() => toggleSelect(contact.id)}
                  >
                    <Checkbox
                      checked={selectedIds.has(contact.id)}
                      onCheckedChange={() => toggleSelect(contact.id)}
                    />
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                      {contact.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{contact.name}</p>
                      <p className="text-xs text-slate-500 truncate">
                        {contact.company || contact.role || contact.domain || 'No details'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {contact.domain && (
                        <Badge variant="outline" className="text-xs">{contact.domain}</Badge>
                      )}
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map(i => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i <= (contact.relationship_strength || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm">
              <span className="text-slate-500">Potential earnings: </span>
              <span className="font-bold text-amber-600">{potentialGGG.toFixed(2)} GGG</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleFederateSelected}
                disabled={selectedIds.size === 0 || federating}
                className="gap-2 bg-violet-600 hover:bg-violet-700 text-white"
              >
                {federating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Federating...</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4" />
                    <span>Federate {selectedIds.size} Contacts</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}