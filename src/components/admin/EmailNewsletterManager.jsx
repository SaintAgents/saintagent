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
import { Mail, Send, Upload, Users, FileText, Trash2, Eye, Loader2, CheckCircle, AlertCircle, Newspaper, BarChart, Sparkles, Plus, X } from 'lucide-react';
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

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
  const [aiLoading, setAiLoading] = useState(false);

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

  // Send newsletter
  const handleSendNewsletter = async () => {
    if (!subject || !body) {
      toast.error('Please enter subject and body');
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
          body: body,
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
              {/* Load from News or Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2">
                    <Newspaper className="w-4 h-4" />
                    Load from News Article
                  </Label>
                  <Select value={selectedNews} onValueChange={handleSelectNews}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a news article..." />
                    </SelectTrigger>
                    <SelectContent>
                      {newsArticles.map((article) => (
                        <SelectItem key={article.id} value={article.id}>
                          {article.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <BarChart className="w-4 h-4" />
                    Load from Analysis/Press
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

              {/* Body */}
              <div>
                <Label>Email Body *</Label>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your newsletter content here..."
                  className="min-h-[300px] font-mono"
                />
              </div>

              {/* Send Button */}
              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-slate-500">
                  Will send to {displayEmails.length} subscribers
                </p>
                <Button 
                  onClick={handleSendNewsletter}
                  disabled={sending || !subject || !body || displayEmails.length === 0}
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
                Email Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!subject && !body ? (
                <p className="text-slate-500 text-center py-8">
                  Compose your newsletter to see a preview.
                </p>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-slate-100 dark:bg-slate-800 p-4 border-b">
                    <p className="text-sm text-slate-500">Subject:</p>
                    <p className="font-semibold">{subject || '(No subject)'}</p>
                  </div>
                  <div className="p-6 bg-white dark:bg-slate-900 min-h-[300px]">
                    <pre className="whitespace-pre-wrap font-sans text-sm">
                      {body || '(No content)'}
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