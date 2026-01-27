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
import { Mail, Send, Upload, Users, FileText, Trash2, Eye, Loader2, CheckCircle, AlertCircle, Newspaper, BarChart, Sparkles, Plus, X, Wand2, Type, Smile, Zap, BookOpen, Bold, List, Clock, Calendar } from 'lucide-react';
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
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  // AI format options for newsletter
  const AI_FORMAT_OPTIONS = [
    { id: 'professional', label: 'Professional Tone', icon: Type, prompt: 'Rewrite this content in a polished, professional business tone. Use precise language, maintain authority and credibility. Keep the same meaning but make it sound more formal and authoritative.' },
    { id: 'friendly', label: 'Friendly & Approachable', icon: Smile, prompt: 'Rewrite this content to be warm, friendly, and approachable. Use conversational language, add personality, and make the reader feel welcomed. Keep it genuine and relatable.' },
    { id: 'concise', label: 'Condense for Brevity', icon: Zap, prompt: 'Condense this content significantly while keeping all key points intact. Remove filler words, redundant phrases, and make every word count. Be direct and to the point.' },
    { id: 'expand', label: 'Expand with Details', icon: BookOpen, prompt: 'Expand this content with more detail, examples, and context. Add depth, supporting information, and make it more comprehensive while maintaining the original tone and message.' },
    { id: 'structured', label: 'Structured Newsletter Layout', icon: List, prompt: 'Format this content into a structured newsletter layout with clear headings in CAPS, organized sections, bullet points (•) for key information, and proper paragraph breaks. Make it easy to scan and read.' },
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

  // AI format newsletter with options
  const handleAIFormat = async (option) => {
    // Check if there's content to format (either body text or selected articles)
    if (!body && selectedArticles.length === 0) {
      toast.error('Please add content or select articles first');
      return;
    }

    setAiLoading(option.id);
    setAiSuggestion(null);
    
    try {
      // Build the content to format
      let contentToFormat = body || '';
      
      if (selectedArticles.length > 0) {
        const articlesToInclude = selectedArticles.map(id => {
          const article = newsArticles.find(a => a.id === id);
          return article ? `ARTICLE: ${article.title}\nSummary: ${article.summary || ''}\nContent: ${article.content || ''}` : '';
        }).filter(Boolean).join('\n\n---\n\n');
        
        if (contentToFormat) {
          contentToFormat += '\n\n---\n\nARTICLES:\n' + articlesToInclude;
        } else {
          contentToFormat = articlesToInclude;
        }
      }

      const prompt = `${option.prompt}

CONTENT TO FORMAT:
${contentToFormat}

IMPORTANT INSTRUCTIONS:
- Return ONLY the formatted text, nothing else
- Do NOT include any explanations, comments, or meta-text
- Do NOT include HTML tags - use plain text only
- For structure/layout options, use:
  • Bullet points with •
  • Headers in CAPS
  • Clear line breaks between sections
  • Section dividers with ═══════════════════

Return ONLY the formatted content.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            formatted_text: { type: "string" },
            suggested_subject: { type: "string" }
          }
        }
      });

      if (result.formatted_text) {
        setAiSuggestion({ text: result.formatted_text, subject: result.suggested_subject, option });
      }
    } catch (error) {
      console.error('AI formatting error:', error);
      toast.error('AI formatting failed');
    } finally {
      setAiLoading(null);
    }
  };

  const applyAISuggestion = () => {
    if (aiSuggestion) {
      setBody(aiSuggestion.text);
      if (aiSuggestion.subject && !subject) {
        setSubject(aiSuggestion.subject);
      }
      setAiSuggestion(null);
      setAiPopoverOpen(false);
      toast.success('Newsletter formatted');
    }
  };

  // Build the final email content with embedded articles and images (HTML format)
  const buildFinalEmailContent = () => {
    let html = '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">';
    
    // Add images at the top
    if (previewImages.filter(Boolean).length > 0) {
      previewImages.filter(Boolean).forEach((imgUrl) => {
        html += `<div style="margin-bottom: 20px;"><img src="${imgUrl}" alt="Newsletter image" style="width: 100%; max-width: 600px; height: auto; border-radius: 8px;" /></div>`;
      });
    }
    
    // Add body content
    if (body) {
      html += `<div style="white-space: pre-wrap; line-height: 1.6; margin-bottom: 20px;">${body.replace(/\n/g, '<br>')}</div>`;
    }
    
    // Add selected articles
    if (selectedArticles.length > 0) {
      html += '<hr style="border: none; border-top: 2px solid #8b5cf6; margin: 30px 0;" />';
      html += '<h2 style="color: #1e293b; font-size: 20px; margin-bottom: 20px;">FEATURED ARTICLES</h2>';
      
      selectedArticles.forEach((articleId) => {
        const article = newsArticles.find(a => a.id === articleId);
        if (article) {
          html += '<div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #8b5cf6;">';
          html += `<h3 style="color: #1e293b; font-size: 18px; margin: 0 0 10px 0;">${article.title || 'Untitled'}</h3>`;
          if (article.summary) {
            html += `<p style="color: #64748b; font-size: 14px; margin: 0 0 15px 0; font-style: italic;">${article.summary}</p>`;
          }
          if (article.content) {
            const trimmedContent = article.content.length > 1000 
              ? article.content.substring(0, 1000) + '...'
              : article.content;
            html += `<div style="color: #334155; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${trimmedContent.replace(/\n/g, '<br>')}</div>`;
          }
          html += '</div>';
        }
      });
    }
    
    html += '</div>';
    return html;
  };

  // Send test email to current user
  const handleSendTestEmail = async () => {
    const finalContent = buildFinalEmailContent();
    
    if (!subject || (!body && selectedArticles.length === 0)) {
      toast.error('Please enter subject and add content or select articles');
      return;
    }

    setSending('test');
    try {
      const user = await base44.auth.me();
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: `[TEST] ${subject}`,
        body: finalContent,
        from_name: 'SaintAgent Newsletter'
      });
      toast.success(`Test email sent to ${user.email}`);
    } catch (error) {
      console.error('Failed to send test email:', error);
      toast.error('Failed to send test email: ' + (error.message || 'Unknown error'));
    } finally {
      setSending(false);
    }
  };

  // Send newsletter to all subscribers
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

    // If scheduling is enabled, save the scheduled newsletter
    if (scheduleEnabled && scheduleDate && scheduleTime) {
      const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
      if (scheduledDateTime <= new Date()) {
        toast.error('Scheduled time must be in the future');
        return;
      }

      setSending('schedule');
      try {
        await base44.entities.NewsletterCampaign.create({
          subject,
          status: 'draft',
          scheduled_send_at: scheduledDateTime.toISOString(),
          body_content: finalContent,
          recipient_count: recipients.length,
          articles_included: selectedArticles
        });
        toast.success(`Newsletter scheduled for ${scheduledDateTime.toLocaleString()}`);
        // Reset form
        setSubject('');
        setBody('');
        setSelectedArticles([]);
        setScheduleEnabled(false);
        setScheduleDate('');
        setScheduleTime('');
      } catch (error) {
        console.error('Failed to schedule newsletter:', error);
        toast.error('Failed to schedule newsletter');
      } finally {
        setSending(false);
      }
      return;
    }

    setSending('all');
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

    // Create campaign record for analytics
    try {
      await base44.entities.NewsletterCampaign.create({
        subject,
        sent_at: new Date().toISOString(),
        total_sent: successCount,
        status: 'sent',
        articles_included: selectedArticles
      });
    } catch (e) {
      console.error('Failed to record campaign:', e);
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
                  <Popover open={aiPopoverOpen} onOpenChange={setAiPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!body && selectedArticles.length === 0}
                        className="gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        AI Format
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-3" align="end">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                          <Sparkles className="w-4 h-4 text-violet-500" />
                          AI Newsletter Formatter
                        </div>

                        {!aiSuggestion ? (
                          <div className="space-y-1">
                            {AI_FORMAT_OPTIONS.map((option) => {
                              const Icon = option.icon;
                              const isLoading = aiLoading === option.id;
                              return (
                                <button
                                  key={option.id}
                                  onClick={() => handleAIFormat(option)}
                                  disabled={!!aiLoading}
                                  className="w-full flex items-center gap-2.5 p-2 rounded-lg text-left text-sm hover:bg-slate-100 disabled:opacity-50 transition-colors"
                                >
                                  {isLoading ? (
                                    <Loader2 className="w-4 h-4 text-violet-500 animate-spin" />
                                  ) : (
                                    <Icon className="w-4 h-4 text-slate-500" />
                                  )}
                                  <span className="text-slate-700">{option.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="text-xs text-slate-500 flex items-center gap-1">
                              <aiSuggestion.option.icon className="w-3 h-3" />
                              {aiSuggestion.option.label}
                            </div>
                            <div className="p-3 rounded-lg bg-violet-50 border border-violet-200 text-sm text-slate-700 max-h-60 overflow-y-auto whitespace-pre-wrap">
                              {aiSuggestion.text}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setAiSuggestion(null)}
                                className="flex-1"
                              >
                                Try Another
                              </Button>
                              <Button
                                size="sm"
                                onClick={applyAISuggestion}
                                className="flex-1 bg-violet-600 hover:bg-violet-700"
                              >
                                <CheckCircle className="w-3.5 h-3.5 mr-1" />
                                Apply
                              </Button>
                            </div>
                          </div>
                        )}

                        <p className="text-[10px] text-slate-400 text-center">
                          AI suggestions may need review before sending
                        </p>
                      </div>
                    </PopoverContent>
                  </Popover>
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

              {/* Schedule Options */}
              <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3 mb-3">
                  <Checkbox
                    id="schedule-toggle"
                    checked={scheduleEnabled}
                    onCheckedChange={setScheduleEnabled}
                  />
                  <Label htmlFor="schedule-toggle" className="flex items-center gap-2 cursor-pointer text-slate-900 dark:text-slate-100">
                    <Clock className="w-4 h-4" />
                    Schedule for later
                  </Label>
                </div>
                
                {scheduleEnabled && (
                  <div className="flex gap-3 mt-3">
                    <div className="flex-1">
                      <Label className="text-xs text-slate-600 dark:text-slate-300">Date</Label>
                      <Input
                        type="date"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs text-slate-600 dark:text-slate-300">Time</Label>
                      <Input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Send Button */}
              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-slate-500">
                  Will send to {displayEmails.length} subscribers • {selectedArticles.length} article(s) embedded
                  {scheduleEnabled && scheduleDate && scheduleTime && (
                    <span className="block text-violet-600 font-medium">
                      Scheduled: {new Date(`${scheduleDate}T${scheduleTime}`).toLocaleString()}
                    </span>
                  )}
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={handleSendTestEmail}
                    disabled={sending || !subject || (!body && selectedArticles.length === 0)}
                    className="gap-2"
                  >
                    {sending === 'test' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4" />
                    )}
                    Send Test to Me
                  </Button>
                  <Button 
                    onClick={handleSendNewsletter}
                    disabled={sending || !subject || (!body && selectedArticles.length === 0) || displayEmails.length === 0 || (scheduleEnabled && (!scheduleDate || !scheduleTime))}
                    className="gap-2 bg-violet-600 hover:bg-violet-700 text-white"
                  >
                    {sending === 'all' || sending === 'schedule' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span className="text-white">{sending === 'schedule' ? 'Scheduling...' : 'Sending...'}</span>
                      </>
                    ) : scheduleEnabled ? (
                      <>
                        <Calendar className="w-4 h-4 text-white" />
                        <span className="text-white">Schedule Send</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-white" />
                        <span className="text-white">Send to All</span>
                      </>
                    )}
                  </Button>
                </div>
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