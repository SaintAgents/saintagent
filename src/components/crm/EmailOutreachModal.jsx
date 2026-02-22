import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Mail, Send, Sparkles, Loader2, CheckCircle, AlertCircle,
  FileText, Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const EMAIL_TEMPLATES = [
  {
    id: 'intro',
    name: 'Introduction',
    subject: 'Introduction from {your_name}',
    body: `Hi {name},

I hope this message finds you well. I wanted to reach out and introduce myself.

{personalized_content}

I'd love to connect and explore potential synergies. Would you be open to a brief call this week?

Best regards,
{your_name}`
  },
  {
    id: 'followup',
    name: 'Follow Up',
    subject: 'Following up - {your_name}',
    body: `Hi {name},

I wanted to follow up on my previous message and see if you had a chance to review it.

{personalized_content}

Looking forward to hearing from you.

Best,
{your_name}`
  },
  {
    id: 'meeting',
    name: 'Meeting Request',
    subject: 'Meeting Request: {topic}',
    body: `Hi {name},

I would like to schedule a meeting to discuss {topic}.

{personalized_content}

Please let me know your availability for a 30-minute call.

Thank you,
{your_name}`
  },
  {
    id: 'value',
    name: 'Value Proposition',
    subject: 'An idea for {company}',
    body: `Hi {name},

I've been following {company}'s work in {domain} and had some thoughts that might be valuable.

{personalized_content}

Would you be interested in exploring this further?

Best regards,
{your_name}`
  }
];

export default function EmailOutreachModal({ open, onClose, contact, currentUser }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [sendStatus, setSendStatus] = useState(null);
  const queryClient = useQueryClient();

  const recipientEmail = contact?.email || (contact?.name?.includes('@') ? contact.name : null);

  const applyTemplate = (template) => {
    setSelectedTemplate(template.id);
    let subj = template.subject
      .replace('{your_name}', currentUser?.full_name || 'Your Name')
      .replace('{company}', contact?.company || 'your company')
      .replace('{topic}', 'collaboration opportunity');
    
    let content = template.body
      .replace('{name}', contact?.name?.split(' ')[0] || 'there')
      .replace('{your_name}', currentUser?.full_name || 'Your Name')
      .replace('{company}', contact?.company || 'your company')
      .replace('{domain}', contact?.domain || 'your industry')
      .replace('{personalized_content}', '');
    
    setSubject(subj);
    setBody(content);
  };

  const generateAIEmail = async () => {
    setIsGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a professional outreach email for the following contact:
Name: ${contact?.name}
Role: ${contact?.role || 'Unknown'}
Company: ${contact?.company || 'Unknown'}
Domain: ${contact?.domain || 'Unknown'}
Lead Source: ${contact?.lead_source || 'Unknown'}
Notes: ${contact?.notes || 'None'}
Last Contact: ${contact?.last_contact_date || 'Never'}

The sender is: ${currentUser?.full_name || 'A professional'}

Generate a personalized, professional email that:
1. Has an appropriate subject line
2. References specific details about the contact
3. Provides clear value proposition
4. Has a specific call to action
5. Is concise (under 150 words for body)

Return in JSON format.`,
        response_json_schema: {
          type: "object",
          properties: {
            subject: { type: "string" },
            body: { type: "string" }
          }
        }
      });

      if (result.subject && result.body) {
        setSubject(result.subject);
        setBody(result.body);
      }
    } catch (err) {
      console.error('AI email generation failed:', err);
    }
    setIsGenerating(false);
  };

  const sendEmailMutation = useMutation({
    mutationFn: async () => {
      // Send the email
      await base44.integrations.Core.SendEmail({
        to: recipientEmail,
        subject: subject,
        body: body
      });
      
      // Update contact with email tracking
      await base44.entities.Contact.update(contact.id, {
        email_outreach_count: (contact.email_outreach_count || 0) + 1,
        last_email_date: new Date().toISOString(),
        last_contact_date: format(new Date(), 'yyyy-MM-dd')
      });
    },
    onSuccess: () => {
      setSendStatus('success');
      queryClient.invalidateQueries({ queryKey: ['myContacts'] });
      setTimeout(() => {
        onClose();
        setSendStatus(null);
        setSubject('');
        setBody('');
        setSelectedTemplate(null);
      }, 2000);
    },
    onError: (err) => {
      console.error('Email send failed:', err);
      setSendStatus('error');
    }
  });

  const handleSend = () => {
    if (!recipientEmail || !subject.trim() || !body.trim()) return;
    sendEmailMutation.mutate();
  };

  const handleClose = () => {
    onClose();
    setSendStatus(null);
    setSubject('');
    setBody('');
    setSelectedTemplate(null);
  };

  if (!contact) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-violet-600" />
            Send Email to {contact.name}
          </DialogTitle>
        </DialogHeader>

        {sendStatus === 'success' ? (
          <div className="py-8 text-center">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Email Sent!</h3>
            <p className="text-slate-500">Your email has been sent to {recipientEmail}</p>
          </div>
        ) : sendStatus === 'error' ? (
          <div className="py-8 text-center">
            <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Send Failed</h3>
            <p className="text-slate-500 mb-4">There was an error sending your email.</p>
            <Button onClick={() => setSendStatus(null)}>Try Again</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Recipient Info */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Avatar className="w-10 h-10">
                <AvatarImage src={contact.avatar_url} />
                <AvatarFallback className="bg-violet-100 text-violet-600">
                  {contact.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium text-slate-900">{contact.name}</p>
                {recipientEmail ? (
                  <p className="text-sm text-slate-500">{recipientEmail}</p>
                ) : (
                  <p className="text-sm text-rose-500">No email address available</p>
                )}
              </div>
              {contact.email_outreach_count > 0 && (
                <Badge variant="outline" className="text-xs">
                  <Mail className="w-3 h-3 mr-1" />
                  {contact.email_outreach_count} sent
                </Badge>
              )}
            </div>

            {!recipientEmail && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg">
                <p className="text-sm text-rose-700">
                  This contact doesn't have an email address. Please add one to send emails.
                </p>
              </div>
            )}

            {recipientEmail && (
              <>
                {/* Templates */}
                <div>
                  <Label className="mb-2 block">Quick Templates</Label>
                  <div className="flex flex-wrap gap-2">
                    {EMAIL_TEMPLATES.map(template => (
                      <Button
                        key={template.id}
                        variant="outline"
                        size="sm"
                        className={cn(
                          "text-xs",
                          selectedTemplate === template.id && "bg-violet-100 border-violet-300"
                        )}
                        onClick={() => applyTemplate(template)}
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        {template.name}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs gap-1"
                      onClick={generateAIEmail}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3 text-amber-500" />
                      )}
                      AI Generate
                    </Button>
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Email subject..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* Body */}
                <div>
                  <Label htmlFor="body">Message</Label>
                  <Textarea
                    id="body"
                    placeholder="Write your email message..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="mt-1 min-h-[200px]"
                  />
                </div>

                {/* Last Contact Info */}
                {contact.last_email_date && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="w-3 h-3" />
                    Last emailed: {format(new Date(contact.last_email_date), 'MMM d, yyyy')}
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSend}
                    disabled={!subject.trim() || !body.trim() || sendEmailMutation.isPending}
                    className="bg-violet-600 hover:bg-violet-700 gap-2"
                  >
                    {sendEmailMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <Send className="w-4 h-4 text-white" />
                    )}
                    <span className="text-white">Send Email</span>
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}