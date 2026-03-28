import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Plus, X, Send, Loader2, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

const DEFAULT_SUBJECT = "You're invited to join SaintAgent — A platform for conscious creators";

const SUBJECT_SUGGESTIONS = [
  "You're invited to join SaintAgent — A platform for conscious creators",
  "Earn, learn, and collaborate — join me on SaintAgent",
  "I found a platform where your skills can actually earn — check out SaintAgent",
  "Build your conscious business on SaintAgent — here's my invite",
  "Healers, coaches, creators — this platform was built for us",
  "Sell your services, find collaborators, earn tokens — SaintAgent invite",
  "Join a community that pays you to contribute — SaintAgent",
  "Your next client, collaborator, or mentor is on SaintAgent",
];

const DEFAULT_MESSAGE = `Hi there,

I've been building and collaborating on SaintAgent — a platform for conscious creators, healers, entrepreneurs, and visionaries.

Here's what you can do:

💰 EARN — Complete missions, sell services, earn GGG tokens and referral rewards
📚 LEARN — Courses, mentorship, workshops, live broadcasts, and AI insights
💼 SELL — List your skills, manage bookings, sell digital products
🤝 COLLABORATE — AI-matched collaborators, funded projects, shared docs and video calls
🎯 MISSIONS — Real projects with milestones, tasks, and completion rewards
🏆 REPUTATION — Badges, ranks, leaderboards, challenges, and trust scores
🌍 COMMUNITY — Circles, events, messaging, forums, and matching
🔧 BUSINESS TOOLS — CRM, deal tracking, project management, and analytics

I'd love for you to join me — it only takes a few minutes to get started.

Visit us at https://saintagent.world`;

export default function InviteEmailModal({ open, onOpenChange, affiliateUrl, senderName }) {
  const [emails, setEmails] = useState(['']);
  const [subject, setSubject] = useState(DEFAULT_SUBJECT);
  const [personalNote, setPersonalNote] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);

  const generateAINote = async () => {
    setGeneratingAI(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Write a short, warm, personal invitation note (3-5 sentences) from "${senderName || 'a member'}" inviting someone to join SaintAgent. 
SaintAgent is a platform for conscious creators, healers, coaches, entrepreneurs. Features include: earning GGG tokens, selling services on a marketplace, collaborating on missions/projects, mentorship, courses, business tools, CRM, community circles, events, gamification with ranks and badges, AI matching, dating/friendship matching, digital product sales, and more.
Make it feel genuine, enthusiastic but not salesy. Vary the angle — sometimes focus on earning, sometimes collaboration, sometimes community, sometimes business tools. Be creative. Don't use generic phrases. Write ONLY the note, no greeting or sign-off.`,
        response_json_schema: {
          type: "object",
          properties: {
            note: { type: "string" },
            suggested_subject: { type: "string" }
          }
        }
      });
      if (result.note) setPersonalNote(result.note);
      if (result.suggested_subject) setSubject(result.suggested_subject);
    } catch (err) {
      toast.error('Failed to generate suggestion');
    }
    setGeneratingAI(false);
  };

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

    try {
      const sendResult = await base44.functions.invoke('sendInviteEmail', {
        emails: validEmails.map(e => e.trim()),
        subject: subject || DEFAULT_SUBJECT,
        personalNote: personalNote || '',
        senderName: senderName || 'SaintAgent',
        affiliateUrl: affiliateUrl || 'https://saintagent.world'
      });

      setSending(false);

      const data = sendResult.data;
      if (data?.success) {
        setSent(true);
        toast.success(`Invitation${data.sent > 1 ? 's' : ''} sent to ${data.sent} recipient${data.sent > 1 ? 's' : ''}!`);
        setTimeout(() => {
          setSent(false);
          setEmails(['']);
          setPersonalNote('');
          onOpenChange(false);
        }, 2000);
      } else {
        const errorMsg = data?.results?.[0]?.error || data?.error || 'Failed to send';
        toast.error(errorMsg);
      }
    } catch (err) {
      setSending(false);
      toast.error(err?.message || 'Failed to send invitations');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
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
              <div className="flex items-center justify-between mb-2">
                <Label>Subject Line</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSubjectPicker(!showSubjectPicker)}
                  className="text-xs text-violet-600 h-6 px-2"
                >
                  {showSubjectPicker ? 'Hide suggestions' : 'Subject ideas'}
                </Button>
              </div>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
              {showSubjectPicker && (
                <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                  {SUBJECT_SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => { setSubject(s); setShowSubjectPicker(false); }}
                      className="block w-full text-left text-xs p-2 rounded-md hover:bg-violet-50 text-slate-600 hover:text-violet-700 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Personal Note */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Personal Note (optional)</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={generateAINote}
                  disabled={generatingAI}
                  className="text-xs text-violet-600 h-6 px-2 gap-1"
                >
                  {generatingAI ? (
                    <><Loader2 className="w-3 h-3 animate-spin" /> Generating...</>
                  ) : (
                    <><Sparkles className="w-3 h-3" /> AI Suggest</>
                  )}
                </Button>
              </div>
              <Textarea
                value={personalNote}
                onChange={(e) => setPersonalNote(e.target.value)}
                placeholder="Hey! I thought you'd love this community..."
                rows={3}
              />
              <p className="text-xs text-slate-500 mt-1">Added above the standard invite message. Use AI Suggest to generate a unique note each time.</p>
            </div>

            {/* Preview hint */}
            <div className="p-3 rounded-lg bg-violet-50 border border-violet-200">
              <p className="text-xs text-violet-700">
                <strong>What they'll receive:</strong> A platform invitation email with a registration link that includes your affiliate referral. Once they sign up through your link, they'll be tracked as your referral.
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