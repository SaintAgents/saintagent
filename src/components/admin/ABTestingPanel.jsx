import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { 
  FlaskConical, Plus, Trash2, Send, Loader2, Trophy, 
  BarChart2, Mail, MousePointer, Clock, Users, Sparkles
} from 'lucide-react';
import { toast } from "sonner";

export default function ABTestingPanel({ 
  baseSubject, 
  baseBody, 
  buildEmailContent,
  subscribers,
  previewImages,
  selectedArticles 
}) {
  const [abEnabled, setAbEnabled] = useState(false);
  const [testPercentage, setTestPercentage] = useState(20);
  const [winningMetric, setWinningMetric] = useState('open_rate');
  const [testDuration, setTestDuration] = useState(4);
  const [autoSendWinner, setAutoSendWinner] = useState(true);
  const [variations, setVariations] = useState([
    { id: 'A', name: 'Variation A', subject: baseSubject, body: baseBody, useBase: true },
    { id: 'B', name: 'Variation B', subject: '', body: '', useBase: false }
  ]);
  const [sending, setSending] = useState(false);

  const updateVariation = (id, field, value) => {
    setVariations(prev => prev.map(v => 
      v.id === id ? { ...v, [field]: value } : v
    ));
  };

  const addVariation = () => {
    if (variations.length >= 4) {
      toast.error('Maximum 4 variations allowed');
      return;
    }
    const nextId = String.fromCharCode(65 + variations.length); // A, B, C, D
    setVariations([...variations, {
      id: nextId,
      name: `Variation ${nextId}`,
      subject: '',
      body: '',
      useBase: false
    }]);
  };

  const removeVariation = (id) => {
    if (variations.length <= 2) {
      toast.error('Minimum 2 variations required');
      return;
    }
    setVariations(prev => prev.filter(v => v.id !== id));
  };

  const generateAIVariation = async (variationId) => {
    const baseVar = variations.find(v => v.useBase) || variations[0];
    if (!baseVar.subject && !baseSubject) {
      toast.error('Need base content to generate variation');
      return;
    }

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate an alternative email subject line and opening paragraph for A/B testing.
        
Original subject: ${baseVar.subject || baseSubject}
Original opening: ${(baseVar.body || baseBody)?.substring(0, 300)}

Create a variation that:
- Has a different angle or hook
- Maintains the same core message
- Could potentially perform better in email marketing

Return JSON with "subject" and "opening_paragraph" fields.`,
        response_json_schema: {
          type: "object",
          properties: {
            subject: { type: "string" },
            opening_paragraph: { type: "string" }
          }
        }
      });

      if (result.subject) {
        updateVariation(variationId, 'subject', result.subject);
        if (result.opening_paragraph) {
          updateVariation(variationId, 'body', result.opening_paragraph + '\n\n' + (baseVar.body || baseBody || '').split('\n\n').slice(1).join('\n\n'));
        }
        toast.success('AI variation generated');
      }
    } catch (error) {
      console.error('AI generation failed:', error);
      toast.error('Failed to generate variation');
    }
  };

  const handleStartABTest = async () => {
    // Validate
    const validVariations = variations.filter(v => 
      (v.subject || (v.useBase && baseSubject)) && 
      (v.body || (v.useBase && baseBody))
    );

    if (validVariations.length < 2) {
      toast.error('Need at least 2 complete variations');
      return;
    }

    if (subscribers.length < 10) {
      toast.error('Need at least 10 subscribers for A/B testing');
      return;
    }

    setSending(true);

    try {
      // Calculate test group size
      const testGroupSize = Math.floor(subscribers.length * (testPercentage / 100));
      const perVariationSize = Math.floor(testGroupSize / validVariations.length);
      
      // Shuffle subscribers for random assignment
      const shuffled = [...subscribers].sort(() => Math.random() - 0.5);
      
      // Prepare variations with their recipient lists
      const preparedVariations = validVariations.map((v, idx) => {
        const startIdx = idx * perVariationSize;
        const endIdx = startIdx + perVariationSize;
        const recipients = shuffled.slice(startIdx, endIdx);
        
        return {
          ...v,
          subject: v.useBase ? baseSubject : v.subject,
          body_content: buildEmailContent(v.useBase ? baseBody : v.body, previewImages, selectedArticles),
          recipients,
          sent_count: 0,
          opened_count: 0,
          clicked_count: 0
        };
      });

      // Send to each variation group
      for (const variation of preparedVariations) {
        let sentCount = 0;
        const htmlEmail = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;padding:20px;background:#f5f5f5;">${variation.body_content}</body></html>`;
        
        for (const email of variation.recipients) {
          try {
            await base44.integrations.Core.SendEmail({
              to: email,
              subject: variation.subject,
              body: htmlEmail,
              from_name: 'SaintAgent Newsletter'
            });
            sentCount++;
          } catch (error) {
            console.error(`Failed to send to ${email}:`, error);
          }
        }
        variation.sent_count = sentCount;
      }

      // Create campaign record
      await base44.entities.NewsletterCampaign.create({
        subject: `A/B Test: ${validVariations.map(v => v.name).join(' vs ')}`,
        status: 'ab_testing',
        is_ab_test: true,
        ab_test_config: {
          test_percentage: testPercentage,
          winning_metric: winningMetric,
          test_duration_hours: testDuration,
          auto_send_winner: autoSendWinner
        },
        ab_variations: preparedVariations.map(v => ({
          id: v.id,
          name: v.name,
          subject: v.subject,
          body_content: v.body_content,
          sent_count: v.sent_count,
          opened_count: 0,
          clicked_count: 0,
          open_rate: 0,
          click_rate: 0
        })),
        ab_test_started_at: new Date().toISOString(),
        total_sent: preparedVariations.reduce((sum, v) => sum + v.sent_count, 0),
        recipient_count: subscribers.length
      });

      toast.success(`A/B test started! Sent to ${preparedVariations.reduce((sum, v) => sum + v.sent_count, 0)} recipients across ${validVariations.length} variations`);
      setAbEnabled(false);
      
    } catch (error) {
      console.error('A/B test failed:', error);
      toast.error('Failed to start A/B test');
    } finally {
      setSending(false);
    }
  };

  if (!abEnabled) {
    return (
      <div className="border rounded-lg p-4 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FlaskConical className="w-5 h-5 text-violet-600" />
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">A/B Testing</p>
              <p className="text-xs text-slate-500">Test different versions to optimize performance</p>
            </div>
          </div>
          <Button onClick={() => setAbEnabled(true)} variant="outline" className="gap-2">
            <FlaskConical className="w-4 h-4" />
            Enable A/B Test
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="border-violet-200 dark:border-violet-800">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-violet-700 dark:text-violet-400">
            <FlaskConical className="w-5 h-5" />
            A/B Test Configuration
          </span>
          <Button variant="ghost" size="sm" onClick={() => setAbEnabled(false)}>
            Cancel
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Test Settings */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
          <div>
            <Label className="text-xs flex items-center gap-1 mb-2">
              <Users className="w-3 h-3" />
              Test Audience: {testPercentage}%
            </Label>
            <Slider
              value={[testPercentage]}
              onValueChange={([val]) => setTestPercentage(val)}
              min={10}
              max={50}
              step={5}
            />
            <p className="text-xs text-slate-500 mt-1">
              {Math.floor(subscribers.length * (testPercentage / 100))} of {subscribers.length} subscribers
            </p>
          </div>

          <div>
            <Label className="text-xs flex items-center gap-1 mb-2">
              <Trophy className="w-3 h-3" />
              Winning Metric
            </Label>
            <Select value={winningMetric} onValueChange={setWinningMetric}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open_rate">
                  <span className="flex items-center gap-2">
                    <Mail className="w-3 h-3" /> Open Rate
                  </span>
                </SelectItem>
                <SelectItem value="click_rate">
                  <span className="flex items-center gap-2">
                    <MousePointer className="w-3 h-3" /> Click Rate
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs flex items-center gap-1 mb-2">
              <Clock className="w-3 h-3" />
              Test Duration
            </Label>
            <Select value={testDuration.toString()} onValueChange={(v) => setTestDuration(parseInt(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 hours</SelectItem>
                <SelectItem value="4">4 hours</SelectItem>
                <SelectItem value="8">8 hours</SelectItem>
                <SelectItem value="24">24 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={autoSendWinner} onCheckedChange={setAutoSendWinner} />
            <Label className="text-xs">Auto-send winner to remaining {100 - testPercentage}%</Label>
          </div>
        </div>

        {/* Variations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Email Variations</Label>
            <Button variant="outline" size="sm" onClick={addVariation} disabled={variations.length >= 4} className="gap-1">
              <Plus className="w-3 h-3" /> Add Variation
            </Button>
          </div>

          {variations.map((variation, idx) => (
            <div key={variation.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={idx === 0 ? "default" : "outline"} className="text-xs">
                    {variation.name}
                  </Badge>
                  {variation.useBase && (
                    <Badge variant="secondary" className="text-xs">Base</Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => generateAIVariation(variation.id)}
                    className="gap-1 text-xs"
                  >
                    <Sparkles className="w-3 h-3" /> AI Generate
                  </Button>
                  {variations.length > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeVariation(variation.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-xs">Subject Line</Label>
                <Input
                  value={variation.useBase ? baseSubject : variation.subject}
                  onChange={(e) => {
                    updateVariation(variation.id, 'subject', e.target.value);
                    updateVariation(variation.id, 'useBase', false);
                  }}
                  placeholder="Enter subject line..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Body Content</Label>
                <Textarea
                  value={variation.useBase ? baseBody : variation.body}
                  onChange={(e) => {
                    updateVariation(variation.id, 'body', e.target.value);
                    updateVariation(variation.id, 'useBase', false);
                  }}
                  placeholder="Enter email content..."
                  className="mt-1 min-h-[100px] font-mono text-sm"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Start Test Button */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-slate-500">
            <p>Will test {variations.length} variations</p>
            <p className="text-xs">Each receives ~{Math.floor(subscribers.length * (testPercentage / 100) / variations.length)} emails</p>
          </div>
          <Button
            onClick={handleStartABTest}
            disabled={sending || subscribers.length < 10}
            className="gap-2 bg-violet-600 hover:bg-violet-700"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Starting Test...
              </>
            ) : (
              <>
                <FlaskConical className="w-4 h-4" />
                Start A/B Test
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}