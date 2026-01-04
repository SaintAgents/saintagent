import React, { useState } from 'react';
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
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Sparkles, Globe, Loader2, CheckCircle, AlertCircle,
  Search, Building2, MapPin, Linkedin, Twitter, ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ContactEnrichModal({ open, onClose, contacts, singleContact }) {
  const [selectedIds, setSelectedIds] = useState(new Set(singleContact ? [singleContact.id] : []));
  const [enriching, setEnriching] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState([]);
  const queryClient = useQueryClient();

  const contactList = singleContact ? [singleContact] : contacts;

  const enrichContact = async (contact) => {
    if (!contact.email && !contact.name) return null;

    // Use AI to search and enrich contact info
    const searchQuery = [contact.name, contact.company, contact.email?.split('@')[1]].filter(Boolean).join(' ');
    
    const aiResult = await base44.integrations.Core.InvokeLLM({
      prompt: `Research this person and compile a professional intelligence report:

Name: ${contact.name || 'Unknown'}
Email: ${contact.email || 'Unknown'}
Company: ${contact.company || 'Unknown'}
Role: ${contact.role || 'Unknown'}
Location: ${contact.location || 'Unknown'}

Search the web for information about this person and their company. Compile findings into a structured report including:
1. Professional background and current role
2. Company information (industry, size, recent news)
3. Potential social media profiles (LinkedIn, Twitter)
4. Any recent news or publications
5. Recommended outreach approach based on their profile
6. Mutual interests or connection points

Be concise but informative. If information is not found, say "Not found" rather than making assumptions.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          professional_summary: { type: 'string', description: 'Brief professional background' },
          company_info: { 
            type: 'object',
            properties: {
              name: { type: 'string' },
              industry: { type: 'string' },
              size: { type: 'string' },
              website: { type: 'string' },
              recent_news: { type: 'string' }
            }
          },
          social_profiles: {
            type: 'object',
            properties: {
              linkedin: { type: 'string' },
              twitter: { type: 'string' },
              website: { type: 'string' }
            }
          },
          recent_activity: { type: 'array', items: { type: 'string' } },
          recommended_approach: { type: 'string' },
          connection_points: { type: 'array', items: { type: 'string' } },
          confidence_score: { type: 'number', description: '0-100 confidence in findings' }
        }
      }
    });

    return aiResult;
  };

  const handleEnrich = async () => {
    const toEnrich = contactList.filter(c => selectedIds.has(c.id));
    if (toEnrich.length === 0) return;

    setEnriching(true);
    setProgress({ current: 0, total: toEnrich.length });
    setResults([]);

    const newResults = [];

    for (let i = 0; i < toEnrich.length; i++) {
      const contact = toEnrich[i];
      setProgress({ current: i + 1, total: toEnrich.length });

      try {
        const enrichedData = await enrichContact(contact);
        
        if (enrichedData) {
          // Build AI notes
          const aiNotes = `
📧 AI Intelligence Report
Generated: ${new Date().toLocaleDateString()}

**Professional Profile:**
${enrichedData.professional_summary || 'Not found'}

**Company Context:**
- Company: ${enrichedData.company_info?.name || contact.company || 'Unknown'}
- Industry: ${enrichedData.company_info?.industry || 'Unknown'}
- Size: ${enrichedData.company_info?.size || 'Unknown'}
- Website: ${enrichedData.company_info?.website || 'Unknown'}
${enrichedData.company_info?.recent_news ? `- Recent News: ${enrichedData.company_info.recent_news}` : ''}

**Online Presence:**
${enrichedData.social_profiles?.linkedin ? `- LinkedIn: ${enrichedData.social_profiles.linkedin}` : ''}
${enrichedData.social_profiles?.twitter ? `- Twitter: ${enrichedData.social_profiles.twitter}` : ''}
${enrichedData.social_profiles?.website ? `- Website: ${enrichedData.social_profiles.website}` : ''}

**Recent Activity:**
${enrichedData.recent_activity?.length ? enrichedData.recent_activity.map(a => `- ${a}`).join('\n') : 'No recent activity found'}

**Connection Points:**
${enrichedData.connection_points?.length ? enrichedData.connection_points.map(p => `- ${p}`).join('\n') : 'None identified'}

**Recommended Approach:**
${enrichedData.recommended_approach || 'Standard professional outreach'}

---
Confidence: ${enrichedData.confidence_score || 0}%
`.trim();

          // Update contact with enriched data
          const updateData = {
            notes: contact.notes ? `${contact.notes}\n\n---\n\n${aiNotes}` : aiNotes,
            social_links: {
              ...contact.social_links,
              linkedin: enrichedData.social_profiles?.linkedin || contact.social_links?.linkedin,
              twitter: enrichedData.social_profiles?.twitter || contact.social_links?.twitter,
              website: enrichedData.social_profiles?.website || contact.social_links?.website
            }
          };

          await base44.entities.Contact.update(contact.id, updateData);

          newResults.push({
            contact,
            status: 'success',
            data: enrichedData
          });
        } else {
          newResults.push({
            contact,
            status: 'skipped',
            reason: 'No email or name'
          });
        }
      } catch (error) {
        newResults.push({
          contact,
          status: 'error',
          error: error.message
        });
      }
    }

    setResults(newResults);
    setEnriching(false);
    queryClient.invalidateQueries({ queryKey: ['myContacts'] });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === contactList.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(contactList.map(c => c.id)));
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

  const successCount = results.filter(r => r.status === 'success').length;
  const isDark = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col" style={isDark ? { backgroundColor: '#0f172a', borderColor: '#334155', color: '#e5e7eb' } : {}}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={isDark ? { color: '#f1f5f9' } : {}}>
            <Sparkles className="w-5 h-5 text-violet-500" />
            AI Contact Enrichment
          </DialogTitle>
          <DialogDescription style={isDark ? { color: '#94a3b8' } : {}}>
            Search the web and enrich contact information using AI
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        {enriching && (
          <div className="space-y-2 p-4 rounded-lg" style={isDark ? { backgroundColor: '#1e293b' } : { backgroundColor: '#f8fafc' }}>
            <div className="flex items-center justify-between text-sm">
              <span style={isDark ? { color: '#e5e7eb' } : {}}>Enriching contacts...</span>
              <span style={isDark ? { color: '#94a3b8' } : { color: '#64748b' }}>{progress.current} / {progress.total}</span>
            </div>
            <Progress value={(progress.current / progress.total) * 100} className="h-2" />
          </div>
        )}

        {/* Results Summary */}
        {results.length > 0 && !enriching && (
          <div className="p-4 rounded-lg" style={isDark ? { backgroundColor: '#1e293b' } : { backgroundColor: '#ecfdf5' }}>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <span className="font-medium" style={isDark ? { color: '#6ee7b7' } : { color: '#065f46' }}>
                Enrichment Complete
              </span>
            </div>
            <div className="text-sm" style={isDark ? { color: '#a7f3d0' } : { color: '#047857' }}>
              Successfully enriched {successCount} of {results.length} contacts
            </div>
          </div>
        )}

        {/* Contact Selection */}
        {!enriching && results.length === 0 && (
          <>
            <div className="flex items-center justify-between p-3 border-b" style={isDark ? { borderColor: '#334155' } : {}}>
              <span className="text-sm" style={isDark ? { color: '#94a3b8' } : { color: '#64748b' }}>
                {selectedIds.size} of {contactList.length} selected
              </span>
              {!singleContact && (
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  {selectedIds.size === contactList.length ? 'Deselect All' : 'Select All'}
                </Button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {contactList.map(contact => (
                <div 
                  key={contact.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg transition-colors",
                    selectedIds.has(contact.id) 
                      ? "bg-violet-50 border border-violet-200" 
                      : isDark ? "hover:bg-slate-800" : "hover:bg-slate-50"
                  )}
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
                      {contact.email || 'No email'} • {contact.company || 'No company'}
                    </div>
                  </div>
                  {contact.notes?.includes('AI Intelligence Report') && (
                    <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Enriched
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Results List */}
        {results.length > 0 && !enriching && (
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {results.map((result, idx) => (
              <div 
                key={idx}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg",
                  result.status === 'success' ? "bg-emerald-50" : 
                  result.status === 'error' ? "bg-rose-50" : "bg-slate-50"
                )}
              >
                {result.status === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                ) : result.status === 'error' ? (
                  <AlertCircle className="w-5 h-5 text-rose-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-slate-400" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{result.contact.name}</div>
                  <div className="text-sm text-slate-500">
                    {result.status === 'success' ? `Confidence: ${result.data?.confidence_score || 0}%` :
                     result.status === 'error' ? result.error :
                     result.reason}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t" style={isDark ? { borderColor: '#334155' } : {}}>
          <Button variant="outline" onClick={onClose}>
            {results.length > 0 ? 'Done' : 'Cancel'}
          </Button>
          {results.length === 0 && (
            <Button 
              className="bg-violet-600 hover:bg-violet-700"
              onClick={handleEnrich}
              disabled={enriching || selectedIds.size === 0}
            >
              {enriching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enriching...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Enrich {selectedIds.size} Contact{selectedIds.size !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}