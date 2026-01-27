import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FolderOpen, Edit, Eye, History, Trash2, Save, X, Loader2, 
  Clock, Tag, FileText, CheckCircle, RotateCcw, Star
} from 'lucide-react';
import { toast } from "sonner";
import moment from 'moment';

const TEMPLATE_CATEGORIES = [
  { value: 'newsletter', label: 'Newsletter', color: 'bg-blue-100 text-blue-700' },
  { value: 'announcement', label: 'Announcement', color: 'bg-purple-100 text-purple-700' },
  { value: 'promotional', label: 'Promotional', color: 'bg-green-100 text-green-700' },
  { value: 'digest', label: 'Digest', color: 'bg-orange-100 text-orange-700' },
  { value: 'event', label: 'Event', color: 'bg-pink-100 text-pink-700' },
  { value: 'update', label: 'Update', color: 'bg-cyan-100 text-cyan-700' },
  { value: 'custom', label: 'Custom', color: 'bg-slate-100 text-slate-700' },
];

export default function TemplateManagerModal({ open, onOpenChange, onSelectTemplate }) {
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [historyMode, setHistoryMode] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Edit form state
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('newsletter');
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editIsDefault, setEditIsDefault] = useState(false);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['newsletterTemplates'],
    queryFn: () => base44.entities.NewsletterTemplate.list('-created_date', 100)
  });

  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const template = templates.find(t => t.id === id);
      const user = await base44.auth.me();
      
      // Create version history entry
      const versionEntry = {
        version: template.version || 1,
        subject_template: template.subject_template,
        body_template: template.body_template,
        header_images: template.header_images || [],
        updated_at: new Date().toISOString(),
        updated_by: user.email
      };
      
      const newHistory = [...(template.version_history || []), versionEntry].slice(-10); // Keep last 10 versions
      
      return base44.entities.NewsletterTemplate.update(id, {
        ...data,
        version: (template.version || 1) + 1,
        version_history: newHistory
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletterTemplates'] });
      toast.success('Template updated');
      setEditMode(false);
      setSelectedTemplate(null);
    }
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (id) => base44.entities.NewsletterTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletterTemplates'] });
      toast.success('Template deleted');
      setSelectedTemplate(null);
    }
  });

  const restoreVersionMutation = useMutation({
    mutationFn: async ({ templateId, versionData }) => {
      const template = templates.find(t => t.id === templateId);
      const user = await base44.auth.me();
      
      // Save current as history
      const versionEntry = {
        version: template.version || 1,
        subject_template: template.subject_template,
        body_template: template.body_template,
        header_images: template.header_images || [],
        updated_at: new Date().toISOString(),
        updated_by: user.email
      };
      
      const newHistory = [...(template.version_history || []), versionEntry].slice(-10);
      
      return base44.entities.NewsletterTemplate.update(templateId, {
        subject_template: versionData.subject_template,
        body_template: versionData.body_template,
        header_images: versionData.header_images || [],
        version: (template.version || 1) + 1,
        version_history: newHistory
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletterTemplates'] });
      toast.success('Version restored');
      setHistoryMode(false);
    }
  });

  const filteredTemplates = templates.filter(t => {
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
    const matchesSearch = !searchTerm || 
      t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleEditTemplate = (template) => {
    setSelectedTemplate(template);
    setEditName(template.name || '');
    setEditDescription(template.description || '');
    setEditCategory(template.category || 'newsletter');
    setEditSubject(template.subject_template || '');
    setEditBody(template.body_template || '');
    setEditIsDefault(template.is_default || false);
    setEditMode(true);
    setPreviewMode(false);
    setHistoryMode(false);
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) {
      toast.error('Template name is required');
      return;
    }
    updateTemplateMutation.mutate({
      id: selectedTemplate.id,
      data: {
        name: editName,
        description: editDescription,
        category: editCategory,
        subject_template: editSubject,
        body_template: editBody,
        is_default: editIsDefault
      }
    });
  };

  const handleUseTemplate = (template) => {
    // Update usage stats
    base44.entities.NewsletterTemplate.update(template.id, {
      usage_count: (template.usage_count || 0) + 1,
      last_used_at: new Date().toISOString()
    });
    onSelectTemplate(template);
    onOpenChange(false);
  };

  const getCategoryBadge = (category) => {
    const cat = TEMPLATE_CATEGORIES.find(c => c.value === category) || TEMPLATE_CATEGORIES[6];
    return <Badge className={`${cat.color} text-xs`}>{cat.label}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            Template Manager
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-4 flex-1 overflow-hidden">
          {/* Left sidebar - Template list */}
          <div className="w-1/3 border-r pr-4 flex flex-col">
            <div className="space-y-3 mb-4">
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-sm"
              />
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {TEMPLATE_CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <ScrollArea className="flex-1">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                </div>
              ) : filteredTemplates.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No templates found</p>
              ) : (
                <div className="space-y-2 pr-2">
                  {filteredTemplates.map(template => (
                    <div
                      key={template.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedTemplate?.id === template.id
                          ? 'bg-violet-50 border-violet-300 dark:bg-violet-900/20 dark:border-violet-700'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
                      }`}
                      onClick={() => {
                        setSelectedTemplate(template);
                        setEditMode(false);
                        setPreviewMode(false);
                        setHistoryMode(false);
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm truncate">{template.name}</p>
                            {template.is_default && <Star className="w-3 h-3 text-amber-500 flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-slate-500 truncate mt-0.5">{template.description || 'No description'}</p>
                        </div>
                        {getCategoryBadge(template.category)}
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                        <span>v{template.version || 1}</span>
                        <span>Used {template.usage_count || 0}x</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Right panel - Details/Edit/Preview/History */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {!selectedTemplate ? (
              <div className="flex-1 flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Select a template to view details</p>
                </div>
              </div>
            ) : editMode ? (
              /* Edit Mode */
              <ScrollArea className="flex-1">
                <div className="space-y-4 pr-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Edit Template</h3>
                    <Button variant="ghost" size="sm" onClick={() => setEditMode(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Name *</Label>
                      <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">Category</Label>
                      <Select value={editCategory} onValueChange={setEditCategory}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {TEMPLATE_CATEGORIES.map(cat => (
                            <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs">Description</Label>
                    <Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="mt-1" />
                  </div>
                  
                  <div>
                    <Label className="text-xs">Subject Template</Label>
                    <Input value={editSubject} onChange={(e) => setEditSubject(e.target.value)} className="mt-1" />
                  </div>
                  
                  <div>
                    <Label className="text-xs">Body Template</Label>
                    <Textarea value={editBody} onChange={(e) => setEditBody(e.target.value)} className="mt-1 min-h-[200px] font-mono text-sm" />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is-default"
                      checked={editIsDefault}
                      onChange={(e) => setEditIsDefault(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="is-default" className="text-sm cursor-pointer">Set as default template</Label>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" onClick={() => setEditMode(false)} className="flex-1">Cancel</Button>
                    <Button onClick={handleSaveEdit} disabled={updateTemplateMutation.isPending} className="flex-1 gap-2">
                      {updateTemplateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Changes
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            ) : historyMode ? (
              /* History Mode */
              <ScrollArea className="flex-1">
                <div className="space-y-4 pr-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2">
                      <History className="w-4 h-4" />
                      Version History
                    </h3>
                    <Button variant="ghost" size="sm" onClick={() => setHistoryMode(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="text-sm text-slate-500 mb-2">
                    Current version: v{selectedTemplate.version || 1}
                  </div>

                  {(!selectedTemplate.version_history || selectedTemplate.version_history.length === 0) ? (
                    <p className="text-sm text-slate-500 text-center py-8">No version history available</p>
                  ) : (
                    <div className="space-y-3">
                      {[...selectedTemplate.version_history].reverse().map((version, idx) => (
                        <div key={idx} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">v{version.version}</Badge>
                              <span className="text-xs text-slate-500">
                                {moment(version.updated_at).format('MMM D, YYYY h:mm A')}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => restoreVersionMutation.mutate({
                                templateId: selectedTemplate.id,
                                versionData: version
                              })}
                              disabled={restoreVersionMutation.isPending}
                              className="gap-1 text-xs"
                            >
                              <RotateCcw className="w-3 h-3" />
                              Restore
                            </Button>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            Subject: {version.subject_template || '(empty)'}
                          </p>
                          <p className="text-xs text-slate-500 mt-1 truncate">
                            {version.body_template?.substring(0, 100) || '(empty body)'}...
                          </p>
                          <p className="text-xs text-slate-400 mt-1">By: {version.updated_by}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            ) : previewMode ? (
              /* Preview Mode */
              <ScrollArea className="flex-1">
                <div className="space-y-4 pr-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Template Preview
                    </h3>
                    <Button variant="ghost" size="sm" onClick={() => setPreviewMode(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-slate-100 dark:bg-slate-800 p-3 border-b">
                      <p className="text-xs text-slate-500">Subject:</p>
                      <p className="font-medium text-sm">{selectedTemplate.subject_template || '(No subject)'}</p>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-900 min-h-[300px]">
                      {selectedTemplate.header_images?.filter(Boolean).length > 0 && (
                        <div className="mb-4 space-y-2">
                          {selectedTemplate.header_images.filter(Boolean).map((img, idx) => (
                            <img key={idx} src={img} alt="" className="w-full rounded-lg max-h-[150px] object-cover" />
                          ))}
                        </div>
                      )}
                      <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 dark:text-slate-300">
                        {selectedTemplate.body_template || '(No content)'}
                      </pre>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            ) : (
              /* Details Mode */
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{selectedTemplate.name}</h3>
                      {selectedTemplate.is_default && <Star className="w-4 h-4 text-amber-500" />}
                    </div>
                    <p className="text-sm text-slate-500">{selectedTemplate.description || 'No description'}</p>
                  </div>
                  {getCategoryBadge(selectedTemplate.category)}
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{selectedTemplate.version || 1}</p>
                    <p className="text-xs text-slate-500">Version</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{selectedTemplate.usage_count || 0}</p>
                    <p className="text-xs text-slate-500">Times Used</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{selectedTemplate.version_history?.length || 0}</p>
                    <p className="text-xs text-slate-500">History</p>
                  </div>
                </div>

                {selectedTemplate.last_used_at && (
                  <p className="text-xs text-slate-400 flex items-center gap-1 mb-4">
                    <Clock className="w-3 h-3" />
                    Last used: {moment(selectedTemplate.last_used_at).fromNow()}
                  </p>
                )}

                <div className="border rounded-lg p-3 mb-4 bg-slate-50 dark:bg-slate-800">
                  <p className="text-xs text-slate-500 mb-1">Subject Preview:</p>
                  <p className="text-sm font-medium">{selectedTemplate.subject_template || '(empty)'}</p>
                </div>

                <div className="flex-1 border rounded-lg p-3 overflow-hidden bg-slate-50 dark:bg-slate-800">
                  <p className="text-xs text-slate-500 mb-1">Body Preview:</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-6">
                    {selectedTemplate.body_template || '(empty)'}
                  </p>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button variant="outline" size="sm" onClick={() => setPreviewMode(true)} className="gap-1">
                    <Eye className="w-4 h-4" /> Preview
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEditTemplate(selectedTemplate)} className="gap-1">
                    <Edit className="w-4 h-4" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setHistoryMode(true)} className="gap-1">
                    <History className="w-4 h-4" /> History
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm(`Delete "${selectedTemplate.name}"?`)) {
                        deleteTemplateMutation.mutate(selectedTemplate.id);
                      }
                    }}
                    className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </Button>
                  <div className="flex-1" />
                  <Button onClick={() => handleUseTemplate(selectedTemplate)} className="gap-1 bg-violet-600 hover:bg-violet-700">
                    <CheckCircle className="w-4 h-4" /> Use Template
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}