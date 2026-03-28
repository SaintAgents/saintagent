import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Plus, X, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_SUBJECT = "You're invited to join SaintAgent — A platform for conscious creators";

const DEFAULT_MESSAGE = `Hi there,

I've been building and collaborating on SaintAgent — a platform designed for conscious creators, healers, entrepreneurs, and visionaries who want to connect, grow, and create meaningful impact together.

Here's what makes SaintAgent unique:

🌟 Purpose-Driven Community — Connect with like-minded people aligned with service, healing, and conscious business.

🎯 Missions & Projects — Collaborate on real missions, earn GGG tokens, and build your reputation.

💼 Marketplace — Offer your skills, book sessions, and find collaborators for your projects.

🏆 Gamification & Growth — Earn badges, climb ranks, and unlock new opportunities as you contribute.

🤝 Matching & Mentorship — Get matched with collaborators, mentors, and opportunities aligned with your goals.

I'd love for you to join me. Use my personal invite link below to sign up — it only takes a few minutes to get started.`;

export default function InviteEmailModal({ open, onOpenChange, affiliateUrl, senderName }) {
  const [emails, setEmails] = useState(['']);
  const [subject, setSubject] = useState(DEFAULT_SUBJECT);
  const [personalNote, setPersonalNote] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const addEmail = () => {
    if (emails.length < 10) setEmails([...emails, '']);
  };

  const removeEmail = (idx) => {
    if (emails.length > 1) setEmails(emails.filter((_, i) => i !== idx));
  };

  const updateEmail = (idx, val) => {
    const updated = [...emails];
    updated[idx] = val;
    setEmails(updated);
  };

  const validEmails = emails.filter(e => e.trim() && e.includes('@'));

  const handleSend = async () => {
    if (validEmails.length === 0) {
      toast.error('Please enter at least one valid email address');
      return;
    }

    setSending(true);

    const fullBody = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h1 style="color: #6d28d9; font-size: 28px; margin: 0;">SaintAgent</h1>
    <p style="color: #64748b; font-size: 14px; margin-top: 4px;">A Platform for Conscious Creators</p>
  </div>
  
  <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
    <p style="color: #334155; font-size: 15px; line-height: 1.7; white-space: pre-line; margin: 0;">${personalNote ? personalNote + '\n\n---\n\n' : ''}${DEFAULT_MESSAGE}</p>
  </div>

  <div style="text-align: center; margin: 28px 0;">
    <a href="${affiliateUrl}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #6d28d9); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
      Join SaintAgent Now →
    </a>
  </div>

  <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center;">
    <p style="color: #94a3b8; font-size: 12px; margin: 0;">
      Invited by ${senderName || 'a SaintAgent member'}
    </p>
  </div>
</div>`;

    let successCount = 0;
    for (const email of validEmails) {
      try {
        await base44.integrations.Core.SendEmail({
          to: email.trim(),
          subject,
          body: fullBody,
          from_name: senderName || 'SaintAgent'
        });
        successCount++;
      } catch (err) {
        console.error(`Failed to send to ${email}:`, err);
      }
    }

    setSending(false);

    if (successCount > 0) {
      setSent(true);
      toast.success(`Invitation${successCount > 1 ? 's' : ''} sent to ${successCount} recipient${successCount > 1 ? 's' : ''}!`);
      setTimeout(() => {
        setSent(false);
        setEmails(['']);
        setPersonalNote('');
        onOpenChange(false);
      }, 2000);
    } else {
      toast.error('Failed to send invitations. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-violet-600" />
            Send Invite Email
          </DialogTitle>
        </DialogHeader>

        {sent ? (
          <div className="py-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-emerald-700">Invitations Sent!</h3>
            <p className="text-sm text-slate-500 mt-1">Your invite link is included in each email.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Recipients */}
            <div>
              <Label className="mb-2 block">Recipients (up to 10)</Label>
              <div className="space-y-2">
                {emails.map((email, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => updateEmail(idx, e.target.value)}
                      placeholder="friend@email.com"
                    />
                    {emails.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeEmail(idx)}>
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {emails.length < 10 && (
                <Button variant="ghost" size="sm" onClick={addEmail} className="mt-2 text-violet-600 gap-1">
                  <Plus className="w-3 h-3" /> Add another
                </Button>
              )}
            </div>

            {/* Subject */}
            <div>
              <Label className="mb-2 block">Subject Line</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>

            {/* Personal Note */}
            <div>
              <Label className="mb-2 block">Personal Note (optional)</Label>
              <Textarea
                value={personalNote}
                onChange={(e) => setPersonalNote(e.target.value)}
                placeholder="Hey! I thought you'd love this community..."
                rows={3}
              />
              <p className="text-xs text-slate-500 mt-1">Added above the standard invite message</p>
            </div>

            {/* Preview hint */}
            <div className="p-3 rounded-lg bg-violet-50 border border-violet-200">
              <p className="text-xs text-violet-700">
                <strong>What they'll receive:</strong> A beautifully formatted email explaining SaintAgent's features, your personal note (if added), and a button linking to your affiliate signup page.
              </p>
            </div>

            {/* Send */}
            <Button
              onClick={handleSend}
              disabled={sending || validEmails.length === 0}
              className="w-full bg-violet-600 hover:bg-violet-700 gap-2"
            >
              {sending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
              ) : (
                <><Send className="w-4 h-4" /> Send {validEmails.length > 0 ? `to ${validEmails.length} recipient${validEmails.length > 1 ? 's' : ''}` : 'Invite'}</>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}