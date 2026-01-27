import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Mail, Send, Upload, Users, FileText, Trash2, Eye, Loader2, CheckCircle, AlertCircle, Newspaper, BarChart, Sparkles, Plus, X, Wand2, Type, Smile, Zap, BookOpen, Bold, List } from 'lucide-react';
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function EmailNewsletterManager() {
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [selectedNews, setSelectedNews] = useState('');
  const [selectedArticles, setSelectedArticles] = useState([]); // Multi-select articles to embed
  const [emailList, setEmailList] = useState([]);
  const [csvInput, setCsvInput] = useState('');
  const [sending, setSending] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [aiLoading, setAiLoading] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [aiPopoverOpen, setAiPopoverOpen] = useState(false);

  // AI format options like AIWritingAssistant
  const AI_FORMAT_OPTIONS = [
    { id: 'newsletter', label: 'Newsletter Format', icon: Newspaper, prompt: 'Transform this into a beautifully formatted email newsletter. Use clear section headers in CAPS, bullet points with •, and well-spaced paragraphs. Make it scannable and engaging.' },
    { id: 'professional', label: 'Professional', icon: Type, prompt: 'Rewrite this in a polished, professional business tone. Use precise language, maintain authority and credibility.' },
    { id: 'friendly', label: 'Friendly & Warm', icon: Smile, prompt: 'Transform this to be genuinely warm, friendly, and approachable. Use conversational language and add personality.' },
    { id: 'concise', label: 'Make Concise', icon: Zap, prompt: 'Cut this down significantly while keeping all key points. Remove filler words and make every word count.' },
    { id: 'expand', label: 'Expand & Elaborate', icon: BookOpen, prompt: 'Expand this with rich detail, examples, and context. Add depth while maintaining the original tone.' },
    { id: 'structured', label: 'Add Structure', icon: List, prompt: 'Restructure into a well-organized, scannable format with clear section headers in CAPS, bullet points, and proper paragraph breaks.' },
  ];

  // Fetch news articles
  const { data: newsArticles = [] } = useQuery({
    queryKey: ['newsArticles'],
    queryFn: () => base44.entities.NewsArticle.list('-created_date', 50)
  });

  // Fetch press releases / insights
  const { data: pressReleases = [] } = useQuery({
    queryKey: ['pressReleases'],
    queryFn: () => base44.entities.PressRelease.list('-created_date', 20)
  });

  // Fetch stored email list
  const { data: storedEmails = [] } = useQuery({
    queryKey: ['newsletterEmails'],
    queryFn: async () => {
      const results = await base44.entities.PlatformSetting.filter({ key: 'newsletter_emails' });
      if (results?.[0]?.value) {
        try {
          return JSON.parse(results[0].value);
        } catch {
          return [];
        }
      }
      return [];
    }
  });

  // Save email list
  const saveEmailsMutation = useMutation({
    mutationFn: async (emails) => {
      const existing = await base44.entities.PlatformSetting.filter({ key: 'newsletter_emails' });
      if (existing?.[0]) {
        return base44.entities.PlatformSetting.update(existing[0].id, { value: JSON.stringify(emails) });
      } else {
        return base44.entities.PlatformSetting.create({
          key: 'newsletter_emails',
          value: JSON.stringify(emails),
          description: 'Newsletter email subscriber list'
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletterEmails'] });
      toast.success('Email list saved');
    }
  });

  // Parse CSV/text input for emails
  const handleImportEmails = () => {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const found = csvInput.match(emailRegex) || [];
    const unique = [...new Set([...storedEmails, ...found])];
    setEmailList(unique);
    saveEmailsMutation.mutate(unique);
    setCsvInput('');
    toast.success(`Imported ${found.length} emails, ${unique.length} total`);
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCsvInput(event.target.result);
    };
    reader.readAsText(file);
  };

  // Load news content into body
  const handleSelectNews = (articleId) => {
    setSelectedNews(articleId);
    const article = newsArticles.find(a => a.id === articleId);
    if (article) {
      setSubject(article.title || '');
      setBody(`${article.summary || ''}\n\n${article.content || ''}`);
    }
  };

  // Load press release / analysis content
  const handleSelectPress = (pressId) => {
    const press = pressReleases.find(p => p.id === pressId);
    if (press) {
      setSubject(press.title || '');
      setBody(`${press.summary || ''}\n\n${press.content || ''}`);
    }
  };

  // Toggle article selection for embedding
  const toggleArticleSelection = (articleId) => {
    setSelectedArticles(prev => 
      prev.includes(articleId) 
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    );
  };

  // AI format newsletter
  const handleAIFormat = async () => {
    if (!body && selectedArticles.length === 0) {
      toast.error('Please add content or select articles first');
      return;
    }

    setAiLoading(true);
    try {
      const articlesToInclude = selectedArticles.map(id => {
        const article = newsArticles.find(a => a.id === id);
        return article ? `ARTICLE: ${article.title}\nSummary: ${article.summary || ''}\nContent: ${article.content || ''}` : '';
      }).filter(Boolean).join('\n\n---\n\n');

      const prompt = `You are formatting a professional newsletter email for SaintAgent platform. 

${body ? `CUSTOM MESSAGE FROM SENDER:\n${body}\n\n` : ''}
${articlesToInclude ? `ARTICLES TO INCLUDE:\n${articlesToInclude}\n\n` : ''}

Format this into a cohesive, professional newsletter email. Include:
1. A brief intro greeting
2. The custom message (if provided) integrated naturally
3. Each article formatted with:
   - Clear headline
   - Key highlights (bullet points)
   - Brief summary paragraph
4. A call-to-action
5. Professional sign-off

Keep the tone professional but engaging. Use clear section breaks. Make it scannable with headers and bullet points.
Do NOT include HTML tags - plain text only with clear formatting using:
- Headers in CAPS
- Bullet points with •
- Clear line breaks
- Section dividers with ═══════════════════`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            formatted_email: { type: "string" },
            suggested_subject: { type: "string" }
          }
        }
      });

      if (result.formatted_email) {
        setBody(result.formatted_email);
      }
      if (result.suggested_subject && !subject) {
        setSubject(result.suggested_subject);
      }
      toast.success('Newsletter formatted by AI');
    } catch (error) {
      console.error('AI formatting error:', error);
      toast.error('AI formatting failed');
    } finally {
      setAiLoading(false);
    }
  };

  // Build the final email content with embedded articles
  const buildFinalEmailContent = () => {
    let content = body || '';
    
    if (selectedArticles.length > 0) {
      content += '\n\n═══════════════════════════════════════\n';
      content += 'FEATURED ARTICLES\n';
      content += '═══════════════════════════════════════\n\n';
      
      selectedArticles.forEach((articleId, idx) => {
        const article = newsArticles.find(a => a.id === articleId);
        if (article) {
          content += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
          content += `📰 ${article.title?.toUpperCase() || 'UNTITLED'}\n`;
          content += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
          if (article.summary) {
            content += `${article.summary}\n\n`;
          }
          if (article.content) {
            // Trim content to reasonable length for email
            const trimmedContent = article.content.length > 1000 
              ? article.content.substring(0, 1000) + '...\n\n[Read full article on SaintAgent]'
              : article.content;
            content += `${trimmedContent}\n\n`;
          }
        }
      });
    }
    
    return content;
  };

  // Send newsletter
  const handleSendNewsletter = async () => {
    const finalContent = buildFinalEmailContent();
    
    if (!subject || (!body && selectedArticles.length === 0)) {
      toast.error('Please enter subject and add content or select articles');
      return;
    }

    const recipients = emailList.length > 0 ? emailList : storedEmails;
    if (recipients.length === 0) {
      toast.error('No email addresses to send to');
      return;
    }

    setSending(true);
    let successCount = 0;
    let failCount = 0;

    for (const email of recipients) {
      try {
        await base44.integrations.Core.SendEmail({
          to: email,
          subject: subject,
          body: finalContent,
          from_name: 'SaintAgent Newsletter'
        });
        successCount++;
      } catch (error) {
        console.error(`Failed to send to ${email}:`, error);
        failCount++;
      }
    }

    setSending(false);
    toast.success(`Sent to ${successCount} recipients${failCount > 0 ? `, ${failCount} failed` : ''}`);
  };

  // Remove email from list
  const handleRemoveEmail = (emailToRemove) => {
    const updated = storedEmails.filter(e => e !== emailToRemove);
    saveEmailsMutation.mutate(updated);
  };

  // Clear all emails
  const handleClearAll = () => {
    if (confirm('Clear all email addresses?')) {
      saveEmailsMutation.mutate([]);
    }
  };

  const displayEmails = emailList.length > 0 ? emailList : storedEmails;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="compose" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="compose" className="gap-2">
            <FileText className="w-4 h-4" />
            Compose
          </TabsTrigger>
          <TabsTrigger value="subscribers" className="gap-2">
            <Users className="w-4 h-4" />
            Subscribers ({storedEmails.length})
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-2">
            <Eye className="w-4 h-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        {/* Compose Tab */}
        <TabsContent value="compose" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Compose Newsletter
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Select Articles to Embed */}
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Newspaper className="w-4 h-4" />
                  Select Articles to Include in Newsletter
                </Label>
                <div className="border rounded-lg p-3 max-h-[200px] overflow-y-auto space-y-2">
                  {newsArticles.length === 0 ? (
                    <p className="text-sm text-slate-500">No articles available</p>
                  ) : (
                    newsArticles.slice(0, 20).map((article) => {
                      const isSelected = selectedArticles.includes(article.id);
                      return (
                        <div 
                          key={article.id} 
                          className={`flex items-start gap-3 p-2 rounded cursor-pointer border ${isSelected ? 'bg-violet-50 border-violet-300 dark:bg-violet-900/20 dark:border-violet-700' : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                          onClick={() => toggleArticleSelection(article.id)}
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${isSelected ? 'bg-violet-600 border-violet-600' : 'border-slate-300'}`}>
                            {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{article.title}</p>
                            <p className="text-xs text-slate-500 truncate">{article.summary || 'No summary'}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                {selectedArticles.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selectedArticles.map(id => {
                      const article = newsArticles.find(a => a.id === id);
                      return (
                        <Badge key={id} variant="secondary" className="gap-1">
                          {article?.title?.substring(0, 30)}...
                          <button onClick={() => toggleArticleSelection(id)} className="ml-1 hover:text-red-500">
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Load from Analysis */}
              <div>
                <Label className="flex items-center gap-2">
                  <BarChart className="w-4 h-4" />
                  Or Load from Analysis/Press Release
                </Label>
                <Select onValueChange={handleSelectPress}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select analysis/press release..." />
                  </SelectTrigger>
                  <SelectContent>
                    {pressReleases.map((press) => (
                      <SelectItem key={press.id} value={press.id}>
                        {press.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subject */}
              <div>
                <Label>Subject Line *</Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Newsletter subject..."
                />
              </div>

              {/* Body - custom message */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label>Your Message (optional intro/outro)</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAIFormat}
                    disabled={aiLoading || selectedArticles.length === 0}
                    className="gap-2"
                  >
                    {aiLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    AI Format Newsletter
                  </Button>
                </div>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Add your personal message, introduction, or additional content here (optional). The selected articles will be embedded below..."
                  className="min-h-[200px] font-mono"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Selected articles ({selectedArticles.length}) will be automatically embedded in the final email.
                </p>
              </div>

              {/* Preview Images for Email */}
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Plus className="w-4 h-4" />
                  Add Images
                </Label>
                <div className="space-y-3">
                  {previewImages.map((img, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      {img && (
                        <img src={img} alt="" className="w-12 h-12 object-cover rounded" />
                      )}
                      <Input 
                        value={img}
                        onChange={(e) => {
                          const newImages = [...previewImages];
                          newImages[idx] = e.target.value;
                          setPreviewImages(newImages);
                        }}
                        placeholder="https://example.com/image.jpg"
                        className="flex-1"
                      />
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setPreviewImages(previewImages.filter((_, i) => i !== idx))}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setPreviewImages([...previewImages, ''])}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add URL
                    </Button>
                    <label>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const { file_url } = await base44.integrations.Core.UploadFile({ file });
                            setPreviewImages([...previewImages, file_url]);
                            toast.success('Image uploaded');
                          } catch (err) {
                            toast.error('Upload failed');
                          }
                          e.target.value = '';
                        }}
                      />
                      <Button variant="outline" size="sm" className="gap-2" asChild>
                        <span>
                          <Upload className="w-4 h-4" />
                          Upload Image
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>
              </div>

              {/* Send Button */}
              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-slate-500">
                  Will send to {displayEmails.length} subscribers • {selectedArticles.length} article(s) embedded
                </p>
                <Button 
                  onClick={handleSendNewsletter}
                  disabled={sending || !subject || (!body && selectedArticles.length === 0) || displayEmails.length === 0}
                  className="gap-2"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Newsletter
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscribers Tab */}
        <TabsContent value="subscribers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Import Email Addresses
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Paste emails (CSV, one per line, or any text with emails)</Label>
                <Textarea
                  value={csvInput}
                  onChange={(e) => setCsvInput(e.target.value)}
                  placeholder="email1@example.com&#10;email2@example.com&#10;or paste CSV content..."
                  className="min-h-[150px] font-mono text-sm"
                />
              </div>

              <div className="flex gap-2">
                <label className="cursor-pointer">
                  <input 
                    type="file" 
                    accept=".csv,.txt" 
                    onChange={handleFileUpload}
                    className="hidden" 
                  />
                  <Button type="button" variant="outline" asChild>
                    <span><Upload className="w-4 h-4 mr-2" />Upload CSV/TXT</span>
                  </Button>
                </label>
                <Button onClick={handleImportEmails} disabled={!csvInput}>
                  Import Emails
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Subscriber List ({storedEmails.length})
              </CardTitle>
              {storedEmails.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleClearAll}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {storedEmails.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-8">
                  No subscribers yet. Import emails above.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2 max-h-[400px] overflow-y-auto">
                  {storedEmails.map((email, idx) => (
                    <Badge 
                      key={idx} 
                      variant="secondary" 
                      className="gap-1 pr-1"
                    >
                      {email}
                      <button
                        onClick={() => handleRemoveEmail(email)}
                        className="ml-1 hover:text-red-500"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Email Preview (Final)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!subject && !body && selectedArticles.length === 0 ? (
                <p className="text-slate-500 text-center py-8">
                  Compose your newsletter to see a preview.
                </p>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-slate-100 dark:bg-slate-800 p-4 border-b">
                    <p className="text-sm text-slate-500">Subject:</p>
                    <p className="font-semibold">{subject || '(No subject)'}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {selectedArticles.length} article(s) embedded • {previewImages.filter(Boolean).length} image(s)
                    </p>
                  </div>
                  <div className="p-6 bg-white dark:bg-slate-900 min-h-[300px] max-h-[600px] overflow-y-auto">
                    {/* Preview Images */}
                    {previewImages.filter(Boolean).length > 0 && (
                      <div className="mb-6 space-y-4">
                        {previewImages.filter(Boolean).map((imgUrl, idx) => (
                          <div key={idx} className="rounded-lg overflow-hidden border">
                            <img 
                              src={imgUrl} 
                              alt={`Newsletter image ${idx + 1}`}
                              className="w-full h-auto max-h-[300px] object-cover"
                              onError={(e) => e.target.style.display = 'none'}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    <pre className="whitespace-pre-wrap font-sans text-sm">
                      {buildFinalEmailContent() || '(No content)'}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}